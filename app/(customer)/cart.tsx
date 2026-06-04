import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, FlatList, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { QuantitySelector } from '../../src/components/product/QuantitySelector';
import { Button } from '../../src/components/ui/Button';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppDispatch';
import { incrementQuantity, decrementQuantity, clearCart, applyCoupon, removeCoupon } from '../../src/features/cart/cartSlice';
import { COUPONS } from '../../src/data/mockData';

export default function CartScreen() {
  const dispatch = useAppDispatch();
  const { items, couponCode, couponDiscount } = useAppSelector(s => s.cart);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const deliveryFee = subtotal >= 299 ? 0 : 25;
  const platformFee = 5;
  const total = subtotal + deliveryFee + platformFee - couponDiscount;

  const applyCouponCode = () => {
    const coupon = COUPONS.find(c => c.code === couponInput.toUpperCase());
    if (!coupon) { setCouponError('Invalid coupon code'); return; }
    if (subtotal < coupon.minOrderValue) { setCouponError(`Minimum order ₹${coupon.minOrderValue} required`); return; }
    let discount = coupon.discountType === 'flat'
      ? coupon.discountValue
      : Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount || Infinity);
    dispatch(applyCoupon({ code: coupon.code, discount }));
    setCouponInput('');
    setCouponError('');
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
          <Text style={styles.title}>Cart</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.emptyCart}>
          <Text style={styles.emptyEmoji}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add items from our store to get started</Text>
          <Button label="Shop Now" onPress={() => router.replace('/(customer)/' as any)} style={{ marginTop: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}><Text style={styles.backBtn}>←</Text></TouchableOpacity>
        <Text style={styles.title}>Cart ({items.length})</Text>
        <TouchableOpacity onPress={() => dispatch(clearCart())}>
          <Text style={styles.clearBtn}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Delivery ETA */}
        <View style={styles.etaBanner}>
          <Text style={styles.etaText}>⚡ Delivering in ~30 mins · Chapra</Text>
        </View>

        {/* Cart Items */}
        <View style={styles.itemsCard}>
          {items.map((item, i) => (
            <View key={item.product.id}>
              <View style={styles.cartItem}>
                <Image source={{ uri: item.product.images[0] }} style={styles.itemImg} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>{item.product.name}</Text>
                  <Text style={styles.itemUnit}>{item.product.unit}</Text>
                  <Text style={styles.itemPrice}>₹{item.product.price}</Text>
                </View>
                <QuantitySelector
                  quantity={item.quantity}
                  onIncrement={() => dispatch(incrementQuantity(item.product.id))}
                  onDecrement={() => dispatch(decrementQuantity(item.product.id))}
                  size="sm"
                />
              </View>
              {i < items.length - 1 && <View style={styles.itemDivider} />}
            </View>
          ))}
        </View>

        {/* Coupon */}
        <View style={styles.couponSection}>
          <Text style={styles.couponTitle}>🎟️ Apply Coupon</Text>
          {couponCode ? (
            <View style={styles.appliedCoupon}>
              <Text style={styles.appliedText}>✅ {couponCode} applied — ₹{couponDiscount} off!</Text>
              <TouchableOpacity onPress={() => dispatch(removeCoupon())}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.couponRow}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter coupon code"
                  placeholderTextColor={Colors.textPlaceholder}
                  value={couponInput}
                  onChangeText={t => { setCouponInput(t.toUpperCase()); setCouponError(''); }}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.applyBtn} onPress={applyCouponCode}>
                  <Text style={styles.applyText}>Apply</Text>
                </TouchableOpacity>
              </View>
              {couponError ? <Text style={styles.couponError}>{couponError}</Text> : null}
              <View style={styles.availableCoupons}>
                {COUPONS.slice(0, 2).map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.couponChip}
                    onPress={() => setCouponInput(c.code)}
                  >
                    <Text style={styles.couponChipCode}>{c.code}</Text>
                    <Text style={styles.couponChipDesc}>{c.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Price Breakdown */}
        <View style={styles.priceCard}>
          <Text style={styles.priceTitle}>Price Breakdown</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal ({items.length} items)</Text>
            <Text style={styles.priceValue}>₹{subtotal}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text style={[styles.priceValue, deliveryFee === 0 && styles.free]}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </Text>
          </View>
          {deliveryFee > 0 && (
            <Text style={styles.freeDeliveryHint}>
              Add ₹{299 - subtotal} more for free delivery
            </Text>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Platform Fee</Text>
            <Text style={styles.priceValue}>₹{platformFee}</Text>
          </View>
          {couponDiscount > 0 && (
            <View style={styles.priceRow}>
              <Text style={[styles.priceLabel, styles.discountLabel]}>Coupon Discount</Text>
              <Text style={styles.discountValue}>−₹{couponDiscount}</Text>
            </View>
          )}
          <View style={[styles.priceRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>₹{total}</Text>
          </View>
          {couponDiscount > 0 && (
            <Text style={styles.savingsText}>🎉 You're saving ₹{couponDiscount} on this order!</Text>
          )}
        </View>

        {/* Safety */}
        <View style={styles.safetyRow}>
          {['🔒 Secure Payment', '⚡ 30 min delivery', '↩️ Easy Returns'].map((s, i) => (
            <Text key={i} style={styles.safetyItem}>{s}</Text>
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Checkout CTA */}
      <View style={[styles.checkoutContainer, Shadows.lg]}>
        <View style={styles.checkoutSummary}>
          <Text style={styles.checkoutItems}>{items.length} items</Text>
          <Text style={styles.checkoutTotal}>₹{total}</Text>
        </View>
        <Button
          label="Proceed to Checkout →"
          onPress={() => router.push('/checkout')}
          fullWidth
          size="lg"
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: 14 },
  backBtn: { fontSize: 22, color: Colors.primary, fontWeight: '700', width: 32 },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.textPrimary },
  clearBtn: { ...TextStyles.bodySm, color: Colors.error, fontFamily: 'BeVietnamPro-SemiBold' },

  etaBanner: { marginHorizontal: Spacing.lg, marginBottom: 14, backgroundColor: Colors.successContainer, borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 8 },
  etaText: { ...TextStyles.bodySm, color: Colors.successDark, fontFamily: 'BeVietnamPro-SemiBold' },

  itemsCard: { marginHorizontal: Spacing.lg, backgroundColor: Colors.white, borderRadius: Radius.xxl, padding: 4, marginBottom: 14, ...Shadows.sm },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  itemImg: { width: 68, height: 68, borderRadius: Radius.lg, backgroundColor: Colors.surfaceVariant },
  itemInfo: { flex: 1 },
  itemName: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.textPrimary, marginBottom: 2, lineHeight: 20 },
  itemUnit: { ...TextStyles.micro, color: Colors.textMuted, marginBottom: 4 },
  itemPrice: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary },
  itemDivider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: 12 },

  couponSection: { marginHorizontal: Spacing.lg, backgroundColor: Colors.white, borderRadius: Radius.xxl, padding: 16, marginBottom: 14, ...Shadows.sm },
  couponTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.textPrimary, marginBottom: 12 },
  couponRow: { flexDirection: 'row', gap: 10 },
  couponInput: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.lg,
    paddingHorizontal: 14, paddingVertical: 10, fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 14, color: Colors.textPrimary, letterSpacing: 1,
  },
  applyBtn: { backgroundColor: Colors.primary, borderRadius: Radius.lg, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  applyText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.white },
  couponError: { ...TextStyles.bodySm, color: Colors.error, marginTop: 6 },
  availableCoupons: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  couponChip: { backgroundColor: Colors.primaryContainer, borderRadius: Radius.button, paddingHorizontal: 12, paddingVertical: 6 },
  couponChipCode: { fontFamily: 'BeVietnamPro-Bold', fontSize: 12, color: Colors.primary },
  couponChipDesc: { ...TextStyles.micro, color: Colors.primaryDark, marginTop: 1 },
  appliedCoupon: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.successContainer, borderRadius: Radius.lg, padding: 12 },
  appliedText: { ...TextStyles.bodySm, color: Colors.successDark, fontFamily: 'BeVietnamPro-SemiBold', flex: 1 },
  removeText: { ...TextStyles.bodySm, color: Colors.error, fontFamily: 'BeVietnamPro-SemiBold' },

  priceCard: { marginHorizontal: Spacing.lg, backgroundColor: Colors.white, borderRadius: Radius.xxl, padding: 16, marginBottom: 14, ...Shadows.sm },
  priceTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.textPrimary, marginBottom: 14 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  priceLabel: { ...TextStyles.bodyLg, color: Colors.textSecondary },
  priceValue: { ...TextStyles.bodyLgSemiBold, color: Colors.textPrimary },
  free: { color: Colors.success, fontFamily: 'BeVietnamPro-Bold' },
  freeDeliveryHint: { ...TextStyles.bodySm, color: Colors.primary, fontFamily: 'BeVietnamPro-SemiBold', marginBottom: 10 },
  discountLabel: { color: Colors.success },
  discountValue: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.success },
  totalRow: { paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.borderLight, marginTop: 4 },
  totalLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary },
  totalValue: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 20, color: Colors.textPrimary },
  savingsText: { ...TextStyles.bodySm, color: Colors.success, fontFamily: 'BeVietnamPro-SemiBold', marginTop: 8, textAlign: 'center' },

  safetyRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: Spacing.lg, marginBottom: 8 },
  safetyItem: { ...TextStyles.micro, color: Colors.textMuted },

  checkoutContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, paddingHorizontal: Spacing.lg, paddingVertical: 16, paddingBottom: 28, flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkoutSummary: { alignItems: 'center' },
  checkoutItems: { ...TextStyles.micro, color: Colors.textMuted },
  checkoutTotal: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.textPrimary },

  emptyCart: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyEmoji: { fontSize: 72, marginBottom: 20 },
  emptyTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 24, color: Colors.textPrimary, marginBottom: 8 },
  emptySub: { ...TextStyles.bodyLg, color: Colors.textMuted, textAlign: 'center' },
});
