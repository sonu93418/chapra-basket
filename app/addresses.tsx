import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../src/theme';
import { Address } from '../src/types';

const MOCK_ADDRESSES: Address[] = [
  {
    id: 'addr-1', label: 'Home', fullAddress: 'Plot 12, Sadar Bazaar, near SBI Bank',
    landmark: 'Near SBI Bank', lat: 25.7740, lng: 84.7374,
    city: 'Chapra', state: 'Bihar', pincode: '841301', isDefault: true,
  },
  {
    id: 'addr-2', label: 'Work', fullAddress: 'Office Block B, Station Road, Chapra',
    landmark: 'Near Railway Station', lat: 25.7800, lng: 84.7450,
    city: 'Chapra', state: 'Bihar', pincode: '841301', isDefault: false,
  },
];

const LABEL_ICONS: Record<string, string> = { Home: '🏠', Work: '💼', Other: '📍' };

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES);

  const setDefault = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Addresses</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={addresses}
        keyExtractor={a => a.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={[styles.card, Shadows.sm, item.isDefault && styles.cardDefault]}>
            {item.isDefault && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>✓ Default</Text>
              </View>
            )}
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                <Text style={styles.labelIcon}>{LABEL_ICONS[item.label] ?? '📍'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.address}>{item.fullAddress}</Text>
                {item.landmark && <Text style={styles.landmark}>Near: {item.landmark}</Text>}
                <Text style={styles.city}>{item.city}, {item.state} — {item.pincode}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionBtnText}>✏️ Edit</Text>
              </TouchableOpacity>
              {!item.isDefault && (
                <TouchableOpacity style={styles.actionBtn} onPress={() => setDefault(item.id)}>
                  <Text style={styles.actionBtnText}>⭐ Set Default</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]}>
                <Text style={styles.deleteBtnText}>🗑️ Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnIcon}>＋</Text>
            <Text style={styles.addBtnText}>Add New Address</Text>
          </TouchableOpacity>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20, color: Colors.textPrimary },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.textPrimary },

  list: { padding: Spacing.md, paddingBottom: 40 },

  card: {
    backgroundColor: Colors.white, borderRadius: Radius.xxl,
    padding: 16, borderWidth: 1.5, borderColor: Colors.borderLight,
  },
  cardDefault: { borderColor: Colors.primary },
  defaultBadge: {
    alignSelf: 'flex-start', backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3, marginBottom: 10,
  },
  defaultBadgeText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 11, color: Colors.primary },

  cardHeader: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  iconBox: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center',
  },
  labelIcon: { fontSize: 24 },
  label: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.textPrimary, marginBottom: 4 },
  address: { ...TextStyles.bodySm, color: Colors.textSecondary, lineHeight: 20 },
  landmark: { ...TextStyles.bodySm, color: Colors.textMuted, marginTop: 2 },
  city: { ...TextStyles.bodySm, color: Colors.textMuted, marginTop: 2 },

  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn: {
    borderRadius: Radius.button, paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.surfaceVariant,
  },
  actionBtnText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.textSecondary },
  deleteBtn: { backgroundColor: Colors.errorContainer },
  deleteBtnText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.error },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center',
    marginTop: 16, backgroundColor: Colors.white, borderRadius: Radius.xxl,
    paddingVertical: 18, borderWidth: 2, borderColor: Colors.primaryLighter,
    borderStyle: 'dashed',
  },
  addBtnIcon: { fontSize: 22, color: Colors.primary },
  addBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.primary },
});
