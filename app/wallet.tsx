import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../src/theme';
import { useGetWalletDataQuery, useTopupWalletMutation } from '../src/api/walletApi';
import { ArrowLeft, TrendingUp, TrendingDown, CreditCard, Zap, Gift, Lock, RotateCcw } from '../src/components/ui/Icon';

const QUICK_AMOUNTS = [50, 100, 200, 500];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${Math.max(mins, 0)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function WalletScreen() {
  const { data: wallet, isLoading, error } = useGetWalletDataQuery();
  const [topupCall, { isLoading: isTopupLoading }] = useTopupWalletMutation();
  const [selectedAmount, setSelectedAmount] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');

  const balance = wallet?.balance ?? 0;
  const transactions = wallet?.transactions ?? [];
  const credits = transactions.filter((t: any) => t.type === 'credit').reduce((s: number, t: any) => s + t.amount, 0);
  const debits = transactions.filter((t: any) => t.type === 'debit').reduce((s: number, t: any) => s + t.amount, 0);

  const handleAddMoney = async () => {
    const finalAmt = customAmount ? Number(customAmount) : selectedAmount;
    if (isNaN(finalAmt) || finalAmt <= 0) {
      Alert.alert('Validation Error', 'Please select or enter a valid amount to add.');
      return;
    }

    try {
      await topupCall({ amount: finalAmt }).unwrap();
      Alert.alert('Top-up Success', `₹${finalAmt} added successfully to your Chapra Basket Wallet!`);
      setCustomAmount('');
    } catch (err: any) {
      Alert.alert('Top-up Failed', err?.data?.error || 'Failed to add money. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={18} color={Colors.white} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chapra Wallet</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Balance Card */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark, '#1a3a6e']}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          {/* Decorative circles */}
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />

          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>₹{balance}</Text>

          <View style={styles.balanceStats}>
            <View style={styles.balanceStat}>
              <TrendingUp size={22} color={Colors.white} />
              <View style={{ marginLeft: 4 }}>
                <Text style={styles.balanceStatLabel}>Total Credited</Text>
                <Text style={styles.balanceStatValue}>₹{credits}</Text>
              </View>
            </View>
            <View style={styles.balanceStatDivider} />
            <View style={styles.balanceStat}>
              <TrendingDown size={22} color={Colors.white} />
              <View style={{ marginLeft: 4 }}>
                <Text style={styles.balanceStatLabel}>Total Spent</Text>
                <Text style={styles.balanceStatValue}>₹{debits}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Add Money */}
        <View style={[styles.section, Shadows.sm]}>
          <Text style={styles.sectionTitle}>Add Money</Text>
          <View style={styles.quickAmounts}>
            {QUICK_AMOUNTS.map(amt => (
              <TouchableOpacity
                key={amt}
                style={[
                  styles.amountChip,
                  selectedAmount === amt && !customAmount && { borderColor: Colors.primary, backgroundColor: Colors.primaryContainer }
                ]}
                onPress={() => { setSelectedAmount(amt); setCustomAmount(''); }}
                activeOpacity={0.8}
              >
                <Text style={[styles.amountChipText, selectedAmount === amt && !customAmount && { color: Colors.primary }]}>+₹{amt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={styles.customAmountInput}
            placeholder="Or enter custom amount (e.g. 250)"
            placeholderTextColor={Colors.textPlaceholder}
            keyboardType="number-pad"
            value={customAmount}
            onChangeText={setCustomAmount}
          />

          <TouchableOpacity style={styles.addMoneyBtn} onPress={handleAddMoney} disabled={isTopupLoading} activeOpacity={0.85}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={[styles.addMoneyGradient, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <CreditCard size={18} color={Colors.white} />
              <Text style={styles.addMoneyText}>{isTopupLoading ? 'Adding Balance...' : 'Add Money'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Benefits */}
        <View style={[styles.section, Shadows.sm]}>
          <Text style={styles.sectionTitle}>Wallet Perks</Text>
          <View style={styles.perksGrid}>
            {[
              { Icon: Zap, title: 'Instant Checkout', sub: 'No OTP needed', color: Colors.warning ?? '#F59E0B' },
              { Icon: Gift, title: 'Earn Cashback', sub: 'On every order', color: Colors.primary },
              { Icon: Lock, title: '100% Secure', sub: 'Your money is safe', color: Colors.successDark },
              { Icon: RotateCcw, title: 'Easy Refunds', sub: 'Back in minutes', color: Colors.success },
            ].map((p, i) => {
              const IconComponent = p.Icon;
              return (
                <View key={i} style={styles.perkCard}>
                  <IconComponent size={24} color={p.color} style={{ marginBottom: 4 }} />
                  <Text style={styles.perkTitle}>{p.title}</Text>
                  <Text style={styles.perkSub}>{p.sub}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Transactions */}
        <View style={[styles.section, Shadows.sm]}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          {transactions.length === 0 ? (
            <Text style={{ fontFamily: 'BeVietnamPro-Regular', fontSize: 13, color: Colors.textMuted, textAlign: 'center', paddingVertical: 14 }}>No transactions yet.</Text>
          ) : (
            transactions.map((txn, i) => (
              <View key={txn.id} style={[styles.txnRow, i < transactions.length - 1 && styles.txnBorder]}>
                <View style={[
                  styles.txnIcon,
                  { backgroundColor: txn.type === 'credit' ? Colors.successContainer : '#FFF1F0' }
                ]}>
                  {txn.type === 'credit' ? (
                    <TrendingUp size={20} color={Colors.success} />
                  ) : (
                    <TrendingDown size={20} color={Colors.error} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.txnDesc}>{txn.description}</Text>
                  <Text style={styles.txnTime}>{timeAgo(txn.createdAt)}</Text>
                </View>
                <Text style={[
                  styles.txnAmount,
                  { color: txn.type === 'credit' ? Colors.success : Colors.error }
                ]}>
                  {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                </Text>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  customAmountInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    padding: 12,
    marginBottom: 14,
    fontFamily: 'BeVietnamPro-Medium',
    color: Colors.textPrimary,
  },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 20, color: Colors.white },
  headerTitle: { flex: 1, fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.white, textAlign: 'center' },

  scroll: { padding: Spacing.md, gap: 14 },

  balanceCard: {
    borderRadius: Radius.xxl, padding: 24,
    overflow: 'hidden', position: 'relative',
  },
  decorCircle1: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -40,
  },
  decorCircle2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: -30, left: 20,
  },
  balanceLabel: { fontFamily: 'BeVietnamPro-Regular', fontSize: 14, color: 'rgba(255,255,255,0.7)', marginBottom: 8 },
  balanceAmount: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 48, color: Colors.white, marginBottom: 24 },
  balanceStats: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.xl, padding: 14,
  },
  balanceStat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  balanceStatDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 12 },
  balanceStatIcon: { fontSize: 22 },
  balanceStatLabel: { fontFamily: 'BeVietnamPro-Regular', fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  balanceStatValue: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.white },

  section: {
    backgroundColor: Colors.white, borderRadius: Radius.xxl,
    padding: Spacing.lg,
  },
  sectionTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary, marginBottom: 14 },

  quickAmounts: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  amountChip: {
    flex: 1, paddingVertical: 10,
    backgroundColor: Colors.primaryContainer, borderRadius: Radius.xl,
    alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.primaryLighter,
  },
  amountChipText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.primary },

  addMoneyBtn: { borderRadius: Radius.button, overflow: 'hidden' },
  addMoneyGradient: { paddingVertical: 16, alignItems: 'center' },
  addMoneyText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.white },

  perksGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  perkCard: {
    width: '47%', backgroundColor: Colors.background,
    borderRadius: Radius.xl, padding: 14, gap: 4,
  },
  perkIcon: { fontSize: 28, marginBottom: 4 },
  perkTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.textPrimary },
  perkSub: { ...TextStyles.micro, color: Colors.textMuted },

  txnRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 12 },
  txnBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  txnIcon: {
    width: 46, height: 46, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
  },
  txnIconText: { fontSize: 22 },
  txnDesc: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.textPrimary, marginBottom: 2 },
  txnTime: { ...TextStyles.micro, color: Colors.textMuted },
  txnAmount: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 17 },
});
