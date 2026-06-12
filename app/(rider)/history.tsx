import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing } from '../../src/theme';
import { Star } from '../../src/components/ui/Icon';

const HISTORY = [
  { id: 'h1', orderNum: '9926', store: 'Blink Kitchen', payout: 125, bonus: 20, time: '2:30 PM', date: 'Today', distance: '1.2 km', rating: 5 },
  { id: 'h2', orderNum: '9924', store: 'Fresh Bazaar', payout: 85, bonus: 0, time: '1:10 PM', date: 'Today', distance: '2.8 km', rating: 4 },
  { id: 'h3', orderNum: '9921', store: 'MedPlus Pharmacy', payout: 65, bonus: 0, time: '11:45 AM', date: 'Today', distance: '0.9 km', rating: 5 },
  { id: 'h4', orderNum: '9918', store: 'Blink Kitchen', payout: 140, bonus: 30, time: '10:20 AM', date: 'Today', distance: '1.5 km', rating: 5 },
];

export default function RiderHistoryScreen() {
  const totalToday = HISTORY.reduce((sum, h) => sum + h.payout + h.bonus, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Earnings History</Text>
        <Text style={styles.subtitle}>Today · ₹{totalToday} total</Text>
      </View>

      <View style={styles.summaryRow}>
        {[
          { label: 'Today', value: `₹${totalToday}` },
          { label: 'This Week', value: '₹6,840' },
          { label: 'This Month', value: '₹28,500' },
        ].map((s, i) => (
          <View key={i} style={[styles.summaryCard, i === 1 && styles.summaryCardActive]}>
            <Text style={[styles.summaryValue, i === 1 && styles.summaryValueActive]}>{s.value}</Text>
            <Text style={[styles.summaryLabel, i === 1 && styles.summaryLabelActive]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <FlatList
        data={HISTORY}
        keyExtractor={h => h.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={styles.historyCard}>
            <View style={styles.historyLeft}>
              <Text style={styles.historyStore}>{item.store}</Text>
              <Text style={styles.historyMeta}>#{item.orderNum} · {item.distance} · {item.time}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <Text style={{ fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12, color: Colors.dark.textMuted }}>
                  {item.rating}.0
                </Text>
              </View>
            </View>
            <View style={styles.historyRight}>
              <Text style={styles.historyPayout}>₹{item.payout}</Text>
              {item.bonus > 0 && <Text style={styles.historyBonus}>+₹{item.bonus} bonus</Text>}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: { paddingHorizontal: Spacing.lg, paddingVertical: 20 },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 24, color: Colors.white },
  subtitle: { ...TextStyles.bodySm, color: Colors.dark.textMuted, marginTop: 2 },
  summaryRow: { flexDirection: 'row', gap: 10, paddingHorizontal: Spacing.lg, marginBottom: 20 },
  summaryCard: { flex: 1, backgroundColor: Colors.dark.surface, borderRadius: Radius.xl, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border },
  summaryCardActive: { backgroundColor: Colors.primary + '20', borderColor: Colors.primary + '40' },
  summaryValue: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.white, marginBottom: 2 },
  summaryValueActive: { color: Colors.primary },
  summaryLabel: { ...TextStyles.micro, color: Colors.dark.textMuted },
  summaryLabelActive: { color: Colors.primary },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  historyCard: {
    backgroundColor: Colors.dark.card, borderRadius: Radius.xl, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.dark.border,
  },
  historyLeft: { flex: 1 },
  historyStore: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 15, color: Colors.white, marginBottom: 3 },
  historyMeta: { ...TextStyles.bodySm, color: Colors.dark.textMuted, marginBottom: 4 },
  historyRating: { fontSize: 13 },
  historyRight: { alignItems: 'flex-end' },
  historyPayout: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.primary },
  historyBonus: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12, color: Colors.successLight },
});
