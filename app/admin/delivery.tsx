import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';

export default function AdminDeliveryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { settings, updateSettings } = useData();
  const [editId, setEditId] = useState<string | null>(null);
  const [editFee, setEditFee] = useState('');

  const cities = settings.deliveryCities;

  const saveFee = (id: string) => {
    const updated = cities.map(c => c.id === id ? { ...c, fee: Number(editFee) } : c);
    updateSettings({ deliveryCities: updated });
    setEditId(null);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={24} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{language === 'ar' ? 'إدارة التوصيل' : 'Delivery Management'}</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={cities}
        keyExtractor={i => i.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.cityCard}>
            <MaterialIcons name="location-city" size={24} color={Colors.primary} />
            <View style={styles.cityInfo}>
              <Text style={styles.cityName}>{language === 'ar' ? item.nameAr : item.nameEn}</Text>
              {editId === item.id ? (
                <View style={styles.editRow}>
                  <TextInput style={styles.feeInput} value={editFee} onChangeText={setEditFee} keyboardType="numeric" placeholderTextColor={Colors.textMuted} />
                  <TouchableOpacity style={styles.saveBtn} onPress={() => saveFee(item.id)}><Text style={styles.saveBtnText}>{language === 'ar' ? 'حفظ' : 'Save'}</Text></TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity onPress={() => { setEditId(item.id); setEditFee(String(item.fee)); }}>
                  <Text style={styles.cityFee}>{item.fee.toLocaleString()} {language === 'ar' ? 'ريال' : 'YER'} <MaterialIcons name="edit" size={12} color={Colors.primary} /></Text>
                </TouchableOpacity>
              )}
            </View>
            <Switch value={item.isActive} onValueChange={v => updateSettings({ deliveryCities: cities.map(c => c.id === item.id ? { ...c, isActive: v } : c) })} trackColor={{ true: Colors.success }} />
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
  list: { padding: Spacing.md, gap: Spacing.sm },
  cityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md },
  cityInfo: { flex: 1 },
  cityName: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  cityFee: { fontSize: FontSize.base, color: Colors.primary, marginTop: 2 },
  editRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  feeInput: { flex: 1, borderWidth: 1, borderColor: Colors.borderGold, borderRadius: Radius.sm, backgroundColor: Colors.bgInput, paddingHorizontal: Spacing.sm, paddingVertical: 6, fontSize: FontSize.base, color: Colors.textPrimary },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.sm, paddingHorizontal: 12, paddingVertical: 6 },
  saveBtnText: { fontWeight: FontWeight.bold, color: '#000' },
});
