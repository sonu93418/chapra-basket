import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { useAppSelector } from '../../src/hooks/useAppDispatch';
import { useOrderTracking } from '../../src/hooks/useSocket';
import {
  ArrowLeft, Phone, MessageCircle, MapPin, Store,
  Bike, CheckCircle, Clock, Package, X,
  ChevronRight, Navigation, User,
} from '../../src/components/ui/Icon';
import { formatETA } from '../../src/utils/format';

const { width } = Dimensions.get('window');

// ─── Order Timeline Steps ─────────────────────────────────────────────────────
interface TimelineStep {
  id: string;
  label: string;
  sublabel: string;
  Icon: any;
  done: boolean;
  active: boolean;
  timestamp?: string;
}

const getTimeline = (status: string): TimelineStep[] => [
  {
    id: 'placed',
    label: 'Order Placed',
    sublabel: 'Your order is confirmed',
    Icon: CheckCircle,
    done: true,
    active: status === 'pending',
    timestamp: '2:34 PM',
  },
  {
    id: 'preparing',
    label: 'Being Prepared',
    sublabel: 'Store is packing your items',
    Icon: Package,
    done: ['preparing', 'packed', 'picked_up', 'out_for_delivery', 'delivered'].includes(status),
    active: status === 'preparing',
    timestamp: ['packed', 'picked_up', 'out_for_delivery', 'delivered'].includes(status) ? '2:38 PM' : undefined,
  },
  {
    id: 'picked',
    label: 'Picked Up',
    sublabel: 'Rider collected your order',
    Icon: Bike,
    done: ['picked_up', 'out_for_delivery', 'delivered'].includes(status),
    active: status === 'picked_up',
    timestamp: ['out_for_delivery', 'delivered'].includes(status) ? '2:44 PM' : undefined,
  },
  {
    id: 'delivery',
    label: 'Out for Delivery',
    sublabel: 'Rider is heading to you',
    Icon: Navigation,
    done: status === 'delivered',
    active: status === 'out_for_delivery',
    timestamp: status === 'delivered' ? '2:51 PM' : undefined,
  },
  {
    id: 'delivered',
    label: 'Delivered',
    sublabel: 'Enjoy your order!',
    Icon: CheckCircle,
    done: status === 'delivered',
    active: false,
    timestamp: status === 'delivered' ? '3:02 PM' : undefined,
  },
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

// ─── ETA Countdown ────────────────────────────────────────────────────────────
function useEtaTimer(initialMins: number) {
  const [mins, setMins] = useState(initialMins);
  useEffect(() => {
    if (mins <= 0) return;
    const t = setInterval(() => setMins(m => Math.max(0, m - 1)), 60000);
    return () => clearInterval(t);
  }, []);
  return mins;
}

// ─── Pulse animation ──────────────────────────────────────────────────────────
function PulseRing({ color }: { color: string }) {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.6, duration: 1000, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 1000, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.6, duration: 1000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);
  return (
    <Animated.View style={{ position: 'absolute', width: 52, height: 52, borderRadius: 26, backgroundColor: color, opacity, transform: [{ scale }] }} />
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = useAppSelector(s => s.orders.items.find(item => item.id === id));
  const tracking = useOrderTracking(id ?? null);
  const liveLocation = useAppSelector(s => id ? s.orders.riderLocations[id] : undefined);
  const eta = useEtaTimer(tracking.eta ?? liveLocation?.eta ?? order?.estimatedMinutes ?? 12);
  const currentStatus = tracking.orderStatus ?? order?.status ?? 'out_for_delivery';
  const statusCopy = STATUS_COPY[currentStatus] ?? STATUS_COPY.out_for_delivery;
  const timeline = getTimeline(currentStatus);

  const rider = {
    name: order?.riderName ?? 'Assigning rider',
    phone: order?.riderPhone ?? '+91 98765 43210',
    rating: order?.riderRating ?? 4.8,
    vehicle: 'BR 04 AB 1234',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Live Tracking</Text>
          <Text style={styles.headerSub}>Order #{order?.orderNumber ?? id ?? 'CB-2024-0042'}</Text>
        </View>
        <TouchableOpacity style={styles.helpBtn} activeOpacity={0.8}>
          <Phone size={18} color={Colors.primary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── Map Placeholder (Real: react-native-maps) ── */}
        <View style={styles.mapContainer}>
          <LinearGradient
            colors={['#E8F4FD', '#D1E8F5']}
            style={styles.mapPlaceholder}
          >
            {/* Map grid lines */}
            {[...Array(6)].map((_, i) => (
              <View key={`h${i}`} style={[styles.gridLine, { top: `${i * 20}%` as any }]} />
            ))}
            {[...Array(6)].map((_, i) => (
              <View key={`v${i}`} style={[styles.gridLineV, { left: `${i * 20}%` as any }]} />
            ))}

            {/* Store Marker */}
            <View style={[styles.marker, { top: '30%', left: '20%' }]}>
              <View style={[styles.markerIcon, { backgroundColor: Colors.primary }]}>
                <Store size={14} color={Colors.white} strokeWidth={2} />
              </View>
              <Text style={styles.markerLabel}>Store</Text>
            </View>

            {/* Rider Marker (animated pulse) */}
            <View style={[styles.marker, styles.riderMarker]}>
              <View style={{ position: 'relative', width: 52, height: 52, alignItems: 'center', justifyContent: 'center' }}>
                <PulseRing color={Colors.primary} />
                <View style={[styles.markerIcon, { backgroundColor: Colors.primary, width: 44, height: 44, borderRadius: 22 }]}>
                  <Bike size={18} color={Colors.white} strokeWidth={2} />
                </View>
              </View>
              <Text style={styles.markerLabel}>{rider.name}</Text>
            </View>

            {/* Customer Marker */}
            <View style={[styles.marker, { bottom: '20%', right: '18%' }]}>
              <View style={[styles.markerIcon, { backgroundColor: Colors.success }]}>
                <MapPin size={14} color={Colors.white} strokeWidth={2.5} />
              </View>
              <Text style={styles.markerLabel}>You</Text>
            </View>

            {/* Route line (simplified) */}
            <View style={styles.routeLine} />
          </LinearGradient>

          {/* ETA Chip overlay */}
          <View style={styles.etaChip}>
            <Clock size={13} color={Colors.white} strokeWidth={2.5} />
            <Text style={styles.etaChipText}>~{eta} min{eta !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* ── Status Card ── */}
        <View style={[styles.statusCard, Shadows.md]}>
          <LinearGradient
            colors={[Colors.primary + '10', Colors.primary + '05']}
            style={styles.statusGradient}
          >
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

          {/* Rider Info */}
          <View style={styles.riderRow}>
            <View style={styles.riderAvatar}>
              <User size={20} color={Colors.white} strokeWidth={1.8} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.riderName}>{rider.name}</Text>
              <Text style={styles.riderVehicle}>{rider.vehicle}</Text>
            </View>
            <View style={styles.riderActions}>
              <TouchableOpacity style={styles.riderActionBtn} activeOpacity={0.85}>
                <Phone size={16} color={Colors.primary} strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.riderActionBtn} activeOpacity={0.85}>
                <MessageCircle size={16} color={Colors.primary} strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Timeline ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Timeline</Text>
          <View style={[styles.timelineCard, Shadows.sm]}>
            {timeline.map((step, i) => (
              <View key={step.id} style={styles.timelineStep}>
                {/* Vertical line */}
                {i < timeline.length - 1 && (
                  <View style={[styles.timelineLine, step.done && styles.timelineLineDone]} />
                )}

                {/* Icon */}
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

                {/* Text */}
                <View style={styles.timelineContent}>
                  <Text style={[styles.timelineLabel, (step.done || step.active) && styles.timelineLabelActive]}>
                    {step.label}
                  </Text>
                  <Text style={styles.timelineSub}>{step.sublabel}</Text>
                </View>

                {/* Timestamp */}
                {step.timestamp && (
                  <Text style={styles.timelineTime}>{step.timestamp}</Text>
                )}
                {step.active && !step.timestamp && (
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>Now</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* ── Cancel Button (only for early stages) ── */}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
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
  mapContainer: { position: 'relative', height: 240, marginHorizontal: Spacing.lg, marginTop: 16, borderRadius: Radius.xxl, overflow: 'hidden', ...Shadows.md },
  mapPlaceholder: { flex: 1, position: 'relative' },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(0,120,200,0.08)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(0,120,200,0.08)' },
  routeLine: { position: 'absolute', top: '38%', left: '26%', width: '50%', height: 2, backgroundColor: Colors.primary, opacity: 0.5, borderRadius: 1 },

  // Markers
  marker: { position: 'absolute', alignItems: 'center', gap: 4 },
  riderMarker: { top: '45%', left: '45%', transform: [{ translateX: -22 }, { translateY: -22 }] },
  markerIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  markerLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: 10, color: Colors.textPrimary, backgroundColor: Colors.white, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },

  // ETA Chip
  etaChip: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 7, borderRadius: Radius.full, ...Shadows.sm },
  etaChipText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.white },

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
  timelineTime: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12, color: Colors.textMuted, paddingTop: 4 },
  activePill: { backgroundColor: Colors.primaryContainer, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start', marginTop: 4 },
  activePillText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 11, color: Colors.primary },

  // Cancel
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: Spacing.lg, marginTop: 20, paddingVertical: 14, borderRadius: Radius.xxl, borderWidth: 1.5, borderColor: Colors.error + '50', backgroundColor: Colors.errorContainer },
  cancelText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 15, color: Colors.error },
});
