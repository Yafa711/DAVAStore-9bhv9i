import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { ORDER_STATUSES } from '@/constants/config';
import { t } from '@/constants/i18n';

const TRACKING_STEPS = [
  { status: 'pending', icon: 'receipt', labelAr: 'تم استلام الطلب', labelEn: 'Order Received' },
  { status: 'confirmed', icon: 'check-circle', labelAr: 'تم تأكيد الطلب', labelEn: 'Order Confirmed' },
  { status: 'processing', icon: 'inventory', labelAr: 'جاري التجهيز', labelEn: 'Processing' },
  { status: 'shipped', icon: 'local-shipping', labelAr: 'في الطريق إليك', labelEn: 'On the Way' },
  { status: 'delivered', icon: 'home', labelAr: 'تم التسليم', labelEn: 'Delivered' },
];

const STATUS_ORDER: Record<string, number> = {
  pending: 0, confirmed: 1, processing: 2, shipped: 3, delivered: 4, cancelled: -1,
};

export default function TrackOrderScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { orders } = useData();
  const [orderNumber, setOrderNumber] = useState('');
  const [foundOrder, setFoundOrder] = useState<any>(null);
  const [searched, setSearched] = useState(false);
  const isRTL = language === 'ar';

  const handleSearch = () => {
    const q = orderNumber.trim().replace('#', '');
    if (!q) return;
    const order = orders.find(o =>
      o.orderNumber.toLowerCase() === q.toLowerCase() ||
      o.orderNumber.toLowerCase().includes(q.toLowerCase())
    );
    setFoundOrder(order || null);
    setSearched(true);
  };

  const getStatusInfo = (status: string) => ORDER_STATUSES.find(s => s.id === status) || ORDER_STATUSES[0];

  const currentStepIndex = foundOrder ? STATUS_ORDER[foundOrder.status] : -1;
  const isCancelled = foundOrder?.status === 'cancelled';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={[styles.container]} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <LinearGradient colors={['#111', '#0A0A0A']} style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <MaterialIcons name="local-shipping" size={28} color={Colors.primary} />
            <Text style={styles.headerTitle}>
              {language === 'ar' ? 'تتبع الطلب' : 'Track Order'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {language === 'ar' ? 'أدخل رقم الطلب لتتبع حالته' : 'Enter order number to track its status'}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.content}>
          {/* Search Box */}
          <View style={styles.searchCard}>
            <Text style={[styles.searchLabel, isRTL && styles.rtlText]}>
              {language === 'ar' ? 'رقم الطلب' : 'Order Number'}
            </Text>
            <View style={styles.searchRow}>
              <TextInput
                style={[styles.searchInput, isRTL && styles.rtlInput]}
                value={orderNumber}
                onChangeText={setOrderNumber}
                placeholder={language === 'ar' ? 'مثال: ORD-123456' : 'e.g. ORD-123456'}
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              <TouchableOpacity style={styles.searchBtn} onPress={handleSearch} activeOpacity={0.85}>
                <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.searchBtnGradient}>
                  <MaterialIcons name="search" size={22} color="#000" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
            <Text style={styles.searchHint}>
              {language === 'ar'
                ? 'يمكنك إيجاد رقم الطلب في صفحة طلباتي'
                : 'You can find the order number in My Orders page'}
            </Text>
          </View>

          {/* Result */}
          {searched ? (
            foundOrder ? (
              <View style={styles.resultCard}>
                {/* Order Header */}
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderNum}>#{foundOrder.orderNumber}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(foundOrder.createdAt).toLocaleDateString(language === 'ar' ? 'ar-YE' : 'en-US', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </Text>
                  </View>
                  <View style={[
                    styles.statusPill,
                    { backgroundColor: getStatusInfo(foundOrder.status).color + '22', borderColor: getStatusInfo(foundOrder.status).color }
                  ]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusInfo(foundOrder.status).color }]} />
                    <Text style={[styles.statusPillText, { color: getStatusInfo(foundOrder.status).color }]}>
                      {language === 'ar' ? getStatusInfo(foundOrder.status).nameAr : getStatusInfo(foundOrder.status).nameEn}
                    </Text>
                  </View>
                </View>

                {/* Tracking Timeline */}
                {!isCancelled ? (
                  <View style={styles.timeline}>
                    {TRACKING_STEPS.map((step, idx) => {
                      const isDone = idx <= currentStepIndex;
                      const isActive = idx === currentStepIndex;
                      return (
                        <View key={step.status} style={styles.timelineItem}>
                          {/* Connector Line */}
                          {idx < TRACKING_STEPS.length - 1 ? (
                            <View style={[styles.connector, isDone && idx < currentStepIndex && styles.connectorDone]} />
                          ) : null}

                          {/* Step Icon */}
                          <View style={[
                            styles.stepIcon,
                            isDone && styles.stepIconDone,
                            isActive && styles.stepIconActive,
                          ]}>
                            {isDone ? (
                              <MaterialIcons
                                name={isActive ? step.icon as any : 'check'}
                                size={isActive ? 18 : 16}
                                color={isActive ? '#000' : Colors.success}
                              />
                            ) : (
                              <MaterialIcons name={step.icon as any} size={16} color={Colors.textMuted} />
                            )}
                          </View>

                          {/* Step Label */}
                          <View style={styles.stepLabel}>
                            <Text style={[
                              styles.stepText,
                              isDone && styles.stepTextDone,
                              isActive && styles.stepTextActive,
                            ]}>
                              {language === 'ar' ? step.labelAr : step.labelEn}
                            </Text>
                            {isActive ? (
                              <View style={styles.activePulse}>
                                <Text style={styles.activePulseText}>
                                  {language === 'ar' ? '← الحالة الحالية' : 'Current Status →'}
                                </Text>
                              </View>
                            ) : null}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.cancelledBox}>
                    <MaterialIcons name="cancel" size={48} color={Colors.error} />
                    <Text style={styles.cancelledText}>
                      {language === 'ar' ? 'تم إلغاء هذا الطلب' : 'This order has been cancelled'}
                    </Text>
                  </View>
                )}

                {/* Order Details */}
                <View style={styles.orderDetails}>
                  <Text style={styles.detailsTitle}>
                    {language === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}
                  </Text>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="person" size={16} color={Colors.primary} />
                    <Text style={styles.detailLabel}>{language === 'ar' ? 'العميل:' : 'Customer:'}</Text>
                    <Text style={styles.detailValue}>{foundOrder.userName}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="location-on" size={16} color={Colors.primary} />
                    <Text style={styles.detailLabel}>{language === 'ar' ? 'المدينة:' : 'City:'}</Text>
                    <Text style={styles.detailValue}>{foundOrder.city}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="payment" size={16} color={Colors.primary} />
                    <Text style={styles.detailLabel}>{language === 'ar' ? 'الدفع:' : 'Payment:'}</Text>
                    <View style={[
                      styles.paymentBadge,
                      { backgroundColor: foundOrder.paymentStatus === 'paid' ? Colors.success + '22' : Colors.warning + '22' }
                    ]}>
                      <Text style={[
                        styles.paymentBadgeText,
                        { color: foundOrder.paymentStatus === 'paid' ? Colors.success : Colors.warning }
                      ]}>
                        {foundOrder.paymentStatus === 'paid'
                          ? (language === 'ar' ? '✓ مدفوع' : '✓ Paid')
                          : (language === 'ar' ? '⏳ قيد المراجعة' : '⏳ Pending')}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <MaterialIcons name="shopping-bag" size={16} color={Colors.primary} />
                    <Text style={styles.detailLabel}>{language === 'ar' ? 'المنتجات:' : 'Items:'}</Text>
                    <Text style={styles.detailValue}>{foundOrder.items.length}</Text>
                  </View>
                  <View style={[styles.detailRow, styles.totalRow]}>
                    <MaterialIcons name="monetization-on" size={16} color={Colors.primary} />
                    <Text style={styles.detailLabel}>{t('total', language)}:</Text>
                    <Text style={styles.totalValue}>{foundOrder.total.toLocaleString()} {t('rial', language)}</Text>
                  </View>
                </View>

                {/* Items List */}
                <View style={styles.itemsList}>
                  <Text style={styles.detailsTitle}>
                    {language === 'ar' ? 'المنتجات المطلوبة' : 'Ordered Items'}
                  </Text>
                  {foundOrder.items.map((item: any, idx: number) => (
                    <View key={idx} style={styles.itemRow}>
                      <View style={styles.itemDot} />
                      <Text style={styles.itemName} numberOfLines={1}>{item.productName}</Text>
                      <Text style={styles.itemQty}>x{item.quantity}</Text>
                      <Text style={styles.itemPrice}>{(item.price * item.quantity).toLocaleString()}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.notFoundCard}>
                <MaterialIcons name="search-off" size={64} color={Colors.textMuted} />
                <Text style={styles.notFoundTitle}>
                  {language === 'ar' ? 'لم يُعثر على الطلب' : 'Order Not Found'}
                </Text>
                <Text style={styles.notFoundSubtitle}>
                  {language === 'ar'
                    ? `لا يوجد طلب برقم "${orderNumber}"، تأكد من الرقم وحاول مجدداً`
                    : `No order found with number "${orderNumber}", please check and try again`}
                </Text>
                <TouchableOpacity style={styles.tryAgainBtn} onPress={() => { setOrderNumber(''); setSearched(false); }}>
  <Text style={styles.tryAgainText}>{language === 'ar' ? 'حاول مجدداً' : 'Try Again'}</Text>
</TouchableOpacity>
              </View>
            )
          ) : null}

          {/* Helper */}
          {!searched ? (
            <View style={styles.helperCard}>
              <MaterialIcons name="info-outline" size={20} color={Colors.primary} />
              <Text style={[styles.helperText, isRTL && styles.rtlText]}>
                {language === 'ar'
                  ? 'يمكنك تتبع طلبك بإدخال رقم الطلب الموجود في رسالة تأكيد الطلب أو في صفحة "طلباتي"'
                  : 'Track your order by entering the order number found in your order confirmation or in "My Orders" page'}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl,
    alignItems: 'center', gap: 6,
    borderBottomWidth: 1, borderBottomColor: Colors.borderGold,
  },
  backBtn: {
    position: 'absolute', top: 0, left: Spacing.lg,
    width: 40, height: 40, justifyContent: 'center',
  },
  headerCenter: { alignItems: 'center', gap: 4 },
  headerTitle: { fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: Colors.primary, letterSpacing: 1 },
  headerSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center' },
  content: { padding: Spacing.lg, gap: Spacing.lg },

  // Search
  searchCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg,
    borderWidth: 1, borderColor: Colors.borderGold, gap: Spacing.sm,
  },
  searchLabel: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  rtlText: { textAlign: 'right' },
  searchRow: { flexDirection: 'row', gap: 8 },
  searchInput: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    backgroundColor: Colors.bgInput, paddingHorizontal: Spacing.md, paddingVertical: 14,
    fontSize: FontSize.md, color: Colors.textPrimary, letterSpacing: 1,
  },
  rtlInput: { textAlign: 'right' },
  searchBtn: { borderRadius: Radius.md, overflow: 'hidden' },
  searchBtnGradient: { width: 52, height: 52, justifyContent: 'center', alignItems: 'center' },
  searchHint: { fontSize: FontSize.xs, color: Colors.textMuted },

  // Result Card
  resultCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.border, overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: Spacing.lg, borderBottomWidth: 1, borderBottomColor: Colors.divider,
    backgroundColor: Colors.bgSurface,
  },
  orderNum: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  orderDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  statusPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.full, borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusPillText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },

  // Timeline
  timeline: { padding: Spacing.lg, gap: 0 },
  timelineItem: {
    flexDirection: 'row', alignItems: 'flex-start',
    gap: Spacing.md, minHeight: 56,
  },
  connector: {
    position: 'absolute', left: 19, top: 40, width: 2,
    height: 28, backgroundColor: Colors.border, zIndex: 0,
  },
  connectorDone: { backgroundColor: Colors.success },
  stepIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.bgSurface, borderWidth: 2, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center', zIndex: 1,
  },
  stepIconDone: { borderColor: Colors.success, backgroundColor: Colors.success + '22' },
  stepIconActive: { borderColor: Colors.primary, backgroundColor: Colors.primary, transform: [{ scale: 1.1 }] },
  stepLabel: { flex: 1, paddingTop: 8, gap: 4 },
  stepText: { fontSize: FontSize.sm, color: Colors.textMuted },
  stepTextDone: { color: Colors.success },
  stepTextActive: { color: Colors.primary, fontWeight: FontWeight.bold, fontSize: FontSize.base },
  activePulse: {
    backgroundColor: Colors.primary + '22', borderRadius: Radius.sm,
    paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start',
  },
  activePulseText: { fontSize: 10, color: Colors.primary, fontWeight: FontWeight.semibold },

  // Cancelled
  cancelledBox: {
    alignItems: 'center', padding: Spacing.xl, gap: 12,
    borderTopWidth: 1, borderTopColor: Colors.divider,
  },
  cancelledText: { fontSize: FontSize.base, color: Colors.error, fontWeight: FontWeight.medium, textAlign: 'center' },

  // Order Details
  orderDetails: {
    padding: Spacing.lg, gap: 10,
    borderTopWidth: 1, borderTopColor: Colors.divider, backgroundColor: Colors.bgSurface,
  },
  detailsTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, width: 70 },
  detailValue: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium, flex: 1 },
  paymentBadge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  paymentBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  totalRow: { paddingTop: 8, borderTopWidth: 1, borderTopColor: Colors.divider, marginTop: 4 },
  totalValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary, flex: 1 },

  // Items
  itemsList: { padding: Spacing.lg, gap: 8, borderTopWidth: 1, borderTopColor: Colors.divider },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  itemName: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  itemQty: { fontSize: FontSize.sm, color: Colors.textMuted },
  itemPrice: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.medium },

  // Not Found
  notFoundCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.xl,
    alignItems: 'center', gap: 12, borderWidth: 1, borderColor: Colors.border,
  },
  notFoundTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  notFoundSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22 },
  tryAgainBtn: {
    marginTop: 8, paddingHorizontal: 24, paddingVertical: 10,
    backgroundColor: Colors.bgSurface, borderRadius: Radius.full,
    borderWidth: 1, borderColor: Colors.borderGold,
  },
  tryAgainText: { color: Colors.primary, fontWeight: FontWeight.semibold },

  // Helper
  helperCard: {
    flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-start',
    backgroundColor: Colors.primary + '11', borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.borderGold,
  },
  helperText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 22 },
});
