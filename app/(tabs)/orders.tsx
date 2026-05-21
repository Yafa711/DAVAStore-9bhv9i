import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, AppState,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { useAlert } from '@/template';
import { ORDER_STATUSES } from '@/constants/config';

const POLL_INTERVAL = 30000; // 30 seconds

export default function OrdersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, user } = useApp();
  const { orders, refreshOrders } = useData();
  const { showAlert } = useAlert();

  const isRTL = language === 'ar';
  const prevOrdersRef = useRef<typeof orders>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef(AppState.currentState);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const myOrders = user
    ? orders.filter(o => o.userId === user.id).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    : [];

  // ── Polling ──────────────────────────────────────────────
  const checkForUpdates = async () => {
    try {
      const prevOrders = prevOrdersRef.current;
      await refreshOrders();
      setLastUpdated(new Date());

      // Detect status changes
      const currentMyOrders = prevOrders.filter(o => o.userId === user?.id);
      currentMyOrders.forEach(prev => {
        const updated = orders.find(o => o.id === prev.id);
        if (updated && updated.status !== prev.status) {
          const st = ORDER_STATUSES.find(s => s.id === updated.status);
          showAlert(
            isRTL ? '🔔 تحديث طلبك' : '🔔 Order Update',
            isRTL
              ? `طلبك #${updated.orderNumber} أصبح: ${st?.nameAr || updated.status}`
              : `Order #${updated.orderNumber} is now: ${st?.nameEn || updated.status}`
          );
        }
      });
    } catch {
      // Silent fail
    }
  };

  const startPolling = () => {
    stopPolling();
    intervalRef.current = setInterval(checkForUpdates, POLL_INTERVAL);
  };

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (user) {
      startPolling();
    }
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && appStateRef.current !== 'active' && user) {
        checkForUpdates();
        startPolling();
      } else if (state !== 'active') {
        stopPolling();
      }
      appStateRef.current = state;
    });
    return () => {
      stopPolling();
      sub.remove();
    };
  }, [user]);

  // Track previous orders for comparison
  useEffect(() => {
    prevOrdersRef.current = orders;
  }, [orders]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await checkForUpdates();
    setRefreshing(false);
  };

  const getStatus = (id: string) => ORDER_STATUSES.find(s => s.id === id) || ORDER_STATUSES[0];

  const renderOrder = ({ item }: any) => {
    const st = getStatus(item.status);
    return (
      <View style={styles.orderCard}>
        <View style={styles.orderTop}>
          <View>
            <Text style={styles.orderNum}>#{item.orderNumber}</Text>
            <Text style={styles.orderDate}>{new Date(item.createdAt).toLocaleDateString(isRTL ? 'ar' : 'en')}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: st.color + '20', borderColor: st.color }]}>
            <View style={[styles.statusDot, { backgroundColor: st.color }]} />
            <Text style={[styles.statusTxt, { color: st.color }]}>
              {isRTL ? st.nameAr : st.nameEn}
            </Text>
          </View>
        </View>

        <View style={styles.itemsRow}>
          {item.items.slice(0, 3).map((i: any, idx: number) => (
            <Image
              key={idx}
              source={{ uri: i.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=100' }}
              style={styles.itemThumb}
              contentFit="cover"
            />
          ))}
          {item.items.length > 3 ? (
            <View style={styles.moreThumb}>
              <Text style={styles.moreTxt}>+{item.items.length - 3}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.totalLabel}>{isRTL ? 'الإجمالي' : 'Total'}</Text>
            <Text style={styles.totalVal}>{item.total.toLocaleString()} {isRTL ? 'ريال' : 'YER'}</Text>
          </View>
          <View style={styles.payBadge}>
            <MaterialIcons
              name={item.paymentStatus === 'paid' ? 'check-circle' : 'pending'}
              size={14}
              color={item.paymentStatus === 'paid' ? Colors.success : Colors.warning}
            />
            <Text style={[styles.payTxt, { color: item.paymentStatus === 'paid' ? Colors.success : Colors.warning }]}>
              {item.paymentStatus === 'paid'
                ? (isRTL ? 'مدفوع' : 'Paid')
                : (isRTL ? 'قيد المراجعة' : 'Pending')}
            </Text>
          </View>
        </View>

        {/* Status Timeline */}
        <View style={styles.timeline}>
          {ORDER_STATUSES.filter(s => s.id !== 'cancelled').map((s, idx, arr) => {
            const statusIdx = arr.findIndex(x => x.id === item.status);
            const isCompleted = idx <= statusIdx;
            return (
              <React.Fragment key={s.id}>
                <View style={[styles.timelineDot, { backgroundColor: isCompleted ? s.color : Colors.border }]} />
                {idx < arr.length - 1 ? (
                  <View style={[styles.timelineLine, { backgroundColor: idx < statusIdx ? Colors.primary : Colors.border }]} />
                ) : null}
              </React.Fragment>
            );
          })}
        </View>
        <View style={styles.timelineLabels}>
          {ORDER_STATUSES.filter(s => s.id !== 'cancelled').map(s => (
            <Text key={s.id} style={styles.timelineLabel} numberOfLines={1}>
              {isRTL ? s.nameAr.split(' ')[0] : s.nameEn.split(' ')[0]}
            </Text>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#152A1E', '#0D1E16']} style={styles.header}>
        <Text style={styles.headerTitle}>{isRTL ? 'طلباتي' : 'My Orders'}</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.refreshBtn} onPress={handleManualRefresh} disabled={refreshing}>
            <MaterialIcons
              name="refresh"
              size={16}
              color={refreshing ? Colors.textMuted : Colors.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.trackBtn} onPress={() => router.push('/track/index')}>
            <MaterialIcons name="my-location" size={16} color="#0D1E16" />
            <Text style={styles.trackBtnTxt}>{isRTL ? 'تتبع طلب' : 'Track'}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Polling indicator */}
      {user ? (
        <View style={styles.pollBar}>
          <MaterialIcons name="sync" size={12} color={Colors.textMuted} />
          <Text style={styles.pollTxt}>
            {isRTL
              ? `آخر تحديث: ${lastUpdated.toLocaleTimeString('ar')} • يتحدث كل 30 ثانية`
              : `Last sync: ${lastUpdated.toLocaleTimeString()} • Updates every 30s`}
          </Text>
        </View>
      ) : null}

      {!user ? (
        <View style={styles.empty}>
          <MaterialIcons name="lock-outline" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTxt}>{isRTL ? 'سجل دخول لعرض طلباتك' : 'Login to view your orders'}</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/auth/login')}>
            <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.loginBtnGrad}>
              <Text style={styles.loginBtnTxt}>{isRTL ? 'تسجيل الدخول' : 'Sign In'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : myOrders.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="receipt-long" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTxt}>{isRTL ? 'لا توجد طلبات بعد' : 'No orders yet'}</Text>
          <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/(tabs)/categories')}>
            <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.loginBtnGrad}>
              <Text style={styles.loginBtnTxt}>{isRTL ? 'تسوقي الآن' : 'Shop Now'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={myOrders}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.list}
          renderItem={renderOrder}
          showsVerticalScrollIndicator={false}
          onRefresh={handleManualRefresh}
          refreshing={refreshing}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refreshBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  trackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 8,
  },
  trackBtnTxt: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#0D1E16' },
  pollBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: Spacing.lg, paddingVertical: 5,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  pollTxt: { fontSize: 10, color: Colors.textMuted },
  list: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 30 },
  orderCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNum: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary },
  orderDate: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusTxt: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  itemsRow: { flexDirection: 'row', gap: 6 },
  itemThumb: { width: 52, height: 52, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border },
  moreThumb: {
    width: 52, height: 52, borderRadius: Radius.sm, backgroundColor: Colors.bgSurface,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  moreTxt: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.bold },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  totalLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  totalVal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  payBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  payTxt: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  timeline: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  timelineDot: { width: 10, height: 10, borderRadius: 5 },
  timelineLine: { flex: 1, height: 2 },
  timelineLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  timelineLabel: { fontSize: 9, color: Colors.textMuted, flex: 1, textAlign: 'center' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.lg, paddingHorizontal: Spacing.xl },
  emptyTxt: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  loginBtn: { borderRadius: Radius.full, overflow: 'hidden', width: '60%' },
  loginBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  loginBtnTxt: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#0D1E16' },
});
