import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useAlert } from '@/template';
import { adminService, customersService, otpService } from '@/services/database';
import { getSupabaseClient } from '@/template';

type Mode = 'login' | 'register';
type AuthTab = 'customer' | 'admin';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setUser, language } = useApp();
  const { showAlert } = useAlert();

  const [tab, setTab] = useState<AuthTab>('customer');
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const isRTL = language === 'ar';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const handleEmailAuth = async () => {
    if (!isValidEmail(email)) {
      showAlert(
        isRTL ? 'بريد إلكتروني غير صحيح' : 'Invalid Email',
        isRTL ? 'أدخل بريداً إلكترونياً صحيحاً' : 'Please enter a valid email address'
      );
      return;
    }
    if (mode === 'register' && !name.trim()) {
      showAlert(isRTL ? 'أدخل اسمك' : 'Enter Name', '');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        const existing = await customersService.getByEmail(email.toLowerCase().trim());
        if (!existing) {
          showAlert(
            isRTL ? 'الحساب غير موجود' : 'Account Not Found',
            isRTL ? 'لا يوجد حساب بهذا البريد. قم بإنشاء حساب جديد.' : 'No account with this email. Please register.',
            [
              { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
              { text: isRTL ? 'إنشاء حساب' : 'Register', onPress: () => setMode('register') },
            ]
          );
          setLoading(false);
          return;
        }
      }
      // Generate and store OTP
      const otp = otpService.generateOTP();
      await otpService.storeByEmail(email.toLowerCase().trim(), otp);

      // Send via Supabase email (magic link / OTP)
      const supabase = getSupabaseClient();
      await supabase.auth.signInWithOtp({
        email: email.toLowerCase().trim(),
        options: {
          shouldCreateUser: false,
          data: { dava_otp: otp },
        },
      });

      router.push({
        pathname: '/auth/verify',
        params: { email: email.toLowerCase().trim(), name: name || '', mode },
      });
    } catch (e: any) {
      // Fallback: just store OTP locally and send via custom method
      const otp = otpService.generateOTP();
      await otpService.storeByEmail(email.toLowerCase().trim(), otp);
      // Show OTP to user for testing (in production connect SMTP)
      showAlert(
        isRTL ? 'كود التحقق' : 'Verification Code',
        isRTL ? `كودك هو: ${otp}\n(في الإنتاج سيُرسل للبريد الإلكتروني)` : `Your code: ${otp}\n(In production this will be emailed)`,
        [{
          text: isRTL ? 'متابعة' : 'Continue',
          onPress: () => router.push({
            pathname: '/auth/verify',
            params: { email: email.toLowerCase().trim(), name: name || '', mode },
          }),
        }]
      );
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
          email: admin.username,
          name: admin.name,
          phone: admin.phone,
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
      showAlert(isRTL ? 'خطأ' : 'Error', isRTL ? 'فشل الاتصال بالخادم' : 'Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#060F0A', '#0D1E16', '#152A1E']} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
            {/* Logo */}
            <View style={styles.logoSection}>
              <Image
                source={require('@/assets/images/dava-logo.png')}
                style={styles.logo}
                contentFit="contain"
                transition={400}
              />
              <Text style={styles.tagline}>
                {isRTL ? 'أزياء فاخرة لكل إطلالة' : 'Luxury Fashion for Every Look'}
              </Text>
            </View>

            {/* Tab Switcher */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tabBtn, tab === 'customer' && styles.tabBtnActive]}
                onPress={() => setTab('customer')}
              >
                <MaterialIcons name="person" size={16} color={tab === 'customer' ? '#0D1E16' : Colors.textMuted} />
                <Text style={[styles.tabBtnText, tab === 'customer' && styles.tabBtnTextActive]}>
                  {isRTL ? 'تسجيل العملاء' : 'Customer'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabBtn, tab === 'admin' && styles.tabBtnActive]}
                onPress={() => setTab('admin')}
              >
                <MaterialIcons name="admin-panel-settings" size={16} color={tab === 'admin' ? '#0D1E16' : Colors.textMuted} />
                <Text style={[styles.tabBtnText, tab === 'admin' && styles.tabBtnTextActive]}>
                  {isRTL ? 'لوحة الإدارة' : 'Admin'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Customer Auth */}
            {tab === 'customer' ? (
              <View style={styles.card}>
                {/* Mode Toggle */}
                <View style={styles.modeRow}>
                  <TouchableOpacity
                    style={[styles.modeBtn, mode === 'login' && styles.modeBtnActive]}
                    onPress={() => setMode('login')}
                  >
                    <Text style={[styles.modeBtnText, mode === 'login' && styles.modeBtnTextActive]}>
                      {isRTL ? 'تسجيل الدخول' : 'Sign In'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modeBtn, mode === 'register' && styles.modeBtnActive]}
                    onPress={() => setMode('register')}
                  >
                    <Text style={[styles.modeBtnText, mode === 'register' && styles.modeBtnTextActive]}>
                      {isRTL ? 'حساب جديد' : 'Register'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {mode === 'register' ? (
                  <View style={styles.field}>
                    <Text style={[styles.label, isRTL && styles.rtl]}>{isRTL ? 'الاسم الكامل' : 'Full Name'}</Text>
                    <View style={styles.inputWrap}>
                      <MaterialIcons name="person-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={[styles.input, isRTL && styles.rtl]}
                        value={name}
                        onChangeText={setName}
                        placeholder={isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'}
                        placeholderTextColor={Colors.textMuted}
                      />
                    </View>
                  </View>
                ) : null}

                <View style={styles.field}>
                  <Text style={[styles.label, isRTL && styles.rtl]}>
                    {isRTL ? 'البريد الإلكتروني (Gmail)' : 'Email Address (Gmail)'}
                  </Text>
                  <View style={styles.inputWrap}>
                    <MaterialIcons name="email" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, isRTL && styles.rtl]}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="example@gmail.com"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <View style={styles.infoBox}>
                  <MaterialIcons name="info-outline" size={15} color={Colors.primary} />
                  <Text style={[styles.infoText, isRTL && styles.rtl]}>
                    {isRTL
                      ? 'سيتم إرسال كود التحقق إلى بريدك الإلكتروني'
                      : 'A verification code will be sent to your email'}
                  </Text>
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleEmailAuth} disabled={loading}>
                  <LinearGradient colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]} style={styles.submitGrad}>
                    {loading ? <ActivityIndicator color="#0D1E16" /> : (
                      <>
                        <MaterialIcons name="send" size={18} color="#0D1E16" />
                        <Text style={styles.submitText}>
                          {isRTL ? 'إرسال كود التحقق' : 'Send Verification Code'}
                        </Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              /* Admin Auth */
              <View style={styles.card}>
                <View style={styles.adminHeader}>
                  <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.adminIconBg}>
                    <MaterialIcons name="shield" size={24} color="#0D1E16" />
                  </LinearGradient>
                  <Text style={[styles.cardTitle, isRTL && styles.rtl]}>
                    {isRTL ? 'دخول الإدارة' : 'Admin Access'}
                  </Text>
                </View>

                <View style={styles.field}>
                  <Text style={[styles.label, isRTL && styles.rtl]}>{isRTL ? 'اسم المستخدم' : 'Username'}</Text>
                  <View style={styles.inputWrap}>
                    <MaterialIcons name="badge" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, isRTL && styles.rtl]}
                      value={adminUsername}
                      onChangeText={setAdminUsername}
                      placeholder="Abod#DAVA"
                      placeholderTextColor={Colors.textMuted}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={[styles.label, isRTL && styles.rtl]}>{isRTL ? 'كلمة المرور' : 'Password'}</Text>
                  <View style={styles.inputWrap}>
                    <MaterialIcons name="lock-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                    <TextInput
                      style={[styles.input, isRTL && styles.rtl]}
                      value={adminPassword}
                      onChangeText={setAdminPassword}
                      placeholder="••••••••"
                      placeholderTextColor={Colors.textMuted}
                      secureTextEntry
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleAdminLogin} disabled={loading}>
                  <LinearGradient colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]} style={styles.submitGrad}>
                    {loading ? <ActivityIndicator color="#0D1E16" /> : (
                      <>
                        <MaterialIcons name="login" size={18} color="#0D1E16" />
                        <Text style={styles.submitText}>{isRTL ? 'دخول الإدارة' : 'Admin Login'}</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: Spacing.lg },
  logoSection: { alignItems: 'center', marginBottom: Spacing.xl, gap: 8 },
  logo: { width: 100, height: 100, borderRadius: 22 },
  tagline: { fontSize: FontSize.sm, color: Colors.textMuted, letterSpacing: 1, textAlign: 'center' },
  tabRow: {
    flexDirection: 'row', backgroundColor: Colors.bgCard,
    borderRadius: Radius.xl, padding: 4, marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: Colors.border,
  },
  tabBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: Radius.lg },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabBtnText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium },
  tabBtnTextActive: { color: '#0D1E16', fontWeight: FontWeight.bold },
  card: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.borderGold, gap: Spacing.md,
  },
  modeRow: {
    flexDirection: 'row', backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg, padding: 3, gap: 3,
  },
  modeBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.md },
  modeBtnActive: { backgroundColor: Colors.primary + 'DD' },
  modeBtnText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium },
  modeBtnTextActive: { color: '#0D1E16', fontWeight: FontWeight.bold },
  field: { gap: 6 },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  rtl: { textAlign: 'right' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    backgroundColor: Colors.bgInput,
  },
  inputIcon: { paddingHorizontal: 12 },
  input: {
    flex: 1, paddingVertical: 13, paddingRight: 12,
    fontSize: FontSize.base, color: Colors.textPrimary,
  },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 7,
    backgroundColor: Colors.primary + '12', borderRadius: Radius.md,
    padding: Spacing.sm, borderWidth: 1, borderColor: Colors.borderGold,
  },
  infoText: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary, lineHeight: 18 },
  submitBtn: { borderRadius: Radius.md, overflow: 'hidden', marginTop: 4 },
  submitGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 15, gap: 8,
  },
  submitText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#0D1E16' },
  adminHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  adminIconBg: { width: 44, height: 44, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
});
