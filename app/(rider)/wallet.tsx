import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import {
  ArrowLeft,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  TrendingUp,
  Clock,
  ChevronRight,
} from '../../src/components/ui/Icon';

const { width } = Dimensions.get('window');

const TRANSACTIONS = [
  { id: 't1', type: 'credit', desc: 'Delivery #9926 completed', amount: 145, time: '2:30 PM', date: 'Today' },
  { id: 't2', type: 'credit', desc: 'Delivery #9924 completed', amount: 85, time: '1:10 PM', date: 'Today' },
  { id: 't3', type: 'debit', desc: 'Weekly withdrawal to bank', amount: 5000, time: '10:45 AM', date: 'Yesterday' },
  { id: 't4', type: 'credit', desc: 'Delivery #9918 completed', amount: 170, time: '6:15 PM', date: 'Yesterday' },
];

export default function RiderWalletScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={22} color={Colors.white} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rider Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Balance Card */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.balanceCard, Shadows.md]}
        >
          <View style={styles.balanceHeader}>
            <View style={styles.walletIconWrap}>
              <Wallet size={20} color={Colors.white} strokeWidth={2.5} />
            </View>
            <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
          </View>
          <Text style={styles.balance}>₹2,450</Text>
          <Text style={styles.balanceSub}>Cleared and ready to withdraw</Text>

          <TouchableOpacity style={styles.withdrawBtn} activeOpacity={0.88}>
            <Text style={styles.withdrawText}>Withdraw to Bank Account</Text>
            <ChevronRight size={16} color={Colors.primary} strokeWidth={3} />
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Stats Grid */}
        <View style={styles.statsRow}>
          {[
            { label: 'Today', value: '₹1,240', Icon: Calendar, iconColor: '#00E676' },
            { label: 'This Week', value: '₹6,840', Icon: TrendingUp, iconColor: Colors.primary },
            { label: 'Pending', value: '₹0', Icon: Clock, iconColor: '#FFD600' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <View style={styles.statIconHeader}>
                <s.Icon size={16} color={s.iconColor} strokeWidth={2.5} />
              </View>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Transactions Section */}
        <View style={styles.txnSection}>
          <View style={styles.txnHeaderRow}>
            <Text style={styles.txnTitle}>Transaction History</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.viewAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {TRANSACTIONS.map(txn => {
            const isCredit = txn.type === 'credit';
            return (
              <View key={txn.id} style={styles.txnCard}>
                <View
                  style={[
                    styles.txnIconWrap,
                    { backgroundColor: isCredit ? 'rgba(0, 230, 118, 0.1)' : 'rgba(255, 23, 68, 0.1)' }
                  ]}
                >
                  {isCredit ? (
                    <ArrowUpRight size={18} color="#00E676" strokeWidth={2.5} />
                  ) : (
                    <ArrowDownLeft size={18} color="#FF1744" strokeWidth={2.5} />
                  )}
                </View>
                <View style={styles.txnInfo}>
                  <Text style={styles.txnDesc}>{txn.desc}</Text>
                  <Text style={styles.txnTime}>{txn.date} · {txn.time}</Text>
                </View>
                <Text style={[styles.txnAmount, { color: isCredit ? '#00E676' : '#FF1744' }]}>
                  {isCredit ? '+' : '-'}₹{txn.amount}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    backgroundColor: '#0F121C',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 18,
    color: Colors.white,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  balanceCard: {
    borderRadius: Radius.xxl,
    padding: 24,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  balanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  walletIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceLabel: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1.5,
  },
  balance: {
    fontFamily: 'BeVietnamPro-ExtraBold',
    fontSize: 42,
    color: Colors.white,
    marginBottom: 4,
  },
  balanceSub: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 24,
  },
  withdrawBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.white,
    borderRadius: Radius.xl,
    paddingVertical: 14,
    ...Shadows.sm,
  },
  withdrawText: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 14,
    color: Colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: Radius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statIconHeader: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 16,
    color: Colors.white,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'BeVietnamPro-Medium',
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
  txnSection: {},
  txnHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  txnTitle: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 18,
    color: Colors.white,
  },
  viewAllText: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 13,
    color: Colors.primary,
  },
  txnCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: Radius.xl,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  txnIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txnInfo: {
    flex: 1,
  },
  txnDesc: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 14,
    color: Colors.white,
    marginBottom: 3,
  },
  txnTime: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 11,
    color: Colors.dark.textMuted,
  },
  txnAmount: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 16,
  },
});
