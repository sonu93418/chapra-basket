import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';

const TRANSACTIONS = [
  { id: 't1', type: 'credit', desc: 'Delivery #9926 completed', amount: 145, time: '2:30 PM' },
  { id: 't2', type: 'credit', desc: 'Delivery #9924 completed', amount: 85, time: '1:10 PM' },
  { id: 't3', type: 'debit', desc: 'Weekly withdrawal to bank', amount: 5000, time: 'Yesterday' },
  { id: 't4', type: 'credit', desc: 'Delivery #9918 completed', amount: 170, time: 'Yesterday' },
];

export default function RiderWalletScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <LinearGradient colors={[Colors.primaryDark, Colors.primary]} style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>WALLET BALANCE</Text>
          <Text style={styles.balance}>₹2,450</Text>
          <Text style={styles.balanceSub}>Available for withdrawal</Text>
          <TouchableOpacity style={styles.withdrawBtn}>
            <Text style={styles.withdrawText}>Withdraw to Bank →</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Today', value: '₹1,240', emoji: '📅' },
            { label: 'This Week', value: '₹6,840', emoji: '📊' },
            { label: 'Pending', value: '₹0', emoji: '⏳' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={styles.statEmoji}>{s.emoji}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Transactions */}
        <View style={styles.txnSection}>
          <Text style={styles.txnTitle}>Recent Transactions</Text>
          {TRANSACTIONS.map(txn => (
            <View key={txn.id} style={styles.txnCard}>
              <View style={[styles.txnIcon, { backgroundColor: txn.type === 'credit' ? Colors.successContainer : Colors.errorContainer }]}>
                <Text>{txn.type === 'credit' ? '⬆️' : '⬇️'}</Text>
              </View>
              <View style={styles.txnInfo}>
                <Text style={styles.txnDesc}>{txn.desc}</Text>
                <Text style={styles.txnTime}>{txn.time}</Text>
              </View>
              <Text style={[styles.txnAmount, { color: txn.type === 'credit' ? Colors.successLight : Colors.error }]}>
                {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  balanceCard: { margin: Spacing.lg, borderRadius: Radius.xxl, padding: 28, alignItems: 'center', ...Shadows.primaryGlow },
  balanceLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 },
  balance: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 48, color: Colors.white, marginBottom: 4 },
  balanceSub: { ...TextStyles.bodySm, color: 'rgba(255,255,255,0.7)', marginBottom: 24 },
  withdrawBtn: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.button, paddingHorizontal: 24, paddingVertical: 12 },
  withdrawText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.white },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: Spacing.lg, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: Colors.dark.card, borderRadius: Radius.xl, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: Colors.dark.border },
  statEmoji: { fontSize: 22, marginBottom: 6 },
  statValue: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.white, marginBottom: 2 },
  statLabel: { ...TextStyles.micro, color: Colors.dark.textMuted },
  txnSection: { paddingHorizontal: Spacing.lg },
  txnTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.white, marginBottom: 14 },
  txnCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.dark.card, borderRadius: Radius.xl, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.dark.border },
  txnIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  txnInfo: { flex: 1 },
  txnDesc: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.white, marginBottom: 2 },
  txnTime: { ...TextStyles.micro, color: Colors.dark.textMuted },
  txnAmount: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16 },
});
