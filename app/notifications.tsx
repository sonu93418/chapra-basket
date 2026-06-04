import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../src/theme';
import { MOCK_NOTIFICATIONS } from '../src/data/mockData';
import { Notification, NotificationType } from '../src/types';

const TYPE_CONFIG: Record<NotificationType, { emoji: string; color: string; bg: string }> = {
  order_update: { emoji: '🛵', color: Colors.primary, bg: Colors.primaryContainer },
  offer:        { emoji: '🎉', color: '#F59E0B', bg: '#FFF8E1' },
  system:       { emoji: '⚙️', color: Colors.textSecondary, bg: Colors.surfaceVariant },
  wallet:       { emoji: '💰', color: Colors.success, bg: Colors.successContainer },
  referral:     { emoji: '🎁', color: '#8B5CF6', bg: '#EDE9FE' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const renderItem = ({ item }: { item: Notification }) => {
    const config = TYPE_CONFIG[item.type];
    return (
      <TouchableOpacity
        style={[styles.card, !item.isRead && styles.cardUnread, Shadows.sm]}
        onPress={() => markRead(item.id)}
        activeOpacity={0.85}
      >
        {/* Unread dot */}
        {!item.isRead && <View style={styles.unreadDot} />}

        {/* Icon */}
        <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
          <Text style={styles.iconEmoji}>{config.emoji}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={[styles.title, !item.isRead && styles.titleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
          <Text style={styles.time}>{timeAgo(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnIcon}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAll}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={n => n.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={renderItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySub}>We'll notify you about orders, offers and more!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 14,
    backgroundColor: Colors.white,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
    gap: 12,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.surfaceVariant,
    alignItems: 'center', justifyContent: 'center',
  },
  backBtnIcon: { fontSize: 20, color: Colors.textPrimary },
  headerTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.textPrimary },
  headerSub: { ...TextStyles.bodySm, color: Colors.primary },
  markAll: { ...TextStyles.bodySm, color: Colors.primary, fontFamily: 'BeVietnamPro-SemiBold' },

  list: { padding: Spacing.md, paddingBottom: 40 },

  card: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    padding: 14, gap: 14,
    borderWidth: 1, borderColor: Colors.borderLight,
    position: 'relative', overflow: 'hidden',
  },
  cardUnread: {
    borderColor: Colors.primaryLighter,
    backgroundColor: '#FAFCFF',
  },
  unreadDot: {
    position: 'absolute', top: 14, right: 14,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  iconEmoji: { fontSize: 24 },

  content: { flex: 1, gap: 4 },
  title: {
    fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14,
    color: Colors.textSecondary, lineHeight: 20,
  },
  titleUnread: { fontFamily: 'BeVietnamPro-Bold', color: Colors.textPrimary },
  body: { ...TextStyles.bodySm, color: Colors.textMuted, lineHeight: 19 },
  time: { ...TextStyles.micro, color: Colors.textMuted, marginTop: 2 },

  empty: { alignItems: 'center', paddingVertical: 80, gap: 12 },
  emptyEmoji: { fontSize: 56 },
  emptyTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.textPrimary },
  emptySub: { ...TextStyles.bodySm, color: Colors.textMuted, textAlign: 'center', maxWidth: 260 },
});
