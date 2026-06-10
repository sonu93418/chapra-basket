import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Rect, Defs, RadialGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { useAppSelector } from '../../src/hooks/useAppDispatch';
import { useOrderTracking } from '../../src/hooks/useSocket';
import {
  ArrowLeft, Phone, MessageCircle, MapPin, Store,
  Bike, CheckCircle, Clock, Package, X,
  ChevronRight, Navigation, User, Battery, ShieldAlert,
} from '../../src/components/ui/Icon';

const { width } = Dimensions.get('window');

// Try loading native maps conditionally to support standard builds and fallbacks
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
} catch {
  console.log('[Maps] Native MapView fallback active');
}

// Visual Boundaries for Vector Map Viewport Projection
const MAP_BOUNDS = {
  minLat: 25.7730,
  maxLat: 25.7795,
  minLng: 84.7340,
  maxLng: 84.7385,
};

function getPercentageCoords(lat: number, lng: number) {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
  const y = 100 - ((lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
  return { left: `${Math.max(0, Math.min(100, x))}%`, top: `${Math.max(0, Math.min(100, y))}%` };
}

// Workaround for Ellipse element since react-native-svg doesn't export it
const Ellipse = ({ cx, cy, rx, ry, fill }: any) => (
  <Rect x={cx - rx} y={cy - ry} width={rx * 2} height={ry * 2} rx={rx} ry={ry} fill={fill} />
);

// Wheel SVG renderer helper
function WheelComponent() {
  return (
    <Svg width="11" height="11" viewBox="0 0 16 16" fill="none">
      <Circle cx="8" cy="8" r="7" fill="#1C1E24" stroke="#FFF" strokeWidth="1.5" />
      <Path d="M8 1 L8 15 M1 8 L15 8" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
    </Svg>
  );
}

// 3D-Style Premium Rider Component with overlays
function RiderSvgContainer({ wheelRotation, leanAngle }: { wheelRotation: SharedValue<number>, leanAngle: SharedValue<number> }) {
  const wheelStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${wheelRotation.value}deg` }],
  }));

  const bikeStyle = useAnimatedStyle(() => ({
    transform: [
      { rotateY: `${leanAngle.value}deg` },
      { skewX: `${-leanAngle.value * 0.3}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.riderContainer, bikeStyle]}>
      {/* Bike body base SVG */}
      <Svg width="46" height="46" viewBox="0 0 64 64" fill="none">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" rx="50%" ry="50%">
            <Stop offset="0%" stopColor={Colors.primary} stopOpacity="0.4" />
            <Stop offset="100%" stopColor={Colors.primary} stopOpacity="0" />
          </RadialGradient>
        </Defs>

        {/* Glow */}
        <Circle cx="32" cy="32" r="30" fill="url(#glow)" />
        <Ellipse cx="32" cy="54" rx="20" ry="4" fill="rgba(0,0,0,0.15)" />

        {/* Bike Frame */}
        <Path d="M16 48 L48 48 L44 32 L20 32 Z" fill="#2E3B52" stroke="#1A2238" strokeWidth="2.5" />

        {/* Cargo Box */}
        <Rect x="14" y="16" width="18" height="18" rx="3" fill={Colors.primary} stroke="#D45014" strokeWidth="2" />
        <Path d="M18 22 L22 26 L28 20" stroke="#FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Driver */}
        <Circle cx="40" cy="20" r="6" fill="#FAD02C" />
        <Path d="M38 26 L46 38 L34 46" stroke="#222" strokeWidth="3.5" strokeLinecap="round" />
      </Svg>

      {/* Back wheel overlay */}
      <Animated.View style={[styles.wheelPosBack, wheelStyle]}>
        <WheelComponent />
      </Animated.View>

      {/* Front wheel overlay */}
      <Animated.View style={[styles.wheelPosFront, wheelStyle]}>
        <WheelComponent />
      </Animated.View>
    </Animated.View>
  );
}

interface TimelineStep {
  id: string;
  label: string;
  sublabel: string;
  Icon: any;
  done: boolean;
  active: boolean;
}

const getTimeline = (status: string): TimelineStep[] => [
  { id: 'placed', label: 'Order Placed', sublabel: 'Your order is confirmed', Icon: CheckCircle, done: true, active: status === 'pending' },
  { id: 'preparing', label: 'Being Prepared', sublabel: 'Store is packing your items', Icon: Package, done: ['preparing', 'packed', 'picked_up', 'out_for_delivery', 'delivered'].includes(status), active: status === 'preparing' },
  { id: 'picked', label: 'Picked Up', sublabel: 'Rider collected your order', Icon: Bike, done: ['picked_up', 'out_for_delivery', 'delivered'].includes(status), active: status === 'picked_up' },
  { id: 'delivery', label: 'Out for Delivery', sublabel: 'Rider is heading to you', Icon: Navigation, done: status === 'delivered', active: status === 'out_for_delivery' },
  { id: 'delivered', label: 'Delivered', sublabel: 'Enjoy your order!', Icon: CheckCircle, done: status === 'delivered', active: false },
];

const STATUS_COPY: Record<string, { title: string; subtitle: string }> = {
  pending: { title: 'Order Placed', subtitle: 'Waiting for store confirmation' },
  confirmed: { title: 'Confirmed', subtitle: 'Store accepted your order' },
  preparing: { title: 'Being Prepared', subtitle: 'Store is packing your items' },
  packed: { title: 'Packed', subtitle: 'Your order is ready for pickup' },
  picked_up: { title: 'Picked Up', subtitle: 'Rider collected your order' },
  out_for_delivery: { title: 'Out for Delivery', subtitle: 'Your order is on the way!' },
  delivered: { title: 'Delivered', subtitle: 'Order delivered successfully' },
  cancelled: { title: 'Cancelled', subtitle: 'This order was cancelled' },
};

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useAppSelector(s => s.orders.items.find(item => item.id === id));
  
  // Real GPS and Socket telemetry updates
  const tracking = useOrderTracking(id ?? null);
  const liveLocation = useAppSelector(s => id ? s.orders.riderLocations[id] : undefined);
  
  // Location History for Motion Trails
  const [trail, setTrail] = useState<{ lat: number; lng: number }[]>([]);

  // Constant anchors
  const storeLat = 25.7782;
  const storeLng = 84.7352;
  const customerLat = 25.7740;
  const customerLng = 84.7374;

  // Reanimated Shared Values
  const animatedLat = useSharedValue(storeLat);
  const animatedLng = useSharedValue(storeLng);
  const animatedHeading = useSharedValue(0);
  const leanAngle = useSharedValue(0);
  const wheelRotation = useSharedValue(0);

  // Accumulate trail coordinates
  useEffect(() => {
    if (tracking.riderLocation) {
      const { lat, lng } = tracking.riderLocation;
      setTrail(prev => {
        const next = [...prev, { lat, lng }];
        if (next.length > 5) next.shift(); // Keep only last 5 trail points
        return next;
      });
    }
  }, [tracking.riderLocation]);

  // Compute turns and lean tilts when new GPS logs arrive
  useEffect(() => {
    if (tracking.riderLocation) {
      const { lat, lng, heading } = tracking.riderLocation;

      animatedLat.value = withTiming(lat, { duration: 4500, easing: Easing.linear });
      animatedLng.value = withTiming(lng, { duration: 4500, easing: Easing.linear });

      if (heading !== undefined) {
        const diff = heading - animatedHeading.value;
        const lean = Math.max(-15, Math.min(15, diff * 1.5));
        leanAngle.value = withTiming(lean, { duration: 400 });
        animatedHeading.value = withTiming(heading, { duration: 600 });
        
        setTimeout(() => {
          leanAngle.value = withTiming(0, { duration: 600 });
        }, 1200);
      }

      wheelRotation.value = withRepeat(
        withTiming(360, { duration: 1200, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      wheelRotation.value = withTiming(0);
      leanAngle.value = withTiming(0);
    }
  }, [tracking.riderLocation]);

  const currentStatus = tracking.orderStatus ?? order?.status ?? 'out_for_delivery';
  const statusCopy = STATUS_COPY[currentStatus] ?? STATUS_COPY.out_for_delivery;
  const timeline = getTimeline(currentStatus);
  const eta = tracking.eta ?? order?.estimatedMinutes ?? 12;

  const rider = {
    name: order?.riderName ?? 'sonu kumar ray',
    phone: order?.riderPhone ?? '+91 98765 43210',
    rating: order?.riderRating ?? 4.9,
    vehicle: 'BR 04 AB 1234',
    battery: (liveLocation as any)?.battery ?? 92,
    networkStatus: (liveLocation as any)?.networkStatus ?? 'Excellent',
    speed: (liveLocation as any)?.speed ?? 0,
  };

  const animatedRiderStyle = useAnimatedStyle(() => {
    const leftPercent = ((animatedLng.value - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
    const topPercent = 100 - ((animatedLat.value - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
    
    return {
      left: `${leftPercent}%`,
      top: `${topPercent}%`,
      transform: [
        { rotate: `${animatedHeading.value}deg` },
      ],
    };
  });

  const handleCallRider = () => {
    Linking.openURL(`tel:${rider.phone}`).catch(() => alert('Calling is not supported on this device.'));
  };

  const storePercent = getPercentageCoords(storeLat, storeLng);
  const customerPercent = getPercentageCoords(customerLat, customerLng);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Live Tracking</Text>
          <Text style={styles.headerSub}>Order #{order?.orderNumber ?? id ?? 'CB-2024-0042'}</Text>
        </View>
        <TouchableOpacity style={styles.helpBtn} onPress={handleCallRider} activeOpacity={0.8}>
          <Phone size={18} color={Colors.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Map Viewport */}
        <View style={styles.mapContainer}>
          {MapView ? (
            <MapView
              style={{ flex: 1 }}
              initialRegion={{
                latitude: (storeLat + customerLat) / 2,
                longitude: (storeLng + customerLng) / 2,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }}
            >
              <Marker coordinate={{ latitude: storeLat, longitude: storeLng }} title="Store">
                <View style={[styles.markerIcon, { backgroundColor: Colors.primary }]}>
                  <Store size={14} color={Colors.white} strokeWidth={2} />
                </View>
              </Marker>

              <Marker coordinate={{ latitude: customerLat, longitude: customerLng }} title="Delivery Destination">
                <View style={[styles.markerIcon, { backgroundColor: Colors.success }]}>
                  <MapPin size={14} color={Colors.white} strokeWidth={2.5} />
                </View>
              </Marker>

              <Marker
                coordinate={{
                  latitude: tracking.riderLocation?.lat ?? storeLat,
                  longitude: tracking.riderLocation?.lng ?? storeLng,
                }}
                rotation={tracking.riderLocation?.heading ?? 0}
                flat
                title={rider.name}
              >
                <RiderSvgContainer wheelRotation={wheelRotation} leanAngle={leanAngle} />
              </Marker>
            </MapView>
          ) : (
            // Projected Canvas viewport (Expo Web/Fallback)
            <LinearGradient colors={['#E8F4FD', '#D1E8F5']} style={styles.mapPlaceholder}>
              {[...Array(6)].map((_, i) => (
                <View key={`h${i}`} style={[styles.gridLine, { top: `${i * 20}%` }]} />
              ))}
              {[...Array(6)].map((_, i) => (
                <View key={`v${i}`} style={[styles.gridLineV, { left: `${i * 20}%` }]} />
              ))}

              {/* Motion Trail Circles */}
              {trail.map((pt, idx) => {
                const ptPos = getPercentageCoords(pt.lat, pt.lng);
                return (
                  <View
                    key={`tr-${idx}`}
                    style={[
                      styles.trailDot,
                      {
                        top: ptPos.top,
                        left: ptPos.left,
                        opacity: (idx + 1) / 6,
                        transform: [{ translateX: -4 }, { translateY: -4 }],
                      } as any,
                    ]}
                  />
                );
              })}

              {/* Store Marker */}
              <View style={[styles.marker, { top: storePercent.top, left: storePercent.left, transform: [{ translateX: -16 }, { translateY: -16 }] } as any]}>
                <View style={[styles.markerIcon, { backgroundColor: Colors.primary }]}>
                  <Store size={14} color={Colors.white} strokeWidth={2} />
                </View>
                <Text style={markerStyles.markerLabel}>Store</Text>
              </View>

              {/* Reanimated Skew & Tilt Lean Rider SVG */}
              <Animated.View style={[styles.animatedRider, animatedRiderStyle]}>
                <RiderSvgContainer wheelRotation={wheelRotation} leanAngle={leanAngle} />
              </Animated.View>

              {/* Customer Marker */}
              <View style={[styles.marker, { top: customerPercent.top, left: customerPercent.left, transform: [{ translateX: -16 }, { translateY: -16 }] } as any]}>
                <View style={[styles.markerIcon, { backgroundColor: Colors.success }]}>
                  <MapPin size={14} color={Colors.white} strokeWidth={2.5} />
                </View>
                <Text style={markerStyles.markerLabel}>You</Text>
              </View>
            </LinearGradient>
          )}

          {/* ETA Chip overlay */}
          <View style={styles.etaChip}>
            <Clock size={13} color={Colors.white} strokeWidth={2.5} />
            <Text style={styles.etaChipText}>~{eta} min{eta !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Telemetry Detail Widgets */}
        <View style={styles.telemetrySection}>
          <View style={styles.telemetryCard}>
            <Battery size={16} color={Colors.textPrimary} />
            <Text style={styles.telemetryVal}>{rider.battery}%</Text>
            <Text style={styles.telemetryLbl}>Rider Battery</Text>
          </View>
          <View style={styles.telemetryCard}>
            <Navigation size={16} color={Colors.textPrimary} />
            <Text style={styles.telemetryVal}>{rider.speed} km/h</Text>
            <Text style={styles.telemetryLbl}>Current Speed</Text>
          </View>
          <View style={styles.telemetryCard}>
            <Clock size={16} color={Colors.textPrimary} />
            <Text style={styles.telemetryVal}>{rider.networkStatus}</Text>
            <Text style={styles.telemetryLbl}>Connection</Text>
          </View>
        </View>

        {/* Status Card */}
        <View style={[styles.statusCard, Shadows.md]}>
          <LinearGradient colors={[Colors.primary + '10', Colors.primary + '05']} style={styles.statusGradient}>
            <View style={styles.statusTop}>
              <View style={styles.statusIconWrap}>
                <Bike size={22} color={Colors.primary} strokeWidth={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.statusTitle}>{statusCopy.title}</Text>
                <Text style={styles.statusSub}>{statusCopy.subtitle}</Text>
              </View>
              <View style={styles.etaBadge}>
                <Text style={styles.etaBadgeValue}>{eta}</Text>
                <Text style={styles.etaBadgeUnit}>min</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Rider Profile Card */}
          <View style={styles.riderRow}>
            <View style={styles.riderAvatar}>
              <User size={20} color={Colors.white} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.riderName}>{rider.name}</Text>
              <Text style={styles.riderVehicle}>{rider.vehicle}</Text>
            </View>
            <View style={styles.riderActions}>
              <TouchableOpacity style={styles.riderActionBtn} onPress={handleCallRider} activeOpacity={0.85}>
                <Phone size={16} color={Colors.primary} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.riderActionBtn} activeOpacity={0.85}>
                <MessageCircle size={16} color={Colors.primary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          <View style={[styles.timelineCard, Shadows.sm]}>
            {timeline.map((step, i) => (
              <View key={step.id} style={styles.timelineStep}>
                {i < timeline.length - 1 && (
                  <View style={[styles.timelineLine, step.done && styles.timelineLineDone]} />
                )}
                <View style={[
                  styles.timelineIconWrap,
                  step.done && styles.timelineIconDone,
                  step.active && styles.timelineIconActive,
                ]}>
                  <step.Icon
                    size={15}
                    color={step.done || step.active ? Colors.white : Colors.textMuted}
                    strokeWidth={2.5}
                  />
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineLabel, (step.done || step.active) && styles.timelineLabelActive]}>
                    {step.label}
                  </Text>
                  <Text style={styles.timelineSub}>{step.sublabel}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {['pending', 'confirmed'].includes(currentStatus) && (
          <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.85}>
            <X size={16} color={Colors.error} strokeWidth={2.5} />
            <Text style={styles.cancelText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const markerStyles = StyleSheet.create({
  markerLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: 10, color: Colors.textPrimary, backgroundColor: Colors.white, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, ...Shadows.sm },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.lg, paddingVertical: 12,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 17, color: Colors.textPrimary },
  headerSub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted },
  helpBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },

  // Map
  mapContainer: { position: 'relative', height: 260, marginHorizontal: Spacing.lg, borderRadius: Radius.xxl, overflow: 'hidden', ...Shadows.md },
  mapPlaceholder: { flex: 1, position: 'relative' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,120,200,0.06)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(0,120,200,0.06)' },

  // Rider Component layout
  riderContainer: { width: 46, height: 46, position: 'relative' },
  wheelPosBack: { position: 'absolute', left: 14.375 - 5.75, top: 34.5 - 5.75, width: 11.5, height: 11.5 },
  wheelPosFront: { position: 'absolute', left: 31.625 - 5.75, top: 34.5 - 5.75, width: 11.5, height: 11.5 },

  // Markers
  marker: { position: 'absolute', alignItems: 'center', gap: 4 },
  animatedRider: { position: 'absolute', width: 46, height: 46, marginLeft: -23, marginTop: -23, alignItems: 'center', justifyContent: 'center' },
  markerIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },

  // Trail
  trailDot: { position: 'absolute', width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.primary },

  // ETA Chip
  etaChip: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, ...Shadows.sm },
  etaChipText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.white },

  // Telemetry widgets
  telemetrySection: { flexDirection: 'row', gap: 10, marginHorizontal: Spacing.lg, marginTop: 16 },
  telemetryCard: { flex: 1, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight, ...Shadows.sm },
  telemetryVal: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.textPrimary, marginTop: 4 },
  telemetryLbl: { fontFamily: 'BeVietnamPro-Medium', fontSize: 10, color: Colors.textMuted, marginTop: 1 },

  // Status Card
  statusCard: { marginHorizontal: Spacing.lg, marginTop: 16, backgroundColor: Colors.white, borderRadius: Radius.xxl, overflow: 'hidden' },
  statusGradient: { padding: 16 },
  statusTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusIconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  statusTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 17, color: Colors.textPrimary },
  statusSub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 13, color: Colors.textMuted },
  etaBadge: { alignItems: 'center', backgroundColor: Colors.primary, borderRadius: Radius.xl, paddingHorizontal: 14, paddingVertical: 8 },
  etaBadgeValue: { fontFamily: 'BeVietnamPro-Bold', fontSize: 22, color: Colors.white, lineHeight: 26 },
  etaBadgeUnit: { fontFamily: 'BeVietnamPro-Regular', fontSize: 11, color: 'rgba(255,255,255,0.8)' },

  // Rider Row
  riderRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderTopWidth: 1, borderTopColor: Colors.borderLight },
  riderAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  riderName: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.textPrimary },
  riderVehicle: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted },
  riderActions: { flexDirection: 'row', gap: 8 },
  riderActionBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },

  // Timeline
  section: { paddingHorizontal: Spacing.lg, marginTop: 20 },
  sectionTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary, marginBottom: 12 },
  timelineCard: { backgroundColor: Colors.white, borderRadius: Radius.xxl, padding: 20 },
  timelineStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 10, position: 'relative' },
  timelineLine: { position: 'absolute', left: 19, top: 40, width: 2, height: '100%', backgroundColor: Colors.borderLight },
  timelineLineDone: { backgroundColor: Colors.primary },
  timelineIconWrap: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.surfaceVariant, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  timelineIconDone: { backgroundColor: Colors.success },
  timelineIconActive: { backgroundColor: Colors.primary },
  timelineContent: { flex: 1, paddingTop: 2 },
  timelineLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.textMuted },
  timelineLabelActive: { color: Colors.textPrimary },
  timelineSub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted, marginTop: 1 },

  // Cancel
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: Spacing.lg, marginTop: 20, paddingVertical: 14, borderRadius: Radius.xxl, borderWidth: 1.5, borderColor: Colors.error + '50', backgroundColor: Colors.errorContainer },
  cancelText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 15, color: Colors.error },
});
