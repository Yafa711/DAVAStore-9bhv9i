import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { ORDER_STATUSES } from '@/constants/config';
import { t } from '@/constants/i18n';

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, user } = useApp();
  const { orders } = useData();
  const [trackingNumber, setTrackingNumber] = useState('');

  const userOrders = orders.filter(o => o.userId === user?.id);
  const isRTL = language === 'ar';

  const getStatusInfo = (status: string) => {
    return ORDER_STATUSES.find(s => s.id === status) || ORDER_STATUSES[0];
  };

  const renderOrder = ({ item }: any) => {
    const statusInfo = getStatusInfo(item.status);
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={[styles.orderNum, isRTL && styles.rtlText]}>
              #{item.orderNumber}
            </Text>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString(language === 'ar' ? 'ar-YE' : 'en-US')}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + '20', borderColor: statusInfo.color }]}>
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {language === 'ar' ? statusInfo.nameAr : statusInfo.nameEn}
            </Text>
          </View>
        </View>

        <View style={styles.orderDivider} />

        <View style={styles.orderItems}>
          {item.items.map((oi: any, idx: number) => (
            <View key={idx} style={styles.orderItemRow}>
              <Text style={styles.orderItemName} numberOfLines={1}>
                {oi.productName}
              </Text>
              <Text style={styles.orderItemQty}>x{oi.quantity}</Text>
              <Text style={styles.orderItemPrice}>
                {(oi.price * oi.quantity).toLocaleString()} {t('rial', language)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.orderTotalLabel}>{t('total', language)}</Text>
            <Text style={styles.orderTotal}>
              {item.total.toLocaleString()} {t('rial', language)}
            </Text>
          </View>
          <View style={styles.paymentBadge}>
            <MaterialIcons
              name={item.paymentStatus === 'paid' ? 'check-circle' : 'pending'}
              size={14}
              color={item.paymentStatus === 'paid' ? Colors.success : Colors.warning}
            />
            <Text style={[styles.paymentText, { color: item.paymentStatus === 'paid' ? Colors.success : Colors.warning }]}>
              {item.paymentStatus === 'paid' ? t('paid', language) : t('unpaid', language)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('myOrders', language)}</Text>
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => router.push('/track/index')}
        >
          <MaterialIcons name="local-shipping" size={16} color="#000" />
          <Text style={styles.trackBtnText}>
            {language === 'ar' ? 'تتبع' : 'Track'}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={userOrders}
        renderItem={renderOrder}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="receipt-long" size={72} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>{t('noOrders', language)}</Text>
            <Text style={styles.emptySubtitle}>
              {language === 'ar' ? 'لم تقم بأي طلب بعد' : 'You have no orders yet'}
            </Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)/categories')}>
              <Text style={styles.shopBtnText}>{t('shopNow', language)}</Text>
            </TouchableOpacity>
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
  trackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  trackBtnText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#000' },
  list: { padding: Spacing.md, gap: Spacing.md },
  orderCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.md,
  },
  orderNum: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary },
  rtlText: { textAlign: 'right' },
  orderDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: Radius.full, borderWidth: 1,
  },
  statusText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  orderDivider: { height: 1, backgroundColor: Colors.divider },
  orderItems: { padding: Spacing.md, gap: 6 },
  orderItemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  orderItemName: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  orderItemQty: { fontSize: FontSize.sm, color: Colors.textMuted },
  orderItemPrice: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  orderFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.md, backgroundColor: Colors.bgSurface,
  },
  orderTotalLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  orderTotal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  paymentBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  paymentText: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  emptySubtitle: { fontSize: FontSize.base, color: Colors.textSecondary },
  shopBtn: {
    marginTop: 8, paddingHorizontal: Spacing.xl, paddingVertical: 12,
    backgroundColor: Colors.primary, borderRadius: Radius.full,
  },
  shopBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#000' },
});
