import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { t } from '@/constants/i18n';

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, cart, removeFromCart, updateCartQuantity, cartTotal } = useApp();
  const isRTL = language === 'ar';

  const renderItem = ({ item }: any) => (
    <View style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, isRTL && styles.rtlText]} numberOfLines={2}>
          {language === 'ar' ? item.productName : item.productName}
        </Text>
        <Text style={styles.itemVariant}>
          {item.size} · {item.color}
        </Text>
        <Text style={styles.itemPrice}>
          {(item.price * item.quantity).toLocaleString()} {t('rial', language)}
        </Text>
        <View style={styles.quantityRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => updateCartQuantity(item.productId, item.size, item.color, item.quantity - 1)}
          >
            <MaterialIcons name="remove" size={16} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
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
        onPress={() => removeFromCart(item.productId, item.size, item.color)}
      >
        <MaterialIcons name="delete-outline" size={22} color={Colors.error} />
      </TouchableOpacity>
    </View>
  );

  if (cart.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('myCart', language)}</Text>
        </View>
        <View style={styles.emptyContent}>
          <Image source={require('@/assets/images/empty-cart.png')} style={styles.emptyImage} />
          <Text style={styles.emptyTitle}>{t('emptyCart', language)}</Text>
          <Text style={styles.emptySubtitle}>{t('emptyCartDesc', language)}</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)/categories')}>
            <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.shopBtnGradient}>
              <Text style={styles.shopBtnText}>{t('shopNow', language)}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('myCart', language)}</Text>
        <Text style={styles.cartCount}>{cart.length} {language === 'ar' ? 'منتجات' : 'items'}</Text>
      </View>

      <FlatList
        data={cart}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.productId}_${item.size}_${item.color}`}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Summary */}
      <View style={[styles.summary, { paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('subtotal', language)}</Text>
          <Text style={styles.summaryValue}>{cartTotal.toLocaleString()} {t('rial', language)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => router.push('/checkout/index')}
        >
          <LinearGradient colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]} style={styles.checkoutGradient}>
            <MaterialIcons name="shopping-bag" size={20} color="#000" />
            <Text style={styles.checkoutText}>{t('checkout', language)}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  emptyContainer: {},
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  cartCount: { fontSize: FontSize.sm, color: Colors.textMuted },
  list: { padding: Spacing.md, gap: Spacing.sm },
  cartItem: {
    flexDirection: 'row', backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg, padding: Spacing.sm,
    borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm,
  },
  itemImage: { width: 80, height: 80, borderRadius: Radius.md, resizeMode: 'cover' },
  itemInfo: { flex: 1, gap: 4 },
  itemName: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  rtlText: { textAlign: 'right' },
  itemVariant: { fontSize: FontSize.xs, color: Colors.textMuted },
  itemPrice: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.bold },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: 4 },
  qtyBtn: {
    width: 28, height: 28, borderRadius: Radius.sm,
    backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border,
    justifyContent: 'center', alignItems: 'center',
  },
  qtyText: { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: FontWeight.bold, minWidth: 24, textAlign: 'center' },
  deleteBtn: { padding: 4 },
  emptyContent: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  emptyImage: { width: 150, height: 150, marginBottom: Spacing.lg },
  emptyTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 8 },
  emptySubtitle: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', marginBottom: Spacing.xl },
  shopBtn: { borderRadius: Radius.full, overflow: 'hidden' },
  shopBtnGradient: { paddingHorizontal: Spacing.xl, paddingVertical: 14 },
  shopBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#000' },
  summary: {
    backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.border,
    padding: Spacing.lg, gap: Spacing.sm,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FontSize.base, color: Colors.textSecondary },
  summaryValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  checkoutBtn: { borderRadius: Radius.md, overflow: 'hidden', marginTop: 4 },
  checkoutGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  checkoutText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#000' },
});
