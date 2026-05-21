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

export default function AdminCouponsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useData();
  const { showAlert } = useAlert();
  const isRTL = language === 'ar';

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const openAdd = () => {
    setEditing({ code: '', discount: '', type: 'percent', minOrder: 0, maxUses: 100, isActive: true });
    setEditingId(null); setModal(true);
  };
  const openEdit = (c: any) => { setEditing({ ...c }); setEditingId(c.id); setModal(true); };

  const handleSave = async () => {
    if (!editing.code || !editing.discount) { showAlert(isRTL ? 'أدخل البيانات' : 'Fill fields', ''); return; }
    try {
      if (editingId) await updateCoupon(editingId, { ...editing, discount: parseInt(editing.discount) });
      else await addCoupon({ ...editing, id: `c_${Date.now()}`, usedCount: 0, discount: parseInt(editing.discount) });
      setModal(false);
    } catch { showAlert(isRTL ? 'خطأ' : 'Error', ''); }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.title}>{isRTL ? 'الكوبونات' : 'Coupons'}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}><MaterialIcons name="add" size={20} color="#0D1E16" /></TouchableOpacity>
      </View>
      <FlatList
        data={coupons}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.couponCard}>
            <View style={styles.couponLeft}>
              <Text style={styles.couponCode}>{item.code}</Text>
              <Text style={styles.couponDiscount}>
                {item.discount}{item.type === 'percent' ? '%' : ` ${isRTL ? 'ريال' : 'YER'}`} {isRTL ? 'خصم' : 'off'}
              </Text>
              <Text style={styles.couponStats}>{item.usedCount}/{item.maxUses} {isRTL ? 'استخدام' : 'uses'}</Text>
            </View>
            <View style={styles.couponRight}>
              <View style={[styles.statusDot, { backgroundColor: item.isActive ? Colors.success : Colors.error }]} />
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}><MaterialIcons name="edit" size={16} color={Colors.primary} /></TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => { showAlert(isRTL ? 'حذف؟' : 'Delete?', '', [{ text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' }, { text: isRTL ? 'حذف' : 'Delete', style: 'destructive', onPress: () => deleteCoupon(item.id) }]); }}>
                <MaterialIcons name="delete-outline" size={16} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      <Modal visible={modal} animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModal(false)}><MaterialIcons name="close" size={22} color={Colors.textPrimary} /></TouchableOpacity>
            <Text style={styles.modalTitle}>{editingId ? (isRTL ? 'تعديل' : 'Edit') : (isRTL ? 'كوبون جديد' : 'New Coupon')}</Text>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveTxt}>{isRTL ? 'حفظ' : 'Save'}</Text></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            {[
              { k: 'code', l: isRTL ? 'الكود *' : 'Code *', cap: 'characters' as const },
              { k: 'discount', l: isRTL ? 'قيمة الخصم *' : 'Discount Value *', num: true },
              { k: 'minOrder', l: isRTL ? 'الحد الأدنى للطلب' : 'Min Order', num: true },
              { k: 'maxUses', l: isRTL ? 'الحد الأقصى للاستخدام' : 'Max Uses', num: true },
            ].map(f => (
              <View key={f.k}>
                <Text style={styles.label}>{f.l}</Text>
                <TextInput style={styles.input} value={String(editing[f.k] || '')} onChangeText={v => setEditing((e: any) => ({ ...e, [f.k]: v }))} keyboardType={f.num ? 'number-pad' : 'default'} autoCapitalize={f.cap || 'none'} placeholder={f.l} placeholderTextColor={Colors.textMuted} />
              </View>
            ))}
            <Text style={styles.label}>{isRTL ? 'نوع الخصم' : 'Discount Type'}</Text>
            <View style={styles.typeRow}>
              {['percent', 'fixed'].map(t => (
                <TouchableOpacity key={t} style={[styles.typeChip, editing.type === t && styles.typeChipActive]} onPress={() => setEditing((e: any) => ({ ...e, type: t }))}>
                  <Text style={[styles.typeChipTxt, editing.type === t && styles.typeChipTxtActive]}>{t === 'percent' ? (isRTL ? 'نسبة %' : 'Percent %') : (isRTL ? 'مبلغ ثابت' : 'Fixed Amount')}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>{isRTL ? 'مفعّل' : 'Active'}</Text>
              <Switch value={!!editing.isActive} onValueChange={v => setEditing((e: any) => ({ ...e, isActive: v }))} trackColor={{ false: Colors.border, true: Colors.success }} thumbColor="#fff" />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  list: { padding: Spacing.md, gap: Spacing.sm },
  couponCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderGold },
  couponLeft: { gap: 2 },
  couponCode: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, color: Colors.primary, letterSpacing: 2 },
  couponDiscount: { fontSize: FontSize.sm, color: Colors.textPrimary },
  couponStats: { fontSize: FontSize.xs, color: Colors.textMuted },
  couponRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  editBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.error + '20', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 8 },
  saveTxt: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#0D1E16' },
  modalContent: { padding: Spacing.lg, gap: 4 },
  label: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.bgInput, paddingHorizontal: 12, paddingVertical: 11, fontSize: FontSize.sm, color: Colors.textPrimary },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.md, backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border },
  typeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeChipTxt: { fontSize: FontSize.sm, color: Colors.textSecondary },
  typeChipTxtActive: { color: '#0D1E16', fontWeight: FontWeight.bold },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  toggleLabel: { fontSize: FontSize.base, color: Colors.textPrimary },
});
