import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput,
  Modal, ScrollView, Switch, ActivityIndicator, Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { useAlert } from '@/template';
import { getSupabaseClient } from '@/template';
import { CATEGORIES, SIZES } from '@/constants/config';
import { Product } from '@/contexts/DataContext';

const BLANK: Partial<Product> = {
  nameAr: '', nameEn: '', descriptionAr: '', descriptionEn: '',
  price: 0, originalPrice: undefined, images: [], category: 'women',
  sizes: [], colors: [], stock: 0, isOffer: false, offerPercent: undefined,
  isNew: false, isFeatured: false, isVisible: true,
};

async function uploadProductImage(uri: string): Promise<string> {
  // Compress image first
  const compressed = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 800 } }],
    { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG }
  );

  const supabase = getSupabaseClient();
  const filename = `product_${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;

  // Convert to blob for upload
  let uploadData: any;
  if (Platform.OS === 'web') {
    const response = await fetch(compressed.uri);
    uploadData = await response.blob();
  } else {
    // Mobile: base64 approach
    const response = await fetch(compressed.uri);
    const blob = await response.blob();
    uploadData = blob;
  }

  const { data, error } = await supabase.storage
    .from('products')
    .upload(filename, uploadData, { contentType: 'image/jpeg', upsert: false });

  if (error) throw error;

  const { data: urlData } = supabase.storage.from('products').getPublicUrl(data.path);
  return urlData.publicUrl;
}

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
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [catFilter, setCatFilter] = useState<string>('all');

  const allCats = [{ id: 'all', nameAr: 'الكل', nameEn: 'All' }, ...CATEGORIES];

  const filtered = products
    .filter(p => catFilter === 'all' || p.category === catFilter)
    .filter(p => p.nameAr.includes(search) || p.nameEn.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing({ ...BLANK }); setEditingId(null); setModal(true); };
  const openEdit = (p: Product) => { setEditing({ ...p }); setEditingId(p.id); setModal(true); };

  const handleSave = async () => {
    if (!editing.nameAr || !editing.nameEn || !editing.price) {
      showAlert(isRTL ? 'أدخل البيانات الأساسية' : 'Fill required fields', '');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateProduct(editingId, editing);
      } else {
        await addProduct({
          ...editing,
          id: `p_${Date.now()}`,
          sold: 0,
          rating: 0,
          reviewCount: 0,
          createdAt: new Date().toISOString(),
        } as Product);
      }
      setModal(false);
    } catch {
      showAlert(isRTL ? 'خطأ في الحفظ' : 'Save error', '');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    showAlert(
      isRTL ? 'حذف المنتج' : 'Delete Product',
      isRTL ? 'هل أنت متأكد من الحذف؟' : 'Are you sure?',
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

  const pickAndUploadImages = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsMultipleSelection: true,
    });
    if (res.canceled) return;

    setUploading(true);
    try {
      const urls: string[] = [];
      for (const asset of res.assets) {
        const url = await uploadProductImage(asset.uri);
        urls.push(url);
      }
      setEditing(e => ({ ...e, images: [...(e.images || []), ...urls] }));
      showAlert(
        isRTL ? 'تم الرفع' : 'Uploaded',
        isRTL ? `تم رفع ${urls.length} صورة بنجاح` : `${urls.length} image(s) uploaded successfully`
      );
    } catch (err: any) {
      showAlert(isRTL ? 'خطأ في رفع الصورة' : 'Upload Error', err?.message || '');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setEditing(e => ({ ...e, images: (e.images || []).filter((_, j) => j !== index) }));
  };

  const Field = ({ label, value, onChangeText, multiline = false, keyboardType = 'default', rtl = false }: any) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.textarea, rtl && styles.rtl]}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType}
        placeholderTextColor={Colors.textMuted}
        placeholder={label}
      />
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isRTL ? `المنتجات (${filtered.length})` : `Products (${filtered.length})`}
        </Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <MaterialIcons name="add" size={20} color="#0D1E16" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={16} color={Colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={isRTL ? 'بحث عن منتج...' : 'Search products...'}
          placeholderTextColor={Colors.textMuted}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <MaterialIcons name="close" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catScrollContent}
      >
        {allCats.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[styles.catChip, catFilter === c.id && styles.catChipActive]}
            onPress={() => setCatFilter(c.id)}
          >
            <Text style={[styles.catChipTxt, catFilter === c.id && styles.catChipTxtActive]}>
              {isRTL ? c.nameAr : c.nameEn}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Product list */}
      <FlatList
        data={filtered}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons name="inventory-2" size={60} color={Colors.textMuted} />
            <Text style={styles.emptyTxt}>{isRTL ? 'لا توجد منتجات' : 'No products'}</Text>
            <TouchableOpacity style={styles.addFirstBtn} onPress={openAdd}>
              <LinearGradient colors={[Colors.primaryLight, Colors.primary]} style={styles.addFirstGrad}>
                <MaterialIcons name="add" size={18} color="#0D1E16" />
                <Text style={styles.addFirstTxt}>{isRTL ? 'أضف أول منتج' : 'Add First Product'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <Image
              source={{ uri: item.images[0] || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=100' }}
              style={styles.productThumb}
              contentFit="cover"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={1}>
                {isRTL ? item.nameAr : item.nameEn}
              </Text>
              <Text style={styles.productPrice}>{item.price.toLocaleString()} {isRTL ? 'ريال' : 'YER'}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.metaTxt}>
                  {isRTL ? `مخزون: ${item.stock}` : `Stock: ${item.stock}`}
                </Text>
                <Text style={styles.metaTxt}>
                  {isRTL ? `مبيع: ${item.sold}` : `Sold: ${item.sold}`}
                </Text>
              </View>
              <View style={styles.tagsRow}>
                {item.isOffer ? (
                  <View style={styles.offerTag}><Text style={styles.tagTxt}>-{item.offerPercent}%</Text></View>
                ) : null}
                {item.isNew ? (
                  <View style={styles.newTag}><Text style={styles.tagTxt}>{isRTL ? 'جديد' : 'NEW'}</Text></View>
                ) : null}
                {item.isFeatured ? (
                  <View style={styles.featTag}><Text style={styles.tagTxt}>{isRTL ? 'مميز' : 'Featured'}</Text></View>
                ) : null}
                {!item.isVisible ? (
                  <View style={styles.hiddenTag}><Text style={styles.tagTxt}>{isRTL ? 'مخفي' : 'Hidden'}</Text></View>
                ) : null}
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

      {/* ── Add/Edit Modal ── */}
      <Modal visible={modal} animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={[styles.modalContainer, { paddingTop: insets.top }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModal(false)}>
              <MaterialIcons name="close" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingId ? (isRTL ? 'تعديل المنتج' : 'Edit Product') : (isRTL ? 'منتج جديد' : 'New Product')}
            </Text>
            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#0D1E16" />
              ) : (
                <Text style={styles.saveBtnTxt}>{isRTL ? 'حفظ' : 'Save'}</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>

            {/* ── IMAGES SECTION ── */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionBoxHeader}>
                <MaterialIcons name="photo-library" size={18} color={Colors.primary} />
                <Text style={styles.sectionBoxTitle}>{isRTL ? 'صور المنتج' : 'Product Images'}</Text>
              </View>
              <Text style={styles.sectionHint}>
                {isRTL
                  ? 'يتم ضغط الصور تلقائياً قبل الرفع لتوفير المساحة'
                  : 'Images are automatically compressed before upload to save space'}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesRow}>
                <TouchableOpacity
                  style={[styles.addImgBtn, uploading && { opacity: 0.6 }]}
                  onPress={pickAndUploadImages}
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator color={Colors.primary} />
                  ) : (
                    <>
                      <MaterialIcons name="add-photo-alternate" size={24} color={Colors.primary} />
                      <Text style={styles.addImgTxt}>{isRTL ? 'رفع' : 'Upload'}</Text>
                    </>
                  )}
                </TouchableOpacity>
                {(editing.images || []).map((uri, i) => (
                  <View key={i} style={styles.imgThumbWrap}>
                    <Image source={{ uri }} style={styles.imgThumb} contentFit="cover" />
                    <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeImage(i)}>
                      <MaterialIcons name="close" size={12} color="#fff" />
                    </TouchableOpacity>
                    {i === 0 ? (
                      <View style={styles.mainImgBadge}>
                        <Text style={styles.mainImgTxt}>{isRTL ? 'رئيسية' : 'Main'}</Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* ── BASIC INFO ── */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionBoxHeader}>
                <MaterialIcons name="info-outline" size={18} color={Colors.primary} />
                <Text style={styles.sectionBoxTitle}>{isRTL ? 'المعلومات الأساسية' : 'Basic Info'}</Text>
              </View>

              <Field label={isRTL ? 'الاسم بالعربية *' : 'Name (Arabic) *'} value={editing.nameAr} onChangeText={(v: string) => setEditing(e => ({ ...e, nameAr: v }))} rtl />
              <Field label="Name (English) *" value={editing.nameEn} onChangeText={(v: string) => setEditing(e => ({ ...e, nameEn: v }))} />
              <Field label={isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'} value={editing.descriptionAr} onChangeText={(v: string) => setEditing(e => ({ ...e, descriptionAr: v }))} multiline rtl />
              <Field label="Description (English)" value={editing.descriptionEn} onChangeText={(v: string) => setEditing(e => ({ ...e, descriptionEn: v }))} multiline />
            </View>

            {/* ── PRICING & STOCK ── */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionBoxHeader}>
                <MaterialIcons name="sell" size={18} color={Colors.primary} />
                <Text style={styles.sectionBoxTitle}>{isRTL ? 'السعر والمخزون' : 'Pricing & Stock'}</Text>
              </View>

              <View style={styles.priceRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>{isRTL ? 'السعر (ريال) *' : 'Price (YER) *'}</Text>
                  <TextInput
                    style={[styles.input, styles.priceInput]}
                    value={editing.price?.toString()}
                    onChangeText={v => setEditing(e => ({ ...e, price: parseInt(v) || 0 }))}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>{isRTL ? 'السعر الأصلي' : 'Original Price'}</Text>
                  <TextInput
                    style={[styles.input, styles.priceInput]}
                    value={editing.originalPrice?.toString() || ''}
                    onChangeText={v => setEditing(e => ({ ...e, originalPrice: v ? parseInt(v) : undefined }))}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>{isRTL ? 'الكمية المتوفرة' : 'Stock Qty'}</Text>
                  <TextInput
                    style={[styles.input, styles.priceInput]}
                    value={editing.stock?.toString()}
                    onChangeText={v => setEditing(e => ({ ...e, stock: parseInt(v) || 0 }))}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              </View>

              {/* Stock indicator */}
              <View style={[styles.stockIndicator, {
                backgroundColor: (editing.stock || 0) === 0 ? Colors.error + '20'
                  : (editing.stock || 0) <= 5 ? Colors.warning + '20'
                  : Colors.success + '20'
              }]}>
                <MaterialIcons
                  name={(editing.stock || 0) === 0 ? 'remove-shopping-cart' : (editing.stock || 0) <= 5 ? 'warning' : 'check-circle'}
                  size={14}
                  color={(editing.stock || 0) === 0 ? Colors.error : (editing.stock || 0) <= 5 ? Colors.warning : Colors.success}
                />
                <Text style={[styles.stockTxt, {
                  color: (editing.stock || 0) === 0 ? Colors.error : (editing.stock || 0) <= 5 ? Colors.warning : Colors.success
                }]}>
                  {(editing.stock || 0) === 0
                    ? (isRTL ? 'نفد المخزون' : 'Out of Stock')
                    : (editing.stock || 0) <= 5
                    ? (isRTL ? 'مخزون منخفض' : 'Low Stock')
                    : (isRTL ? 'متوفر' : 'In Stock')}
                </Text>
              </View>
            </View>

            {/* ── CATEGORY ── */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionBoxHeader}>
                <MaterialIcons name="category" size={18} color={Colors.primary} />
                <Text style={styles.sectionBoxTitle}>{isRTL ? 'التصنيف' : 'Category'}</Text>
              </View>
              <View style={styles.chipGrid}>
                {CATEGORIES.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={[styles.chip, editing.category === c.id && styles.chipActive]}
                    onPress={() => setEditing(e => ({ ...e, category: c.id }))}
                  >
                    <MaterialIcons name={c.icon as any} size={14} color={editing.category === c.id ? '#0D1E16' : c.color} />
                    <Text style={[styles.chipTxt, editing.category === c.id && styles.chipTxtActive]}>
                      {isRTL ? c.nameAr : c.nameEn}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* ── SIZES ── */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionBoxHeader}>
                <MaterialIcons name="straighten" size={18} color={Colors.primary} />
                <Text style={styles.sectionBoxTitle}>{isRTL ? 'المقاسات المتاحة' : 'Available Sizes'}</Text>
              </View>
              <View style={styles.chipGrid}>
                {[...SIZES.clothing, ...SIZES.kids, ...SIZES.accessories]
                  .filter((v, i, a) => a.indexOf(v) === i)
                  .map(s => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.chip, (editing.sizes || []).includes(s) && styles.chipActive]}
                      onPress={() => toggleSize(s)}
                    >
                      <Text style={[styles.chipTxt, (editing.sizes || []).includes(s) && styles.chipTxtActive]}>{s}</Text>
                    </TouchableOpacity>
                  ))}
              </View>
            </View>

            {/* ── COLORS ── */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionBoxHeader}>
                <MaterialIcons name="palette" size={18} color={Colors.primary} />
                <Text style={styles.sectionBoxTitle}>{isRTL ? 'الألوان المتاحة' : 'Available Colors'}</Text>
              </View>
              <View style={styles.colorInputRow}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={colorInput}
                  onChangeText={setColorInput}
                  placeholder={isRTL ? 'أضف لوناً (مثل: أسود، أبيض)' : 'Add color (e.g. Black, White)'}
                  placeholderTextColor={Colors.textMuted}
                  onSubmitEditing={addColor}
                />
                <TouchableOpacity style={styles.addColorBtn} onPress={addColor}>
                  <MaterialIcons name="add" size={20} color="#0D1E16" />
                </TouchableOpacity>
              </View>
              {(editing.colors || []).length > 0 ? (
                <View style={styles.colorsWrap}>
                  {(editing.colors || []).map((c, i) => (
                    <View key={i} style={styles.colorTag}>
                      <Text style={styles.colorTagTxt}>{c}</Text>
                      <TouchableOpacity onPress={() => setEditing(e => ({ ...e, colors: (e.colors || []).filter((_, j) => j !== i) }))}>
                        <MaterialIcons name="close" size={12} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : null}
            </View>

            {/* ── FLAGS ── */}
            <View style={styles.sectionBox}>
              <View style={styles.sectionBoxHeader}>
                <MaterialIcons name="settings" size={18} color={Colors.primary} />
                <Text style={styles.sectionBoxTitle}>{isRTL ? 'خصائص المنتج' : 'Product Flags'}</Text>
              </View>
              {[
                { key: 'isOffer', labelAr: 'عرض خاص / تخفيض', labelEn: 'On Sale / Discount', icon: 'local-offer' },
                { key: 'isNew', labelAr: 'منتج جديد', labelEn: 'New Arrival', icon: 'new-releases' },
                { key: 'isFeatured', labelAr: 'منتج مميز (يظهر في الرئيسية)', labelEn: 'Featured (shown on home)', icon: 'star' },
                { key: 'isVisible', labelAr: 'مرئي للعملاء', labelEn: 'Visible to Customers', icon: 'visibility' },
              ].map(t => (
                <View key={t.key} style={styles.toggleRow}>
                  <View style={styles.toggleLeft}>
                    <MaterialIcons name={t.icon as any} size={16} color={Colors.primary} />
                    <Text style={styles.toggleLabel}>{isRTL ? t.labelAr : t.labelEn}</Text>
                  </View>
                  <Switch
                    value={!!(editing as any)[t.key]}
                    onValueChange={v => setEditing(e => ({ ...e, [t.key]: v }))}
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                    thumbColor="#fff"
                  />
                </View>
              ))}
              {editing.isOffer ? (
                <View style={styles.fieldWrap}>
                  <Text style={styles.fieldLabel}>{isRTL ? 'نسبة الخصم %' : 'Discount Percentage %'}</Text>
                  <TextInput
                    style={styles.input}
                    value={editing.offerPercent?.toString() || ''}
                    onChangeText={v => setEditing(e => ({ ...e, offerPercent: parseInt(v) || undefined }))}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={Colors.textMuted}
                  />
                </View>
              ) : null}
            </View>

          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: Spacing.md, marginBottom: 8, backgroundColor: Colors.bgSurface,
    borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: FontSize.sm, color: Colors.textPrimary },
  catScroll: { maxHeight: 44, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  catScrollContent: { paddingHorizontal: Spacing.md, paddingVertical: 7, gap: 6 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipTxt: { fontSize: FontSize.xs, color: Colors.textSecondary },
  catChipTxtActive: { color: '#0D1E16', fontWeight: FontWeight.bold },
  list: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 30 },
  productRow: {
    flexDirection: 'row', backgroundColor: Colors.bgCard, borderRadius: Radius.lg,
    padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border, gap: 10, alignItems: 'center',
  },
  productThumb: { width: 72, height: 72, borderRadius: Radius.md },
  productInfo: { flex: 1, gap: 3 },
  productName: { fontSize: FontSize.base, fontWeight: FontWeight.medium, color: Colors.textPrimary },
  productPrice: { fontSize: FontSize.sm, color: Colors.primary, fontWeight: FontWeight.bold },
  metaRow: { flexDirection: 'row', gap: 10 },
  metaTxt: { fontSize: FontSize.xs, color: Colors.textMuted },
  tagsRow: { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  offerTag: { backgroundColor: Colors.error, borderRadius: Radius.sm, paddingHorizontal: 5, paddingVertical: 2 },
  newTag: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingHorizontal: 5, paddingVertical: 2 },
  featTag: { backgroundColor: '#9C27B0', borderRadius: Radius.sm, paddingHorizontal: 5, paddingVertical: 2 },
  hiddenTag: { backgroundColor: Colors.textMuted + '40', borderRadius: Radius.sm, paddingHorizontal: 5, paddingVertical: 2 },
  tagTxt: { fontSize: 9, color: '#fff', fontWeight: FontWeight.bold },
  productActions: { gap: 6 },
  editBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary + '20', justifyContent: 'center', alignItems: 'center' },
  deleteBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.error + '20', justifyContent: 'center', alignItems: 'center' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyTxt: { fontSize: FontSize.base, color: Colors.textMuted },
  addFirstBtn: { borderRadius: Radius.full, overflow: 'hidden' },
  addFirstGrad: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12 },
  addFirstTxt: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: '#0D1E16' },
  // Modal
  modalContainer: { flex: 1, backgroundColor: Colors.bg },
  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 20, paddingVertical: 9, minWidth: 60, alignItems: 'center' },
  saveBtnTxt: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#0D1E16' },
  modalContent: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 },
  // Sections
  sectionBox: {
    backgroundColor: Colors.bgCard, borderRadius: Radius.xl,
    padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: 10,
  },
  sectionBoxHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionBoxTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textPrimary },
  sectionHint: { fontSize: FontSize.xs, color: Colors.textMuted, lineHeight: 18 },
  // Images
  imagesRow: { height: 92 },
  addImgBtn: {
    width: 80, height: 80, borderRadius: Radius.md, borderWidth: 2,
    borderColor: Colors.borderGold, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', marginRight: 8, gap: 3,
  },
  addImgTxt: { fontSize: FontSize.xs, color: Colors.primary },
  imgThumbWrap: { position: 'relative', marginRight: 8 },
  imgThumb: { width: 80, height: 80, borderRadius: Radius.md },
  removeImgBtn: {
    position: 'absolute', top: -4, right: -4, backgroundColor: Colors.error,
    borderRadius: Radius.full, width: 20, height: 20, justifyContent: 'center', alignItems: 'center',
  },
  mainImgBadge: {
    position: 'absolute', bottom: 4, left: 4, backgroundColor: Colors.primary,
    borderRadius: Radius.sm, paddingHorizontal: 5, paddingVertical: 2,
  },
  mainImgTxt: { fontSize: 9, color: '#0D1E16', fontWeight: FontWeight.bold },
  // Fields
  fieldWrap: { gap: 4 },
  fieldLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.textSecondary },
  input: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    backgroundColor: Colors.bgInput, paddingHorizontal: 12, paddingVertical: 11,
    fontSize: FontSize.sm, color: Colors.textPrimary,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  rtl: { textAlign: 'right' },
  // Price row
  priceRow: { flexDirection: 'row', gap: 8 },
  priceInput: { paddingVertical: 11, textAlign: 'center' },
  stockIndicator: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    padding: 8, borderRadius: Radius.md,
  },
  stockTxt: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  // Chips
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full,
    backgroundColor: Colors.bgSurface, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipTxt: { fontSize: FontSize.xs, color: Colors.textSecondary },
  chipTxtActive: { color: '#0D1E16', fontWeight: FontWeight.bold },
  // Colors
  colorInputRow: { flexDirection: 'row', gap: 8 },
  addColorBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md, width: 44,
    justifyContent: 'center', alignItems: 'center',
  },
  colorsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  colorTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.bgSurface, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border,
  },
  colorTagTxt: { fontSize: FontSize.xs, color: Colors.textSecondary },
  // Toggles
  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.divider,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleLabel: { fontSize: FontSize.sm, color: Colors.textPrimary },
});
