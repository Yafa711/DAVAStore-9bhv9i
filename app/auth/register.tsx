import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useAlert } from '@/template';
import { t } from '@/constants/i18n';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { showAlert } = useAlert();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleRegister = () => {
    if (!name.trim()) {
      showAlert(
        language === 'ar' ? 'الاسم مطلوب' : 'Name Required',
        language === 'ar' ? 'يرجى إدخال اسمك الكامل' : 'Please enter your full name'
      );
      return;
    }
    const cleaned = phone.replace(/\s/g, '');
    if (!cleaned || cleaned.length < 9 || !cleaned.startsWith('7')) {
      showAlert(
        language === 'ar' ? 'رقم غير صحيح' : 'Invalid Number',
        language === 'ar' ? 'يجب أن يبدأ الرقم بـ 7 ويكون 9 أرقام' : 'Number must start with 7 and be 9 digits'
      );
      return;
    }
    router.push({
      pathname: '/auth/verify',
      params: { phone: `+967${cleaned}`, mode: 'register', name: name.trim() }
    });
  };

  const isRTL = language === 'ar';

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>DAVA</Text>
          <Text style={styles.subtitle}>
            {language === 'ar' ? 'إنشاء حساب جديد' : 'Create New Account'}
          </Text>
        </View>

        <View style={styles.goldDivider} />

        <View style={styles.form}>
          <Text style={[styles.label, isRTL && styles.rtlText]}>{t('name', language)}</Text>
          <TextInput
            style={[styles.input, isRTL && styles.rtlInput]}
            value={name}
            onChangeText={setName}
            placeholder={t('namePlaceholder', language)}
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={[styles.label, isRTL && styles.rtlText, { marginTop: Spacing.lg }]}>
            {t('phone', language)}
          </Text>
          <View style={styles.phoneInputContainer}>
            <View style={styles.countryCode}>
              <Text style={styles.countryCodeText}>🇾🇪 +967</Text>
            </View>
            <TextInput
              style={[styles.phoneInput, isRTL && { textAlign: 'right' }]}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('phonePlaceholder', language)}
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              maxLength={9}
            />
          </View>
          <Text style={styles.phoneHint}>
            {language === 'ar' 
              ? 'سيتم إرسال كود التحقق إلى واتساب رقمك' 
              : 'A verification code will be sent to your WhatsApp'}
          </Text>

          <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister}>
            <LinearGradient colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]} style={styles.btnGradient}>
              <MaterialIcons name="person-add" size={18} color="#000" />
              <Text style={styles.primaryBtnText}>
                {language === 'ar' ? 'إنشاء الحساب' : 'Create Account'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
            <Text style={styles.loginLinkText}>
              {t('haveAccount', language)} {' '}
              <Text style={styles.goldText}>{t('login', language)}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.lg },
  backBtn: { marginBottom: Spacing.xl },
  header: { alignItems: 'center', marginBottom: Spacing.lg },
  title: {
    fontSize: FontSize.display, fontWeight: FontWeight.extrabold,
    color: Colors.primary, letterSpacing: 6,
  },
  subtitle: { fontSize: FontSize.lg, color: Colors.textSecondary, marginTop: 8 },
  goldDivider: {
    height: 1, backgroundColor: Colors.borderGold,
    marginBottom: Spacing.xl,
  },
  form: {},
  label: { fontSize: FontSize.base, color: Colors.textSecondary, marginBottom: Spacing.sm },
  rtlText: { textAlign: 'right' },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    backgroundColor: Colors.bgInput, paddingHorizontal: Spacing.md, paddingVertical: 14,
    fontSize: FontSize.md, color: Colors.textPrimary,
  },
  rtlInput: { textAlign: 'right' },
  phoneInputContainer: {
    flexDirection: 'row', borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, backgroundColor: Colors.bgInput, overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: Spacing.md, justifyContent: 'center',
    backgroundColor: Colors.bgCard, borderRightWidth: 1, borderRightColor: Colors.border,
  },
  countryCodeText: { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  phoneInput: {
    flex: 1, paddingHorizontal: Spacing.md, paddingVertical: 14,
    fontSize: FontSize.md, color: Colors.textPrimary,
  },
  phoneHint: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 6, textAlign: 'right' },
  primaryBtn: { marginTop: Spacing.xl, borderRadius: Radius.md, overflow: 'hidden' },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  primaryBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#000' },
  loginLink: { alignItems: 'center', marginTop: Spacing.lg },
  loginLinkText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  goldText: { color: Colors.primary, fontWeight: FontWeight.semibold },
});
