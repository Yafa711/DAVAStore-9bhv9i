import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, KeyboardAvoidingView, Platform, Image, Linking,
} from 'react-native';
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

  const isRTL = language === 'ar';
  const activeCities = settings.deliveryCities.filter(c => c.isActive);
  const activeBanks = settings.paymentBanks.filter(b => b.isActive);

  const deliveryFee = activeCities.find(c => c.id === selectedCity)?.fee || 0;
  const selectedBank = activeBanks.find(b => b.id === selectedPayment);
  const total = cartTotal + deliveryFee - couponDiscount;

  const handleApplyCoupon = async () => {
    const coupon = await validateCoupon(couponCode, cartTotal);
    if (coupon) {
      const discount = coupon.type === 'percent'
        ? Math.round(cartTotal * coupon.discount / 100)
        : coupon.discount;
      setCouponDiscount(discount);
      setAppliedCoupon(coupon);
      showAlert(t('success', language), `${language === 'ar' ? 'تم تطبيق خصم' : 'Discount applied'}: ${discount.toLocaleString()} ${t('rial', language)}`);
    } else {
      showAlert(language === 'ar' ? 'كود غير صحيح' : 'Invalid Code', language === 'ar' ? 'الكود غير صحيح أو منتهي الصلاحية' : 'Code is invalid or expired');
    }
  };

  const pickReceipt = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  const handlePlaceOrder = () => {
    if (!selectedCity) {
      showAlert(language === 'ar' ? 'اختر المدينة' : 'Select City', '');
      return;
    }
    if (!address.trim()) {
      showAlert(language === 'ar' ? 'أدخل العنوان' : 'Enter Address', '');
      return;
    }
    if (!selectedPayment) {
      showAlert(language === 'ar' ? 'اختر طريقة الدفع' : 'Select Payment', '');
      return;
    }
    if (!receiptImage) {
      showAlert(language === 'ar' ? 'رفع إثبات الدفع مطلوب' : 'Receipt Required', language === 'ar' ? 'يرجى رفع صورة إثبات الدفع' : 'Please upload payment receipt');
      return;
    }

    const orderNumber = `DAVA${Date.now().toString().slice(-8)}`;
    const order = {
      id: `order_${Date.now()}`,
      orderNumber,
      userId: user?.id || 'guest',
      userName: user?.name || 'Guest',
      userPhone: user?.phone || '',
      items: cart.map(item => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.image,
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

    addOrder(order);
    if (appliedCoupon) {
      updateCoupon(appliedCoupon.id, { usedCount: appliedCoupon.usedCount + 1 });
    }

    // Notify admin via WhatsApp
    const adminPhone = settings.adminWhatsApp || APP_CONFIG.adminWhatsApp;
    const itemsList = cart.map(i => `• ${i.productName} (${i.size}/${i.color}) x${i.quantity}`).join('\n');
    const cityName = activeCities.find(c => c.id === selectedCity);
    const bankName = activeBanks.find(b => b.id === selectedPayment);
    const msg = `🛍️ طلب جديد من DAVA\n\n📦 رقم الطلب: ${orderNumber}\n👤 العميل: ${user?.name} (${user?.phone})\n📍 المدينة: ${language === 'ar' ? cityName?.nameAr : cityName?.nameEn}\n🏠 العنوان: ${address}\n\n📋 المنتجات:\n${itemsList}\n\n💰 المجموع: ${cartTotal.toLocaleString()} ريال\n🚚 التوصيل: ${deliveryFee.toLocaleString()} ريال\n${couponDiscount > 0 ? `🎟️ خصم: ${couponDiscount.toLocaleString()} ريال\n` : ''}💳 الإجمالي: ${total.toLocaleString()} ريال\n\n🏦 طريقة الدفع: ${bankName?.nameAr}\n\n✅ تم رفع إثبات الدفع`;
    
    const whatsappUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(msg)}`;
    Linking.openURL(whatsappUrl);

    clearCart();
    router.replace('/checkout/success');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('checkout', language)}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Order Summary */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>{t('orderSummary', language)}</Text>
            {cart.map((item, idx) => (
              <View key={idx} style={styles.orderItemRow}>
                <Image source={{ uri: item.image }} style={styles.orderItemImage} />
                <View style={styles.orderItemInfo}>
                  <Text style={[styles.orderItemName, isRTL && styles.rtlText]} numberOfLines={1}>
                    {item.productName}
                  </Text>
                  <Text style={styles.orderItemVariant}>{item.size} · {item.color}</Text>
                  <Text style={styles.orderItemPrice}>{(item.price * item.quantity).toLocaleString()} {t('rial', language)}</Text>
                </View>
                <Text style={styles.orderItemQty}>x{item.quantity}</Text>
              </View>
            ))}
          </View>

          {/* Coupon */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>{t('couponCode', language)}</Text>
            <View style={styles.couponRow}>
              <TextInput
                style={[styles.couponInput, isRTL && styles.rtlInput]}
                value={couponCode}
                onChangeText={setCouponCode}
                placeholder={language === 'ar' ? 'أدخل كود الخصم' : 'Enter coupon code'}
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCoupon}>
                <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.applyBtnGradient}>
                  <Text style={styles.applyBtnText}>{t('applyCoupon', language)}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
            {couponDiscount > 0 ? (
              <Text style={styles.couponSuccess}>✓ {language === 'ar' ? 'خصم' : 'Discount'}: {couponDiscount.toLocaleString()} {t('rial', language)}</Text>
            ) : null}
          </View>

          {/* City */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>{t('city', language)}</Text>
            <View style={styles.cityGrid}>
              {activeCities.map(city => (
                <TouchableOpacity
                  key={city.id}
                  style={[styles.cityChip, selectedCity === city.id && styles.selectedCityChip]}
                  onPress={() => setSelectedCity(city.id)}
                >
                  <Text style={[styles.cityName, selectedCity === city.id && styles.selectedCityName]}>
                    {language === 'ar' ? city.nameAr : city.nameEn}
                  </Text>
                  <Text style={[styles.cityFee, selectedCity === city.id && styles.selectedCityFee]}>
                    {city.fee.toLocaleString()} {t('rial', language)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Address */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>{t('address', language)}</Text>
            <TextInput
              style={[styles.input, styles.textArea, isRTL && styles.rtlInput]}
              value={address}
              onChangeText={setAddress}
              placeholder={language === 'ar' ? 'الحي، الشارع، رقم المنزل...' : 'Neighborhood, street, house number...'}
              placeholderTextColor={Colors.textMuted}
              multiline numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Payment Method */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>{t('paymentMethod', language)}</Text>
            {activeBanks.map(bank => (
              <TouchableOpacity
                key={bank.id}
                style={[styles.bankItem, selectedPayment === bank.id && styles.selectedBankItem]}
                onPress={() => setSelectedPayment(bank.id)}
              >
                <MaterialIcons name="account-balance" size={22} color={selectedPayment === bank.id ? Colors.primary : Colors.textMuted} />
                <View style={styles.bankInfo}>
                  <Text style={[styles.bankName, selectedPayment === bank.id && styles.selectedBankName]}>
                    {language === 'ar' ? bank.nameAr : bank.nameEn}
                  </Text>
                  <Text style={styles.bankAccount}>
                    {bank.accountNumber} • {bank.accountName}
                  </Text>
                </View>
                {selectedPayment === bank.id ? (
                  <MaterialIcons name="check-circle" size={20} color={Colors.primary} />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>

          {/* Upload Receipt */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>{t('uploadReceipt', language)}</Text>
            <TouchableOpacity style={styles.uploadArea} onPress={pickReceipt}>
              {receiptImage ? (
                <Image source={{ uri: receiptImage }} style={styles.receiptPreview} />
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <MaterialIcons name="cloud-upload" size={40} color={Colors.primary} />
                  <Text style={styles.uploadText}>
                    {language === 'ar' ? 'اضغط لرفع صورة التحويل' : 'Tap to upload transfer screenshot'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Notes */}
          <View style={styles.card}>
            <Text style={[styles.cardTitle, isRTL && styles.rtlText]}>
              {language === 'ar' ? 'ملاحظات إضافية' : 'Additional Notes'}
            </Text>
            <TextInput
              style={[styles.input, isRTL && styles.rtlInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder={language === 'ar' ? 'أي ملاحظات أو تعليمات خاصة...' : 'Any special notes or instructions...'}
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          {/* Totals */}
          <View style={styles.totalsCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('subtotal', language)}</Text>
              <Text style={styles.totalValue}>{cartTotal.toLocaleString()} {t('rial', language)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('delivery', language)}</Text>
              <Text style={styles.totalValue}>{deliveryFee.toLocaleString()} {t('rial', language)}</Text>
            </View>
            {couponDiscount > 0 ? (
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: Colors.success }]}>{language === 'ar' ? 'خصم' : 'Discount'}</Text>
                <Text style={[styles.totalValue, { color: Colors.success }]}>-{couponDiscount.toLocaleString()} {t('rial', language)}</Text>
              </View>
            ) : null}
            <View style={[styles.totalRow, styles.grandTotalRow]}>
              <Text style={styles.grandTotalLabel}>{t('total', language)}</Text>
              <Text style={styles.grandTotalValue}>{total.toLocaleString()} {t('rial', language)}</Text>
            </View>
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
          <TouchableOpacity style={styles.placeOrderBtn} onPress={handlePlaceOrder}>
            <LinearGradient colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]} style={styles.placeOrderGradient}>
              <MaterialIcons name="shopping-bag" size={20} color="#000" />
              <Text style={styles.placeOrderText}>{t('placeOrder', language)}</Text>
              <Text style={styles.placeOrderTotal}>{total.toLocaleString()} {t('rial', language)}</Text>
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
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  content: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 80 },
  card: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: Spacing.sm },
  rtlText: { textAlign: 'right' },
  rtlInput: { textAlign: 'right' },
  orderItemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 8 },
  orderItemImage: { width: 50, height: 50, borderRadius: Radius.sm, resizeMode: 'cover' },
  orderItemInfo: { flex: 1 },
  orderItemName: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  orderItemVariant: { fontSize: FontSize.xs, color: Colors.textMuted },
  orderItemPrice: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
  orderItemQty: { fontSize: FontSize.sm, color: Colors.textSecondary },
  couponRow: { flexDirection: 'row', gap: 8 },
  couponInput: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, backgroundColor: Colors.bgInput, paddingHorizontal: Spacing.sm, paddingVertical: 10, fontSize: FontSize.sm, color: Colors.textPrimary },
  applyBtn: { borderRadius: Radius.sm, overflow: 'hidden' },
  applyBtnGradient: { paddingHorizontal: 16, paddingVertical: 10 },
  applyBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#000' },
  couponSuccess: { fontSize: FontSize.sm, color: Colors.success, marginTop: 6 },
  cityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cityChip: { flex: 1, minWidth: '30%', borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  selectedCityChip: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  cityName: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  selectedCityName: { color: Colors.primary, fontWeight: FontWeight.bold },
  cityFee: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  selectedCityFee: { color: Colors.primary },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, backgroundColor: Colors.bgInput, paddingHorizontal: Spacing.sm, paddingVertical: 12, fontSize: FontSize.sm, color: Colors.textPrimary },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  bankItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, marginBottom: 8 },
  selectedBankItem: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  bankInfo: { flex: 1 },
  bankName: { fontSize: FontSize.base, color: Colors.textSecondary, fontWeight: FontWeight.medium },
  selectedBankName: { color: Colors.primary, fontWeight: FontWeight.bold },
  bankAccount: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
  uploadArea: { borderWidth: 2, borderColor: Colors.borderGold, borderStyle: 'dashed', borderRadius: Radius.lg, overflow: 'hidden', minHeight: 120 },
  uploadPlaceholder: { alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, gap: 8 },
  uploadText: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
  receiptPreview: { width: '100%', height: 200, resizeMode: 'cover' },
  totalsCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderGold },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  totalLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  totalValue: { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  grandTotalRow: { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 4, paddingTop: 10 },
  grandTotalLabel: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  grandTotalValue: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.primary },
  bottomBar: { backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.border, padding: Spacing.md },
  placeOrderBtn: { borderRadius: Radius.md, overflow: 'hidden' },
  placeOrderGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  placeOrderText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#000' },
  placeOrderTotal: { fontSize: FontSize.sm, color: '#000', opacity: 0.8 },
});
