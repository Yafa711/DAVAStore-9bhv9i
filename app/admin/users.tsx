import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData, UserRecord } from '@/contexts/DataContext';
import { useAlert } from '@/template';

export default function AdminUsersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { users, updateUser, orders } = useData();
  const { showAlert } = useAlert();
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState<UserRecord | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.phone.includes(search)
  );

  const getUserOrders = (userId: string) => orders.filter(o => o.userId === userId).length;

  const openEdit = (u: UserRecord) => {
    setEditUser(u);
    setEditName(u.name);
    setEditPhone(u.phone);
  };

  const saveEdit = () => {
    if (!editUser) return;
    updateUser(editUser.id, { name: editName, phone: editPhone });
    setEditUser(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{language === 'ar' ? 'العملاء' : 'Customers'} ({users.length})</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={language === 'ar' ? 'بحث بالاسم أو الرقم...' : 'Search by name or number...'}
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      {editUser ? (
        <View style={styles.editCard}>
          <Text style={styles.editTitle}>{language === 'ar' ? 'تعديل بيانات العميل' : 'Edit Customer'}</Text>
          <TextInput style={styles.editInput} value={editName} onChangeText={setEditName} placeholder={language === 'ar' ? 'الاسم' : 'Name'} placeholderTextColor={Colors.textMuted} />
          <TextInput style={styles.editInput} value={editPhone} onChangeText={setEditPhone} placeholder={language === 'ar' ? 'الهاتف' : 'Phone'} placeholderTextColor={Colors.textMuted} />
          <View style={styles.editButtons}>
            <TouchableOpacity style={styles.saveBtn} onPress={saveEdit}><Text style={styles.saveBtnText}>{language === 'ar' ? 'حفظ' : 'Save'}</Text></TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditUser(null)}><Text style={styles.cancelBtnText}>{language === 'ar' ? 'إلغاء' : 'Cancel'}</Text></TouchableOpacity>
          </View>
        </View>
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.userCard}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{item.name}</Text>
              <Text style={styles.userPhone}>{item.phone}</Text>
              <Text style={styles.userStats}>{getUserOrders(item.id)} {language === 'ar' ? 'طلب' : 'orders'} · {item.totalSpent.toLocaleString()} {language === 'ar' ? 'ريال' : 'YER'}</Text>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity onPress={() => openEdit(item)}>
                <MaterialIcons name="edit" size={20} color={Colors.primary} />
              </TouchableOpacity>
              <Switch
                value={item.isActive}
                onValueChange={v => updateUser(item.id, { isActive: v })}
                trackColor={{ true: Colors.success }}
                style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
              />
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>{language === 'ar' ? 'لا يوجد عملاء' : 'No customers yet'}</Text></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingVertical: 10, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  searchInput: { flex: 1, fontSize: FontSize.base, color: Colors.textPrimary },
  editCard: { margin: Spacing.md, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderGold, gap: 8 },
  editTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary },
  editInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, backgroundColor: Colors.bgInput, paddingHorizontal: Spacing.sm, paddingVertical: 10, fontSize: FontSize.sm, color: Colors.textPrimary },
  editButtons: { flexDirection: 'row', gap: 8 },
  saveBtn: { flex: 1, backgroundColor: Colors.primary, borderRadius: Radius.sm, padding: 10, alignItems: 'center' },
  saveBtnText: { fontWeight: FontWeight.bold, color: '#000' },
  cancelBtn: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, padding: 10, alignItems: 'center' },
  cancelBtnText: { color: Colors.textSecondary },
  list: { padding: Spacing.md, gap: Spacing.sm },
  userCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  userAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#000' },
  userInfo: { flex: 1 },
  userName: { fontSize: FontSize.base, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  userPhone: { fontSize: FontSize.sm, color: Colors.textSecondary },
  userStats: { fontSize: FontSize.xs, color: Colors.textMuted },
  userActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.base },
});
