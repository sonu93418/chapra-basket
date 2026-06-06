import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppDispatch';
import { toggleOnline } from '../../src/features/rider/riderSlice';
import { RIDER_AVAILABLE_ORDERS } from '../../src/data/mockData';
import { RiderOrder } from '../../src/types';
import { MapPin, Bell, Clock, Star, TrendingUp, RefreshCw, Map, Store, Package } from '../../src/components/ui/Icon';

const { width } = Dimensions.get('window');

type FilterType = 'all' | 'high_payout' | 'nearby' | 'express';

function OrderExpiryTimer({ seconds }: { seconds: number }) {
  const [remaining, setRemaining] = useState(seconds);
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 1000);
    Animated.timing(progress, { toValue: 0, duration: seconds * 1000, useNativeDriver: false }).start();
    return () => clearInterval(interval);
  }, []);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isUrgent = remaining < 60;

  return (
    <View style={styles.expiryRow}>
      <Clock size={13} color={isUrgent ? Colors.error : Colors.dark.textMuted} strokeWidth={2.5} />
      <Text style={[styles.expiryText, isUrgent && styles.expiryUrgent]}>
        Expires in {mins > 0 ? `${mins}m ` : ''}{secs}s
      </Text>
    </View>
  );
}

function RiderOrderCard({ order, onAccept }: { order: RiderOrder; onAccept: () => void }) {
  const isHighPayout = order.hasBonus;

  const storeIconComponent = order.storeType === 'restaurant' ? Package
    : order.storeType === 'pharmacy' ? Package
    : Store;

  return (
    <View style={[styles.orderCard, isHighPayout && styles.orderCardHighlight]}>
      {/* Top Row */}
      <View style={styles.orderTop}>
        <View style={styles.orderLeft}>
          <View style={[styles.storeIcon, { backgroundColor: isHighPayout ? Colors.primary + '30' : 'rgba(255,255,255,0.08)' }]}>
            {React.createElement(storeIconComponent, { size: 20, color: isHighPayout ? Colors.primary : Colors.dark.textSecondary, strokeWidth: 2 })}
          </View>
          <View>
            <Text style={styles.storeName}>{order.storeName}</Text>
            <Text style={styles.orderMeta}>Order #{order.orderNumber} · {order.distanceKm} km away</Text>
          </View>
        </View>
        <View style={styles.payoutContainer}>
          <Text style={styles.payout}>₹{order.payout}</Text>
          {order.hasBonus && (
            <Text style={styles.bonusText}>Earn +₹{order.bonus} bonus</Text>
          )}
          {!order.hasBonus && (
            <Text style={styles.regularText}>Regular Payout</Text>
          )}
        </View>
      </View>

      {/* Bottom Row */}
      <View style={styles.orderBottom}>
        {order.expiresInSeconds ? (
          <OrderExpiryTimer seconds={order.expiresInSeconds} />
        ) : (
          <View style={styles.itemPreview}>
            {order.itemImages.slice(0, 1).map((img, i) => (
              <View key={i} style={styles.itemDot} />
            ))}
            <Text style={styles.itemPreviewText}>{order.itemImages.length} items</Text>
          </View>
        )}
        <TouchableOpacity
          style={[styles.acceptBtn, !isHighPayout && styles.acceptBtnSecondary]}
          onPress={onAccept}
          activeOpacity={0.85}
        >
          <Text style={styles.acceptBtnText}>ACCEPT ORDER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function RiderDashboard() {
  const dispatch = useAppDispatch();
  const { profile, isOnline } = useAppSelector(s => s.rider);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const onlineAnim = useRef(new Animated.Value(isOnline ? 1 : 0)).current;

  const filters: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All Orders' },
    { key: 'high_payout', label: 'High Payout' },
    { key: 'nearby', label: 'Nearby (<2km)' },
    { key: 'express', label: 'Express' },
  ];

  const filteredOrders = RIDER_AVAILABLE_ORDERS.filter(o => {
    if (activeFilter === 'high_payout') return o.hasBonus;
    if (activeFilter === 'nearby') return o.distanceKm < 2;
    return true;
  });

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

      {/* ── AppBar ── */}
      <SafeAreaView edges={['top']} style={styles.appBar}>
        <View style={styles.appBarInner}>
          <View style={styles.appBarLeft}>
            <View style={styles.appBarIconWrap}>
              <MapPin size={14} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <Text style={styles.appBarTitle}>Rider Dashboard</Text>
          </View>
          <View style={styles.appBarRight}>
            {/* Online Toggle */}
            <TouchableOpacity
              style={[styles.onlineToggle, isOnline ? styles.onlineToggleOn : styles.onlineToggleOff]}
              onPress={handleToggleOnline}
              activeOpacity={0.85}
            >
              <Animated.View style={[
                styles.onlineDot,
                {
                  backgroundColor: onlineAnim.interpolate({ inputRange: [0, 1], outputRange: [Colors.error, Colors.successLight] }),
                }
              ]} />
              <Text style={[styles.onlineText, isOnline ? styles.onlineTextOn : styles.onlineTextOff]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notifBtn}>
              <Bell size={20} color='rgba(255,255,255,0.7)' strokeWidth={1.8} />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Earnings Hero ── */}
        <LinearGradient
          colors={['#3D2D26', '#0C0908']}
          style={styles.earningsCard}
        >
          <View style={styles.earningsGlow} />
          <Text style={styles.earningsLabel}>TOTAL EARNINGS TODAY</Text>
          <View style={styles.earningsRow}>
            <Text style={styles.earningsAmount}>₹{profile?.todayEarnings.toLocaleString()}</Text>
            <View style={styles.earningsTrend}>
              <TrendingUp size={14} color={Colors.successLight} strokeWidth={2.5} />
              <Text style={styles.trendText}>+12%</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Trips</Text>
              <Text style={styles.statValue}>{profile?.todayTrips}</Text>
            </View>
            <View style={[styles.statItem, styles.statDivider]}>
              <Text style={styles.statLabel}>Hours</Text>
              <Text style={styles.statValue}>{profile?.todayHours}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Rating</Text>
              <View style={styles.ratingRow}>
                <Text style={styles.statValue}>{profile?.avgRating}</Text>
                <Star size={13} color='#FFD700' strokeWidth={2} fill='#FFD700' />
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* ── Filter Chips ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer} contentContainerStyle={styles.filters}>
          {filters.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
              onPress={() => setActiveFilter(f.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, activeFilter === f.key && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Available Orders ── */}
        <View style={styles.ordersSection}>
          <View style={styles.ordersSectionHeader}>
            <Text style={styles.ordersTitle}>Available Orders ({filteredOrders.length})</Text>
            <TouchableOpacity style={styles.refreshBtn} activeOpacity={0.8}>
              <RefreshCw size={14} color={Colors.primary} strokeWidth={2.5} />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {filteredOrders.map(order => (
            <RiderOrderCard
              key={order.id}
              order={order}
              onAccept={() => console.log('Accept order', order.id)}
            />
          ))}

          {filteredOrders.length === 0 && (
            <View style={styles.noOrders}>
              <Text style={styles.noOrdersEmoji}>😴</Text>
              <Text style={styles.noOrdersText}>No orders available right now</Text>
              <Text style={styles.noOrdersSub}>Move to a hotspot for more orders</Text>
            </View>
          )}
        </View>

        {/* ── Map Teaser ── */}
        <TouchableOpacity style={styles.mapTeaser} activeOpacity={0.9}>
          <LinearGradient colors={['#1A1210', '#0C0908']} style={styles.mapBg}>
            {/* Fake map grid */}
            <View style={styles.mapGrid}>
              {Array.from({ length: 8 }).map((_, i) => (
                <View key={i} style={styles.mapGridLine} />
              ))}
            </View>
            {/* Hotspot dots */}
            <View style={[styles.hotspot, { top: '30%', left: '25%' }]} />
            <View style={[styles.hotspot, styles.hotspotLarge, { top: '50%', left: '55%' }]} />
            <View style={[styles.hotspot, { top: '70%', left: '35%' }]} />
          </LinearGradient>
          <LinearGradient colors={['transparent', 'rgba(12,9,8,0.9)']} style={styles.mapOverlay}>
            <View style={styles.mapFooter}>
              <Text style={styles.mapLabel}>Explore Hotspots Nearby</Text>
              <Map size={20} color={Colors.primary} strokeWidth={1.8} />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  scrollContent: { paddingBottom: 20 },

  appBar: { backgroundColor: 'rgba(12,9,8,0.95)', borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
  appBarInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: 12 },
  appBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  appBarIconWrap: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primary + '20', alignItems: 'center', justifyContent: 'center' },
  appBarTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.primary },
  appBarRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  onlineToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  onlineToggleOn: { backgroundColor: 'rgba(0,176,80,0.15)', borderWidth: 1, borderColor: 'rgba(0,176,80,0.3)' },
  onlineToggleOff: { backgroundColor: 'rgba(186,26,26,0.15)', borderWidth: 1, borderColor: 'rgba(186,26,26,0.3)' },
  onlineDot: { width: 8, height: 8, borderRadius: 4 },
  onlineText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13 },
  onlineTextOn: { color: Colors.successLight },
  onlineTextOff: { color: Colors.error },
  notifBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' },

  // Earnings Hero
  earningsCard: {
    margin: Spacing.lg, borderRadius: Radius.xxl,
    padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  earningsGlow: {
    position: 'absolute', top: -40, right: -40,
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: Colors.primary + '20',
  },
  earningsLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: 11, color: Colors.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 },
  earningsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  earningsAmount: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 38, color: Colors.white },
  earningsTrend: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: Colors.success + '30', paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.button },
  trendIcon: { color: Colors.successLight, fontWeight: '700', fontSize: 14 },
  trendText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.successLight },

  statsGrid: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statDivider: { borderLeftWidth: 1, borderRightWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 11, color: Colors.dark.textMuted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  statValue: { fontFamily: 'BeVietnamPro-Bold', fontSize: 22, color: Colors.white },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  starIcon: { fontSize: 14 },

  // Filter chips
  filtersContainer: { marginBottom: 20 },
  filters: { paddingHorizontal: Spacing.lg, gap: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.dark.textMuted },
  filterTextActive: { color: Colors.white },

  // Orders
  ordersSection: { paddingHorizontal: Spacing.lg },
  ordersSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  ordersTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.white },
  refreshBtn: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  refreshText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.primary },

  orderCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: Radius.xxl, padding: 16,
    marginBottom: 12,
  },
  orderCardHighlight: { borderColor: Colors.primary + '40' },

  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  orderLeft: { flexDirection: 'row', gap: 12, flex: 1 },
  storeIcon: { width: 48, height: 48, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center' },
  storeEmoji: { fontSize: 24 },
  storeName: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.white, marginBottom: 2 },
  orderMeta: { ...TextStyles.bodySm, color: Colors.dark.textMuted },

  payoutContainer: { alignItems: 'flex-end' },
  payout: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.primary },
  bonusText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 11, color: Colors.successLight },
  regularText: { ...TextStyles.micro, color: Colors.dark.textMuted },

  orderBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },

  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  expiryText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.dark.textMuted },
  expiryUrgent: { color: Colors.error },

  itemPreview: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  itemDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },
  itemPreviewText: { ...TextStyles.bodySm, color: Colors.dark.textMuted },

  acceptBtn: { backgroundColor: Colors.primary, borderRadius: Radius.xl, paddingHorizontal: 20, paddingVertical: 10, ...Shadows.primaryGlow },
  acceptBtnSecondary: { backgroundColor: 'rgba(255,255,255,0.1)', ...Shadows.none },
  acceptBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.white, letterSpacing: 0.5 },

  noOrders: { alignItems: 'center', paddingVertical: 40 },
  noOrdersEmoji: { fontSize: 48, marginBottom: 12 },
  noOrdersText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.white, marginBottom: 6 },
  noOrdersSub: { ...TextStyles.bodyLg, color: Colors.dark.textMuted },

  // Map teaser
  mapTeaser: { marginHorizontal: Spacing.lg, marginTop: 8, height: 160, borderRadius: Radius.xxl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  mapBg: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  mapGrid: { position: 'absolute', inset: 0 },
  mapGridLine: { flex: 1, borderBottomWidth: 1, borderBottomColor: Colors.primary + '15' },
  hotspot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  hotspotLarge: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.primary + 'CC' },
  mapOverlay: { position: 'absolute', inset: 0, justifyContent: 'flex-end' },
  mapFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  mapLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.white },
  mapIcon: { fontSize: 22 },
});
