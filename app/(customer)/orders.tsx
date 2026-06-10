import React, { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, TextStyles, Radius, Spacing, Shadows } from '../../src/theme';
import { Order, OrderStatus } from '../../src/types';
import { useAppSelector } from '../../src/hooks/useAppDispatch';
import {
  Package, Navigation, RotateCcw, Clock, CheckCircle,
  XCircle, Bike, ChevronRight, ShoppingBag
} from '../../src/components/ui/Icon';
import { formatCurrencyFull, formatDate } from '../../src/utils/format';

// ─── Status Config (SVG icons, no emojis) ───────────────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string; color: string;
  bgColor: string; IconComponent: any
}> = {
  pending:          { label: 'Order Placed',      color: Colors.statusPending,       bgColor: '#FEF3C7', IconComponent: Clock },
  confirmed:        { label: 'Confirmed',          color: Colors.statusConfirmed,     bgColor: '#DBEAFE', IconComponent: CheckCircle },
  preparing:        { label: 'Preparing',          color: Colors.statusPreparing,     bgColor: '#EDE9FE', IconComponent: Package },
  ready_for_pickup: { label: 'Ready for Pickup',   color: Colors.statusOutForDelivery,bgColor: '#FFEDD5', IconComponent: Package },
  packed:           { label: 'Packed',             color: Colors.statusPreparing,     bgColor: '#EDE9FE', IconComponent: Package },
  picked_up:        { label: 'Picked Up',          color: Colors.statusOutForDelivery,bgColor: '#FFEDD5', IconComponent: Bike },
  out_for_delivery: { label: 'Out for Delivery',   color: Colors.statusOutForDelivery,bgColor: '#FFEDD5', IconComponent: Bike },
  delivered:        { label: 'Delivered',          color: Colors.statusDelivered,     bgColor: '#DCFCE7', IconComponent: CheckCircle },
  cancelled:        { label: 'Cancelled',          color: Colors.statusCancelled,     bgColor: '#FEE2E2', IconComponent: XCircle },
  returned:         { label: 'Returned',           color: Colors.statusCancelled,     bgColor: '#FEE2E2', IconComponent: RotateCcw },
};

const ACTIVE_STATUSES = ['pending', 'confirmed', 'preparing', 'ready_for_pickup', 'packed', 'picked_up', 'out_for_delivery'];

// ─── Tab Bar ──────────────────────────────────────────────────────────────────
function TabBar({ active, onSelect }: { active: 'active' | 'past'; onSelect: (t: 'active' | 'past') => void }) {
  return (
    <View style={tab.container}>
      {(['active', 'past'] as const).map(t => (
        <TouchableOpacity key={t} style={[tab.btn, active === t && tab.btnActive]} onPress={() => onSelect(t)} activeOpacity={0.8}>
          <Text style={[tab.label, active === t && tab.labelActive]}>
            {t === 'active' ? 'Active Orders' : 'Past Orders'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
const tab = StyleSheet.create({
  container: { flexDirection: 'row', marginHorizontal: Spacing.lg, marginBottom: 16, backgroundColor: Colors.surfaceElevated, borderRadius: Radius.xl, padding: 4 },
  btn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.lg },
  btnActive: { backgroundColor: Colors.white, ...Shadows.sm },
  label: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: Colors.textMuted },
  labelActive: { color: Colors.textPrimary },
});

// ─── Order Card ───────────────────────────────────────────────────────────────
function OrderCard({ order }: { order: Order }) {
  const cfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG['pending'];
  const { IconComponent } = cfg;
  const isActive = ACTIVE_STATUSES.includes(order.status);

  return (
    <TouchableOpacity
      style={[styles.card, Shadows.sm, isActive && styles.cardActive]}
      onPress={() => router.push(`/order/${order.id}` as any)}
      activeOpacity={0.88}
    >
      {/* Active accent bar */}
      {isActive && (
        <LinearGradient
          colors={[Colors.primary, Colors.primaryDark]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
          style={styles.accentBar}
        />
      )}

      {/* Header */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderNum}>#{order.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusChip, { backgroundColor: cfg.bgColor }]}>
          <IconComponent size={13} color={cfg.color} strokeWidth={2.5} />
          <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Item chips */}
      <View style={styles.itemsRow}>
        {order.items.slice(0, 3).map(item => (
          <View key={item.id} style={styles.itemChip}>
            <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.itemQty}>×{item.quantity}</Text>
          </View>
        ))}
        {order.items.length > 3 && (
          <Text style={styles.moreItems}>+{order.items.length - 3} more</Text>
        )}
      </View>

      {/* ETA Banner (active only) */}
      {isActive && (order as any).estimatedMinutes && (
        <View style={styles.etaBanner}>
          <Bike size={13} color={Colors.successDark} strokeWidth={2} />
          <Text style={styles.etaText}>
            {(order as any).riderName || 'Rider'} is on the way · Est. {(order as any).estimatedMinutes} mins
          </Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.cardFooter}>
        <Text style={styles.total}>{formatCurrencyFull(order.total)}</Text>
        <View style={styles.footerActions}>
          {isActive && (
            <TouchableOpacity
              style={styles.trackBtn}
              onPress={() => router.push(`/order-tracking/${order.id}` as any)}
              activeOpacity={0.85}
            >
              <Navigation size={13} color={Colors.primary} strokeWidth={2.5} />
              <Text style={styles.trackBtnText}>Track</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.reorderBtn} activeOpacity={0.85}>
            <RotateCcw size={13} color={Colors.textSecondary} strokeWidth={2} />
            <Text style={styles.reorderText}>Reorder</Text>
          </TouchableOpacity>
          <ChevronRight size={16} color={Colors.textMuted} strokeWidth={1.8} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyOrders({ tab }: { tab: 'active' | 'past' }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIconWrap}>
        <ShoppingBag size={40} color={Colors.textMuted} strokeWidth={1.5} />
      </View>
      <Text style={styles.emptyTitle}>
        {tab === 'active' ? 'No active orders' : 'No past orders'}
      </Text>
      <Text style={styles.emptySub}>
        {tab === 'active'
          ? 'Place an order and track it live!'
          : 'Your completed orders will appear here'}
      </Text>
      {tab === 'active' && (
        <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(customer)/' as any)} activeOpacity={0.85}>
          <Text style={styles.shopBtnText}>Start Shopping</Text>
          <ChevronRight size={16} color={Colors.white} strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function OrdersScreen() {
  const [activeTab, setActiveTab] = useState<'active' | 'past'>('active');
  const orders = useAppSelector(s => s.orders.items);

  const activeOrders = orders.filter(o => ACTIVE_STATUSES.includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled', 'returned'].includes(o.status));
  const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        {activeOrders.length > 0 && (
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>{activeOrders.length} active</Text>
          </View>
        )}
      </View>

      <FlatList
        data={displayedOrders}
        keyExtractor={o => o.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<TabBar active={activeTab} onSelect={setActiveTab} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        renderItem={({ item }) => <OrderCard order={item} />}
        ListEmptyComponent={<EmptyOrders tab={activeTab} />}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: Spacing.lg, paddingTop: 8, paddingBottom: 16,
  },
  title: { fontFamily: 'BeVietnamPro-Bold', fontSize: 26, color: Colors.textPrimary, flex: 1 },
  activeBadge: { backgroundColor: Colors.primaryContainer, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full },
  activeBadgeText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 12, color: Colors.primary },

  list: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },

  card: {
    backgroundColor: Colors.white, borderRadius: Radius.xxl,
    padding: 16, borderWidth: 1, borderColor: Colors.borderLight, overflow: 'hidden',
  },
  cardActive: { borderColor: Colors.primaryLighter, borderWidth: 1.5 },
  accentBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  orderNum: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.textPrimary },
  orderDate: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full },
  statusLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12 },

  itemsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  itemChip: {
    flexDirection: 'row', gap: 4, alignItems: 'center',
    backgroundColor: Colors.surfaceVariant, borderRadius: Radius.sm,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  itemName: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textSecondary, maxWidth: 100 },
  itemQty: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12, color: Colors.textMuted },
  moreItems: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted, alignSelf: 'center' },

  etaBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 12, backgroundColor: Colors.successContainer,
    borderRadius: Radius.lg, paddingHorizontal: 12, paddingVertical: 8,
  },
  etaText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12, color: Colors.successDark },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.textPrimary },
  footerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trackBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.primaryContainer, borderRadius: Radius.button,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  trackBtnText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12, color: Colors.primary },
  reorderBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.surfaceVariant, borderRadius: Radius.button,
    paddingHorizontal: 12, paddingVertical: 7,
  },
  reorderText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12, color: Colors.textSecondary },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyIconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  emptyTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 20, color: Colors.textPrimary, marginBottom: 8 },
  emptySub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginBottom: 24, maxWidth: 260 },
  shopBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, borderRadius: Radius.button, paddingHorizontal: 24, paddingVertical: 14 },
  shopBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.white },
});
