import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

export default function CheckoutSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const isRTL = language === 'ar';

  return (
    <LinearGradient colors={['#060F0A', '#0D1E16', '#152A1E']} style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.iconGrad}>
            <MaterialIcons name="check-circle" size={52} color="#0D1E16" />
          </LinearGradient>
          <View style={styles.glow} />
        </View>

        <Text style={styles.title}>{isRTL ? '🎉 تم تقديم طلبك!' : '🎉 Order Placed!'}</Text>
        <Text style={styles.sub}>
          {isRTL
            ? 'تم استلام طلبك بنجاح. سيتم مراجعة إثبات الدفع وتأكيد طلبك قريباً.'
            : 'Your order has been received. Payment will be reviewed and your order confirmed shortly.'}
        </Text>

        <Image source={require('@/assets/images/order-success.png')} style={styles.successImg} contentFit="contain" />

        <View style={styles.btns}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/(tabs)/orders')}>
            <LinearGradient colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]} style={styles.primaryBtnGrad}>
              <MaterialIcons name="receipt-long" size={18} color="#0D1E16" />
              <Text style={styles.primaryBtnTxt}>{isRTL ? 'عرض طلباتي' : 'View My Orders'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.secondaryBtnTxt}>{isRTL ? 'متابعة التسوق' : 'Continue Shopping'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: Spacing.xl, gap: Spacing.lg },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  iconGrad: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
  glow: { position: 'absolute', width: 130, height: 130, borderRadius: 65, backgroundColor: Colors.primary + '20' },
  title: { fontSize: FontSize.xxl, fontWeight: FontWeight.extrabold, color: Colors.textPrimary, textAlign: 'center' },
  sub: { fontSize: FontSize.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: 24 },
  successImg: { width: 180, height: 180 },
  btns: { width: '100%', gap: Spacing.sm },
  primaryBtn: { borderRadius: Radius.full, overflow: 'hidden' },
  primaryBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15 },
  primaryBtnTxt: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#0D1E16' },
  secondaryBtn: { paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.borderGold, borderRadius: Radius.full },
  secondaryBtnTxt: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.semibold },
});
