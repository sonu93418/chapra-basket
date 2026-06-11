import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Switch, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../src/theme';
import { Address } from '../src/types';
import {
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} from '../src/api/addressesApi';
import {
  ArrowLeft, Home, Briefcase, MapPin, Edit,
  Star, Trash2, Plus, Check, X
} from '../src/components/ui/Icon';

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
  const { data: addresses = [], isLoading, error } = useGetAddressesQuery();
  const [addAddressCall] = useAddAddressMutation();
  const [updateAddressCall] = useUpdateAddressMutation();
  const [deleteAddressCall] = useDeleteAddressMutation();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Address Form States
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [fullAddress, setFullAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const resetForm = () => {
    setLabel('Home');
    setFullAddress('');
    setLandmark('');
    setPincode('');
    setIsDefault(false);
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setLabel(addr.label);
    setFullAddress(addr.fullAddress);
    setLandmark(addr.landmark || '');
    setPincode(addr.pincode);
    setIsDefault(addr.isDefault);
    setEditingId(addr.id);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!fullAddress.trim() || !pincode.trim()) {
      Alert.alert('Validation Error', 'Please fill in address and pincode');
      return;
    }

    try {
      const payload = {
        label,
        fullAddress,
        landmark,
        pincode,
        isDefault,
        city: 'Chapra',
        state: 'Bihar',
        lat: 25.774,
        lng: 84.7374,
      };

      if (editingId) {
        await updateAddressCall({ id: editingId, ...payload }).unwrap();
      } else {
        await addAddressCall(payload).unwrap();
      }
      setModalVisible(false);
      resetForm();
    } catch (err: any) {
      Alert.alert('Error', err?.data?.error || 'Failed to save address');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddressCall(id).unwrap();
            } catch (err: any) {
              Alert.alert('Error', err?.data?.error || 'Failed to delete address');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addr: Address) => {
    try {
      await updateAddressCall({ id: addr.id, isDefault: true }).unwrap();
    } catch (err: any) {
      Alert.alert('Error', err?.data?.error || 'Failed to update default address');
    }
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

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Failed to load addresses.</Text>
        </View>
      ) : (
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
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleOpenEdit(item)} activeOpacity={0.7}>
                  <Edit size={13} color={Colors.textSecondary} strokeWidth={2.5} />
                  <Text style={styles.actionBtnText}>Edit</Text>
                </TouchableOpacity>
                
                {!item.isDefault && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => handleSetDefault(item)} activeOpacity={0.7}>
                    <Star size={13} color={Colors.textSecondary} strokeWidth={2.5} />
                    <Text style={styles.actionBtnText}>Set Default</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDelete(item.id)} activeOpacity={0.7}>
                  <Trash2 size={13} color={Colors.error} strokeWidth={2.5} />
                  <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListFooterComponent={
            <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd} activeOpacity={0.8}>
              <Plus size={18} color={Colors.primary} strokeWidth={2.5} />
              <Text style={styles.addBtnText}>Add New Address</Text>
            </TouchableOpacity>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <MapPin size={48} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No saved addresses</Text>
              <Text style={styles.emptySub}>Please add a delivery address to order.</Text>
            </View>
          }
        />
      )}

      {/* Add / Edit Address Form Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingId ? 'Edit Address' : 'Add New Address'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={20} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <Text style={styles.formLabel}>Address Label</Text>
              <View style={styles.labelRow}>
                {(['Home', 'Work', 'Other'] as const).map(l => (
                  <TouchableOpacity
                    key={l}
                    style={[styles.labelChip, label === l && styles.labelChipActive]}
                    onPress={() => setLabel(l)}
                  >
                    <Text style={[styles.labelChipText, label === l && styles.labelChipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Full Address Details</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Flat / House No., Street, Mohalla"
                placeholderTextColor={Colors.textPlaceholder}
                value={fullAddress}
                onChangeText={setFullAddress}
                multiline
              />

              <Text style={styles.formLabel}>Landmark (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Near SBI Bank, chapra"
                placeholderTextColor={Colors.textPlaceholder}
                value={landmark}
                onChangeText={setLandmark}
              />

              <Text style={styles.formLabel}>Pincode</Text>
              <TextInput
                style={styles.textInput}
                placeholder="841301"
                placeholderTextColor={Colors.textPlaceholder}
                keyboardType="number-pad"
                maxLength={6}
                value={pincode}
                onChangeText={setPincode}
              />

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Set as Default Delivery Address</Text>
                <Switch
                  value={isDefault}
                  onValueChange={setIsDefault}
                  trackColor={{ false: Colors.borderLight, true: Colors.primaryLighter }}
                  thumbColor={isDefault ? Colors.primary : Colors.border}
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: 14,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.textPrimary },
  list: { padding: Spacing.lg, paddingBottom: 40 },
  card: { backgroundColor: Colors.white, borderRadius: Radius.xxl, padding: 16, borderWidth: 1.5, borderColor: Colors.borderLight },
  cardDefault: { borderColor: Colors.primary },
  defaultBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', backgroundColor: Colors.primaryContainer, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
  defaultBadgeText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 10, color: Colors.primary, letterSpacing: 0.2 },
  cardHeader: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  iconBox: { width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.textPrimary, marginBottom: 3 },
  addressText: { fontFamily: 'BeVietnamPro-Medium', fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  landmark: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted, marginTop: 3 },
  city: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', borderTopWidth: 1, borderTopColor: Colors.borderLight, paddingTop: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: Radius.xl, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: Colors.surfaceVariant },
  actionBtnText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12, color: Colors.textSecondary },
  deleteBtn: { backgroundColor: Colors.errorContainer },
  deleteBtnText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12, color: Colors.error },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 18, backgroundColor: Colors.white, borderRadius: Radius.xxl, paddingVertical: 16, borderWidth: 2, borderColor: Colors.primaryLighter, borderStyle: 'dashed' },
  addBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.primary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontFamily: 'BeVietnamPro-Medium', color: Colors.error },
  empty: { padding: 40, alignItems: 'center', justifyContent: 'center', gap: 12 },
  emptyTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.textPrimary },
  emptySub: { fontFamily: 'BeVietnamPro-Regular', color: Colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, padding: 20, paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingBottom: 12, marginBottom: 16 },
  modalTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.textPrimary },
  form: { gap: 12 },
  formLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.textSecondary },
  labelRow: { flexDirection: 'row', gap: 10 },
  labelChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.xl, backgroundColor: Colors.surfaceVariant },
  labelChipActive: { backgroundColor: Colors.primary },
  labelChipText: { fontFamily: 'BeVietnamPro-Bold', color: Colors.textSecondary, fontSize: 13 },
  labelChipTextActive: { color: Colors.white },
  textInput: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.lg, padding: 12, fontFamily: 'BeVietnamPro-Regular', fontSize: 14, color: Colors.textPrimary },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  switchLabel: { fontFamily: 'BeVietnamPro-Medium', fontSize: 14, color: Colors.textPrimary },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: Radius.xl, alignItems: 'center', marginTop: 14 },
  saveBtnText: { fontFamily: 'BeVietnamPro-Bold', color: Colors.white, fontSize: 15 },
});
