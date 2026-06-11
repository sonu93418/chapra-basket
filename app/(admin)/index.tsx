import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  FlatList, Dimensions, ActivityIndicator, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { getSocket } from '../../src/services/socket';
import {
  MapPin, Bell, Clock, Star, TrendingUp, RefreshCw,
  Map, Store, Package, Check, Phone, MessageCircle, Navigation,
  ShieldAlert, LogOut, Radio, Battery, Signal, UserCheck, Activity, Bike,
  Search, User, X
} from '../../src/components/ui/Icon';
import { useGetAdminUsersQuery, useUpdateUserRoleMutation } from '../../src/api/adminApi';

const { width } = Dimensions.get('window');

// Map Projection Bounds for Geodetic Visualizer
const MAP_BOUNDS = {
  minLat: 25.7730,
  maxLat: 25.7795,
  minLng: 84.7340,
  maxLng: 84.7385,
};

function getPercentageCoords(lat: number, lng: number) {
  const x = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng)) * 100;
  const y = 100 - ((lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat)) * 100;
  return { left: `${Math.max(0, Math.min(100, x))}%`, top: `${Math.max(0, Math.min(100, y))}%` };
}

// Initial active mock fleet to display before socket packets arrive
const INITIAL_FLEET = {
  'rider-1': {
    riderId: 'rider-1',
    riderName: 'Rajan Kumar',
    vehicleNumber: 'BR 04 AB 1234',
    lat: 25.7766,
    lng: 84.7363,
    heading: 90,
    speed: 24.5,
    battery: 88,
    networkStatus: 'Excellent',
    orderId: 'ord-active-1',
    lastSeen: new Date().toISOString(),
  },
  'rider-2': {
    riderId: 'rider-2',
    riderName: 'Sanjay Kumar Singh',
    vehicleNumber: 'BR 04 EF 5678',
    lat: 25.7750,
    lng: 84.7310,
    heading: 270,
    speed: 0,
    battery: 12, // Low battery alert trigger
    networkStatus: 'Poor', // Weak network alert trigger
    orderId: 'ord-active-2',
    lastSeen: new Date(Date.now() - 95000).toISOString(), // Lagging alert trigger
  }
};

export default function AdminDashboard() {
  const [ridersMap, setRidersMap] = useState<Record<string, any>>(INITIAL_FLEET);
  const [activeTab, setActiveTab] = useState<'fleet' | 'metrics' | 'users'>('fleet');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Admin APIs
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useGetAdminUsersQuery(undefined, {
    skip: activeTab !== 'users'
  });
  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();

  const handleRoleChange = async (userId: string, newRole: any) => {
    try {
      await updateUserRole({ userId, role: newRole }).unwrap();
      refetchUsers();
      Alert.alert('Success', `User role successfully updated to ${newRole}`);
    } catch (err: any) {
      Alert.alert('Error', err?.data?.error || 'Failed to update user role');
    }
  };

  const filteredUsers = users?.filter(u =>
    u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.phone.includes(userSearchQuery)
  ) || [];

  // Register telemetry sockets on connection
  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.emit('admin:subscribe');
      
      socket.on('admin:rider_update', (data: any) => {
        setRidersMap(prev => ({
          ...prev,
          [data.riderId]: {
            ...prev[data.riderId],
            ...data,
            lastSeen: new Date().toISOString(),
          }
        }));
      });
    }

    return () => {
      const socket = getSocket();
      socket?.off('admin:rider_update');
    };
  }, []);

  const ridersList = Object.values(ridersMap);
  const activeOrdersCount = ridersList.filter(r => r.orderId).length;
  const onlineRidersCount = ridersList.length;

  const getRiderStatusLabel = (rider: any) => {
    const lastSeenTime = new Date(rider.lastSeen).getTime();
    const timeDiffSec = (Date.now() - lastSeenTime) / 1000;
    
    if (timeDiffSec > 60) return 'Lagging';
    if (rider.speed > 2) return 'Delivering';
    return 'Idle';
  };

  const getBatteryColor = (level: number) => {
    if (level <= 15) return Colors.error;
    if (level <= 30) return '#FFEB3B';
    return Colors.successLight;
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Operations Header */}
      <SafeAreaView edges={['top']} style={styles.appBar}>
        <View style={styles.appBarInner}>
          <View style={styles.appBarLeft}>
            <View style={styles.appBarIconWrap}>
              <Activity size={15} color={Colors.primary} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.appBarTitle}>Operations Control</Text>
              <Text style={styles.appBarSub}>Chapra Hub Dispatch Center</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.exitBtn} onPress={() => router.replace('/(auth)/user-type')} activeOpacity={0.85}>
            <LogOut size={16} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Core Stats Overview */}
        <View style={styles.statsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>{activeOrdersCount}</Text>
            <Text style={styles.metricLabel}>Live Orders</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricVal}>{onlineRidersCount}</Text>
            <Text style={styles.metricLabel}>Active Fleet</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricVal, { color: Colors.successLight }]}>₹8,490</Text>
            <Text style={styles.metricLabel}>Today's Revenue</Text>
          </View>
        </View>

        {/* Live Dispatch Map Visualizer */}
        <View style={styles.mapContainer}>
          <LinearGradient colors={['#101622', '#0A0D14']} style={StyleSheet.absoluteFill}>
            {/* Grid */}
            {[...Array(6)].map((_, i) => (
              <View key={`h${i}`} style={[styles.gridLine, { top: `${i * 20}%` }]} />
            ))}
            {[...Array(6)].map((_, i) => (
              <View key={`v${i}`} style={[styles.gridLineV, { left: `${i * 20}%` }]} />
            ))}

            {/* Store Hub */}
            <View style={[styles.marker, getPercentageCoords(25.7782, 84.7352), { transform: [{ translateX: -12 }, { translateY: -12 }] } as any]}>
              <View style={[styles.markerIcon, { backgroundColor: Colors.primary, width: 24, height: 24 }]}>
                <Store size={12} color="#FFF" />
              </View>
            </View>

            {/* Live Riders projected on Canvas */}
            {ridersList.map(r => {
              const pos = getPercentageCoords(r.lat, r.lng);
              const status = getRiderStatusLabel(r);
              const statusColor = status === 'Lagging' ? Colors.error : status === 'Delivering' ? Colors.primary : Colors.successLight;

              return (
                <View
                  key={r.riderId}
                  style={[
                    styles.marker,
                    pos,
                    { transform: [{ translateX: -16 }, { translateY: -16 }] } as any
                  ]}
                >
                  <View style={[styles.markerIcon, { backgroundColor: '#131924', borderWidth: 2, borderColor: statusColor, width: 32, height: 32 }]}>
                    <Bike size={16} color={statusColor} />
                  </View>
                  <View style={[styles.riderTag, { backgroundColor: statusColor }]}>
                    <Text style={styles.riderTagText}>{r.riderName.split(' ')[0]}</Text>
                  </View>
                </View>
              );
            })}
          </LinearGradient>
          <View style={styles.mapLabelContainer}>
            <Radio size={12} color={Colors.successLight} />
            <Text style={styles.mapLabel}>LIVE CORRIDOR PROJECTOR</Text>
          </View>
        </View>

        {/* Tab Controls */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'fleet' && styles.tabActive]}
            onPress={() => setActiveTab('fleet')}
          >
            <Text style={[styles.tabText, activeTab === 'fleet' && styles.tabTextActive]}>Fleet ({ridersList.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'users' && styles.tabActive]}
            onPress={() => setActiveTab('users')}
          >
            <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>User Roles</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'metrics' && styles.tabActive]}
            onPress={() => setActiveTab('metrics')}
          >
            <Text style={[styles.tabText, activeTab === 'metrics' && styles.tabTextActive]}>Analytics</Text>
          </TouchableOpacity>
        </View>

        {/* Fleet Monitor List */}
        {activeTab === 'fleet' && (
          <View style={styles.listSection}>
            {ridersList.map(r => {
              const status = getRiderStatusLabel(r);
              const batColor = getBatteryColor(r.battery);
              const isLagging = status === 'Lagging';

              return (
                <View key={r.riderId} style={[styles.riderCard, isLagging && styles.riderCardLagging]}>
                  {/* Rider Profile row */}
                  <View style={styles.cardHeader}>
                    <View style={styles.profileLeft}>
                      <View style={styles.avatar}>
                        <UserCheck size={16} color={Colors.primary} />
                      </View>
                      <View>
                        <Text style={styles.riderName}>{r.riderName}</Text>
                        <Text style={styles.riderVehicle}>{r.vehicleNumber}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: isLagging ? Colors.error + '20' : status === 'Delivering' ? 'rgba(255,107,0,0.15)' : 'rgba(0,200,83,0.15)' }]}>
                      <Text style={[styles.statusBadgeText, { color: isLagging ? Colors.error : status === 'Delivering' ? Colors.primary : Colors.successLight }]}>
                        {status.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Telemetry panel */}
                  <View style={styles.telemetryPanel}>
                    <View style={styles.telemetryItem}>
                      <Battery size={13} color={batColor} />
                      <Text style={[styles.telemetryVal, { color: batColor }]}>{r.battery}%</Text>
                    </View>
                    <View style={styles.telemetryItem}>
                      <Navigation size={13} color="#FFF" />
                      <Text style={styles.telemetryVal}>{r.speed} km/h</Text>
                    </View>
                    <View style={styles.telemetryItem}>
                      <Signal size={13} color={r.networkStatus === 'Poor' ? Colors.error : Colors.successLight} />
                      <Text style={[styles.telemetryVal, { color: r.networkStatus === 'Poor' ? Colors.error : '#FFF' }]}>{r.networkStatus}</Text>
                    </View>
                  </View>

                  {/* Footer order row */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.orderLabel}>Active Job: <Text style={styles.orderVal}>{r.orderId || 'None (In Queue)'}</Text></Text>
                    <Text style={styles.timeLabel}>Seen: {isLagging ? 'Lagging' : '1s ago'}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Analytics Summary */}
        {activeTab === 'metrics' && (
          <View style={styles.metricsContainer}>
            <View style={styles.metricsCard}>
              <Text style={styles.metricsTitle}>Incentive Milestones</Text>
              <Text style={styles.metricsSub}>Riders completed 88% of target peak deliveries today.</Text>
            </View>
            <View style={styles.metricsCard}>
              <Text style={styles.metricsTitle}>Dispatch Queue</Text>
              <Text style={styles.metricsSub}>Store preparations completed within 4.5 minutes on average.</Text>
            </View>
          </View>
        )}

        {/* User Roles Access Control Tab */}
        {activeTab === 'users' && (
          <View style={styles.usersTabContainer}>
            {/* Search Input */}
            <View style={styles.userSearchBox}>
              <Search size={16} color="rgba(255,255,255,0.4)" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.userSearchInput}
                placeholder="Search user name or phone..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={userSearchQuery}
                onChangeText={setUserSearchQuery}
              />
              {userSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setUserSearchQuery('')}>
                  <X size={16} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              )}
            </View>

            {usersLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 30 }} />
            ) : filteredUsers.length === 0 ? (
              <View style={styles.emptyUsersBox}>
                <User size={36} color="rgba(255,255,255,0.15)" />
                <Text style={styles.emptyUsersText}>No users found in database.</Text>
              </View>
            ) : (
              filteredUsers.map(user => (
                <View key={user.id} style={styles.userCard}>
                  <View style={styles.userCardHeader}>
                    <View style={styles.userInfoLeft}>
                      <View style={styles.userAvatarBox}>
                        <User size={18} color={Colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.userNameText}>{user.name || 'Anonymous User'}</Text>
                        <Text style={styles.userPhoneText}>{user.phone}</Text>
                      </View>
                    </View>
                    <View style={[styles.userRoleBadge, {
                      backgroundColor: user.role === 'admin' ? 'rgba(79,195,247,0.15)' :
                        user.role === 'store_owner' ? 'rgba(255,107,0,0.15)' :
                        user.role === 'rider' ? 'rgba(0,200,83,0.15)' : 'rgba(255,255,255,0.08)'
                    }]}>
                      <Text style={[styles.userRoleBadgeText, {
                        color: user.role === 'admin' ? '#4FC3F7' :
                          user.role === 'store_owner' ? Colors.primary :
                          user.role === 'rider' ? Colors.successLight : Colors.white
                      }]}>
                        {user.role.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.roleLabelText}>Mutate Access Permission:</Text>
                  <View style={styles.roleButtonGrid}>
                    {(['customer', 'rider', 'store_owner', 'admin'] as const).map(role => (
                      <TouchableOpacity
                        key={role}
                        style={[styles.roleSelectBtn, user.role === role && styles.roleSelectBtnActive]}
                        onPress={() => handleRoleChange(user.id, role)}
                        disabled={isUpdatingRole}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.roleSelectBtnText, user.role === role && styles.roleSelectBtnTextActive]}>
                          {role === 'store_owner' ? 'Store' : role.charAt(0).toUpperCase() + role.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
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
  exitBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },

  scrollContent: { padding: Spacing.lg },

  // Scorecards
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  metricCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', padding: 14, borderRadius: Radius.xl },
  metricVal: { fontFamily: 'BeVietnamPro-ExtraBold', fontSize: 22, color: Colors.white },
  metricLabel: { fontFamily: 'BeVietnamPro-Medium', fontSize: 11, color: Colors.dark.textMuted, marginTop: 4 },

  // Live Map
  mapContainer: { height: 240, borderRadius: Radius.xxl, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', position: 'relative', marginBottom: 20 },
  gridLine: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(255,107,0,0.05)' },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,107,0,0.05)' },
  marker: { position: 'absolute', alignItems: 'center', gap: 4 },
  markerIcon: { borderRadius: 16, alignItems: 'center', justifyContent: 'center', ...Shadows.sm },
  riderTag: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3, ...Shadows.sm },
  riderTagText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 8, color: Colors.white },
  mapLabelContainer: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(12,14,20,0.8)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  mapLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: 9, color: Colors.white, letterSpacing: 0.5 },

  // Tabs
  tabsContainer: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: Radius.full, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  tabActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  tabText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.dark.textMuted },
  tabTextActive: { color: Colors.white },

  // Fleet list
  listSection: {},
  riderCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.xl, padding: 16, marginBottom: 12 },
  riderCardLagging: { borderColor: Colors.error + '40', backgroundColor: 'rgba(186,26,26,0.05)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 12 },
  profileLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,107,0,0.1)', alignItems: 'center', justifyContent: 'center' },
  riderName: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.white },
  riderVehicle: { fontFamily: 'BeVietnamPro-Medium', fontSize: 11, color: Colors.dark.textMuted, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  statusBadgeText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 9 },

  telemetryPanel: { flexDirection: 'row', gap: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  telemetryItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  telemetryVal: { fontFamily: 'BeVietnamPro-Bold', fontSize: 12 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 },
  orderLabel: { fontFamily: 'BeVietnamPro-Medium', fontSize: 11, color: Colors.dark.textMuted },
  orderVal: { color: Colors.white, fontFamily: 'BeVietnamPro-Bold' },
  timeLabel: { fontFamily: 'BeVietnamPro-Medium', fontSize: 11, color: Colors.dark.textMuted },

  // Analytics
  metricsContainer: { gap: 12 },
  metricsCard: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 18, borderRadius: Radius.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  metricsTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.white },
  metricsSub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 13, color: Colors.dark.textMuted, marginTop: 6, lineHeight: 18 },

  // User Management
  usersTabContainer: { gap: 12 },
  userSearchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.full, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 8 },
  userSearchInput: { flex: 1, color: Colors.white, fontFamily: 'BeVietnamPro-Medium', fontSize: 13, padding: 0 },
  emptyUsersBox: { alignItems: 'center', paddingVertical: 40, opacity: 0.7 },
  emptyUsersText: { fontFamily: 'BeVietnamPro-Medium', fontSize: 13, color: Colors.dark.textMuted, marginTop: 8 },
  userCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.04)', borderRadius: Radius.xl, padding: 14, marginBottom: 10 },
  userCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  userInfoLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  userAvatarBox: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,107,0,0.1)', alignItems: 'center', justifyContent: 'center' },
  userNameText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.white },
  userPhoneText: { fontFamily: 'BeVietnamPro-Medium', fontSize: 11, color: Colors.dark.textMuted, marginTop: 1 },
  userRoleBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: Radius.full },
  userRoleBadgeText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 8 },
  roleLabelText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 11, color: Colors.dark.textSecondary, marginBottom: 8 },
  roleButtonGrid: { flexDirection: 'row', gap: 6, justifyContent: 'space-between' },
  roleSelectBtn: { flex: 1, paddingVertical: 8, borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.01)', alignItems: 'center' },
  roleSelectBtnActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  roleSelectBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 10, color: Colors.dark.textSecondary },
  roleSelectBtnTextActive: { color: Colors.white },
});
