import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { t } from '@/constants/i18n';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, searchHistory, addSearchHistory } = useApp();
  const { products, recordSearch } = useData();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<typeof products>([]);
  const isRTL = language === 'ar';

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = products.filter(p =>
      p.isVisible && (
        p.nameAr.toLowerCase().includes(q) ||
        p.nameEn.toLowerCase().includes(q) ||
        p.descriptionAr.toLowerCase().includes(q) ||
        p.descriptionEn.toLowerCase().includes(q)
      )
    );
    setResults(filtered);
  }, [query, products]);

  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    addSearchHistory(q);
    recordSearch(q);
  };

  const renderResult = ({ item }: any) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.images[0] }} style={styles.resultImage} />
      <View style={styles.resultInfo}>
        <Text style={[styles.resultName, isRTL && styles.rtlText]} numberOfLines={2}>
          {language === 'ar' ? item.nameAr : item.nameEn}
        </Text>
        <View style={styles.ratingRow}>
          <MaterialIcons name="star" size={12} color={Colors.primary} />
          <Text style={styles.ratingText}>{item.rating}</Text>
        </View>
        <Text style={styles.resultPrice}>
          {item.price.toLocaleString()} {t('rial', language)}
        </Text>
      </View>
      <MaterialIcons name={isRTL ? 'chevron-left' : 'chevron-right'} size={20} color={Colors.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Bar */}
      <View style={styles.searchBar}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          <MaterialIcons name="search" size={20} color={Colors.textMuted} />
          <TextInput
            style={[styles.input, isRTL && styles.rtlInput]}
            value={query}
            onChangeText={setQuery}
            placeholder={t('searchPlaceholder', language)}
            placeholderTextColor={Colors.textMuted}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={() => handleSearch(query)}
          />
          {query.length > 0 ? (
            <TouchableOpacity onPress={() => setQuery('')}>
              <MaterialIcons name="clear" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {query.length === 0 ? (
        /* Search History */
        <View style={styles.historySection}>
          <Text style={[styles.historyTitle, isRTL && styles.rtlText]}>
            {language === 'ar' ? 'عمليات البحث الأخيرة' : 'Recent Searches'}
          </Text>
          {searchHistory.slice(0, 10).map((q, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.historyItem}
              onPress={() => { setQuery(q); handleSearch(q); }}
            >
              <MaterialIcons name="history" size={18} color={Colors.textMuted} />
              <Text style={styles.historyText}>{q}</Text>
              <MaterialIcons name={isRTL ? 'north-west' : 'north-east'} size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        /* Results */
        <FlatList
          data={results}
          renderItem={renderResult}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultsCount}>
              {results.length} {language === 'ar' ? 'نتيجة' : 'results'}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.noResults}>
              <MaterialIcons name="search-off" size={60} color={Colors.textMuted} />
              <Text style={styles.noResultsText}>{t('noResults', language)}</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  inputContainer: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.bgInput, borderRadius: Radius.full,
    paddingHorizontal: Spacing.md, height: 44,
  },
  input: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary },
  rtlInput: { textAlign: 'right' },
  historySection: { padding: Spacing.lg },
  historyTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: Spacing.sm },
  rtlText: { textAlign: 'right' },
  historyItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  historyText: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary },
  resultsList: { padding: Spacing.md },
  resultsCount: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.sm },
  resultItem: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: Spacing.sm, marginBottom: 8,
    borderWidth: 1, borderColor: Colors.border,
  },
  resultImage: { width: 70, height: 70, borderRadius: Radius.sm, resizeMode: 'cover' },
  resultInfo: { flex: 1, gap: 4 },
  resultName: { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: FontSize.xs, color: Colors.primary },
  resultPrice: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.bold },
  noResults: { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 12 },
  noResultsText: { fontSize: FontSize.base, color: Colors.textMuted },
});
