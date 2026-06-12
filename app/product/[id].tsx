import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Image, Dimensions, Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { QuantitySelector } from '../../src/components/product/QuantitySelector';
import { ViewCartBar } from '../../src/components/cart/ViewCartBar';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppDispatch';
import { addToCart, incrementQuantity, decrementQuantity } from '../../src/features/cart/cartSlice';
import { PRODUCTS } from '../../src/data/mockData';
import { ArrowLeft, Share2, Zap, CheckCircle, RotateCcw, Lock, Info } from '../../src/components/ui/Icon';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(s => s.cart.items);
  const [activeImage, setActiveImage] = useState(0);

  const product = PRODUCTS.find(p => p.id === id);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Info size={48} color={Colors.textMuted} />
          <Text style={styles.notFoundTitle}>Product not found</Text>
          <TouchableOpacity style={[styles.backBtn, { flexDirection: 'row', alignItems: 'center', gap: 6 }]} onPress={() => router.back()}>
            <ArrowLeft size={16} color={Colors.white} strokeWidth={2.5} />
            <Text style={styles.backBtnText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const qty = cartItems.find(i => i.product.id === product.id)?.quantity ?? 0;
  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const savings = product.mrp ? product.mrp - product.price : 0;

  // Related products from same category
  const related = PRODUCTS.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 5);

  const handleShare = async () => {
    await Share.share({
      message: `Check out ${product.name} on Blink Box! Only ₹${product.price}/${product.unit}`,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Sticky Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={18} color={Colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{product.name}</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={handleShare} activeOpacity={0.8}>
          <Share2 size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Image Carousel */}
        <View style={styles.imageSection}>
          <Image
            source={{ uri: product.images[activeImage] }}
            style={styles.mainImage}
            resizeMode="cover"
          />

          {/* Badges */}
          {product.discountPercent && product.discountPercent > 0 ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountBadgeText}>{product.discountPercent}% OFF</Text>
            </View>
          ) : null}
          {product.isFresh && (
            <View style={styles.freshBadge}>
              <Text style={styles.freshBadgeText}>FRESH</Text>
            </View>
          )}

          {/* Dot indicators if multiple images */}
          {product.images.length > 1 && (
            <View style={styles.imageDots}>
              {product.images.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setActiveImage(i)}>
                  <View style={[styles.imageDot, i === activeImage && styles.imageDotActive]} />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Product Info Card */}
        <View style={styles.infoCard}>

          {/* Name & Hindi */}
          <View style={styles.nameRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.unitText}>{product.unit}</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceBlock}>
            <Text style={styles.price}>₹{product.price}</Text>
            {product.mrp && product.mrp > product.price && (
              <Text style={styles.mrp}>₹{product.mrp}</Text>
            )}
            {savings > 0 && (
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>You save ₹{savings}!</Text>
              </View>
            )}
          </View>

          {/* Stock Status */}
          <View style={styles.stockRow}>
            <View style={[
              styles.stockChip,
              { backgroundColor: product.stockQuantity > 10 ? Colors.successContainer : Colors.warningContainer ?? '#FFF8E1' }
            ]}>
              <View style={[
                styles.stockDot,
                { backgroundColor: product.stockQuantity > 10 ? Colors.success : Colors.warning ?? '#F59E0B' }
              ]} />
              <Text style={[
                styles.stockText,
                { color: product.stockQuantity > 10 ? Colors.successDark : Colors.warning ?? '#F59E0B' }
              ]}>
                {product.stockQuantity > 10
                  ? 'In Stock'
                  : product.stockQuantity > 0
                  ? `Only ${product.stockQuantity} left!`
                  : 'Out of Stock'}
              </Text>
            </View>
          </View>

          {/* Delivery Info */}
          <LinearGradient
            colors={['#E8F5E9', '#F1F8E9']}
            style={styles.deliveryCard}
          >
            <Zap size={24} color={Colors.successDark} />
            <View>
              <Text style={styles.deliveryTitle}>Express Delivery</Text>
              <Text style={styles.deliverySub}>Delivered in 30 mins · Express</Text>
            </View>
          </LinearGradient>

          {/* Add to Cart */}
          <View style={styles.cartRow}>
            {qty === 0 ? (
              <TouchableOpacity
                style={[styles.addToCartBtn, product.stockQuantity === 0 && styles.addToCartBtnDisabled]}
                onPress={() => product.stockQuantity > 0 && dispatch(addToCart(product))}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={product.stockQuantity > 0 ? [Colors.primary, Colors.primaryDark] : [Colors.border, Colors.border]}
                  style={styles.addToCartGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.addToCartText}>
                    {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <View style={styles.qtyRow}>
                <Text style={styles.qtyLabel}>In your cart:</Text>
                <QuantitySelector
                  quantity={qty}
                  onIncrement={() => dispatch(incrementQuantity(product.id))}
                  onDecrement={() => dispatch(decrementQuantity(product.id))}
                  size="lg"
                />
              </View>
            )}
          </View>
        </View>

        {/* Tags */}
        {product.tags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagRow}>
              {product.tags.map(tag => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Why Choose Blink Box */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Blink Box?</Text>
          <View style={styles.featureList}>
            {[
              { Icon: CheckCircle, text: 'Quality checked products', color: Colors.success },
              { Icon: Zap, text: 'Delivered in 30 minutes', color: Colors.warning ?? '#F59E0B' },
              { Icon: RotateCcw, text: 'Easy returns & refunds', color: Colors.primary },
              { Icon: Lock, text: 'Secure & safe payments', color: Colors.successDark },
            ].map((f, i) => {
              const IconComponent = f.Icon;
              return (
                <View key={i} style={styles.featureItem}>
                  <IconComponent size={18} color={f.color} strokeWidth={2} />
                  <Text style={styles.featureText}>{f.text}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Sticky View Cart Bar */}
      <ViewCartBar
        itemCount={totalItems}
        totalAmount={totalAmount}
        onPress={() => router.push('/cart')}
      />
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
  headerBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  headerBtnIcon: { fontSize: 20, color: Colors.textPrimary },
  headerTitle: {
    flex: 1, fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 16, color: Colors.textPrimary, textAlign: 'center',
  },

  scroll: { paddingBottom: 20 },

  imageSection: { width: width, height: width * 0.85, backgroundColor: Colors.surfaceVariant, position: 'relative' },
  mainImage: { width: '100%', height: '100%' },
  discountBadge: {
    position: 'absolute', top: 16, left: 16,
    backgroundColor: Colors.success, borderRadius: Radius.md,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  discountBadgeText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 12, color: Colors.white },
  freshBadge: {
    position: 'absolute', top: 16, right: 16,
    backgroundColor: Colors.successDark, borderRadius: Radius.md,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  freshBadgeText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 12, color: Colors.white },
  imageDots: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  imageDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  imageDotActive: { width: 20, backgroundColor: Colors.primary },

  infoCard: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    marginTop: -20,
    padding: Spacing.lg,
    paddingBottom: 20,
    ...Shadows.md,
  },

  nameRow: { flexDirection: 'row', marginBottom: 12 },
  productName: { fontFamily: 'BeVietnamPro-Bold', fontSize: 22, color: Colors.textPrimary, lineHeight: 30, marginBottom: 4 },
  nameHindi: { fontFamily: 'BeVietnamPro-Regular', fontSize: 14, color: Colors.textMuted, marginBottom: 4 },
  unitText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.textSecondary },

  priceBlock: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  price: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 28, color: Colors.primary },
  mrp: { fontFamily: 'BeVietnamPro-Regular', fontSize: 16, color: Colors.textMuted, textDecorationLine: 'line-through' },
  savingsBadge: { backgroundColor: Colors.successContainer, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  savingsText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 12, color: Colors.successDark },

  stockRow: { flexDirection: 'row', marginBottom: 16 },
  stockChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
  stockDot: { width: 7, height: 7, borderRadius: 4 },
  stockText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13 },

  deliveryCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderRadius: Radius.xl, padding: 14, marginBottom: 20,
  },
  deliveryIcon: { fontSize: 28 },
  deliveryTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.successDark },
  deliverySub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.success },

  cartRow: { marginBottom: 8 },
  addToCartBtn: { borderRadius: Radius.button, overflow: 'hidden' },
  addToCartBtnDisabled: { opacity: 0.5 },
  addToCartGradient: { paddingVertical: 16, alignItems: 'center', borderRadius: Radius.button },
  addToCartText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 17, color: Colors.white, letterSpacing: 0.3 },

  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 15, color: Colors.textSecondary },

  section: { backgroundColor: Colors.white, marginTop: 12, padding: Spacing.lg },
  sectionTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary, marginBottom: 14 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { backgroundColor: Colors.primaryContainer, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 5 },
  tagText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12, color: Colors.primary },

  featureList: { gap: 12 },
  featureItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  featureIcon: { fontSize: 20, width: 28 },
  featureText: { fontFamily: 'BeVietnamPro-Regular', fontSize: 14, color: Colors.textSecondary, flex: 1 },
});
