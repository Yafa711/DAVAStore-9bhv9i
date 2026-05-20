import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, TextInput, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData, Product } from '@/contexts/DataContext';
import { useAlert } from '@/template';
import { CATEGORIES, SIZES } from '@/constants/config';

const emptyProduct: Omit<Product, 'id' | 'createdAt'> = {
  nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '',
  price: 0, originalPrice: undefined, images: ['https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400'],
  category: 'women', sizes: [], colors: [], stock: 0, sold: 0,
  rating: 0, reviewCount: 0, isOffer: false, offerPercent: undefined,
  isNew: true, isFeatured: false, isVisible: true,
};

export default function AdminProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const { showAlert } = useAlert();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<any>(emptyProduct);
  const [colorInput, setColorInput] = useState('');

  const openAdd = () => { setForm(emptyProduct); setEditing(null); setShowForm(true); };
  const openEdit = (p: Product) => { setForm({ ...p }); setEditing(p); setShowForm(true); };

  const handleSave = () => {
    if (!form.nameAr || !form.price) {
      showAlert(language === 'ar' ? 'بيانات ناقصة' : 'Missing Data', '');
      return;
    }
    if (editing) {
      updateProduct(editing.id, form);
    } else {
      addProduct({ ...form, id: `p_${Date.now()}`, price: Number(form.price), stock: Number(form.stock), createdAt: new Date().toISOString() });
    }
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    showAlert(
      language === 'ar' ? 'حذف المنتج' : 'Delete Product',
      language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?',
      [
        { text: language === 'ar' ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { text: language === 'ar' ? 'حذف' : 'Delete', style: 'destructive', onPress: () => deleteProduct(id) },
      ]
    );
  };

  const toggleSize = (size: string) => {
    const sizes = form.sizes.includes(size) ? form.sizes.filter((s: string) => s !== size) : [...form.sizes, size];
    setForm({ ...form, sizes });
  };

  const addColor = () => {
    if (colorInput.trim()) { setForm({ ...form, colors: [...form.colors, colorInput.trim()] }); setColorInput(''); }
  };

  if (showForm) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowForm(false)}>
            <MaterialIcons name="close" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editing ? (language === 'ar' ? 'تعديل منتج' : 'Edit Product') : (language === 'ar' ? 'منتج جديد' : 'New Product')}</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveText}>{language === 'ar' ? 'حفظ' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView contentContainerStyle={styles.formContent}>
          {[
            { key: 'nameAr', label: 'الاسم (عربي)', placeholder: 'اسم المنتج' },
            { key: 'nameEn', label: 'Name (English)', placeholder: 'Product name' },
            { key: 'descriptionAr', label: 'الوصف (عربي)', placeholder: 'وصف المنتج' },
            { key: 'descriptionEn', label: 'Description (English)', placeholder: 'Product description' },
            { key: 'price', label: 'السعر / Price', placeholder: '0', keyboard: 'numeric' },
            { key: 'originalPrice', label: 'السعر الأصلي (اختياري)', placeholder: '0', keyboard: 'numeric' },
            { key: 'stock', label: 'المخزون / Stock', placeholder: '0', keyboard: 'numeric' },
          ].map(f => (
            <View key={f.key} style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{f.label}</Text>
              <TextInput
                style={styles.fieldInput}
                value={String(form[f.key] || '')}
                onChangeText={v => setForm({ ...form, [f.key]: v })}
                placeholder={f.placeholder}
                placeholderTextColor={Colors.textMuted}
                keyboardType={(f as any).keyboard || 'default'}
              />
            </View>
          ))}

          {/* Category */}
          <Text style={styles.fieldLabel}>{language === 'ar' ? 'التصنيف' : 'Category'}</Text>
          <View style={styles.chipsRow}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c.id} style={[styles.chip, form.category === c.id && styles.activeChip]} onPress={() => setForm({ ...form, category: c.id })}>
                <Text style={[styles.chipText, form.category === c.id && styles.activeChipText]}>{language === 'ar' ? c.nameAr : c.nameEn}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sizes */}
          <Text style={styles.fieldLabel}>{language === 'ar' ? 'المقاسات' : 'Sizes'}</Text>
          <View style={styles.chipsRow}>
            {SIZES.clothing.map(s => (
              <TouchableOpacity key={s} style={[styles.chip, form.sizes.includes(s) && styles.activeChip]} onPress={() => toggleSize(s)}>
                <Text style={[styles.chipText, form.sizes.includes(s) && styles.activeChipText]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Colors */}
          <Text style={styles.fieldLabel}>{language === 'ar' ? 'الألوان' : 'Colors'}</Text>
          <View style={styles.colorRow}>
            <TextInput style={[styles.fieldInput, { flex: 1 }]} value={colorInput} onChangeText={setColorInput} placeholder={language === 'ar' ? 'اسم اللون' : 'Color name'} placeholderTextColor={Colors.textMuted} />
            <TouchableOpacity style={styles.addColorBtn} onPress={addColor}><MaterialIcons name="add" size={20} color="#000" /></TouchableOpacity>
          </View>
          <View style={styles.chipsRow}>
            {form.colors.map((c: string, i: number) => (
              <TouchableOpacity key={i} style={styles.colorChip} onPress={() => setForm({ ...form, colors: form.colors.filter((_: any, idx: number) => idx !== i) })}>
                <Text style={styles.colorChipText}>{c}</Text>
                <MaterialIcons name="close" size={12} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Toggles */}
          {[
            { key: 'isVisible', label: language === 'ar' ? 'مرئي' : 'Visible' },
            { key: 'isOffer', label: language === 'ar' ? 'عرض خاص' : 'On Sale' },
            { key: 'isNew', label: language === 'ar' ? 'جديد' : 'New' },
            { key: 'isFeatured', label: language === 'ar' ? 'مميز' : 'Featured' },
          ].map(t => (
            <View key={t.key} style={styles.toggleRow}>
              <Text style={styles.fieldLabel}>{t.label}</Text>
              <Switch value={!!form[t.key]} onValueChange={v => setForm({ ...form, [t.key]: v })} trackColor={{ true: Colors.primary }} />
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
        <Text style={styles.headerTitle}>{language === 'ar' ? 'المنتجات' : 'Products'} ({products.length})</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}><MaterialIcons name="add" size={22} color="#000" /></TouchableOpacity>
      </View>
      <FlatList
        data={products}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <Image source={{ uri: item.images[0] }} style={styles.productThumb} />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>{language === 'ar' ? item.nameAr : item.nameEn}</Text>
              <Text style={styles.productPrice}>{item.price.toLocaleString()} {language === 'ar' ? 'ريال' : 'YER'}</Text>
              <View style={styles.badgesRow}>
                {!item.isVisible ? <View style={styles.hiddenBadge}><Text style={styles.hiddenText}>{language === 'ar' ? 'مخفي' : 'Hidden'}</Text></View> : null}
                {item.isOffer ? <View style={styles.offerBadge}><Text style={styles.offerBadgeText}>{language === 'ar' ? 'عرض' : 'Sale'}</Text></View> : null}
              </View>
            </View>
            <View style={styles.productActions}>
              <TouchableOpacity onPress={() => openEdit(item)} style={styles.editBtn}><MaterialIcons name="edit" size={18} color={Colors.primary} /></TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}><MaterialIcons name="delete" size={18} color={Colors.error} /></TouchableOpacity>
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
  productRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  productThumb: { width: 60, height: 60, borderRadius: Radius.sm, resizeMode: 'cover' },
  productInfo: { flex: 1, gap: 2 },
  productName: { fontSize: FontSize.sm, color: Colors.textPrimary, fontWeight: FontWeight.medium },
  productPrice: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
  badgesRow: { flexDirection: 'row', gap: 4 },
  hiddenBadge: { backgroundColor: Colors.textMuted + '30', borderRadius: Radius.xs, paddingHorizontal: 6, paddingVertical: 2 },
  hiddenText: { fontSize: 10, color: Colors.textMuted },
  offerBadge: { backgroundColor: Colors.error + '30', borderRadius: Radius.xs, paddingHorizontal: 6, paddingVertical: 2 },
  offerBadgeText: { fontSize: 10, color: Colors.error },
  productActions: { gap: 6 },
  editBtn: { padding: 6 },
  deleteBtn: { padding: 6 },
  formContent: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 40 },
  fieldGroup: { gap: 4 },
  fieldLabel: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 4 },
  fieldInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, backgroundColor: Colors.bgInput, paddingHorizontal: Spacing.sm, paddingVertical: 10, fontSize: FontSize.sm, color: Colors.textPrimary },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.sm },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.bgCard },
  activeChip: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: FontSize.xs, color: Colors.textSecondary },
  activeChipText: { color: '#000', fontWeight: FontWeight.bold },
  colorRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  addColorBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, padding: 10 },
  colorChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.border },
  colorChipText: { fontSize: FontSize.xs, color: Colors.textPrimary },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
});
