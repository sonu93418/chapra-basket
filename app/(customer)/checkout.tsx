import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { Button } from '../../src/components/ui/Button';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppDispatch';
import { clearCart } from '../../src/features/cart/cartSlice';
import { addOrder } from '../../src/features/orders/ordersSlice';
import { Address, CartItem, Order, PaymentMethod } from '../../src/types';
import { useGetAddressesQuery } from '../../src/api/addressesApi';
import { useCreateOrderMutation } from '../../src/api/ordersApi';
import {
  ArrowLeft, MapPin, Clock, CreditCard, Wallet,
  Smartphone, Banknote, CheckCircle, ChevronRight,
  Zap, Shield, Package, Home,
} from '../../src/components/ui/Icon';
import { formatCurrencyFull } from '../../src/utils/format';

// ─── Payment Methods (SVG icons) ─────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: 'upi',     label: 'UPI / Google Pay',        Icon: Smartphone, desc: 'PhonePe · GPay · Paytm',  popular: false, color: '#4285F4' },
  { id: 'card',    label: 'Credit / Debit Card',      Icon: CreditCard, desc: 'Visa · Mastercard · RuPay', popular: false, color: '#7C3AED' },
  { id: 'wallet',  label: 'Chapra Basket Wallet',     Icon: Wallet,     desc: 'Balance: ₹120',            popular: false, color: '#059669' },
  { id: 'cod',     label: 'Cash on Delivery',         Icon: Banknote,   desc: 'Pay when delivered',       popular: true,  color: Colors.primary },
] as const;

// ─── Delivery Slots ───────────────────────────────────────────────────────────
const DELIVERY_SLOTS = [
  { id: 's1', label: 'Express Delivery',        sublabel: '~30 minutes',          Icon: Zap,     hot: true  },
  { id: 's2', label: 'Scheduled (1–2 Hours)',   sublabel: 'Pick a window',         Icon: Clock,   hot: false },
  { id: 's3', label: 'Today Evening',           sublabel: '6:00 PM – 9:00 PM',    Icon: Clock,   hot: false },
  { id: 's4', label: 'Tomorrow Morning',        sublabel: '9:00 AM – 11:00 AM',   Icon: Package, hot: false },
] as const;

// ─── Step Header ──────────────────────────────────────────────────────────────
function StepHeader({ step, label }: { step: number; label: string }) {
  return (
    <View style={sh.row}>
      <View style={sh.stepDot}><Text style={sh.stepNum}>{step}</Text></View>
      <Text style={sh.label}>{label}</Text>
    </View>
  );
}
const sh = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  stepDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.white },
  label: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CheckoutScreen() {
  const dispatch = useAppDispatch();
  const { items, couponDiscount, couponCode } = useAppSelector(s => s.cart);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cod');
  const [selectedSlot, setSelectedSlot] = useState('s1');
  const [isLoading, setIsLoading] = useState(false);
  
  const { data: addresses = [], refetch } = useGetAddressesQuery();
  const [createOrderCall] = useCreateOrderMutation();
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  useEffect(() => {
    if (addresses.length > 0) {
      const def = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddress(def);
    }
  }, [addresses]);

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const deliveryFee = subtotal >= 299 ? 0 : 25;
  const platformFee = 5;
  const total = subtotal + deliveryFee + platformFee - couponDiscount;
  const savings = (deliveryFee === 0 ? 25 : 0) + couponDiscount;

  const placeOrder = async () => {
    if (items.length === 0) {
      router.replace('/(customer)/cart' as any);
      return;
    }
    if (!selectedAddress) {
      Alert.alert('Address Required', 'Please select or add a delivery address.');
      return;
    }

    setIsLoading(true);
    try {
      const orderParams = {
        addressId: selectedAddress.id,
        paymentMethod: selectedPayment,
        couponCode: couponCode || undefined,
        couponDiscount,
        items: items.map(item => ({ productId: item.product.id, quantity: item.quantity })),
      };

      const result = await createOrderCall(orderParams).unwrap();
      dispatch(clearCart());
      setIsLoading(false);
      router.replace({ pathname: '/(customer)/order-confirmed', params: { orderId: result.id } } as any);
    } catch (err: any) {
      setIsLoading(false);
      Alert.alert('Order Failed', err?.data?.error || 'Failed to place order. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={styles.secureTag}>
          <Shield size={12} color={Colors.success} strokeWidth={2.5} />
          <Text style={styles.secureText}>Secure</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Step 1: Delivery Address ── */}
        <View style={styles.section}>
          <StepHeader step={1} label="Delivery Address" />
          <TouchableOpacity 
            style={[styles.card, Shadows.sm]} 
            activeOpacity={0.88}
            onPress={() => router.push('/addresses')}
          >
            <View style={styles.addressRow}>
              <View style={styles.addressIconWrap}>
                <Home size={18} color={Colors.primary} strokeWidth={2} />
              </View>
              {selectedAddress ? (
                <View style={styles.addressInfo}>
                  <View style={styles.addressLabelRow}>
                    <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
                    {selectedAddress.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.addressFull} numberOfLines={2}>
                    {selectedAddress.fullAddress}
                  </Text>
                </View>
              ) : (
                <View style={styles.addressInfo}>
                  <Text style={styles.addressLabel}>No Address Saved</Text>
                  <Text style={styles.addressFull}>Tap here to add a delivery address</Text>
                </View>
              )}
              <TouchableOpacity style={styles.changeBtn} onPress={() => router.push('/addresses')} activeOpacity={0.8}>
                <Text style={styles.changeBtnText}>Change</Text>
                <ChevronRight size={13} color={Colors.primary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Step 2: Delivery Slot ── */}
        <View style={styles.section}>
          <StepHeader step={2} label="Delivery Time" />
          {DELIVERY_SLOTS.map(slot => {
            const isActive = selectedSlot === slot.id;
            return (
              <TouchableOpacity
                key={slot.id}
                style={[styles.slotCard, isActive && styles.slotCardActive]}
                onPress={() => setSelectedSlot(slot.id)}
                activeOpacity={0.85}
              >
                <View style={[styles.radio, isActive && styles.radioActive]}>
                  {isActive && <View style={styles.radioInner} />}
                </View>
                <View style={[styles.slotIconWrap, { backgroundColor: isActive ? Colors.primary : Colors.surfaceElevated }]}>
                  <slot.Icon size={15} color={isActive ? Colors.white : Colors.textMuted} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.slotLabel, isActive && styles.slotLabelActive]}>{slot.label}</Text>
                  <Text style={styles.slotSub}>{slot.sublabel}</Text>
                </View>
                {slot.hot && (
                  <LinearGradient colors={[Colors.primary, Colors.primaryDark]} style={styles.hotBadge}>
                    <Text style={styles.hotBadgeText}>HOT</Text>
                  </LinearGradient>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Step 3: Payment Method ── */}
        <View style={styles.section}>
          <StepHeader step={3} label="Payment Method" />
          {PAYMENT_METHODS.map(pm => {
            const isActive = selectedPayment === pm.id;
            return (
              <TouchableOpacity
                key={pm.id}
                style={[styles.payCard, isActive && styles.payCardActive]}
                onPress={() => setSelectedPayment(pm.id as PaymentMethod)}
                activeOpacity={0.85}
              >
                <View style={[styles.radio, isActive && styles.radioActive]}>
                  {isActive && <View style={styles.radioInner} />}
                </View>
                <View style={[styles.payIconWrap, { backgroundColor: pm.color + '18' }]}>
                  <pm.Icon size={18} color={pm.color} strokeWidth={2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.payLabel, isActive && styles.payLabelActive]}>{pm.label}</Text>
                  <Text style={styles.payDesc}>{pm.desc}</Text>
                </View>
                {pm.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>Popular</Text>
                  </View>
                )}
                {isActive && (
                  <CheckCircle size={16} color={Colors.primary} strokeWidth={2.5} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Step 4: Order Summary ── */}
        <View style={styles.section}>
          <StepHeader step={4} label="Order Summary" />
          <View style={[styles.card, Shadows.sm]}>
            {[
              { label: `Subtotal (${items.length} items)`, value: formatCurrencyFull(subtotal), color: Colors.textPrimary },
              { label: 'Delivery Fee', value: deliveryFee === 0 ? 'FREE' : formatCurrencyFull(deliveryFee), color: deliveryFee === 0 ? Colors.success : Colors.textPrimary },
              { label: 'Platform Fee', value: '₹5', color: Colors.textMuted },
              ...(couponDiscount > 0 ? [{ label: 'Coupon Discount', value: `-₹${couponDiscount}`, color: Colors.success }] : []),
            ].map((row, i) => (
              <View key={i} style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>{row.label}</Text>
                <Text style={[styles.summaryValue, { color: row.color }]}>{row.value}</Text>
              </View>
            ))}
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>{formatCurrencyFull(total)}</Text>
            </View>
            {savings > 0 && (
              <LinearGradient colors={[Colors.successContainer, '#D4EDDA']} style={styles.savingsBanner}>
                <Text style={styles.savingsText}>You are saving {formatCurrencyFull(savings)} on this order!</Text>
              </LinearGradient>
            )}
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Place Order CTA ── */}
      <View style={[styles.ctaContainer, Shadows.lg]}>
        <View style={styles.ctaSummary}>
          <Text style={styles.ctaItems}>{items.length} item{items.length > 1 ? 's' : ''}</Text>
          <Text style={styles.ctaTotal}>{formatCurrencyFull(total)}</Text>
        </View>
        <Button
          label={isLoading ? 'Placing Order...' : `Pay & Order`}
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

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingHorizontal: Spacing.lg, paddingVertical: 12,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.textPrimary, flex: 1 },
  secureTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.successContainer, paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  secureText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 11, color: Colors.success },

  scroll: { paddingHorizontal: Spacing.lg, paddingTop: 16, paddingBottom: 20 },
  section: { marginBottom: 24 },

  card: { backgroundColor: Colors.white, borderRadius: Radius.xxl, padding: 16 },

  // Address
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  addressIconWrap: { width: 40, height: 40, borderRadius: 16, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  addressInfo: { flex: 1 },
  addressLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  addressLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.textPrimary },
  defaultBadge: { backgroundColor: Colors.primaryContainer, paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.full },
  defaultBadgeText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 10, color: Colors.primary },
  addressFull: { fontFamily: 'BeVietnamPro-Regular', fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  changeBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  changeBtnText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.primary },

  // Radio
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  radioActive: { borderColor: Colors.primary },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },

  // Slots
  slotCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: Colors.borderLight, ...Shadows.sm },
  slotCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer + '60' },
  slotIconWrap: { width: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  slotLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.textSecondary, marginBottom: 1 },
  slotLabelActive: { color: Colors.textPrimary },
  slotSub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted },
  hotBadge: { borderRadius: Radius.sm, paddingHorizontal: 7, paddingVertical: 3 },
  hotBadgeText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 9, color: Colors.white, letterSpacing: 0.5 },

  // Payment
  payCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.white, borderRadius: Radius.xl, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: Colors.borderLight, ...Shadows.sm },
  payCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer + '40' },
  payIconWrap: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  payLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.textSecondary, marginBottom: 1 },
  payLabelActive: { color: Colors.textPrimary },
  payDesc: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted },
  popularBadge: { backgroundColor: Colors.success, borderRadius: Radius.sm, paddingHorizontal: 7, paddingVertical: 3 },
  popularText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 10, color: Colors.white },

  // Summary
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  summaryLabel: { fontFamily: 'BeVietnamPro-Regular', fontSize: 14, color: Colors.textSecondary },
  summaryValue: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.borderLight, marginTop: 4, marginBottom: 12 },
  totalLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary },
  totalValue: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 22, color: Colors.textPrimary },
  savingsBanner: { borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 10 },
  savingsText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.successDark, textAlign: 'center' },

  // CTA
  ctaContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, paddingHorizontal: Spacing.lg, paddingVertical: 14, paddingBottom: 28, flexDirection: 'row', alignItems: 'center', gap: 16 },
  ctaSummary: { alignItems: 'center' },
  ctaItems: { fontFamily: 'BeVietnamPro-Regular', fontSize: 11, color: Colors.textMuted },
  ctaTotal: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.textPrimary },
});
