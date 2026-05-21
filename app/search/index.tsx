import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { t } from '@/constants/i18n';

const { width } = Dimensions.get('window');
const CARD_W = (width - Spacing.lg * 2 - Spacing.sm) / 2;

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, searchHistory, addSearchHistory, favorites, toggleFavorite } = useApp();
  const { products, recordSearch } = useData();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);
  const isRTL = language === 'ar';

  const handleSearch = async (q = query) => {
    if (!q.trim()) return;
    const res = products.filter(p =>
      p.isVisible && (
        p.nameAr.includes(q) ||
        p.nameEn.toLowerCase().includes(q.toLowerCase()) ||
        p.descriptionAr.includes(q) ||
        p.descriptionEn.toLowerCase().includes(q.toLowerCase())
      )
    );
    setResults(res);
    setSearched(true);
    addSearchHistory(q.trim());
    await recordSearch(q.trim());
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search bar */}
      <View style={styles.searchHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={[styles.searchInput, isRTL && styles.rtl]}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => handleSearch()}
            placeholder={t('searchPlaceholder', language)}
            placeholderTextColor={Colors.textMuted}
            autoFocus
            returnKeyType="search"
          />
          {query ? (
            <TouchableOpacity onPress={() => { setQuery(''); setSearched(false); setResults([]); }}>
              <MaterialIcons name="close" size={18} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => handleSearch()}
        >
          <Text style={styles.searchBtnTxt}>{isRTL ? 'بحث' : 'Search'}</Text>
        </TouchableOpacity>
      </View>

      {!searched ? (
        <View style={styles.historySection}>
          {searchHistory.length > 0 ? (
            <>
              <Text style={styles.historyTitle}>{isRTL ? 'عمليات البحث الأخيرة' : 'Recent Searches'}</Text>
              {searchHistory.slice(0, 8).map((h, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.historyItem}
                  onPress={() => { setQuery(h); handleSearch(h); }}
                >
                  <MaterialIcons name="history" size={16} color={Colors.textMuted} />
                  <Text style={styles.historyTxt}>{h}</Text>
                </TouchableOpacity>
              ))}
            </>
          ) : (
            <View style={styles.empty}>
              <MaterialIcons name="search" size={64} color={Colors.textMuted} />
              <Text style={styles.emptyTxt}>{isRTL ? 'ابحثي عن ما تريدين' : 'Search for what you want'}</Text>
            </View>
          )}
        </View>
      ) : results.length === 0 ? (
        <View style={styles.empty}>
          <MaterialIcons name="search-off" size={64} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>{isRTL ? 'لا توجد نتائج' : 'No Results'}</Text>
          <Text style={styles.emptyTxt}>{isRTL ? `لا يوجد منتج يطابق "${query}"` : `No products match "${query}"`}</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={i => i.id}
          numColumns={2}
          columnWrapperStyle={styles.colWrap}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={styles.resultsCount}>
              {results.length} {isRTL ? 'نتيجة' : 'results'} {isRTL ? 'لـ' : 'for'} "{query}"
            </Text>
          }
          renderItem={({ item }) => {
            const isFav = favorites.includes(item.id);
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
              >
                <View style={styles.cardImgWrap}>
                  <Image
                    source={{ uri: item.images[0] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400' }}
                    style={styles.cardImg}
                    contentFit="cover"
                  />
                  <TouchableOpacity style={styles.favBtn} onPress={() => toggleFavorite(item.id)}>
                    <MaterialIcons name={isFav ? 'favorite' : 'favorite-border'} size={16} color={isFav ? Colors.error : Colors.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.cardBody}>
                  <Text style={[styles.cardName, isRTL && styles.rtl]} numberOfLines={2}>
                    {isRTL ? item.nameAr : item.nameEn}
                  </Text>
                  <Text style={styles.cardPrice}>{item.price.toLocaleString()} {isRTL ? 'ريال' : 'YER'}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  searchHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  backBtn: { padding: 4 },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.bgSurface, borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary },
  rtl: { textAlign: 'right' },
  searchBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchBtnTxt: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#0D1E16' },
  historySection: { padding: Spacing.lg, gap: 4 },
  historyTitle: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  historyItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  historyTxt: { fontSize: FontSize.base, color: Colors.textSecondary },
  resultsCount: { fontSize: FontSize.sm, color: Colors.textMuted, marginBottom: Spacing.sm, paddingHorizontal: Spacing.md },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingVertical: 80 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  emptyTxt: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', paddingHorizontal: Spacing.xl },
  grid: { padding: Spacing.md, paddingBottom: 30 },
  colWrap: { gap: Spacing.sm, marginBottom: Spacing.sm },
  card: { width: CARD_W, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, ...Shadow.sm },
  cardImgWrap: { height: 180, position: 'relative' },
  cardImg: { width: '100%', height: '100%' },
  favBtn: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: Colors.bg + 'CC', borderRadius: Radius.full,
    width: 28, height: 28, justifyContent: 'center', alignItems: 'center',
  },
  cardBody: { padding: 8, gap: 4 },
  cardName: { fontSize: FontSize.sm, color: Colors.textPrimary, lineHeight: 18 },
  cardPrice: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary },
});
