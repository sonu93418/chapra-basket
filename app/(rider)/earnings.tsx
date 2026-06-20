import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing } from '../../src/theme';
import { Star, TrendingUp, IndianRupee, ChevronRight, Award } from '../../src/components/ui/Icon';

const HISTORY = [
  { id: 'h1', orderNum: 'CB-2026-9926', store: 'Reliance Smart Supermarket', payout: 125, bonus: 20, time: '2:30 PM', date: 'Today', distance: '1.2 km', rating: 5 },
  { id: 'h2', orderNum: 'CB-2026-9924', store: 'Fresh Bazaar Store', payout: 85, bonus: 0, time: '1:10 PM', date: 'Today', distance: '2.8 km', rating: 4 },
  { id: 'h3', orderNum: 'CB-2026-9921', store: 'MedPlus Wellness Pharmacy', payout: 65, bonus: 0, time: '11:45 AM', date: 'Today', distance: '0.9 km', rating: 5 },
  { id: 'h4', orderNum: 'CB-2026-9918', store: 'Reliance Smart Supermarket', payout: 140, bonus: 30, time: '10:20 AM', date: 'Yesterday', distance: '1.5 km', rating: 5 },
];

export default function RiderEarningsScreen() {
  const totalToday = HISTORY.filter(h => h.date === 'Today').reduce((sum, h) => sum + h.payout + h.bonus, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Earnings Hub</Text>
        <Text style={styles.subtitle}>Track your performance and payouts in Chapra</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Earnings Metric Grid */}
        <View style={styles.summaryRow}>
          {[
            { label: 'Today', value: `₹${totalToday}`, active: true },
            { label: 'This Week', value: '₹6,840', active: false },
            { label: 'This Month', value: '₹28,500', active: false },
          ].map((s, i) => (
            <View key={i} style={[styles.summaryCard, s.active && styles.summaryCardActive]}>
              <Text style={[styles.summaryValue, s.active && styles.summaryValueActive]}>{s.value}</Text>
              <Text style={[styles.summaryLabel, s.active && styles.summaryLabelActive]}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Milestone Achievement Card */}
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneIconWrap}>
            <Award size={20} color={Colors.primary} strokeWidth={2.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.milestoneTitle}>Super Partner Bonus Tier</Text>
            <Text style={styles.milestoneSub}>Complete 5 more deliveries to unlock ₹300 bonus weekly incentives.</Text>
          </View>
        </View>

        {/* Order Completion List */}
        <Text style={styles.sectionTitle}>Delivery History</Text>
        <View style={styles.historyList}>
          {HISTORY.map(item => (
            <View key={item.id} style={styles.historyCard}>
              <View style={styles.historyLeft}>
                <Text style={styles.historyStore} numberOfLines={1}>{item.store}</Text>
                <Text style={styles.historyMeta}>#{item.orderNum.split('-')[2]} · {item.distance} · {item.time}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <Star size={12} color="#F59E0B" fill="#F59E0B" />
                  <Text style={{ fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12, color: Colors.dark.textMuted }}>
                    {item.rating}.0 Rating
                  </Text>
                </View>
              </View>
              <View style={styles.historyRight}>
                <Text style={styles.historyPayout}>₹{item.payout}</Text>
                {item.bonus > 0 && <Text style={styles.historyBonus}>+₹{item.bonus} bonus</Text>}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Since react-native does not export ScrollView in our type imports, let's make sure it is imported from react-native.
import { ScrollView as ScrollView } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: { paddingHorizontal: Spacing.lg, paddingVertical: 16, backgroundColor: '#0F121C', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.white },
  subtitle: { ...TextStyles.bodySm, color: Colors.dark.textMuted, marginTop: 2 },
  
  scrollContent: { padding: Spacing.lg, paddingBottom: 100 },

  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  summaryCard: { flex: 1, backgroundColor: Colors.dark.surface, borderRadius: Radius.xl, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border },
  summaryCardActive: { backgroundColor: Colors.primary + '18', borderColor: Colors.primary + '40' },
  summaryValue: { fontFamily: 'BeVietnamPro-Bold', fontSize: 17, color: Colors.white, marginBottom: 2 },
  summaryValueActive: { color: Colors.primary },
  summaryLabel: { ...TextStyles.micro, color: Colors.dark.textMuted },
  summaryLabelActive: { color: Colors.primary },
  
  milestoneCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.02)', borderLeftWidth: 3, borderLeftColor: Colors.primary, borderRadius: Radius.xl, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)' },
  milestoneIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  milestoneTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.white },
  milestoneSub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 11, color: Colors.dark.textMuted, marginTop: 2 },

  sectionTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.white, marginBottom: 12 },
  historyList: { gap: 10 },
  historyCard: {
    backgroundColor: Colors.dark.card, borderRadius: Radius.xl, padding: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.dark.border,
  },
  historyLeft: { flex: 1 },
  historyStore: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.white, marginBottom: 2 },
  historyMeta: { ...TextStyles.bodySm, color: Colors.dark.textMuted, marginBottom: 4 },
  historyRight: { alignItems: 'flex-end' },
  historyPayout: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.primary },
  historyBonus: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 11, color: Colors.successLight },
});
