import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { MOCK_ORDERS } from '../../src/data/mockData';
import { OrderStatus } from '../../src/types';

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  ready_for_pickup: 'Ready',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  returned: 'Returned',
};

const STATUS_EMOJI: Record<string, string> = {
  pending: '⏳', confirmed: '✅', preparing: '👨‍🍳',
  ready_for_pickup: '📦', out_for_delivery: '🛵',
  delivered: '🎉', cancelled: '❌', returned: '↩️',
};

const PAYMENT_LABELS: Record<string, string> = {
  upi: 'UPI', card: 'Card', cod: 'Cash on Delivery',
  wallet: 'Chapra Wallet', netbanking: 'Net Banking',
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const order = MOCK_ORDERS.find(o => o.id === id);

  if (!order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundEmoji}>😕</Text>
          <Text style={styles.notFoundTitle}>Order not found</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isActive = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(order.status);
  const isCancelled = order.status === 'cancelled';
  const currentStep = STATUS_STEPS.indexOf(
    order.status === 'ready_for_pickup' ? 'out_for_delivery' : order.status as OrderStatus
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn2} onPress={() => router.back()}>
          <Text style={styles.backBtnIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>#{order.orderNumber}</Text>
          <Text style={styles.headerSub}>
            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: '#E8F5E9' }]}>
          <Text style={styles.statusEmoji}>{STATUS_EMOJI[order.status]}</Text>
          <Text style={styles.statusText}>{STATUS_LABELS[order.status]}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Track CTA for active orders */}
        {isActive && (
          <TouchableOpacity
            style={styles.trackCta}
            onPress={() => router.push(`/order-tracking/${order.id}`)}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={styles.trackGradient}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Text style={styles.trackCtaText}>📍 Track Live Order</Text>
              {order.estimatedMinutes && (
                <View style={styles.etaBubble}>
                  <Text style={styles.etaBubbleText}>~{order.estimatedMinutes} min</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Progress Tracker */}
        {!isCancelled && (
          <View style={[styles.card, Shadows.sm]}>
            <Text style={styles.cardTitle}>Order Progress</Text>
            <View style={styles.progressTracker}>
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <View key={step} style={styles.stepRow}>
                    <View style={styles.stepLeft}>
                      <View style={[
                        styles.stepCircle,
                        done && styles.stepCircleDone,
                        active && styles.stepCircleActive,
                      ]}>
                        <Text style={styles.stepCircleText}>
                          {done ? (active ? STATUS_EMOJI[step] : '✓') : '○'}
                        </Text>
                      </View>
                      {i < STATUS_STEPS.length - 1 && (
                        <View style={[styles.stepLine, done && styles.stepLineDone]} />
                      )}
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={[styles.stepLabel, done && styles.stepLabelDone, active && styles.stepLabelActive]}>
                        {STATUS_LABELS[step]}
                      </Text>
                      {active && order.estimatedMinutes && step === 'out_for_delivery' && (
                        <Text style={styles.stepSub}>Est. {order.estimatedMinutes} mins away</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Rider Info */}
        {order.riderName && isActive && (
          <View style={[styles.card, Shadows.sm]}>
            <Text style={styles.cardTitle}>Your Rider</Text>
            <View style={styles.riderRow}>
              <View style={styles.riderAvatar}>
                <Text style={styles.riderAvatarText}>🛵</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.riderName}>{order.riderName}</Text>
                {order.riderRating && (
                  <Text style={styles.riderRating}>⭐ {order.riderRating} rating</Text>
                )}
              </View>
              {order.riderPhone && (
                <View style={styles.callBtn}>
                  <Text style={styles.callBtnText}>📞 Call</Text>
                </View>
              )}
            </View>
            {order.deliveryOtp && (
              <View style={styles.otpBanner}>
                <Text style={styles.otpLabel}>Delivery OTP</Text>
                <Text style={styles.otpCode}>{order.deliveryOtp}</Text>
              </View>
            )}
          </View>
        )}

        {/* Items */}
        <View style={[styles.card, Shadows.sm]}>
          <Text style={styles.cardTitle}>Order Items</Text>
          {order.items.map((item, i) => (
            <View key={item.id} style={[styles.itemRow, i < order.items.length - 1 && styles.itemBorder]}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, { backgroundColor: Colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' }]}>
                  <Text>📦</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemUnit}>{item.unit} × {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
        </View>

        {/* Delivery Address */}
        <View style={[styles.card, Shadows.sm]}>
          <Text style={styles.cardTitle}>Delivery Address</Text>
          <View style={styles.addressRow}>
            <Text style={styles.addressIcon}>📍</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.addressLabel}>{order.address.label}</Text>
              <Text style={styles.addressText}>{order.address.fullAddress}</Text>
              {order.address.landmark && (
                <Text style={styles.addressLandmark}>Near: {order.address.landmark}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={[styles.card, Shadows.sm]}>
          <Text style={styles.cardTitle}>Payment Summary</Text>
          {[
            { label: 'Subtotal', value: `₹${order.subtotal}` },
            { label: 'Delivery Fee', value: order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}` },
            { label: 'Platform Fee', value: `₹${order.platformFee}` },
            ...(order.couponDiscount > 0 ? [{ label: 'Coupon Discount', value: `-₹${order.couponDiscount}` }] : []),
          ].map(row => (
            <View key={row.label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{row.label}</Text>
              <Text style={[styles.summaryValue, row.label === 'Coupon Discount' && styles.summaryDiscount]}>
                {row.value}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>₹{order.total}</Text>
          </View>
          <View style={styles.paymentMethodRow}>
            <Text style={styles.paymentIcon}>💳</Text>
            <Text style={styles.paymentMethod}>
              {PAYMENT_LABELS[order.paymentMethod]} · {order.paymentStatus === 'success' ? '✅ Paid' : order.paymentStatus === 'pending' ? '⏳ Pending' : '❌ Failed'}
            </Text>
          </View>
        </View>

        {/* Actions */}
        {order.status === 'delivered' && (
          <TouchableOpacity style={styles.rateBtn}>
            <Text style={styles.rateBtnText}>⭐ Rate your experience</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundEmoji: { fontSize: 48 },
  notFoundTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.textPrimary },
  backBtn: { backgroundColor: Colors.primary, borderRadius: Radius.button, paddingHorizontal: 24, paddingVertical: 12 },
  backBtnText: { fontFamily: 'BeVietnamPro-Bold', color: Colors.white, fontSize: 15 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  backBtn2: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnIcon: { fontSize: 20, color: Colors.textPrimary },
  headerTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary },
  headerSub: { ...TextStyles.micro, color: Colors.textMuted, marginTop: 2 },
  statusChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full,
  },
  statusEmoji: { fontSize: 14 },
  statusText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 12, color: Colors.successDark },

  scroll: { padding: Spacing.md, gap: 12 },

  trackCta: { borderRadius: Radius.xxl, overflow: 'hidden', marginBottom: 0 },
  trackGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 18,
  },
  trackCtaText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.white },
  etaBubble: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radius.full,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  etaBubbleText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.white },

  card: {
    backgroundColor: Colors.white, borderRadius: Radius.xxl,
    padding: 16, gap: 16,
  },
  cardTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.textPrimary },

  progressTracker: { gap: 0 },
  stepRow: { flexDirection: 'row', gap: 14 },
  stepLeft: { alignItems: 'center', width: 32 },
  stepCircle: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.border,
  },
  stepCircleDone: { backgroundColor: Colors.successContainer, borderColor: Colors.success },
  stepCircleActive: { backgroundColor: Colors.primary, borderColor: Colors.primaryDark },
  stepCircleText: { fontSize: 14 },
  stepLine: { width: 2, flex: 1, backgroundColor: Colors.borderLight, minHeight: 24, marginVertical: 4 },
  stepLineDone: { backgroundColor: Colors.success },
  stepContent: { flex: 1, paddingBottom: 20 },
  stepLabel: { ...TextStyles.bodySm, color: Colors.textMuted },
  stepLabelDone: { color: Colors.textSecondary, fontFamily: 'BeVietnamPro-SemiBold' },
  stepLabelActive: { fontFamily: 'BeVietnamPro-Bold', color: Colors.primary, fontSize: 15 },
  stepSub: { ...TextStyles.micro, color: Colors.primary, marginTop: 2 },

  riderRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  riderAvatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  riderAvatarText: { fontSize: 28 },
  riderName: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary },
  riderRating: { ...TextStyles.bodySm, color: Colors.textMuted },
  callBtn: {
    backgroundColor: Colors.successContainer, borderRadius: Radius.button,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  callBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.successDark },
  otpBanner: {
    backgroundColor: Colors.primaryContainer, borderRadius: Radius.xl,
    padding: 14, alignItems: 'center',
  },
  otpLabel: { ...TextStyles.bodySm, color: Colors.primary },
  otpCode: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 32, color: Colors.primaryDark, letterSpacing: 8 },

  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  itemImage: { width: 56, height: 56, borderRadius: Radius.lg, overflow: 'hidden' },
  itemName: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.textPrimary, marginBottom: 2 },
  itemUnit: { ...TextStyles.bodySm, color: Colors.textMuted },
  itemPrice: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.textPrimary },

  addressRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  addressIcon: { fontSize: 24, marginTop: 2 },
  addressLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.primary, marginBottom: 4 },
  addressText: { ...TextStyles.bodySm, color: Colors.textSecondary, lineHeight: 20 },
  addressLandmark: { ...TextStyles.bodySm, color: Colors.textMuted, marginTop: 2 },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { ...TextStyles.bodyLg, color: Colors.textSecondary },
  summaryValue: { ...TextStyles.bodyLg, color: Colors.textSecondary },
  summaryDiscount: { color: Colors.success, fontFamily: 'BeVietnamPro-Bold' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderTopWidth: 1.5, borderTopColor: Colors.borderLight,
    paddingTop: 12, marginTop: 4,
  },
  totalLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary },
  totalValue: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 20, color: Colors.primary },
  paymentMethodRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  paymentIcon: { fontSize: 18 },
  paymentMethod: { ...TextStyles.bodySm, color: Colors.textSecondary },

  rateBtn: {
    backgroundColor: Colors.white, borderRadius: Radius.xxl,
    paddingVertical: 18, alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.primaryLighter,
    ...Shadows.sm,
  },
  rateBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.primary },
});
