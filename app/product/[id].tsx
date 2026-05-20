import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, TextInput, Animated, Share,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { useAlert } from '@/template';
import { t } from '@/constants/i18n';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { language, user, addToCart, favorites, toggleFavorite } = useApp();
  const { products, reviews, addReview } = useData();
  const { showAlert } = useAlert();

  const product = products.find(p => p.id === id);
  const productReviews = reviews.filter(r => r.productId === id);
  const isFav = favorites.includes(id || '');

  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'desc' | 'reviews'>('desc');
  const scrollRef = useRef<ScrollView>(null);
  const cartBounce = useRef(new Animated.Value(1)).current;

  const isRTL = language === 'ar';

  if (!product) {
    return (
      <View style={[styles.container, styles.center]}>
        <MaterialIcons name="error-outline" size={64} color={Colors.textMuted} />
        <Text style={styles.notFoundText}>{language === 'ar' ? 'المنتج غير موجود' : 'Product not found'}</Text>
        <TouchableOpacity style={styles.goBackBtn} onPress={() => router.back()}>
          <Text style={styles.goBackText}>{t('back', language)}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const animateCart = () => {
    Animated.sequence([
      Animated.spring(cartBounce, { toValue: 0.85, useNativeDriver: true }),
      Animated.spring(cartBounce, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      showAlert(language === 'ar' ? 'اختر المقاس' : 'Select Size', language === 'ar' ? 'يرجى اختيار المقاس أولاً' : 'Please select a size first');
      return;
    }
    if (!selectedColor) {
      showAlert(language === 'ar' ? 'اختر اللون' : 'Select Color', language === 'ar' ? 'يرجى اختيار اللون أولاً' : 'Please select a color first');
      return;
    }
    animateCart();
    addToCart({
      productId: product.id,
      productName: language === 'ar' ? product.nameAr : product.nameEn,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    showAlert(t('success', language), language === 'ar' ? 'تم إضافة المنتج للسلة' : 'Product added to cart');
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      showAlert(language === 'ar' ? 'اختر المقاس' : 'Select Size', '');
      return;
    }
    if (!selectedColor) {
      showAlert(language === 'ar' ? 'اختر اللون' : 'Select Color', '');
      return;
    }
    addToCart({
      productId: product.id,
      productName: language === 'ar' ? product.nameAr : product.nameEn,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    router.push('/checkout/index');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${language === 'ar' ? product.nameAr : product.nameEn}\n${language === 'ar' ? 'السعر:' : 'Price:'} ${product.price.toLocaleString()} ${t('rial', language)}\n\nمتجر DAVA للأزياء الفاخرة`,
        title: 'DAVA Store',
      });
    } catch {}
  };

  const handleSubmitReview = () => {
    if (!user) {
      showAlert(language === 'ar' ? 'يجب تسجيل الدخول' : 'Login Required', '');
      return;
    }
    if (!reviewComment.trim()) {
      showAlert(language === 'ar' ? 'اكتب تقييمك' : 'Write Review', '');
      return;
    }
    addReview({
      id: `r_${Date.now()}`,
      productId: product.id,
      userId: user.id,
      userName: user.name,
      rating: reviewRating,
      comment: reviewComment,
      createdAt: new Date().toISOString(),
    });
    setReviewComment('');
    setShowReviewForm(false);
    showAlert(t('success', language), language === 'ar' ? 'تم إضافة تقييمك' : 'Review added');
  };

  const discountSave = product.originalPrice
    ? product.originalPrice - product.price
    : 0;

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} bounces={false}>
        {/* Image Gallery */}
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal pagingEnabled showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={e => setCurrentImage(Math.round(e.nativeEvent.contentOffset.x / width))}
          >
            {product.images.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: img }}
                style={styles.mainImage}
                contentFit="cover"
                transition={200}
              />
            ))}
          </ScrollView>

          {/* Gradient Overlay Top */}
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'transparent']}
            style={[styles.topGradient, { paddingTop: insets.top + 8 }]}
          >
            <TouchableOpacity style={styles.circleBtn} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={22} color="#fff" />
            </TouchableOpacity>
            <View style={styles.topRightActions}>
              <TouchableOpacity style={styles.circleBtn} onPress={() => toggleFavorite(product.id)}>
                <MaterialIcons name={isFav ? 'favorite' : 'favorite-border'} size={22} color={isFav ? Colors.error : '#fff'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.circleBtn} onPress={handleShare}>
                <MaterialIcons name="share" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          {/* Bottom Gradient & Dots */}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.6)']}
            style={styles.bottomGradient}
          >
            <View style={styles.imageDots}>
              {product.images.map((_, idx) => (
                <View key={idx} style={[styles.dot, currentImage === idx && styles.activeDot]} />
              ))}
            </View>
          </LinearGradient>

          {/* Badges */}
          {product.isOffer && product.offerPercent ? (
            <View style={styles.offerBadge}>
              <Text style={styles.offerBadgeText}>-{product.offerPercent}%</Text>
            </View>
          ) : null}
          {product.isNew ? (
            <View style={[styles.offerBadge, styles.newBadge]}>
              <Text style={styles.offerBadgeText}>{language === 'ar' ? 'جديد' : 'NEW'}</Text>
            </View>
          ) : null}
          {product.stock <= 5 && product.stock > 0 ? (
            <View style={styles.stockBadge}>
              <MaterialIcons name="warning" size={12} color={Colors.warning} />
              <Text style={styles.stockBadgeText}>{language === 'ar' ? `آخر ${product.stock} قطع` : `Last ${product.stock} left`}</Text>
            </View>
          ) : null}
        </View>

        {/* Thumbnails Row */}
        {product.images.length > 1 ? (
          <View style={styles.thumbsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnails}>
              {product.images.map((img, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={[styles.thumbnail, currentImage === idx && styles.activeThumbnail]}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: img }} style={styles.thumbnailImage} contentFit="cover" transition={100} />
                  {currentImage === idx ? (
                    <View style={styles.thumbOverlay} />
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.details}>
          {/* Category Tag */}
          <View style={styles.categoryTag}>
            <MaterialIcons name="category" size={12} color={Colors.primary} />
            <Text style={styles.categoryTagText}>{product.category.toUpperCase()}</Text>
          </View>

          {/* Name */}
          <Text style={[styles.productName, isRTL && styles.rtlText]}>
            {language === 'ar' ? product.nameAr : product.nameEn}
          </Text>

          {/* Rating & Sold */}
          <View style={styles.ratingBar}>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map(s => (
                <MaterialIcons
                  key={s}
                  name={s <= Math.round(product.rating) ? 'star' : 'star-border'}
                  size={16}
                  color={Colors.primary}
                />
              ))}
            </View>
            <Text style={styles.ratingNum}>{product.rating}</Text>
            <Text style={styles.ratingCount}>({product.reviewCount})</Text>
            <View style={styles.ratingDot} />
            <MaterialIcons name="shopping-bag" size={13} color={Colors.textMuted} />
            <Text style={styles.soldCount}>{product.sold.toLocaleString()} {language === 'ar' ? 'مبيع' : 'sold'}</Text>
          </View>

          {/* Price Card */}
          <LinearGradient colors={['#1A1400', '#0D0A00']} style={styles.priceCard}>
            <View style={styles.priceRow}>
              <View>
                <Text style={styles.mainPrice}>
                  {product.price.toLocaleString()} {t('rial', language)}
                </Text>
                {product.originalPrice ? (
                  <Text style={styles.originalPrice}>
                    {product.originalPrice.toLocaleString()} {t('rial', language)}
                  </Text>
                ) : null}
              </View>
              {discountSave > 0 ? (
                <View style={styles.saveBadge}>
                  <Text style={styles.saveText}>{language === 'ar' ? 'وفّر' : 'Save'}</Text>
                  <Text style={styles.saveAmount}>{discountSave.toLocaleString()}</Text>
                  <Text style={styles.saveCurrency}>{t('rial', language)}</Text>
                </View>
              ) : null}
            </View>
          </LinearGradient>

          <View style={styles.divider} />

          {/* Sizes */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionLabel, isRTL && styles.rtlText]}>{t('size', language)}</Text>
            {selectedSize ? (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>{selectedSize}</Text>
              </View>
            ) : (
              <Text style={styles.selectHint}>{language === 'ar' ? 'اختر مقاساً' : 'Pick a size'}</Text>
            )}
          </View>
          <View style={styles.optionsRow}>
            {product.sizes.map(size => (
              <TouchableOpacity
                key={size}
                style={[styles.sizeChip, selectedSize === size && styles.selectedChip]}
                onPress={() => setSelectedSize(size)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, selectedSize === size && styles.selectedChipText]}>{size}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Colors */}
          <View style={[styles.sectionHeader, { marginTop: Spacing.md }]}>
            <Text style={[styles.sectionLabel, isRTL && styles.rtlText]}>{t('color', language)}</Text>
            {selectedColor ? (
              <View style={styles.selectedBadge}>
                <Text style={styles.selectedBadgeText}>{selectedColor}</Text>
              </View>
            ) : (
              <Text style={styles.selectHint}>{language === 'ar' ? 'اختر لوناً' : 'Pick a color'}</Text>
            )}
          </View>
          <View style={styles.optionsRow}>
            {product.colors.map(color => (
              <TouchableOpacity
                key={color}
                style={[styles.colorChip, selectedColor === color && styles.selectedChip]}
                onPress={() => setSelectedColor(color)}
                activeOpacity={0.7}
              >
                <Text style={[styles.chipText, selectedColor === color && styles.selectedChipText]}>{color}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quantity & Stock */}
          <View style={[styles.sectionHeader, { marginTop: Spacing.md }]}>
            <Text style={[styles.sectionLabel, isRTL && styles.rtlText]}>{t('quantity', language)}</Text>
            <View style={[styles.stockPill, { backgroundColor: product.stock > 0 ? Colors.success + '22' : Colors.error + '22' }]}>
              <MaterialIcons
                name={product.stock > 0 ? 'check-circle' : 'cancel'}
                size={12}
                color={product.stock > 0 ? Colors.success : Colors.error}
              />
              <Text style={[styles.stockText, { color: product.stock > 0 ? Colors.success : Colors.error }]}>
                {product.stock > 0 ? `${product.stock} ${t('inStock', language)}` : t('outOfStock', language)}
              </Text>
            </View>
          </View>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
              onPress={() => setQuantity(q => Math.max(1, q - 1))}
              disabled={quantity <= 1}
            >
              <MaterialIcons name="remove" size={18} color={quantity <= 1 ? Colors.textMuted : Colors.textPrimary} />
            </TouchableOpacity>
            <View style={styles.qtyDisplay}>
              <Text style={styles.qtyText}>{quantity}</Text>
            </View>
            <TouchableOpacity
              style={[styles.qtyBtn, quantity >= product.stock && styles.qtyBtnDisabled]}
              onPress={() => setQuantity(q => Math.min(product.stock, q + 1))}
              disabled={quantity >= product.stock}
            >
              <MaterialIcons name="add" size={18} color={quantity >= product.stock ? Colors.textMuted : Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.totalPriceHint}>
              = {(product.price * quantity).toLocaleString()} {t('rial', language)}
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Tabs: Description / Reviews */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'desc' && styles.activeTabBtn]}
              onPress={() => setActiveTab('desc')}
            >
              <MaterialIcons name="description" size={16} color={activeTab === 'desc' ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.tabBtnText, activeTab === 'desc' && styles.activeTabBtnText]}>
                {t('description', language)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'reviews' && styles.activeTabBtn]}
              onPress={() => setActiveTab('reviews')}
            >
              <MaterialIcons name="star" size={16} color={activeTab === 'reviews' ? Colors.primary : Colors.textMuted} />
              <Text style={[styles.tabBtnText, activeTab === 'reviews' && styles.activeTabBtnText]}>
                {t('reviews', language)} ({productReviews.length})
              </Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'desc' ? (
            <View style={styles.descSection}>
              <Text style={[styles.description, isRTL && styles.rtlText]}>
                {language === 'ar' ? product.descriptionAr : product.descriptionEn}
              </Text>
              {/* Specs Summary */}
              <View style={styles.specsGrid}>
                <View style={styles.specItem}>
                  <MaterialIcons name="category" size={20} color={Colors.primary} />
                  <Text style={styles.specLabel}>{language === 'ar' ? 'التصنيف' : 'Category'}</Text>
                  <Text style={styles.specValue}>{product.category}</Text>
                </View>
                <View style={styles.specItem}>
                  <MaterialIcons name="straighten" size={20} color={Colors.primary} />
                  <Text style={styles.specLabel}>{language === 'ar' ? 'المقاسات' : 'Sizes'}</Text>
                  <Text style={styles.specValue}>{product.sizes.join(', ')}</Text>
                </View>
                <View style={styles.specItem}>
                  <MaterialIcons name="palette" size={20} color={Colors.primary} />
                  <Text style={styles.specLabel}>{language === 'ar' ? 'الألوان' : 'Colors'}</Text>
                  <Text style={styles.specValue}>{product.colors.join(', ')}</Text>
                </View>
                <View style={styles.specItem}>
                  <MaterialIcons name="inventory-2" size={20} color={Colors.primary} />
                  <Text style={styles.specLabel}>{language === 'ar' ? 'المخزون' : 'Stock'}</Text>
                  <Text style={styles.specValue}>{product.stock}</Text>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.reviewsSection}>
              {/* Review Summary */}
              <View style={styles.reviewSummary}>
                <View style={styles.ratingBig}>
                  <Text style={styles.ratingBigNum}>{product.rating}</Text>
                  <View style={styles.ratingBigStars}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <MaterialIcons key={s} name="star" size={20} color={s <= Math.round(product.rating) ? Colors.primary : Colors.border} />
                    ))}
                  </View>
                  <Text style={styles.ratingBigCount}>{product.reviewCount} {t('reviews', language)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.writeReviewBtn}
                  onPress={() => setShowReviewForm(!showReviewForm)}
                >
                  <MaterialIcons name="edit" size={16} color="#000" />
                  <Text style={styles.writeReviewText}>{t('writeReview', language)}</Text>
                </TouchableOpacity>
              </View>

              {showReviewForm ? (
                <View style={styles.reviewForm}>
                  <Text style={[styles.sectionLabel, { marginBottom: 8 }]}>{language === 'ar' ? 'تقييمك:' : 'Your Rating:'}</Text>
                  <View style={styles.starSelector}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <TouchableOpacity key={s} onPress={() => setReviewRating(s)}>
                        <MaterialIcons name="star" size={36} color={s <= reviewRating ? Colors.primary : Colors.border} />
                      </TouchableOpacity>
                    ))}
                  </View>
                  <TextInput
                    style={[styles.reviewInput, isRTL && styles.rtlInput]}
                    value={reviewComment}
                    onChangeText={setReviewComment}
                    placeholder={language === 'ar' ? 'اكتب رأيك في المنتج...' : 'Write your product review...'}
                    placeholderTextColor={Colors.textMuted}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  <View style={styles.reviewFormActions}>
                    <TouchableOpacity style={styles.cancelReviewBtn} onPress={() => setShowReviewForm(false)}>
                      <Text style={styles.cancelReviewText}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.submitReviewBtn} onPress={handleSubmitReview}>
                      <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.submitBtnGradient}>
                        <Text style={styles.submitBtnText}>{language === 'ar' ? 'إرسال' : 'Submit'}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              {productReviews.length === 0 ? (
                <View style={styles.noReviews}>
                  <MaterialIcons name="rate-review" size={48} color={Colors.textMuted} />
                  <Text style={styles.noReviewsText}>{t('noReviews', language)}</Text>
                </View>
              ) : (
                productReviews.map(review => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewTop}>
                      <View style={styles.reviewAvatar}>
                        <Text style={styles.reviewAvatarText}>{review.userName.charAt(0).toUpperCase()}</Text>
                      </View>
                      <View style={styles.reviewMeta}>
                        <Text style={styles.reviewerName}>{review.userName}</Text>
                        <View style={styles.reviewStars}>
                          {[1, 2, 3, 4, 5].map(s => (
                            <MaterialIcons key={s} name="star" size={13} color={s <= review.rating ? Colors.primary : Colors.border} />
                          ))}
                        </View>
                        <Text style={styles.reviewDate}>
                          {new Date(review.createdAt).toLocaleDateString(language === 'ar' ? 'ar-YE' : 'en-US')}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.reviewComment, isRTL && styles.rtlText]}>{review.comment}</Text>
                  </View>
                ))
              )}
            </View>
          )}

          {/* Similar Products */}
          <View style={styles.divider} />
          <Text style={[styles.sectionLabel, { marginBottom: Spacing.sm }]}>
            {language === 'ar' ? 'منتجات مشابهة' : 'Similar Products'}
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.similarList}>
            {products
              .filter(p => p.category === product.category && p.id !== product.id && p.isVisible)
              .slice(0, 6)
              .map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={styles.similarCard}
                  onPress={() => router.push({ pathname: '/product/[id]', params: { id: p.id } })}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: p.images[0] }} style={styles.similarImage} contentFit="cover" transition={150} />
                  {p.isOffer && p.offerPercent ? (
                    <View style={styles.similarBadge}><Text style={styles.similarBadgeText}>-{p.offerPercent}%</Text></View>
                  ) : null}
                  <View style={styles.similarInfo}>
                    <Text style={styles.similarName} numberOfLines={2}>
                      {language === 'ar' ? p.nameAr : p.nameEn}
                    </Text>
                    <Text style={styles.similarPrice}>{p.price.toLocaleString()} {t('rial', language)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 12 }]}>
        <Animated.View style={[styles.addToCartBtnWrap, { transform: [{ scale: cartBounce }] }]}>
          <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart} activeOpacity={0.8}>
            <MaterialIcons name="add-shopping-cart" size={20} color={Colors.primary} />
            <Text style={styles.addToCartText}>{t('addToCart', language)}</Text>
          </TouchableOpacity>
        </Animated.View>
        <TouchableOpacity style={styles.buyNowBtn} onPress={handleBuyNow} activeOpacity={0.85} disabled={product.stock === 0}>
          <LinearGradient
            colors={product.stock === 0 ? ['#555', '#333'] : [Colors.primaryLight, Colors.primary, Colors.primaryDark]}
            style={styles.buyNowGradient}
          >
            <MaterialIcons name="bolt" size={18} color="#000" />
            <Text style={styles.buyNowText}>
              {product.stock === 0 ? (language === 'ar' ? 'نفد المخزون' : 'Out of Stock') : t('buyNow', language)}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  center: { justifyContent: 'center', alignItems: 'center', gap: 12 },
  notFoundText: { color: Colors.textMuted, fontSize: FontSize.lg, fontWeight: FontWeight.medium },
  goBackBtn: { marginTop: 8, paddingHorizontal: 24, paddingVertical: 10, backgroundColor: Colors.bgCard, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border },
  goBackText: { color: Colors.textPrimary, fontSize: FontSize.sm },

  // Gallery
  galleryContainer: { position: 'relative', backgroundColor: '#000' },
  mainImage: { width, height: 400 },
  topGradient: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl,
  },
  topRightActions: { flexDirection: 'row', gap: 8 },
  circleBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  bottomGradient: {
    position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
    justifyContent: 'flex-end', paddingBottom: 10,
  },
  imageDots: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)' },
  activeDot: { width: 20, height: 6, borderRadius: 3, backgroundColor: Colors.primary },
  offerBadge: {
    position: 'absolute', top: 60, right: 12,
    backgroundColor: Colors.error, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 4,
  },
  newBadge: { backgroundColor: Colors.success, top: 100 },
  offerBadgeText: { fontSize: FontSize.xs, color: '#fff', fontWeight: FontWeight.bold },
  stockBadge: {
    position: 'absolute', bottom: 14, left: 12,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: Colors.warning + '66',
  },
  stockBadgeText: { fontSize: FontSize.xs, color: Colors.warning },

  // Thumbnails
  thumbsContainer: { backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  thumbnails: { paddingHorizontal: Spacing.md, paddingVertical: 8, gap: 8 },
  thumbnail: { borderRadius: Radius.sm, overflow: 'hidden', borderWidth: 2, borderColor: 'transparent' },
  activeThumbnail: { borderColor: Colors.primary },
  thumbnailImage: { width: 64, height: 64 },
  thumbOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.primary + '22' },

  // Details
  details: { padding: Spacing.lg, paddingBottom: 120 },
  categoryTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    alignSelf: 'flex-start', backgroundColor: Colors.primary + '22',
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.borderGold,
  },
  categoryTagText: { fontSize: 10, color: Colors.primary, fontWeight: FontWeight.bold, letterSpacing: 1 },
  productName: {
    fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold,
    color: Colors.textPrimary, lineHeight: 32, marginBottom: Spacing.sm,
  },
  rtlText: { textAlign: 'right' },

  // Rating Bar
  ratingBar: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: Spacing.md, flexWrap: 'wrap' },
  starsRow: { flexDirection: 'row', gap: 1 },
  ratingNum: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },
  ratingCount: { fontSize: FontSize.xs, color: Colors.textMuted },
  ratingDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.textMuted },
  soldCount: { fontSize: FontSize.xs, color: Colors.textMuted },

  // Price Card
  priceCard: {
    borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: Colors.borderGold,
  },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mainPrice: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.primary },
  originalPrice: { fontSize: FontSize.sm, color: Colors.textMuted, textDecorationLine: 'line-through', marginTop: 2 },
  saveBadge: {
    backgroundColor: Colors.success + '22', borderRadius: Radius.md,
    padding: Spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: Colors.success + '44',
  },
  saveText: { fontSize: FontSize.xs, color: Colors.success },
  saveAmount: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.success },
  saveCurrency: { fontSize: FontSize.xs, color: Colors.success },

  divider: { height: 1, backgroundColor: Colors.divider, marginVertical: Spacing.md },

  // Section
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionLabel: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  selectedBadge: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 2 },
  selectedBadgeText: { fontSize: FontSize.xs, color: '#000', fontWeight: FontWeight.bold },
  selectHint: { fontSize: FontSize.xs, color: Colors.textMuted },

  // Chips
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sizeChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.sm,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.bgCard,
  },
  colorChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: Radius.sm,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.bgCard,
  },
  selectedChip: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  chipText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  selectedChipText: { color: '#000', fontWeight: FontWeight.bold },

  // Quantity
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  qtyBtn: {
    width: 40, height: 40, borderRadius: Radius.sm,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.bgCard,
    justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnDisabled: { opacity: 0.4 },
  qtyDisplay: {
    width: 52, height: 40, borderRadius: Radius.sm,
    backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.borderGold,
    justifyContent: 'center', alignItems: 'center',
  },
  qtyText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  totalPriceHint: { fontSize: FontSize.sm, color: Colors.textSecondary, marginLeft: 4 },
  stockPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full,
  },
  stockText: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },

  // Tabs
  tabsContainer: {
    flexDirection: 'row', borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.lg, overflow: 'hidden', marginBottom: Spacing.md,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 12, backgroundColor: Colors.bgCard,
  },
  activeTabBtn: { backgroundColor: Colors.bgSurface, borderBottomWidth: 2, borderBottomColor: Colors.primary },
  tabBtnText: { fontSize: FontSize.sm, color: Colors.textMuted, fontWeight: FontWeight.medium },
  activeTabBtnText: { color: Colors.primary, fontWeight: FontWeight.bold },

  // Description
  descSection: { gap: Spacing.md },
  description: { fontSize: FontSize.base, color: Colors.textSecondary, lineHeight: 26 },
  specsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  specItem: {
    width: '47%', backgroundColor: Colors.bgCard, borderRadius: Radius.md,
    padding: Spacing.sm, alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: Colors.border,
  },
  specLabel: { fontSize: FontSize.xs, color: Colors.textMuted },
  specValue: { fontSize: FontSize.xs, color: Colors.textPrimary, fontWeight: FontWeight.semibold, textAlign: 'center' },

  // Reviews
  reviewsSection: { gap: Spacing.sm },
  reviewSummary: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  ratingBig: { alignItems: 'center', gap: 4 },
  ratingBigNum: { fontSize: 36, fontWeight: FontWeight.extrabold, color: Colors.primary },
  ratingBigStars: { flexDirection: 'row', gap: 2 },
  ratingBigCount: { fontSize: FontSize.xs, color: Colors.textMuted },
  writeReviewBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 10,
  },
  writeReviewText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#000' },
  reviewForm: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.borderGold, gap: Spacing.sm,
  },
  starSelector: { flexDirection: 'row', gap: 6 },
  reviewInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    backgroundColor: Colors.bgInput, padding: Spacing.md,
    fontSize: FontSize.base, color: Colors.textPrimary, minHeight: 90,
  },
  rtlInput: { textAlign: 'right' },
  reviewFormActions: { flexDirection: 'row', gap: 8 },
  cancelReviewBtn: {
    flex: 1, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingVertical: 10, alignItems: 'center',
  },
  cancelReviewText: { color: Colors.textSecondary },
  submitReviewBtn: { flex: 1, borderRadius: Radius.md, overflow: 'hidden' },
  submitBtnGradient: { paddingVertical: 10, alignItems: 'center' },
  submitBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#000' },
  noReviews: { alignItems: 'center', paddingVertical: 32, gap: 8 },
  noReviewsText: { fontSize: FontSize.base, color: Colors.textMuted },
  reviewCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.border,
  },
  reviewTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: 8 },
  reviewAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  reviewAvatarText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#000' },
  reviewMeta: { flex: 1, gap: 2 },
  reviewerName: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  reviewStars: { flexDirection: 'row', gap: 1 },
  reviewDate: { fontSize: 10, color: Colors.textMuted },
  reviewComment: { fontSize: FontSize.sm, color: Colors.textSecondary, lineHeight: 20 },

  // Similar Products
  similarList: { gap: 10, paddingRight: Spacing.md },
  similarCard: {
    width: 130, backgroundColor: Colors.bgCard,
    borderRadius: Radius.md, overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.border,
  },
  similarImage: { width: 130, height: 130 },
  similarBadge: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: Colors.error, borderRadius: Radius.xs, paddingHorizontal: 5, paddingVertical: 2,
  },
  similarBadgeText: { fontSize: 9, color: '#fff', fontWeight: FontWeight.bold },
  similarInfo: { padding: 8, gap: 3 },
  similarName: { fontSize: 11, color: Colors.textPrimary, fontWeight: FontWeight.medium, lineHeight: 15 },
  similarPrice: { fontSize: FontSize.xs, color: Colors.primary, fontWeight: FontWeight.bold },

  // Bottom Actions
  bottomActions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: Spacing.sm,
    backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.borderGold,
    padding: Spacing.md,
  },
  addToCartBtnWrap: { flex: 1 },
  addToCartBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1.5, borderColor: Colors.borderGold,
    borderRadius: Radius.md, paddingVertical: 14,
    backgroundColor: Colors.bgCard,
  },
  addToCartText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.primary },
  buyNowBtn: { flex: 1.4, borderRadius: Radius.md, overflow: 'hidden' },
  buyNowGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 4 },
  buyNowText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#000' },
});
