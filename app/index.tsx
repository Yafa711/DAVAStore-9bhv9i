import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useApp } from '@/contexts/AppContext';
import { Colors } from '@/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const { user } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user) {
        if (user.isAdmin || user.isSuperAdmin) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        router.replace('/auth/login');
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [user]);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
