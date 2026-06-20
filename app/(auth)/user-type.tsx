import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { useAppDispatch } from '../../src/hooks/useAppDispatch';
import { loginSuccess } from '../../src/features/auth/authSlice';
import { ArrowLeft, ChevronRight, ShoppingBag, Bike, Activity, Store } from '../../src/components/ui/Icon';

export default function UserTypeScreen() {
  const dispatch = useAppDispatch();

  const selectCustomer = () => {
    dispatch(loginSuccess({
      user: { id: 'customer-1', phone: '+919876543212', name: 'Anup Kumar', role: 'customer', referralCode: 'ANUP2024', createdAt: new Date().toISOString() },
      token: 'mock-customer-token',
    }));
    router.replace('/(customer)/' as any);
  };

  const selectRider = () => {
    dispatch(loginSuccess({
      user: { id: 'rider-1', phone: '+919876543210', name: 'Rajan Kumar', role: 'rider', referralCode: 'RIDER001', createdAt: new Date().toISOString() },
      token: 'mock-rider-token',
    }));
    router.replace('/(rider)/' as any);
  };

  const selectStoreOwner = () => {
    dispatch(loginSuccess({
      user: { id: 'store-owner-1', phone: '+919876543215', name: 'Sadar Store Owner', role: 'store_owner', referralCode: 'STORE001', createdAt: new Date().toISOString() },
      token: 'mock-store-token',
    }));
    router.replace('/(store)/' as any);
  };

  const selectAdmin = () => {
    dispatch(loginSuccess({
      user: { id: 'admin-1', phone: '+919999999999', name: 'Ops Manager', role: 'admin', referralCode: 'OPS001', createdAt: new Date().toISOString() },
      token: 'mock-admin-token',
    }));
    router.replace('/(admin)/' as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <LinearGradient colors={[Colors.background, Colors.primaryContainer]} style={StyleSheet.absoluteFill} />

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
        <View style={styles.backBtnCircle}>
          <ArrowLeft size={20} color={Colors.primary} strokeWidth={2.5} />
        </View>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.logoIcon}>
          <ShoppingBag size={40} color={Colors.primary} strokeWidth={2} />
        </View>
        <Text style={styles.title}>Who are you?</Text>
        <Text style={styles.subtitle}>Choose your role to get the right experience</Text>

        <TouchableOpacity style={[styles.card, styles.customerCard]} onPress={selectCustomer} activeOpacity={0.88}>
          <View style={[styles.cardIconBox, { backgroundColor: Colors.primaryContainer }]}>
            <ShoppingBag size={28} color={Colors.primary} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Customer</Text>
            <Text style={styles.cardDesc}>Order groceries, vegetables, medicines and more. Delivered in 30 minutes!</Text>
          </View>
          <ChevronRight size={20} color={Colors.primary} strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, styles.riderCard]} onPress={selectRider} activeOpacity={0.88}>
          <View style={[styles.cardIconBox, { backgroundColor: '#FFF1EB' }]}>
            <Bike size={28} color={Colors.primary} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Delivery Partner</Text>
            <Text style={styles.cardDesc}>Earn ₹800–₹1500 per day. Flexible hours. Be your own boss.</Text>
          </View>
          <ChevronRight size={20} color={Colors.primary} strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, styles.storeCard]} onPress={selectStoreOwner} activeOpacity={0.88}>
          <View style={[styles.cardIconBox, { backgroundColor: '#E0F2F1' }]}>
            <Store size={28} color="#00796B" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Store Manager</Text>
            <Text style={styles.cardDesc}>Manage inventory, verify store status, track orders, and update pricing.</Text>
          </View>
          <ChevronRight size={20} color="#00796B" strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, styles.adminCard]} onPress={selectAdmin} activeOpacity={0.88}>
          <View style={[styles.cardIconBox, { backgroundColor: '#E0F7FA' }]}>
            <Activity size={28} color="#0284C7" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Operations Portal</Text>
            <Text style={styles.cardDesc}>Monitor active fleet, dispatch orders, track battery/signals, and view metrics.</Text>
          </View>
          <ChevronRight size={20} color="#0284C7" strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={styles.footer}>You can switch roles anytime from settings</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  backBtn: { paddingTop: 60, paddingHorizontal: Spacing.lg },
  backBtnCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: 40, alignItems: 'center' },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
    ...Shadows.sm,
  },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 30, color: Colors.textPrimary, textAlign: 'center', marginBottom: 10 },
  subtitle: { ...TextStyles.bodyLg, color: Colors.textSecondary, textAlign: 'center', marginBottom: 30, lineHeight: 26 },
  card: {
    width: '100%', flexDirection: 'row', alignItems: 'center', gap: 16,
    borderRadius: Radius.xxl, padding: 20, marginBottom: 16, borderWidth: 2,
    backgroundColor: Colors.white, borderColor: Colors.borderLight, ...Shadows.sm,
  },
  customerCard: { borderColor: Colors.primary, shadowColor: Colors.primary, shadowOpacity: 0.15, shadowRadius: 20, elevation: 6 },
  riderCard: { borderColor: '#FFB693' },
  storeCard: { borderColor: '#A3E2C9' },
  adminCard: { borderColor: '#B3E5FC' },
  cardIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.textPrimary, marginBottom: 4 },
  cardDesc: { ...TextStyles.bodySm, color: Colors.textSecondary, lineHeight: 20 },
  footer: { ...TextStyles.bodySm, color: Colors.textMuted, textAlign: 'center', marginTop: 24 },
});
