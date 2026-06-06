import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TextInput, FlatList,
  TouchableOpacity, Animated, Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { ProductCard } from '../../src/components/product/ProductCard';
import { ViewCartBar } from '../../src/components/cart/ViewCartBar';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppDispatch';
import { addToCart, incrementQuantity, decrementQuantity } from '../../src/features/cart/cartSlice';
import { PRODUCTS } from '../../src/data/mockData';
import {
  ArrowLeft, Search, X, TrendingUp, Clock,
  SlidersHorizontal, Flame, ChevronRight,
} from '../../src/components/ui/Icon';

// ─── Static Data ──────────────────────────────────────────────────────────────
const RECENT_SEARCHES = ['Amul Milk', 'Aashirvaad Atta', 'Tomatoes', 'Banana', 'Dettol'];

const TRENDING = [
  { label: 'Mango Season', gradient: ['#FF8C00', '#FF6B00'] as [string, string] },
  { label: 'Flash Sale Atta', gradient: ['#7C3AED', '#A855F7'] as [string, string] },
  { label: 'Fresh Veggies', gradient: ['#059669', '#10B981'] as [string, string] },
  { label: 'Paracetamol', gradient: ['#0284C7', '#38BDF8'] as [string, string] },
];

const FILTER_TAGS = ['All', 'Grocery', 'Fruits', 'Dairy', 'Snacks', 'Beverages'];

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const inputRef = useRef<TextInput>(null);
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(s => s.cart.items);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const getQty = (id: string) => cartItems.find(i => i.product.id === id)?.quantity ?? 0;

  const results = query.length >= 2
    ? PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(query.toLowerCase())))
      )
    : [];

  const clearQuery = () => { setQuery(''); inputRef.current?.focus(); };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* ── Search Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={22} color={Colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <View style={[styles.searchBar, Shadows.sm]}>
          <Search size={17} color={Colors.textMuted} strokeWidth={2} />
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Search for atta, milk, sabzi..."
            placeholderTextColor={Colors.textPlaceholder}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
            onSubmitEditing={Keyboard.dismiss}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={clearQuery} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <View style={styles.clearBtn}>
                <X size={12} color={Colors.white} strokeWidth={2.5} />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* ── Filter Chips (show when results exist) ── */}
      {query.length >= 2 && results.length > 0 && (
        <View style={styles.filterRow}>
          <FlatList
            data={FILTER_TAGS}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={f => f}
            contentContainerStyle={{ gap: 8, paddingHorizontal: Spacing.lg }}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.filterChip, item === activeFilter && styles.filterChipActive]}
                onPress={() => setActiveFilter(item)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, item === activeFilter && styles.filterTextActive]}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* ── Content ── */}
      {query.length < 2 ? (
        // Discovery State
        <FlatList
          data={[]}
          keyExtractor={() => ''}
          renderItem={() => null}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.discovery}>
              {/* Recent Searches */}
              <View style={styles.discoverySection}>
                <View style={styles.sectionRow}>
                  <Clock size={15} color={Colors.textMuted} strokeWidth={2} />
                  <Text style={styles.sectionTitle}>Recent Searches</Text>
                </View>
                <View style={styles.recentChips}>
                  {RECENT_SEARCHES.map((item, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.recentChip}
                      onPress={() => setQuery(item)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.recentChipText}>{item}</Text>
                      <ChevronRight size={12} color={Colors.textMuted} strokeWidth={2} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Trending */}
              <View style={styles.discoverySection}>
                <View style={styles.sectionRow}>
                  <TrendingUp size={15} color={Colors.textMuted} strokeWidth={2} />
                  <Text style={styles.sectionTitle}>Trending Now</Text>
                </View>
                <View style={styles.trendingGrid}>
                  {TRENDING.map((item, i) => (
                    <TouchableOpacity
                      key={i}
                      style={styles.trendingCard}
                      onPress={() => setQuery(item.label)}
                      activeOpacity={0.85}
                    >
                      <LinearGradient
                        colors={item.gradient}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                        style={styles.trendingGradient}
                      >
                        <Flame size={16} color="rgba(255,255,255,0.8)" strokeWidth={2} />
                        <Text style={styles.trendingLabel}>{item.label}</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          }
        />
      ) : results.length === 0 ? (
        // No Results
        <View style={styles.noResults}>
          <View style={styles.noResultsIcon}>
            <Search size={36} color={Colors.textMuted} strokeWidth={1.5} />
          </View>
          <Text style={styles.noResultsTitle}>No results for "{query}"</Text>
          <Text style={styles.noResultsSub}>Try a different keyword like "atta", "milk", or "sabzi"</Text>
          <TouchableOpacity style={styles.clearSearchBtn} onPress={clearQuery}>
            <Text style={styles.clearSearchText}>Clear Search</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Results Grid
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={p => p.id}
          contentContainerStyle={styles.resultsGrid}
          columnWrapperStyle={{ gap: 8 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                <Text style={{ color: Colors.primary, fontFamily: 'BeVietnamPro-Bold' }}>{results.length}</Text>
                {' '}results for "{query}"
              </Text>
              <TouchableOpacity style={styles.sortBtn} activeOpacity={0.8}>
                <SlidersHorizontal size={14} color={Colors.textSecondary} strokeWidth={2} />
                <Text style={styles.sortText}>Filter</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => {
            const qty = getQty(item.id);
            return (
              <View style={styles.gridItem}>
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
      )}

      <ViewCartBar itemCount={totalItems} totalAmount={totalAmount} onPress={() => router.push('/cart' as any)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: Spacing.lg, paddingVertical: 12,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.background, borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  input: { flex: 1, fontFamily: 'BeVietnamPro-Regular', fontSize: 15, color: Colors.textPrimary, padding: 0 },
  clearBtn: { width: 20, height: 20, borderRadius: 10, backgroundColor: Colors.textMuted, alignItems: 'center', justifyContent: 'center' },

  // Filters
  filterRow: { paddingVertical: 10, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radius.full, backgroundColor: Colors.surfaceVariant },
  filterChipActive: { backgroundColor: Colors.primary },
  filterText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.textSecondary },
  filterTextActive: { color: Colors.white },

  // Discovery
  discovery: { padding: Spacing.lg },
  discoverySection: { marginBottom: 28 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 14 },
  sectionTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary },

  recentChips: { gap: 8 },
  recentChip: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 11, paddingHorizontal: 14,
    backgroundColor: Colors.white, borderRadius: Radius.xl,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  recentChipText: { fontFamily: 'BeVietnamPro-Regular', fontSize: 14, color: Colors.textPrimary },

  trendingGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  trendingCard: { width: '47%', borderRadius: Radius.xl, overflow: 'hidden' },
  trendingGradient: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14 },
  trendingLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.white, flex: 1 },

  // No Results
  noResults: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  noResultsIcon: { width: 90, height: 90, borderRadius: 45, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  noResultsTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.textPrimary, marginBottom: 8, textAlign: 'center' },
  noResultsSub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  clearSearchBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: Radius.button, borderWidth: 1.5, borderColor: Colors.primary },
  clearSearchText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.primary },

  // Results
  resultsGrid: { paddingHorizontal: Spacing.lg, paddingBottom: 110 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  resultsCount: { fontFamily: 'BeVietnamPro-Regular', fontSize: 13, color: Colors.textMuted },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: Colors.white, borderRadius: Radius.button, borderWidth: 1, borderColor: Colors.border },
  sortText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.textSecondary },
  gridItem: { flex: 1 },
});
