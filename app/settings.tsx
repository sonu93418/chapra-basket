import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../src/theme';
import { ArrowLeft, Lock, FileText, Star, RefreshCw, Trash2 } from '../src/components/ui/Icon';

const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const [pushNotifications, setPushNotifications] = useState(true);
  const [orderAlerts, setOrderAlerts] = useState(true);
  const [offerAlerts, setOfferAlerts] = useState(true);
  const [smsUpdates, setSmsUpdates] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [locationAccess, setLocationAccess] = useState(true);

  const SECTIONS = [
    {
      title: 'Notifications',
      items: [
        { label: 'Push Notifications', sub: 'Get alerts on your device', value: pushNotifications, onChange: setPushNotifications },
        { label: 'Order Updates', sub: 'Track your order in real-time', value: orderAlerts, onChange: setOrderAlerts },
        { label: 'Offers & Deals', sub: 'Flash sales and special discounts', value: offerAlerts, onChange: setOfferAlerts },
        { label: 'SMS Updates', sub: 'Receive updates via SMS', value: smsUpdates, onChange: setSmsUpdates },
      ],
    },
    {
      title: 'App Preferences',
      items: [
        { label: 'Dark Mode', sub: 'Switch to dark theme', value: darkMode, onChange: setDarkMode },
        { label: 'Location Access', sub: 'Required for delivery address', value: locationAccess, onChange: setLocationAccess },
      ],
    },
  ];

  const LINK_ITEMS = [
    { icon: Lock, label: 'Privacy Policy', onPress: () => {} },
    { icon: FileText, label: 'Terms & Conditions', onPress: () => {} },
    { icon: Star, label: 'Rate the App', onPress: () => {} },
    { icon: RefreshCw, label: 'Check for Updates', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <ArrowLeft size={18} color={Colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {SECTIONS.map(section => (
          <View key={section.title} style={[styles.card, Shadows.sm]}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, i) => (
              <View key={item.label} style={[styles.row, i < section.items.length - 1 && styles.rowBorder]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>{item.label}</Text>
                  <Text style={styles.rowSub}>{item.sub}</Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.onChange}
                  trackColor={{ false: Colors.borderLight, true: Colors.primaryLighter }}
                  thumbColor={item.value ? Colors.primary : Colors.border}
                />
              </View>
            ))}
          </View>
        ))}

        <View style={[styles.card, Shadows.sm]}>
          <Text style={styles.sectionTitle}>About</Text>
          {LINK_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.linkRow, i < LINK_ITEMS.length - 1 && styles.rowBorder]}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <item.icon size={18} color={Colors.textSecondary} />
              <Text style={styles.linkLabel}>{item.label}</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.versionRow}>
            <Text style={styles.versionText}>Chapra Basket v{APP_VERSION}</Text>
            <Text style={styles.versionSub}>Made with love in Bihar</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.dangerCard, Shadows.sm]} activeOpacity={0.85}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <Trash2 size={16} color={Colors.error} strokeWidth={2.5} />
            <Text style={styles.dangerText}>Delete Account</Text>
          </View>
          <Text style={styles.dangerSub}>This will permanently remove your account and data</Text>
        </TouchableOpacity>

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

  scroll: { padding: Spacing.md, gap: 14, paddingBottom: 30 },

  card: { backgroundColor: Colors.white, borderRadius: Radius.xxl, padding: 16 },
  sectionTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.textPrimary, marginBottom: 14 },

  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  rowLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.textPrimary, marginBottom: 2 },
  rowSub: { ...TextStyles.micro, color: Colors.textMuted },

  linkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 14 },
  linkIcon: { fontSize: 22, width: 30 },
  linkLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 15, color: Colors.textPrimary, flex: 1 },
  arrow: { fontSize: 20, color: Colors.textMuted },

  versionRow: { paddingTop: 14, borderTopWidth: 1, borderTopColor: Colors.borderLight, alignItems: 'center', gap: 4 },
  versionText: { ...TextStyles.bodySm, color: Colors.textMuted, fontFamily: 'BeVietnamPro-SemiBold' },
  versionSub: { ...TextStyles.micro, color: Colors.textMuted },

  dangerCard: {
    backgroundColor: Colors.errorContainer, borderRadius: Radius.xxl,
    padding: 20, alignItems: 'center', gap: 6,
  },
  dangerText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.error },
  dangerSub: { ...TextStyles.bodySm, color: Colors.error, opacity: 0.7, textAlign: 'center' },
});
