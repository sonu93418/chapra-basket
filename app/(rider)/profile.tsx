import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing } from '../../src/theme';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppDispatch';
import { router } from 'expo-router';
import { logout } from '../../src/features/auth/authSlice';

export default function RiderProfileScreen() {
  const { profile } = useAppSelector(s => s.rider);
  const dispatch = useAppDispatch();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>R</Text>
          </View>
          <Text style={styles.name}>Rajan Kumar</Text>
          <Text style={styles.phone}>+91 76543 21098</Text>
          <View style={styles.ratingChip}>
            <Text style={styles.ratingText}>⭐ {profile?.avgRating} · {profile?.totalDeliveries} deliveries</Text>
          </View>
        </View>

        {/* KYC Status */}
        <View style={styles.kycCard}>
          <Text style={styles.kycEmoji}>✅</Text>
          <View>
            <Text style={styles.kycTitle}>KYC Verified</Text>
            <Text style={styles.kycSub}>Aadhaar & License approved</Text>
          </View>
          <View style={styles.kycBadge}><Text style={styles.kycBadgeText}>APPROVED</Text></View>
        </View>

        {/* Vehicle */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏍️ Vehicle Details</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Type</Text><Text style={styles.infoValue}>Motorcycle</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Number</Text><Text style={styles.infoValue}>BR 01 AB 1234</Text></View>
        </View>

        {/* Bank */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏦 Bank Account</Text>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Account</Text><Text style={styles.infoValue}>****6789</Text></View>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>IFSC</Text><Text style={styles.infoValue}>SBIN0001234</Text></View>
        </View>

        {/* SOS */}
        <TouchableOpacity style={styles.sosBtn}>
          <Text style={styles.sosText}>🆘 Emergency SOS</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={() => { dispatch(logout()); router.replace('/(auth)/login' as any); }}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  content: { padding: Spacing.lg, paddingBottom: 100 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 36, color: Colors.white },
  name: { fontFamily: 'BeVietnamPro-Bold', fontSize: 22, color: Colors.white, marginBottom: 4 },
  phone: { ...TextStyles.bodySm, color: Colors.dark.textMuted, marginBottom: 10 },
  ratingChip: { backgroundColor: Colors.primary + '20', borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 6 },
  ratingText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.primary },
  kycCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.successContainer + '20', borderRadius: Radius.xl, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: Colors.success + '30' },
  kycEmoji: { fontSize: 28 },
  kycTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.successLight },
  kycSub: { ...TextStyles.bodySm, color: Colors.dark.textMuted },
  kycBadge: { marginLeft: 'auto', backgroundColor: Colors.success, borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  kycBadgeText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 10, color: Colors.white },
  card: { backgroundColor: Colors.dark.card, borderRadius: Radius.xl, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: Colors.dark.border },
  cardTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.white, marginBottom: 12 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
  infoLabel: { ...TextStyles.bodySm, color: Colors.dark.textMuted },
  infoValue: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.white },
  sosBtn: { backgroundColor: Colors.error + '20', borderRadius: Radius.xxl, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: Colors.error + '40', marginBottom: 12 },
  sosText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.error },
  logoutBtn: { backgroundColor: Colors.dark.card, borderRadius: Radius.xxl, padding: 16, alignItems: 'center' },
  logoutText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.dark.textMuted },
});
