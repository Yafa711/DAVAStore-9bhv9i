import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/contexts/AppContext';
import { useData } from '@/contexts/DataContext';
import { useAlert } from '@/template';

export default function AdminDeliveryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language } = useApp();
  const { settings, updateSettings } = useData();
  const { showAlert } = useAlert();
  const isRTL = language === 'ar';
  const [cities, setCities] = useState(settings.deliveryCities);

  const handleUpdate = async () => {
    await updateSettings({ deliveryCities: cities });
    showAlert(isRTL ? 'تم الحفظ' : 'Saved', '');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><MaterialIcons name="arrow-back" size={22} color={Colors.textPrimary} /></TouchableOpacity>
        <Text style={styles.title}>{isRTL ? 'مدن التوصيل' : 'Delivery Cities'}</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}><Text style={styles.saveTxt}>{isRTL ? 'حفظ' : 'Save'}</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {cities.map((city, i) => (
          <View key={city.id} style={styles.cityCard}>
            <Text style={styles.cityName}>{city.nameAr} / {city.nameEn}</Text>
            <View style={styles.cityRow}>
              <Text style={styles.feeLabel}>{isRTL ? 'رسوم التوصيل (ريال)' : 'Delivery Fee (YER)'}</Text>
              <TextInput
                style={styles.feeInput}
                value={String(city.fee)}
                onChangeText={v => setCities(cs => cs.map((c, j) => j === i ? { ...c, fee: parseInt(v) || 0 } : c))}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.activeRow}>
              <Text style={styles.activeLabel}>{isRTL ? 'مفعّل' : 'Active'}</Text>
              <Switch
                value={city.isActive}
                onValueChange={v => setCities(cs => cs.map((c, j) => j === i ? { ...c, isActive: v } : c))}
                trackColor={{ false: Colors.border, true: Colors.success }}
                thumbColor="#fff"
              />
            </View>
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
  cityCard: { backgroundColor: Colors.bgCard, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: 10 },
  cityName: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textPrimary },
  cityRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feeLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
  feeInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, backgroundColor: Colors.bgInput, paddingHorizontal: 12, paddingVertical: 8, fontSize: FontSize.base, color: Colors.primary, fontWeight: FontWeight.bold, minWidth: 100, textAlign: 'center' },
  activeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeLabel: { fontSize: FontSize.sm, color: Colors.textSecondary },
});
