import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppDispatch';
import { toggleOnline } from '../../src/features/rider/riderSlice';
import { getSocket } from '../../src/services/socket';
import {
  Star, TrendingUp, Store, Package, LogOut, Battery, Radio, Bike, MapPin, Signal
} from '../../src/components/ui/Icon';

const { width } = Dimensions.get('window');

// Raw available mock orders that the rider can claim
const INCOMING_ORDERS_POOL = [
  {
    id: 'ord-active-1',
    orderNumber: 'CB-2026-9482',
    storeName: 'Reliance Smart Supermarket',
    distanceKm: 1.4,
    payout: 95,
    hasBonus: true,
    bonus: 20,
    itemsCount: 6,
    address: 'Mohalla Dahiyawan, near Rajput Boarding, Blink Town - 841301',
    storeLat: 25.7782,
    storeLng: 84.7352,
    customerLat: 25.7740,
    customerLng: 84.7374,
  },
  {
    id: 'ord-active-2',
    orderNumber: 'CB-2026-7719',
    storeName: 'Blink Pharma & Wellness',
    distanceKm: 0.8,
    payout: 75,
    hasBonus: false,
    bonus: 0,
    itemsCount: 2,
    address: 'Naya Tola, East of Ramjaipal College, Blink Town - 841301',
    storeLat: 25.7750,
    storeLng: 84.7310,
    customerLat: 25.7712,
    customerLng: 84.7345,
  }
];

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

export default function RiderDashboard() {
  const dispatch = useAppDispatch();
  const { profile, isOnline } = useAppSelector(s => s.rider);
  
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [networkSignal, setNetworkSignal] = useState('Excellent');

  const onlineAnim = useRef(new Animated.Value(isOnline ? 1 : 0)).current;

  // Simulate slowly decaying battery level
  useEffect(() => {
    const timer = setInterval(() => {
      setBatteryLevel(b => Math.max(5, b - 1));
    }, 120000); // 2 minutes
    return () => clearInterval(timer);
  }, []);

  // Socket monitoring connection listener
  useEffect(() => {
    const socket = getSocket();
    if (socket && isOnline) {
      socket.emit('admin:subscribe');
    }
  }, [isOnline]);

  const handleToggleOnline = () => {
    dispatch(toggleOnline());
    Animated.timing(onlineAnim, {
      toValue: isOnline ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* AppBar */}
      <SafeAreaView edges={['top']} style={styles.appBar}>
        <View style={styles.appBarInner}>
          <View style={styles.appBarLeft}>
            <View style={styles.appBarIconWrap}>
              <Radio size={14} color={isOnline ? Colors.successLight : Colors.error} strokeWidth={2.5} />
            </View>
            <Text style={styles.appBarTitle}>Partner Portal</Text>
          </View>
          <View style={styles.appBarRight}>
            <View style={styles.telemetryBadge}>
              <Battery size={14} color="#FFF" />
              <Text style={styles.telemetryText}>{batteryLevel}%</Text>
            </View>
            {/* Online Toggle Switch */}
            <TouchableOpacity
              style={[styles.onlineToggle, isOnline ? styles.onlineToggleOn : styles.onlineToggleOff]}
              onPress={handleToggleOnline}
              activeOpacity={0.85}
            >
              <Animated.View style={[
                styles.onlineDot,
                {
                  backgroundColor: onlineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [Colors.error, Colors.successLight]
                  }),
                }
              ]} />
              <Text style={[styles.onlineText, isOnline ? styles.onlineTextOn : styles.onlineTextOff]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Earnings Card */}
        <LinearGradient colors={['#181D26', '#0C0E14']} style={styles.earningsCard}>
          <Text style={styles.earningsLabel}>TODAY'S PAYOUT CREDIT</Text>
          <View style={styles.earningsRow}>
            <Text style={styles.earningsAmount}>₹{profile?.todayEarnings ?? 0}</Text>
            <View style={styles.earningsTrend}>
              <TrendingUp size={13} color={Colors.successLight} />
              <Text style={styles.trendText}>Incentives Active</Text>
            </View>
          </View>

          {/* Performance scorecard grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Trips</Text>
              <Text style={styles.statValue}>{profile?.todayTrips ?? 0}</Text>
            </View>
            <View style={[styles.statItem, styles.statDivider]}>
              <Text style={styles.statLabel}>Hours</Text>
              <Text style={styles.statValue}>{profile?.todayHours ?? 0}h</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Rating</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.statValue}>{profile?.avgRating ?? 4.8}</Text>
                <Star size={12} color='#FFD700' fill='#FFD700' />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Operations Navigation Shortcuts */}
        <View style={styles.shortcutsRow}>
          <TouchableOpacity 
            style={styles.shortcutCard} 
            onPress={() => router.push('/(rider)/orders')}
            activeOpacity={0.85}
          >
            <View style={[styles.shortcutIconWrap, { backgroundColor: Colors.primary + '18' }]}>
              <Package size={20} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <Text style={styles.shortcutTitle}>Dispatch Pool</Text>
            <Text style={styles.shortcutSub}>View live incoming jobs & orders</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.shortcutCard} 
            onPress={() => router.push('/(rider)/earnings')}
            activeOpacity={0.85}
          >
            <View style={[styles.shortcutIconWrap, { backgroundColor: 'rgba(0,200,83,0.15)' }]}>
              <TrendingUp size={20} color={Colors.successLight} strokeWidth={2.5} />
            </View>
            <Text style={styles.shortcutTitle}>Earnings Hub</Text>
            <Text style={styles.shortcutSub}>Track performance achievements</Text>
          </TouchableOpacity>
        </View>

        {/* Analytics & Performance Metrics */}
        <View style={styles.performanceSection}>
          <Text style={styles.sectionTitle}>Weekly Performance</Text>
          <View style={styles.perfGrid}>
            <View style={styles.perfCard}>
              <Text style={styles.perfLabel}>Acceptance Rate</Text>
              <Text style={styles.perfValue}>98.2%</Text>
            </View>
            <View style={styles.perfCard}>
              <Text style={styles.perfLabel}>Avg Time</Text>
              <Text style={styles.perfValue}>21 mins</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  appBar: { backgroundColor: '#0B0D14', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  appBarInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: 12 },
  appBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appBarIconWrap: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,107,0,0.15)', alignItems: 'center', justifyContent: 'center' },
  appBarTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.primary },
  appBarRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },

  telemetryBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.07)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  telemetryText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 11, color: Colors.white },

  onlineToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
  onlineToggleOn: { backgroundColor: 'rgba(0,200,83,0.15)', borderWidth: 1, borderColor: 'rgba(0,200,83,0.3)' },
  onlineToggleOff: { backgroundColor: 'rgba(186,26,26,0.15)', borderWidth: 1, borderColor: 'rgba(186,26,26,0.3)' },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  onlineText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 12 },
  onlineTextOn: { color: Colors.successLight },
  onlineTextOff: { color: Colors.error },

  scrollContent: { padding: Spacing.lg },

  // Earnings
  earningsCard: { padding: 20, borderRadius: Radius.xxl, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  earningsLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: 10, color: Colors.primary, letterSpacing: 1.5 },
  earningsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, marginBottom: 18 },
  earningsAmount: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 36, color: Colors.white },
  earningsTrend: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,200,83,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  trendText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 12, color: Colors.successLight },

  statsGrid: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 16 },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statLabel: { fontFamily: 'BeVietnamPro-Medium', fontSize: 11, color: Colors.dark.textMuted, marginBottom: 2 },
  statValue: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.white },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },

  // Active workflow card
  activeDeliveryCard: { backgroundColor: '#131924', borderWidth: 1.5, borderColor: Colors.primary + '30', borderRadius: Radius.xxl, padding: 20, marginBottom: 20, ...Shadows.md },
  activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 12, marginBottom: 16 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary + '15', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  liveText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 10, color: Colors.primary },
  orderNo: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.white },

  addressSection: { gap: 16, marginBottom: 20 },
  addressRow: { flexDirection: 'row', gap: 12 },
  addressType: { fontFamily: 'BeVietnamPro-Bold', fontSize: 11, color: Colors.dark.textMuted, textTransform: 'uppercase' },
  addressText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.white, marginTop: 1 },

  stepController: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary, paddingVertical: 14, borderRadius: Radius.xl },
  actionBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.white, letterSpacing: 0.5 },

  // OTP Verification view
  otpPanel: { padding: 8 },
  otpTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.white },
  otpSub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.dark.textMuted, marginTop: 2, marginBottom: 12 },
  otpInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  otpInput: { flex: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.xl, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, color: Colors.white, fontFamily: 'BeVietnamPro-Bold', fontSize: 18, textAlign: 'center' },
  otpInputError: { borderColor: Colors.error },
  otpVerifyBtn: { width: 48, height: 48, backgroundColor: Colors.primary, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontFamily: 'BeVietnamPro-Medium', fontSize: 12, color: Colors.error, marginTop: 6 },

  // Available Orders Pool
  ordersSection: {},
  ordersHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.white },

  orderCard: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: Radius.xxl, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  orderCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  storeNameText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.white },
  orderDistance: { fontFamily: 'BeVietnamPro-Medium', fontSize: 12, color: Colors.dark.textMuted, marginTop: 1 },
  payoutColumn: { alignItems: 'flex-end' },
  payoutText: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 20, color: Colors.primary },
  bonusBadge: { fontFamily: 'BeVietnamPro-Bold', fontSize: 9, color: Colors.successLight, marginTop: 2 },
  deliveryPath: { fontFamily: 'BeVietnamPro-Regular', fontSize: 13, color: Colors.dark.textSecondary, marginBottom: 16, lineHeight: 18 },

  cardActions: { flexDirection: 'row', gap: 10 },
  rejectBtn: { flex: 1, paddingVertical: 12, borderRadius: Radius.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  rejectText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.dark.textSecondary },
  claimBtn: { flex: 2, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center' },
  claimText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.white },

  shortcutsRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  shortcutCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: Radius.xl, gap: 8 },
  shortcutIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  shortcutTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.white },
  shortcutSub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 11, color: Colors.dark.textMuted, lineHeight: 15 },

  // Weekly Performance
  performanceSection: { marginTop: 24 },
  perfGrid: { flexDirection: 'row', gap: 12, marginTop: 12 },
  perfCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: Radius.xl, borderLeftWidth: 3, borderLeftColor: Colors.primary },
  perfLabel: { fontFamily: 'BeVietnamPro-Medium', fontSize: 12, color: Colors.dark.textMuted, marginBottom: 4 },
  perfValue: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.white },
});
