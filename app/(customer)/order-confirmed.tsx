import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing } from '../../src/theme';
import { Button } from '../../src/components/ui/Button';
import { useAppSelector } from '../../src/hooks/useAppDispatch';
import {
  CheckCircle, Package, Bike, Navigation,
  Home, ShoppingBag, PartyPopper,
} from '../../src/components/ui/Icon';

const { width } = Dimensions.get('window');

// ─── Timeline data ────────────────────────────────────────────────────────────
const TIMELINE = [
  { Icon: CheckCircle, label: 'Order Confirmed',   sublabel: 'Just now',    done: true  },
  { Icon: Package,     label: 'Rider Assigned',    sublabel: '~5 min',      done: false },
  { Icon: Bike,        label: 'Out for Delivery',  sublabel: '~15 min',     done: false },
  { Icon: Navigation,  label: 'Delivered',         sublabel: '~28 min',     done: false },
];

// ─── Confetti dots (decorative) ───────────────────────────────────────────────
const CONFETTI_COLORS = ['#FF6B00', '#FFE500', '#00CC66', '#4DA6FF', '#FF4D6D', '#A855F7'];
function ConfettiDot({ index }: { index: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1, duration: 1200 + index * 80,
      delay: index * 100, useNativeDriver: true,
    }).start();
  }, []);
  const x = ((index * 73) % width) - width / 2;
  const size = 6 + (index % 3) * 4;
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 500] });

  return (
    <Animated.View style={{
      position: 'absolute', top: 0,
      left: '50%', marginLeft: x, width: size, height: size,
      borderRadius: size / 2, backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
      opacity: anim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [1, 1, 0] }),
      transform: [{ translateY }],
    }} />
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function OrderConfirmedScreen() {
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const order = useAppSelector(s =>
    orderId ? s.orders.items.find(item => item.id === orderId) : s.orders.items[0]
  );
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pop-in then content slides up
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1, useNativeDriver: true, tension: 55, friction: 6,
      }),
      Animated.parallel([
        Animated.timing(opacityAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(slideY, { toValue: 0, duration: 450, useNativeDriver: true }),
      ]),
    ]).start();

    // Pulse on check icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#004D1F', '#006E2F', '#00A842']}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Confetti */}
      {Array.from({ length: 18 }).map((_, i) => <ConfettiDot key={i} index={i} />)}

      <View style={styles.content}>

        {/* Animated Check Circle */}
        <Animated.View style={[styles.checkRingOuter, { transform: [{ scale: scaleAnim }, { scale: pulseAnim }] }]}>
          <View style={styles.checkRingInner}>
            <CheckCircle size={54} color={Colors.white} strokeWidth={1.5} fill="rgba(255,255,255,0.1)" />
          </View>
        </Animated.View>

        {/* Content */}
        <Animated.View style={[styles.textBlock, { opacity: opacityAnim, transform: [{ translateY: slideY }] }]}>

          <Text style={styles.title}>Order Placed Successfully</Text>
          <Text style={styles.orderNum}>Order #{order?.orderNumber ?? 'CB-2024-00157'}</Text>
          <Text style={styles.eta}>Express delivery in {order?.estimatedMinutes ?? 28} minutes</Text>

          {/* Timeline Card */}
          <View style={styles.timelineCard}>
            {TIMELINE.map((step, i) => (
              <View key={i}>
                <View style={styles.timelineRow}>
                  <View style={[styles.timelineDot, step.done && styles.timelineDotDone]}>
                    <step.Icon
                      size={12}
                      color={step.done ? Colors.white : 'rgba(255,255,255,0.4)'}
                      strokeWidth={2.5}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.timelineLabel, !step.done && styles.timelineLabelPending]}>
                      {step.label}
                    </Text>
                  </View>
                  <Text style={[styles.timelineTime, !step.done && styles.timelineTimePending]}>
                    {step.sublabel}
                  </Text>
                </View>
                {i < TIMELINE.length - 1 && (
                  <View style={[styles.timelineLine, step.done && styles.timelineLineDone]} />
                )}
              </View>
            ))}
          </View>

          {/* Actions */}
          <Button
            label="Track Your Order"
            onPress={() => order
              ? router.replace(`/order-tracking/${order.id}` as any)
              : router.replace('/(customer)/orders' as any)
            }
            style={styles.trackBtn}
            fullWidth
          />
          <TouchableOpacity
            style={styles.homeBtn}
            onPress={() => router.replace('/(customer)/' as any)}
            activeOpacity={0.8}
          >
            <Home size={14} color="rgba(255,255,255,0.8)" strokeWidth={2} />
            <Text style={styles.homeBtnText}>Back to Home</Text>
          </TouchableOpacity>

        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.success },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.lg },

  // Check animation
  checkRingOuter: {
    width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 28, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  checkRingInner: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },

  textBlock: { width: '100%', alignItems: 'center' },
  title: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 30, color: Colors.white, textAlign: 'center', marginBottom: 6 },
  orderNum: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.75)', textAlign: 'center', marginBottom: 6 },
  eta: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.white, textAlign: 'center', marginBottom: 24 },

  // Timeline
  timelineCard: {
    width: '100%', backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: Radius.xxl, padding: 20, marginBottom: 24,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  timelineDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  timelineDotDone: { backgroundColor: 'rgba(255,255,255,0.3)', borderColor: Colors.white },
  timelineLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.white },
  timelineLabelPending: { fontFamily: 'BeVietnamPro-SemiBold', color: 'rgba(255,255,255,0.55)' },
  timelineTime: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12, color: Colors.white },
  timelineTimePending: { color: 'rgba(255,255,255,0.45)', fontFamily: 'BeVietnamPro-Regular' },
  timelineLine: { width: 1.5, height: 16, backgroundColor: 'rgba(255,255,255,0.15)', marginLeft: 15, marginVertical: 3 },
  timelineLineDone: { backgroundColor: 'rgba(255,255,255,0.5)' },

  trackBtn: { marginBottom: 12 },
  homeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12 },
  homeBtnText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 15, color: 'rgba(255,255,255,0.8)' },
});
