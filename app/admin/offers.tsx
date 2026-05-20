import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Switch, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData, Offer } from '@/contexts/DataContext';
import { useAlert } from '@/template';

export default function AdminOffersScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { offers, addOffer, updateOffer, deleteOffer } = useData();
  const { showAlert } = useAlert();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', image: '', discount: '', isActive: true });

  const handleSave = () => {
    if (!form.titleAr || !form.discount) {
      showAlert(language === 'ar' ? 'بيانات ناقصة' : 'Missing Data', '');
      return;
    }
    addOffer({ ...form, id: `offer_${Date.now()}`, discount: Number(form.discount) });
    setShowForm(false);
    setForm({ titleAr: '', titleEn: '', descriptionAr: '', descriptionEn: '', image: '', discount: '', isActive: true });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{language === 'ar' ? 'العروض' : 'Offers'}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}><MaterialIcons name={showForm ? 'close' : 'add'} size={22} color="#000" /></TouchableOpacity>
      </View>

      {showForm ? (
        <View style={styles.formCard}>
          {[
            { key: 'titleAr', label: 'العنوان (عربي)' },
            { key: 'titleEn', label: 'Title (English)' },
            { key: 'descriptionAr', label: 'الوصف (عربي)' },
            { key: 'image', label: language === 'ar' ? 'رابط الصورة' : 'Image URL' },
            { key: 'discount', label: language === 'ar' ? 'نسبة الخصم %' : 'Discount %', keyboard: 'numeric' },
          ].map(f => (
            <TextInput key={f.key} style={styles.input} value={(form as any)[f.key]} onChangeText={v => setForm({ ...form, [f.key]: v })} placeholder={f.label} placeholderTextColor={Colors.textMuted} keyboardType={(f as any).keyboard || 'default'} />
          ))}
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.saveBtnGradient}>
              <Text style={styles.saveBtnText}>{language === 'ar' ? 'حفظ العرض' : 'Save Offer'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={offers}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.offerCard}>
            {item.image ? <Image source={{ uri: item.image }} style={styles.offerImage} /> : null}
            <View style={styles.offerInfo}>
              <Text style={styles.offerTitle}>{language === 'ar' ? item.titleAr : item.titleEn}</Text>
              <Text style={styles.offerDiscount}>{item.discount}% {language === 'ar' ? 'خصم' : 'off'}</Text>
            </View>
            <View style={styles.offerActions}>
              <Switch value={item.isActive} onValueChange={v => updateOffer(item.id, { isActive: v })} trackColor={{ true: Colors.success }} />
              <TouchableOpacity onPress={() => showAlert(language === 'ar' ? 'حذف العرض' : 'Delete Offer', '', [
                { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
                { text: language === 'ar' ? 'حذف' : 'Delete', style: 'destructive', onPress: () => deleteOffer(item.id) },
              ])}>
                <MaterialIcons name="delete" size={20} color={Colors.error} />
              </TouchableOpacity>
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
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, padding: 6 },
  formCard: { margin: Spacing.md, backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderGold, gap: 8 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, backgroundColor: Colors.bgInput, paddingHorizontal: Spacing.sm, paddingVertical: 10, fontSize: FontSize.sm, color: Colors.textPrimary },
  saveBtn: { borderRadius: Radius.sm, overflow: 'hidden' },
  saveBtnGradient: { paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { fontWeight: FontWeight.bold, color: '#000', fontSize: FontSize.base },
  list: { padding: Spacing.md, gap: Spacing.sm },
  offerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  offerImage: { width: 80, height: 70, resizeMode: 'cover' },
  offerInfo: { flex: 1, padding: Spacing.sm },
  offerTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  offerDiscount: { fontSize: FontSize.sm, color: Colors.primary, marginTop: 2 },
  offerActions: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingRight: Spacing.sm },
});
