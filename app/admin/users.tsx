import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';

export default function AdminUsersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { users, updateUser } = useData();
  const isRTL = language === 'ar';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.title}>{isRTL ? 'العملاء' : 'Customers'} ({users.length})</Text>
        <View style={{ width: 22 }} />
      </View>
      <FlatList
        data={users}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={[styles.avatar, { backgroundColor: item.isActive ? Colors.primary + '30' : Colors.bgSurface }]}>
              <Text style={[styles.avatarTxt, { color: item.isActive ? Colors.primary : Colors.textMuted }]}>
                {item.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userContact}>{item.phone || item.email || ''}</Text>
              <Text style={styles.userStats}>
                {item.totalOrders} {isRTL ? 'طلب' : 'orders'} · {item.totalSpent.toLocaleString()} {isRTL ? 'ريال' : 'YER'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.statusBtn, { backgroundColor: item.isActive ? Colors.success + '20' : Colors.error + '20' }]}
              onPress={() => updateUser(item.id, { isActive: !item.isActive })}
            >
              <MaterialIcons name={item.isActive ? 'check-circle' : 'block'} size={16} color={item.isActive ? Colors.success : Colors.error} />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="people-outline" size={64} color={Colors.textMuted} />
            <Text style={styles.emptyTxt}>{isRTL ? 'لا توجد عملاء بعد' : 'No customers yet'}</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  list: { padding: Spacing.md, gap: Spacing.sm },
  userCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  userInfo: { flex: 1 },
  userName: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  userContact: { fontSize: FontSize.sm, color: Colors.textMuted },
  userStats: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 2 },
  statusBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyTxt: { color: Colors.textMuted, fontSize: FontSize.base },
});
