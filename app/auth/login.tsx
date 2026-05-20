import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator,
  Linking, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { useAlert } from '@/template';
import { otpService, customersService, adminService } from '@/services/database';

type Mode = 'login' | 'register';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setUser, language } = useApp();
  const { adminUsers } = useData();
  const { showAlert } = useAlert();

  const [mode, setMode] = useState<Mode>('login');
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [loading, setLoading] = useState(false);

  const isRTL = language === 'ar';
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  // Validate Yemen phone format
  const isValidPhone = (p: string) => /^7[0-9]{8}$/.test(p);

  const handleCustomerAuth = async () => {
    if (!isValidPhone(phone)) {
      showAlert(
        isRTL ? 'رقم غير صحيح' : 'Invalid Number',
        isRTL ? 'يجب أن يبدأ الرقم بـ 7 ويتكون من 9 أرقام (مثال: 700000000)' : 'Number must start with 7 and be 9 digits (e.g. 700000000)'
      );
      return;
    }
    if (mode === 'register' && !name.trim()) {
      showAlert(isRTL ? 'أدخل اسمك' : 'Enter Name', '');
      return;
    }

    const fullPhone = `+967${phone}`;

    if (mode === 'login') {
      // Check if user exists
      setLoading(true);
      const existing = await customersService.getByPhone(fullPhone);
      setLoading(false);
      if (!existing) {
        showAlert(
          isRTL ? 'الحساب غير موجود' : 'Account Not Found',
          isRTL ? 'لا يوجد حساب بهذا الرقم. قم بإنشاء حساب جديد.' : 'No account with this number. Please register.',
          [
            { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
            { text: isRTL ? 'إنشاء حساب' : 'Register', onPress: () => setMode('register') },
          ]
        );
        return;
      }
    }

    // Generate and send OTP
    setLoading(true);
    try {
      const otp = otpService.generateOTP();
      await otpService.store(fullPhone, otp);

      const adminPhone = '967782282586';
      const msg = mode === 'register'
        ? `🔐 كود تحقق DAVA\n\nالعميل الجديد: ${name}\nالرقم: ${fullPhone}\nالكود: ${otp}\n\n⚡ أرسل هذا الكود إلى العميل على رقم: ${fullPhone}\nصلاحيته 10 دقائق`
        : `🔐 تسجيل دخول DAVA\n\nالرقم: ${fullPhone}\nكود الدخول: ${otp}\n\n⚡ أرسل هذا الكود إلى العميل على رقم: ${fullPhone}\nصلاحيته 10 دقائق`;

      await Linking.openURL(`https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`);

      router.push({
        pathname: '/auth/verify',
        params: {
          phone: fullPhone,
          name: name || '',
          mode,
        },
      });
    } catch (e) {
      showAlert(isRTL ? 'خطأ' : 'Error', isRTL ? 'فشل إرسال الكود' : 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async () => {
    if (!adminUsername.trim() || !adminPassword.trim()) {
      showAlert(isRTL ? 'أدخل بيانات الدخول' : 'Enter credentials', '');
      return;
    }
    setLoading(true);
    try {
      const admin = await adminService.login(adminUsername.trim(), adminPassword);
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
        router.replace('/admin/index');
      } else {
        showAlert(
          isRTL ? 'بيانات خاطئة' : 'Wrong Credentials',
          isRTL ? 'اسم المستخدم أو كلمة المرور غير صحيحة' : 'Invalid username or password'
        );
      }
    } catch {
      showAlert(isRTL ? 'خطأ' : 'Error', isRTL ? 'فشل الاتصال بالخادم' : 'Server connection failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#050505', '#0A0A0A', '#111']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            {/* Logo */}
            <View style={styles.logoSection}>
              <Image
                source={require('@/assets/images/dava-logo.png')}
                style={styles.logo}
                contentFit="contain"
                transition={300}
              />
              <Text style={styles.brandName}>DAVA</Text>
              <Text style={styles.brandTagline}>
                {isRTL ? 'أزياء فاخرة لكل إطلالة' : 'Luxury Fashion for Every Look'}
              </Text>
            </View>

            {/* Mode Toggle */}
            {!isAdminLogin ? (
              <View style={styles.modeToggle}>
                <TouchableOpacity
                  style={[styles.modeBtn, mode === 'login' && styles.activeModeBtn]}
                  onPress={() => setMode('login')}
                >
                  <Text style={[styles.modeBtnText, mode === 'login' && styles.activeModeBtnText]}>
                    {isRTL ? 'تسجيل دخول' : 'Login'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeBtn, mode === 'register' && styles.activeModeBtn]}
                  onPress={() => setMode('register')}
                >
                  <Text style={[styles.modeBtnText, mode === 'register' && styles.activeModeBtnText]}>
                    {isRTL ? 'حساب جديد' : 'Register'}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.card}>
              {isAdminLogin ? (
                <>
                  <View style={styles.cardHeader}>
                    <MaterialIcons name="admin-panel-settings" size={28} color={Colors.primary} />
                    <Text style={styles.cardTitle}>
                      {isRTL ? 'لوحة الإدارة' : 'Admin Panel'}
                    </Text>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, isRTL && styles.rtlText]}>
                      {isRTL ? 'اسم المستخدم' : 'Username'}
                    </Text>
                    <View style={styles.inputWrapper}>
                      <MaterialIcons name="person" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, isRTL && styles.rtlInput]}
                        value={adminUsername}
                        onChangeText={setAdminUsername}
                        placeholder="Abod#DAVA"
                        placeholderTextColor={Colors.textMuted}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, isRTL && styles.rtlText]}>
                      {isRTL ? 'كلمة المرور' : 'Password'}
                    </Text>
                    <View style={styles.inputWrapper}>
                      <MaterialIcons name="lock" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, isRTL && styles.rtlInput]}
                        value={adminPassword}
                        onChangeText={setAdminPassword}
                        placeholder="••••••••"
                        placeholderTextColor={Colors.textMuted}
                        secureTextEntry
                      />
                    </View>
                  </View>
                  <TouchableOpacity style={styles.submitBtn} onPress={handleAdminLogin} disabled={loading} activeOpacity={0.85}>
                    <LinearGradient colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]} style={styles.submitGradient}>
                      {loading ? (
                        <ActivityIndicator color="#000" />
                      ) : (
                        <>
                          <MaterialIcons name="login" size={20} color="#000" />
                          <Text style={styles.submitText}>{isRTL ? 'دخول' : 'Login'}</Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.cardHeader}>
                    <MaterialIcons name="phone-android" size={28} color={Colors.primary} />
                    <Text style={styles.cardTitle}>
                      {mode === 'login'
                        ? (isRTL ? 'تسجيل الدخول' : 'Sign In')
                        : (isRTL ? 'إنشاء حساب جديد' : 'Create Account')}
                    </Text>
                  </View>

                  {mode === 'register' ? (
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, isRTL && styles.rtlText]}>
                        {isRTL ? 'الاسم الكامل' : 'Full Name'}
                      </Text>
                      <View style={styles.inputWrapper}>
                        <MaterialIcons name="person" size={20} color={Colors.textMuted} style={styles.inputIcon} />
                        <TextInput
                          style={[styles.input, isRTL && styles.rtlInput]}
                          value={name}
                          onChangeText={setName}
                          placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                          placeholderTextColor={Colors.textMuted}
                        />
                      </View>
                    </View>
                  ) : null}

                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, isRTL && styles.rtlText]}>
                      {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                    </Text>
                    <View style={styles.phoneRow}>
                      <View style={styles.countryCode}>
                        <Text style={styles.flag}>🇾🇪</Text>
                        <Text style={styles.countryCodeText}>+967</Text>
                      </View>
                      <TextInput
                        style={[styles.phoneInput, isRTL && styles.rtlInput]}
                        value={phone}
                        onChangeText={t => setPhone(t.replace(/[^0-9]/g, '').slice(0, 9))}
                        placeholder="7XXXXXXXX"
                        placeholderTextColor={Colors.textMuted}
                        keyboardType="number-pad"
                        maxLength={9}
                      />
                    </View>
                    <Text style={[styles.inputHint, isRTL && styles.rtlText]}>
                      {isRTL ? 'يجب أن يبدأ بـ 7 ويتكون من 9 أرقام' : 'Must start with 7 and be 9 digits'}
                    </Text>
                  </View>

                  <View style={styles.whatsappInfo}>
                    <MaterialIcons name="info-outline" size={16} color={Colors.primary} />
                    <Text style={[styles.whatsappInfoText, isRTL && styles.rtlText]}>
                      {isRTL
                        ? 'سيتم فتح واتساب لإرسال كود التحقق عبر المدير'
                        : 'WhatsApp will open to send verification code via admin'}
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.submitBtn} onPress={handleCustomerAuth} disabled={loading} activeOpacity={0.85}>
                    <LinearGradient colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]} style={styles.submitGradient}>
                      {loading ? (
                        <ActivityIndicator color="#000" />
                      ) : (
                        <>
                          <MaterialIcons name="send" size={20} color="#000" />
                          <Text style={styles.submitText}>
                            {isRTL ? 'إرسال كود التحقق' : 'Send Verification Code'}
                          </Text>
                        </>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </View>

            {/* Toggle Admin/Customer */}
            <TouchableOpacity
              style={styles.toggleAdminBtn}
              onPress={() => setIsAdminLogin(v => !v)}
            >
              <MaterialIcons
                name={isAdminLogin ? 'person' : 'admin-panel-settings'}
                size={16}
                color={Colors.textMuted}
              />
              <Text style={styles.toggleAdminText}>
                {isAdminLogin
                  ? (isRTL ? 'العودة لتسجيل دخول العملاء' : 'Back to Customer Login')
                  : (isRTL ? 'دخول المدير / الإدارة' : 'Admin / Staff Login')}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  container: { flex: 1, paddingHorizontal: Spacing.lg },
  logoSection: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: { width: 90, height: 90, marginBottom: 8 },
  brandName: {
    fontSize: 40, fontWeight: FontWeight.extrabold,
    color: Colors.primary, letterSpacing: 8,
  },
  brandTagline: { fontSize: FontSize.sm, color: Colors.textSecondary, letterSpacing: 1, marginTop: 4 },
  modeToggle: {
    flexDirection: 'row', backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg, padding: 4, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  modeBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: Radius.md },
  activeModeBtn: { backgroundColor: Colors.primary },
  modeBtnText: { fontSize: FontSize.base, color: Colors.textMuted, fontWeight: FontWeight.medium },
  activeModeBtnText: { color: '#000', fontWeight: FontWeight.bold },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.borderGold, gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  cardTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  rtlText: { textAlign: 'right' },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    backgroundColor: Colors.bgInput, overflow: 'hidden',
  },
  inputIcon: { paddingHorizontal: 12 },
  input: {
    flex: 1, paddingVertical: 14, paddingRight: 12,
    fontSize: FontSize.base, color: Colors.textPrimary,
  },
  rtlInput: { textAlign: 'right' },
  phoneRow: {
    flexDirection: 'row', borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: Radius.md, backgroundColor: Colors.bgInput, overflow: 'hidden',
  },
  countryCode: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 14,
    borderRightWidth: 1, borderRightColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  flag: { fontSize: 18 },
  countryCodeText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.bold },
  phoneInput: {
    flex: 1, paddingHorizontal: 12, paddingVertical: 14,
    fontSize: FontSize.lg, color: Colors.textPrimary, letterSpacing: 2,
  },
  inputHint: { fontSize: FontSize.xs, color: Colors.textMuted },
  whatsappInfo: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.primary + '11', borderRadius: Radius.md,
    padding: Spacing.sm, borderWidth: 1, borderColor: Colors.borderGold,
  },
  whatsappInfoText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  submitBtn: { borderRadius: Radius.md, overflow: 'hidden', marginTop: 4 },
  submitGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, gap: 8,
  },
  submitText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#000' },
  toggleAdminBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: Spacing.sm,
  },
  toggleAdminText: { fontSize: FontSize.sm, color: Colors.textMuted },
});
