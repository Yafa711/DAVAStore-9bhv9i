import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { useAlert } from '@/template';
import { t } from '@/constants/i18n';

const { width } = Dimensions.get('window');

export default function ProductScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language, addToCart, favorites, toggleFavorite, user } = useApp();
  const { products, reviews, addReview } = useData();
  const { showAlert } = useAlert();

  const [activeImg, setActiveImg] = useState(0);
  const [selSize, setSelSize] = useState('');
  const [selColor, setSelColor] = useState('');
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<'desc' | 'reviews'>('desc');
  const [myRating, setMyRating] = useState(5);
  const [myComment, setMyComment] = useState('');

  const isRTL = language === 'ar';
  const product = products.find(p => p.id === id);
  const productReviews = reviews.filter(r => r.productId === id);
  const isFav = product ? favorites.includes(product.id) : false;

  if (!product) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: Colors.textMuted }}>{isRTL ? 'المنتج غير موجود' : 'Product not found'}</Text>
      </View>
    );
  }

  const handleAddToCart = () => {
    if (!selSize) { showAlert(isRTL ? 'اختر المقاس' : 'Select Size', ''); return; }
    if (!selColor) { showAlert(isRTL ? 'اختر اللون' : 'Select Color', ''); return; }
    addToCart({
      productId: product.id,
      productName: isRTL ? product.nameAr : product.nameEn,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0] || '',
      size: selSize,
      color: selColor,
      quantity: qty,
    });
    showAlert(
      isRTL ? 'أضيف للسلة' : 'Added to Cart',
      isRTL ? 'تم إضافة المنتج لسلة التسوق' : 'Product added to your cart',
      [
        { text: isRTL ? 'متابعة التسوق' : 'Continue', style: 'cancel' },
        { text: isRTL ? 'عرض السلة' : 'View Cart', onPress: () => router.push('/(tabs)/cart') },
      ]
    );
  };

  const handleBuyNow = () => {
    if (!selSize) { showAlert(isRTL ? 'اختر المقاس' : 'Select Size', ''); return; }
    if (!selColor) { showAlert(isRTL ? 'اختر اللون' : 'Select Color', ''); return; }
    addToCart({
      productId: product.id,
      productName: isRTL ? product.nameAr : product.nameEn,
      price: product.price,
      image: product.images[0] || '',
      size: selSize,
      color: selColor,
      quantity: qty,
    });
    router.push('/checkout/index');
  };

  const similar = products.filter(p => p.category === product.category && p.id !== product.id && p.isVisible).slice(0, 6);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Images */}
        <View style={styles.gallery}>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => setActiveImg(Math.round(e.nativeEvent.contentOffset.x / width))}
          >
            {(product.images.length ? product.images : ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600']).map((uri, i) => (
              <Image key={i} source={{ uri }} style={styles.mainImg} contentFit="cover" />
            ))}
          </ScrollView>
          {/* Back btn */}
          <TouchableOpacity style={[styles.backBtn, { top: 12 }]} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color={Colors.textPrimary} />
          </TouchableOpacity>
          {/* Fav btn */}
          <TouchableOpacity style={styles.favBtn} onPress={() => toggleFavorite(product.id)}>
            <MaterialIcons name={isFav ? 'favorite' : 'favorite-border'} size={20} color={isFav ? Colors.error : Colors.textPrimary} />
          </TouchableOpacity>
          {/* Dots */}
          {product.images.length > 1 ? (
            <View style={styles.imgDots}>
              {product.images.map((_, i) => (
                <View key={i} style={[styles.imgDot, activeImg === i && styles.imgDotActive]} />
              ))}
            </View>
          ) : null}
          {/* Badges */}
          {product.isOffer && product.offerPercent ? (
            <View style={styles.saleTag}><Text style={styles.saleTagTxt}>-{product.offerPercent}%</Text></View>
          ) : null}
        </View>

        {/* Thumbnails */}
        {product.images.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbRow}>
            {product.images.map((uri, i) => (
              <TouchableOpacity key={i} style={[styles.thumb, activeImg === i && styles.thumbActive]} onPress={() => setActiveImg(i)}>
                <Image source={{ uri }} style={styles.thumbImg} contentFit="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : null}

        {/* Info */}
        <View style={styles.info}>
          {/* Tags */}
          <View style={styles.tagsRow}>
            {product.isNew ? <View style={styles.newTag}><Text style={styles.newTagTxt}>{isRTL ? 'جديد' : 'NEW'}</Text></View> : null}
            {product.isFeatured ? <View style={styles.featTag}><Text style={styles.featTagTxt}>{isRTL ? 'مميز' : 'FEATURED'}</Text></View> : null}
            <Text style={styles.catTxt}>
              {isRTL ? '• ملابس' : '• Fashion'}
            </Text>
          </View>

          <Text style={[styles.name, isRTL && styles.rtl]}>
            {isRTL ? product.nameAr : product.nameEn}
          </Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map(s => (
              <MaterialIcons key={s} name="star" size={16} color={s <= product.rating ? Colors.primary : Colors.border} />
            ))}
            <Text style={styles.ratingTxt}>{product.rating}</Text>
            <Text style={styles.reviewCount}>({productReviews.length} {isRTL ? 'تقييم' : 'reviews'})</Text>
            <Text style={styles.soldTxt}>· {product.sold} {isRTL ? 'مباع' : 'sold'}</Text>
          </View>

          {/* Price */}
          <View style={styles.priceWrap}>
            <Text style={styles.price}>{product.price.toLocaleString()}</Text>
            <Text style={styles.curr}>{isRTL ? 'ريال' : 'YER'}</Text>
            {product.originalPrice ? (
              <Text style={styles.origPrice}>{product.originalPrice.toLocaleString()}</Text>
            ) : null}
            {product.offerPercent ? (
              <View style={styles.saveBadge}>
                <Text style={styles.saveTxt}>{isRTL ? `وفري ${product.offerPercent}%` : `Save ${product.offerPercent}%`}</Text>
              </View>
            ) : null}
          </View>

          {/* Sizes */}
          {product.sizes.length > 0 ? (
            <View style={styles.optSection}>
              <Text style={[styles.optTitle, isRTL && styles.rtl]}>
                {isRTL ? 'المقاس' : 'Size'}{selSize ? `: ${selSize}` : ''}
              </Text>
              <View style={styles.optRow}>
                {product.sizes.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.optChip, selSize === s && styles.optChipActive]}
                    onPress={() => setSelSize(s)}
                  >
                    <Text style={[styles.optChipTxt, selSize === s && styles.optChipTxtActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* Colors */}
          {product.colors.length > 0 ? (
            <View style={styles.optSection}>
              <Text style={[styles.optTitle, isRTL && styles.rtl]}>
                {isRTL ? 'اللون' : 'Color'}{selColor ? `: ${selColor}` : ''}
              </Text>
              <View style={styles.optRow}>
                {product.colors.map(c => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.colorChip, selColor === c && styles.colorChipActive]}
                    onPress={() => setSelColor(c)}
                  >
                    <Text style={[styles.colorChipTxt, selColor === c && styles.colorChipTxtActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null}

          {/* Quantity */}
          <View style={styles.qtySection}>
            <Text style={[styles.optTitle, isRTL && styles.rtl]}>{isRTL ? 'الكمية' : 'Quantity'}</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.max(1, q - 1))}>
                <MaterialIcons name="remove" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.qtyNum}>{qty}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setQty(q => Math.min(product.stock, q + 1))}>
                <MaterialIcons name="add" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.stockTxt}>
                {product.stock > 0 ? `${product.stock} ${isRTL ? 'متوفر' : 'available'}` : (isRTL ? 'نفد المخزون' : 'Out of stock')}
              </Text>
            </View>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'desc' && styles.tabBtnActive]}
              onPress={() => setTab('desc')}
            >
              <Text style={[styles.tabBtnTxt, tab === 'desc' && styles.tabBtnTxtActive]}>
                {isRTL ? 'الوصف' : 'Description'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, tab === 'reviews' && styles.tabBtnActive]}
              onPress={() => setTab('reviews')}
            >
              <Text style={[styles.tabBtnTxt, tab === 'reviews' && styles.tabBtnTxtActive]}>
                {isRTL ? `التقييمات (${productReviews.length})` : `Reviews (${productReviews.length})`}
              </Text>
            </TouchableOpacity>
          </View>

          {tab === 'desc' ? (
            <Text style={[styles.desc, isRTL && styles.rtl]}>
              {isRTL ? product.descriptionAr || product.nameAr : product.descriptionEn || product.nameEn}
            </Text>
          ) : (
            <View style={styles.reviewsSection}>
              {productReviews.length === 0 ? (
                <Text style={styles.noReviews}>{isRTL ? 'لا توجد تقييمات بعد' : 'No reviews yet'}</Text>
              ) : (
                productReviews.map(r => (
                  <View key={r.id} style={styles.reviewCard}>
                    <View style={styles.reviewTop}>
                      <Text style={styles.reviewerName}>{r.userName}</Text>
                      <View style={styles.reviewStars}>
                        {[1,2,3,4,5].map(s => (
                          <MaterialIcons key={s} name="star" size={12} color={s <= r.rating ? Colors.primary : Colors.border} />
                        ))}
                      </View>
                    </View>
                    <Text style={[styles.reviewComment, isRTL && styles.rtl]}>{r.comment}</Text>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Similar */}
          {similar.length > 0 ? (
            <View style={styles.similarSection}>
              <Text style={[styles.sectionTitle, isRTL && styles.rtl]}>
                {isRTL ? 'منتجات مشابهة' : 'Similar Products'}
              </Text>
              <FlatList
                data={similar}
                horizontal
                keyExtractor={i => i.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: Spacing.sm, paddingRight: Spacing.sm }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.simCard}
                    onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
                  >
                    <Image
                      source={{ uri: item.images[0] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200' }}
                      style={styles.simImg}
                      contentFit="cover"
                    />
                    <Text style={styles.simName} numberOfLines={2}>{isRTL ? item.nameAr : item.nameEn}</Text>
                    <Text style={styles.simPrice}>{item.price.toLocaleString()} {isRTL ? 'ريال' : 'YER'}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          ) : null}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <TouchableOpacity style={styles.cartBtn} onPress={handleAddToCart}>
          <MaterialIcons name="shopping-cart" size={20} color={Colors.primary} />
          <Text style={styles.cartBtnTxt}>{isRTL ? 'السلة' : 'Cart'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyBtn} onPress={handleBuyNow}>
          <LinearGradient colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]} style={styles.buyBtnGrad}>
            <Text style={styles.buyBtnTxt}>{isRTL ? 'اشتري الآن' : 'Buy Now'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  gallery: { position: 'relative', height: 360 },
  mainImg: { width, height: 360 },
  backBtn: {
    position: 'absolute', left: 14,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.bg + 'CC', justifyContent: 'center', alignItems: 'center',
  },
  favBtn: {
    position: 'absolute', top: 12, right: 14,
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.bg + 'CC', justifyContent: 'center', alignItems: 'center',
  },
  imgDots: { position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  imgDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.textMuted },
  imgDotActive: { width: 18, backgroundColor: Colors.primary },
  saleTag: {
    position: 'absolute', top: 12, left: 60,
    backgroundColor: Colors.error, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 4,
  },
  saleTagTxt: { fontSize: FontSize.sm, color: '#fff', fontWeight: FontWeight.bold },
  thumbRow: { paddingHorizontal: Spacing.md, paddingVertical: 10, gap: 8 },
  thumb: { width: 60, height: 60, borderRadius: Radius.sm, overflow: 'hidden', borderWidth: 2, borderColor: Colors.border },
  thumbActive: { borderColor: Colors.primary },
  thumbImg: { width: '100%', height: '100%' },
  info: { padding: Spacing.lg, gap: Spacing.md },
  rtl: { textAlign: 'right' },
  tagsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  newTag: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 3 },
  newTagTxt: { fontSize: FontSize.xs, color: '#0D1E16', fontWeight: FontWeight.bold },
  featTag: { backgroundColor: Colors.info + '20', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 3 },
  featTagTxt: { fontSize: FontSize.xs, color: Colors.info },
  catTxt: { fontSize: FontSize.xs, color: Colors.textMuted },
  name: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, lineHeight: 28 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingTxt: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
  reviewCount: { fontSize: FontSize.xs, color: Colors.textMuted },
  soldTxt: { fontSize: FontSize.xs, color: Colors.textMuted },
  priceWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  price: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.primary },
  curr: { fontSize: FontSize.sm, color: Colors.textMuted },
  origPrice: { fontSize: FontSize.base, color: Colors.textMuted, textDecorationLine: 'line-through' },
  saveBadge: { backgroundColor: Colors.success + '20', borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  saveTxt: { fontSize: FontSize.xs, color: Colors.success, fontWeight: FontWeight.bold },
  optSection: { gap: 8 },
  optTitle: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.semibold },
  optRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optChip: {
    paddingHorizontal: 16, paddingVertical: 9, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.bgCard,
  },
  optChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  optChipTxt: { fontSize: FontSize.sm, color: Colors.textSecondary },
  optChipTxtActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  colorChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.bgCard,
  },
  colorChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  colorChipTxt: { fontSize: FontSize.sm, color: Colors.textSecondary },
  colorChipTxtActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  qtySection: { gap: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  qtyBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.bgSurface, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.border,
  },
  qtyNum: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, minWidth: 30, textAlign: 'center' },
  stockTxt: { fontSize: FontSize.xs, color: Colors.textMuted },
  tabs: {
    flexDirection: 'row', backgroundColor: Colors.bgSurface,
    borderRadius: Radius.lg, padding: 3, borderWidth: 1, borderColor: Colors.border,
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.md },
  tabBtnActive: { backgroundColor: Colors.primary },
  tabBtnTxt: { fontSize: FontSize.sm, color: Colors.textMuted },
  tabBtnTxtActive: { color: '#0D1E16', fontWeight: FontWeight.bold },
  desc: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 26 },
  reviewsSection: { gap: Spacing.sm },
  noReviews: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', paddingVertical: Spacing.lg },
  reviewCard: { backgroundColor: Colors.bgSurface, borderRadius: Radius.md, padding: Spacing.sm, gap: 4, borderWidth: 1, borderColor: Colors.border },
  reviewTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reviewerName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  reviewStars: { flexDirection: 'row' },
  reviewComment: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },
  similarSection: { gap: 10 },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  simCard: { width: 130, backgroundColor: Colors.bgCard, borderRadius: Radius.md, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border },
  simImg: { width: '100%', height: 140 },
  simName: { fontSize: FontSize.xs, color: Colors.textPrimary, padding: 6, lineHeight: 16 },
  simPrice: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.bold, paddingHorizontal: 6, paddingBottom: 6 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: Spacing.sm,
    backgroundColor: Colors.bgCard, paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  cartBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 13,
  },
  cartBtnTxt: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary },
  buyBtn: { flex: 2, borderRadius: Radius.md, overflow: 'hidden' },
  buyBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  buyBtnTxt: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#0D1E16' },
});
