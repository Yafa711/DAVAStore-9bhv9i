import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData, AdminUser } from '@/contexts/DataContext';
import { useAlert } from '@/template';
import { ADMIN_PERMISSIONS } from '@/constants/config';

export default function AdminAdminsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, user } = useApp();
  const { adminUsers, addAdminUser, updateAdminUser, deleteAdminUser } = useData();
  const { showAlert } = useAlert();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ name: '', phone: '', username: '', password: '', permissions: [] as string[] });

  const togglePermission = (perm: string) => {
    const perms = form.permissions.includes(perm) ? form.permissions.filter(p => p !== perm) : [...form.permissions, perm];
    setForm({ ...form, permissions: perms });
  };

  const openEdit = (admin: AdminUser) => {
    setEditing(admin);
    setForm({ name: admin.name, phone: admin.phone, username: admin.username, password: admin.password, permissions: [...admin.permissions] });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name || !form.username || !form.password) {
      showAlert(language === 'ar' ? 'بيانات ناقصة' : 'Missing Data', '');
      return;
    }
    if (editing) {
      updateAdminUser(editing.id, { ...form });
    } else {
      addAdminUser({ ...form, id: `admin_${Date.now()}`, isSuperAdmin: false, isActive: true, createdAt: new Date().toISOString() });
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (adminUsers.find(a => a.id === id)?.isSuperAdmin) {
      showAlert(language === 'ar' ? 'لا يمكن الحذف' : 'Cannot Delete', language === 'ar' ? 'لا يمكن حذف المدير العام' : 'Cannot delete super admin');
      return;
    }
    showAlert(language === 'ar' ? 'حذف' : 'Delete', '', [
      { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
      { text: language === 'ar' ? 'حذف' : 'Delete', style: 'destructive', onPress: () => deleteAdminUser(id) },
    ]);
  };

  if (showForm) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setShowForm(false); setEditing(null); }}><MaterialIcons name="close" size={24} color={Colors.textPrimary} /></TouchableOpacity>
          <Text style={styles.headerTitle}>{editing ? (language === 'ar' ? 'تعديل مدير' : 'Edit Admin') : (language === 'ar' ? 'مدير جديد' : 'New Admin')}</Text>
          <TouchableOpacity onPress={handleSave}><Text style={styles.saveText}>{language === 'ar' ? 'حفظ' : 'Save'}</Text></TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.formContent}>
          {[
            { key: 'name', label: language === 'ar' ? 'الاسم' : 'Name', placeholder: '' },
            { key: 'phone', label: language === 'ar' ? 'الهاتف' : 'Phone', placeholder: '+967...' },
            { key: 'username', label: language === 'ar' ? 'اسم المستخدم' : 'Username', placeholder: '' },
            { key: 'password', label: language === 'ar' ? 'كلمة المرور' : 'Password', placeholder: '' },
          ].map(f => (
            <View key={f.key}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <TextInput style={styles.fieldInput} value={(form as any)[f.key]} onChangeText={v => setForm({ ...form, [f.key]: v })} placeholder={f.placeholder} placeholderTextColor={Colors.textMuted} autoCapitalize="none" />
            </View>
          ))}
          <Text style={styles.sectionTitle}>{language === 'ar' ? 'الصلاحيات' : 'Permissions'}</Text>
          {ADMIN_PERMISSIONS.map(perm => (
            <View key={perm.id} style={styles.permRow}>
              <Text style={styles.permLabel}>{language === 'ar' ? perm.nameAr : perm.nameEn}</Text>
              <Switch
                value={form.permissions.includes(perm.id)}
                onValueChange={() => togglePermission(perm.id)}
                trackColor={{ true: Colors.primary }}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{language === 'ar' ? 'الإداريون' : 'Admins'} ({adminUsers.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => { setForm({ name: '', phone: '', username: '', password: '', permissions: [] }); setEditing(null); setShowForm(true); }}>
          <MaterialIcons name="add" size={22} color="#000" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={adminUsers}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.adminCard}>
            <View style={[styles.adminAvatar, { backgroundColor: item.isSuperAdmin ? Colors.primary : Colors.info }]}>
              <Text style={styles.adminAvatarText}>{item.name.charAt(0)}</Text>
            </View>
            <View style={styles.adminInfo}>
              <View style={styles.adminNameRow}>
                <Text style={styles.adminName}>{item.name}</Text>
                {item.isSuperAdmin ? <View style={styles.superBadge}><Text style={styles.superBadgeText}>SUPER</Text></View> : null}
              </View>
              <Text style={styles.adminUsername}>@{item.username}</Text>
              <Text style={styles.adminPerms}>{item.permissions.length} {language === 'ar' ? 'صلاحية' : 'permissions'}</Text>
            </View>
            <View style={styles.adminActions}>
              {!item.isSuperAdmin ? (
                <>
                  <TouchableOpacity onPress={() => openEdit(item)}><MaterialIcons name="edit" size={20} color={Colors.primary} /></TouchableOpacity>
                  <Switch value={item.isActive} onValueChange={v => updateAdminUser(item.id, { isActive: v })} trackColor={{ true: Colors.success }} style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} />
                  <TouchableOpacity onPress={() => handleDelete(item.id)}><MaterialIcons name="delete" size={20} color={Colors.error} /></TouchableOpacity>
                </>
              ) : null}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  saveText: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.bold },
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, padding: 6 },
  list: { padding: Spacing.md, gap: Spacing.sm },
  adminCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  adminAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  adminAvatarText: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#000' },
  adminInfo: { flex: 1 },
  adminNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  adminName: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  superBadge: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 6, paddingVertical: 2 },
  superBadgeText: { fontSize: 9, fontWeight: FontWeight.bold, color: '#000' },
  adminUsername: { fontSize: FontSize.sm, color: Colors.textSecondary },
  adminPerms: { fontSize: FontSize.xs, color: Colors.textMuted },
  adminActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  formContent: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 40 },
  fieldLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  fieldInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, backgroundColor: Colors.bgInput, paddingHorizontal: Spacing.sm, paddingVertical: 10, fontSize: FontSize.sm, color: Colors.textPrimary, marginBottom: 8 },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginTop: 8 },
  permRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  permLabel: { fontSize: FontSize.sm, color: Colors.textPrimary },
});
