import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { useAlert } from '@/template';
import { ADMIN_PERMISSIONS } from '@/constants/config';
import { AdminUser } from '@/contexts/DataContext';

export default function AdminAdminsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, user } = useApp();
  const { adminUsers, addAdminUser, updateAdminUser, deleteAdminUser } = useData();
  const { showAlert } = useAlert();
  const isRTL = language === 'ar';

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Partial<AdminUser>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const openAdd = () => {
    setEditing({ name: '', phone: '', username: '', password: '', isSuperAdmin: false, permissions: [], isActive: true });
    setEditingId(null);
    setModal(true);
  };

  const openEdit = (a: AdminUser) => {
    setEditing({ ...a });
    setEditingId(a.id);
    setModal(true);
  };

  const handleSave = async () => {
    if (!editing.name || !editing.username || !editing.password) {
      showAlert(isRTL ? 'أدخل البيانات الأساسية' : 'Fill required fields', ''); return;
    }
    try {
      if (editingId) {
        await updateAdminUser(editingId, editing);
      } else {
        await addAdminUser({ ...editing, id: `admin_${Date.now()}`, createdAt: new Date().toISOString() } as AdminUser);
      }
      setModal(false);
    } catch (e: any) {
      showAlert(isRTL ? 'خطأ' : 'Error', e.message || '');
    }
  };

  const handleDelete = (a: AdminUser) => {
    if (a.isSuperAdmin) { showAlert(isRTL ? 'لا يمكن حذف المدير العام' : 'Cannot delete super admin', ''); return; }
    showAlert(
      isRTL ? 'حذف المدير' : 'Delete Admin',
      isRTL ? 'هل أنت متأكد؟' : 'Are you sure?',
      [
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { text: isRTL ? 'حذف' : 'Delete', style: 'destructive', onPress: () => deleteAdminUser(a.id) },
      ]
    );
  };

  const togglePerm = (permId: string) => {
    const perms = editing.permissions || [];
    setEditing(e => ({ ...e, permissions: perms.includes(permId) ? perms.filter(p => p !== permId) : [...perms, permId] }));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isRTL ? 'حسابات الإدارة' : 'Admin Accounts'}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <MaterialIcons name="person-add" size={18} color="#0D1E16" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={adminUsers}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.adminCard}>
            <View style={[styles.avatar, { backgroundColor: item.isSuperAdmin ? Colors.primary : Colors.bgSurface }]}>
              <MaterialIcons name={item.isSuperAdmin ? 'shield' : 'person'} size={22} color={item.isSuperAdmin ? '#0D1E16' : Colors.primary} />
            </View>
            <View style={styles.adminInfo}>
              <View style={styles.adminNameRow}>
                <Text style={styles.adminName}>{item.name}</Text>
                {item.isSuperAdmin ? (
                  <View style={styles.superTag}><Text style={styles.superTagTxt}>{isRTL ? 'مدير عام' : 'Super'}</Text></View>
                ) : null}
                {!item.isActive ? (
                  <View style={styles.inactiveTag}><Text style={styles.inactiveTagTxt}>{isRTL ? 'معطل' : 'Disabled'}</Text></View>
                ) : null}
              </View>
              <Text style={styles.adminUsername}>@{item.username}</Text>
              <Text style={styles.adminPerms}>
                {item.isSuperAdmin ? (isRTL ? 'صلاحيات كاملة' : 'Full Access') : `${item.permissions.length} ${isRTL ? 'صلاحية' : 'permissions'}`}
              </Text>
            </View>
            <View style={styles.adminActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                <MaterialIcons name="edit" size={16} color={Colors.primary} />
              </TouchableOpacity>
              {!item.isSuperAdmin ? (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                  <MaterialIcons name="delete-outline" size={16} color={Colors.error} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        )}
      />

      <Modal visible={modal} animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModal(false)}>
              <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingId ? (isRTL ? 'تعديل المدير' : 'Edit Admin') : (isRTL ? 'مدير جديد' : 'New Admin')}</Text>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnTxt}>{isRTL ? 'حفظ' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {[
              { key: 'name', labelAr: 'الاسم *', labelEn: 'Name *' },
              { key: 'phone', labelAr: 'رقم الهاتف', labelEn: 'Phone' },
              { key: 'username', labelAr: 'اسم المستخدم *', labelEn: 'Username *' },
              { key: 'password', labelAr: 'كلمة المرور *', labelEn: 'Password *' },
            ].map(f => (
              <View key={f.key}>
                <Text style={styles.fieldLabel}>{isRTL ? f.labelAr : f.labelEn}</Text>
                <TextInput
                  style={styles.input}
                  value={(editing as any)[f.key] || ''}
                  onChangeText={v => setEditing(e => ({ ...e, [f.key]: v }))}
                  secureTextEntry={f.key === 'password'}
                  autoCapitalize="none"
                  placeholder={isRTL ? f.labelAr : f.labelEn}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            ))}

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>{isRTL ? 'حساب مفعّل' : 'Active Account'}</Text>
              <Switch value={!!editing.isActive} onValueChange={v => setEditing(e => ({ ...e, isActive: v }))} trackColor={{ false: Colors.border, true: Colors.success }} thumbColor="#fff" />
            </View>

            {!editing.isSuperAdmin ? (
              <>
                <Text style={[styles.fieldLabel, { marginTop: 16 }]}>{isRTL ? 'الصلاحيات' : 'Permissions'}</Text>
                {ADMIN_PERMISSIONS.map(perm => (
                  <TouchableOpacity
                    key={perm.id}
                    style={styles.permRow}
                    onPress={() => togglePerm(perm.id)}
                  >
                    <MaterialIcons
                      name={(editing.permissions || []).includes(perm.id) ? 'check-box' : 'check-box-outline-blank'}
                      size={22}
                      color={(editing.permissions || []).includes(perm.id) ? Colors.primary : Colors.textMuted}
                    />
                    <Text style={styles.permLabel}>{isRTL ? perm.nameAr : perm.nameEn}</Text>
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <View style={styles.superNote}>
                <MaterialIcons name="verified" size={18} color={Colors.primary} />
                <Text style={styles.superNoteTxt}>{isRTL ? 'المدير العام يملك صلاحيات كاملة' : 'Super admin has full access'}</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.md, gap: Spacing.sm },
  adminCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center' },
  adminInfo: { flex: 1, gap: 2 },
  adminNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  adminName: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  superTag: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  superTagTxt: { fontSize: 9, color: '#0D1E16', fontWeight: FontWeight.bold },
  inactiveTag: { backgroundColor: Colors.error + '30', borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  inactiveTagTxt: { fontSize: 9, color: Colors.error },
  adminUsername: { fontSize: FontSize.sm, color: Colors.textMuted },
  adminPerms: { fontSize: FontSize.xs, color: Colors.textSecondary },
  adminActions: { gap: 6 },
  editBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.error + '20', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnTxt: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#0D1E16' },
  modalContent: { padding: Spacing.lg, gap: 4, paddingBottom: 40 },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.bgInput, paddingHorizontal: 12, paddingVertical: 11, fontSize: FontSize.sm, color: Colors.textPrimary, marginBottom: 8 },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  toggleLabel: { fontSize: FontSize.base, color: Colors.textPrimary },
  permRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  permLabel: { fontSize: FontSize.base, color: Colors.textPrimary, flex: 1 },
  superNote: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.primary + '15', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderGold, marginTop: 12 },
  superNoteTxt: { fontSize: FontSize.sm, color: Colors.textSecondary, flex: 1 },
});
