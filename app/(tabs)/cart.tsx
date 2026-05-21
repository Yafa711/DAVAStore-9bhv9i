import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useAlert } from '@/template';
import { t } from '@/constants/i18n';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, cart, cartTotal, removeFromCart, updateCartQuantity } = useApp();
  const { showAlert } = useAlert();
  const isRTL = language === 'ar';

  const handleRemove = (productId: string, size: string, color: string) => {
    showAlert(
      isRTL ? 'حذف المنتج' : 'Remove Item',
      isRTL ? 'هل تريد حذف هذا المنتج من السلة؟' : 'Remove this item from cart?',
      [
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { text: isRTL ? 'حذف' : 'Remove', style: 'destructive', onPress: () => removeFromCart(productId, size, color) },
      ]
    );
  };

  if (cart.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <LinearGradient colors={['#152A1E', '#0D1E16']} style={styles.header}>
          <Text style={styles.headerTitle}>{isRTL ? 'سلة التسوق' : 'My Cart'}</Text>
        </LinearGradient>
        <View style={styles.emptyWrap}>
          <Image source={require('@/assets/images/empty-cart.png')} style={styles.emptyImg} contentFit="contain" />
          <Text style={styles.emptyTitle}>{isRTL ? 'سلتك فارغة' : 'Your cart is empty'}</Text>
          <Text style={styles.emptySub}>{isRTL ? 'أضيفي منتجات للبدء بالتسوق' : 'Add products to start shopping'}</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)/categories')}>
            <LinearGradient colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]} style={styles.shopBtnGrad}>
              <Text style={styles.shopBtnTxt}>{isRTL ? 'تسوقي الآن' : 'Shop Now'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#152A1E', '#0D1E16']} style={styles.header}>
        <Text style={styles.headerTitle}>{isRTL ? 'سلة التسوق' : 'My Cart'}</Text>
        <Text style={styles.cartCount}>{cart.length} {isRTL ? 'منتج' : 'items'}</Text>
      </LinearGradient>

      <FlatList
        data={cart}
        keyExtractor={(item, i) => `${item.productId}-${item.size}-${item.color}-${i}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.cartCard}>
            <Image
              source={{ uri: item.image || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=200' }}
              style={styles.cartImg}
              contentFit="cover"
            />
            <View style={styles.cartInfo}>
              <Text style={[styles.cartName, isRTL && styles.rtl]} numberOfLines={2}>
                {item.productName}
              </Text>
              <View style={styles.cartVarRow}>
                <View style={styles.varChip}><Text style={styles.varTxt}>{item.size}</Text></View>
                <View style={styles.varChip}><Text style={styles.varTxt}>{item.color}</Text></View>
              </View>
              <Text style={styles.cartPrice}>{(item.price * item.quantity).toLocaleString()} {isRTL ? 'ريال' : 'YER'}</Text>
              <View style={styles.qtyRow}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateCartQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                >
                  <MaterialIcons name="remove" size={16} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.qtyNum}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => updateCartQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                >
                  <MaterialIcons name="add" size={16} color={Colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleRemove(item.productId, item.size, item.color)}
            >
              <MaterialIcons name="delete-outline" size={20} color={Colors.error} />
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.totalCard}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{isRTL ? 'إجمالي المنتجات' : 'Items Total'}</Text>
              <Text style={styles.totalVal}>{cartTotal.toLocaleString()} {isRTL ? 'ريال' : 'YER'}</Text>
            </View>
            <Text style={styles.shippingNote}>
              {isRTL ? '+ رسوم التوصيل تُحدد عند الطلب' : '+ Delivery fee determined at checkout'}
            </Text>
          </View>
        }
      />

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 8 }]}>
        <View>
          <Text style={styles.totalSmall}>{isRTL ? 'المجموع' : 'Total'}</Text>
          <Text style={styles.totalBig}>{cartTotal.toLocaleString()} {isRTL ? 'ريال' : 'YER'}</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout/index')}>
          <LinearGradient colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]} style={styles.checkoutGrad}>
            <Text style={styles.checkoutTxt}>{isRTL ? 'إتمام الشراء' : 'Checkout'}</Text>
            <MaterialIcons name="arrow-forward" size={18} color="#0D1E16" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary },
  cartCount: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.lg, paddingHorizontal: Spacing.xl },
  emptyImg: { width: 180, height: 180 },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  emptySub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center' },
  shopBtn: { borderRadius: Radius.full, overflow: 'hidden', width: '70%' },
  shopBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  shopBtnTxt: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#0D1E16' },
  list: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 100 },
  cartCard: {
    flexDirection: 'row', backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm, ...Shadow.sm,
  },
  cartImg: { width: 90, height: 110, borderRadius: Radius.md },
  cartInfo: { flex: 1, gap: 5 },
  rtl: { textAlign: 'right' },
  cartName: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium, lineHeight: 18 },
  cartVarRow: { flexDirection: 'row', gap: 5 },
  varChip: { backgroundColor: Colors.bgSurface, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: Colors.border },
  varTxt: { fontSize: FontSize.xs, color: Colors.textSecondary },
  cartPrice: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.bgSurface,
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  qtyNum: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, minWidth: 20, textAlign: 'center' },
  deleteBtn: { padding: 6 },
  totalCard: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md,
    borderWidth: 1, borderColor: Colors.borderGold, marginTop: Spacing.sm,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  totalVal: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primary },
  shippingNote: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4 },
  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.bgCard, paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  totalSmall: { fontSize: FontSize.xs, color: Colors.textMuted },
  totalBig: { fontSize: FontSize.xl, fontWeight: FontWeight.extrabold, color: Colors.primary },
  checkoutBtn: { borderRadius: Radius.full, overflow: 'hidden' },
  checkoutGrad: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 24, paddingVertical: 13 },
  checkoutTxt: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#0D1E16' },
});
