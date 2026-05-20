import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { ORDER_STATUSES } from '@/constants/config';
import { useAlert } from '@/template';

export default function AdminOrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { orders, updateOrder, settings } = useData();
  const { showAlert } = useAlert();
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter || o.paymentStatus === filter);
  const sorted = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const getStatusInfo = (status: string) => ORDER_STATUSES.find(s => s.id === status) || ORDER_STATUSES[0];

  const handleUpdateStatus = (orderId: string, currentStatus: string) => {
    const statusOptions = ORDER_STATUSES.map(s => ({
      text: language === 'ar' ? s.nameAr : s.nameEn,
      onPress: () => updateOrder(orderId, { status: s.id as any }),
    }));
    showAlert(
      language === 'ar' ? 'تحديث الحالة' : 'Update Status',
      '',
      [...statusOptions, { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' as const }]
    );
  };

  const handleMarkPaid = (order: any) => {
    updateOrder(order.id, { paymentStatus: 'paid' });
    // Send WhatsApp notification
    const msg = `✅ تم تأكيد دفع طلبك\n\n📦 رقم الطلب: ${order.orderNumber}\n💰 المبلغ: ${order.total.toLocaleString()} ريال\n\nشكراً لتسوقك من DAVA 🌟`;
    const phone = order.userPhone.replace('+', '');
    Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`);
  };

  const handleSendWhatsApp = (order: any, customMsg?: string) => {
    const statusInfo = getStatusInfo(order.status);
    const msg = customMsg || `📦 تحديث طلبك\n\nرقم الطلب: ${order.orderNumber}\nالحالة: ${language === 'ar' ? statusInfo.nameAr : statusInfo.nameEn}\n\nشكراً من DAVA`;
    const phone = order.userPhone.replace('+', '');
    Linking.openURL(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`);
  };

  const renderOrder = ({ item }: any) => {
    const statusInfo = getStatusInfo(item.status);
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderTop}>
          <View>
            <Text style={styles.orderNum}>#{item.orderNumber}</Text>
            <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          </View>
          <TouchableOpacity
            style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20', borderColor: statusInfo.color }]}
            onPress={() => handleUpdateStatus(item.id, item.status)}
          >
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {language === 'ar' ? statusInfo.nameAr : statusInfo.nameEn}
            </Text>
            <MaterialIcons name="edit" size={12} color={statusInfo.color} />
          </TouchableOpacity>
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.customerName}>👤 {item.userName} · {item.userPhone}</Text>
          <Text style={styles.orderCity}>📍 {item.city} · {item.address}</Text>
          <Text style={styles.orderItems}>{item.items.length} {language === 'ar' ? 'منتجات' : 'items'} · {item.paymentMethod}</Text>
        </View>

        {/* Payment Screenshot */}
        {item.paymentScreenshot ? (
          <View style={styles.receiptSection}>
            <Text style={styles.receiptLabel}>{language === 'ar' ? 'إثبات الدفع:' : 'Payment Proof:'}</Text>
            <Image source={{ uri: item.paymentScreenshot }} style={styles.receiptThumb} />
          </View>
        ) : null}

        <View style={styles.orderFooter}>
          <Text style={styles.orderTotal}>{item.total.toLocaleString()} {language === 'ar' ? 'ريال' : 'YER'}</Text>
          <View style={styles.orderActions}>
            {item.paymentStatus !== 'paid' ? (
              <TouchableOpacity style={styles.paidBtn} onPress={() => handleMarkPaid(item)}>
                <MaterialIcons name="check-circle" size={14} color="#000" />
                <Text style={styles.paidBtnText}>{language === 'ar' ? 'مدفوع' : 'Paid'}</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.confirmedBadge}>
                <MaterialIcons name="verified" size={14} color={Colors.success} />
                <Text style={styles.confirmedText}>{language === 'ar' ? 'مدفوع' : 'Paid'}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.whatsappBtn} onPress={() => handleSendWhatsApp(item)}>
              <MaterialIcons name="send" size={14} color={Colors.primary} />
              <Text style={styles.whatsappBtnText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{language === 'ar' ? 'الطلبات' : 'Orders'}</Text>
        <Text style={styles.count}>{orders.length}</Text>
      </View>

      {/* Filter */}
      <View style={styles.filterBar}>
        {['all', 'pending', 'confirmed', 'shipped', 'delivered'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.activeFilterChip]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, filter === f && styles.activeFilterText]}>
              {f === 'all' ? (language === 'ar' ? 'الكل' : 'All') :
               (language === 'ar' ? ORDER_STATUSES.find(s => s.id === f)?.nameAr : ORDER_STATUSES.find(s => s.id === f)?.nameEn)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={sorted}
        renderItem={renderOrder}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>{language === 'ar' ? 'لا توجد طلبات' : 'No orders'}</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  count: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
  filterBar: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 10, gap: 8, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border },
  activeFilterChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  activeFilterText: { color: '#000', fontWeight: FontWeight.semibold },
  list: { padding: Spacing.md, gap: Spacing.sm },
  orderCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: 8 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNum: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary },
  orderDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1 },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  orderInfo: { gap: 2 },
  customerName: { fontSize: FontSize.sm, color: Colors.textPrimary },
  orderCity: { fontSize: FontSize.xs, color: Colors.textSecondary },
  orderItems: { fontSize: FontSize.xs, color: Colors.textMuted },
  receiptSection: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  receiptLabel: { fontSize: FontSize.xs, color: Colors.textSecondary },
  receiptThumb: { width: 60, height: 60, borderRadius: Radius.sm, resizeMode: 'cover' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: 8 },
  orderTotal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  orderActions: { flexDirection: 'row', gap: 8 },
  paidBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.success, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 6 },
  paidBtnText: { fontSize: FontSize.xs, color: '#000', fontWeight: FontWeight.bold },
  confirmedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  confirmedText: { fontSize: FontSize.xs, color: Colors.success },
  whatsappBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: Colors.borderGold, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 6 },
  whatsappBtnText: { fontSize: FontSize.xs, color: Colors.primary },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.base },
});
