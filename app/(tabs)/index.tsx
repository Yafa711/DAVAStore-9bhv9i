import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Image, Dimensions, Animated,
} from 'react-native';
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

const BANNERS = [
  require('@/assets/images/hero-banner-1.jpg'),
  require('@/assets/images/hero-banner-2.jpg'),
  require('@/assets/images/hero-banner-3.jpg'),
];

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, user } = useApp();
  const { products, offers } = useData();
  const [currentBanner, setCurrentBanner] = useState(0);
  const bannerRef = useRef<ScrollView>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const next = (currentBanner + 1) % BANNERS.length;
      setCurrentBanner(next);
      bannerRef.current?.scrollTo({ x: next * width, animated: true });
    }, 3500);
    return () => clearInterval(interval);
  }, [currentBanner]);

  const featuredProducts = products.filter(p => p.isFeatured && p.isVisible);
  const offerProducts = products.filter(p => p.isOffer && p.isVisible);
  const newProducts = products.filter(p => p.isNew && p.isVisible);
  const isRTL = language === 'ar';

  const renderProductCard = ({ item }: any) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
      activeOpacity={0.85}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: item.images[0] }} style={styles.productImage} />
        {item.isOffer && item.offerPercent ? (
          <View style={styles.offerBadge}>
            <Text style={styles.offerBadgeText}>-{item.offerPercent}%</Text>
          </View>
        ) : null}
        {item.isNew ? (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>{language === 'ar' ? 'جديد' : 'NEW'}</Text>
          </View>
        ) : null}
      </View>
      <View style={styles.productInfo}>
        <Text style={[styles.productName, isRTL && styles.rtlText]} numberOfLines={2}>
          {language === 'ar' ? item.nameAr : item.nameEn}
        </Text>
        <View style={styles.ratingRow}>
          <MaterialIcons name="star" size={12} color={Colors.primary} />
          <Text style={styles.ratingText}>{item.rating}</Text>
          <Text style={styles.soldText}>({item.sold})</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{item.price.toLocaleString()}</Text>
          <Text style={styles.currency}>{t('rial', language)}</Text>
          {item.originalPrice ? (
            <Text style={styles.originalPrice}>{item.originalPrice.toLocaleString()}</Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient colors={['#111111', '#0A0A0A']} style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.logo}>DAVA</Text>
            <Text style={styles.taglineSmall}>{language === 'ar' ? 'أزياء فاخرة' : 'Luxury Fashion'}</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/search/index')}>
              <MaterialIcons name="search" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
            {(user?.isAdmin || user?.isSuperAdmin) ? (
              <TouchableOpacity style={styles.adminBtn} onPress={() => router.push('/admin/index')}>
                <MaterialIcons name="admin-panel-settings" size={22} color="#000" />
              </TouchableOpacity>
            ) : null}
          </View>
        </LinearGradient>

        {/* Hero Slider */}
        <View style={styles.sliderContainer}>
          <ScrollView
            ref={bannerRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / width);
              setCurrentBanner(idx);
            }}
          >
            {BANNERS.map((banner, idx) => (
              <View key={idx} style={styles.bannerSlide}>
                <Image source={banner} style={styles.bannerImage} />
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.8)']}
                  style={styles.bannerOverlay}
                >
                  <Text style={styles.bannerTitle}>
                    {language === 'ar' ? 'مجموعة الفخامة' : 'Luxury Collection'}
                  </Text>
                  <TouchableOpacity style={styles.shopNowBtn} onPress={() => router.push('/(tabs)/categories')}>
                    <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.shopNowGradient}>
                      <Text style={styles.shopNowText}>{t('shopNow', language)}</Text>
                      <MaterialIcons name="arrow-forward" size={14} color="#000" />
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
          <View style={styles.sliderDots}>
            {BANNERS.map((_, idx) => (
              <View key={idx} style={[styles.dot, currentBanner === idx && styles.activeDot]} />
            ))}
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
              {t('categories', language)}
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryChip}
                onPress={() => router.push({ pathname: '/(tabs)/categories', params: { category: cat.id } })}
              >
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                  <MaterialIcons name={cat.icon as any} size={22} color={cat.color} />
                </View>
                <Text style={styles.categoryName}>
                  {language === 'ar' ? cat.nameAr : cat.nameEn}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Active Offers Banner */}
        {offers.filter(o => o.isActive).length > 0 ? (
          <View style={styles.offerBannerContainer}>
            <LinearGradient colors={[Colors.primaryDark, Colors.primary, Colors.primaryLight]} style={styles.offerBanner}>
              <View style={styles.offerBannerContent}>
                <MaterialIcons name="local-offer" size={28} color="#000" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.offerBannerTitle}>
                    {language === 'ar' 
                      ? offers.find(o => o.isActive)?.titleAr 
                      : offers.find(o => o.isActive)?.titleEn}
                  </Text>
                  <Text style={styles.offerBannerSubtitle}>
                    {language === 'ar' ? 'خصم حتى' : 'Up to'} {offers.find(o => o.isActive)?.discount}%
                  </Text>
                </View>
                <MaterialIcons name="arrow-forward-ios" size={18} color="#000" />
              </View>
            </LinearGradient>
          </View>
        ) : null}

        {/* Featured Products */}
        {featuredProducts.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>
                {language === 'ar' ? 'منتجات مميزة' : 'Featured Products'}
              </Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/categories')}>
                <Text style={styles.seeAll}>{t('seeAll', language)}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={featuredProducts}
              renderItem={renderProductCard}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
              scrollEnabled={true}
            />
          </View>
        ) : null}

        {/* Offers */}
        {offerProducts.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('offers', language)}</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/categories')}>
                <Text style={styles.seeAll}>{t('seeAll', language)}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={offerProducts}
              renderItem={renderProductCard}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
              scrollEnabled={true}
            />
          </View>
        ) : null}

        {/* New Arrivals */}
        {newProducts.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isRTL && styles.rtlText]}>{t('newArrivals', language)}</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/categories')}>
                <Text style={styles.seeAll}>{t('seeAll', language)}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={newProducts}
              renderItem={renderProductCard}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productsList}
              scrollEnabled={true}
            />
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerLeft: {},
  logo: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.primary, letterSpacing: 4 },
  taglineSmall: { fontSize: FontSize.xs, color: Colors.textMuted },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  headerBtn: { padding: 8 },
  adminBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.sm,
    padding: 6,
  },
  sliderContainer: { position: 'relative' },
  bannerSlide: { width, height: 220 },
  bannerImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  bannerOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: Spacing.lg, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between',
  },
  bannerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#fff', flex: 1 },
  shopNowBtn: { borderRadius: Radius.full, overflow: 'hidden' },
  shopNowGradient: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, gap: 6 },
  shopNowText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#000' },
  sliderDots: { flexDirection: 'row', justifyContent: 'center', paddingVertical: Spacing.sm, gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.textMuted },
  activeDot: { width: 20, backgroundColor: Colors.primary },
  section: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  seeAll: { fontSize: FontSize.sm, color: Colors.primary },
  rtlText: { textAlign: 'right' },
  categoriesRow: { gap: Spacing.sm, paddingRight: Spacing.sm },
  categoryChip: { alignItems: 'center', gap: 6 },
  categoryIcon: { width: 56, height: 56, borderRadius: Radius.lg, justifyContent: 'center', alignItems: 'center' },
  categoryName: { fontSize: FontSize.xs, color: Colors.textSecondary, textAlign: 'center', maxWidth: 60 },
  offerBannerContainer: { paddingHorizontal: Spacing.lg, marginTop: Spacing.lg },
  offerBanner: { borderRadius: Radius.lg, overflow: 'hidden' },
  offerBannerContent: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.md },
  offerBannerTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#000' },
  offerBannerSubtitle: { fontSize: FontSize.sm, color: '#000', opacity: 0.8 },
  productsList: { gap: Spacing.md, paddingRight: Spacing.sm },
  productCard: {
    width: 160, backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
    ...Shadow.sm,
  },
  productImageContainer: { position: 'relative', height: 180 },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  offerBadge: {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: Colors.error, borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2,
  },
  offerBadgeText: { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.bold },
  newBadge: {
    position: 'absolute', top: 8, right: 8,
    backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2,
  },
  newBadgeText: { fontSize: FontSize.xs, color: '#000', fontWeight: FontWeight.bold },
  productInfo: { padding: Spacing.sm },
  productName: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium, marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 4 },
  ratingText: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.medium },
  soldText: { fontSize: FontSize.xs, color: Colors.textMuted },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  price: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary },
  currency: { fontSize: FontSize.xs, color: Colors.textSecondary },
  originalPrice: { fontSize: FontSize.xs, color: Colors.textMuted, textDecorationLine: 'line-through' },
});
