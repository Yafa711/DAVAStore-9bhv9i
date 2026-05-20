import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
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

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, setLanguage, user, logout } = useApp();
  const { orders } = useData();
  const { showAlert } = useAlert();
  const isRTL = language === 'ar';

  const userOrders = orders.filter(o => o.userId === user?.id);
  const totalSpent = userOrders.reduce((s, o) => s + o.total, 0);

  const handleLogout = () => {
    showAlert(
      language === 'ar' ? 'تسجيل الخروج' : 'Logout',
      language === 'ar' ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Are you sure you want to logout?',
      [
        { text: t('cancel', language), style: 'cancel' },
        { text: t('logout', language), style: 'destructive', onPress: () => { logout(); router.replace('/auth/login'); } },
      ]
    );
  };

  const MenuItem = ({ icon, label, onPress, color = Colors.textPrimary, subtitle }: any) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.menuIcon, { backgroundColor: color + '15' }]}>
        <MaterialIcons name={icon} size={22} color={color} />
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuLabel, { color }]}>{label}</Text>
        {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
      </View>
      <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  );

  if (!user) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('profile', language)}</Text>
        </View>
        <View style={styles.loginPrompt}>
          <MaterialIcons name="account-circle" size={80} color={Colors.textMuted} />
          <Text style={styles.loginTitle}>
            {language === 'ar' ? 'سجل دخولك' : 'Sign In'}
          </Text>
          <Text style={styles.loginSubtitle}>
            {language === 'ar' ? 'سجل دخولك لعرض ملفك الشخصي' : 'Sign in to view your profile'}
          </Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')}>
            <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.loginBtnGradient}>
              <Text style={styles.loginBtnText}>{t('login', language)}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile', language)}</Text>
        {(user.isAdmin || user.isSuperAdmin) ? (
          <TouchableOpacity style={styles.adminBadge} onPress={() => router.push('/admin/index')}>
            <MaterialIcons name="admin-panel-settings" size={16} color="#000" />
            <Text style={styles.adminBadgeText}>
              {user.isSuperAdmin ? (language === 'ar' ? 'مدير عام' : 'Super Admin') : (language === 'ar' ? 'مدير' : 'Admin')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Profile Card */}
        <LinearGradient colors={['#1A1A1A', '#111111']} style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.avatar}>
              <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
            </LinearGradient>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userPhone}>{user.phone}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userOrders.length}</Text>
              <Text style={styles.statLabel}>{language === 'ar' ? 'طلب' : 'Orders'}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalSpent.toLocaleString()}</Text>
              <Text style={styles.statLabel}>{language === 'ar' ? 'ريال' : 'YER'}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <MenuItem
            icon="receipt-long"
            label={t('myOrders', language)}
            onPress={() => router.push('/(tabs)/orders')}
          />
          <MenuItem
            icon="local-shipping"
            label={language === 'ar' ? 'تتبع الطلب' : 'Track Order'}
            onPress={() => router.push('/track/index')}
            color={Colors.info}
          />
          <MenuItem
            icon="favorite"
            label={language === 'ar' ? 'المفضلة' : 'Favorites'}
            onPress={() => router.push('/(tabs)/categories')}
            color={Colors.error}
          />
          {(user.isAdmin || user.isSuperAdmin) ? (
            <MenuItem
              icon="admin-panel-settings"
              label={t('adminPanel', language)}
              onPress={() => router.push('/admin/index')}
              color={Colors.primary}
            />
          ) : null}
        </View>

        <View style={styles.menuSection}>
          <MenuItem
            icon="language"
            label={t('language', language)}
            subtitle={language === 'ar' ? 'العربية' : 'English'}
            onPress={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
          />
        </View>

        <View style={styles.menuSection}>
          <MenuItem
            icon="logout"
            label={t('logout', language)}
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
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  adminBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  adminBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#000' },
  profileCard: {
    margin: Spacing.lg, borderRadius: Radius.xl,
    padding: Spacing.xl, alignItems: 'center',
    borderWidth: 1, borderColor: Colors.borderGold,
  },
  avatarContainer: { marginBottom: Spacing.md },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: FontSize.display, fontWeight: FontWeight.bold, color: '#000' },
  userName: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4 },
  userPhone: { fontSize: FontSize.base, color: Colors.textSecondary, marginBottom: Spacing.lg },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  statDivider: { width: 1, height: 30, backgroundColor: Colors.border },
  menuSection: {
    marginHorizontal: Spacing.lg, marginBottom: Spacing.sm,
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.md,
    gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  menuIcon: { width: 40, height: 40, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: FontSize.base, fontWeight: FontWeight.medium },
  menuSubtitle: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  loginPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: 12 },
  loginTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  loginSubtitle: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  loginBtn: { borderRadius: Radius.full, overflow: 'hidden', marginTop: 8 },
  loginBtnGradient: { paddingHorizontal: Spacing.xxl, paddingVertical: 14 },
  loginBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#000' },
});
