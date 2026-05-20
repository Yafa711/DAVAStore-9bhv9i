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
import { ADMIN_PERMISSIONS } from '@/constants/config';

export default function AdminDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, user } = useApp();
  const { orders, products, users } = useData();
  const { showAlert } = useAlert();

  // Permission check
  const hasPermission = (perm: string) => {
    if (!user) return false;
    if (user.isSuperAdmin) return true;
    return user.permissions.includes(perm);
  };

  if (!user || (!user.isAdmin && !user.isSuperAdmin)) {
    return (
      <View style={[styles.container, styles.center, { paddingTop: insets.top }]}>
        <MaterialIcons name="block" size={60} color={Colors.error} />
        <Text style={styles.noAccessText}>{language === 'ar' ? 'غير مصرح لك' : 'Access Denied'}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>{t('back', language)}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const pendingPayments = orders.filter(o => o.paymentStatus === 'pending').length;

  const AdminCard = ({ icon, label, value, color, route, perm }: any) => {
    if (perm && !hasPermission(perm)) return null;
    return (
      <TouchableOpacity style={styles.adminCard} onPress={() => router.push(route)} activeOpacity={0.8}>
        <View style={[styles.cardIcon, { backgroundColor: color + '20' }]}>
          <MaterialIcons name={icon} size={28} color={color} />
        </View>
        {value !== undefined ? (
          <Text style={[styles.cardValue, { color }]}>{value}</Text>
        ) : null}
        <Text style={styles.cardLabel}>{label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('adminPanel', language)}</Text>
          <Text style={styles.adminName}>{user.name}</Text>
        </View>
        <View style={[styles.superBadge, { opacity: user.isSuperAdmin ? 1 : 0 }]}>
          <MaterialIcons name="verified" size={14} color="#000" />
          <Text style={styles.superBadgeText}>SUPER</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* Stats Summary */}
        {hasPermission('view_statistics') ? (
          <LinearGradient colors={['#1A1A1A', '#111111']} style={styles.statsCard}>
            <Text style={styles.statsTitle}>
              {language === 'ar' ? 'ملخص اليوم' : "Today's Summary"}
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{orders.length}</Text>
                <Text style={styles.statLabel}>{language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.warning }]}>{pendingOrders}</Text>
                <Text style={styles.statLabel}>{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: Colors.success }]}>{totalRevenue.toLocaleString()}</Text>
                <Text style={styles.statLabel}>{language === 'ar' ? 'ريال مبيعات' : 'YER Revenue'}</Text>
              </View>
            </View>
            {pendingPayments > 0 ? (
              <TouchableOpacity
                style={styles.pendingAlert}
                onPress={() => router.push('/admin/orders')}
              >
                <MaterialIcons name="payment" size={16} color={Colors.warning} />
                <Text style={styles.pendingAlertText}>
                  {pendingPayments} {language === 'ar' ? 'دفعة تنتظر المراجعة' : 'payments awaiting review'}
                </Text>
                <MaterialIcons name="arrow-forward-ios" size={14} color={Colors.warning} />
              </TouchableOpacity>
            ) : null}
          </LinearGradient>
        ) : null}

        {/* Admin Cards */}
        <Text style={styles.sectionTitle}>
          {language === 'ar' ? 'إدارة المتجر' : 'Store Management'}
        </Text>
        <View style={styles.cardsGrid}>
          <AdminCard icon="inventory" label={language === 'ar' ? 'المنتجات' : 'Products'} value={products.length} color={Colors.info} route="/admin/products" perm="manage_products" />
          <AdminCard icon="receipt-long" label={language === 'ar' ? 'الطلبات' : 'Orders'} value={orders.length} color={Colors.warning} route="/admin/orders" perm="manage_orders" />
          <AdminCard icon="people" label={language === 'ar' ? 'العملاء' : 'Customers'} value={users.length} color={Colors.success} route="/admin/users" perm="manage_users" />
          <AdminCard icon="local-offer" label={language === 'ar' ? 'العروض' : 'Offers'} color={Colors.error} route="/admin/offers" perm="manage_offers" />
          <AdminCard icon="discount" label={language === 'ar' ? 'الكوبونات' : 'Coupons'} color="#9C27B0" route="/admin/coupons" perm="manage_coupons" />
          <AdminCard icon="bar-chart" label={language === 'ar' ? 'الإحصائيات' : 'Statistics'} color={Colors.primary} route="/admin/statistics" perm="view_statistics" />
        </View>

        {user.isSuperAdmin ? (
          <>
            <Text style={styles.sectionTitle}>
              {language === 'ar' ? 'إعدادات متقدمة' : 'Advanced Settings'}
            </Text>
            <View style={styles.cardsGrid}>
              <AdminCard icon="local-shipping" label={language === 'ar' ? 'التوصيل' : 'Delivery'} color="#00BCD4" route="/admin/delivery" perm="manage_delivery" />
              <AdminCard icon="account-balance" label={language === 'ar' ? 'البنوك' : 'Banks'} color={Colors.primary} route="/admin/banks" perm="manage_banks" />
              <AdminCard icon="admin-panel-settings" label={language === 'ar' ? 'الإداريون' : 'Admins'} color={Colors.error} route="/admin/admins" perm="manage_admins" />
              <AdminCard icon="settings" label={language === 'ar' ? 'الإعدادات' : 'Settings'} color={Colors.textMuted} route="/admin/settings" perm="manage_settings" />
              <AdminCard icon="search" label={language === 'ar' ? 'تحليل البحث' : 'Search Analytics'} color="#FF9800" route="/admin/search-analytics" perm="view_statistics" />
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  noAccessText: { fontSize: FontSize.xl, color: Colors.textPrimary, marginTop: Spacing.md },
  backBtn: { marginTop: Spacing.lg, padding: Spacing.md, backgroundColor: Colors.bgCard, borderRadius: Radius.md },
  backBtnText: { color: Colors.textPrimary },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.borderGold,
  },
  headerCenter: { alignItems: 'center' },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  adminName: { fontSize: FontSize.xs, color: Colors.textSecondary },
  superBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  superBadgeText: { fontSize: 10, fontWeight: FontWeight.bold, color: '#000' },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 40 },
  statsCard: { borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.borderGold },
  statsTitle: { fontSize: FontSize.base, color: Colors.textSecondary, marginBottom: Spacing.md },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.primary },
  statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, textAlign: 'center', marginTop: 2 },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  pendingAlert: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: Spacing.md, backgroundColor: Colors.warning + '20',
    borderRadius: Radius.sm, padding: Spacing.sm,
  },
  pendingAlertText: { flex: 1, fontSize: FontSize.sm, color: Colors.warning },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  adminCard: {
    width: '31%', backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg, padding: Spacing.md,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
    gap: 6,
  },
  cardIcon: { width: 52, height: 52, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  cardValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  cardLabel: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center' },
});
