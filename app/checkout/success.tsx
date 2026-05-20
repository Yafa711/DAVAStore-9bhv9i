import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';

export default function OrderSuccessScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.content}>
        <Image source={require('@/assets/images/order-success.png')} style={styles.image} />
        
        <View style={styles.iconBadge}>
          <MaterialIcons name="check-circle" size={60} color={Colors.success} />
        </View>

        <Text style={styles.title}>
          {language === 'ar' ? 'تم تأكيد طلبك! 🎉' : 'Order Confirmed! 🎉'}
        </Text>
        <Text style={styles.subtitle}>
          {language === 'ar'
            ? 'تم إرسال تفاصيل طلبك إلى إدارة المتجر عبر واتساب وسيتم مراجعة الدفع والتواصل معك قريباً'
            : 'Your order details have been sent to the store via WhatsApp. Payment will be reviewed and you will be contacted soon.'}
        </Text>

        <View style={styles.infoCard}>
          <MaterialIcons name="whatsapp" size={24} color="#25D366" />
          <Text style={styles.infoText}>
            {language === 'ar'
              ? 'تم إرسال تفاصيل الطلب للمدير عبر واتساب'
              : 'Order details sent to admin via WhatsApp'}
          </Text>
        </View>

        <View style={styles.buttons}>
          <TouchableOpacity style={styles.ordersBtn} onPress={() => router.replace('/(tabs)/orders')}>
            <Text style={styles.ordersBtnText}>
              {language === 'ar' ? 'عرض طلباتي' : 'View My Orders'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')}>
            <LinearGradient colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]} style={styles.homeBtnGradient}>
              <MaterialIcons name="home" size={18} color="#000" />
              <Text style={styles.homeBtnText}>
                {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  image: { width: 160, height: 160, marginBottom: Spacing.md },
  iconBadge: { marginBottom: Spacing.lg },
  title: {
    fontSize: FontSize.xxl, fontWeight: FontWeight.bold,
    color: Colors.textPrimary, textAlign: 'center', marginBottom: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.base, color: Colors.textSecondary,
    textAlign: 'center', lineHeight: 24, marginBottom: Spacing.xl,
  },
  infoCard: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border,
    marginBottom: Spacing.xl,
  },
  infoText: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
  buttons: { gap: Spacing.md, width: '100%' },
  ordersBtn: {
    paddingVertical: 14, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.borderGold, alignItems: 'center',
  },
  ordersBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.primary },
  homeBtn: { borderRadius: Radius.md, overflow: 'hidden' },
  homeBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  homeBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#000' },
});
