import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, FlatList,
  TouchableOpacity, Dimensions, Animated,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { ProductCard } from '../../src/components/product/ProductCard';
import { ViewCartBar } from '../../src/components/cart/ViewCartBar';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppDispatch';
import { addToCart, incrementQuantity, decrementQuantity } from '../../src/features/cart/cartSlice';
import { CATEGORIES, FEATURED_PRODUCTS, FLASH_SALE_PRODUCTS, BANNERS, FRESH_PRODUCTS } from '../../src/data/mockData';
import {
  MapPin, Bell, Search, Mic2, Zap, ChevronRight,
  Leaf, Star, ShoppingBag, Clock, Tag, Store, Flame, Package, Briefcase, Activity
} from '../../src/components/ui/Icon';
import { DotBadge } from '../../src/components/ui/Badge';
import { formatCurrency } from '../../src/utils/format';

const { width } = Dimensions.get('window');
const BANNER_WIDTH = width - 32;

// ─── Category Icon Map ────────────────────────────────────────────────────────
const CATEGORY_SVG_COLORS: Record<string, [string, string]> = {
  grocery:       ['#FFF3E0', '#FFE082'],
  fruits:        ['#FCE4EC', '#F48FB1'],
  vegetables:    ['#E8F5E9', '#A5D6A7'],
  dairy:         ['#E3F2FD', '#90CAF9'],
  medicines:     ['#EDE7F6', '#CE93D8'],
  snacks:        ['#FFF8E1', '#FFD54F'],
  beverages:     ['#E0F7FA', '#80DEEA'],
  electronics:   ['#F3E5F5', '#E040FB'],
  stationery:    ['#E8EAF6', '#9FA8DA'],
  'personal-care': ['#FBE9E7', '#FFAB91'],
};

const CATEGORY_ICONS: Record<string, any> = {
  grocery: Store,
  fruits: Flame,
  vegetables: Leaf,
  dairy: ShoppingBag,
  medicines: Activity,
  snacks: Package,
  beverages: Zap,
  electronics: Zap,
  stationery: Briefcase,
  'personal-care': ShoppingBag,
};

// ─── Flash Sale Timer ─────────────────────────────────────────────────────────
function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(initialSeconds);
  useEffect(() => {
    const interval = setInterval(() => setSeconds(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) {
  return (
    <View style={sh.row}>
      <Text style={sh.title}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity style={sh.btn} onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={sh.btnText}>See all</Text>
          <ChevronRight size={14} color={Colors.primary} strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </View>
  );
}
const sh = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingRight: Spacing.lg, marginBottom: 14 },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.textPrimary },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  btnText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.primary },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(s => s.cart.items);
  const [activeBanner, setActiveBanner] = useState(0);
  const flashTimer = useCountdown(2 * 3600 + 47 * 60 + 33);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const getQty = (id: string) => cartItems.find(i => i.product.id === id)?.quantity ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.locationRow} activeOpacity={0.8}>
          <View style={styles.locationIconWrap}>
            <MapPin size={16} color={Colors.primary} strokeWidth={2.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.locationLabel}>Delivering to</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={styles.locationAddress} numberOfLines={1}>Sadar Bazaar, Chapra</Text>
              <ChevronRight size={14} color={Colors.textPrimary} strokeWidth={2.5} />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => router.push('/notifications')}
          activeOpacity={0.8}
        >
          <Bell size={22} color={Colors.textPrimary} strokeWidth={1.8} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Search Bar ── */}
        <TouchableOpacity
          style={[styles.searchBar, Shadows.sm]}
          onPress={() => router.push('/(customer)/search')}
          activeOpacity={0.85}
        >
          <Search size={18} color={Colors.textMuted} strokeWidth={2} />
          <Text style={styles.searchPlaceholder}>Search for atta, milk, sabzi...</Text>
          <View style={styles.searchDivider} />
          <View style={styles.micBtn}>
            <Mic2 size={16} color={Colors.primary} strokeWidth={2} />
          </View>
        </TouchableOpacity>

        {/* ── Delivery ETA Badge ── */}
        <View style={styles.etaRow}>
          <LinearGradient
            colors={[Colors.successContainer, '#D4EDDA']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.etaBadge}
          >
            <Zap size={13} color={Colors.successDark} strokeWidth={2.5} fill={Colors.successDark} />
            <Text style={styles.etaText}>Express Delivery in 30 mins · Chapra</Text>
          </LinearGradient>
        </View>

        {/* ── Banner Carousel ── */}
        <View style={styles.sectionNoPad}>
          <FlatList
            data={BANNERS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToInterval={BANNER_WIDTH + 12}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) => {
              setActiveBanner(Math.round(e.nativeEvent.contentOffset.x / (BANNER_WIDTH + 12)));
            }}
            keyExtractor={b => b.id}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => router.push(`/category/${item.categorySlug}` as any)}
                activeOpacity={0.92}
                style={{ width: BANNER_WIDTH }}
              >
                <LinearGradient
                  colors={item.gradient as [string, string]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={styles.banner}
                >
                  <View style={styles.bannerContent}>
                    <View style={styles.bannerTagPill}>
                      <Tag size={10} color={Colors.white} strokeWidth={2} />
                      <Text style={styles.bannerTag}>{item.subtitle}</Text>
                    </View>
                    <Text style={styles.bannerTitle}>{item.title}</Text>
                    <View style={styles.bannerBtn}>
                      <Text style={styles.bannerBtnText}>Shop Now</Text>
                      <ChevronRight size={13} color={Colors.white} strokeWidth={2.5} />
                    </View>
                  </View>
                  <View style={styles.bannerEmoji}>
                    {item.categorySlug === 'vegetables' ? (
                      <Leaf size={56} color="rgba(255,255,255,0.3)" strokeWidth={2} />
                    ) : item.categorySlug === 'dairy' ? (
                      <ShoppingBag size={56} color="rgba(255,255,255,0.3)" strokeWidth={2} />
                    ) : (
                      <Store size={56} color="rgba(255,255,255,0.3)" strokeWidth={2} />
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            )}
          />
          <View style={styles.bannerDots}>
            {BANNERS.map((_, i) => (
              <View key={i} style={[styles.bannerDot, i === activeBanner && styles.bannerDotActive]} />
            ))}
          </View>
        </View>

        {/* ── Categories ── */}
        <View style={styles.section}>
          <SectionHeader title="Shop by Category" onSeeAll={() => router.push('/(customer)/categories')} />
          <FlatList
            data={CATEGORIES}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={c => c.id}
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item }) => {
              const [bgFrom, bgTo] = CATEGORY_SVG_COLORS[item.slug] ?? ['#F5F5F5', '#E0E0E0'];
              return (
                <TouchableOpacity
                  style={styles.categoryCard}
                  onPress={() => router.push(`/category/${item.slug}` as any)}
                  activeOpacity={0.85}
                >
                  <LinearGradient colors={[bgFrom, bgTo]} style={styles.categoryIconBg}>
                    {React.createElement(CATEGORY_ICONS[item.slug] || Package, {
                      size: 24,
                      color: Colors.primaryDark,
                      strokeWidth: 2,
                    })}
                  </LinearGradient>
                  <Text style={styles.categoryName} numberOfLines={1}>{item.name}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>

        {/* ── Flash Sale ── */}
        <View style={styles.section}>
          <LinearGradient colors={['#FFF3E0', '#FFEBE0']} style={styles.flashContainer}>
            <View style={styles.flashHeader}>
              <View style={styles.flashTitleRow}>
                <Zap size={18} color={Colors.primaryDark} strokeWidth={2.5} fill={Colors.primaryDark} />
                <Text style={styles.flashTitle}>Flash Sale</Text>
              </View>
              <View style={styles.flashTimerWrap}>
                <Clock size={12} color={Colors.white} strokeWidth={2} />
                <Text style={styles.flashTimerText}>{flashTimer}</Text>
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
                  <View style={{ width: 148 }}>
                    <ProductCard
                      product={item}
                      quantity={qty}
                      onPress={() => router.push(`/product/${item.id}` as any)}
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
          <SectionHeader
            title="Fresh Today"
            onSeeAll={() => router.push('/category/vegetables' as any)}
          />
          <FlatList
            data={FRESH_PRODUCTS.slice(0, 6)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={p => p.id}
            contentContainerStyle={{ gap: 10 }}
            renderItem={({ item }) => {
              const qty = getQty(item.id);
              return (
                <View style={{ width: 148 }}>
                  <ProductCard
                    product={item}
                    quantity={qty}
                    onPress={() => router.push(`/product/${item.id}` as any)}
                    onAdd={() => dispatch(addToCart(item))}
                    onIncrement={() => dispatch(incrementQuantity(item.id))}
                    onDecrement={() => dispatch(decrementQuantity(item.id))}
                  />
                </View>
              );
            }}
          />
        </View>

        {/* ── Top Picks (2-column grid) ── */}
        <View style={styles.section}>
          <SectionHeader title="Top Picks for You" onSeeAll={() => router.push('/(customer)/categories')} />
          <View style={styles.productGrid}>
            {FEATURED_PRODUCTS.slice(0, 6).map(item => {
              const qty = getQty(item.id);
              return (
                <View key={item.id} style={styles.productGridItem}>
                  <ProductCard
                    product={item}
                    quantity={qty}
                    onPress={() => router.push(`/product/${item.id}` as any)}
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
        <View style={{ height: 90 }} />
      </ScrollView>

      <ViewCartBar
        itemCount={totalItems}
        totalAmount={totalAmount}
        onPress={() => router.push('/(customer)/cart' as any)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 20 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  locationIconWrap: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  locationLabel: { fontFamily: 'BeVietnamPro-Regular', fontSize: 11, color: Colors.textMuted },
  locationAddress: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.textPrimary, maxWidth: 180 },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  notifDot: { position: 'absolute', top: 9, right: 9, width: 9, height: 9, borderRadius: 4.5, backgroundColor: Colors.error, borderWidth: 1.5, borderColor: Colors.white },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: Spacing.lg, marginTop: 14, marginBottom: 10,
    backgroundColor: Colors.white, borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingLeft: 16, paddingRight: 6, paddingVertical: 10,
  },
  searchPlaceholder: { fontFamily: 'BeVietnamPro-Regular', fontSize: 14, color: Colors.textPlaceholder, flex: 1 },
  searchDivider: { width: 1, height: 20, backgroundColor: Colors.borderLight, marginHorizontal: 4 },
  micBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },

  // ETA
  etaRow: { paddingHorizontal: Spacing.lg, marginBottom: 16 },
  etaBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, alignSelf: 'flex-start' },
  etaText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12, color: Colors.successDark },

  // Sections
  section: { paddingLeft: Spacing.lg, marginBottom: 28 },
  sectionNoPad: { paddingHorizontal: Spacing.lg, marginBottom: 24 },

  // Banner
  banner: { borderRadius: Radius.xxl, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 158 },
  bannerContent: { flex: 1 },
  bannerTagPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.22)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, marginBottom: 8 },
  bannerTag: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 11, color: Colors.white },
  bannerTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.white, marginBottom: 14, lineHeight: 26 },
  bannerBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.button, alignSelf: 'flex-start' },
  bannerBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.white },
  bannerEmoji: { fontSize: 64, marginLeft: 12 },
  bannerDots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
  bannerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.border },
  bannerDotActive: { width: 20, backgroundColor: Colors.primary, borderRadius: 3 },

  // Categories
  categoryCard: { width: 76, alignItems: 'center', gap: 4 },
  categoryIconBg: { width: 60, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  categoryEmoji: { fontSize: 28 },
  categoryName: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 11, color: Colors.textPrimary, textAlign: 'center' },
  categoryNameHindi: { fontFamily: 'BeVietnamPro-Regular', fontSize: 10, color: Colors.textMuted, textAlign: 'center' },

  // Flash Sale
  flashContainer: { borderRadius: Radius.xxl, padding: 16, paddingRight: 0, marginRight: Spacing.lg },
  flashHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingRight: Spacing.lg },
  flashTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  flashTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.primaryDark },
  flashTimerWrap: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: Colors.primaryDark, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.button },
  flashTimerText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.white, letterSpacing: 1.5 },

  // Product Grid
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingRight: Spacing.lg },
  productGridItem: { width: '50%' },
});
