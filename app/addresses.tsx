import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../src/theme';
import { Address } from '../src/types';
import {
  ArrowLeft,
  Home,
  Briefcase,
  MapPin,
  Edit,
  Star,
  Trash2,
  Plus,
  Check,
} from '../src/components/ui/Icon';

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

const getLabelIcon = (label: string) => {
  switch (label.toLowerCase()) {
    case 'home':
      return <Home size={18} color={Colors.primary} strokeWidth={2.5} />;
    case 'work':
      return <Briefcase size={18} color={Colors.primary} strokeWidth={2.5} />;
    default:
      return <MapPin size={18} color={Colors.primary} strokeWidth={2.5} />;
  }
};

export default function AddressesScreen() {
  const [addresses, setAddresses] = useState(MOCK_ADDRESSES);

  const setDefault = (id: string) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>My Addresses</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={addresses}
        keyExtractor={a => a.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        renderItem={({ item }) => (
          <View style={[styles.card, Shadows.sm, item.isDefault && styles.cardDefault]}>
            {item.isDefault && (
              <View style={styles.defaultBadge}>
                <Check size={11} color={Colors.primary} strokeWidth={3} />
                <Text style={styles.defaultBadgeText}>Default Delivery Address</Text>
              </View>
            )}
            
            <View style={styles.cardHeader}>
              <View style={styles.iconBox}>
                {getLabelIcon(item.label)}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.addressText}>{item.fullAddress}</Text>
                {item.landmark && (
                  <Text style={styles.landmark}>
                    <Text style={{ fontFamily: 'BeVietnamPro-SemiBold' }}>Landmark: </Text>
                    {item.landmark}
                  </Text>
                )}
                <Text style={styles.city}>{item.city}, {item.state} — {item.pincode}</Text>
              </View>
            </View>

            {/* Action Row */}
            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} activeOpacity={0.7}>
                <Edit size={13} color={Colors.textSecondary} strokeWidth={2.5} />
                <Text style={styles.actionBtnText}>Edit</Text>
              </TouchableOpacity>
              
              {!item.isDefault && (
                <TouchableOpacity style={styles.actionBtn} onPress={() => setDefault(item.id)} activeOpacity={0.7}>
                  <Star size={13} color={Colors.textSecondary} strokeWidth={2.5} />
                  <Text style={styles.actionBtnText}>Set Default</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} activeOpacity={0.7}>
                <Trash2 size={13} color={Colors.error} strokeWidth={2.5} />
                <Text style={styles.deleteBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
            <Plus size={18} color={Colors.primary} strokeWidth={2.5} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 18,
    color: Colors.textPrimary,
  },
  list: {
    padding: Spacing.lg,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
  },
  cardDefault: {
    borderColor: Colors.primary,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 12,
  },
  defaultBadgeText: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 0.2,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  addressText: {
    fontFamily: 'BeVietnamPro-Medium',
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  landmark: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 3,
  },
  city: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: Radius.xl,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.surfaceVariant,
  },
  actionBtnText: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 12,
    color: Colors.textSecondary,
  },
  deleteBtn: {
    backgroundColor: Colors.errorContainer,
  },
  deleteBtnText: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 12,
    color: Colors.error,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
    marginTop: 18,
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: Colors.primaryLighter,
    borderStyle: 'dashed',
  },
  addBtnText: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 14,
    color: Colors.primary,
  },
});
