import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../src/theme';
import { ArrowLeft, Gift, Share2, Smartphone, ShoppingCart, Banknote } from '../src/components/ui/Icon';

const REFERRAL_CODE = 'ANUP2024';
const REFERRED_FRIENDS = [
  { name: 'Priya Singh', date: '3 days ago', earned: 50, status: 'credited' },
  { name: 'Ramesh Kumar', date: '1 week ago', earned: 50, status: 'credited' },
  { name: 'Sunita Devi', date: '2 weeks ago', earned: 50, status: 'credited' },
];

export default function ReferralScreen() {
  const totalEarned = REFERRED_FRIENDS.reduce((s, f) => s + f.earned, 0);

  const handleShare = async () => {
    await Share.share({
      message: `Join Blink Box — Fast Delivery. Everyday Essentials.\n\nUse my referral code *${REFERRAL_CODE}* and get ₹30 off your first order!\n\nDownload now: blinkbox.app/join`,
      title: 'Join Blink Box',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={18} color={Colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Refer & Earn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Hero */}
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark, '#7B2800']}
          style={styles.hero}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroBg1} />
          <View style={styles.heroBg2} />
          <Gift size={48} color={Colors.white} style={{ marginBottom: 12 }} />
          <Text style={styles.heroTitle}>Earn ₹50 Per Referral!</Text>
          <Text style={styles.heroSub}>
            Invite friends to Blink Box. You earn ₹50 when they place their first order.
          </Text>
          <Text style={styles.totalEarned}>₹{totalEarned} earned so far · {REFERRED_FRIENDS.length} friends joined</Text>
        </LinearGradient>

        {/* Referral Code Card */}
        <View style={[styles.codeCard, Shadows.md]}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <View style={styles.codeBox}>
            <Text style={styles.code}>{REFERRAL_CODE}</Text>
          </View>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare} activeOpacity={0.85}>
            <LinearGradient
              colors={[Colors.primary, Colors.primaryDark]}
              style={[styles.shareGradient, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            >
              <Share2 size={18} color={Colors.white} />
              <Text style={styles.shareBtnText}>Share & Invite Friends</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* How It Works */}
        <View style={[styles.section, Shadows.sm]}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          {[
            { Icon: Share2, title: 'Share your code', sub: 'Share your unique referral link with friends' },
            { Icon: Smartphone, title: 'Friend joins', sub: 'Your friend downloads and registers on Blink Box' },
            { Icon: ShoppingCart, title: 'First order placed', sub: 'Friend places their first order using your code' },
            { Icon: Banknote, title: 'You earn ₹50', sub: 'Wallet credit added instantly!' },
          ].map((step, i) => {
            const IconComponent = step.Icon;
            return (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <View style={styles.stepIcon}>
                  <IconComponent size={18} color={Colors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepSub}>{step.sub}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Referred Friends */}
        <View style={[styles.section, Shadows.sm]}>
          <Text style={styles.sectionTitle}>Friends You Referred ({REFERRED_FRIENDS.length})</Text>
          {REFERRED_FRIENDS.map((friend, i) => (
            <View key={i} style={[styles.friendRow, i < REFERRED_FRIENDS.length - 1 && styles.friendBorder]}>
              <View style={styles.friendAvatar}>
                <Text style={styles.friendAvatarText}>{friend.name[0]}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.friendName}>{friend.name}</Text>
                <Text style={styles.friendDate}>{friend.date}</Text>
              </View>
              <View style={styles.earnedBadge}>
                <Text style={styles.earnedText}>+₹{friend.earned}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.surfaceVariant, alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20, color: Colors.textPrimary },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.textPrimary },

  scroll: { gap: 14, padding: Spacing.md, paddingBottom: 30 },

  hero: {
    borderRadius: Radius.xxl, padding: 28, alignItems: 'center',
    overflow: 'hidden', position: 'relative',
  },
  heroBg1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -60 },
  heroBg2: { position: 'absolute', width: 140, height: 140, borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -40, left: -40 },
  heroEmoji: { fontSize: 52, marginBottom: 12 },
  heroTitle: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 26, color: Colors.white, textAlign: 'center', marginBottom: 8 },
  heroSub: { ...TextStyles.bodyLg, color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: 14, lineHeight: 22 },
  totalEarned: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: 'rgba(255,255,255,0.7)' },

  codeCard: { backgroundColor: Colors.white, borderRadius: Radius.xxl, padding: 20, alignItems: 'center', gap: 16 },
  codeLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.textMuted },
  codeBox: {
    backgroundColor: Colors.primaryContainer, borderRadius: Radius.xl,
    paddingHorizontal: 32, paddingVertical: 12,
    borderWidth: 2, borderColor: Colors.primaryLighter, borderStyle: 'dashed',
  },
  code: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 28, color: Colors.primary, letterSpacing: 4 },
  shareBtn: { borderRadius: Radius.button, overflow: 'hidden', alignSelf: 'stretch' },
  shareGradient: { paddingVertical: 16, alignItems: 'center' },
  shareBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.white },

  section: { backgroundColor: Colors.white, borderRadius: Radius.xxl, padding: Spacing.lg },
  sectionTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary, marginBottom: 16 },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  stepNum: {
    width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.primary,
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  stepNumText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.white },
  stepIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  stepEmoji: { fontSize: 18 },
  stepTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.textPrimary, marginBottom: 2 },
  stepSub: { ...TextStyles.bodySm, color: Colors.textMuted, lineHeight: 18 },

  friendRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  friendBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  friendAvatar: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  friendAvatarText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.primary },
  friendName: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.textPrimary },
  friendDate: { ...TextStyles.micro, color: Colors.textMuted, marginTop: 2 },
  earnedBadge: { backgroundColor: Colors.successContainer, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  earnedText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.successDark },
});
