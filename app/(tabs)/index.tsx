import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Dimensions, Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { CATEGORIES } from '@/constants/config';
import { t } from '@/constants/i18n';

const { width } = Dimensions.get('window');
const CARD_W = (width - Spacing.lg * 2 - Spacing.sm) / 2;

const BANNERS = [
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
  'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80',
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, user, cartCount, favorites, toggleFavorite } = useApp();
  const { products, offers } = useData();
  const [currentBanner, setCurrentBanner] = useState(0);
  const bannerRef = useRef<ScrollView>(null);
  const scrollY = useRef(new Animated.Value(0)).current;

  const isRTL = language === 'ar';

  useEffect(() => {
    const iv = setInterval(() => {
      setCurrentBanner(p => {
        const n = (p + 1) % BANNERS.length;
        bannerRef.current?.scrollTo({ x: n * width, animated: true });
        return n;
      });
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const featured = products.filter(p => p.isFeatured && p.isVisible);
  const offerProds = products.filter(p => p.isOffer && p.isVisible);
  const newArrivals = products.filter(p => p.isNew && p.isVisible);
  const activeOffer = offers.find(o => o.isActive);

  const headerOpacity = scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, 1], extrapolate: 'clamp' });

  const ProductCard = ({ item }: { item: any }) => {
    const isFav = favorites.includes(item.id);
    return (
      <TouchableOpacity
        style={styles.productCard}
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
            <View style={styles.saleTag}>
              <Text style={styles.saleTagText}>-{item.offerPercent}%</Text>
            </View>
          ) : null}
          {item.isNew ? (
            <View style={styles.newTag}>
              <Text style={styles.newTagText}>{isRTL ? 'جديد' : 'NEW'}</Text>
            </View>
          ) : null}
          <TouchableOpacity
            style={styles.favBtn}
            onPress={() => toggleFavorite(item.id)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <MaterialIcons
              name={isFav ? 'favorite' : 'favorite-border'}
              size={18}
              color={isFav ? Colors.error : Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.cardBody}>
          <Text style={[styles.cardName, isRTL && styles.rtl]} numberOfLines={2}>
            {isRTL ? item.nameAr : item.nameEn}
          </Text>
          <View style={styles.ratingRow}>
            <MaterialIcons name="star" size={11} color={Colors.primary} />
            <Text style={styles.ratingTxt}>{item.rating}</Text>
            <Text style={styles.soldTxt}>({item.sold})</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceTxt}>{item.price.toLocaleString()}</Text>
            <Text style={styles.currTxt}>{isRTL ? 'ريال' : 'YER'}</Text>
            {item.originalPrice ? (
              <Text style={styles.origTxt}>{item.originalPrice.toLocaleString()}</Text>
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const SectionHeader = ({ title, onSeeAll }: { title: string; onSeeAll: () => void }) => (
    <View style={styles.sectionHead}>
      <View style={styles.sectionTitleWrap}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      <TouchableOpacity onPress={onSeeAll} style={styles.seeAllBtn}>
        <Text style={styles.seeAllTxt}>{t('seeAll', language)}</Text>
        <MaterialIcons name={isRTL ? 'arrow-back-ios' : 'arrow-forward-ios'} size={11} color={Colors.primary} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Sticky header on scroll */}
      <Animated.View style={[styles.stickyHeader, { opacity: headerOpacity }]}>
        <LinearGradient colors={['#0D1E16', '#152A1E']} style={styles.stickyHeaderInner}>
          <Image source={require('@/assets/images/dava-logo.png')} style={styles.stickyLogo} contentFit="contain" />
          <Text style={styles.stickyBrand}>DAVA</Text>
        </LinearGradient>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* ── HEADER ── */}
        <LinearGradient colors={['#152A1E', '#0D1E16']} style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoWrap}>
              <Image source={require('@/assets/images/dava-logo.png')} style={styles.logoImg} contentFit="contain" />
              <View>
                <Text style={styles.brandTxt}>DAVA</Text>
                <Text style={styles.brandSub}>{isRTL ? 'أزياء فاخرة' : 'Luxury Fashion'}</Text>
              </View>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/search/index')}>
                <MaterialIcons name="search" size={22} color={Colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconBtn} onPress={() => router.push('/(tabs)/cart')}>
                <MaterialIcons name="shopping-bag" size={22} color={Colors.textPrimary} />
                {cartCount > 0 ? (
                  <View style={styles.cartDot}><Text style={styles.cartDotTxt}>{cartCount}</Text></View>
                ) : null}
              </TouchableOpacity>
              {(user?.isAdmin || user?.isSuperAdmin) ? (
                <TouchableOpacity style={styles.adminPill} onPress={() => router.push('/admin/index')}>
                  <MaterialIcons name="shield" size={14} color="#0D1E16" />
                  <Text style={styles.adminPillTxt}>{isRTL ? 'إدارة' : 'Admin'}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>

          {/* Search bar shortcut */}
          <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/search/index')} activeOpacity={0.8}>
            <MaterialIcons name="search" size={18} color={Colors.textMuted} />
            <Text style={styles.searchBarTxt}>
              {isRTL ? 'ابحثي عن الموضة، العبايات، الإكسسوارات...' : 'Search fashion, abayas, accessories...'}
            </Text>
            <MaterialIcons name="tune" size={18} color={Colors.primary} />
          </TouchableOpacity>
        </LinearGradient>

        {/* ── HERO SLIDER ── */}
        <View>
          <ScrollView
            ref={bannerRef}
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => setCurrentBanner(Math.round(e.nativeEvent.contentOffset.x / width))}
          >
            {BANNERS.map((uri, idx) => (
              <View key={idx} style={styles.bannerSlide}>
                <Image source={{ uri }} style={styles.bannerImg} contentFit="cover" />
                <LinearGradient colors={['transparent', 'rgba(13,30,22,0.92)']} style={styles.bannerOverlay}>
                  <Text style={styles.bannerLabel}>
                    {idx === 0 ? (isRTL ? 'كولكشن الفخامة' : 'Luxury Collection')
                      : idx === 1 ? (isRTL ? 'أزياء المرأة' : 'Women Fashion')
                        : (isRTL ? 'إكسسوارات راقية' : 'Premium Accessories')}
                  </Text>
                  <TouchableOpacity
                    style={styles.bannerCTA}
                    onPress={() => router.push('/(tabs)/categories')}
                  >
                    <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.bannerCTAGrad}>
                      <Text style={styles.bannerCTATxt}>{t('shopNow', language)}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
          <View style={styles.dots}>
            {BANNERS.map((_, i) => (
              <View key={i} style={[styles.dot, currentBanner === i && styles.dotActive]} />
            ))}
          </View>
        </View>

        {/* ── CATEGORIES ── */}
        <View style={styles.section}>
          <SectionHeader
            title={isRTL ? 'تسوق حسب التصنيف' : 'Shop by Category'}
            onSeeAll={() => router.push('/(tabs)/categories')}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={styles.catItem}
                onPress={() => router.push({ pathname: '/(tabs)/categories', params: { category: cat.id } })}
              >
                <LinearGradient
                  colors={[cat.color + '30', cat.color + '10']}
                  style={styles.catIcon}
                >
                  <MaterialIcons name={cat.icon as any} size={24} color={cat.color} />
                </LinearGradient>
                <Text style={styles.catName} numberOfLines={2}>
                  {isRTL ? cat.nameAr : cat.nameEn}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── FLASH OFFER BANNER ── */}
        {activeOffer ? (
          <TouchableOpacity
            style={styles.flashWrap}
            onPress={() => router.push('/(tabs)/categories')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={[Colors.primaryDark + 'EE', Colors.primary + 'EE', Colors.primaryLight + 'CC']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.flashBanner}
            >
              <View style={styles.flashLeft}>
                <MaterialIcons name="local-fire-department" size={26} color="#0D1E16" />
                <View>
                  <Text style={styles.flashTitle}>
                    {isRTL ? activeOffer.titleAr : activeOffer.titleEn}
                  </Text>
                  <Text style={styles.flashSub}>
                    {isRTL ? `خصم ${activeOffer.discount}% على المجموعة` : `${activeOffer.discount}% off the collection`}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={22} color="#0D1E16" />
            </LinearGradient>
          </TouchableOpacity>
        ) : null}

        {/* ── FEATURED ── */}
        {featured.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title={isRTL ? 'منتجات مختارة' : 'Featured Picks'}
              onSeeAll={() => router.push('/(tabs)/categories')}
            />
            <FlatList
              data={featured.slice(0, 8)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={i => i.id}
              renderItem={({ item }) => <ProductCard item={item} />}
              contentContainerStyle={{ gap: Spacing.sm, paddingRight: Spacing.md }}
              scrollEnabled
            />
          </View>
        ) : null}

        {/* ── OFFER PRODUCTS ── */}
        {offerProds.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title={isRTL ? '🔥 عروض لفترة محدودة' : '🔥 Limited Deals'}
              onSeeAll={() => router.push('/(tabs)/categories')}
            />
            <FlatList
              data={offerProds.slice(0, 8)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={i => i.id}
              renderItem={({ item }) => <ProductCard item={item} />}
              contentContainerStyle={{ gap: Spacing.sm, paddingRight: Spacing.md }}
              scrollEnabled
            />
          </View>
        ) : null}

        {/* ── NEW ARRIVALS ── */}
        {newArrivals.length > 0 ? (
          <View style={styles.section}>
            <SectionHeader
              title={isRTL ? '✨ وصل حديثاً' : '✨ New Arrivals'}
              onSeeAll={() => router.push('/(tabs)/categories')}
            />
            <FlatList
              data={newArrivals.slice(0, 8)}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={i => i.id}
              renderItem={({ item }) => <ProductCard item={item} />}
              contentContainerStyle={{ gap: Spacing.sm, paddingRight: Spacing.md }}
              scrollEnabled
            />
          </View>
        ) : null}

        {/* ── ALL PRODUCTS GRID ── */}
        <View style={styles.section}>
          <SectionHeader
            title={isRTL ? 'جميع المنتجات' : 'All Products'}
            onSeeAll={() => router.push('/(tabs)/categories')}
          />
          <View style={styles.grid}>
            {products.filter(p => p.isVisible).slice(0, 6).map(item => (
              <ProductCard key={item.id} item={item} />
            ))}
          </View>
          {products.filter(p => p.isVisible).length > 6 ? (
            <TouchableOpacity
              style={styles.viewMoreBtn}
              onPress={() => router.push('/(tabs)/categories')}
            >
              <Text style={styles.viewMoreTxt}>
                {isRTL ? `عرض جميع المنتجات (${products.filter(p => p.isVisible).length})` : `View All (${products.filter(p => p.isVisible).length})`}
              </Text>
              <MaterialIcons name="arrow-forward" size={16} color="#0D1E16" />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* ── FOOTER BANNER ── */}
        <View style={styles.footerBanner}>
          <LinearGradient colors={['#152A1E', '#1C3527']} style={styles.footerGrad}>
            <Image source={require('@/assets/images/dava-logo.png')} style={styles.footerLogo} contentFit="contain" />
            <Text style={styles.footerBrand}>DAVA</Text>
            <Text style={styles.footerTag}>{isRTL ? 'أزياء فاخرة لكل إطلالة' : 'Luxury Fashion for Every Look'}</Text>
          </LinearGradient>
        </View>
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  stickyHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
  },
  stickyHeaderInner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: Spacing.lg, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  stickyLogo: { width: 28, height: 28, borderRadius: 7 },
  stickyBrand: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, color: Colors.primary, letterSpacing: 3 },
  header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.md, gap: 12 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoImg: { width: 40, height: 40, borderRadius: 10 },
  brandTxt: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.primary, letterSpacing: 4 },
  brandSub: { fontSize: FontSize.xs, color: Colors.textMuted, letterSpacing: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  iconBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  cartDot: {
    position: 'absolute', top: 4, right: 4, backgroundColor: Colors.error,
    borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3,
  },
  cartDotTxt: { fontSize: 9, color: '#fff', fontWeight: FontWeight.bold },
  adminPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 6,
  },
  adminPillTxt: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: '#0D1E16' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.bgSurface, borderRadius: Radius.full,
    paddingHorizontal: 16, paddingVertical: 11,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchBarTxt: { flex: 1, fontSize: FontSize.sm, color: Colors.textMuted },
  // Banner
  bannerSlide: { width, height: 230 },
  bannerImg: { width: '100%', height: '100%' },
  bannerOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg,
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
  },
  bannerLabel: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, flex: 1 },
  bannerCTA: { borderRadius: Radius.full, overflow: 'hidden' },
  bannerCTAGrad: { paddingHorizontal: 18, paddingVertical: 9 },
  bannerCTATxt: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#0D1E16' },
  dots: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 10, gap: 5 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  dotActive: { width: 22, backgroundColor: Colors.primary },
  // Sections
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.xl },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitleWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionAccent: { width: 3, height: 18, backgroundColor: Colors.primary, borderRadius: Radius.full },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  seeAllTxt: { fontSize: FontSize.xs, color: Colors.primary },
  // Categories
  catRow: { gap: Spacing.sm, paddingRight: Spacing.sm },
  catItem: { alignItems: 'center', gap: 6, width: 70 },
  catIcon: { width: 58, height: 58, borderRadius: Radius.lg, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  catName: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', lineHeight: 16 },
  // Flash banner
  flashWrap: { marginHorizontal: Spacing.lg, marginTop: Spacing.xl },
  flashBanner: { borderRadius: Radius.xl, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  flashLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  flashTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#0D1E16' },
  flashSub: { fontSize: FontSize.xs, color: '#0D1E16', opacity: 0.8 },
  // Product card
  productCard: {
    width: CARD_W, backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border, ...Shadow.sm,
  },
  cardImgWrap: { height: 190, position: 'relative' },
  cardImg: { width: '100%', height: '100%' },
  saleTag: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: Colors.error, borderRadius: Radius.sm,
    paddingHorizontal: 6, paddingVertical: 3,
  },
  saleTagText: { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.bold },
  newTag: {
    position: 'absolute', top: 8, right: 36,
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    paddingHorizontal: 6, paddingVertical: 3,
  },
  newTagText: { fontSize: FontSize.xs, color: '#0D1E16', fontWeight: FontWeight.bold },
  favBtn: {
    position: 'absolute', top: 6, right: 6,
    backgroundColor: Colors.bg + 'CC', borderRadius: Radius.full,
    width: 30, height: 30, justifyContent: 'center', alignItems: 'center',
  },
  cardBody: { padding: 10, gap: 4 },
  rtl: { textAlign: 'right' },
  cardName: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium, lineHeight: 18 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  ratingTxt: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  soldTxt: { fontSize: FontSize.xs, color: Colors.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 3, flexWrap: 'wrap' },
  priceTxt: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary },
  currTxt: { fontSize: FontSize.xs, color: Colors.textMuted },
  origTxt: { fontSize: FontSize.xs, color: Colors.textMuted, textDecorationLine: 'line-through' },
  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  viewMoreBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginTop: Spacing.md, backgroundColor: Colors.primary,
    borderRadius: Radius.full, paddingVertical: 13,
  },
  viewMoreTxt: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#0D1E16' },
  // Footer
  footerBanner: { marginHorizontal: Spacing.lg, marginTop: Spacing.xl, borderRadius: Radius.xl, overflow: 'hidden' },
  footerGrad: { alignItems: 'center', paddingVertical: Spacing.xl, gap: 8, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.xl },
  footerLogo: { width: 60, height: 60, borderRadius: 14 },
  footerBrand: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.primary, letterSpacing: 6 },
  footerTag: { fontSize: FontSize.sm, color: Colors.textMuted },
});
