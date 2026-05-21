import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Switch } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { useAlert } from '@/template';
import { CATEGORIES } from '@/constants/config';

export default function AdminOffersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { offers, addOffer, updateOffer, deleteOffer } = useData();
  const { showAlert } = useAlert();
  const isRTL = language === 'ar';
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const openAdd = () => { setEditing({ titleAr: '', titleEn: '', discount: '', category: 'women', isActive: true }); setEditingId(null); setModal(true); };
  const openEdit = (o: any) => { setEditing({ ...o }); setEditingId(o.id); setModal(true); };
  const handleSave = async () => {
    try {
      if (editingId) await updateOffer(editingId, { ...editing, discount: parseInt(editing.discount) });
      else await addOffer({ ...editing, id: `offer_${Date.now()}`, discount: parseInt(editing.discount) });
      setModal(false);
    } catch { showAlert(isRTL ? 'خطأ' : 'Error', ''); }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.title}>{isRTL ? 'العروض' : 'Offers'}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}><MaterialIcons name="add" size={20} color="#0D1E16" /></TouchableOpacity>
      </View>
      <FlatList
        data={offers}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.offerCard}>
            <View style={[styles.discBadge]}><Text style={styles.discTxt}>-{item.discount}%</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.offerTitle}>{isRTL ? item.titleAr : item.titleEn}</Text>
              <Text style={styles.offerCat}>{item.category}</Text>
            </View>
            <View style={[styles.statusDot, { backgroundColor: item.isActive ? Colors.success : Colors.error }]} />
            <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}><MaterialIcons name="edit" size={15} color={Colors.primary} /></TouchableOpacity>
            <TouchableOpacity style={styles.delBtn} onPress={() => { showAlert(isRTL ? 'حذف؟' : 'Delete?', '', [{ text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' }, { text: isRTL ? 'حذف' : 'Delete', style: 'destructive', onPress: () => deleteOffer(item.id) }]); }}><MaterialIcons name="delete-outline" size={15} color={Colors.error} /></TouchableOpacity>
          </View>
        )}
      />
      <Modal visible={modal} animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={[styles.modal, { paddingTop: insets.top }]}>
          <View style={styles.modalHead}>
            <TouchableOpacity onPress={() => setModal(false)}><MaterialIcons name="close" size={22} color={Colors.textPrimary} /></TouchableOpacity>
            <Text style={styles.modalTitle}>{editingId ? (isRTL ? 'تعديل' : 'Edit') : (isRTL ? 'عرض جديد' : 'New Offer')}</Text>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveTxt}>{isRTL ? 'حفظ' : 'Save'}</Text></TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.label}>{isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}</Text>
            <TextInput style={[styles.input, styles.rtl]} value={editing.titleAr} onChangeText={v => setEditing((e: any) => ({ ...e, titleAr: v }))} placeholder="عنوان العرض" placeholderTextColor={Colors.textMuted} />
            <Text style={styles.label}>Title (English)</Text>
            <TextInput style={styles.input} value={editing.titleEn} onChangeText={v => setEditing((e: any) => ({ ...e, titleEn: v }))} placeholder="Offer title" placeholderTextColor={Colors.textMuted} />
            <Text style={styles.label}>{isRTL ? 'نسبة الخصم %' : 'Discount %'}</Text>
            <TextInput style={styles.input} value={String(editing.discount || '')} onChangeText={v => setEditing((e: any) => ({ ...e, discount: v }))} keyboardType="number-pad" placeholder="0" placeholderTextColor={Colors.textMuted} />
            <Text style={styles.label}>{isRTL ? 'التصنيف' : 'Category'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {CATEGORIES.map(c => (
                <TouchableOpacity key={c.id} style={[styles.catChip, editing.category === c.id && styles.catChipActive]} onPress={() => setEditing((e: any) => ({ ...e, category: c.id }))}>
                  <Text style={[styles.catTxt, editing.category === c.id && styles.catTxtActive]}>{isRTL ? c.nameAr : c.nameEn}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.togRow}>
              <Text style={styles.togLabel}>{isRTL ? 'مفعّل' : 'Active'}</Text>
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
  offerCard: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  discBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  discTxt: { fontSize: FontSize.xs, fontWeight: FontWeight.extrabold, color: '#0D1E16' },
  offerTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  offerCat: { fontSize: FontSize.xs, color: Colors.textMuted },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  editBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center' },
  delBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.error + '20', justifyContent: 'center', alignItems: 'center' },
  modal: { flex: 1, backgroundColor: Colors.bg },
  modalHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 8 },
  saveTxt: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#0D1E16' },
  modalContent: { padding: Spacing.lg, gap: 4 },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4, marginTop: 8 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.bgInput, paddingHorizontal: 12, paddingVertical: 11, fontSize: FontSize.sm, color: Colors.textPrimary },
  rtl: { textAlign: 'right' },
  catChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border, marginRight: 6, marginTop: 4 },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catTxt: { fontSize: FontSize.sm, color: Colors.textSecondary },
  catTxtActive: { color: '#0D1E16', fontWeight: FontWeight.bold },
  togRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  togLabel: { fontSize: FontSize.base, color: Colors.textPrimary },
});
