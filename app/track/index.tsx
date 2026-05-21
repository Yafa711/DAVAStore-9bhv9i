import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { ORDER_STATUSES } from '@/constants/config';

export default function TrackScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { orders } = useData();
  const [orderNum, setOrderNum] = useState('');
  const [found, setFound] = useState<any>(null);
  const [searched, setSearched] = useState(false);
  const isRTL = language === 'ar';

  const handleTrack = () => {
    const order = orders.find(o => o.orderNumber.toLowerCase() === orderNum.toLowerCase().trim());
    setFound(order || null);
    setSearched(true);
  };

  const getStatus = (id: string) => ORDER_STATUSES.find(s => s.id === id) || ORDER_STATUSES[0];
  const statusSteps = ORDER_STATUSES.filter(s => s.id !== 'cancelled');

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isRTL ? 'تتبع الطلب' : 'Track Order'}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.searchCard}>
          <MaterialIcons name="my-location" size={32} color={Colors.primary} style={{ alignSelf: 'center' }} />
          <Text style={[styles.searchTitle, isRTL && styles.rtl]}>
            {isRTL ? 'أدخل رقم طلبك للتتبع' : 'Enter your order number to track'}
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, isRTL && styles.rtl]}
              value={orderNum}
              onChangeText={setOrderNum}
              placeholder="DAVA12345678"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.trackBtn} onPress={handleTrack}>
              <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.trackBtnGrad}>
                <Text style={styles.trackBtnTxt}>{isRTL ? 'تتبع' : 'Track'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {searched && !found ? (
          <View style={styles.notFound}>
            <MaterialIcons name="search-off" size={64} color={Colors.textMuted} />
            <Text style={styles.notFoundTxt}>
              {isRTL ? 'لم يتم العثور على الطلب' : 'Order not found'}
            </Text>
            <Text style={styles.notFoundSub}>
              {isRTL ? 'تحقق من رقم الطلب وحاول مجدداً' : 'Check the order number and try again'}
            </Text>
          </View>
        ) : found ? (
          <View style={styles.orderCard}>
            {/* Header */}
            <View style={styles.orderHead}>
              <View>
                <Text style={styles.orderNum}>#{found.orderNumber}</Text>
                <Text style={styles.orderDate}>{new Date(found.createdAt).toLocaleDateString(isRTL ? 'ar' : 'en')}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatus(found.status).color + '22', borderColor: getStatus(found.status).color }]}>
                <Text style={[styles.statusTxt, { color: getStatus(found.status).color }]}>
                  {isRTL ? getStatus(found.status).nameAr : getStatus(found.status).nameEn}
                </Text>
              </View>
            </View>

            {/* Timeline */}
            <View style={styles.timeline}>
              {statusSteps.map((step, idx) => {
                const currentIdx = statusSteps.findIndex(s => s.id === found.status);
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <View key={step.id} style={styles.timelineStep}>
                    <View style={styles.timelineLeft}>
                      <View style={[
                        styles.timelineDot,
                        { backgroundColor: isCompleted ? step.color : Colors.border },
                        isCurrent && styles.timelineDotActive,
                      ]}>
                        {isCompleted ? <MaterialIcons name="check" size={10} color="#fff" /> : null}
                      </View>
                      {idx < statusSteps.length - 1 ? (
                        <View style={[styles.timelineLine, { backgroundColor: idx < currentIdx ? Colors.primary : Colors.border }]} />
                      ) : null}
                    </View>
                    <View style={styles.timelineContent}>
                      <Text style={[styles.stepName, isCurrent && { color: step.color, fontWeight: FontWeight.bold }]}>
                        {isRTL ? step.nameAr : step.nameEn}
                      </Text>
                      {isCurrent ? (
                        <Text style={styles.stepSub}>{isRTL ? '• الحالة الحالية' : '• Current status'}</Text>
                      ) : null}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Info */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <MaterialIcons name="person" size={16} color={Colors.textMuted} />
                <Text style={styles.infoTxt}>{found.userName}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="location-on" size={16} color={Colors.textMuted} />
                <Text style={styles.infoTxt}>{found.city} · {found.address}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="payments" size={16} color={Colors.textMuted} />
                <Text style={styles.infoTxt}>
                  {found.total.toLocaleString()} {isRTL ? 'ريال' : 'YER'} ·{' '}
                  <Text style={{ color: found.paymentStatus === 'paid' ? Colors.success : Colors.warning }}>
                    {found.paymentStatus === 'paid' ? (isRTL ? 'مدفوع' : 'Paid') : (isRTL ? 'قيد المراجعة' : 'Pending')}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  content: { padding: Spacing.lg, gap: Spacing.lg },
  searchCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg, gap: 12, borderWidth: 1, borderColor: Colors.borderGold },
  searchTitle: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  rtl: { textAlign: 'right' },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.bgInput, paddingHorizontal: 12, paddingVertical: 12, fontSize: FontSize.base, color: Colors.textPrimary, letterSpacing: 1 },
  trackBtn: { borderRadius: Radius.md, overflow: 'hidden' },
  trackBtnGrad: { paddingHorizontal: 20, paddingVertical: 12 },
  trackBtnTxt: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#0D1E16' },
  notFound: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  notFoundTxt: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  notFoundSub: { fontSize: FontSize.base, color: Colors.textMuted, textAlign: 'center' },
  orderCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, gap: 16 },
  orderHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNum: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  orderDate: { fontSize: FontSize.xs, color: Colors.textMuted },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  statusTxt: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  timeline: { gap: 0 },
  timelineStep: { flexDirection: 'row', gap: 12 },
  timelineLeft: { alignItems: 'center', width: 22 },
  timelineDot: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  timelineDotActive: { shadowColor: Colors.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.6, shadowRadius: 6, elevation: 4 },
  timelineLine: { width: 2, flex: 1, minHeight: 20, marginVertical: 2 },
  timelineContent: { flex: 1, paddingBottom: 16 },
  stepName: { fontSize: FontSize.sm, color: Colors.textSecondary },
  stepSub: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 2 },
  infoSection: { gap: 10, borderTopWidth: 1, borderTopColor: Colors.divider, paddingTop: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  infoTxt: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
});
