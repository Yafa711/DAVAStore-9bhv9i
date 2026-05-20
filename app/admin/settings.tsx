import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { useAlert } from '@/template';

export default function AdminSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { settings, updateSettings } = useData();
  const { showAlert } = useAlert();

  const [logoUrl, setLogoUrl] = useState(settings.appLogoUrl || '');
  const [whatsapp, setWhatsapp] = useState(settings.adminWhatsApp || '967782282586');
  const [welcome, setWelcome] = useState(settings.welcomeMessage || '');
  const [bannerUrl, setBannerUrl] = useState('');

  const handleSave = () => {
    updateSettings({ appLogoUrl: logoUrl, adminWhatsApp: whatsapp, welcomeMessage: welcome });
    showAlert(language === 'ar' ? 'تم الحفظ' : 'Saved', '');
  };

  const addBanner = () => {
    if (!bannerUrl.trim()) return;
    updateSettings({ heroBanners: [...settings.heroBanners, bannerUrl] });
    setBannerUrl('');
  };

  const removeBanner = (idx: number) => {
    updateSettings({ heroBanners: settings.heroBanners.filter((_, i) => i !== idx) });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{language === 'ar' ? 'إعدادات التطبيق' : 'App Settings'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{language === 'ar' ? 'شعار التطبيق' : 'App Logo'}</Text>
          <TextInput style={styles.input} value={logoUrl} onChangeText={setLogoUrl} placeholder={language === 'ar' ? 'رابط الشعار (URL)' : 'Logo URL'} placeholderTextColor={Colors.textMuted} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{language === 'ar' ? 'واتساب المدير' : 'Admin WhatsApp'}</Text>
          <TextInput style={styles.input} value={whatsapp} onChangeText={setWhatsapp} placeholder="967XXXXXXXXX" placeholderTextColor={Colors.textMuted} keyboardType="phone-pad" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{language === 'ar' ? 'رسالة الترحيب' : 'Welcome Message'}</Text>
          <TextInput style={[styles.input, styles.textArea]} value={welcome} onChangeText={setWelcome} placeholder={language === 'ar' ? 'رسالة الترحيب للعملاء' : 'Welcome message for customers'} placeholderTextColor={Colors.textMuted} multiline numberOfLines={3} textAlignVertical="top" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{language === 'ar' ? 'صور الإعلانات' : 'Banner Images'}</Text>
          <View style={styles.bannerRow}>
            <TextInput style={[styles.input, { flex: 1 }]} value={bannerUrl} onChangeText={setBannerUrl} placeholder={language === 'ar' ? 'رابط الصورة' : 'Image URL'} placeholderTextColor={Colors.textMuted} />
            <TouchableOpacity style={styles.addBtn} onPress={addBanner}><MaterialIcons name="add" size={22} color="#000" /></TouchableOpacity>
          </View>
          {settings.heroBanners.map((url, idx) => (
            <View key={idx} style={styles.bannerItem}>
              <Text style={styles.bannerUrl} numberOfLines={1}>{url}</Text>
              <TouchableOpacity onPress={() => removeBanner(idx)}><MaterialIcons name="delete" size={18} color={Colors.error} /></TouchableOpacity>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <LinearGradient colors={[Colors.primaryLight, Colors.primary, Colors.primaryDark]} style={styles.saveBtnGradient}>
            <MaterialIcons name="save" size={20} color="#000" />
            <Text style={styles.saveBtnText}>{language === 'ar' ? 'حفظ الإعدادات' : 'Save Settings'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  headerTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 40 },
  section: { gap: 8 },
  sectionTitle: { fontSize: FontSize.base, fontWeight: FontWeight.semibold, color: Colors.textSecondary },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.bgInput, paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: FontSize.base, color: Colors.textPrimary },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  bannerRow: { flexDirection: 'row', gap: 8 },
  addBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, padding: 10 },
  bannerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.bgCard, borderRadius: Radius.sm, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  bannerUrl: { flex: 1, fontSize: FontSize.xs, color: Colors.textSecondary },
  saveBtn: { borderRadius: Radius.md, overflow: 'hidden', marginTop: Spacing.sm },
  saveBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, gap: 8 },
  saveBtnText: { fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#000' },
});
