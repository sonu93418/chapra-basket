import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, Modal, ActivityIndicator, Alert, Dimensions, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import {
  Store as StoreIcon, Package, Check, Phone, ArrowLeft, LogOut,
  Search, Edit, X, RefreshCw, TrendingUp, Info, Activity, Clock, User
} from '../../src/components/ui/Icon';
import {
  useGetStoresQuery,
  useUpdateStoreStatusMutation,
  useUpdateStoreProductMutation
} from '../../src/api/storeApi';
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation
} from '../../src/api/ordersApi';
import { useGetProductsQuery } from '../../src/api/productsApi';

const { width, height } = Dimensions.get('window');

export default function StoreDashboard() {
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'profile'>('orders');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit Product Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editMrp, setEditMrp] = useState('');
  const [editStockQuantity, setEditStockQuantity] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // API Hooks
  const { data: stores, isLoading: storesLoading, refetch: refetchStores } = useGetStoresQuery();
  const { data: ordersData, isLoading: ordersLoading, refetch: refetchOrders } = useGetOrdersQuery({});
  const { data: productsData, isLoading: productsLoading, refetch: refetchProducts } = useGetProductsQuery({});

  const [updateStoreStatus, { isLoading: statusUpdating }] = useUpdateStoreStatusMutation();
  const [updateStoreProduct, { isLoading: productUpdating }] = useUpdateStoreProductMutation();
  const [updateOrderStatus, { isLoading: orderUpdating }] = useUpdateOrderStatusMutation();

  const activeStore = stores?.[0];

  const handleToggleStoreStatus = async () => {
    if (!activeStore) return;
    try {
      await updateStoreStatus({ id: activeStore.id, isOpen: !activeStore.isOpen }).unwrap();
      Alert.alert('Success', `Store is now ${!activeStore.isOpen ? 'Open' : 'Closed'}`);
    } catch (err: any) {
      Alert.alert('Error', err?.data?.error || 'Failed to update store status');
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, currentStatus: string) => {
    let nextStatus: any = 'confirmed';
    if (currentStatus === 'pending') nextStatus = 'confirmed';
    else if (currentStatus === 'confirmed') nextStatus = 'preparing';
    else if (currentStatus === 'preparing') nextStatus = 'packed';
    else return;

    try {
      await updateOrderStatus({ id: orderId, status: nextStatus }).unwrap();
      refetchOrders();
    } catch (err: any) {
      Alert.alert('Error', err?.data?.error || 'Failed to update order status');
    }
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(String(product.price));
    setEditMrp(String(product.mrp || ''));
    setEditStockQuantity(String(product.stockQty ?? 0));
    setEditIsActive(product.isAvailable ?? true);
    setEditModalVisible(true);
  };

  const handleSaveProduct = async () => {
    if (!editingProduct) return;
    if (!editName.trim() || !editPrice.trim() || !editStockQuantity.trim()) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    try {
      await updateStoreProduct({
        id: editingProduct.id,
        name: editName,
        price: Number(editPrice),
        mrp: editMrp ? Number(editMrp) : undefined,
        stockQuantity: Number(editStockQuantity),
        isActive: editIsActive,
      }).unwrap();

      setEditModalVisible(false);
      Alert.alert('Success', 'Product updated successfully');
      refetchProducts();
    } catch (err: any) {
      Alert.alert('Error', err?.data?.error || 'Failed to update product');
    }
  };

  const handleRefreshAll = () => {
    refetchStores();
    refetchOrders();
    refetchProducts();
  };

  // Filter products based on search
  const filteredProducts = productsData?.items?.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Filter orders relevant to store queue (pending, confirmed, preparing, packed)
  const storeOrders = ordersData?.items?.filter(order =>
    ['pending', 'confirmed', 'preparing', 'packed'].includes(order.status)
  ) || [];

  const revenueToday = storeOrders
    .filter(o => o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const lowStockProductsCount = productsData?.items?.filter(p => (p.stockQty ?? 0) <= 5).length || 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.appBar}>
        <View style={styles.appBarInner}>
          <View style={styles.appBarLeft}>
            <View style={styles.appBarIconWrap}>
              <StoreIcon size={16} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.appBarTitle}>Store Console</Text>
              <Text style={styles.appBarSub}>
                {activeStore ? `${activeStore.name} • ${activeStore.type}` : 'Loading Store...'}
              </Text>
            </View>
          </View>

          <View style={styles.appBarRight}>
            <TouchableOpacity style={styles.refreshBtn} onPress={handleRefreshAll} activeOpacity={0.8}>
              <RefreshCw size={14} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.exitBtn} onPress={() => router.replace('/(auth)/user-type')} activeOpacity={0.85}>
              <LogOut size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Quick Stats Banner */}
        <View style={styles.statsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>{storeOrders.length}</Text>
            <Text style={styles.metricLabel}>Queue Orders</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricVal, lowStockProductsCount > 0 && { color: Colors.error }]}>
              {lowStockProductsCount}
            </Text>
            <Text style={styles.metricLabel}>Low Stock Items</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.statusToggleContainer}>
              <Text style={[styles.metricVal, { color: activeStore?.isOpen ? Colors.success : Colors.error }]}>
                {activeStore?.isOpen ? 'OPEN' : 'CLOSED'}
              </Text>
              <Switch
                value={activeStore?.isOpen ?? false}
                onValueChange={handleToggleStoreStatus}
                trackColor={{ false: '#3E3E3E', true: Colors.successDark }}
                thumbColor={activeStore?.isOpen ? Colors.success : '#F4F3F4'}
                disabled={statusUpdating}
              />
            </View>
            <Text style={styles.metricLabel}>Store Status</Text>
          </View>
        </View>

        {/* Tab Controls */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
            onPress={() => setActiveTab('orders')}
          >
            <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
              Orders ({storeOrders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'inventory' && styles.tabActive]}
            onPress={() => setActiveTab('inventory')}
          >
            <Text style={[styles.tabText, activeTab === 'inventory' && styles.tabTextActive]}>
              Inventory ({productsData?.items?.length || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'profile' && styles.tabActive]}
            onPress={() => setActiveTab('profile')}
          >
            <Text style={[styles.tabText, activeTab === 'profile' && styles.tabTextActive]}>
              Settings / Profile
            </Text>
          </TouchableOpacity>
        </View>

        {/* Orders Queue Section */}
        {activeTab === 'orders' && (
          <View style={styles.sectionContainer}>
            {ordersLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 40 }} />
            ) : storeOrders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Package size={48} color="rgba(255,255,255,0.15)" />
                <Text style={styles.emptyText}>No active orders in preparation queue.</Text>
              </View>
            ) : (
              storeOrders.map(order => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <View>
                      <Text style={styles.orderNum}>Order #{order.orderNumber}</Text>
                      <Text style={styles.orderTime}>Placed: {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <View style={[styles.statusBadge, {
                      backgroundColor: order.status === 'pending' ? 'rgba(245,158,11,0.15)' :
                        order.status === 'confirmed' ? 'rgba(59,130,246,0.15)' :
                        order.status === 'preparing' ? 'rgba(139,92,246,0.15)' : 'rgba(0,176,80,0.15)'
                    }]}>
                      <Text style={[styles.statusBadgeText, {
                        color: order.status === 'pending' ? Colors.statusPending :
                          order.status === 'confirmed' ? Colors.statusConfirmed :
                          order.status === 'preparing' ? Colors.statusPreparing : Colors.statusDelivered
                      }]}>
                        {order.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.orderItemsList}>
                    {order.items?.map((item: any, idx: number) => (
                      <View key={idx} style={styles.orderItemRow}>
                        <Text style={styles.itemQty}>{item.quantity}x</Text>
                        <Text style={styles.itemName} numberOfLines={1}>{item.productName || item.name}</Text>
                        <Text style={styles.itemPrice}>₹{item.totalPrice || (item.price * item.quantity)}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.orderFooter}>
                    <View style={styles.orderPriceContainer}>
                      <Text style={styles.totalLabel}>Total Value:</Text>
                      <Text style={styles.totalVal}>₹{order.total}</Text>
                    </View>

                    {order.status !== 'packed' ? (
                      <TouchableOpacity
                        style={styles.actionBtn}
                        onPress={() => handleUpdateOrderStatus(order.id, order.status)}
                        disabled={orderUpdating}
                      >
                        <Text style={styles.actionBtnText}>
                          {order.status === 'pending' ? 'Accept Order' :
                            order.status === 'confirmed' ? 'Start Preparing' :
                            order.status === 'preparing' ? 'Mark Packed & Ready' : ''}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.waitingRiderContainer}>
                        <Clock size={14} color={Colors.primary} />
                        <Text style={styles.waitingRiderText}>Awaiting Rider Pickup</Text>
                      </View>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* Inventory Management Section */}
        {activeTab === 'inventory' && (
          <View style={styles.sectionContainer}>
            {/* Search Bar */}
            <View style={styles.searchBoxContainer}>
              <Search size={16} color="rgba(255,255,255,0.4)" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products in store..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              )}
            </View>

            {productsLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 40 }} />
            ) : filteredProducts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Package size={48} color="rgba(255,255,255,0.15)" />
                <Text style={styles.emptyText}>No products found matching "{searchQuery}"</Text>
              </View>
            ) : (
              filteredProducts.map(product => {
                const stockQty = product.stockQty ?? 0;
                const isAvailable = product.isAvailable ?? true;
                const isLowStock = stockQty <= 5;

                return (
                  <View key={product.id} style={[styles.productItemCard, !isAvailable && styles.inactiveCard]}>
                    <View style={styles.productInfoCol}>
                      <Text style={styles.productNameText}>{product.name}</Text>
                      <Text style={styles.productUnitText}>{product.unit}</Text>
                      <View style={styles.priceMetaRow}>
                        <Text style={styles.productPriceText}>₹{product.price}</Text>
                        {product.mrp && product.mrp > product.price && (
                          <Text style={styles.productMrpText}>MRP ₹{product.mrp}</Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.stockCol}>
                      <Text style={[styles.stockValue, isLowStock && isAvailable && styles.lowStockText, !isAvailable && styles.inactiveStockText]}>
                        Qty: {stockQty}
                      </Text>
                      <Text style={[styles.availabilityLabel, { color: isAvailable ? Colors.success : Colors.error }]}>
                        {isAvailable ? 'In Stock' : 'Out of Stock'}
                      </Text>
                    </View>

                    <TouchableOpacity style={styles.editProductBtn} onPress={() => openEditModal(product)} activeOpacity={0.7}>
                      <Edit size={16} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* Profile / Details Section */}
        {activeTab === 'profile' && (
          <View style={styles.sectionContainer}>
            <View style={styles.profileCard}>
              <View style={styles.profileCardHeader}>
                <StoreIcon size={20} color={Colors.primary} />
                <Text style={styles.profileCardTitle}>Store Information</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Store ID</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{activeStore?.id || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Name</Text>
                <Text style={styles.infoValue}>{activeStore?.name || 'Blink Box Store'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Store Type</Text>
                <Text style={styles.infoValue}>{activeStore?.type || 'Grocery Hub'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Contact Phone</Text>
                <Text style={styles.infoValue}>{activeStore?.phone || '+91-9876543210'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{activeStore?.address || 'Main Bazar, Blink Town, Bihar'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Owner ID</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{activeStore?.ownerId || 'System Master'}</Text>
              </View>
            </View>

            {/* Metrics */}
            <View style={styles.profileCard}>
              <View style={styles.profileCardHeader}>
                <TrendingUp size={20} color={Colors.success} />
                <Text style={styles.profileCardTitle}>Today's Summary</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estimated Revenue</Text>
                <Text style={[styles.infoValue, { color: Colors.successLight, fontFamily: 'BeVietnamPro-Bold' }]}>
                  ₹{revenueToday}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Orders Handled</Text>
                <Text style={styles.infoValue}>{storeOrders.length}</Text>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Edit Product Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Inventory Item</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <X size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalForm} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Product Title</Text>
              <TextInput
                style={styles.modalInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Product name"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />

              <View style={styles.inputGridRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Sale Price (₹)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editPrice}
                    onChangeText={setEditPrice}
                    keyboardType="numeric"
                    placeholder="100.00"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.inputLabel}>MRP (₹, Optional)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={editMrp}
                    onChangeText={setEditMrp}
                    keyboardType="numeric"
                    placeholder="120.00"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Current Stock Quantity</Text>
              <TextInput
                style={styles.modalInput}
                value={editStockQuantity}
                onChangeText={setEditStockQuantity}
                keyboardType="numeric"
                placeholder="50"
                placeholderTextColor="rgba(255,255,255,0.3)"
              />

              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.switchTitle}>Item Availability</Text>
                  <Text style={styles.switchSubtitle}>Toggle off to mark out-of-stock globally</Text>
                </View>
                <Switch
                  value={editIsActive}
                  onValueChange={setEditIsActive}
                  trackColor={{ false: '#3E3E3E', true: Colors.successDark }}
                  thumbColor={editIsActive ? Colors.success : '#F4F3F4'}
                />
              </View>

              <TouchableOpacity
                style={styles.saveProductBtn}
                onPress={handleSaveProduct}
                disabled={productUpdating}
              >
                {productUpdating ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.saveProductBtnText}>Save Product Modifications</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.dark.background },
  appBar: { backgroundColor: '#0B0D14', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  appBarInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: 12 },
  appBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  appBarIconWrap: { width: 28, height: 28, borderRadius: Radius.xl, backgroundColor: 'rgba(255,107,0,0.15)', alignItems: 'center', justifyContent: 'center' },
  appBarTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.white },
  appBarSub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 11, color: Colors.dark.textMuted },
  appBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  refreshBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  exitBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },

  scrollContent: { padding: Spacing.lg },

  // Scorecards
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  metricCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', padding: 14, borderRadius: Radius.xl, justifyContent: 'space-between' },
  metricVal: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 20, color: Colors.white },
  metricLabel: { fontFamily: 'BeVietnamPro-Medium', fontSize: 10, color: Colors.dark.textMuted, marginTop: 4 },
  statusToggleContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },

  // Tabs
  tabsContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 12, color: Colors.dark.textMuted },
  tabTextActive: { color: Colors.white },

  // Sections
  sectionContainer: { gap: 12 },

  // Empty List
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, opacity: 0.8 },
  emptyText: { fontFamily: 'BeVietnamPro-Medium', fontSize: 13, color: Colors.dark.textMuted, marginTop: 12, textAlign: 'center' },

  // Order Cards
  orderCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', borderRadius: Radius.xl, padding: 16 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)', paddingBottom: 10, marginBottom: 12 },
  orderNum: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.white },
  orderTime: { fontFamily: 'BeVietnamPro-Regular', fontSize: 11, color: Colors.dark.textMuted, marginTop: 2 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  statusBadgeText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 9 },
  
  orderItemsList: { gap: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)', marginBottom: 12 },
  orderItemRow: { flexDirection: 'row', alignItems: 'center' },
  itemQty: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.primary, width: 28 },
  itemName: { fontFamily: 'BeVietnamPro-Medium', fontSize: 13, color: Colors.white, flex: 1 },
  itemPrice: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: 'rgba(255,255,255,0.8)' },

  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderPriceContainer: { gap: 2 },
  totalLabel: { fontFamily: 'BeVietnamPro-Medium', fontSize: 11, color: Colors.dark.textMuted },
  totalVal: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 16, color: Colors.white },
  actionBtn: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full },
  actionBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 12, color: Colors.white },
  waitingRiderContainer: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,107,0,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  waitingRiderText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 11, color: Colors.primary },

  // Inventory Search Box
  searchBoxContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: Colors.white, fontFamily: 'BeVietnamPro-Medium', fontSize: 13, padding: 0 },

  // Inventory Cards
  productItemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', borderRadius: Radius.xl, padding: 14, gap: 12 },
  inactiveCard: { opacity: 0.5 },
  productInfoCol: { flex: 1 },
  productNameText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.white },
  productUnitText: { fontFamily: 'BeVietnamPro-Medium', fontSize: 11, color: Colors.dark.textMuted, marginTop: 2 },
  priceMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  productPriceText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.primary },
  productMrpText: { fontFamily: 'BeVietnamPro-Regular', fontSize: 11, color: Colors.dark.textMuted, textDecorationLine: 'line-through' },
  stockCol: { alignItems: 'flex-end', justifyContent: 'center' },
  stockValue: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.white },
  lowStockText: { color: Colors.error },
  inactiveStockText: { color: Colors.dark.textMuted },
  availabilityLabel: { fontFamily: 'BeVietnamPro-Medium', fontSize: 9, marginTop: 2 },
  editProductBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },

  // Profile Details
  profileCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', borderRadius: Radius.xl, padding: 16, marginBottom: 16 },
  profileCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)', paddingBottom: 10, marginBottom: 12 },
  profileCardTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.white },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  infoLabel: { fontFamily: 'BeVietnamPro-Medium', fontSize: 12, color: Colors.dark.textMuted },
  infoValue: { fontFamily: 'BeVietnamPro-Medium', fontSize: 12, color: Colors.white, maxWidth: '60%' },

  // Modal styling
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#141110', borderTopLeftRadius: Radius.xxl, borderTopRightRadius: Radius.xxl, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', maxHeight: height * 0.85 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  modalTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.white },
  modalForm: { padding: 20, gap: 16 },
  inputLabel: { fontFamily: 'BeVietnamPro-Medium', fontSize: 12, color: Colors.dark.textSecondary, marginBottom: 6 },
  modalInput: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.xl, paddingHorizontal: 16, paddingVertical: 12, color: Colors.white, fontFamily: 'BeVietnamPro-Medium', fontSize: 14 },
  inputGridRow: { flexDirection: 'row', width: '100%' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginVertical: 8 },
  switchTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.white },
  switchSubtitle: { fontFamily: 'BeVietnamPro-Medium', fontSize: 11, color: Colors.dark.textMuted, marginTop: 2 },
  saveProductBtn: { backgroundColor: Colors.primary, borderRadius: Radius.xl, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  saveProductBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.white },
});
