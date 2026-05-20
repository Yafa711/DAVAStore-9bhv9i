import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  Animated, Linking,
} from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useAlert } from '@/template';
import { otpService, customersService } from '@/services/database';

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ phone: string; name: string; mode: string }>();
  const { setUser, language } = useApp();
  const { showAlert } = useAlert();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(600); // 10 minutes
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const isRTL = language === 'ar';
  const phone = params.phone || '';
  const name = params.name || '';
  const mode = params.mode || 'login';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true }),
    ]).start();
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startTimer = () => {
    setTimer(600);
    timerRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const formatTimer = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const handleVerify = async () => {
    if (otp.length < 6) {
      showAlert(isRTL ? 'أدخل الكود كاملاً' : 'Enter Full Code', '');
      return;
    }
    setLoading(true);
    try {
      const valid = await otpService.verify(phone, otp);
      if (!valid) {
        showAlert(
          isRTL ? 'كود خاطئ' : 'Wrong Code',
          isRTL ? 'الكود غير صحيح أو منتهي الصلاحية' : 'Invalid or expired code'
        );
        return;
      }

      let customer = await customersService.getByPhone(phone);
      if (!customer && mode === 'register') {
        customer = await customersService.create({ name, phone });
      }

      if (!customer) {
        showAlert(isRTL ? 'خطأ' : 'Error', isRTL ? 'لم يتم العثور على الحساب' : 'Account not found');
        return;
      }

      setUser({
        id: customer.id,
        phone: customer.phone,
        name: customer.name,
        isAdmin: false,
        isSuperAdmin: false,
        permissions: [],
        createdAt: customer.created_at,
      });

      router.replace('/(tabs)');
    } catch (e) {
      showAlert(isRTL ? 'خطأ' : 'Error', isRTL ? 'فشل التحقق' : 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    try {
      const newOtp = otpService.generateOTP();
      await otpService.store(phone, newOtp);

      const adminPhone = '967782282586';
      const msg = `🔐 إعادة إرسال كود DAVA\n\nالرقم: ${phone}\nالكود الجديد: ${newOtp}\n\n⚡ أرسل هذا الكود إلى: ${phone}\nصلاحيته 10 دقائق`;
      await Linking.openURL(`https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`);

      startTimer();
      showAlert(
        isRTL ? 'تم الإرسال' : 'Sent',
        isRTL ? 'تم فتح واتساب لإرسال الكود الجديد' : 'WhatsApp opened to send new code'
      );
    } catch {
      showAlert(isRTL ? 'خطأ' : 'Error', '');
    } finally {
      setLoading(false);
    }
  };

  const maskedPhone = phone.replace(/(\+967)(\d{3})(\d{3})(\d{3})/, '$1 $2 ***$4');

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={['#050505', '#0A0A0A', '#111']} style={{ flex: 1 }}>
        <View style={[styles.container, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>

          <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.iconGradient}>
                <MaterialIcons name="verified-user" size={40} color="#000" />
              </LinearGradient>
              <View style={styles.iconGlow} />
            </View>

            <Text style={styles.title}>
              {isRTL ? 'أدخل كود التحقق' : 'Enter Verification Code'}
            </Text>
            <Text style={styles.subtitle}>
              {isRTL
                ? `تم إرسال الكود عبر واتساب إلى\n${maskedPhone}`
                : `Code sent via WhatsApp to\n${maskedPhone}`}
            </Text>

            {/* WhatsApp instruction */}
            <View style={styles.waBox}>
              <MaterialIcons name="info" size={18} color={Colors.primary} />
              <Text style={[styles.waText, isRTL && styles.rtlText]}>
                {isRTL
                  ? 'تحقق من رسائل واتساب الخاصة بك للحصول على الكود المكون من 6 أرقام'
                  : 'Check your WhatsApp messages for the 6-digit code'}
              </Text>
            </View>

            {/* OTP Input */}
            <View style={styles.otpContainer}>
              <OtpInput
                numberOfDigits={6}
                onTextChange={setOtp}
                focusColor={Colors.primary}
                theme={{
                  containerStyle: styles.otpInputContainer,
                  inputsContainerStyle: styles.otpInputs,
                  pinCodeContainerStyle: styles.pinContainer,
                  pinCodeTextStyle: styles.pinText,
                  focusedPinCodeContainerStyle: styles.focusedPin,
                }}
              />
            </View>

            {/* Timer */}
            <View style={styles.timerRow}>
              <MaterialIcons name="timer" size={16} color={timer > 0 ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.timerText, { color: timer > 0 ? Colors.primary : Colors.textMuted }]}>
                {timer > 0
                  ? (isRTL ? `ينتهي الكود خلال ${formatTimer(timer)}` : `Code expires in ${formatTimer(timer)}`)
                  : (isRTL ? 'انتهت صلاحية الكود' : 'Code expired')}
              </Text>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={styles.verifyBtn}
              onPress={handleVerify}
              disabled={loading || otp.length < 6}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={otp.length < 6 ? ['#333', '#222'] : [Colors.primaryLight, Colors.primary, Colors.primaryDark]}
                style={styles.verifyGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <>
                    <MaterialIcons name="check-circle" size={20} color="#000" />
                    <Text style={styles.verifyText}>{isRTL ? 'تحقق وادخل' : 'Verify & Enter'}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Resend */}
            <View style={styles.resendRow}>
              <Text style={styles.resendLabel}>
                {isRTL ? 'لم يصلك الكود؟' : "Didn't receive the code?"}
              </Text>
              <TouchableOpacity
                onPress={handleResend}
                disabled={timer > 540 || loading}
              >
                <Text style={[styles.resendBtn, (timer > 540 || loading) && styles.resendDisabled]}>
                  {isRTL ? 'إعادة الإرسال' : 'Resend Code'}
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
    width: 44, height: 44, justifyContent: 'center', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.xl,
  },
  content: { flex: 1, alignItems: 'center', gap: Spacing.lg },
  iconContainer: { alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  iconGradient: {
    width: 96, height: 96, borderRadius: 48,
    justifyContent: 'center', alignItems: 'center',
  },
  iconGlow: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: Colors.primary + '22',
  },
  title: {
    fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary, textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.base, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 24,
  },
  waBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.primary + '11', borderRadius: Radius.md,
    padding: Spacing.sm, borderWidth: 1, borderColor: Colors.borderGold,
    width: '100%',
  },
  waText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  rtlText: { textAlign: 'right' },
  otpContainer: { width: '100%', marginVertical: Spacing.sm },
  otpInputContainer: { width: '100%' },
  otpInputs: { justifyContent: 'space-between', gap: 8 },
  pinContainer: {
    width: 48, height: 56, borderRadius: Radius.md,
    borderWidth: 2, borderColor: Colors.border,
    backgroundColor: Colors.bgCard,
    justifyContent: 'center', alignItems: 'center',
  },
  pinText: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.primary },
  focusedPin: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  timerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  timerText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  verifyBtn: { width: '100%', borderRadius: Radius.md, overflow: 'hidden' },
  verifyGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 8,
  },
  verifyText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#000' },
  resendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resendLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  resendBtn: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.semibold },
  resendDisabled: { color: Colors.textMuted },
});
