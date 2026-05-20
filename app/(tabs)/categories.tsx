import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Image, TextInput,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { CATEGORIES } from '@/constants/config';
import { t } from '@/constants/i18n';

const SORT_OPTIONS = [
  { id: 'default', labelAr: 'الافتراضي', labelEn: 'Default' },
  { id: 'price_asc', labelAr: 'السعر: الأقل أولاً', labelEn: 'Price: Low to High' },
  { id: 'price_desc', labelAr: 'السعر: الأعلى أولاً', labelEn: 'Price: High to Low' },
  { id: 'rating', labelAr: 'الأعلى تقييماً', labelEn: 'Highest Rated' },
  { id: 'newest', labelAr: 'الأحدث', labelEn: 'Newest' },
  { id: 'best_seller', labelAr: 'الأكثر مبيعاً', labelEn: 'Best Selling' },
];

export default function CategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string }>();
  const { language } = useApp();
  const { products } = useData();

  const [selectedCategory, setSelectedCategory] = useState(params.category || 'all');
  const [sortBy, setSortBy] = useState('default');
  const [showSort, setShowSort] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const isRTL = language === 'ar';

  const filteredProducts = products
    .filter(p => p.isVisible)
    .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
    .filter(p => {
      if (priceMin && p.price < parseInt(priceMin)) return false;
      if (priceMax && p.price > parseInt(priceMax)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'best_seller') return b.sold - a.sold;
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return 0;
    });

  const renderProduct = ({ item }: any) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
      activeOpacity={0.85}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.images[0] }} style={styles.productImage} />
        {item.isOffer && item.offerPercent ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{item.offerPercent}%</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.productInfo}>
        <Text style={[styles.productName, isRTL && styles.rtlText]} numberOfLines={2}>
          {language === 'ar' ? item.nameAr : item.nameEn}
        </Text>
        <View style={styles.ratingRow}>
          {[1,2,3,4,5].map(s => (
            <MaterialIcons key={s} name="star" size={10} color={s <= Math.round(item.rating) ? Colors.primary : Colors.border} />
          ))}
          <Text style={styles.ratingCount}>({item.reviewCount})</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price.toLocaleString()}</Text>
          <Text style={styles.currency}> {t('rial', language)}</Text>
        </View>
        {item.originalPrice ? (
          <Text style={styles.originalPrice}>{item.originalPrice.toLocaleString()} {t('rial', language)}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>{t('categories', language)}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowFilter(!showFilter)}>
            <MaterialIcons name="filter-list" size={22} color={showFilter ? Colors.primary : Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => setShowSort(!showSort)}>
            <MaterialIcons name="sort" size={22} color={showSort ? Colors.primary : Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter */}
      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryBarContent}>
          <TouchableOpacity
            style={[styles.catChip, selectedCategory === 'all' && styles.activeCatChip]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text style={[styles.catChipText, selectedCategory === 'all' && styles.activeCatChipText]}>
              {language === 'ar' ? 'الكل' : 'All'}
            </Text>
          </TouchableOpacity>
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catChip, selectedCategory === cat.id && styles.activeCatChip]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[styles.catChipText, selectedCategory === cat.id && styles.activeCatChipText]}>
                {language === 'ar' ? cat.nameAr : cat.nameEn}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sort Panel */}
      {showSort ? (
        <View style={styles.sortPanel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
            {SORT_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.id}
                style={[styles.sortChip, sortBy === opt.id && styles.activeSortChip]}
                onPress={() => { setSortBy(opt.id); setShowSort(false); }}
              >
                <Text style={[styles.sortChipText, sortBy === opt.id && styles.activeSortChipText]}>
                  {language === 'ar' ? opt.labelAr : opt.labelEn}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Filter Panel */}
      {showFilter ? (
        <View style={styles.filterPanel}>
          <Text style={[styles.filterLabel, isRTL && styles.rtlText]}>{t('priceRange', language)}</Text>
          <View style={styles.priceInputs}>
            <TextInput
              style={styles.priceInput}
              value={priceMin}
              onChangeText={setPriceMin}
              placeholder={language === 'ar' ? 'من' : 'Min'}
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />
            <Text style={styles.priceDash}>—</Text>
            <TextInput
              style={styles.priceInput}
              value={priceMax}
              onChangeText={setPriceMax}
              placeholder={language === 'ar' ? 'إلى' : 'Max'}
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />
          </View>
        </View>
      ) : null}

      {/* Products Count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {filteredProducts.length} {language === 'ar' ? 'منتج' : 'products'}
        </Text>
      </View>

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="inventory" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyText}>{language === 'ar' ? 'لا توجد منتجات' : 'No products found'}</Text>
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
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { padding: 6 },
  categoryBar: { backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  categoryBarContent: { paddingHorizontal: Spacing.lg, paddingVertical: 10, gap: 8 },
  catChip: {
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: Radius.full,
    backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border,
  },
  activeCatChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { fontSize: FontSize.sm, color: Colors.textSecondary },
  activeCatChipText: { color: '#000', fontWeight: FontWeight.semibold },
  sortPanel: { backgroundColor: Colors.bgCard, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  sortChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border },
  activeSortChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sortChipText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  activeSortChipText: { color: '#000', fontWeight: FontWeight.semibold },
  filterPanel: {
    backgroundColor: Colors.bgCard, padding: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  filterLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 8 },
  rtlText: { textAlign: 'right' },
  priceInputs: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  priceInput: {
    flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm,
    backgroundColor: Colors.bgInput, paddingHorizontal: Spacing.sm, paddingVertical: 8,
    fontSize: FontSize.sm, color: Colors.textPrimary, textAlign: 'center',
  },
  priceDash: { color: Colors.textMuted },
  countRow: { paddingHorizontal: Spacing.lg, paddingVertical: 8 },
  countText: { fontSize: FontSize.sm, color: Colors.textMuted },
  grid: { paddingHorizontal: Spacing.md, paddingBottom: 20 },
  row: { justifyContent: 'space-between', marginBottom: Spacing.md },
  productCard: {
    width: '48%', backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
    ...Shadow.sm,
  },
  productImageContainer: { position: 'relative', height: 180 },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  discountBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: Colors.error, borderRadius: Radius.xs, paddingHorizontal: 6, paddingVertical: 2,
  },
  discountText: { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.bold },
  productInfo: { padding: Spacing.sm },
  productName: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium, marginBottom: 4, lineHeight: 18 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 1, marginBottom: 4 },
  ratingCount: { fontSize: FontSize.xs, color: Colors.textMuted, marginLeft: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline' },
  price: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary },
  currency: { fontSize: FontSize.xs, color: Colors.textSecondary },
  originalPrice: { fontSize: FontSize.xs, color: Colors.textMuted, textDecorationLine: 'line-through', marginTop: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyText: { fontSize: FontSize.base, color: Colors.textMuted, marginTop: Spacing.md },
});
