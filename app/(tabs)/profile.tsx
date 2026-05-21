import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { useAlert } from '@/template';
import { t } from '@/constants/i18n';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, setLanguage, user, logout, favorites } = useApp();
  const { products, orders } = useData();
  const { showAlert } = useAlert();

  const isRTL = language === 'ar';
  const myOrders = user ? orders.filter(o => o.userId === user.id) : [];
  const favProducts = products.filter(p => favorites.includes(p.id));

  const handleLogout = () => {
    showAlert(
      isRTL ? 'تسجيل الخروج' : 'Logout',
      isRTL ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Are you sure you want to logout?',
      [
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { text: isRTL ? 'خروج' : 'Logout', style: 'destructive', onPress: () => { logout(); router.replace('/auth/login'); } },
      ]
    );
  };

  const MenuItem = ({ icon, label, onPress, color, right }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: (color || Colors.primary) + '18' }]}>
        <MaterialIcons name={icon} size={20} color={color || Colors.primary} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      {right || <MaterialIcons name={isRTL ? 'arrow-back-ios' : 'arrow-forward-ios'} size={14} color={Colors.textMuted} />}
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#152A1E', '#0D1E16']} style={styles.header}>
          <Text style={styles.headerTitle}>{isRTL ? 'حسابي' : 'My Account'}</Text>
        </LinearGradient>
        <View style={styles.guestWrap}>
          <View style={styles.guestIcon}>
            <MaterialIcons name="person-outline" size={48} color={Colors.textMuted} />
          </View>
          <Text style={styles.guestTitle}>{isRTL ? 'مرحباً بك' : 'Welcome'}</Text>
          <Text style={styles.guestSub}>{isRTL ? 'سجل دخول للوصول لحسابك' : 'Sign in to access your account'}</Text>
          <TouchableOpacity style={styles.signInBtn} onPress={() => router.push('/auth/login')}>
            <LinearGradient colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]} style={styles.signInGrad}>
              <MaterialIcons name="login" size={18} color="#0D1E16" />
              <Text style={styles.signInTxt}>{isRTL ? 'تسجيل الدخول' : 'Sign In'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/auth/login')}>
            <Text style={styles.registerLink}>
              {isRTL ? 'ليس لديك حساب؟ إنشاء حساب جديد' : "Don't have an account? Register"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#152A1E', '#0D1E16']} style={styles.header}>
        <Text style={styles.headerTitle}>{isRTL ? 'حسابي' : 'My Account'}</Text>
        {user.isAdmin ? (
          <TouchableOpacity style={styles.adminBadge} onPress={() => router.push('/admin/index')}>
            <MaterialIcons name="shield" size={14} color="#0D1E16" />
            <Text style={styles.adminBadgeTxt}>{isRTL ? 'الإدارة' : 'Admin'}</Text>
          </TouchableOpacity>
        ) : null}
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* User Card */}
        <LinearGradient colors={['#1C3527', '#152A1E']} style={styles.userCard}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarTxt}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email || user.phone}</Text>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statItem} onPress={() => router.push('/(tabs)/orders')}>
            <Text style={styles.statNum}>{myOrders.length}</Text>
            <Text style={styles.statLabel}>{isRTL ? 'طلب' : 'Orders'}</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem}>
            <Text style={styles.statNum}>{favProducts.length}</Text>
            <Text style={styles.statLabel}>{isRTL ? 'مفضلة' : 'Favorites'}</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          <TouchableOpacity style={styles.statItem} onPress={() => router.push('/track/index')}>
            <MaterialIcons name="location-on" size={22} color={Colors.primary} />
            <Text style={styles.statLabel}>{isRTL ? 'تتبع' : 'Track'}</Text>
          </TouchableOpacity>
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>{isRTL ? 'التسوق' : 'Shopping'}</Text>
          <MenuItem icon="receipt-long" label={isRTL ? 'طلباتي' : 'My Orders'} onPress={() => router.push('/(tabs)/orders')} />
          <MenuItem icon="favorite-border" label={isRTL ? 'المفضلة' : 'Wishlist'} onPress={() => {}} />
          <MenuItem icon="my-location" label={isRTL ? 'تتبع الطلب' : 'Track Order'} onPress={() => router.push('/track/index')} />
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>{isRTL ? 'الإعدادات' : 'Settings'}</Text>
          <MenuItem
            icon="language"
            label={isRTL ? 'اللغة' : 'Language'}
            onPress={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            right={
              <View style={styles.langToggle}>
                <Text style={[styles.langTxt, language === 'ar' && styles.langActiveTxt]}>AR</Text>
                <Switch
                  value={language === 'en'}
                  onValueChange={v => setLanguage(v ? 'en' : 'ar')}
                  trackColor={{ false: Colors.primary, true: Colors.primary }}
                  thumbColor="#fff"
                  style={{ transform: [{ scale: 0.8 }] }}
                />
                <Text style={[styles.langTxt, language === 'en' && styles.langActiveTxt]}>EN</Text>
              </View>
            }
          />
        </View>

        {user.isAdmin || user.isSuperAdmin ? (
          <View style={styles.menuSection}>
            <Text style={styles.menuSectionTitle}>{isRTL ? 'الإدارة' : 'Administration'}</Text>
            <MenuItem icon="dashboard" label={isRTL ? 'لوحة الإدارة' : 'Admin Panel'} onPress={() => router.push('/admin/index')} color="#9C27B0" />
            <MenuItem icon="bar-chart" label={isRTL ? 'الإحصائيات' : 'Statistics'} onPress={() => router.push('/admin/statistics')} color={Colors.info} />
          </View>
        ) : null}

        <View style={styles.menuSection}>
          <MenuItem
            icon="logout"
            label={isRTL ? 'تسجيل الخروج' : 'Sign Out'}
            onPress={handleLogout}
            color={Colors.error}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  adminBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5,
  },
  adminBadgeTxt: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#0D1E16' },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    margin: Spacing.lg, borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.borderGold,
  },
  userAvatar: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  userAvatarTxt: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: '#0D1E16' },
  userInfo: { flex: 1 },
  userName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  userEmail: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
  statsRow: {
    flexDirection: 'row', backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.lg, borderRadius: Radius.xl, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.lg,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statNum: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  statDivider: { width: 1, backgroundColor: Colors.border },
  menuSection: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  menuSectionTitle: {
    fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textMuted,
    paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: 4, textTransform: 'uppercase', letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    borderTopWidth: 1, borderTopColor: Colors.divider,
  },
  menuIcon: { width: 36, height: 36, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  menuLabel: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  langToggle: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  langTxt: { fontSize: FontSize.xs, color: Colors.textMuted },
  langActiveTxt: { color: Colors.primary, fontWeight: FontWeight.bold },
  guestWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.lg, paddingHorizontal: Spacing.xl },
  guestIcon: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: Colors.bgCard, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: Colors.border,
  },
  guestTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  guestSub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  signInBtn: { borderRadius: Radius.full, overflow: 'hidden', width: '80%' },
  signInGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, gap: 8 },
  signInTxt: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#0D1E16' },
  registerLink: { fontSize: FontSize.sm, color: Colors.primary, textAlign: 'center' },
});
