import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { CATEGORIES } from '@/constants/config';

export default function StatisticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { orders, products, users } = useData();

  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const pendingRevenue = orders.filter(o => o.paymentStatus === 'pending').reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

  const salesByCategory = CATEGORIES.map(cat => {
    const catOrders = orders.flatMap(o => o.items.filter(i => {
      const p = products.find(p => p.id === i.productId);
      return p?.category === cat.id;
    }));
    const revenue = catOrders.reduce((s, i) => s + i.price * i.quantity, 0);
    return { ...cat, revenue, count: catOrders.length };
  }).sort((a, b) => b.revenue - a.revenue);

  const topProducts = [...products]
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  const StatCard = ({ label, value, color, icon, sub }: any) => (
    <View style={[styles.statCard, { borderColor: color + '40' }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <MaterialIcons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {sub ? <Text style={styles.statSub}>{sub}</Text> : null}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{language === 'ar' ? 'الإحصائيات' : 'Statistics'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Revenue */}
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.revenueCard}>
          <Text style={styles.revenueLabel}>{language === 'ar' ? 'إجمالي المبيعات المؤكدة' : 'Total Confirmed Revenue'}</Text>
          <Text style={styles.revenueValue}>{totalRevenue.toLocaleString()}</Text>
          <Text style={styles.revenueCurrency}>{language === 'ar' ? 'ريال يمني' : 'YER'}</Text>
          <Text style={styles.revenuePending}>
            {language === 'ar' ? 'في انتظار التأكيد: ' : 'Pending: '}{pendingRevenue.toLocaleString()} {language === 'ar' ? 'ريال' : 'YER'}
          </Text>
        </LinearGradient>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard label={language === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'} value={totalOrders} color={Colors.info} icon="receipt-long" />
          <StatCard label={language === 'ar' ? 'مكتملة' : 'Delivered'} value={completedOrders} color={Colors.success} icon="check-circle" />
          <StatCard label={language === 'ar' ? 'ملغية' : 'Cancelled'} value={cancelledOrders} color={Colors.error} icon="cancel" />
          <StatCard label={language === 'ar' ? 'العملاء' : 'Customers'} value={users.length} color="#9C27B0" icon="people" />
          <StatCard label={language === 'ar' ? 'المنتجات' : 'Products'} value={products.length} color={Colors.warning} icon="inventory" />
          <StatCard label={language === 'ar' ? 'معدل التحويل' : 'Avg Order'} value={totalOrders > 0 ? (totalRevenue / totalOrders).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'} color={Colors.primary} icon="trending-up" sub={language === 'ar' ? 'ريال/طلب' : 'YER/order'} />
        </View>

        {/* Sales by Category */}
        <Text style={styles.sectionTitle}>{language === 'ar' ? 'المبيعات حسب التصنيف' : 'Sales by Category'}</Text>
        {salesByCategory.map(cat => (
          <View key={cat.id} style={styles.categoryRow}>
            <View style={[styles.categoryDot, { backgroundColor: cat.color }]} />
            <Text style={styles.categoryName}>{language === 'ar' ? cat.nameAr : cat.nameEn}</Text>
            <View style={styles.categoryBar}>
              <View style={[styles.categoryBarFill, {
                backgroundColor: cat.color,
                width: salesByCategory[0].revenue > 0 ? `${(cat.revenue / salesByCategory[0].revenue) * 100}%` : '0%',
              }]} />
            </View>
            <Text style={styles.categoryRevenue}>{cat.revenue.toLocaleString()}</Text>
          </View>
        ))}

        {/* Top Products */}
        <Text style={styles.sectionTitle}>{language === 'ar' ? 'أكثر المنتجات مبيعاً' : 'Top Selling Products'}</Text>
        {topProducts.map((p, idx) => (
          <View key={p.id} style={styles.topProductRow}>
            <View style={styles.rankBadge}><Text style={styles.rankText}>{idx + 1}</Text></View>
            <Text style={styles.topProductName} numberOfLines={1}>{language === 'ar' ? p.nameAr : p.nameEn}</Text>
            <Text style={styles.topProductSold}>{p.sold} {language === 'ar' ? 'مبيع' : 'sold'}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 40 },
  revenueCard: { borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center' },
  revenueLabel: { fontSize: FontSize.sm, color: '#000', opacity: 0.8 },
  revenueValue: { fontSize: 42, fontWeight: FontWeight.extrabold, color: '#000', marginTop: 4 },
  revenueCurrency: { fontSize: FontSize.base, color: '#000', opacity: 0.8 },
  revenuePending: { fontSize: FontSize.sm, color: '#000', opacity: 0.6, marginTop: 8 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: { width: '31%', backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', borderWidth: 1, gap: 4 },
  statIcon: { width: 40, height: 40, borderRadius: Radius.sm, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold },
  statLabel: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
  statSub: { fontSize: 9, color: Colors.textMuted },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6 },
  categoryDot: { width: 10, height: 10, borderRadius: 5 },
  categoryName: { fontSize: FontSize.sm, color: Colors.textSecondary, width: 90 },
  categoryBar: { flex: 1, height: 8, backgroundColor: Colors.bgSurface, borderRadius: Radius.full, overflow: 'hidden' },
  categoryBarFill: { height: '100%', borderRadius: Radius.full },
  categoryRevenue: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.bold, width: 60, textAlign: 'right' },
  topProductRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  rankBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  rankText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#000' },
  topProductName: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary },
  topProductSold: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
});
