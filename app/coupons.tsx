import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../src/theme';
import { COUPONS } from '../src/data/mockData';

export default function CouponsScreen() {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Coupons</Text>
        <View style={{ width: 40 }} />
      </View>

      <FlatList
        data={COUPONS}
        keyExtractor={c => c.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>🎁 You have {COUPONS.length} active coupons. Apply them at checkout!</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => (
          <View style={[styles.card, Shadows.sm]}>
            {/* Left scissor strip */}
            <View style={styles.leftStrip}>
              <Text style={styles.couponIcon}>
                {item.discountType === 'percent' ? '🎯' : item.code === 'FREEDEL' ? '🛵' : '💰'}
              </Text>
            </View>

            {/* Dashed divider */}
            <View style={styles.divider}>
              <View style={styles.topCircle} />
              <View style={styles.dashedLine} />
              <View style={styles.bottomCircle} />
            </View>

            {/* Content */}
            <View style={styles.content}>
              <View style={styles.codeRow}>
                <Text style={styles.code}>{item.code}</Text>
                <TouchableOpacity
                  style={[styles.copyBtn, copied === item.code && styles.copyBtnDone]}
                  onPress={() => handleCopy(item.code)}
                >
                  <Text style={styles.copyBtnText}>{copied === item.code ? '✓ Copied!' : 'Copy'}</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.desc}>{item.description}</Text>
              <Text style={styles.minOrder}>Min. order: ₹{item.minOrderValue}</Text>
              {item.maxDiscount && (
                <Text style={styles.maxDiscount}>Max discount: ₹{item.maxDiscount}</Text>
              )}
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>
                  {item.discountType === 'flat'
                    ? `₹${item.discountValue} OFF`
                    : `${item.discountValue}% OFF`}
                </Text>
              </View>
            </View>
          </View>
        )}
      />
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

  list: { padding: Spacing.md, paddingBottom: 40 },

  infoBox: {
    backgroundColor: Colors.primaryContainer, borderRadius: Radius.xl,
    padding: 14, marginBottom: 16,
  },
  infoText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.primary },

  card: {
    flexDirection: 'row', backgroundColor: Colors.white,
    borderRadius: Radius.xxl, overflow: 'hidden',
    borderWidth: 1.5, borderColor: Colors.borderLight,
  },

  leftStrip: {
    width: 72, backgroundColor: Colors.primaryContainer,
    alignItems: 'center', justifyContent: 'center',
  },
  couponIcon: { fontSize: 30 },

  divider: { width: 1, alignItems: 'center', position: 'relative', paddingVertical: 10 },
  topCircle: {
    width: 18, height: 9, borderBottomLeftRadius: 9, borderBottomRightRadius: 9,
    backgroundColor: Colors.background, position: 'absolute', top: -1,
  },
  bottomCircle: {
    width: 18, height: 9, borderTopLeftRadius: 9, borderTopRightRadius: 9,
    backgroundColor: Colors.background, position: 'absolute', bottom: -1,
  },
  dashedLine: {
    flex: 1, width: 1, borderLeftWidth: 1.5, borderColor: Colors.borderLight,
    borderStyle: 'dashed',
  },

  content: { flex: 1, padding: 14, gap: 4 },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  code: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 16, color: Colors.primary, letterSpacing: 2 },
  copyBtn: {
    backgroundColor: Colors.surfaceVariant, borderRadius: Radius.sm,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  copyBtnDone: { backgroundColor: Colors.successContainer },
  copyBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 11, color: Colors.textSecondary },
  desc: { ...TextStyles.bodySm, color: Colors.textSecondary, lineHeight: 18 },
  minOrder: { ...TextStyles.micro, color: Colors.textMuted },
  maxDiscount: { ...TextStyles.micro, color: Colors.textMuted },
  discountBadge: {
    alignSelf: 'flex-start', marginTop: 4,
    backgroundColor: Colors.success, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  discountBadgeText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 11, color: Colors.white },
});
