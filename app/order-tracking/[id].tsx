import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { MOCK_ORDERS } from '../../src/data/mockData';

const { width, height } = Dimensions.get('window');

// Mock timeline steps for the active order
const TIMELINE = [
  { time: '10:02 AM', label: 'Order Placed', done: true },
  { time: '10:05 AM', label: 'Order Confirmed', done: true },
  { time: '10:08 AM', label: 'Preparing your order', done: true },
  { time: '10:20 AM', label: 'Out for Delivery', done: true },
  { time: 'Arriving', label: 'Delivered', done: false },
];

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = MOCK_ORDERS.find(o => o.id === id);

  const [eta, setEta] = useState(order?.estimatedMinutes ?? 15);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const bikeAnim = useRef(new Animated.Value(0)).current;

  // Pulse animation for the rider dot
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.4, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Bike moving animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(bikeAnim, { toValue: 1, duration: 3000, useNativeDriver: true }),
        Animated.timing(bikeAnim, { toValue: 0, duration: 3000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setEta(prev => (prev > 1 ? prev - 1 : prev));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!order) {
    return (
      <View style={styles.root}>
        <View style={styles.notFound}>
          <Text style={styles.nfEmoji}>😕</Text>
          <Text style={styles.nfTitle}>Order not found</Text>
          <TouchableOpacity style={styles.nfBtn} onPress={() => router.back()}>
            <Text style={styles.nfBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const bikeX = bikeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, width - 100],
  });

  return (
    <View style={styles.root}>
      <StatusBar style="light" />

      {/* Map Placeholder with Gradient */}
      <LinearGradient
        colors={['#1a3c5e', '#2d6a9f', '#4a9fd4']}
        style={styles.mapArea}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Grid Lines (fake map) */}
        {[0.2, 0.4, 0.6, 0.8].map(yFrac => (
          <View key={yFrac} style={[styles.gridLineH, { top: height * 0.42 * yFrac }]} />
        ))}
        {[0.15, 0.35, 0.55, 0.75].map(xFrac => (
          <View key={xFrac} style={[styles.gridLineV, { left: width * xFrac }]} />
        ))}

        {/* Road Lines */}
        <View style={styles.road} />

        {/* Store pin */}
        <View style={[styles.mapPin, { left: 40, top: height * 0.12 }]}>
          <View style={styles.storePin}>
            <Text style={styles.pinEmoji}>🏪</Text>
          </View>
          <View style={styles.pinShadow} />
        </View>

        {/* Rider (animated) */}
        <Animated.View style={[styles.riderPin, { transform: [{ translateX: bikeX }], top: height * 0.22 }]}>
          <Animated.View style={[styles.riderPulse, { transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.riderDot}>
            <Text style={styles.riderEmoji}>🛵</Text>
          </View>
        </Animated.View>

        {/* Destination pin */}
        <View style={[styles.mapPin, { right: 40, top: height * 0.30 }]}>
          <View style={styles.destPin}>
            <Text style={styles.pinEmoji}>🏠</Text>
          </View>
          <View style={styles.pinShadow} />
        </View>

        {/* Back button */}
        <SafeAreaView style={styles.mapHeader} edges={['top']}>
          <TouchableOpacity style={styles.mapBackBtn} onPress={() => router.back()}>
            <Text style={styles.mapBackIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.mapTitleBox}>
            <Text style={styles.mapTitle}>Live Tracking</Text>
          </View>
          <TouchableOpacity
            style={styles.mapDetailBtn}
            onPress={() => router.push(`/order/${order.id}`)}
          >
            <Text style={styles.mapDetailText}>Details</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>

        {/* ETA Banner */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={styles.etaBanner}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        >
          <View style={styles.etaLeft}>
            <Text style={styles.etaEmoji}>⚡</Text>
            <View>
              <Text style={styles.etaLabel}>Estimated Arrival</Text>
              <Text style={styles.etaTime}>{eta} minutes</Text>
            </View>
          </View>
          <View style={styles.etaRight}>
            <Text style={styles.etaStatus}>🛵 On the way</Text>
          </View>
        </LinearGradient>

        {/* Rider Info */}
        {order.riderName && (
          <View style={styles.riderCard}>
            <View style={styles.riderAvatar}>
              <Text style={styles.riderAvatarText}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.riderName}>{order.riderName}</Text>
              {order.riderRating && (
                <Text style={styles.riderRating}>⭐ {order.riderRating} · Delivery Partner</Text>
              )}
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={styles.callIcon}>📞</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.msgBtn}>
              <Text style={styles.msgIcon}>💬</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Order # and OTP */}
        <View style={styles.orderMeta}>
          <View style={styles.orderNumBlock}>
            <Text style={styles.metaLabel}>Order</Text>
            <Text style={styles.metaValue}>#{order.orderNumber}</Text>
          </View>
          {order.deliveryOtp && (
            <View style={styles.otpBlock}>
              <Text style={styles.metaLabel}>Delivery OTP</Text>
              <Text style={styles.otpValue}>{order.deliveryOtp}</Text>
            </View>
          )}
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          {TIMELINE.map((step, i) => (
            <View key={i} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, step.done && styles.timelineDotDone]} />
                {i < TIMELINE.length - 1 && (
                  <View style={[styles.timelineLine, step.done && styles.timelineLineDone]} />
                )}
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineLabel, step.done && styles.timelineLabelDone]}>
                  {step.label}
                </Text>
                <Text style={styles.timelineTime}>{step.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  nfEmoji: { fontSize: 48 },
  nfTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.textPrimary },
  nfBtn: { backgroundColor: Colors.primary, borderRadius: Radius.button, paddingHorizontal: 24, paddingVertical: 12 },
  nfBtnText: { fontFamily: 'BeVietnamPro-Bold', color: Colors.white, fontSize: 15 },

  // Map Area
  mapArea: { height: height * 0.42, position: 'relative', overflow: 'hidden' },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.07)' },
  road: {
    position: 'absolute',
    top: height * 0.30, left: 30, right: 30, height: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 6,
  },
  mapHeader: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 8, gap: 12,
  },
  mapBackBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  mapBackIcon: { fontSize: 20, color: Colors.white },
  mapTitleBox: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 6,
    alignItems: 'center',
  },
  mapTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.white },
  mapDetailBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 8,
  },
  mapDetailText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.white },

  mapPin: { position: 'absolute', alignItems: 'center' },
  storePin: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center',
    ...Shadows.md,
  },
  destPin: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    ...Shadows.md,
  },
  pinShadow: { width: 12, height: 6, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.2)', marginTop: 2 },
  pinEmoji: { fontSize: 22 },

  riderPin: { position: 'absolute', alignItems: 'center' },
  riderPulse: {
    position: 'absolute', width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(34, 197, 94, 0.25)',
  },
  riderDot: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.success, alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.white,
    ...Shadows.md,
  },
  riderEmoji: { fontSize: 20 },

  // Bottom Sheet
  bottomSheet: {
    flex: 1, backgroundColor: Colors.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    marginTop: -20, paddingHorizontal: Spacing.lg, paddingTop: 20,
    overflow: 'hidden',
  },

  etaBanner: {
    borderRadius: Radius.xxl, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 16,
  },
  etaLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  etaEmoji: { fontSize: 30 },
  etaLabel: { ...TextStyles.micro, color: 'rgba(255,255,255,0.7)' },
  etaTime: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 24, color: Colors.white },
  etaRight: {},
  etaStatus: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: 'rgba(255,255,255,0.9)' },

  riderCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.surfaceVariant, borderRadius: Radius.xxl,
    padding: 14, marginBottom: 16,
  },
  riderAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  riderAvatarText: { fontSize: 26 },
  riderName: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary },
  riderRating: { ...TextStyles.bodySm, color: Colors.textMuted },
  callBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.successContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  callIcon: { fontSize: 20 },
  msgBtn: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  msgIcon: { fontSize: 20 },

  orderMeta: {
    flexDirection: 'row', gap: 12, marginBottom: 20,
  },
  orderNumBlock: {
    flex: 1, backgroundColor: Colors.surfaceVariant,
    borderRadius: Radius.xl, padding: 12,
  },
  otpBlock: {
    flex: 1, backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.xl, padding: 12,
  },
  metaLabel: { ...TextStyles.micro, color: Colors.textMuted, marginBottom: 4 },
  metaValue: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.textPrimary },
  otpValue: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 22, color: Colors.primaryDark, letterSpacing: 6 },

  timeline: { gap: 0 },
  timelineRow: { flexDirection: 'row', gap: 14 },
  timelineLeft: { alignItems: 'center', width: 20 },
  timelineDot: {
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: Colors.borderLight,
    borderWidth: 2, borderColor: Colors.border,
  },
  timelineDotDone: { backgroundColor: Colors.success, borderColor: Colors.successDark },
  timelineLine: { width: 2, flex: 1, backgroundColor: Colors.borderLight, minHeight: 20, marginVertical: 2 },
  timelineLineDone: { backgroundColor: Colors.success },
  timelineContent: { flex: 1, paddingBottom: 16 },
  timelineLabel: { ...TextStyles.bodySm, color: Colors.textMuted },
  timelineLabelDone: { color: Colors.textSecondary, fontFamily: 'BeVietnamPro-SemiBold' },
  timelineTime: { ...TextStyles.micro, color: Colors.textMuted, marginTop: 2 },
});
