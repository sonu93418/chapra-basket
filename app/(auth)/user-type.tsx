import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { useAppDispatch } from '../../src/hooks/useAppDispatch';
import { loginSuccess } from '../../src/features/auth/authSlice';
import { ArrowLeft, ChevronRight, ShoppingBag, Bike, Activity } from '../../src/components/ui/Icon';

export default function UserTypeScreen() {
  const dispatch = useAppDispatch();

  const selectCustomer = () => {
    router.replace('/(customer)/' as any);
  };

  const selectRider = () => {
    dispatch(loginSuccess({
      user: { id: 'rider-1', phone: '+919876543210', name: 'Rajan Kumar', role: 'rider', referralCode: 'RIDER001', createdAt: new Date().toISOString() },
      token: 'mock-rider-token',
    }));
    router.replace('/(rider)/' as any);
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

      <View style={styles.content}>
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
          <View style={[styles.cardIconBox, { backgroundColor: Colors.surfaceVariant }]}>
            <Bike size={28} color={Colors.textSecondary} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Delivery Partner</Text>
            <Text style={styles.cardDesc}>Earn ₹800–₹1500 per day. Flexible hours. Be your own boss.</Text>
          </View>
          <ChevronRight size={20} color={Colors.textSecondary} strokeWidth={2.5} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, styles.adminCard]} onPress={selectAdmin} activeOpacity={0.88}>
          <View style={[styles.cardIconBox, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
            <Activity size={28} color="#4FC3F7" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: Colors.white }]}>Operations Portal</Text>
            <Text style={[styles.cardDesc, { color: 'rgba(255,255,255,0.7)' }]}>Monitor active fleet, dispatch orders, track battery/signals, and view metrics.</Text>
          </View>
          <ChevronRight size={20} color="#4FC3F7" strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={styles.footer}>You can switch roles anytime from settings</Text>
      </View>
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
  content: { flex: 1, paddingHorizontal: Spacing.lg, alignItems: 'center', justifyContent: 'center' },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Shadows.sm,
  },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 30, color: Colors.textPrimary, textAlign: 'center', marginBottom: 10 },
  subtitle: { ...TextStyles.bodyLg, color: Colors.textSecondary, textAlign: 'center', marginBottom: 40, lineHeight: 26 },
  card: {
    width: '100%', flexDirection: 'row', alignItems: 'center', gap: 16,
    borderRadius: Radius.xxl, padding: 20, marginBottom: 16, borderWidth: 2,
  },
  customerCard: { backgroundColor: Colors.white, borderColor: Colors.primary, shadowColor: Colors.primary, shadowOpacity: 0.15, shadowRadius: 20, elevation: 6 },
  riderCard: { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border },
  adminCard: { backgroundColor: '#101622', borderColor: '#2E3B52' },
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
