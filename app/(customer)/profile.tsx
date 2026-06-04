import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppDispatch';
import { logout } from '../../src/features/auth/authSlice';

const MENU_ITEMS = [
  { icon: '📍', label: 'Manage Addresses', route: '/addresses', badge: null },
  { icon: '💳', label: 'Wallet & Payments', route: '/wallet', badge: '₹120' },
  { icon: '❤️', label: 'Wishlist', route: '/wishlist', badge: null },
  { icon: '🎁', label: 'Refer & Earn', route: '/referral', badge: '₹50/referral' },
  { icon: '🎟️', label: 'My Coupons', route: '/coupons', badge: '3 active' },
  { icon: '🔔', label: 'Notifications', route: '/notifications', badge: '2' },
  { icon: '⚙️', label: 'Settings', route: '/settings', badge: null },
  { icon: '❓', label: 'Help & Support', route: '/help', badge: null },
];

export default function ProfileScreen() {
  const { user } = useAppSelector(s => s.auth);
  const dispatch = useAppDispatch();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <View style={[styles.profileCard, Shadows.md]}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </Text>
            </View>
            <View style={styles.onlineBadge} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || 'Anup Kumar'}</Text>
            <Text style={styles.phone}>+91 {user?.phone || '9876543210'}</Text>
            <View style={styles.referralChip}>
              <Text style={styles.referralText}>🎁 Referral: {user?.referralCode || 'ANUP2024'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editText}>Edit ✏️</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={[styles.statCard, styles.statCardDivider]}>
            <Text style={styles.statValue}>₹120</Text>
            <Text style={styles.statLabel}>Wallet</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Referrals</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menu}>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuItem, i < MENU_ITEMS.length - 1 && styles.menuItemBorder]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <View style={styles.menuRight}>
                {item.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                <Text style={styles.menuArrow}>›</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            dispatch(logout());
            router.replace('/(auth)/login' as any);
          }}
        >
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Chapra Basket v1.0.0 · Made with ❤️ in Bihar</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  profileCard: {
    margin: Spacing.lg, backgroundColor: Colors.white,
    borderRadius: Radius.xxl, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  avatarContainer: { position: 'relative' },
  avatar: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 28, color: Colors.white },
  onlineBadge: {
    position: 'absolute', bottom: 2, right: 2,
    width: 14, height: 14, borderRadius: 7,
    backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.white,
  },
  profileInfo: { flex: 1 },
  name: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.textPrimary, marginBottom: 2 },
  phone: { ...TextStyles.bodySm, color: Colors.textMuted, marginBottom: 6 },
  referralChip: {
    backgroundColor: Colors.primaryContainer, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start',
  },
  referralText: { ...TextStyles.micro, color: Colors.primaryDark, fontFamily: 'BeVietnamPro-SemiBold' },
  editBtn: {
    backgroundColor: Colors.surfaceVariant, borderRadius: Radius.lg,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  editText: { ...TextStyles.bodySm, color: Colors.textSecondary, fontFamily: 'BeVietnamPro-SemiBold' },

  statsRow: {
    flexDirection: 'row', marginHorizontal: Spacing.lg, marginBottom: Spacing.lg,
    backgroundColor: Colors.white, borderRadius: Radius.xxl,
    ...Shadows.sm,
  },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statCardDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: Colors.borderLight },
  statValue: { fontFamily: 'BeVietnamPro-Bold', fontSize: 22, color: Colors.primary, marginBottom: 2 },
  statLabel: { ...TextStyles.bodySm, color: Colors.textMuted },

  menu: { marginHorizontal: Spacing.lg, backgroundColor: Colors.white, borderRadius: Radius.xxl, marginBottom: Spacing.lg, ...Shadows.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  menuIcon: { fontSize: 22, width: 30 },
  menuLabel: { ...TextStyles.bodyLg, color: Colors.textPrimary, flex: 1 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { backgroundColor: Colors.primaryContainer, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { ...TextStyles.micro, color: Colors.primary, fontFamily: 'BeVietnamPro-Bold' },
  menuArrow: { fontSize: 20, color: Colors.textMuted },

  logoutBtn: {
    marginHorizontal: Spacing.lg, backgroundColor: Colors.errorContainer,
    borderRadius: Radius.xxl, paddingVertical: 16, alignItems: 'center', marginBottom: 16,
  },
  logoutText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.error },
  version: { ...TextStyles.micro, color: Colors.textMuted, textAlign: 'center', marginBottom: 30 },
});
