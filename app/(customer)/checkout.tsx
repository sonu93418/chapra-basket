import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { Button } from '../../src/components/ui/Button';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppDispatch';
import { clearCart } from '../../src/features/cart/cartSlice';

const PAYMENT_METHODS = [
  { id: 'upi', label: 'UPI / Google Pay', emoji: '📱', desc: 'Pay via any UPI app' },
  { id: 'card', label: 'Credit / Debit Card', emoji: '💳', desc: 'Visa, Mastercard, RuPay' },
  { id: 'wallet', label: 'Chapra Basket Wallet', emoji: '👛', desc: 'Balance: ₹120' },
  { id: 'cod', label: 'Cash on Delivery', emoji: '💵', desc: 'Pay when delivered' },
];

const DELIVERY_SLOTS = [
  { id: 's1', label: 'Express (30 min)', emoji: '⚡', available: true },
  { id: 's2', label: 'In 1–2 Hours', emoji: '🕐', available: true },
  { id: 's3', label: 'Today Evening (6–9 PM)', emoji: '🌅', available: true },
  { id: 's4', label: 'Tomorrow Morning (9–11 AM)', emoji: '🌄', available: true },
];

export default function CheckoutScreen() {
  const dispatch = useAppDispatch();
  const { items, couponDiscount } = useAppSelector(s => s.cart);
  const [selectedPayment, setSelectedPayment] = useState('cod');
  const [selectedSlot, setSelectedSlot] = useState('s1');
  const [isLoading, setIsLoading] = useState(false);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const deliveryFee = subtotal >= 299 ? 0 : 25;
  const total = subtotal + deliveryFee + 5 - couponDiscount;

  const placeOrder = async () => {
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    dispatch(clearCart());
    setIsLoading(false);
    router.replace('/order-confirmed');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Delivery Address</Text>
          <TouchableOpacity style={[styles.card, Shadows.sm]}>
            <View style={styles.addressRow}>
              <View style={styles.addressIcon}><Text>🏠</Text></View>
              <View style={styles.addressInfo}>
                <Text style={styles.addressLabel}>Home</Text>
                <Text style={styles.addressFull}>Plot 12, Sadar Bazaar, near SBI Bank, Chapra — 841301</Text>
              </View>
              <Text style={styles.changeBtn}>Change</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Delivery Slot */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⏰ Delivery Time</Text>
          {DELIVERY_SLOTS.map(slot => (
            <TouchableOpacity
              key={slot.id}
              style={[styles.slotCard, selectedSlot === slot.id && styles.slotCardActive]}
              onPress={() => setSelectedSlot(slot.id)}
            >
              <View style={styles.slotRadio}>
                {selectedSlot === slot.id && <View style={styles.slotRadioInner} />}
              </View>
              <Text style={styles.slotEmoji}>{slot.emoji}</Text>
              <Text style={[styles.slotLabel, selectedSlot === slot.id && styles.slotLabelActive]}>{slot.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payment Method</Text>
          {PAYMENT_METHODS.map(pm => (
            <TouchableOpacity
              key={pm.id}
              style={[styles.paymentCard, selectedPayment === pm.id && styles.paymentCardActive]}
              onPress={() => setSelectedPayment(pm.id)}
            >
              <View style={styles.paymentRadio}>
                {selectedPayment === pm.id && <View style={styles.paymentRadioInner} />}
              </View>
              <Text style={styles.paymentEmoji}>{pm.emoji}</Text>
              <View style={styles.paymentInfo}>
                <Text style={[styles.paymentLabel, selectedPayment === pm.id && styles.paymentLabelActive]}>{pm.label}</Text>
                <Text style={styles.paymentDesc}>{pm.desc}</Text>
              </View>
              {pm.id === 'cod' && <View style={styles.popularBadge}><Text style={styles.popularText}>Popular</Text></View>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Order Summary */}
        <View style={[styles.card, Shadows.sm, { marginTop: 0 }]}>
          <Text style={styles.sectionTitle}>📋 Order Summary</Text>
          {[
            { label: 'Subtotal', value: `₹${subtotal}` },
            { label: 'Delivery Fee', value: deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}` },
            { label: 'Platform Fee', value: '₹5' },
            ...(couponDiscount > 0 ? [{ label: 'Coupon Discount', value: `-₹${couponDiscount}` }] : []),
          ].map((row, i) => (
            <View key={i} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{row.label}</Text>
              <Text style={[styles.summaryValue, row.value.startsWith('-') && styles.discount, row.value === 'FREE' && styles.free]}>{row.value}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Place Order CTA */}
      <View style={[styles.ctaContainer, Shadows.lg]}>
        <View>
          <Text style={styles.ctaItems}>{items.length} items</Text>
          <Text style={styles.ctaTotal}>₹{total}</Text>
        </View>
        <Button
          label={isLoading ? 'Placing Order...' : `Pay ₹${total} & Order`}
          onPress={placeOrder}
          isLoading={isLoading}
          style={{ flex: 1 }}
          size="lg"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: 14 },
  back: { fontSize: 22, color: Colors.primary, fontWeight: '700' },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.textPrimary },
  scroll: { paddingHorizontal: Spacing.lg, paddingBottom: 20 },

  section: { marginBottom: 20 },
  sectionTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary, marginBottom: 12 },

  card: { backgroundColor: Colors.white, borderRadius: Radius.xxl, padding: 16, marginBottom: 14 },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  addressIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  addressInfo: { flex: 1 },
  addressLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.textPrimary, marginBottom: 3 },
  addressFull: { ...TextStyles.bodySm, color: Colors.textSecondary, lineHeight: 20 },
  changeBtn: { ...TextStyles.bodySmSemiBold, color: Colors.primary },

  slotCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: Colors.borderLight },
  slotCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer },
  slotRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  slotRadioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  slotEmoji: { fontSize: 20 },
  slotLabel: { ...TextStyles.bodyLgSemiBold, color: Colors.textSecondary },
  slotLabelActive: { color: Colors.primary },

  paymentCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: Colors.borderLight },
  paymentCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer },
  paymentRadio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  paymentRadioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  paymentEmoji: { fontSize: 24 },
  paymentInfo: { flex: 1 },
  paymentLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.textSecondary },
  paymentLabelActive: { color: Colors.textPrimary },
  paymentDesc: { ...TextStyles.micro, color: Colors.textMuted, marginTop: 1 },
  popularBadge: { backgroundColor: Colors.success, borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 2 },
  popularText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 9, color: Colors.white },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { ...TextStyles.bodyLg, color: Colors.textSecondary },
  summaryValue: { ...TextStyles.bodyLgSemiBold, color: Colors.textPrimary },
  discount: { color: Colors.success },
  free: { color: Colors.success },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight, marginTop: 4 },
  totalLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary },
  totalValue: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 20, color: Colors.textPrimary },

  ctaContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, paddingHorizontal: Spacing.lg, paddingVertical: 16, paddingBottom: 28, flexDirection: 'row', alignItems: 'center', gap: 16 },
  ctaItems: { ...TextStyles.micro, color: Colors.textMuted },
  ctaTotal: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.textPrimary },
});
