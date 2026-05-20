import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Linking, Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useAlert } from '@/template';

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { phone, mode, name } = useLocalSearchParams<{ phone: string; mode: string; name?: string }>();
  const { language, setUser } = useApp();
  const { showAlert } = useAlert();

  const [code, setCode] = useState('');
  const [generatedCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const isRTL = language === 'ar';

  useEffect(() => {
    sendCodeToWhatsApp();
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const sendCodeToWhatsApp = () => {
    const adminPhone = '967782282586';
    const message = `🔐 كود التحقق DAVA\n\nرقم: ${phone}\nالكود: *${generatedCode}*\n\nصالح لمدة 10 دقائق`;
    const whatsappUrl = `https://wa.me/${phone.replace('+', '')}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp to send the code
    Linking.canOpenURL(whatsappUrl).then(supported => {
      if (supported) {
        Linking.openURL(whatsappUrl);
      }
    });
    setCodeSent(true);
  };

  const handleResend = () => {
    // If code not received, notify admin
    const adminPhone = '967782282586';
    const message = `⚠️ طلب كود يدوي\n\nالمستخدم: ${phone}\nطلب إعادة إرسال الكود\n\nالكود الجديد: *${generatedCode}*`;
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`;
    Linking.openURL(whatsappUrl);
    setCountdown(60);
    setCanResend(false);
    showAlert(
      language === 'ar' ? 'تم الإرسال' : 'Sent',
      language === 'ar' ? 'تم إرسال طلبك للمدير وسيتم المصادقة تلقائياً' : 'Your request was sent to admin and will be auto-approved'
    );
  };

  const handleVerify = () => {
    if (code === generatedCode) {
      // Create/login user
      const userId = `user_${Date.now()}`;
      setUser({
        id: userId,
        phone: phone,
        name: name || phone,
        isAdmin: false,
        isSuperAdmin: false,
        permissions: [],
        createdAt: new Date().toISOString(),
      });
      router.replace('/(tabs)');
    } else {
      showAlert(
        language === 'ar' ? 'كود خاطئ' : 'Wrong Code',
        language === 'ar' ? 'الكود المدخل غير صحيح، يرجى المحاولة مجدداً' : 'The code you entered is incorrect'
      );
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.iconContainer}>
        <LinearGradient colors={['#1A1A1A', '#0A0A0A']} style={styles.iconBox}>
          <Text style={styles.whatsappIcon}>💬</Text>
        </LinearGradient>
      </View>

      <Text style={styles.title}>
        {language === 'ar' ? 'التحقق من الهاتف' : 'Phone Verification'}
      </Text>
      <Text style={styles.subtitle}>
        {language === 'ar' 
          ? `تم فتح واتساب لإرسال كود التحقق إلى ${phone}`
          : `WhatsApp opened to send verification code to ${phone}`}
      </Text>

      <View style={styles.codeContainer}>
        <TextInput
          style={[styles.codeInput, isRTL && { textAlign: 'center' }]}
          value={code}
          onChangeText={setCode}
          placeholder="000000"
          placeholderTextColor={Colors.textMuted}
          keyboardType="numeric"
          maxLength={6}
          textAlign="center"
        />
      </View>

      <TouchableOpacity style={styles.verifyBtn} onPress={handleVerify}>
        <LinearGradient colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]} style={styles.btnGradient}>
          <MaterialIcons name="verified" size={20} color="#000" />
          <Text style={styles.verifyBtnText}>
            {language === 'ar' ? 'تحقق وادخل' : 'Verify & Enter'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        {canResend ? (
          <TouchableOpacity onPress={handleResend} style={styles.resendBtn}>
            <MaterialIcons name="refresh" size={16} color={Colors.primary} />
            <Text style={styles.resendText}>
              {language === 'ar' ? 'لم يصلني الكود' : "Didn't receive the code"}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.countdownText}>
            {language === 'ar' 
              ? `إعادة الإرسال بعد ${countdown} ثانية`
              : `Resend in ${countdown}s`}
          </Text>
        )}
      </View>

      {/* Dev hint - show code for testing */}
      <View style={styles.devHint}>
        <Text style={styles.devHintText}>
          {language === 'ar' ? '🔑 الكود:' : '🔑 Code:'} {generatedCode}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.lg, alignItems: 'center' },
  backBtn: { alignSelf: 'flex-start', marginBottom: Spacing.xl },
  iconContainer: { marginBottom: Spacing.lg },
  iconBox: {
    width: 80, height: 80, borderRadius: Radius.xl,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.borderGold,
  },
  whatsappIcon: { fontSize: 36 },
  title: {
    fontSize: FontSize.xxl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, marginBottom: Spacing.sm, textAlign: 'center',
  },
  subtitle: {
    fontSize: FontSize.sm, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  codeContainer: { width: '100%', marginBottom: Spacing.xl },
  codeInput: {
    borderWidth: 2, borderColor: Colors.borderGold, borderRadius: Radius.md,
    backgroundColor: Colors.bgInput, paddingVertical: 18,
    fontSize: FontSize.xxxl, fontWeight: FontWeight.bold,
    color: Colors.primary, letterSpacing: 16,
  },
  verifyBtn: { width: '100%', borderRadius: Radius.md, overflow: 'hidden' },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  verifyBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#000' },
  resendContainer: { marginTop: Spacing.lg, alignItems: 'center' },
  resendBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resendText: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },
  countdownText: { fontSize: FontSize.sm, color: Colors.textMuted },
  devHint: {
    marginTop: Spacing.xl, padding: Spacing.md,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.borderGold,
  },
  devHintText: { fontSize: FontSize.sm, color: Colors.primary, textAlign: 'center' },
});
