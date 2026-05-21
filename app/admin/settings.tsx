import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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
  const isRTL = language === 'ar';

  const [whatsapp, setWhatsapp] = useState(settings.adminWhatsApp);
  const [welcome, setWelcome] = useState(settings.welcomeMessage);

  const handleSave = async () => {
    await updateSettings({ adminWhatsApp: whatsapp, welcomeMessage: welcome });
    showAlert(isRTL ? 'تم الحفظ' : 'Saved', '');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.title}>{isRTL ? 'إعدادات التطبيق' : 'App Settings'}</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveTxt}>{isRTL ? 'حفظ' : 'Save'}</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isRTL ? 'التواصل' : 'Contact'}</Text>
          <Text style={styles.label}>{isRTL ? 'رقم واتساب المدير' : 'Admin WhatsApp'}</Text>
          <TextInput style={styles.input} value={whatsapp} onChangeText={setWhatsapp} keyboardType="phone-pad" placeholder="967XXXXXXXXX" placeholderTextColor={Colors.textMuted} />
          <Text style={styles.label}>{isRTL ? 'رسالة الترحيب' : 'Welcome Message'}</Text>
          <TextInput style={[styles.input, styles.textarea, isRTL && styles.rtl]} value={welcome} onChangeText={setWelcome} multiline numberOfLines={3} textAlignVertical="top" placeholderTextColor={Colors.textMuted} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 8 },
  saveTxt: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#0D1E16' },
  content: { padding: Spacing.lg, gap: Spacing.md },
  card: { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.lg, borderWidth: 1, borderColor: Colors.border, gap: 4 },
  cardTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary, marginBottom: 8 },
  label: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 8, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.bgInput, paddingHorizontal: 12, paddingVertical: 11, fontSize: FontSize.sm, color: Colors.textPrimary },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  rtl: { textAlign: 'right' },
});
