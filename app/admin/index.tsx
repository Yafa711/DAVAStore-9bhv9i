import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';

const MENU_ITEMS = [
  { id: 'products', icon: 'inventory-2', labelAr: 'المنتجات', labelEn: 'Products', color: '#4CAF82', route: '/admin/products' },
  { id: 'orders', icon: 'receipt-long', labelAr: 'الطلبات', labelEn: 'Orders', color: '#5090E0', route: '/admin/orders' },
  { id: 'users', icon: 'people', labelAr: 'العملاء', labelEn: 'Customers', color: '#E09050', route: '/admin/users' },
  { id: 'statistics', icon: 'bar-chart', labelAr: 'الإحصائيات', labelEn: 'Statistics', color: '#9C27B0', route: '/admin/statistics' },
  { id: 'offers', icon: 'local-offer', labelAr: 'العروض', labelEn: 'Offers', color: '#E05C5C', route: '/admin/offers' },
  { id: 'coupons', icon: 'discount', labelAr: 'الكوبونات', labelEn: 'Coupons', color: '#4AAFCF', route: '/admin/coupons' },
  { id: 'admins', icon: 'admin-panel-settings', labelAr: 'الإداريون', labelEn: 'Admins', color: '#C9A84C', route: '/admin/admins' },
  { id: 'delivery', icon: 'local-shipping', labelAr: 'التوصيل', labelEn: 'Delivery', color: '#4CAF82', route: '/admin/delivery' },
  { id: 'banks', icon: 'account-balance', labelAr: 'البنوك', labelEn: 'Banks', color: '#5090E0', route: '/admin/banks' },
  { id: 'search', icon: 'search', labelAr: 'تحليل البحث', labelEn: 'Search Analytics', color: '#E09050', route: '/admin/search-analytics' },
  { id: 'settings', icon: 'settings', labelAr: 'الإعدادات', labelEn: 'Settings', color: '#888', route: '/admin/settings' },
];

export default function AdminIndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, user, logout } = useApp();
  const { orders, products, users } = useData();
  const isRTL = language === 'ar';

  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const todayRevenue = orders
    .filter(o => o.paymentStatus === 'paid' && new Date(o.createdAt).toDateString() === new Date().toDateString())
    .reduce((s, o) => s + o.total, 0);

  const accessibleItems = user?.isSuperAdmin
    ? MENU_ITEMS
    : MENU_ITEMS.filter(m => {
        const perm = `manage_${m.id}`;
        return user?.permissions.includes(perm) || user?.permissions.includes('view_statistics') && m.id === 'statistics';
      });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#152A1E', '#0D1E16']} style={styles.header}>
        <View style={styles.headerLeft}>
          <Image source={require('@/assets/images/dava-logo.png')} style={styles.logoImg} contentFit="contain" />
          <View>
            <Text style={styles.adminLabel}>{isRTL ? 'لوحة الإدارة' : 'Admin Panel'}</Text>
            <Text style={styles.adminName}>{user?.name}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          {user?.isSuperAdmin ? (
            <View style={styles.superBadge}>
              <MaterialIcons name="verified" size={12} color="#0D1E16" />
              <Text style={styles.superBadgeTxt}>{isRTL ? 'مدير عام' : 'Super Admin'}</Text>
            </View>
          ) : null}
          <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.exitBtn}>
            <MaterialIcons name="exit-to-app" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {/* Quick Stats */}
        <View style={styles.statsRow}>
          <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.statCard}>
            <MaterialIcons name="shopping-bag" size={22} color="#0D1E16" />
            <Text style={styles.statNum}>{orders.length}</Text>
            <Text style={styles.statLabel}>{isRTL ? 'الطلبات' : 'Orders'}</Text>
          </LinearGradient>
          <View style={[styles.statCard, { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border }]}>
            <MaterialIcons name="pending-actions" size={22} color={Colors.warning} />
            <Text style={[styles.statNum, { color: Colors.warning }]}>{pendingOrders}</Text>
            <Text style={styles.statLabel}>{isRTL ? 'قيد الانتظار' : 'Pending'}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border }]}>
            <MaterialIcons name="inventory-2" size={22} color={Colors.info} />
            <Text style={[styles.statNum, { color: Colors.info }]}>{products.length}</Text>
            <Text style={styles.statLabel}>{isRTL ? 'المنتجات' : 'Products'}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border }]}>
            <MaterialIcons name="people" size={22} color={Colors.success} />
            <Text style={[styles.statNum, { color: Colors.success }]}>{users.length}</Text>
            <Text style={styles.statLabel}>{isRTL ? 'العملاء' : 'Customers'}</Text>
          </View>
        </View>

        {/* Today Revenue */}
        <LinearGradient colors={['#1C3527', '#152A1E']} style={styles.revenueCard}>
          <MaterialIcons name="trending-up" size={20} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.revenueLabel}>{isRTL ? 'مبيعات اليوم' : "Today's Sales"}</Text>
            <Text style={styles.revenueVal}>{todayRevenue.toLocaleString()} {isRTL ? 'ريال' : 'YER'}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/admin/statistics')}>
            <Text style={styles.viewAll}>{isRTL ? 'عرض الكل' : 'View All'}</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Menu Grid */}
        <Text style={styles.sectionTitle}>{isRTL ? 'إدارة المتجر' : 'Store Management'}</Text>
        <View style={styles.menuGrid}>
          {accessibleItems.map(item => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => router.push(item.route as any)}
            >
              <View style={[styles.menuIcon, { backgroundColor: item.color + '20' }]}>
                <MaterialIcons name={item.icon as any} size={24} color={item.color} />
                {item.id === 'orders' && pendingOrders > 0 ? (
                  <View style={styles.menuBadge}>
                    <Text style={styles.menuBadgeTxt}>{pendingOrders}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.menuLabel}>{isRTL ? item.labelAr : item.labelEn}</Text>
            </TouchableOpacity>
          ))}
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
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoImg: { width: 36, height: 36, borderRadius: 9 },
  adminLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  adminName: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  superBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  superBadgeTxt: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#0D1E16' },
  exitBtn: { padding: 4 },
  statsRow: { flexDirection: 'row', gap: 8, padding: Spacing.lg },
  statCard: { flex: 1, borderRadius: Radius.lg, padding: 10, alignItems: 'center', gap: 4 },
  statNum: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: '#0D1E16' },
  statLabel: { fontSize: 9, color: Colors.textMuted, textAlign: 'center' },
  revenueCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    marginHorizontal: Spacing.lg, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderGold,
    marginBottom: Spacing.lg,
  },
  revenueLabel: { fontSize: FontSize.sm, color: Colors.textMuted },
  revenueVal: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.primary },
  viewAll: { fontSize: FontSize.sm, color: Colors.primary },
  sectionTitle: {
    fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textMuted,
    paddingHorizontal: Spacing.lg, marginBottom: Spacing.md,
    textTransform: 'uppercase', letterSpacing: 1,
  },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  menuCard: {
    width: '22%', flex: 1, minWidth: 70,
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: 12,
    alignItems: 'center', gap: 6, borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  menuIcon: { width: 44, height: 44, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  menuLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center', lineHeight: 14 },
  menuBadge: {
    position: 'absolute', top: -4, right: -4, backgroundColor: Colors.error,
    borderRadius: Radius.full, width: 16, height: 16, justifyContent: 'center', alignItems: 'center',
  },
  menuBadgeTxt: { fontSize: 8, color: '#fff', fontWeight: FontWeight.bold },
});
