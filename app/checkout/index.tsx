import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { useAlert } from '@/template';
import { t } from '@/constants/i18n';
import { APP_CONFIG } from '@/constants/config';
import { TextInput, KeyboardAvoidingView, Platform, Linking } from 'react-native';

export default function CheckoutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, user, cart, cartTotal, clearCart } = useApp();
  const { addOrder, validateCoupon, updateCoupon, settings } = useData();
  const { showAlert } = useAlert();

  const [address, setAddress] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const isRTL = language === 'ar';
  const activeCities = settings.deliveryCities.filter(c => c.isActive);
  const activeBanks = settings.paymentBanks.filter(b => b.isActive);
  const deliveryFee = activeCities.find(c => c.id === selectedCity)?.fee || 0;
  const total = cartTotal + deliveryFee - couponDiscount;

  const handleApplyCoupon = async () => {
    const coupon = await validateCoupon(couponCode, cartTotal);
    if (coupon) {
      const disc = coupon.type === 'percent' ? Math.round(cartTotal * coupon.discount / 100) : coupon.discount;
      setCouponDiscount(disc);
      setAppliedCoupon(coupon);
      showAlert(t('success', language), `${isRTL ? 'خصم' : 'Discount'}: ${disc.toLocaleString()} ${isRTL ? 'ريال' : 'YER'}`);
    } else {
      showAlert(isRTL ? 'كود غير صحيح' : 'Invalid Code', '');
    }
  };

  const pickReceipt = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!res.canceled && res.assets[0]) setReceiptImage(res.assets[0].uri);
  };

  const handlePlaceOrder = async () => {
    if (!selectedCity) { showAlert(isRTL ? 'اختر المدينة' : 'Select City', ''); return; }
    if (!address.trim()) { showAlert(isRTL ? 'أدخل العنوان' : 'Enter Address', ''); return; }
    if (!selectedPayment) { showAlert(isRTL ? 'اختر طريقة الدفع' : 'Select Payment', ''); return; }
    if (!receiptImage) { showAlert(isRTL ? 'رفع إثبات الدفع مطلوب' : 'Receipt Required', ''); return; }

    setLoading(true);
    const orderNumber = `DAVA${Date.now().toString().slice(-8)}`;
    const order = {
      id: `order_${Date.now()}`,
      orderNumber,
      userId: user?.id || 'guest',
      userName: user?.name || 'Guest',
      userPhone: user?.phone || '',
      items: cart.map(i => ({
        productId: i.productId, productName: i.productName,
        price: i.price, quantity: i.quantity,
        size: i.size, color: i.color, image: i.image,
      })),
      subtotal: cartTotal,
      deliveryFee,
      discount: couponDiscount,
      total,
      city: selectedCity,
      address,
      paymentMethod: selectedPayment,
      paymentStatus: 'pending' as const,
      paymentScreenshot: receiptImage,
      status: 'pending' as const,
      couponCode: appliedCoupon?.code,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await addOrder(order);
      if (appliedCoupon) await updateCoupon(appliedCoupon.id, { usedCount: appliedCoupon.usedCount + 1 });

      const adminPhone = settings.adminWhatsApp || APP_CONFIG.adminWhatsApp;
      const cityName = activeCities.find(c => c.id === selectedCity);
      const bankName = activeBanks.find(b => b.id === selectedPayment);
      const itemsList = cart.map(i => `• ${i.productName} (${i.size}/${i.color}) x${i.quantity}`).join('\n');
      const msg = `🛍️ طلب جديد - DAVA\n\n📦 ${orderNumber}\n👤 ${user?.name} | ${user?.phone || user?.email}\n📍 ${isRTL ? cityName?.nameAr : cityName?.nameEn}\n🏠 ${address}\n\n${itemsList}\n\n💳 ${isRTL ? bankName?.nameAr : bankName?.nameEn}\n💰 الإجمالي: ${total.toLocaleString()} ريال`;
      Linking.openURL(`https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`);

      clearCart();
      router.replace('/checkout/success');
    } catch {
      showAlert(isRTL ? 'خطأ' : 'Error', isRTL ? 'فشل إنشاء الطلب' : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isRTL ? 'إتمام الطلب' : 'Checkout'}</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Summary */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtl]}>{isRTL ? 'ملخص الطلب' : 'Order Summary'}</Text>
            {cart.map((item, i) => (
              <View key={i} style={styles.cartRow}>
                <Image source={{ uri: item.image }} style={styles.cartThumb} contentFit="cover" />
                <View style={styles.cartInfo}>
                  <Text style={[styles.cartName, isRTL && styles.rtl]} numberOfLines={1}>{item.productName}</Text>
                  <Text style={styles.cartVar}>{item.size} · {item.color} · x{item.quantity}</Text>
                </View>
                <Text style={styles.cartPrice}>{(item.price * item.quantity).toLocaleString()}</Text>
              </View>
            ))}
          </View>

          {/* Coupon */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtl]}>{isRTL ? 'كود الخصم' : 'Coupon Code'}</Text>
            <View style={styles.couponRow}>
              <TextInput
                style={[styles.couponInput, isRTL && styles.rtl]}
                value={couponCode}
                onChangeText={setCouponCode}
                placeholder={isRTL ? 'أدخل كود الخصم' : 'Enter coupon code'}
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCoupon}>
                <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.applyGrad}>
                  <Text style={styles.applyTxt}>{isRTL ? 'تطبيق' : 'Apply'}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            {couponDiscount > 0 ? (
              <Text style={styles.couponOk}>✓ {isRTL ? `خصم ${couponDiscount.toLocaleString()} ريال` : `Discount: ${couponDiscount.toLocaleString()} YER`}</Text>
            ) : null}
          </View>

          {/* City */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtl]}>{isRTL ? 'المدينة' : 'City'}</Text>
            <View style={styles.cityGrid}>
              {activeCities.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.cityChip, selectedCity === c.id && styles.cityChipActive]}
                  onPress={() => setSelectedCity(c.id)}
                >
                  <Text style={[styles.cityName, selectedCity === c.id && styles.cityNameActive]}>
                    {isRTL ? c.nameAr : c.nameEn}
                  </Text>
                  <Text style={[styles.cityFee, selectedCity === c.id && styles.cityFeeActive]}>
                    {c.fee.toLocaleString()} {isRTL ? 'ريال' : 'YER'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Address */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtl]}>{isRTL ? 'العنوان التفصيلي' : 'Detailed Address'}</Text>
            <TextInput
              style={[styles.textarea, isRTL && styles.rtl]}
              value={address}
              onChangeText={setAddress}
              placeholder={isRTL ? 'الحي، الشارع، رقم المنزل...' : 'Neighborhood, street, house...'}
              placeholderTextColor={Colors.textMuted}
              multiline numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Payment */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtl]}>{isRTL ? 'طريقة الدفع' : 'Payment Method'}</Text>
            {activeBanks.map(b => (
              <TouchableOpacity
                key={b.id}
                style={[styles.bankRow, selectedPayment === b.id && styles.bankRowActive]}
                onPress={() => setSelectedPayment(b.id)}
              >
                <MaterialIcons name="account-balance" size={20} color={selectedPayment === b.id ? Colors.primary : Colors.textMuted} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bankName, selectedPayment === b.id && { color: Colors.primary }]}>
                    {isRTL ? b.nameAr : b.nameEn}
                  </Text>
                  <Text style={styles.bankAcc}>{b.accountNumber} · {b.accountName}</Text>
                </View>
                {selectedPayment === b.id ? <MaterialIcons name="check-circle" size={18} color={Colors.primary} /> : null}
              </TouchableOpacity>
            ))}
          </View>

          {/* Receipt */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtl]}>{isRTL ? 'إثبات الدفع' : 'Payment Screenshot'}</Text>
            <TouchableOpacity style={styles.uploadArea} onPress={pickReceipt}>
              {receiptImage ? (
                <Image source={{ uri: receiptImage }} style={styles.receiptImg} contentFit="cover" />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <MaterialIcons name="cloud-upload" size={36} color={Colors.primary} />
                  <Text style={styles.uploadTxt}>
                    {isRTL ? 'اضغط لرفع صورة التحويل' : 'Tap to upload transfer screenshot'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtl]}>{isRTL ? 'ملاحظات' : 'Notes'}</Text>
            <TextInput
              style={[styles.input, isRTL && styles.rtl]}
              value={notes}
              onChangeText={setNotes}
              placeholder={isRTL ? 'أي ملاحظات...' : 'Any special notes...'}
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Totals */}
          <View style={styles.totalsCard}>
            {[
              { l: isRTL ? 'المجموع الفرعي' : 'Subtotal', v: `${cartTotal.toLocaleString()} ${isRTL ? 'ريال' : 'YER'}` },
              { l: isRTL ? 'رسوم التوصيل' : 'Delivery Fee', v: `${deliveryFee.toLocaleString()} ${isRTL ? 'ريال' : 'YER'}` },
            ].map(row => (
              <View key={row.l} style={styles.totalRow}>
                <Text style={styles.totalLabel}>{row.l}</Text>
                <Text style={styles.totalVal}>{row.v}</Text>
              </View>
            ))}
            {couponDiscount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: Colors.success }]}>{isRTL ? 'خصم' : 'Discount'}</Text>
                <Text style={[styles.totalVal, { color: Colors.success }]}>-{couponDiscount.toLocaleString()} {isRTL ? 'ريال' : 'YER'}</Text>
              </View>
            ) : null}
            <View style={[styles.totalRow, styles.grandRow]}>
              <Text style={styles.grandLabel}>{isRTL ? 'الإجمالي' : 'Total'}</Text>
              <Text style={styles.grandVal}>{total.toLocaleString()} {isRTL ? 'ريال' : 'YER'}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity style={styles.placeBtn} onPress={handlePlaceOrder} disabled={loading}>
            <LinearGradient colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]} style={styles.placeBtnGrad}>
              <MaterialIcons name="shopping-bag" size={20} color="#0D1E16" />
              <Text style={styles.placeBtnTxt}>
                {loading ? (isRTL ? 'جاري...' : 'Processing...') : (isRTL ? 'تأكيد الطلب' : 'Place Order')}
              </Text>
              <Text style={styles.placeBtnTotal}>{total.toLocaleString()} {isRTL ? 'ريال' : 'YER'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 90 },
  rtl: { textAlign: 'right' },
  card: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 10 },
  cartRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 },
  cartThumb: { width: 48, height: 48, borderRadius: Radius.sm },
  cartInfo: { flex: 1 },
  cartName: { fontSize: FontSize.sm, color: Colors.textPrimary },
  cartVar: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  cartPrice: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
  couponRow: { flexDirection: 'row', gap: 8 },
  couponInput: {
    flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm,
    backgroundColor: Colors.bgInput, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: FontSize.sm, color: Colors.textPrimary,
  },
  applyBtn: { borderRadius: Radius.sm, overflow: 'hidden' },
  applyGrad: { paddingHorizontal: 14, paddingVertical: 10 },
  applyTxt: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#0D1E16' },
  couponOk: { fontSize: FontSize.sm, color: Colors.success, marginTop: 6 },
  cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cityChip: {
    flex: 1, minWidth: '30%', borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, padding: 10, alignItems: 'center',
  },
  cityChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  cityName: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  cityNameActive: { color: Colors.primary, fontWeight: FontWeight.bold },
  cityFee: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  cityFeeActive: { color: Colors.primary },
  textarea: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm,
    backgroundColor: Colors.bgInput, padding: 12, fontSize: FontSize.sm,
    color: Colors.textPrimary, minHeight: 80, textAlignVertical: 'top',
  },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm,
    backgroundColor: Colors.bgInput, paddingHorizontal: 12, paddingVertical: 11,
    fontSize: FontSize.sm, color: Colors.textPrimary,
  },
  bankRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, marginBottom: 8,
  },
  bankRowActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  bankName: { fontSize: FontSize.base, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  bankAcc: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  uploadArea: {
    borderWidth: 2, borderColor: Colors.borderGold, borderStyle: 'dashed',
    borderRadius: Radius.lg, overflow: 'hidden', minHeight: 110,
  },
  uploadPlaceholder: { alignItems: 'center', justifyContent: 'center', padding: 24, gap: 8 },
  uploadTxt: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
  receiptImg: { width: '100%', height: 200 },
  totalsCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderGold,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  totalLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  totalVal: { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  grandRow: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 4, paddingTop: 10 },
  grandLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  grandVal: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.primary },
  bottomBar: {
    backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.border,
    padding: Spacing.md,
  },
  placeBtn: { borderRadius: Radius.md, overflow: 'hidden' },
  placeBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 15, gap: 8 },
  placeBtnTxt: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#0D1E16' },
  placeBtnTotal: { fontSize: FontSize.sm, color: '#0D1E16', opacity: 0.8 },
});
