import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Linking, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { ORDER_STATUSES, ADMIN_PERMISSIONS } from '@/constants/config';
import { useAlert } from '@/template';

export default function AdminOrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { orders, updateOrder, settings, refreshOrders } = useData();
  const { showAlert } = useAlert();
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const isRTL = language === 'ar';

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshOrders();
    setRefreshing(false);
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatus = (id: string) => ORDER_STATUSES.find(s => s.id === id) || ORDER_STATUSES[0];

  const handleUpdateStatus = (orderId: string) => {
    showAlert(
      isRTL ? 'تحديث الحالة' : 'Update Status',
      '',
      [
        ...ORDER_STATUSES.map(s => ({
          text: isRTL ? s.nameAr : s.nameEn,
          onPress: () => updateOrder(orderId, { status: s.id as any }),
        })),
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' as const },
      ]
    );
  };

  const handleMarkPaid = (order: any) => {
    updateOrder(order.id, { paymentStatus: 'paid' });
    const msg = `✅ تم تأكيد دفع طلبك\n\n📦 رقم الطلب: ${order.orderNumber}\n💰 المبلغ: ${order.total.toLocaleString()} ريال\n\nشكراً لتسوقك من DAVA 🌟`;
    const phone = order.userPhone.replace('+', '');
    if (phone) Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`);
  };

  const handleSendWhatsApp = (order: any) => {
    const st = getStatus(order.status);
    const msg = `📦 تحديث طلبك\n\nرقم الطلب: ${order.orderNumber}\nالحالة: ${isRTL ? st.nameAr : st.nameEn}\n\nشكراً من DAVA`;
    const phone = order.userPhone.replace('+', '');
    if (phone) Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isRTL ? 'الطلبات' : 'Orders'}</Text>
        <Text style={styles.count}>{orders.length}</Text>
      </View>

      <View style={styles.filterBar}>
        {['all', 'pending', 'confirmed', 'shipped', 'delivered'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.fChip, filter === f && styles.fChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.fTxt, filter === f && styles.fTxtActive]}>
              {f === 'all' ? (isRTL ? 'الكل' : 'All') :
                (isRTL ? ORDER_STATUSES.find(s => s.id === f)?.nameAr : ORDER_STATUSES.find(s => s.id === f)?.nameEn)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={sorted}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        renderItem={({ item }) => {
          const st = getStatus(item.status);
          return (
            <View style={styles.orderCard}>
              <View style={styles.orderTop}>
                <View>
                  <Text style={styles.orderNum}>#{item.orderNumber}</Text>
                  <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.statusBadge, { backgroundColor: st.color + '22', borderColor: st.color }]}
                  onPress={() => handleUpdateStatus(item.id)}
                >
                  <Text style={[styles.statusTxt, { color: st.color }]}>{isRTL ? st.nameAr : st.nameEn}</Text>
                  <MaterialIcons name="edit" size={10} color={st.color} />
                </TouchableOpacity>
              </View>

              <Text style={styles.customerInfo}>👤 {item.userName} · {item.userPhone}</Text>
              <Text style={styles.cityInfo}>📍 {item.city} · {item.address}</Text>
              <Text style={styles.itemsInfo}>{item.items.length} {isRTL ? 'منتجات' : 'items'} · {item.paymentMethod}</Text>

              {item.paymentScreenshot ? (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>{isRTL ? 'إثبات الدفع:' : 'Receipt:'}</Text>
                  <Image source={{ uri: item.paymentScreenshot }} style={styles.receiptThumb} />
                </View>
              ) : null}

              <View style={styles.orderFooter}>
                <Text style={styles.total}>{item.total.toLocaleString()} {isRTL ? 'ريال' : 'YER'}</Text>
                <View style={styles.actions}>
                  {item.paymentStatus !== 'paid' ? (
                    <TouchableOpacity style={styles.paidBtn} onPress={() => handleMarkPaid(item)}>
                      <MaterialIcons name="check-circle" size={13} color="#0D1E16" />
                      <Text style={styles.paidTxt}>{isRTL ? 'مدفوع' : 'Paid'}</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.confirmedBadge}>
                      <MaterialIcons name="verified" size={14} color={Colors.success} />
                      <Text style={styles.confirmedTxt}>{isRTL ? 'مدفوع' : 'Paid'}</Text>
                    </View>
                  )}
                  <TouchableOpacity style={styles.waBtn} onPress={() => handleSendWhatsApp(item)}>
                    <MaterialIcons name="send" size={13} color={Colors.primary} />
                    <Text style={styles.waTxt}>WhatsApp</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTxt}>{isRTL ? 'لا توجد طلبات' : 'No orders'}</Text>
          </View>
        }
      />
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
  count: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
  filterBar: {
    flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 10, gap: 6,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  fChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border },
  fChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  fTxt: { fontSize: FontSize.xs, color: Colors.textSecondary },
  fTxtActive: { color: '#0D1E16', fontWeight: FontWeight.bold },
  list: { padding: Spacing.md, gap: Spacing.sm },
  orderCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: 6 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNum: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary },
  orderDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  statusTxt: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  customerInfo: { fontSize: FontSize.sm, color: Colors.textPrimary },
  cityInfo: { fontSize: FontSize.xs, color: Colors.textSecondary },
  itemsInfo: { fontSize: FontSize.xs, color: Colors.textMuted },
  receiptRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  receiptLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  receiptThumb: { width: 56, height: 56, borderRadius: Radius.sm },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: 8 },
  total: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  actions: { flexDirection: 'row', gap: 6 },
  paidBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.success, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 6 },
  paidTxt: { fontSize: FontSize.xs, color: '#0D1E16', fontWeight: FontWeight.bold },
  confirmedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  confirmedTxt: { fontSize: FontSize.xs, color: Colors.success },
  waBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.borderGold, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 6 },
  waTxt: { fontSize: FontSize.xs, color: Colors.primary },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyTxt: { color: Colors.textMuted, fontSize: FontSize.base },
});
