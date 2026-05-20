import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { useAlert } from '@/template';
import { t } from '@/constants/i18n';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, setUser } = useApp();
  const { adminUsers } = useData();
  const { showAlert } = useAlert();

  const [tab, setTab] = useState<'phone' | 'admin'>('phone');
  const [phone, setPhone] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePhoneLogin = () => {
    const cleaned = phone.replace(/\s/g, '');
    if (!cleaned || cleaned.length < 9 || !cleaned.startsWith('7')) {
      showAlert(
        language === 'ar' ? 'رقم غير صحيح' : 'Invalid Number',
        language === 'ar' ? 'يجب أن يبدأ الرقم بـ 7 ويكون 9 أرقام' : 'Number must start with 7 and be 9 digits'
      );
      return;
    }
    router.push({ pathname: '/auth/verify', params: { phone: `+967${cleaned}`, mode: 'login' } });
  };

  const handleAdminLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const admin = adminUsers.find(a => 
        a.username === adminUsername && a.password === adminPassword && a.isActive
      );
      if (admin) {
        setUser({
          id: admin.id,
          phone: admin.phone,
          name: admin.name,
          isAdmin: true,
          isSuperAdmin: admin.isSuperAdmin,
          permissions: admin.permissions,
          createdAt: admin.createdAt,
        });
        router.replace('/(tabs)');
      } else {
        showAlert(
          language === 'ar' ? 'خطأ في البيانات' : 'Invalid Credentials',
          language === 'ar' ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Username or password is incorrect'
        );
      }
    }, 800);
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
        {/* Logo */}
        <View style={styles.logoContainer}>
          <LinearGradient colors={['#1A1A1A', '#0A0A0A']} style={styles.logoBox}>
            <Image source={require('@/assets/images/dava-logo.png')} style={styles.logo} resizeMode="contain" />
          </LinearGradient>
          <Text style={styles.appName}>DAVA</Text>
          <Text style={styles.tagline}>{language === 'ar' ? 'أزياء وأناقة فاخرة' : 'Luxury Fashion & Style'}</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, tab === 'phone' && styles.activeTab]}
            onPress={() => setTab('phone')}
          >
            <Text style={[styles.tabText, tab === 'phone' && styles.activeTabText]}>
              {language === 'ar' ? 'تسجيل بالهاتف' : 'Phone Login'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'admin' && styles.activeTab]}
            onPress={() => setTab('admin')}
          >
            <Text style={[styles.tabText, tab === 'admin' && styles.activeTabText]}>
              {language === 'ar' ? 'دخول الإدارة' : 'Admin Login'}
            </Text>
          </TouchableOpacity>
        </View>

        {tab === 'phone' ? (
          <View style={styles.form}>
            <Text style={[styles.label, isRTL && styles.rtlText]}>
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
              {language === 'ar' ? 'أدخل رقمك بدون رمز الدولة (يبدأ بـ 7)' : 'Enter number without country code (starts with 7)'}
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={handlePhoneLogin}>
              <LinearGradient colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]} style={styles.btnGradient}>
                <MaterialIcons name="send" size={18} color="#000" />
                <Text style={styles.primaryBtnText}>{t('sendCode', language)}</Text>
              </LinearGradient>
            </TouchableOpacity>
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{language === 'ar' ? 'أو' : 'or'}</Text>
              <View style={styles.dividerLine} />
            </View>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.push('/auth/register')}>
              <Text style={styles.secondaryBtnText}>
                {t('noAccount', language)} {' '}
                <Text style={styles.linkText}>{t('register', language)}</Text>
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={[styles.label, isRTL && styles.rtlText]}>
              {language === 'ar' ? 'اسم المستخدم' : 'Username'}
            </Text>
            <TextInput
              style={[styles.input, isRTL && styles.rtlInput]}
              value={adminUsername}
              onChangeText={setAdminUsername}
              placeholder={language === 'ar' ? 'أدخل اسم المستخدم' : 'Enter username'}
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="none"
            />
            <Text style={[styles.label, isRTL && styles.rtlText, { marginTop: Spacing.md }]}>
              {language === 'ar' ? 'كلمة المرور' : 'Password'}
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, isRTL && styles.rtlInput]}
                value={adminPassword}
                onChangeText={setAdminPassword}
                placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter password'}
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <MaterialIcons name={showPassword ? 'visibility-off' : 'visibility'} size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={handleAdminLogin}
              disabled={loading}
            >
              <LinearGradient colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]} style={styles.btnGradient}>
                <MaterialIcons name="admin-panel-settings" size={18} color="#000" />
                <Text style={styles.primaryBtnText}>
                  {loading ? (language === 'ar' ? 'جاري الدخول...' : 'Logging in...') : (language === 'ar' ? 'دخول لوحة الإدارة' : 'Admin Login')}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.lg, alignItems: 'center' },
  logoContainer: { alignItems: 'center', marginBottom: Spacing.xl },
  logoBox: {
    width: 100, height: 100, borderRadius: Radius.xl,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.borderGold,
  },
  logo: { width: 80, height: 80 },
  appName: {
    fontSize: FontSize.display, fontWeight: FontWeight.extrabold,
    color: Colors.primary, letterSpacing: 6, marginTop: Spacing.sm,
  },
  tagline: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 4 },
  tabContainer: {
    flexDirection: 'row', width: '100%',
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    padding: 4, marginBottom: Spacing.xl,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: Radius.md, alignItems: 'center' },
  activeTab: { backgroundColor: Colors.primary },
  tabText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  activeTabText: { color: '#000', fontWeight: FontWeight.bold },
  form: { width: '100%' },
  label: { fontSize: FontSize.base, color: Colors.textSecondary, marginBottom: Spacing.sm },
  rtlText: { textAlign: 'right' },
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
  phoneHint: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 6, textAlign: 'right' },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    backgroundColor: Colors.bgInput, paddingHorizontal: Spacing.md, paddingVertical: 14,
    fontSize: FontSize.md, color: Colors.textPrimary,
  },
  rtlInput: { textAlign: 'right' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.bgInput },
  passwordInput: { flex: 1, paddingHorizontal: Spacing.md, paddingVertical: 14, fontSize: FontSize.md, color: Colors.textPrimary },
  eyeBtn: { padding: Spacing.md },
  primaryBtn: { marginTop: Spacing.xl, borderRadius: Radius.md, overflow: 'hidden' },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  primaryBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#000' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: Spacing.lg, gap: Spacing.sm },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: FontSize.sm, color: Colors.textMuted },
  secondaryBtn: { alignItems: 'center' },
  secondaryBtnText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  linkText: { color: Colors.primary, fontWeight: FontWeight.semibold },
});
