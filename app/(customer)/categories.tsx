import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { CATEGORIES } from '../../src/data/mockData';
import { Search, ChevronRight } from '../../src/components/ui/Icon';

// ─── Category gradient pairs ─────────────────────────────────────────────────
const CAT_GRADIENTS: Record<string, [string, string]> = {
  grocery:        ['#FFF3E0', '#FFCC80'],
  fruits:         ['#FCE4EC', '#F48FB1'],
  vegetables:     ['#E8F5E9', '#A5D6A7'],
  dairy:          ['#E3F2FD', '#90CAF9'],
  medicines:      ['#EDE7F6', '#CE93D8'],
  snacks:         ['#FFF8E1', '#FFD54F'],
  beverages:      ['#E0F7FA', '#80DEEA'],
  electronics:    ['#F3E5F5', '#CE93D8'],
  stationery:     ['#E8EAF6', '#9FA8DA'],
  'personal-care':['#FBE9E7', '#FFAB91'],
};

const CAT_EMOJIS: Record<string, string> = {
  grocery: '🛒', fruits: '🍎', vegetables: '🥦', dairy: '🥛',
  medicines: '💊', snacks: '🍿', beverages: '☕', electronics: '💡',
  stationery: '📝', 'personal-care': '🧴',
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CategoriesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>All Categories</Text>
          <Text style={styles.subtitle}>10 categories · 500+ products</Text>
        </View>
        <TouchableOpacity
          style={styles.searchBtn}
          onPress={() => router.push('/(customer)/search')}
          activeOpacity={0.85}
        >
          <Search size={18} color={Colors.textSecondary} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={CATEGORIES}
        numColumns={2}
        keyExtractor={c => c.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: 14 }}
        ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const [from, to] = CAT_GRADIENTS[item.slug] ?? ['#F5F5F5', '#E0E0E0'];
          return (
            <TouchableOpacity
              style={[styles.card, Shadows.sm]}
              onPress={() => router.push(`/category/${item.slug}` as any)}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[from, to]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.iconBg}
              >
                <Text style={styles.emoji}>{CAT_EMOJIS[item.slug] || '📦'}</Text>
              </LinearGradient>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.nameHindi}>{item.nameHindi}</Text>
              <View style={styles.countRow}>
                <Text style={styles.count}>{item.productCount} items</Text>
                <ChevronRight size={12} color={Colors.textMuted} strokeWidth={2} />
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingTop: 8, paddingBottom: 16,
  },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 26, color: Colors.textPrimary, marginBottom: 2 },
  subtitle: { fontFamily: 'BeVietnamPro-Regular', fontSize: 13, color: Colors.textMuted },
  searchBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.white, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },

  grid: { paddingHorizontal: Spacing.lg, paddingBottom: 32 },

  card: {
    flex: 1, backgroundColor: Colors.white,
    borderRadius: Radius.xxl, padding: 16, alignItems: 'center',
  },
  iconBg: { width: 76, height: 76, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  emoji: { fontSize: 36 },
  name: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.textPrimary, textAlign: 'center', marginBottom: 2 },
  nameHindi: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginBottom: 8 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  count: { fontFamily: 'BeVietnamPro-Regular', fontSize: 11, color: Colors.textMuted },
});
