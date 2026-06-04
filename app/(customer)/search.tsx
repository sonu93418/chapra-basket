import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { ProductCard } from '../../src/components/product/ProductCard';
import { ViewCartBar } from '../../src/components/cart/ViewCartBar';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppDispatch';
import { addToCart, incrementQuantity, decrementQuantity } from '../../src/features/cart/cartSlice';
import { PRODUCTS } from '../../src/data/mockData';

const RECENT = ['Amul Milk', 'Aashirvaad Atta', 'Tomatoes', 'Banana', 'Dettol'];
const TRENDING = ['🔥 Mango Season', '⚡ Flash Sale Atta', '🌿 Fresh Veggies', '💊 Paracetamol'];

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(s => s.cart.items);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = cartItems.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  const results = query.length >= 2
    ? PRODUCTS.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.tags && p.tags.some(t => t.toLowerCase().includes(query.toLowerCase())))
      )
    : [];

  const getQty = (id: string) => cartItems.find(i => i.product.id === id)?.quantity ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Search bar */}
      <View style={styles.searchRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={[styles.searchBar, Shadows.sm]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.input}
            placeholder="Search for atta, milk, sabzi..."
            placeholderTextColor={Colors.textPlaceholder}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {query.length < 2 ? (
        <FlatList
          data={[]}
          ListHeaderComponent={
            <View style={styles.emptyState}>
              <View style={styles.recentSection}>
                <Text style={styles.sectionTitle}>🕐 Recent Searches</Text>
                <View style={styles.chips}>
                  {RECENT.map((item, i) => (
                    <TouchableOpacity key={i} style={styles.chip} onPress={() => setQuery(item)}>
                      <Text style={styles.chipText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.recentSection}>
                <Text style={styles.sectionTitle}>📈 Trending Now</Text>
                {TRENDING.map((item, i) => (
                  <TouchableOpacity key={i} style={styles.trendingItem} onPress={() => setQuery(item.replace(/[^a-zA-Z ]/g, '').trim())}>
                    <Text style={styles.trendingText}>{item}</Text>
                    <Text style={styles.trendingArrow}>→</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          }
          renderItem={() => null}
        />
      ) : results.length === 0 ? (
        <View style={styles.noResults}>
          <Text style={styles.noResultsEmoji}>🔎</Text>
          <Text style={styles.noResultsTitle}>No results for "{query}"</Text>
          <Text style={styles.noResultsSub}>Try searching for atta, milk, banana...</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          numColumns={2}
          keyExtractor={p => p.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: 4 }}
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
          ListHeaderComponent={
            <Text style={styles.resultCount}>{results.length} results for "{query}"</Text>
          }
          renderItem={({ item }) => {
            const qty = getQty(item.id);
            return (
              <View style={styles.gridItem}>
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
      )}

      <ViewCartBar itemCount={totalItems} totalAmount={totalAmount} onPress={() => router.push('/cart')} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: 12, gap: 10 },
  backBtn: { padding: 4 },
  backIcon: { fontSize: 22, color: Colors.primary, fontWeight: '700' },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.white, borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Colors.border,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  searchIcon: { fontSize: 16 },
  input: { flex: 1, fontFamily: 'BeVietnamPro-Regular', fontSize: 15, color: Colors.textPrimary },
  clearIcon: { fontSize: 14, color: Colors.textMuted, paddingHorizontal: 4 },

  emptyState: { padding: Spacing.lg },
  recentSection: { marginBottom: 28 },
  sectionTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    backgroundColor: Colors.surfaceVariant, borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  chipText: { ...TextStyles.bodySm, color: Colors.textSecondary },
  trendingItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  trendingText: { ...TextStyles.bodyLg, color: Colors.textPrimary },
  trendingArrow: { color: Colors.textMuted },

  noResults: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  noResultsEmoji: { fontSize: 60, marginBottom: 16 },
  noResultsTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.textPrimary, marginBottom: 8 },
  noResultsSub: { ...TextStyles.bodyLg, color: Colors.textMuted, textAlign: 'center' },

  resultCount: { ...TextStyles.labelBold, color: Colors.textMuted, paddingHorizontal: Spacing.lg, paddingVertical: 12 },
  grid: { paddingHorizontal: Spacing.lg - 4, paddingBottom: 100 },
  gridItem: { flex: 1 },
});
