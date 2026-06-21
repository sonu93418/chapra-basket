import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Modal, TextInput, Switch, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../src/theme';
import { Address } from '../src/types';
import * as Location from 'expo-location';
import {
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useSetDefaultAddressMutation,
  useDeleteAddressMutation,
} from '../src/api/addressesApi';
import {
  ArrowLeft, Home, Briefcase, MapPin, Edit,
  Star, Trash2, Plus, Check, X, Navigation
} from '../src/components/ui/Icon';

export default function AddressesScreen() {
  const { data: addresses = [], isLoading, error } = useGetAddressesQuery();
  const [addAddressCall] = useAddAddressMutation();
  const [updateAddressCall] = useUpdateAddressMutation();
  const [setDefaultAddressCall] = useSetDefaultAddressMutation();
  const [deleteAddressCall] = useDeleteAddressMutation();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Address Form States
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Chapra');
  const [state, setState] = useState('Bihar');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [latitude, setLatitude] = useState(25.774);
  const [longitude, setLongitude] = useState(84.7374);
  const [isDefault, setIsDefault] = useState(false);
  const [addressType, setAddressType] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [saving, setSaving] = useState(false);

  const [detectingLocation, setDetectingLocation] = useState(false);

  const resetForm = () => {
    setFullName('');
    setPhoneNumber('');
    setAddressLine1('');
    setAddressLine2('');
    setLandmark('');
    setCity('Chapra');
    setState('Bihar');
    setPostalCode('');
    setCountry('India');
    setLatitude(25.774);
    setLongitude(84.7374);
    setIsDefault(false);
    setEditingId(null);
    setAddressType('Home');
    setDeliveryInstructions('');
    setSaving(false);
  };

  const handleOpenAdd = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleOpenEdit = (addr: Address) => {
    setFullName(addr.fullName);
    setPhoneNumber(addr.phoneNumber);
    setAddressLine1(addr.addressLine1);
    setAddressLine2(addr.addressLine2 || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city);
    setState(addr.state);
    setPostalCode(addr.postalCode);
    setCountry(addr.country || 'India');
    setLatitude(addr.latitude ?? 25.774);
    setLongitude(addr.longitude ?? 84.7374);
    setIsDefault(addr.isDefault);
    setAddressType((addr.addressType as 'Home' | 'Work' | 'Other') || 'Home');
    setDeliveryInstructions(addr.deliveryInstructions || '');
    setEditingId(addr.id);
    setModalVisible(true);
  };

  const detectLocation = async () => {
    setDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location services in settings to detect your coordinates.');
        setDetectingLocation(false);
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude: lat, longitude: lng } = pos.coords;
      setLatitude(lat);
      setLongitude(lng);

      const geocode = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (geocode.length > 0) {
        const addressObj = geocode[0];
        setCity(addressObj.city || addressObj.subregion || 'Chapra');
        setState(addressObj.region || 'Bihar');
        setPostalCode(addressObj.postalCode || '841301');
        
        const streetDetails = [
          addressObj.name,
          addressObj.street,
          addressObj.district,
        ].filter(Boolean).join(', ');
        
        setAddressLine1(streetDetails || 'Detected Street Location');
        setAddressLine2(addressObj.subregion || '');
      } else {
        Alert.alert('Geocoding Failed', 'We couldn\'t fetch details for this location. Please enter details manually.');
      }
    } catch (err: any) {
      Alert.alert('Error Detecting Location', err.message || 'Failed to capture GPS details.');
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleSave = async () => {
    const trimmedName = fullName.trim();
    const trimmedPhone = phoneNumber.trim();
    const trimmedLine1 = addressLine1.trim();
    const trimmedLine2 = addressLine2.trim();
    const trimmedLandmark = landmark.trim();
    const trimmedCity = city.trim();
    const trimmedState = state.trim();
    const trimmedPincode = postalCode.trim();

    if (!trimmedName || !trimmedPhone || !trimmedLine1 || !trimmedCity || !trimmedState || !trimmedPincode) {
      Alert.alert('Validation Error', 'Please complete all required fields.');
      return;
    }

    // Phone number validation (Indian 10-digit mobile)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(trimmedPhone)) {
      Alert.alert('Validation Error', 'Please enter a valid 10-digit Indian phone number starting with 6-9.');
      return;
    }

    // Pincode validation (6-digit Indian PIN)
    const pincodeRegex = /^\d{6}$/;
    if (!pincodeRegex.test(trimmedPincode)) {
      Alert.alert('Validation Error', 'Please enter a valid 6-digit Indian PIN code.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        fullName: trimmedName,
        phoneNumber: trimmedPhone,
        addressLine1: trimmedLine1,
        addressLine2: trimmedLine2 || undefined,
        landmark: trimmedLandmark || undefined,
        city: trimmedCity,
        state: trimmedState,
        postalCode: trimmedPincode,
        country: country.trim(),
        latitude: latitude !== 25.774 || longitude !== 84.7374 ? latitude : undefined,
        longitude: latitude !== 25.774 || longitude !== 84.7374 ? longitude : undefined,
        isDefault,
        addressType,
        deliveryInstructions: deliveryInstructions.trim() || undefined,
      };

      if (editingId) {
        await updateAddressCall({ id: editingId, ...payload }).unwrap();
      } else {
        await addAddressCall(payload).unwrap();
      }
      setModalVisible(false);
      resetForm();
    } catch (err: any) {
      Alert.alert('Error Saving', err?.data?.error || 'Failed to save address details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to remove this address?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAddressCall(id).unwrap();
            } catch (err: any) {
              Alert.alert('Error', err?.data?.error || 'Failed to delete address.');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addr: Address) => {
    try {
      await setDefaultAddressCall(addr.id).unwrap();
    } catch (err: any) {
      Alert.alert('Error', err?.data?.error || 'Failed to update default address.');
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
        <Text style={styles.title}>My Delivery Addresses</Text>
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
                  {item.addressType === 'Home' ? (
                    <Home size={18} color={Colors.primary} strokeWidth={2} />
                  ) : item.addressType === 'Work' ? (
                    <Briefcase size={18} color={Colors.primary} strokeWidth={2} />
                  ) : (
                    <MapPin size={18} color={Colors.primary} strokeWidth={2} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.cardLabelRow}>
                    <Text style={styles.label}>{item.fullName} · {item.phoneNumber}</Text>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{item.addressType || 'Home'}</Text>
                    </View>
                  </View>
                  <Text style={styles.addressText}>{item.addressLine1}</Text>
                  {item.addressLine2 ? <Text style={styles.addressText}>{item.addressLine2}</Text> : null}
                  {item.landmark && (
                    <Text style={styles.landmark}>
                      <Text style={{ fontFamily: 'BeVietnamPro-SemiBold' }}>Landmark: </Text>
                      {item.landmark}
                    </Text>
                  )}
                  <Text style={styles.city}>{item.city}, {item.state} — {item.postalCode}</Text>
                  {!!item.deliveryInstructions && (
                    <Text style={styles.instructionsText}>
                      <Text style={{ fontFamily: 'BeVietnamPro-SemiBold' }}>Instructions: </Text>
                      {item.deliveryInstructions}
                    </Text>
                  )}
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
              <Text style={styles.emptySub}>Please add a delivery address to place orders.</Text>
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

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContainer}>
              {/* Location Detection Block */}
              <TouchableOpacity 
                style={styles.locationBtn} 
                onPress={detectLocation} 
                activeOpacity={0.85}
                disabled={detectingLocation}
              >
                {detectingLocation ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Navigation size={16} color={Colors.white} strokeWidth={2.5} />
                )}
                <Text style={styles.locationBtnText}>
                  {detectingLocation ? 'Locating...' : 'Use Current Location'}
                </Text>
              </TouchableOpacity>

              {latitude !== 25.774 && longitude !== 84.7374 && (
                <View style={styles.coordsPreview}>
                  <Check size={12} color={Colors.successDark} strokeWidth={3} />
                  <Text style={styles.coordsText}>GPS Locked: {latitude.toFixed(5)}, {longitude.toFixed(5)}</Text>
                </View>
              )}

              <Text style={styles.formLabel}>Receiver Name *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Sonu Kumar"
                placeholderTextColor={Colors.textPlaceholder}
                value={fullName}
                onChangeText={setFullName}
              />

              <Text style={styles.formLabel}>Contact Number *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 9876543210"
                placeholderTextColor={Colors.textPlaceholder}
                keyboardType="phone-pad"
                maxLength={10}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
              />

              <Text style={styles.formLabel}>Flat, House No., Building *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Flat 302, Royal Enclave"
                placeholderTextColor={Colors.textPlaceholder}
                value={addressLine1}
                onChangeText={setAddressLine1}
              />

              <Text style={styles.formLabel}>Street, Area, Locality</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Sadar Bazaar"
                placeholderTextColor={Colors.textPlaceholder}
                value={addressLine2}
                onChangeText={setAddressLine2}
              />

              <Text style={styles.formLabel}>Landmark (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Near SBI Bank"
                placeholderTextColor={Colors.textPlaceholder}
                value={landmark}
                onChangeText={setLandmark}
              />

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>City *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Chapra"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={city}
                    onChangeText={setCity}
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.formLabel}>State *</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Bihar"
                    placeholderTextColor={Colors.textPlaceholder}
                    value={state}
                    onChangeText={setState}
                  />
                </View>
              </View>

              <Text style={styles.formLabel}>Postal / Pincode *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="841301"
                placeholderTextColor={Colors.textPlaceholder}
                keyboardType="number-pad"
                maxLength={6}
                value={postalCode}
                onChangeText={setPostalCode}
              />

              <Text style={styles.formLabel}>Address Type</Text>
              <View style={styles.typeContainer}>
                {(['Home', 'Work', 'Other'] as const).map((type) => {
                  const isSelected = addressType === type;
                  const IconComponent = type === 'Home' ? Home : type === 'Work' ? Briefcase : MapPin;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeBtn,
                        isSelected && styles.typeBtnSelected,
                      ]}
                      onPress={() => setAddressType(type)}
                      activeOpacity={0.7}
                    >
                      <IconComponent
                        size={14}
                        color={isSelected ? Colors.white : Colors.textSecondary}
                        strokeWidth={2.5}
                      />
                      <Text
                        style={[
                          styles.typeBtnText,
                          isSelected && styles.typeBtnTextSelected,
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.formLabel}>Delivery Instructions (Optional)</Text>
              <TextInput
                style={[styles.textInput, styles.multilineInput]}
                placeholder="e.g. Ring the bell, leave at gate, call on arrival"
                placeholderTextColor={Colors.textPlaceholder}
                multiline
                numberOfLines={3}
                value={deliveryInstructions}
                onChangeText={setDeliveryInstructions}
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

              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleSave}
                activeOpacity={0.88}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.saveBtnText}>Save Address</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
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
  modalContent: { backgroundColor: Colors.white, borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingBottom: 12, marginBottom: 16 },
  modalTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.textPrimary },
  formContainer: { gap: 12, paddingBottom: 40 },
  formLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  locationBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: Radius.xl, marginBottom: 4 },
  locationBtnText: { fontFamily: 'BeVietnamPro-Bold', color: Colors.white, fontSize: 14 },
  coordsPreview: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.successContainer, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.lg, alignSelf: 'flex-start' },
  coordsText: { fontFamily: 'BeVietnamPro-Medium', fontSize: 11, color: Colors.successDark },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  textInput: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.lg, padding: 12, fontFamily: 'BeVietnamPro-Regular', fontSize: 14, color: Colors.textPrimary },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  switchLabel: { fontFamily: 'BeVietnamPro-Medium', fontSize: 14, color: Colors.textPrimary },
  saveBtn: { backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: Radius.xl, alignItems: 'center', marginTop: 14 },
  saveBtnText: { fontFamily: 'BeVietnamPro-Bold', color: Colors.white, fontSize: 15 },
  saveBtnDisabled: { opacity: 0.6 },
  typeContainer: { flexDirection: 'row', gap: 10, marginVertical: 6 },
  typeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, paddingVertical: 10, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.white, justifyContent: 'center' },
  typeBtnSelected: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  typeBtnText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.textSecondary },
  typeBtnTextSelected: { color: Colors.white },
  multilineInput: { minHeight: 70, textAlignVertical: 'top', paddingTop: 10 },
  cardLabelRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  typeBadge: { backgroundColor: Colors.surfaceVariant, borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  typeBadgeText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 10, color: Colors.textSecondary },
  instructionsText: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted, marginTop: 4 },
});
