import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Animated,
} from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useAlert, useAuth } from '@/template';
import { customersService } from '@/services/database';

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ email: string; name: string; mode: string }>();
  const { setUser, language } = useApp();
  const { showAlert } = useAlert();
  const { verifyOTPAndLogin, sendOTP } = useAuth();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(600);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isRTL = language === 'ar';
  const email = params.email || '';
  const name = params.name || '';
  const mode = params.mode || 'login';

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startTimer = () => {
    setTimer(600);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) { if (timerRef.current) clearInterval(timerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleVerify = async () => {
    if (otp.length < 6) {
      showAlert(isRTL ? 'أدخل الكود كاملاً' : 'Enter full code', '');
      return;
    }
    setLoading(true);
    try {
      // Use Supabase built-in OTP verification
      const { error, user: authUser } = await verifyOTPAndLogin(email, otp);
      if (error) {
        showAlert(
          isRTL ? 'كود خاطئ' : 'Wrong Code',
          isRTL ? 'الكود غير صحيح أو منتهي الصلاحية. تحقق من بريدك وأعد المحاولة.' : 'Invalid or expired code. Check your email and try again.'
        );
        return;
      }

      // Create or fetch customer profile
      let customer = await customersService.getByEmail(email);
      if (!customer && mode === 'register') {
        customer = await customersService.createByEmail({ name: name || email.split('@')[0], email });
      }
      if (!customer) {
        // Auto-create on login if doesn't exist
        customer = await customersService.createByEmail({ name: email.split('@')[0], email });
      }

      setUser({
        id: customer.id,
        email: customer.email || email,
        phone: customer.phone || '',
        name: customer.name,
        isAdmin: false,
        isSuperAdmin: false,
        permissions: [],
        createdAt: customer.created_at,
      });
      router.replace('/(tabs)');
    } catch (e: any) {
      showAlert(isRTL ? 'خطأ' : 'Error', isRTL ? 'فشل التحقق' : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 540) return;
    setLoading(true);
    try {
      const { error } = await sendOTP(email);
      if (error) {
        showAlert(isRTL ? 'خطأ' : 'Error', error);
        return;
      }
      showAlert(
        isRTL ? 'تم الإرسال' : 'Sent',
        isRTL ? 'تم إرسال كود جديد إلى بريدك الإلكتروني' : 'A new code has been sent to your email'
      );
      startTimer();
    } catch {
      showAlert(isRTL ? 'خطأ' : 'Error', '');
    } finally {
      setLoading(false);
    }
  };

  const masked = email.replace(/(.{2}).+(@.+)/, '$1***$2');

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#060F0A', '#0D1E16', '#152A1E']} style={{ flex: 1 }}>
        <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>

          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            <View style={styles.iconWrap}>
              <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.iconGrad}>
                <MaterialIcons name="mark-email-read" size={36} color="#0D1E16" />
              </LinearGradient>
              <View style={styles.iconGlow} />
            </View>

            <Text style={styles.title}>{isRTL ? 'تحقق من بريدك' : 'Check Your Email'}</Text>
            <Text style={styles.sub}>
              {isRTL
                ? `أرسلنا كود التحقق المكون من 6 أرقام إلى\n${masked}`
                : `We sent a 6-digit verification code to\n${masked}`}
            </Text>

            <View style={styles.noteBox}>
              <MaterialIcons name="info" size={16} color={Colors.primary} />
              <Text style={[styles.noteText, isRTL && styles.rtl]}>
                {isRTL
                  ? 'الكود مرسل من Supabase — تحقق من صندوق الوارد أو مجلد البريد المزعج'
                  : 'Code sent via Supabase — check your inbox or spam folder'}
              </Text>
            </View>

            <OtpInput
              numberOfDigits={6}
              onTextChange={setOtp}
              focusColor={Colors.primary}
              theme={{
                containerStyle: { width: '100%' },
                inputsContainerStyle: { justifyContent: 'space-between', gap: 6 },
                pinCodeContainerStyle: {
                  width: 46, height: 54, borderRadius: Radius.md,
                  borderWidth: 2, borderColor: Colors.border,
                  backgroundColor: Colors.bgCard,
                },
                pinCodeTextStyle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.primary },
                focusedPinCodeContainerStyle: { borderColor: Colors.primary, backgroundColor: Colors.bgSurface },
              }}
            />

            <View style={styles.timerRow}>
              <MaterialIcons name="timer" size={15} color={timer > 0 ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.timerText, { color: timer > 0 ? Colors.primary : Colors.textMuted }]}>
                {timer > 0
                  ? (isRTL ? `ينتهي خلال ${fmt(timer)}` : `Expires in ${fmt(timer)}`)
                  : (isRTL ? 'انتهت صلاحية الكود' : 'Code expired')}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.verifyBtn}
              onPress={handleVerify}
              disabled={loading || otp.length < 6}
            >
              <LinearGradient
                colors={otp.length < 6
                  ? ['#1C3527', '#1C3527']
                  : [Colors.primaryLight, Colors.primary, Colors.primaryDark]}
                style={styles.verifyGrad}
              >
                {loading ? <ActivityIndicator color="#0D1E16" /> : (
                  <>
                    <MaterialIcons
                      name="check-circle"
                      size={18}
                      color={otp.length < 6 ? Colors.textMuted : '#0D1E16'}
                    />
                    <Text style={[styles.verifyText, { color: otp.length < 6 ? Colors.textMuted : '#0D1E16' }]}>
                      {isRTL ? 'تحقق وادخل' : 'Verify & Enter'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.resendRow}>
              <Text style={styles.resendLabel}>{isRTL ? 'لم يصلك الكود؟' : "Didn't receive it?"}</Text>
              <TouchableOpacity onPress={handleResend} disabled={timer > 540 || loading}>
                <Text style={[styles.resendBtn, (timer > 540 || loading) && { color: Colors.textMuted }]}>
                  {isRTL ? 'إعادة الإرسال' : 'Resend'}
                  {timer > 0 && timer <= 540 ? '' : timer > 540 ? ` (${fmt(timer - 540)})` : ''}
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: Spacing.lg },
  backBtn: {
    width: 42, height: 42, borderRadius: Radius.full, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xl,
  },
  content: { flex: 1, alignItems: 'center', gap: Spacing.lg },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  iconGrad: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center' },
  iconGlow: { position: 'absolute', width: 110, height: 110, borderRadius: 55, backgroundColor: Colors.primary + '18' },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, textAlign: 'center' },
  sub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  rtl: { textAlign: 'right' },
  noteBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 7,
    backgroundColor: Colors.primary + '12', borderRadius: Radius.md,
    padding: Spacing.sm, borderWidth: 1, borderColor: Colors.borderGold, width: '100%',
  },
  noteText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  timerRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timerText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  verifyBtn: { width: '100%', borderRadius: Radius.md, overflow: 'hidden' },
  verifyGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, gap: 8 },
  verifyText: { fontSize: FontSize.base, fontWeight: FontWeight.bold },
  resendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resendLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  resendBtn: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
});
