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
  const isRTL = language === 'ar';

  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.total, 0);
  const pendingRevenue = orders.filter(o => o.paymentStatus === 'pending').reduce((s, o) => s + o.total, 0);
  const completedOrders = orders.filter(o => o.status === 'delivered').length;
  const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;

  const salesByCategory = CATEGORIES.map(cat => {
    const items = orders.flatMap(o => o.items.filter(i => {
      const p = products.find(p => p.id === i.productId);
      return p?.category === cat.id;
    }));
    return { ...cat, revenue: items.reduce((s, i) => s + i.price * i.quantity, 0), count: items.length };
  }).sort((a, b) => b.revenue - a.revenue);

  const topProducts = [...products].sort((a, b) => b.sold - a.sold).slice(0, 5);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.title}>{isRTL ? 'الإحصائيات' : 'Statistics'}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.revenueCard}>
          <Text style={styles.revLabel}>{isRTL ? 'إجمالي المبيعات المؤكدة' : 'Total Confirmed Revenue'}</Text>
          <Text style={styles.revValue}>{totalRevenue.toLocaleString()}</Text>
          <Text style={styles.revCurr}>{isRTL ? 'ريال يمني' : 'YER'}</Text>
          <Text style={styles.revPending}>{isRTL ? `قيد المراجعة: ${pendingRevenue.toLocaleString()} ريال` : `Pending: ${pendingRevenue.toLocaleString()} YER`}</Text>
        </LinearGradient>

        <View style={styles.grid}>
          {[
            { l: isRTL ? 'إجمالي الطلبات' : 'Total Orders', v: orders.length, c: Colors.info, icon: 'receipt-long' },
            { l: isRTL ? 'مكتملة' : 'Delivered', v: completedOrders, c: Colors.success, icon: 'check-circle' },
            { l: isRTL ? 'ملغية' : 'Cancelled', v: cancelledOrders, c: Colors.error, icon: 'cancel' },
            { l: isRTL ? 'العملاء' : 'Customers', v: users.length, c: '#9C27B0', icon: 'people' },
            { l: isRTL ? 'المنتجات' : 'Products', v: products.length, c: Colors.warning, icon: 'inventory' },
            { l: isRTL ? 'متوسط الطلب' : 'Avg Order', v: orders.length > 0 ? Math.round(totalRevenue / orders.length).toLocaleString() : 0, c: Colors.primary, icon: 'trending-up' },
          ].map((s, i) => (
            <View key={i} style={[styles.statCard, { borderColor: s.c + '40' }]}>
              <View style={[styles.statIcon, { backgroundColor: s.c + '20' }]}>
                <MaterialIcons name={s.icon as any} size={20} color={s.c} />
              </View>
              <Text style={[styles.statVal, { color: s.c }]}>{s.v}</Text>
              <Text style={styles.statLabel}>{s.l}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.sectionTitle}>{isRTL ? 'المبيعات حسب التصنيف' : 'Sales by Category'}</Text>
        {salesByCategory.map(cat => (
          <View key={cat.id} style={styles.catRow}>
            <View style={[styles.catDot, { backgroundColor: cat.color }]} />
            <Text style={styles.catName}>{isRTL ? cat.nameAr : cat.nameEn}</Text>
            <View style={styles.catBar}>
              <View style={[styles.catBarFill, {
                backgroundColor: cat.color,
                width: `${salesByCategory[0].revenue > 0 ? (cat.revenue / salesByCategory[0].revenue) * 100 : 0}%` as any,
              }]} />
            </View>
            <Text style={styles.catRev}>{cat.revenue.toLocaleString()}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>{isRTL ? 'أكثر المنتجات مبيعاً' : 'Top Selling Products'}</Text>
        {topProducts.map((p, i) => (
          <View key={p.id} style={styles.topRow}>
            <View style={styles.rankBadge}><Text style={styles.rankTxt}>{i + 1}</Text></View>
            <Text style={styles.topName} numberOfLines={1}>{isRTL ? p.nameAr : p.nameEn}</Text>
            <Text style={styles.topSold}>{p.sold} {isRTL ? 'مبيع' : 'sold'}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 40 },
  revenueCard: { borderRadius: Radius.xl, padding: Spacing.xl, alignItems: 'center', gap: 4 },
  revLabel: { fontSize: FontSize.sm, color: '#0D1E16', opacity: 0.8 },
  revValue: { fontSize: 42, fontWeight: FontWeight.extrabold, color: '#0D1E16' },
  revCurr: { fontSize: FontSize.base, color: '#0D1E16', opacity: 0.7 },
  revPending: { fontSize: FontSize.xs, color: '#0D1E16', opacity: 0.6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: { width: '31%', flex: 1, minWidth: 90, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: 10, alignItems: 'center', borderWidth: 1, gap: 4 },
  statIcon: { width: 38, height: 38, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  statVal: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold },
  statLabel: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  catRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 5 },
  catDot: { width: 10, height: 10, borderRadius: 5 },
  catName: { fontSize: FontSize.sm, color: Colors.textSecondary, width: 90 },
  catBar: { flex: 1, height: 8, backgroundColor: Colors.bgSurface, borderRadius: Radius.full, overflow: 'hidden' },
  catBarFill: { height: '100%', borderRadius: Radius.full },
  catRev: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.bold, width: 60, textAlign: 'right' },
  topRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  rankBadge: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  rankTxt: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#0D1E16' },
  topName: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary },
  topSold: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
});
