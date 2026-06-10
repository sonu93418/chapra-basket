import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../src/theme';
import { useAppDispatch, useAppSelector } from '../src/hooks/useAppDispatch';
import { addToCart } from '../src/features/cart/cartSlice';
import { PRODUCTS } from '../src/data/mockData';
import { Product } from '../src/types';
import { ArrowLeft, Heart, ShoppingCart } from '../src/components/ui/Icon';

// Seed some default wishlist items
const DEFAULT_WISHLIST = ['p8', 'p11', 'p21', 'p27', 'p35'];

export default function WishlistScreen() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(s => s.cart.items);
  const [wishlist, setWishlist] = useState<string[]>(DEFAULT_WISHLIST);

  const wishlistProducts = PRODUCTS.filter(p => wishlist.includes(p.id));

  const removeFromWishlist = (id: string) => {
    setWishlist(prev => prev.filter(w => w !== id));
  };

  const addAllToCart = () => {
    wishlistProducts.forEach(p => dispatch(addToCart(p)));
  };

  const getQty = (id: string) => cartItems.find(i => i.product.id === id)?.quantity ?? 0;

  if (wishlistProducts.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar style="dark" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <ArrowLeft size={18} color={Colors.textPrimary} strokeWidth={2.5} />
          </TouchableOpacity>
          <Text style={styles.title}>Wishlist</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.empty}>
          <Heart size={64} color={Colors.error} fill={Colors.error} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
          <Text style={styles.emptySub}>Save items you love by tapping the ❤️ on any product</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.replace('/(customer)/' as any)} activeOpacity={0.85}>
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={18} color={Colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Wishlist ({wishlistProducts.length})</Text>
        <TouchableOpacity onPress={() => setWishlist([])}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {/* Add All to Cart CTA */}
      <TouchableOpacity style={styles.addAllRow} onPress={addAllToCart} activeOpacity={0.85}>
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          style={[styles.addAllGradient, { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        >
          <ShoppingCart size={18} color={Colors.white} />
          <Text style={styles.addAllText}>Add All to Cart</Text>
          <View style={styles.addAllBadge}>
            <Text style={styles.addAllBadgeText}>{wishlistProducts.length} items</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <FlatList
        data={wishlistProducts}
        keyExtractor={p => p.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => {
          const inCart = getQty(item.id) > 0;
          return (
            <TouchableOpacity
              style={[styles.card, Shadows.sm]}
              onPress={() => router.push(`/product/${item.id}`)}
              activeOpacity={0.9}
            >
              {/* Product Image */}
              <View style={styles.imageBox}>
                <Image source={{ uri: item.images[0] }} style={styles.image} resizeMode="cover" />
                {item.discountPercent && item.discountPercent > 0 ? (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{item.discountPercent}% OFF</Text>
                  </View>
                ) : null}
              </View>

              {/* Info */}
              <View style={styles.info}>
                <Text style={styles.unit}>{item.unit}</Text>
                <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                <View style={styles.priceRow}>
                  <Text style={styles.price}>₹{item.price}</Text>
                  {item.mrp && item.mrp > item.price && (
                    <Text style={styles.mrp}>₹{item.mrp}</Text>
                  )}
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity
                    style={[styles.addBtn, inCart && styles.addBtnInCart]}
                    onPress={() => dispatch(addToCart(item))}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.addBtnText, inCart && styles.addBtnTextInCart]}>
                      {inCart ? `✓ In Cart (${getQty(item.id)})` : '+ Add'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Remove Wishlist Button */}
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeFromWishlist(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.8}
              >
                <Heart size={16} color={Colors.error} fill={Colors.error} />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        }}
        ListFooterComponent={<View style={{ height: 30 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceVariant, alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 20, color: Colors.textPrimary },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.textPrimary },
  clearText: { ...TextStyles.bodySm, color: Colors.error, fontFamily: 'BeVietnamPro-SemiBold' },

  addAllRow: { marginHorizontal: Spacing.md, marginTop: 12, borderRadius: Radius.button, overflow: 'hidden' },
  addAllGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, gap: 10,
  },
  addAllText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.white },
  addAllBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  addAllBadgeText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 12, color: Colors.white },

  list: { padding: Spacing.md },

  card: {
    backgroundColor: Colors.white, borderRadius: Radius.xxl,
    flexDirection: 'row', overflow: 'hidden',
    borderWidth: 1, borderColor: Colors.borderLight,
  },

  imageBox: { width: 110, height: 110, position: 'relative' },
  image: { width: '100%', height: '100%', backgroundColor: Colors.surfaceVariant },
  discountBadge: {
    position: 'absolute', top: 6, left: 6,
    backgroundColor: Colors.success, borderRadius: Radius.sm,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  discountText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 9, color: Colors.white },

  info: { flex: 1, padding: 12, justifyContent: 'space-between' },
  unit: { ...TextStyles.micro, color: Colors.textMuted, marginBottom: 2 },
  name: {
    fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14,
    color: Colors.textPrimary, lineHeight: 19, marginBottom: 6,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  price: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.primary },
  mrp: { ...TextStyles.bodySm, color: Colors.textMuted, textDecorationLine: 'line-through' },

  actions: { flexDirection: 'row' },
  addBtn: {
    backgroundColor: Colors.white, borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 5,
  },
  addBtnInCart: { backgroundColor: Colors.successContainer, borderColor: Colors.success },
  addBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 12, color: Colors.primary },
  addBtnTextInCart: { color: Colors.successDark },

  removeBtn: {
    position: 'absolute', top: 10, right: 10,
    backgroundColor: Colors.white, borderRadius: 14,
    width: 28, height: 28, alignItems: 'center', justifyContent: 'center',
    ...Shadows.sm,
  },
  removeIcon: { fontSize: 16 },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 40 },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 22, color: Colors.textPrimary },
  emptySub: { ...TextStyles.bodyLg, color: Colors.textMuted, textAlign: 'center', lineHeight: 24 },
  shopBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.button,
    paddingHorizontal: 28, paddingVertical: 14, marginTop: 8,
  },
  shopBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.white },
});
