import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { Colors, FontSize, FontWeight, Radius } from '@/constants/theme';
import { t } from '@/constants/i18n';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const { language, cartCount } = useApp();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: Platform.select({ ios: insets.bottom + 58, android: insets.bottom + 58, default: 68 }),
          paddingTop: 8,
          paddingBottom: Platform.select({ ios: insets.bottom + 6, android: insets.bottom + 6, default: 8 }),
          backgroundColor: Colors.tabBg,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: { fontSize: 10, fontWeight: FontWeight.semibold },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home', language),
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name={focused ? 'home' : 'home'} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: t('categories', language),
          tabBarIcon: ({ color }) => <MaterialIcons name="grid-view" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: t('cart', language),
          tabBarIcon: ({ color }) => (
            <View style={{ position: 'relative' }}>
              <MaterialIcons name="shopping-bag" size={22} color={color} />
              {cartCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeTxt}>{cartCount > 9 ? '9+' : cartCount}</Text>
                </View>
              ) : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t('orders', language),
          tabBarIcon: ({ color }) => <MaterialIcons name="receipt-long" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile', language),
          tabBarIcon: ({ color }) => <MaterialIcons name="person-outline" size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute', top: -5, right: -9,
    backgroundColor: Colors.error, borderRadius: Radius.full,
    minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3,
  },
  badgeTxt: { fontSize: 9, color: '#fff', fontWeight: FontWeight.bold },
});
