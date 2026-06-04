import React, { useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, TextInput, Image, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { ProductCard } from '../../src/components/product/ProductCard';
import { ViewCartBar } from '../../src/components/cart/ViewCartBar';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppDispatch';
import { addToCart, incrementQuantity, decrementQuantity } from '../../src/features/cart/cartSlice';
import { CATEGORIES, FEATURED_PRODUCTS, FLASH_SALE_PRODUCTS, BANNERS, FRESH_PRODUCTS } from '../../src/data/mockData';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(s => s.cart.items);
  const [activeBanner, setActiveBanner] = useState(0);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const getQty = (productId: string) =>
    cartItems.find(i => i.product.id === productId)?.quantity ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationRow}>
          <Text style={styles.locationPin}>📍</Text>
          <View>
            <Text style={styles.locationLabel}>Delivering to</Text>
            <Text style={styles.locationAddress} numberOfLines={1}>Sadar Bazaar, Chapra ▾</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notifBtn} onPress={() => router.push('/notifications')}>
          <Text style={styles.notifIcon}>🔔</Text>
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Search Bar ── */}
        <TouchableOpacity
          style={[styles.searchBar, Shadows.sm]}
          onPress={() => router.push('/search')}
          activeOpacity={0.85}
        >
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>Search for atta, milk, sabzi...</Text>
          <View style={styles.searchMic}>
            <Text>🎤</Text>
          </View>
        </TouchableOpacity>

        {/* ── Delivery Speed Badge ── */}
        <View style={styles.deliveryBadge}>
          <Text style={styles.deliveryBadgeText}>⚡ Express Delivery in 30 mins · Chapra</Text>
        </View>

        {/* ── Banner Carousel ── */}
        <View style={styles.sectionNoPad}>
          <FlatList
            data={BANNERS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setActiveBanner(Math.round(e.nativeEvent.contentOffset.x / BANNER_WIDTH));
            }}
            keyExtractor={b => b.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/category/${item.categorySlug}`)}
                activeOpacity={0.92}
                style={{ width: BANNER_WIDTH }}
              >
                <LinearGradient
                  colors={item.gradient as [string, string]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.banner}
                >
                  <View style={styles.bannerContent}>
                    <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
                    <Text style={styles.bannerTitle}>{item.title}</Text>
                    <View style={styles.bannerBtn}>
                      <Text style={styles.bannerBtnText}>{item.ctaLabel} →</Text>
                    </View>
                  </View>
                  <Text style={styles.bannerEmoji}>
                    {item.categorySlug === 'vegetables' ? '🥬' : item.categorySlug === 'dairy' ? '🥛' : '🪔'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          />
          {/* Dots */}
          <View style={styles.bannerDots}>
            {BANNERS.map((_, i) => (
              <View key={i} style={[styles.bannerDot, i === activeBanner && styles.bannerDotActive]} />
            ))}
          </View>
        </View>

        {/* ── Categories ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <TouchableOpacity onPress={() => router.push('/categories')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={c => c.id}
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.categoryCard, { backgroundColor: item.color }]}
                onPress={() => router.push(`/category/${item.slug}`)}
                activeOpacity={0.85}
              >
                <Text style={styles.categoryEmoji}>{getCategoryEmoji(item.slug)}</Text>
                <Text style={styles.categoryName}>{item.name}</Text>
                <Text style={styles.categoryNameHindi}>{item.nameHindi}</Text>
              </TouchableOpacity>
            )}
          />
        </View>

        {/* ── Flash Sale ── */}
        <View style={styles.section}>
          <LinearGradient colors={['#FFF3E0', '#FFEBE0']} style={styles.flashSaleBanner}>
            <View style={styles.flashHeader}>
              <Text style={styles.flashTitle}>⚡ Flash Sale</Text>
              <View style={styles.flashTimer}>
                <Text style={styles.flashTimerText}>02 : 47 : 33</Text>
              </View>
            </View>
            <FlatList
              data={FLASH_SALE_PRODUCTS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={p => p.id}
              contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
              renderItem={({ item }) => {
                const qty = getQty(item.id);
                return (
                  <View style={{ width: 150 }}>
                    <ProductCard
                      product={item}
                      quantity={qty}
                      onPress={() => router.push(`/product/${item.id}`)}
                      onAdd={() => dispatch(addToCart(item))}
                      onIncrement={() => dispatch(incrementQuantity(item.id))}
                      onDecrement={() => dispatch(decrementQuantity(item.id))}
                    />
                  </View>
                );
              }}
            />
          </LinearGradient>
        </View>

        {/* ── Fresh Today ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🌿 Fresh Today</Text>
            <TouchableOpacity onPress={() => router.push('/category/vegetables')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={FRESH_PRODUCTS.slice(0, 6)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={p => p.id}
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item }) => {
              const qty = getQty(item.id);
              return (
                <View style={{ width: 150 }}>
                  <ProductCard
                    product={item}
                    quantity={qty}
                    onPress={() => router.push(`/product/${item.id}`)}
                    onAdd={() => dispatch(addToCart(item))}
                    onIncrement={() => dispatch(incrementQuantity(item.id))}
                    onDecrement={() => dispatch(decrementQuantity(item.id))}
                  />
                </View>
              );
            }}
          />
        </View>

        {/* ── Featured Products ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⭐ Top Picks for You</Text>
            <TouchableOpacity onPress={() => router.push('/categories')}>
              <Text style={styles.seeAll}>See all →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productGrid}>
            {FEATURED_PRODUCTS.slice(0, 6).map(item => {
              const qty = getQty(item.id);
              return (
                <View key={item.id} style={styles.productGridItem}>
                  <ProductCard
                    product={item}
                    quantity={qty}
                    onPress={() => router.push(`/product/${item.id}`)}
                    onAdd={() => dispatch(addToCart(item))}
                    onIncrement={() => dispatch(incrementQuantity(item.id))}
                    onDecrement={() => dispatch(decrementQuantity(item.id))}
                  />
                </View>
              );
            })}
          </View>
        </View>

        {/* Bottom space for cart bar */}
        <View style={{ height: 80 }} />
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

function getCategoryEmoji(slug: string): string {
  const map: Record<string, string> = {
    grocery: '🛒', fruits: '🍎', vegetables: '🥦', dairy: '🥛',
    medicines: '💊', snacks: '🍿', beverages: '☕', electronics: '💡',
    stationery: '📝', 'personal-care': '🧴',
  };
  return map[slug] || '📦';
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 20 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: 12,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  locationPin: { fontSize: 22 },
  locationLabel: { ...TextStyles.micro, color: Colors.textMuted },
  locationAddress: { ...TextStyles.bodyLgSemiBold, color: Colors.textPrimary, maxWidth: 200 },
  notifBtn: { position: 'relative', padding: 4 },
  notifIcon: { fontSize: 24 },
  notifDot: {
    position: 'absolute', top: 4, right: 4,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: Colors.error, borderWidth: 1.5, borderColor: Colors.white,
  },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: Spacing.lg, marginTop: 14, marginBottom: 10,
    backgroundColor: Colors.white, borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 16, paddingVertical: 13,
  },
  searchIcon: { fontSize: 18 },
  searchPlaceholder: { ...TextStyles.bodyLg, color: Colors.textPlaceholder, flex: 1 },
  searchMic: { padding: 4 },

  // Delivery badge
  deliveryBadge: {
    marginHorizontal: Spacing.lg, marginBottom: 14,
    backgroundColor: Colors.successContainer, borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'flex-start',
  },
  deliveryBadgeText: { ...TextStyles.labelBold, color: Colors.successDark },

  // Sections
  section: { paddingLeft: Spacing.lg, marginBottom: 24 },
  sectionNoPad: { paddingHorizontal: Spacing.lg, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: Spacing.lg, marginBottom: 14 },
  sectionTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.textPrimary },
  seeAll: { ...TextStyles.bodySmSemiBold, color: Colors.primary },

  // Banner
  banner: { borderRadius: Radius.xxl, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 160 },
  bannerContent: { flex: 1 },
  bannerSubtitle: { ...TextStyles.labelBold, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  bannerTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.white, marginBottom: 12, lineHeight: 26 },
  bannerBtn: { backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.button, alignSelf: 'flex-start' },
  bannerBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.white },
  bannerEmoji: { fontSize: 64, marginLeft: 12 },
  bannerDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  bannerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  bannerDotActive: { width: 18, backgroundColor: Colors.primary },

  // Category chips
  categoryCard: {
    width: 80, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8,
    borderRadius: Radius.xl,
  },
  categoryEmoji: { fontSize: 28, marginBottom: 6 },
  categoryName: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 11, color: Colors.textPrimary, textAlign: 'center' },
  categoryNameHindi: { fontFamily: 'BeVietnamPro-Regular', fontSize: 10, color: Colors.textMuted, textAlign: 'center', marginTop: 1 },

  // Flash Sale
  flashSaleBanner: { borderRadius: Radius.xxl, padding: 16, paddingRight: 0, marginRight: Spacing.lg },
  flashHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingRight: Spacing.lg },
  flashTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.primaryDark },
  flashTimer: { backgroundColor: Colors.primaryDark, paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.button },
  flashTimerText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.white, letterSpacing: 1 },

  // Product Grid
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingRight: Spacing.lg },
  productGridItem: { width: '50%' },
});
