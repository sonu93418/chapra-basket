import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Animated, Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { Colors, Radius, Spacing, Shadows, TextStyles } from '../../src/theme';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppDispatch';
import { setActiveOrder, updateEarnings } from '../../src/features/rider/riderSlice';
import { updateOrderStatus } from '../../src/features/orders/ordersSlice';
import { emitRiderLocation, getSocket } from '../../src/services/socket';
import { SensorFusionEngine } from '../../src/utils/sensorFusion';
import {
  MapPin, Store, Package, Check, Navigation, Camera,
  Image as ImageIcon, CheckCircle, ShieldAlert, Radio, Battery
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

export default function RiderOrdersScreen() {
  const dispatch = useAppDispatch();
  const { isOnline, activeOrderId } = useAppSelector(s => s.rider);

  const [orders, setOrders] = useState(INCOMING_ORDERS_POOL);
  const [activeDelivery, setActiveDelivery] = useState<any>(null);
  const [deliveryStep, setDeliveryStep] = useState<'accepted' | 'store_arrived' | 'picked_up' | 'delivered'>('accepted');
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [proofCaptured, setProofCaptured] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const locationWatcherRef = useRef<Location.LocationSubscription | null>(null);
  const sensorFusionRef = useRef<SensorFusionEngine | null>(null);

  // Sync state if activeOrderId becomes null (e.g. from elsewhere)
  useEffect(() => {
    if (!activeOrderId) {
      setActiveDelivery(null);
    }
  }, [activeOrderId]);

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

      stopTracking();

      sensorFusionRef.current = new SensorFusionEngine(
        activeDelivery.storeLat,
        activeDelivery.storeLng,
        0
      );

      sensorFusionRef.current.start((fusedState) => {
        if (!active) return;
        emitRiderLocation({
          orderId: activeDelivery.id,
          lat: fusedState.lat,
          lng: fusedState.lng,
          heading: fusedState.heading,
          speed: fusedState.speed,
          battery: 90,
          networkStatus: fusedState.isDeadReckoning ? 'Weak (Dead Reckoning)' : 'Excellent',
        });
      });

      locationWatcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 5,
        },
        (loc) => {
          if (!active) return;
          const { latitude, longitude, heading, speed, accuracy } = loc.coords;

          if (sensorFusionRef.current) {
            sensorFusionRef.current.updateGPS(
              latitude,
              longitude,
              speed,
              heading,
              accuracy
            );
          }
        }
      );
    }

    startTracking();

    return () => {
      active = false;
      stopTracking();
    };
  }, [isOnline, activeDelivery, deliveryStep]);

  const stopTracking = () => {
    if (locationWatcherRef.current) {
      locationWatcherRef.current.remove();
      locationWatcherRef.current = null;
    }
    if (sensorFusionRef.current) {
      sensorFusionRef.current.stop();
      sensorFusionRef.current = null;
    }
  };

  const handleAcceptOrder = (orderItem: any) => {
    setProofCaptured(false);
    setIsCapturing(false);
    dispatch(setActiveOrder(orderItem.id));
    setActiveDelivery(orderItem);
    setDeliveryStep('accepted');
    dispatch(updateOrderStatus({ orderId: orderItem.id, status: 'confirmed' }));
    
    setOrders(prev => prev.filter(o => o.id !== orderItem.id));

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
    setProofCaptured(false);
    setIsCapturing(false);
    alert('Delivery completed successfully! Payout credited to your wallet.');
  };

  const handleRejectOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Shipments</Text>
        <Text style={styles.headerSub}>
          {isOnline ? 'Online & Ready' : 'Go Online to Accept Jobs'}
        </Text>
      </View>

      {!isOnline ? (
        <View style={styles.offlineBox}>
          <ShieldAlert size={40} color="rgba(255,255,255,0.2)" />
          <Text style={styles.offlineText}>You are currently Offline</Text>
          <Text style={styles.offlineSub}>Toggle your online status on the dashboard tab to begin receiving orders.</Text>
        </View>
      ) : activeDelivery ? (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Active Order Card */}
          <View style={styles.activeDeliveryCard}>
            <View style={styles.activeHeader}>
              <View style={styles.liveIndicator}>
                <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 6 }} />
                <Text style={styles.liveText}>GPS DISPATCHING</Text>
              </View>
              <Text style={styles.orderNo}>#{activeDelivery.orderNumber}</Text>
            </View>

            <View style={styles.addressSection}>
              <View style={styles.addressRow}>
                <Store size={18} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.addressType}>Pickup Store</Text>
                  <Text style={styles.addressText}>{activeDelivery.storeName}</Text>
                </View>
              </View>
              <View style={styles.addressRow}>
                <MapPin size={18} color={Colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.addressType}>Dropoff Location</Text>
                  <Text style={styles.addressText}>{activeDelivery.address}</Text>
                </View>
              </View>
            </View>

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
                  <Text style={styles.otpSub}>Ask the store manager for the 4-digit code (Enter '1234'):</Text>
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
                <View style={{ gap: 12 }}>
                  {!proofCaptured ? (
                    <TouchableOpacity 
                      style={[styles.actionBtn, { backgroundColor: Colors.primary }]} 
                      onPress={async () => {
                        setIsCapturing(true);
                        await new Promise(r => setTimeout(r, 1000));
                        setIsCapturing(false);
                        setProofCaptured(true);
                      }}
                      disabled={isCapturing}
                      activeOpacity={0.88}
                    >
                      {isCapturing ? (
                        <ActivityIndicator size="small" color={Colors.white} />
                      ) : (
                        <Camera size={16} color={Colors.white} />
                      )}
                      <Text style={styles.actionBtnText}>
                        {isCapturing ? 'CAPTURING PROOF...' : 'TAKE PROOF OF DELIVERY PHOTO'}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={{ gap: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.xl }}>
                        <ImageIcon size={20} color={Colors.successLight} />
                        <View style={{ flex: 1 }}>
                           <Text style={{ fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.white }}>Proof of Delivery Saved</Text>
                           <Text style={{ fontFamily: 'BeVietnamPro-Regular', fontSize: 11, color: Colors.dark.textMuted }}>pod_confirmation.jpg</Text>
                        </View>
                        <TouchableOpacity onPress={() => setProofCaptured(false)}>
                          <Text style={{ fontFamily: 'BeVietnamPro-Bold', fontSize: 12, color: Colors.error }}>Retake</Text>
                        </TouchableOpacity>
                      </View>
                      
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.success }]} onPress={handleConfirmDelivery} activeOpacity={0.88}>
                        <CheckCircle size={16} color={Colors.white} />
                        <Text style={styles.actionBtnText}>CONFIRM DELIVERY</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Available Jobs list */}
          <View style={styles.ordersSection}>
            <View style={styles.ordersHeader}>
              <Text style={styles.sectionTitle}>Available Jobs ({orders.length})</Text>
              {gpsLoading && <ActivityIndicator size="small" color={Colors.primary} />}
            </View>

            {orders.map(o => (
              <View key={o.id} style={styles.orderCard}>
                <View style={styles.orderCardHeader}>
                  <View style={{ flex: 1 }}>
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
                <Text style={styles.noOrdersSub}>We'll alert you as soon as new delivery orders are assigned in Chapra.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 16,
    backgroundColor: '#0F121C',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.white },
  headerSub: { fontFamily: 'BeVietnamPro-Medium', fontSize: 12, color: Colors.primary, marginTop: 2 },
  
  scrollContent: { padding: Spacing.lg, paddingBottom: 100 },
  
  offlineBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  offlineText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.white },
  offlineSub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 13, color: Colors.dark.textMuted, textAlign: 'center', lineHeight: 20 },

  activeDeliveryCard: { backgroundColor: '#131924', borderWidth: 1.5, borderColor: Colors.primary + '30', borderRadius: Radius.xxl, padding: 20, ...Shadows.md },
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

  otpPanel: { padding: 4 },
  otpTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.white },
  otpSub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.dark.textMuted, marginTop: 2, marginBottom: 12 },
  otpInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  otpInput: { flex: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.xl, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 16, color: Colors.white, fontFamily: 'BeVietnamPro-Bold', fontSize: 18, textAlign: 'center' },
  otpInputError: { borderColor: Colors.error },
  otpVerifyBtn: { width: 48, height: 48, backgroundColor: Colors.primary, borderRadius: Radius.xl, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontFamily: 'BeVietnamPro-Medium', fontSize: 12, color: Colors.error, marginTop: 6 },

  ordersSection: {},
  ordersHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.white },

  orderCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: Radius.xxl, padding: 18, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
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
});
