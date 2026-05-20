import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';

export default function AdminBanksScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { settings, updateSettings } = useData();
  const [editId, setEditId] = useState<string | null>(null);
  const [editAccount, setEditAccount] = useState('');
  const [editAccountName, setEditAccountName] = useState('');

  const banks = settings.paymentBanks;

  const saveBank = (id: string) => {
    const updated = banks.map(b => b.id === id ? { ...b, accountNumber: editAccount, accountName: editAccountName } : b);
    updateSettings({ paymentBanks: updated });
    setEditId(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{language === 'ar' ? 'بوابات الدفع' : 'Payment Banks'}</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={banks}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.bankCard}>
            <View style={styles.bankHeader}>
              <MaterialIcons name="account-balance" size={24} color={Colors.primary} />
              <Text style={styles.bankName}>{language === 'ar' ? item.nameAr : item.nameEn}</Text>
              <Switch value={item.isActive} onValueChange={v => updateSettings({ paymentBanks: banks.map(b => b.id === item.id ? { ...b, isActive: v } : b) })} trackColor={{ true: Colors.success }} />
            </View>
            {editId === item.id ? (
              <View style={styles.editSection}>
                <TextInput style={styles.editInput} value={editAccount} onChangeText={setEditAccount} placeholder={language === 'ar' ? 'رقم الحساب' : 'Account Number'} placeholderTextColor={Colors.textMuted} />
                <TextInput style={styles.editInput} value={editAccountName} onChangeText={setEditAccountName} placeholder={language === 'ar' ? 'اسم الحساب' : 'Account Name'} placeholderTextColor={Colors.textMuted} />
                <TouchableOpacity style={styles.saveBtn} onPress={() => saveBank(item.id)}>
                  <Text style={styles.saveBtnText}>{language === 'ar' ? 'حفظ' : 'Save'}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.accountInfo} onPress={() => { setEditId(item.id); setEditAccount(item.accountNumber); setEditAccountName(item.accountName); }}>
                <Text style={styles.accountNumber}>{item.accountNumber}</Text>
                <Text style={styles.accountName}>{item.accountName}</Text>
                <Text style={styles.editHint}><MaterialIcons name="edit" size={12} color={Colors.primary} /> {language === 'ar' ? 'تعديل' : 'Edit'}</Text>
              </TouchableOpacity>
            )}
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
  list: { padding: Spacing.md, gap: Spacing.md },
  bankCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.borderGold },
  bankHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  bankName: { flex: 1, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  accountInfo: { gap: 2 },
  accountNumber: { fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.medium },
  accountName: { fontSize: FontSize.sm, color: Colors.textSecondary },
  editHint: { fontSize: FontSize.xs, color: Colors.primary, marginTop: 4 },
  editSection: { gap: 8 },
  editInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, backgroundColor: Colors.bgInput, paddingHorizontal: Spacing.sm, paddingVertical: 10, fontSize: FontSize.sm, color: Colors.textPrimary },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, padding: 10, alignItems: 'center' },
  saveBtnText: { fontWeight: FontWeight.bold, color: '#000' },
});
