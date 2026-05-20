import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData, Coupon } from '@/contexts/DataContext';
import { useAlert } from '@/template';

export default function AdminCouponsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useData();
  const { showAlert } = useAlert();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', discount: '', type: 'percent' as 'percent' | 'fixed', minOrder: '', maxUses: '100' });

  const handleSave = () => {
    if (!form.code || !form.discount) {
      showAlert(language === 'ar' ? 'بيانات ناقصة' : 'Missing Data', '');
      return;
    }
    addCoupon({
      id: `c_${Date.now()}`,
      code: form.code.toUpperCase(),
      discount: Number(form.discount),
      type: form.type,
      minOrder: Number(form.minOrder) || 0,
      maxUses: Number(form.maxUses) || 100,
      usedCount: 0,
      isActive: true,
    });
    setShowForm(false);
    setForm({ code: '', discount: '', type: 'percent', minOrder: '', maxUses: '100' });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{language === 'ar' ? 'الكوبونات' : 'Coupons'}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}><MaterialIcons name={showForm ? 'close' : 'add'} size={22} color="#000" /></TouchableOpacity>
      </View>

      {showForm ? (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{language === 'ar' ? 'كوبون جديد' : 'New Coupon'}</Text>
          <TextInput style={styles.input} value={form.code} onChangeText={v => setForm({ ...form, code: v.toUpperCase() })} placeholder={language === 'ar' ? 'كود الخصم (DAVA10)' : 'Coupon Code'} placeholderTextColor={Colors.textMuted} autoCapitalize="characters" />
          <View style={styles.typeRow}>
            {(['percent', 'fixed'] as const).map(t => (
              <TouchableOpacity key={t} style={[styles.typeChip, form.type === t && styles.activeTypeChip]} onPress={() => setForm({ ...form, type: t })}>
                <Text style={[styles.typeText, form.type === t && styles.activeTypeText]}>{t === 'percent' ? '%' : language === 'ar' ? 'ريال' : 'YER'}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={styles.input} value={form.discount} onChangeText={v => setForm({ ...form, discount: v })} placeholder={language === 'ar' ? 'قيمة الخصم' : 'Discount Value'} placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
          <TextInput style={styles.input} value={form.minOrder} onChangeText={v => setForm({ ...form, minOrder: v })} placeholder={language === 'ar' ? 'الحد الأدنى للطلب' : 'Minimum Order'} placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
          <TextInput style={styles.input} value={form.maxUses} onChangeText={v => setForm({ ...form, maxUses: v })} placeholder={language === 'ar' ? 'الحد الأقصى للاستخدام' : 'Max Uses'} placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.saveBtnGradient}>
              <Text style={styles.saveBtnText}>{language === 'ar' ? 'حفظ الكوبون' : 'Save Coupon'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={coupons}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.couponCard}>
            <View style={styles.couponLeft}>
              <Text style={styles.couponCode}>{item.code}</Text>
              <Text style={styles.couponDiscount}>
                {item.discount}{item.type === 'percent' ? '%' : ` ${language === 'ar' ? 'ريال' : 'YER'}`} {language === 'ar' ? 'خصم' : 'off'}
              </Text>
              <Text style={styles.couponUsage}>{item.usedCount}/{item.maxUses} {language === 'ar' ? 'استخدام' : 'uses'}</Text>
            </View>
            <View style={styles.couponRight}>
              <Switch value={item.isActive} onValueChange={v => updateCoupon(item.id, { isActive: v })} trackColor={{ true: Colors.success }} />
              <TouchableOpacity onPress={() => showAlert(language === 'ar' ? 'حذف' : 'Delete', '', [
                { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
                { text: language === 'ar' ? 'حذف' : 'Delete', style: 'destructive', onPress: () => deleteCoupon(item.id) },
              ])}>
                <MaterialIcons name="delete" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>{language === 'ar' ? 'لا توجد كوبونات' : 'No coupons'}</Text></View>}
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
  formTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.primary, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, backgroundColor: Colors.bgInput, paddingHorizontal: Spacing.sm, paddingVertical: 10, fontSize: FontSize.sm, color: Colors.textPrimary },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeChip: { flex: 1, padding: 10, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  activeTypeChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  typeText: { fontSize: FontSize.sm, color: Colors.textSecondary, fontWeight: FontWeight.bold },
  activeTypeText: { color: '#000' },
  saveBtn: { borderRadius: Radius.sm, overflow: 'hidden' },
  saveBtnGradient: { paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#000' },
  list: { padding: Spacing.md, gap: Spacing.sm },
  couponCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  couponLeft: { gap: 2 },
  couponCode: { fontSize: FontSize.lg, fontWeight: FontWeight.extrabold, color: Colors.primary, letterSpacing: 2 },
  couponDiscount: { fontSize: FontSize.sm, color: Colors.textSecondary },
  couponUsage: { fontSize: FontSize.xs, color: Colors.textMuted },
  couponRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { color: Colors.textMuted, fontSize: FontSize.base },
});
