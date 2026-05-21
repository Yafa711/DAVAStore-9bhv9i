import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { useAlert } from '@/template';

export default function AdminBanksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { settings, updateSettings } = useData();
  const { showAlert } = useAlert();
  const isRTL = language === 'ar';
  const [banks, setBanks] = useState(settings.paymentBanks);

  const handleSave = async () => {
    await updateSettings({ paymentBanks: banks });
    showAlert(isRTL ? 'تم الحفظ' : 'Saved', '');
  };

  const updateBank = (i: number, key: string, value: any) => {
    setBanks(bs => bs.map((b, j) => j === i ? { ...b, [key]: value } : b));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.title}>{isRTL ? 'البنوك والدفع' : 'Banks & Payment'}</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}><Text style={styles.saveTxt}>{isRTL ? 'حفظ' : 'Save'}</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {banks.map((bank, i) => (
          <View key={bank.id} style={styles.bankCard}>
            <View style={styles.bankTop}>
              <MaterialIcons name="account-balance" size={20} color={Colors.primary} />
              <Text style={styles.bankId}>{bank.nameAr}</Text>
              <Switch value={bank.isActive} onValueChange={v => updateBank(i, 'isActive', v)} trackColor={{ false: Colors.border, true: Colors.success }} thumbColor="#fff" />
            </View>
            {[
              { k: 'nameAr', l: 'الاسم (عربي)' },
              { k: 'nameEn', l: 'Name (English)' },
              { k: 'accountNumber', l: isRTL ? 'رقم الحساب' : 'Account Number' },
              { k: 'accountName', l: isRTL ? 'اسم الحساب' : 'Account Name' },
            ].map(f => (
              <View key={f.k}>
                <Text style={styles.fieldLabel}>{f.l}</Text>
                <TextInput
                  style={styles.input}
                  value={(bank as any)[f.k]}
                  onChangeText={v => updateBank(i, f.k, v)}
                  placeholder={f.l}
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            ))}
          </View>
        ))}
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
  bankCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.xl, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: 4 },
  bankTop: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  bankId: { flex: 1, fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  fieldLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 4, marginBottom: 2 },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, backgroundColor: Colors.bgInput, paddingHorizontal: 10, paddingVertical: 9, fontSize: FontSize.sm, color: Colors.textPrimary },
});
