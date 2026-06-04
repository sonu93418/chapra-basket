import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { CATEGORIES } from '../../src/data/mockData';

function getCategoryEmoji(slug: string): string {
  const map: Record<string, string> = {
    grocery: '🛒', fruits: '🍎', vegetables: '🥦', dairy: '🥛',
    medicines: '💊', snacks: '🍿', beverages: '☕', electronics: '💡',
    stationery: '📝', 'personal-care': '🧴',
  };
  return map[slug] || '📦';
}

export default function CategoriesScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>All Categories</Text>
        <Text style={styles.subtitle}>10 categories · 500+ products</Text>
      </View>

      <FlatList
        data={CATEGORIES}
        numColumns={2}
        keyExtractor={c => c.id}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={{ gap: 12 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, Shadows.sm]}
            onPress={() => router.push(`/category/${item.slug}`)}
            activeOpacity={0.87}
          >
            <View style={[styles.iconBg, { backgroundColor: item.color }]}>
              <Text style={styles.emoji}>{getCategoryEmoji(item.slug)}</Text>
            </View>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.nameHindi}>{item.nameHindi}</Text>
            <Text style={styles.count}>{item.productCount} products</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: { paddingHorizontal: Spacing.lg, paddingVertical: 20 },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 26, color: Colors.textPrimary, marginBottom: 4 },
  subtitle: { ...TextStyles.bodySm, color: Colors.textMuted },

  grid: { paddingHorizontal: Spacing.lg, paddingBottom: 24 },

  card: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    padding: 16,
    alignItems: 'center',
  },
  iconBg: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  emoji: { fontSize: 34 },
  name: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.textPrimary, textAlign: 'center', marginBottom: 2 },
  nameHindi: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted, textAlign: 'center', marginBottom: 6 },
  count: { ...TextStyles.micro, color: Colors.textMuted },
});
