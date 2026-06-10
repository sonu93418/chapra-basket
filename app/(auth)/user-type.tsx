import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TextStyles, Radius, Spacing } from '../../src/theme';
import { useAppDispatch } from '../../src/hooks/useAppDispatch';
import { loginSuccess } from '../../src/features/auth/authSlice';

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

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.emoji}>🧺</Text>
        <Text style={styles.title}>Who are you?</Text>
        <Text style={styles.subtitle}>Choose your role to get the right experience</Text>

        <TouchableOpacity style={[styles.card, styles.customerCard]} onPress={selectCustomer} activeOpacity={0.88}>
          <Text style={styles.cardEmoji}>🛍️</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Customer</Text>
            <Text style={styles.cardDesc}>Order groceries, vegetables, medicines and more. Delivered in 30 minutes!</Text>
          </View>
          <Text style={styles.cardArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, styles.riderCard]} onPress={selectRider} activeOpacity={0.88}>
          <Text style={styles.cardEmoji}>🛵</Text>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Delivery Partner</Text>
            <Text style={styles.cardDesc}>Earn ₹800–₹1500 per day. Flexible hours. Be your own boss.</Text>
          </View>
          <Text style={styles.cardArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.card, styles.adminCard]} onPress={selectAdmin} activeOpacity={0.88}>
          <Text style={styles.cardEmoji}>📊</Text>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardTitle, { color: Colors.white }]}>Operations Portal</Text>
            <Text style={[styles.cardDesc, { color: 'rgba(255,255,255,0.7)' }]}>Monitor active fleet, dispatch orders, track battery/signals, and view metrics.</Text>
          </View>
          <Text style={[styles.cardArrow, { color: '#4FC3F7' }]}>→</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>You can switch roles anytime from settings</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  backBtn: { paddingTop: 60, paddingHorizontal: Spacing.lg },
  backText: { ...TextStyles.bodyLgSemiBold, color: Colors.primary },
  content: { flex: 1, paddingHorizontal: Spacing.lg, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 64, marginBottom: 20 },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 30, color: Colors.textPrimary, textAlign: 'center', marginBottom: 10 },
  subtitle: { ...TextStyles.bodyLg, color: Colors.textSecondary, textAlign: 'center', marginBottom: 40, lineHeight: 26 },
  card: {
    width: '100%', flexDirection: 'row', alignItems: 'center', gap: 16,
    borderRadius: Radius.xxl, padding: 20, marginBottom: 16, borderWidth: 2,
  },
  customerCard: { backgroundColor: Colors.white, borderColor: Colors.primary, shadowColor: Colors.primary, shadowOpacity: 0.15, shadowRadius: 20, elevation: 6 },
  riderCard: { backgroundColor: Colors.dark.surface, borderColor: Colors.dark.border },
  adminCard: { backgroundColor: '#101622', borderColor: '#2E3B52' },
  cardEmoji: { fontSize: 44 },
  cardInfo: { flex: 1 },
  cardTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.textPrimary, marginBottom: 4 },
  cardDesc: { ...TextStyles.bodySm, color: Colors.textSecondary, lineHeight: 20 },
  cardArrow: { fontSize: 24, color: Colors.primary, fontWeight: '700' },
  footer: { ...TextStyles.bodySm, color: Colors.textMuted, textAlign: 'center', marginTop: 24 },
});
