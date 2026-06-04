import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { ProductCard } from '../../src/components/product/ProductCard';
import { ViewCartBar } from '../../src/components/cart/ViewCartBar';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppDispatch';
import { addToCart, incrementQuantity, decrementQuantity } from '../../src/features/cart/cartSlice';
import { CATEGORIES, PRODUCTS } from '../../src/data/mockData';

const SORT_OPTIONS = ['Popular', 'Price: Low-High', 'Price: High-Low', 'Discount'];
const FILTER_OPTIONS = ['All', 'Fresh', 'Discounted', 'In Stock'];

export default function CategoryScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(s => s.cart.items);
  const [sortBy, setSortBy] = useState('Popular');
  const [filterBy, setFilterBy] = useState('All');

  const category = CATEGORIES.find(c => c.slug === slug);

  const products = useMemo(() => {
    let list = category
      ? PRODUCTS.filter(p => p.categoryId === category.id)
      : PRODUCTS;

    if (filterBy === 'Fresh') list = list.filter(p => p.isFresh);
    if (filterBy === 'Discounted') list = list.filter(p => (p.discountPercent ?? 0) > 0);
    if (filterBy === 'In Stock') list = list.filter(p => p.stockQuantity > 0);

    if (sortBy === 'Price: Low-High') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'Price: High-Low') list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'Discount') list = [...list].sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0));

    return list;
  }, [slug, category, sortBy, filterBy]);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const getQty = (id: string) => cartItems.find(i => i.product.id === id)?.quantity ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{category?.name ?? slug}</Text>
          {category?.nameHindi && <Text style={styles.titleHindi}>{category.nameHindi}</Text>}
        </View>
        <Text style={styles.count}>{products.length} items</Text>
      </View>

      {/* Sort Tabs */}
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.sortChip, sortBy === opt && styles.sortChipActive]}
            onPress={() => setSortBy(opt)}
          >
            <Text style={[styles.sortText, sortBy === opt && styles.sortTextActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {FILTER_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt}
            style={[styles.filterChip, filterBy === opt && styles.filterChipActive]}
            onPress={() => setFilterBy(opt)}
          >
            <Text style={[styles.filterText, filterBy === opt && styles.filterTextActive]}>
              {opt}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Products Grid */}
      <FlatList
        data={products}
        keyExtractor={p => p.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: 0 }}
        ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <ProductCard
              product={item}
              quantity={getQty(item.id)}
              onPress={() => router.push(`/product/${item.id}`)}
              onAdd={() => dispatch(addToCart(item))}
              onIncrement={() => dispatch(incrementQuantity(item.id))}
              onDecrement={() => dispatch(decrementQuantity(item.id))}
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySub}>Try changing filters</Text>
          </View>
        }
      />

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

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 12,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnIcon: { fontSize: 20, color: Colors.textPrimary },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.textPrimary },
  titleHindi: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted },
  count: { ...TextStyles.bodySm, color: Colors.textMuted },

  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sortChip: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.surfaceVariant,
  },
  sortChipActive: { backgroundColor: Colors.primary },
  sortText: { ...TextStyles.bodySm, color: Colors.textSecondary, fontFamily: 'BeVietnamPro-SemiBold' },
  sortTextActive: { color: Colors.white },

  filterRow: {
    flexDirection: 'row', paddingHorizontal: Spacing.md,
    paddingVertical: 8, gap: 8,
    backgroundColor: Colors.background,
  },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Colors.border,
    backgroundColor: Colors.white,
  },
  filterChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer },
  filterText: { ...TextStyles.bodySm, color: Colors.textMuted },
  filterTextActive: { color: Colors.primary, fontFamily: 'BeVietnamPro-Bold' },

  grid: { paddingHorizontal: Spacing.md, paddingTop: 8, paddingBottom: 100 },
  gridItem: { width: '50%', padding: 4 },

  empty: { alignItems: 'center', paddingVertical: 60, gap: 10 },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.textPrimary },
  emptySub: { ...TextStyles.bodySm, color: Colors.textMuted },
});
