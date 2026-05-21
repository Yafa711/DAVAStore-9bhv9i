import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { CATEGORIES } from '@/constants/config';
import { t } from '@/constants/i18n';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_W = (width - Spacing.lg * 2 - Spacing.sm) / 2;

export default function CategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ category?: string }>();
  const { language, favorites, toggleFavorite } = useApp();
  const { products } = useData();

  const [selectedCat, setSelectedCat] = useState(params.category || 'all');
  const [sortBy, setSortBy] = useState<'newest' | 'price_asc' | 'price_desc' | 'rating'>('newest');
  const [search, setSearch] = useState('');

  const isRTL = language === 'ar';

  const allCats = [
    { id: 'all', nameAr: 'الكل', nameEn: 'All', icon: 'apps', color: Colors.primary },
    ...CATEGORIES,
  ];

  let filtered = products.filter(p => p.isVisible);
  if (selectedCat !== 'all') filtered = filtered.filter(p => p.category === selectedCat);
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.nameAr.includes(q) || p.nameEn.toLowerCase().includes(q)
    );
  }
  switch (sortBy) {
    case 'price_asc': filtered = [...filtered].sort((a, b) => a.price - b.price); break;
    case 'price_desc': filtered = [...filtered].sort((a, b) => b.price - a.price); break;
    case 'rating': filtered = [...filtered].sort((a, b) => b.rating - a.rating); break;
    default: filtered = [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  const renderProduct = ({ item }: any) => {
    const isFav = favorites.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
        activeOpacity={0.88}
      >
        <View style={styles.cardImgWrap}>
          <Image
            source={{ uri: item.images[0] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400' }}
            style={styles.cardImg}
            contentFit="cover"
            transition={200}
          />
          {item.isOffer && item.offerPercent ? (
            <View style={styles.saleTag}><Text style={styles.saleTagTxt}>-{item.offerPercent}%</Text></View>
          ) : null}
          {item.isNew ? (
            <View style={styles.newTag}><Text style={styles.newTagTxt}>{isRTL ? 'جديد' : 'NEW'}</Text></View>
          ) : null}
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => toggleFavorite(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons name={isFav ? 'favorite' : 'favorite-border'} size={17} color={isFav ? Colors.error : Colors.textSecondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardName, isRTL && styles.rtl]} numberOfLines={2}>
            {isRTL ? item.nameAr : item.nameEn}
          </Text>
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={10} color={Colors.primary} />
            <Text style={styles.ratingTxt}>{item.rating}</Text>
            <Text style={styles.soldTxt}>({item.sold})</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{item.price.toLocaleString()}</Text>
            <Text style={styles.curr}>{isRTL ? 'ريال' : 'YER'}</Text>
            {item.originalPrice ? <Text style={styles.orig}>{item.originalPrice.toLocaleString()}</Text> : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <LinearGradient colors={['#152A1E', '#0D1E16']} style={styles.header}>
        <Text style={styles.headerTitle}>{isRTL ? 'تسوق الآن' : 'Shop Now'}</Text>
        <View style={styles.searchBar}>
          <MaterialIcons name="search" size={18} color={Colors.textMuted} />
          <TextInput
            style={[styles.searchInput, isRTL && styles.rtl]}
            value={search}
            onChangeText={setSearch}
            placeholder={t('searchPlaceholder', language)}
            placeholderTextColor={Colors.textMuted}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialIcons name="close" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>

      {/* Category chips */}
      <View style={styles.catWrap}>
        <FlatList
          data={allCats}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={i => i.id}
          contentContainerStyle={styles.catRow}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.catChip, selectedCat === item.id && styles.catChipActive]}
              onPress={() => setSelectedCat(item.id)}
            >
              <MaterialIcons name={item.icon as any} size={14} color={selectedCat === item.id ? '#0D1E16' : item.color} />
              <Text style={[styles.catChipTxt, selectedCat === item.id && styles.catChipTxtActive]}>
                {isRTL ? item.nameAr : item.nameEn}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Sort bar */}
      <View style={styles.sortBar}>
        <Text style={styles.countTxt}>{filtered.length} {isRTL ? 'منتج' : 'items'}</Text>
        <View style={styles.sortBtns}>
          {[
            { id: 'newest', labelAr: 'الأحدث', labelEn: 'Newest' },
            { id: 'price_asc', labelAr: 'الأرخص', labelEn: 'Lowest' },
            { id: 'price_desc', labelAr: 'الأغلى', labelEn: 'Highest' },
            { id: 'rating', labelAr: 'التقييم', labelEn: 'Rating' },
          ].map(s => (
            <TouchableOpacity
              key={s.id}
              style={[styles.sortBtn, sortBy === s.id && styles.sortBtnActive]}
              onPress={() => setSortBy(s.id as any)}
            >
              <Text style={[styles.sortBtnTxt, sortBy === s.id && styles.sortBtnTxtActive]}>
                {isRTL ? s.labelAr : s.labelEn}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Products Grid */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        numColumns={2}
        columnWrapperStyle={styles.colWrapper}
        contentContainerStyle={styles.grid}
        renderItem={renderProduct}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="inventory-2" size={60} color={Colors.textMuted} />
            <Text style={styles.emptyTxt}>{isRTL ? 'لا توجد منتجات' : 'No products found'}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.md, gap: 10 },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.bgSurface, borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary },
  rtl: { textAlign: 'right' },
  catWrap: { backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  catRow: { paddingHorizontal: Spacing.md, paddingVertical: 10, gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full,
    backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border,
  },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipTxt: { fontSize: FontSize.xs, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  catChipTxtActive: { color: '#0D1E16', fontWeight: FontWeight.bold },
  sortBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  countTxt: { fontSize: FontSize.xs, color: Colors.textMuted },
  sortBtns: { flexDirection: 'row', gap: 4 },
  sortBtn: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: Radius.full, backgroundColor: Colors.bgSurface },
  sortBtnActive: { backgroundColor: Colors.primary },
  sortBtnTxt: { fontSize: FontSize.xs, color: Colors.textSecondary },
  sortBtnTxtActive: { color: '#0D1E16', fontWeight: FontWeight.bold },
  grid: { padding: Spacing.md, paddingBottom: 30 },
  colWrapper: { gap: Spacing.sm, marginBottom: Spacing.sm },
  card: {
    width: CARD_W, backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  cardImgWrap: { height: 190, position: 'relative' },
  cardImg: { width: '100%', height: '100%' },
  saleTag: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: Colors.error, borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 3,
  },
  saleTagTxt: { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.bold },
  newTag: {
    position: 'absolute', top: 8, right: 34,
    backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 3,
  },
  newTagTxt: { fontSize: FontSize.xs, color: '#0D1E16', fontWeight: FontWeight.bold },
  favBtn: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: Colors.bg + 'CC', borderRadius: Radius.full,
    width: 28, height: 28, justifyContent: 'center', alignItems: 'center',
  },
  cardBody: { padding: 10, gap: 3 },
  cardName: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium, lineHeight: 18 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingTxt: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  soldTxt: { fontSize: FontSize.xs, color: Colors.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 3, flexWrap: 'wrap' },
  price: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary },
  curr: { fontSize: FontSize.xs, color: Colors.textMuted },
  orig: { fontSize: FontSize.xs, color: Colors.textMuted, textDecorationLine: 'line-through' },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyTxt: { color: Colors.textMuted, fontSize: FontSize.base },
});
