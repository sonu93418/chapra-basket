import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { MOCK_ORDERS } from '../../src/data/mockData';
import { Order, OrderStatus } from '../../src/types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; emoji: string }> = {
  pending:           { label: 'Order Placed',        color: Colors.statusPending,         emoji: '⏳' },
  confirmed:         { label: 'Confirmed',           color: Colors.statusConfirmed,        emoji: '✅' },
  preparing:         { label: 'Preparing',           color: Colors.statusPreparing,        emoji: '👨‍🍳' },
  ready_for_pickup:  { label: 'Ready for Pickup',    color: Colors.statusOutForDelivery,   emoji: '📦' },
  out_for_delivery:  { label: 'Out for Delivery',    color: Colors.statusOutForDelivery,   emoji: '🛵' },
  delivered:         { label: 'Delivered',           color: Colors.statusDelivered,        emoji: '🎉' },
  cancelled:         { label: 'Cancelled',           color: Colors.statusCancelled,        emoji: '❌' },
  returned:          { label: 'Returned',            color: Colors.statusCancelled,        emoji: '↩️' },
};

function OrderCard({ order }: { order: Order }) {
  const status = STATUS_CONFIG[order.status];
  const isActive = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(order.status);
  const date = new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <TouchableOpacity
      style={[styles.card, Shadows.sm, isActive && styles.cardActive]}
      onPress={() => router.push(`/order/${order.id}`)}
      activeOpacity={0.9}
    >
      {/* Active Pulse */}
      {isActive && <View style={styles.activePulse} />}

      {/* Order Header */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderNum}>#{order.orderNumber}</Text>
          <Text style={styles.orderDate}>{date}</Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: status.color + '20' }]}>
          <Text style={styles.statusEmoji}>{status.emoji}</Text>
          <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
        </View>
      </View>

      {/* Items preview */}
      <View style={styles.itemsRow}>
        {order.items.slice(0, 3).map((item, i) => (
          <View key={item.id} style={styles.itemChip}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemQty}>×{item.quantity}</Text>
          </View>
        ))}
        {order.items.length > 3 && (
          <Text style={styles.moreItems}>+{order.items.length - 3} more</Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.total}>₹{order.total}</Text>
        <View style={styles.footerRight}>
          {isActive && (
            <TouchableOpacity
              style={styles.trackBtn}
              onPress={() => router.push(`/order-tracking/${order.id}`)}
            >
              <Text style={styles.trackBtnText}>📍 Track</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.reorderBtn}>
            <Text style={styles.reorderText}>🔄 Reorder</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ETA for active orders */}
      {isActive && order.estimatedMinutes && (
        <View style={styles.etaBanner}>
          <Text style={styles.etaText}>
            🛵 {order.riderName} is on the way · Est. {order.estimatedMinutes} mins
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const activeOrders = MOCK_ORDERS.filter(o =>
    ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(o.status)
  );
  const pastOrders = MOCK_ORDERS.filter(o =>
    ['delivered', 'cancelled', 'returned'].includes(o.status)
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      <FlatList
        data={MOCK_ORDERS}
        keyExtractor={o => o.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            {activeOrders.length > 0 && (
              <Text style={styles.sectionLabel}>🔴 Active Orders ({activeOrders.length})</Text>
            )}
          </>
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => <OrderCard order={item} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySub}>Place your first order and get it in 30 minutes!</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(customer)/' as any)}>
              <Text style={styles.shopBtnText}>Start Shopping →</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: { paddingHorizontal: Spacing.lg, paddingVertical: 20 },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 26, color: Colors.textPrimary },
  sectionLabel: { ...TextStyles.labelBold, color: Colors.textSecondary, marginBottom: 12 },
  list: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },

  card: {
    backgroundColor: Colors.white,
    borderRadius: Radius.xxl,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    overflow: 'hidden',
  },
  cardActive: { borderColor: Colors.primaryLighter, borderWidth: 1.5 },
  activePulse: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
    backgroundColor: Colors.primary,
  },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderNum: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.textPrimary },
  orderDate: { ...TextStyles.bodySm, color: Colors.textMuted, marginTop: 2 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
  statusEmoji: { fontSize: 13 },
  statusLabel: { ...TextStyles.labelBold },

  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  itemChip: {
    flexDirection: 'row', gap: 4, alignItems: 'center',
    backgroundColor: Colors.surfaceVariant, borderRadius: Radius.sm,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  itemName: { ...TextStyles.bodySm, color: Colors.textSecondary, maxWidth: 100 },
  itemQty: { ...TextStyles.bodySm, color: Colors.textMuted },
  moreItems: { ...TextStyles.bodySm, color: Colors.textMuted, alignSelf: 'center' },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.textPrimary },
  footerRight: { flexDirection: 'row', gap: 8 },
  trackBtn: {
    backgroundColor: Colors.primaryContainer, borderRadius: Radius.button,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  trackBtnText: { ...TextStyles.labelBold, color: Colors.primary },
  reorderBtn: {
    backgroundColor: Colors.surfaceVariant, borderRadius: Radius.button,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  reorderText: { ...TextStyles.labelBold, color: Colors.textSecondary },

  etaBanner: {
    marginTop: 12, backgroundColor: Colors.successContainer,
    borderRadius: Radius.lg, paddingHorizontal: 12, paddingVertical: 8,
  },
  etaText: { ...TextStyles.bodySm, color: Colors.successDark, fontFamily: 'BeVietnamPro-SemiBold' },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 22, color: Colors.textPrimary, marginBottom: 8 },
  emptySub: { ...TextStyles.bodyLg, color: Colors.textMuted, textAlign: 'center', marginBottom: 24 },
  shopBtn: { backgroundColor: Colors.primary, borderRadius: Radius.button, paddingHorizontal: 28, paddingVertical: 14 },
  shopBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.white },
});
