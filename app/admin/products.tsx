import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Switch,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { useAlert } from '@/template';
import { CATEGORIES, SIZES } from '@/constants/config';
import { Product } from '@/contexts/DataContext';

const BLANK: Partial<Product> = {
  nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '',
  price: 0, originalPrice: undefined, images: [], category: 'women',
  sizes: [], colors: [], stock: 0, isOffer: false, offerPercent: undefined,
  isNew: false, isFeatured: false, isVisible: true,
};

export default function AdminProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { products, addProduct, updateProduct, deleteProduct } = useData();
  const { showAlert } = useAlert();
  const isRTL = language === 'ar';

  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<Partial<Product>>(BLANK);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [colorInput, setColorInput] = useState('');

  const filtered = products.filter(p =>
    p.nameAr.includes(search) || p.nameEn.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing({ ...BLANK }); setEditingId(null); setModal(true); };
  const openEdit = (p: Product) => { setEditing({ ...p }); setEditingId(p.id); setModal(true); };

  const handleSave = async () => {
    if (!editing.nameAr || !editing.nameEn || !editing.price) {
      showAlert(isRTL ? 'أدخل البيانات الأساسية' : 'Fill required fields', ''); return;
    }
    try {
      if (editingId) {
        await updateProduct(editingId, editing);
      } else {
        await addProduct({ ...editing, id: `p_${Date.now()}`, sold: 0, rating: 0, reviewCount: 0, createdAt: new Date().toISOString() } as Product);
      }
      setModal(false);
    } catch {
      showAlert(isRTL ? 'خطأ في الحفظ' : 'Save error', '');
    }
  };

  const handleDelete = (id: string) => {
    showAlert(
      isRTL ? 'حذف المنتج' : 'Delete Product',
      isRTL ? 'هل أنت متأكد؟' : 'Are you sure?',
      [
        { text: isRTL ? 'إلغاء' : 'Cancel', style: 'cancel' },
        { text: isRTL ? 'حذف' : 'Delete', style: 'destructive', onPress: () => deleteProduct(id) },
      ]
    );
  };

  const toggleSize = (s: string) => {
    const sizes = editing.sizes || [];
    setEditing(e => ({ ...e, sizes: sizes.includes(s) ? sizes.filter(x => x !== s) : [...sizes, s] }));
  };

  const addColor = () => {
    if (!colorInput.trim()) return;
    const colors = editing.colors || [];
    if (!colors.includes(colorInput.trim())) {
      setEditing(e => ({ ...e, colors: [...colors, colorInput.trim()] }));
    }
    setColorInput('');
  };

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8, allowsMultipleSelection: true });
    if (!res.canceled) {
      const uris = res.assets.map(a => a.uri);
      setEditing(e => ({ ...e, images: [...(e.images || []), ...uris] }));
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isRTL ? 'المنتجات' : 'Products'}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <MaterialIcons name="add" size={20} color="#0D1E16" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={16} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={isRTL ? 'بحث...' : 'Search...'}
          placeholderTextColor={Colors.textMuted}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <Image
              source={{ uri: item.images[0] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=100' }}
              style={styles.productThumb}
              contentFit="cover"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>{isRTL ? item.nameAr : item.nameEn}</Text>
              <Text style={styles.productPrice}>{item.price.toLocaleString()} {isRTL ? 'ريال' : 'YER'}</Text>
              <View style={styles.tagsRow}>
                {item.isOffer ? <View style={styles.offerTag}><Text style={styles.tagTxt}>-{item.offerPercent}%</Text></View> : null}
                {item.isNew ? <View style={styles.newTag}><Text style={styles.tagTxt}>{isRTL ? 'جديد' : 'NEW'}</Text></View> : null}
                {!item.isVisible ? <View style={styles.hiddenTag}><Text style={styles.tagTxt}>{isRTL ? 'مخفي' : 'Hidden'}</Text></View> : null}
              </View>
            </View>
            <View style={styles.productActions}>
              <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
                <MaterialIcons name="edit" size={16} color={Colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
                <MaterialIcons name="delete-outline" size={16} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      {/* Add/Edit Modal */}
      <Modal visible={modal} animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModal(false)}>
              <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editingId ? (isRTL ? 'تعديل المنتج' : 'Edit Product') : (isRTL ? 'منتج جديد' : 'New Product')}</Text>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnTxt}>{isRTL ? 'حفظ' : 'Save'}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Images */}
            <Text style={styles.fieldLabel}>{isRTL ? 'الصور' : 'Images'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
              <TouchableOpacity style={styles.addImgBtn} onPress={pickImage}>
                <MaterialIcons name="add-photo-alternate" size={28} color={Colors.primary} />
              </TouchableOpacity>
              {(editing.images || []).map((uri, i) => (
                <View key={i} style={styles.imgThumbWrap}>
                  <Image source={{ uri }} style={styles.imgThumb} contentFit="cover" />
                  <TouchableOpacity
                    style={styles.removeImgBtn}
                    onPress={() => setEditing(e => ({ ...e, images: (e.images || []).filter((_, j) => j !== i) }))}
                  >
                    <MaterialIcons name="close" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Names */}
            <Text style={styles.fieldLabel}>{isRTL ? 'الاسم (عربي)' : 'Name (Arabic)'} *</Text>
            <TextInput style={[styles.input, styles.rtl]} value={editing.nameAr} onChangeText={v => setEditing(e => ({ ...e, nameAr: v }))} placeholder="اسم المنتج" placeholderTextColor={Colors.textMuted} />

            <Text style={styles.fieldLabel}>Name (English) *</Text>
            <TextInput style={styles.input} value={editing.nameEn} onChangeText={v => setEditing(e => ({ ...e, nameEn: v }))} placeholder="Product name" placeholderTextColor={Colors.textMuted} />

            {/* Descriptions */}
            <Text style={styles.fieldLabel}>{isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}</Text>
            <TextInput style={[styles.input, styles.textarea, styles.rtl]} value={editing.descriptionAr} onChangeText={v => setEditing(e => ({ ...e, descriptionAr: v }))} multiline numberOfLines={3} textAlignVertical="top" placeholder="وصف المنتج..." placeholderTextColor={Colors.textMuted} />

            <Text style={styles.fieldLabel}>Description (English)</Text>
            <TextInput style={[styles.input, styles.textarea]} value={editing.descriptionEn} onChangeText={v => setEditing(e => ({ ...e, descriptionEn: v }))} multiline numberOfLines={3} textAlignVertical="top" placeholder="Product description..." placeholderTextColor={Colors.textMuted} />

            {/* Price */}
            <Text style={styles.fieldLabel}>{isRTL ? 'السعر (ريال) *' : 'Price (YER) *'}</Text>
            <TextInput style={styles.input} value={editing.price?.toString()} onChangeText={v => setEditing(e => ({ ...e, price: parseInt(v) || 0 }))} keyboardType="number-pad" placeholder="0" placeholderTextColor={Colors.textMuted} />

            <Text style={styles.fieldLabel}>{isRTL ? 'السعر الأصلي (اختياري)' : 'Original Price (optional)'}</Text>
            <TextInput style={styles.input} value={editing.originalPrice?.toString() || ''} onChangeText={v => setEditing(e => ({ ...e, originalPrice: v ? parseInt(v) : undefined }))} keyboardType="number-pad" placeholder="0" placeholderTextColor={Colors.textMuted} />

            {/* Stock */}
            <Text style={styles.fieldLabel}>{isRTL ? 'المخزون' : 'Stock'}</Text>
            <TextInput style={styles.input} value={editing.stock?.toString()} onChangeText={v => setEditing(e => ({ ...e, stock: parseInt(v) || 0 }))} keyboardType="number-pad" placeholder="0" placeholderTextColor={Colors.textMuted} />

            {/* Category */}
            <Text style={styles.fieldLabel}>{isRTL ? 'التصنيف' : 'Category'}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.catChip, editing.category === c.id && styles.catChipActive]}
                  onPress={() => setEditing(e => ({ ...e, category: c.id }))}
                >
                  <Text style={[styles.catChipTxt, editing.category === c.id && styles.catChipTxtActive]}>
                    {isRTL ? c.nameAr : c.nameEn}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Sizes */}
            <Text style={styles.fieldLabel}>{isRTL ? 'المقاسات' : 'Sizes'}</Text>
            <View style={styles.sizesGrid}>
              {[...SIZES.clothing, ...SIZES.kids, ...SIZES.accessories].filter((v, i, a) => a.indexOf(v) === i).map(s => (
                <TouchableOpacity key={s} style={[styles.sizeChip, (editing.sizes || []).includes(s) && styles.sizeChipActive]} onPress={() => toggleSize(s)}>
                  <Text style={[styles.sizeChipTxt, (editing.sizes || []).includes(s) && styles.sizeChipTxtActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Colors */}
            <Text style={styles.fieldLabel}>{isRTL ? 'الألوان' : 'Colors'}</Text>
            <View style={styles.colorInputRow}>
              <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} value={colorInput} onChangeText={setColorInput} placeholder={isRTL ? 'أضف لون...' : 'Add color...'} placeholderTextColor={Colors.textMuted} />
              <TouchableOpacity style={styles.addColorBtn} onPress={addColor}>
                <MaterialIcons name="add" size={20} color="#0D1E16" />
              </TouchableOpacity>
            </View>
            <View style={styles.colorsRow}>
              {(editing.colors || []).map((c, i) => (
                <View key={i} style={styles.colorTag}>
                  <Text style={styles.colorTagTxt}>{c}</Text>
                  <TouchableOpacity onPress={() => setEditing(e => ({ ...e, colors: (e.colors || []).filter((_, j) => j !== i) }))}>
                    <MaterialIcons name="close" size={12} color={Colors.textMuted} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Toggles */}
            {[
              { key: 'isOffer', labelAr: 'عرض خاص', labelEn: 'On Sale' },
              { key: 'isNew', labelAr: 'منتج جديد', labelEn: 'New Arrival' },
              { key: 'isFeatured', labelAr: 'منتج مميز', labelEn: 'Featured' },
              { key: 'isVisible', labelAr: 'مرئي للعملاء', labelEn: 'Visible to Customers' },
            ].map(t => (
              <View key={t.key} style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>{isRTL ? t.labelAr : t.labelEn}</Text>
                <Switch
                  value={!!(editing as any)[t.key]}
                  onValueChange={v => setEditing(e => ({ ...e, [t.key]: v }))}
                  trackColor={{ false: Colors.border, true: Colors.primary }}
                  thumbColor="#fff"
                />
              </View>
            ))}

            {editing.isOffer ? (
              <>
                <Text style={styles.fieldLabel}>{isRTL ? 'نسبة الخصم %' : 'Discount %'}</Text>
                <TextInput style={styles.input} value={editing.offerPercent?.toString() || ''} onChangeText={v => setEditing(e => ({ ...e, offerPercent: parseInt(v) || undefined }))} keyboardType="number-pad" placeholder="0" placeholderTextColor={Colors.textMuted} />
              </>
            ) : null}
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
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: Spacing.md, backgroundColor: Colors.bgSurface, borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border },
  searchInput: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary },
  list: { padding: Spacing.md, gap: Spacing.sm },
  productRow: { flexDirection: 'row', backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: 10, alignItems: 'center' },
  productThumb: { width: 70, height: 70, borderRadius: Radius.md },
  productInfo: { flex: 1, gap: 3 },
  productName: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  productPrice: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
  tagsRow: { flexDirection: 'row', gap: 4 },
  offerTag: { backgroundColor: Colors.error, borderRadius: Radius.sm, paddingHorizontal: 5, paddingVertical: 2 },
  newTag: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingHorizontal: 5, paddingVertical: 2 },
  hiddenTag: { backgroundColor: Colors.textMuted + '40', borderRadius: Radius.sm, paddingHorizontal: 5, paddingVertical: 2 },
  tagTxt: { fontSize: 9, color: '#fff', fontWeight: FontWeight.bold },
  productActions: { gap: 6 },
  editBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: Colors.error + '20', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 8 },
  saveBtnTxt: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#0D1E16' },
  modalContent: { padding: Spacing.lg, gap: 4, paddingBottom: 40 },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: Colors.textSecondary, marginTop: 8, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.bgInput, paddingHorizontal: 12, paddingVertical: 11, fontSize: FontSize.sm, color: Colors.textPrimary, marginBottom: 4 },
  rtl: { textAlign: 'right' },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  imagesRow: { height: 80, marginBottom: 12 },
  addImgBtn: { width: 72, height: 72, borderRadius: Radius.md, borderWidth: 2, borderColor: Colors.borderGold, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  imgThumbWrap: { position: 'relative', marginRight: 8 },
  imgThumb: { width: 72, height: 72, borderRadius: Radius.md },
  removeImgBtn: { position: 'absolute', top: -4, right: -4, backgroundColor: Colors.error, borderRadius: Radius.full, width: 18, height: 18, justifyContent: 'center', alignItems: 'center' },
  catChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border, marginRight: 6 },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipTxt: { fontSize: FontSize.sm, color: Colors.textSecondary },
  catChipTxtActive: { color: '#0D1E16', fontWeight: FontWeight.bold },
  sizesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  sizeChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.md, backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border },
  sizeChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  sizeChipTxt: { fontSize: FontSize.sm, color: Colors.textSecondary },
  sizeChipTxtActive: { color: '#0D1E16', fontWeight: FontWeight.bold },
  colorInputRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  addColorBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, width: 44, justifyContent: 'center', alignItems: 'center' },
  colorsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  colorTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.bgSurface, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, borderColor: Colors.border },
  colorTagTxt: { fontSize: FontSize.xs, color: Colors.textSecondary },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.divider },
  toggleLabel: { fontSize: FontSize.base, color: Colors.textPrimary },
});
