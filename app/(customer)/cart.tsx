import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { QuantitySelector } from '../../src/components/product/QuantitySelector';
import { Button } from '../../src/components/ui/Button';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppDispatch';
import { incrementQuantity, decrementQuantity, clearCart, applyCoupon, removeCoupon } from '../../src/features/cart/cartSlice';
import { COUPONS } from '../../src/data/mockData';
import { ArrowLeft, Trash2, Zap, Tag, CheckCircle, X, Shield, RotateCcw, ShoppingCart } from '../../src/components/ui/Icon';
import { formatCurrencyFull } from '../../src/utils/format';

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
          <TouchableOpacity style={styles.backBtnWrap} onPress={() => router.back()} activeOpacity={0.8}>
            <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.title}>My Cart</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyCart}>
          <View style={styles.emptyIconWrap}>
            <ShoppingCart size={44} color={Colors.textMuted} strokeWidth={1.5} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add items from our store to get started</Text>
          <Button label="Start Shopping" onPress={() => router.replace('/(customer)/' as any)} style={{ marginTop: 24 }} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtnWrap} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>My Cart ({items.length})</Text>
        <TouchableOpacity style={styles.clearBtnWrap} onPress={() => dispatch(clearCart())} activeOpacity={0.8}>
          <Trash2 size={17} color={Colors.error} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Delivery ETA */}
        <View style={styles.etaBanner}>
          <Zap size={13} color={Colors.successDark} strokeWidth={2.5} fill={Colors.successDark} />
          <Text style={styles.etaText}>Delivering in ~30 mins · Express</Text>
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
          <View style={styles.couponHeader}>
            <Tag size={15} color={Colors.primary} strokeWidth={2} />
            <Text style={styles.couponTitle}>Apply Coupon</Text>
          </View>
          {couponCode ? (
            <View style={styles.appliedCoupon}>
              <CheckCircle size={16} color={Colors.success} strokeWidth={2.5} />
              <Text style={styles.appliedText}>{couponCode} applied — ₹{couponDiscount} off!</Text>
              <TouchableOpacity onPress={() => dispatch(removeCoupon())} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={16} color={Colors.error} strokeWidth={2.5} />
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
            <Text style={styles.priceValue}>{formatCurrencyFull(subtotal)}</Text>
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
            <Text style={styles.totalValue}>{formatCurrencyFull(total)}</Text>
          </View>
          {couponDiscount > 0 && (
            <Text style={styles.savingsText}>You're saving ₹{couponDiscount} on this order!</Text>
          )}
        </View>

        {/* Safety */}
        <View style={styles.safetyRow}>
          <View style={styles.safetyItem}>
            <Shield size={13} color={Colors.success} strokeWidth={2} />
            <Text style={styles.safetyText}>Secure</Text>
          </View>
          <View style={styles.safetyDot} />
          <View style={styles.safetyItem}>
            <Zap size={13} color={Colors.primary} strokeWidth={2} fill={Colors.primary} />
            <Text style={styles.safetyText}>30 min</Text>
          </View>
          <View style={styles.safetyDot} />
          <View style={styles.safetyItem}>
            <RotateCcw size={13} color={Colors.statusConfirmed} strokeWidth={2} />
            <Text style={styles.safetyText}>Easy Returns</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Checkout CTA */}
      <View style={[styles.checkoutContainer, Shadows.lg]}>
        <View style={styles.checkoutSummary}>
          <Text style={styles.checkoutItems}>{items.length} item{items.length > 1 ? 's' : ''}</Text>
          <Text style={styles.checkoutTotal}>{formatCurrencyFull(total)}</Text>
        </View>
        <Button
          label="Proceed to Checkout"
          onPress={() => router.push('/(customer)/checkout' as any)}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: 12, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  backBtnWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  clearBtnWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.errorContainer, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.textPrimary },

  etaBanner: { flexDirection: 'row', alignItems: 'center', gap: 7, marginHorizontal: Spacing.lg, marginBottom: 14, backgroundColor: Colors.successContainer, borderRadius: Radius.lg, paddingHorizontal: 14, paddingVertical: 9 },
  etaText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.successDark },

  itemsCard: { marginHorizontal: Spacing.lg, backgroundColor: Colors.white, borderRadius: Radius.xxl, padding: 4, marginBottom: 14, ...Shadows.sm },
  cartItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  itemImg: { width: 68, height: 68, borderRadius: Radius.lg, backgroundColor: Colors.surfaceVariant },
  itemInfo: { flex: 1 },
  itemName: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.textPrimary, marginBottom: 2, lineHeight: 20 },
  itemUnit: { ...TextStyles.micro, color: Colors.textMuted, marginBottom: 4 },
  itemPrice: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary },
  itemDivider: { height: 1, backgroundColor: Colors.borderLight, marginHorizontal: 12 },

  couponSection: { marginHorizontal: Spacing.lg, backgroundColor: Colors.white, borderRadius: Radius.xxl, padding: 16, marginBottom: 14, ...Shadows.sm },
  couponHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 },
  couponTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.textPrimary },
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
  appliedCoupon: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: Colors.successContainer, borderRadius: Radius.lg, padding: 12 },
  appliedText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.successDark, flex: 1 },

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

  safetyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: Spacing.lg, marginBottom: 8 },
  safetyItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  safetyText: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted },
  safetyDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: Colors.border },

  checkoutContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: Colors.white, paddingHorizontal: Spacing.lg, paddingVertical: 16, paddingBottom: 28, flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkoutSummary: { alignItems: 'center' },
  checkoutItems: { ...TextStyles.micro, color: Colors.textMuted },
  checkoutTotal: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.textPrimary },

  emptyCart: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIconWrap: { width: 110, height: 110, borderRadius: 55, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  emptyTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 24, color: Colors.textPrimary, marginBottom: 8 },
  emptySub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 15, color: Colors.textMuted, textAlign: 'center' },
});
