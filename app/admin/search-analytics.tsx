import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';

export default function SearchAnalyticsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { getSearchAnalytics } = useData();

  const analytics = getSearchAnalytics();
  const maxCount = analytics[0]?.count || 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{language === 'ar' ? 'تحليل البحث' : 'Search Analytics'}</Text>
        <Text style={styles.count}>{analytics.length}</Text>
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryText}>
          {language === 'ar' ? 'أكثر الكلمات بحثاً (تنازلياً)' : 'Most searched terms (descending)'}
        </Text>
      </View>

      <FlatList
        data={analytics}
        keyExtractor={(_, idx) => String(idx)}
        contentContainerStyle={styles.list}
        renderItem={({ item, index }) => (
          <View style={styles.analyticsRow}>
            <View style={[styles.rankBadge, { backgroundColor: index < 3 ? Colors.primary : Colors.bgSurface }]}>
              <Text style={[styles.rankText, { color: index < 3 ? '#000' : Colors.textMuted }]}>{index + 1}</Text>
            </View>
            <View style={styles.queryInfo}>
              <Text style={styles.queryText}>{item.query}</Text>
              <View style={styles.barContainer}>
                <View style={[styles.barFill, { width: `${(item.count / maxCount) * 100}%` }]} />
              </View>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{item.count}</Text>
              <Text style={styles.countLabel}>{language === 'ar' ? 'مرة' : 'times'}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="search" size={60} color={Colors.textMuted} />
            <Text style={styles.emptyText}>{language === 'ar' ? 'لا توجد بيانات بحث بعد' : 'No search data yet'}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  count: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
  summary: { padding: Spacing.md, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  summaryText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  list: { padding: Spacing.md, gap: 8 },
  analyticsRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  rankBadge: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  rankText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  queryInfo: { flex: 1 },
  queryText: { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: FontWeight.medium, marginBottom: 4 },
  barContainer: { height: 4, backgroundColor: Colors.bgSurface, borderRadius: Radius.full, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: Radius.full },
  countBadge: { alignItems: 'center' },
  countText: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, color: Colors.primary },
  countLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.base },
});
