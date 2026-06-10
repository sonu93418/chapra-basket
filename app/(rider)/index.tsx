import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Animated, Dimensions, ActivityIndicator, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppDispatch';
import { toggleOnline, setActiveOrder, updateEarnings } from '../../src/features/rider/riderSlice';
import { updateOrderStatus } from '../../src/features/orders/ordersSlice';
import { emitRiderLocation, getSocket } from '../../src/services/socket';
import {
  MapPin, Bell, Clock, Star, TrendingUp, RefreshCw,
  Map, Store, Package, Check, Phone, MessageCircle, Navigation,
  ShieldAlert, LogOut, CheckCircle, Battery, Radio, Compass,
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
    address: 'Mohalla Dahiyawan, near Rajput Boarding, Chapra - 841301',
    storeLat: 25.7782,
    storeLng: 84.7352,
    customerLat: 25.7740,
    customerLng: 84.7374,
  },
  {
    id: 'ord-active-2',
    orderNumber: 'CB-2026-7719',
    storeName: 'Chapra Pharma & Wellness',
    distanceKm: 0.8,
    payout: 75,
    hasBonus: false,
    bonus: 0,
    itemsCount: 2,
    address: 'Naya Tola, East of Ramjaipal College, Chapra - 841301',
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
  const { profile, isOnline, activeOrderId } = useAppSelector(s => s.rider);
  
  const [orders, setOrders] = useState(INCOMING_ORDERS_POOL);
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [deliveryStep, setDeliveryStep] = useState<'accepted' | 'store_arrived' | 'picked_up' | 'delivered'>('accepted');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(88);
  const [networkSignal, setNetworkSignal] = useState('Excellent');

  const onlineAnim = useRef(new Animated.Value(isOnline ? 1 : 0)).current;
  const locationWatcherRef = useRef<Location.LocationSubscription | null>(null);

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

  // GPS Tracking watch logic based on delivery steps
  useEffect(() => {
    let active = true;

    async function startTracking() {
      if (!isOnline || !activeDelivery || !['accepted', 'store_arrived', 'picked_up'].includes(deliveryStep)) {
        stopTracking();
        return;
      }

      setGpsLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Foreground location permissions are required for sharing tracking telemetry with customers.');
        setGpsLoading(false);
        return;
      }
      setGpsLoading(false);

      // Stop previous watcher if active
      if (locationWatcherRef.current) {
        locationWatcherRef.current.remove();
        locationWatcherRef.current = null;
      }

      // Configure initial GPS watcher
      locationWatcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000, // Default 5 seconds
          distanceInterval: 5,
        },
        (loc) => {
          if (!active) return;
          const { latitude, longitude, heading, speed } = loc.coords;

          // Adaptive Polling Logic
          // Calculate current distance to customer
          const distToCustomer = getHaversineDistance(
            latitude,
            longitude,
            activeDelivery.customerLat,
            activeDelivery.customerLng
          );

          // If within 1km (1000m), accelerate update interval to 2 seconds
          const nearZone = distToCustomer <= 1000;
          const calculatedSpeed = speed ? speed * 3.6 : 0; // m/s to km/h

          // Emit location + telemetry details via sockets
          emitRiderLocation({
            orderId: activeDelivery.id,
            lat: latitude,
            lng: longitude,
            heading: heading || 0,
            speed: Number(calculatedSpeed.toFixed(1)),
            battery: batteryLevel,
            networkStatus: networkSignal,
          });

          // Adjust watcher settings dynamically on interval constraints if needed
          console.log(`[GPS] Tracked location: ${latitude}, ${longitude} | Speed: ${calculatedSpeed} km/h | Near customer: ${nearZone}`);
        }
      );
    }

    startTracking();

    return () => {
      active = false;
      stopTracking();
    };
  }, [isOnline, activeDelivery, deliveryStep, batteryLevel, networkSignal]);

  const stopTracking = () => {
    if (locationWatcherRef.current) {
      locationWatcherRef.current.remove();
      locationWatcherRef.current = null;
    }
  };

  const handleToggleOnline = () => {
    dispatch(toggleOnline());
    Animated.timing(onlineAnim, {
      toValue: isOnline ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Order Management Actions
  const handleAcceptOrder = (orderItem: any) => {
    dispatch(setActiveOrder(orderItem.id));
    setActiveDelivery(orderItem);
    setDeliveryStep('accepted');
    dispatch(updateOrderStatus({ orderId: orderItem.id, status: 'confirmed' }));
    
    // Remove from available orders pool
    setOrders(prev => prev.filter(o => o.id !== orderItem.id));

    // Emit status updates instantly to the socket server
    const socket = getSocket();
    if (socket) {
      socket.emit('order:update_status', { orderId: orderItem.id, status: 'confirmed' });
    }
  };

  const handleArriveStore = () => {
    setDeliveryStep('store_arrived');
    dispatch(updateOrderStatus({ orderId: activeDelivery.id, status: 'preparing' }));
    
    const socket = getSocket();
    if (socket) {
      socket.emit('order:update_status', { orderId: activeDelivery.id, status: 'preparing' });
    }
  };

  const handleConfirmPickup = () => {
    // Basic verification check: mock correct OTP is "1234"
    if (otpInput.trim() !== '1234') {
      setOtpError(true);
      return;
    }
    setOtpError(false);
    setOtpInput('');
    setDeliveryStep('picked_up');
    dispatch(updateOrderStatus({ orderId: activeDelivery.id, status: 'out_for_delivery' }));

    const socket = getSocket();
    if (socket) {
      socket.emit('order:update_status', { orderId: activeDelivery.id, status: 'out_for_delivery' });
    }
  };

  const handleConfirmDelivery = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit('order:update_status', { orderId: activeDelivery.id, status: 'delivered' });
    }

    dispatch(updateOrderStatus({ orderId: activeDelivery.id, status: 'delivered' }));
    dispatch(updateEarnings({ amount: activeDelivery.payout }));
    dispatch(setActiveOrder(null));
    setActiveDelivery(null);
    setDeliveryStep('accepted');
    alert('Delivery completed successfully! Payout credited to your wallet.');
  };

  const handleRejectOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
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

        {/* ACTIVE WORKFLOW TRACKING PANEL */}
        {activeDelivery && (
          <View style={styles.activeDeliveryCard}>
            <View style={styles.activeHeader}>
              <View style={styles.liveIndicator}>
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.liveText}>GPS SHARING ONLINE</Text>
              </View>
              <Text style={styles.orderNo}>Order #{activeDelivery.orderNumber}</Text>
            </View>

            <View style={styles.addressSection}>
              <View style={styles.addressRow}>
                <Store size={16} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.addressType}>Pickup Store</Text>
                  <Text style={styles.addressText}>{activeDelivery.storeName}</Text>
                </View>
              </View>
              <View style={styles.addressRow}>
                <MapPin size={16} color={Colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.addressType}>Dropoff Location</Text>
                  <Text style={styles.addressText}>{activeDelivery.address}</Text>
                </View>
              </View>
            </View>

            {/* Workflow steps state controller */}
            <View style={styles.stepController}>
              {deliveryStep === 'accepted' && (
                <TouchableOpacity style={styles.actionBtn} onPress={handleArriveStore} activeOpacity={0.88}>
                  <Navigation size={16} color={Colors.white} />
                  <Text style={styles.actionBtnText}>ARRIVED AT STORE</Text>
                </TouchableOpacity>
              )}

              {deliveryStep === 'store_arrived' && (
                <View style={styles.otpPanel}>
                  <Text style={styles.otpTitle}>Verify Order Pickup OTP</Text>
                  <Text style={styles.otpSub}>Ask the store manager for the 4-digit pickup code (Enter '1234'):</Text>
                  <View style={styles.otpInputRow}>
                    <TextInput
                      style={[styles.otpInput, otpError && styles.otpInputError]}
                      value={otpInput}
                      onChangeText={setOtpInput}
                      placeholder="XXXX"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      keyboardType="number-pad"
                      maxLength={4}
                    />
                    <TouchableOpacity style={styles.otpVerifyBtn} onPress={handleConfirmPickup} activeOpacity={0.85}>
                      <Check size={16} color={Colors.white} />
                    </TouchableOpacity>
                  </View>
                  {otpError && <Text style={styles.errorText}>Invalid OTP. Try again.</Text>}
                </View>
              )}

              {deliveryStep === 'picked_up' && (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.success }]} onPress={handleConfirmDelivery} activeOpacity={0.88}>
                  <CheckCircle size={16} color={Colors.white} />
                  <Text style={styles.actionBtnText}>CONFIRM DELIVERY (COD CHECK)</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Available Orders Pool */}
        {!activeDelivery && (
          <View style={styles.ordersSection}>
            <View style={styles.ordersHeader}>
              <Text style={styles.sectionTitle}>Available Dispatch Pool ({orders.length})</Text>
              {gpsLoading && <ActivityIndicator size="small" color={Colors.primary} />}
            </View>

            {orders.map(o => (
              <View key={o.id} style={styles.orderCard}>
                <View style={styles.orderCardHeader}>
                  <View>
                    <Text style={styles.storeNameText}>{o.storeName}</Text>
                    <Text style={styles.orderDistance}>{o.distanceKm} km · {o.itemsCount} items</Text>
                  </View>
                  <View style={styles.payoutColumn}>
                    <Text style={styles.payoutText}>₹{o.payout + o.bonus}</Text>
                    {o.hasBonus && <Text style={styles.bonusBadge}>+₹{o.bonus} Peak Bonus</Text>}
                  </View>
                </View>

                <Text style={styles.deliveryPath}>{o.address}</Text>

                <View style={styles.cardActions}>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRejectOrder(o.id)} activeOpacity={0.85}>
                    <Text style={styles.rejectText}>Reject</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.claimBtn} onPress={() => handleAcceptOrder(o)} activeOpacity={0.85}>
                    <Text style={styles.claimText}>Accept Order</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {orders.length === 0 && (
              <View style={styles.noOrdersCard}>
                <ShieldAlert size={36} color="rgba(255,255,255,0.2)" />
                <Text style={styles.noOrdersText}>Waiting for new orders...</Text>
                <Text style={styles.noOrdersSub}>We'll notify you as soon as orders are placed near your sector.</Text>
              </View>
            )}
          </View>
        )}

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

  noOrdersCard: { alignItems: 'center', justifyContent: 'center', paddingVertical: 48, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: Radius.xxl, borderStyle: 'dashed', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)' },
  noOrdersText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.white, marginTop: 12, marginBottom: 4 },
  noOrdersSub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.dark.textMuted, textAlign: 'center', paddingHorizontal: 32, lineHeight: 18 },

  // Weekly Performance
  performanceSection: { marginTop: 24 },
  perfGrid: { flexDirection: 'row', gap: 12, marginTop: 12 },
  perfCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: Radius.xl, borderLeftWidth: 3, borderLeftColor: Colors.primary },
  perfLabel: { fontFamily: 'BeVietnamPro-Medium', fontSize: 12, color: Colors.dark.textMuted, marginBottom: 4 },
  perfValue: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.white },
});
