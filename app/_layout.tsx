import { AlertProvider } from '@/template';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '@/contexts/AppContext';
import { DataProvider } from '@/contexts/DataContext';

export default function RootLayout() {
  return (
    <AlertProvider>
      <SafeAreaProvider>
        <AppProvider>
          <DataProvider>
            <StatusBar style="light" backgroundColor="#0D1E16" />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="auth/login" />
              <Stack.Screen name="auth/register" />
              <Stack.Screen name="auth/verify" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="product/[id]" />
              <Stack.Screen name="checkout/index" />
              <Stack.Screen name="checkout/success" />
              <Stack.Screen name="search/index" />
              <Stack.Screen name="admin/index" />
              <Stack.Screen name="admin/products" />
              <Stack.Screen name="admin/orders" />
              <Stack.Screen name="admin/users" />
              <Stack.Screen name="admin/offers" />
              <Stack.Screen name="admin/coupons" />
              <Stack.Screen name="admin/delivery" />
              <Stack.Screen name="admin/banks" />
              <Stack.Screen name="admin/admins" />
              <Stack.Screen name="admin/settings" />
              <Stack.Screen name="admin/statistics" />
              <Stack.Screen name="admin/search-analytics" />
              <Stack.Screen name="track/index" />
            </Stack>
          </DataProvider>
        </AppProvider>
      </SafeAreaProvider>
    </AlertProvider>
  );
}
