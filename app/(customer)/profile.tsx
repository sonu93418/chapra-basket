import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppDispatch';
import { logout } from '../../src/features/auth/authSlice';
import {
  MapPin, Wallet, Heart, Gift, Tag, Bell,
  Settings, Headphones, LogOut, ChevronRight,
  Pencil, Package, Star, IndianRupee, Users,
} from '../../src/components/ui/Icon';

// ─── Menu Config (SVG icons, no emojis) ────────────────────────────────────
const MENU_SECTIONS = [
  {
    title: 'My Account',
    items: [
      { Icon: MapPin,     label: 'Manage Addresses',  route: '/addresses',     badge: null,         color: '#0284C7' },
      { Icon: Wallet,     label: 'Wallet & Payments', route: '/wallet',        badge: '₹120',       color: '#7C3AED' },
      { Icon: Heart,      label: 'Wishlist',          route: '/wishlist',      badge: null,         color: '#E11D48' },
    ],
  },
  {
    title: 'Offers & Rewards',
    items: [
      { Icon: Gift,       label: 'Refer & Earn',      route: '/referral',      badge: '₹50/refer',  color: '#D97706' },
      { Icon: Tag,        label: 'My Coupons',        route: '/coupons',       badge: '3 active',   color: '#059669' },
    ],
  },
  {
    title: 'Support',
    items: [
      { Icon: Bell,       label: 'Notifications',     route: '/notifications', badge: '2',          color: '#FF6B00' },
      { Icon: Settings,   label: 'Settings',          route: '/settings',      badge: null,         color: Colors.textSecondary },
      { Icon: Headphones, label: 'Help & Support',    route: '/help',          badge: null,         color: '#0284C7' },
    ],
  },
];

export default function ProfileScreen() {
  const { user } = useAppSelector(s => s.auth);
  const dispatch = useAppDispatch();
  const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'CB';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

        {/* ── Profile Hero Card ── */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.avatarRow}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initials}</Text>
              </View>
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.name}>{user?.name || 'Anup Kumar'}</Text>
              <Text style={styles.phone}>+91 {user?.phone || '98765 43210'}</Text>
              <View style={styles.referralPill}>
                <Gift size={11} color="rgba(255,255,255,0.9)" strokeWidth={2} />
                <Text style={styles.referralText}>Code: {user?.referralCode || 'ANUP2024'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.editBtn} activeOpacity={0.85}>
              <Pencil size={15} color={Colors.white} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* ── Stats Row ── */}
        <View style={[styles.statsCard, Shadows.sm]}>
          <StatItem Icon={Package} value="12" label="Orders" color={Colors.primary} />
          <View style={styles.statDivider} />
          <StatItem Icon={IndianRupee} value="₹120" label="Wallet" color="#7C3AED" />
          <View style={styles.statDivider} />
          <StatItem Icon={Users} value="3" label="Referrals" color="#059669" />
          <View style={styles.statDivider} />
          <StatItem Icon={Star} value="4.8" label="Rating" color="#F59E0B" />
        </View>

        {/* ── Menu Sections ── */}
        {MENU_SECTIONS.map((section, si) => (
          <View key={si} style={styles.menuGroup}>
            <Text style={styles.groupTitle}>{section.title}</Text>
            <View style={[styles.menuCard, Shadows.sm]}>
              {section.items.map((item, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.menuItem, i < section.items.length - 1 && styles.menuItemBorder]}
                  onPress={() => router.push(item.route as any)}
                  activeOpacity={0.82}
                >
                  <View style={[styles.menuIconBg, { backgroundColor: item.color + '18' }]}>
                    <item.Icon size={18} color={item.color} strokeWidth={2} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <View style={styles.menuRight}>
                    {item.badge && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.badge}</Text>
                      </View>
                    )}
                    <ChevronRight size={16} color={Colors.textMuted} strokeWidth={1.8} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* ── Logout ── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => { dispatch(logout()); router.replace('/(auth)/login' as any); }}
          activeOpacity={0.85}
        >
          <LogOut size={18} color={Colors.error} strokeWidth={2} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Chapra Basket v1.0.0 · Made in Bihar</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Stat Item ────────────────────────────────────────────────────────────────
function StatItem({ Icon, value, label, color }: { Icon: any; value: string; label: string; color: string }) {
  return (
    <View style={styles.statItem}>
      <Icon size={16} color={color} strokeWidth={2} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  heroCard: { margin: Spacing.lg, borderRadius: Radius.xxl, padding: 20 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 24, color: Colors.white },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.success, borderWidth: 2, borderColor: Colors.white },
  profileInfo: { flex: 1 },
  name: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.white, marginBottom: 2 },
  phone: { fontFamily: 'BeVietnamPro-Regular', fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 8 },
  referralPill: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start' },
  referralText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.9)' },
  editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },

  statsCard: { flexDirection: 'row', marginHorizontal: Spacing.lg, marginBottom: Spacing.lg, backgroundColor: Colors.white, borderRadius: Radius.xxl },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16, gap: 3 },
  statDivider: { width: 1, backgroundColor: Colors.borderLight, marginVertical: 12 },
  statValue: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16 },
  statLabel: { fontFamily: 'BeVietnamPro-Regular', fontSize: 11, color: Colors.textMuted },

  menuGroup: { marginBottom: 12 },
  groupTitle: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12, color: Colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: Spacing.lg + 4, marginBottom: 8 },
  menuCard: { marginHorizontal: Spacing.lg, backgroundColor: Colors.white, borderRadius: Radius.xxl, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 14 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  menuIconBg: { width: 38, height: 38, borderRadius: Radius.lg, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 15, color: Colors.textPrimary, flex: 1 },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: { backgroundColor: Colors.primaryContainer, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 11, color: Colors.primary },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginHorizontal: Spacing.lg, backgroundColor: Colors.errorContainer, borderRadius: Radius.xxl, paddingVertical: 16, marginBottom: 16, marginTop: 8 },
  logoutText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.error },
  version: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted, textAlign: 'center' },
});
