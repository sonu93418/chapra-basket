import React, { useState, useEffect, useRef } from 'react';
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
import { Image } from 'expo-image';
import { Animated } from 'react-native';
import {
  MapPin, Bell, Clock, Star, TrendingUp, RefreshCw,
  Map, Store, Package, Check, Phone, MessageCircle, Navigation,
  ShieldAlert, LogOut, Radio, Battery, Signal, UserCheck, Activity, Bike,
  Search, User, X, SlidersHorizontal, Plus, Trash2, Edit, ChevronUp, ChevronDown, Tag
} from '../../src/components/ui/Icon';
import { useGetAdminUsersQuery, useUpdateUserRoleMutation } from '../../src/api/adminApi';
import {
  useGetAdminBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useReorderBannersMutation,
} from '../../src/api/bannersApi';
import { API_BASE_URL } from '../../src/constants';

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
  const [activeTab, setActiveTab] = useState<'fleet' | 'metrics' | 'users' | 'banners'>('fleet');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Drawer Animation States
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-280)).current;

  // Banner Campaign Management states
  const [bannerModalVisible, setBannerModalVisible] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<any>(null);
  
  const [bannerTitle, setBannerTitle] = useState('');
  const [bannerSubtitle, setBannerSubtitle] = useState('');
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerCtaText, setBannerCtaText] = useState('');
  const [bannerClickDestination, setBannerClickDestination] = useState('');
  const [bannerStartDate, setBannerStartDate] = useState('');
  const [bannerEndDate, setBannerEndDate] = useState('');
  const [bannerCampaignType, setBannerCampaignType] = useState('seasonal');
  const [bannerIsActive, setBannerIsActive] = useState(true);
  const [bannerSortOrder, setBannerSortOrder] = useState('0');

  // Trigger drawer transition animation
  useEffect(() => {
    Animated.timing(drawerAnim, {
      toValue: drawerOpen ? 0 : -280,
      duration: 220,
      useNativeDriver: false,
    }).start();
  }, [drawerOpen]);

  // Admin APIs
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useGetAdminUsersQuery(undefined, {
    skip: activeTab !== 'users'
  });
  const [updateUserRole, { isLoading: isUpdatingRole }] = useUpdateUserRoleMutation();

  // Banners admin CRUD APIs
  const { data: banners, isLoading: bannersLoading, refetch: refetchBanners } = useGetAdminBannersQuery(undefined, {
    skip: activeTab !== 'banners'
  });
  const [createBanner] = useCreateBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();
  const [reorderBanners] = useReorderBannersMutation();

  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const baseUrl = API_BASE_URL.replace('/api/v1', '');
    return `${baseUrl}${url}`;
  };

  const openBannerModal = (banner?: any) => {
    if (banner) {
      setSelectedBanner(banner);
      setBannerTitle(banner.title || '');
      setBannerSubtitle(banner.subtitle || '');
      setBannerImageUrl(banner.imageUrl || '');
      setBannerCtaText(banner.ctaText || '');
      setBannerClickDestination(banner.clickDestination || '');
      setBannerStartDate(banner.startDate ? banner.startDate.split('T')[0] : '');
      setBannerEndDate(banner.endDate ? banner.endDate.split('T')[0] : '');
      setBannerCampaignType(banner.campaignType || 'seasonal');
      setBannerIsActive(banner.isActive);
      setBannerSortOrder(String(banner.sortOrder || '0'));
    } else {
      setSelectedBanner(null);
      setBannerTitle('');
      setBannerSubtitle('');
      setBannerImageUrl('');
      setBannerCtaText('');
      setBannerClickDestination('');
      setBannerStartDate('');
      setBannerEndDate('');
      setBannerCampaignType('seasonal');
      setBannerIsActive(true);
      setBannerSortOrder(String(banners ? banners.length + 1 : '1'));
    }
    setBannerModalVisible(true);
  };

  const handleSaveBanner = async () => {
    if (!bannerTitle.trim() || !bannerImageUrl.trim()) {
      Alert.alert('Error', 'Title and Image URL are required fields.');
      return;
    }

    const payload = {
      title: bannerTitle,
      subtitle: bannerSubtitle || undefined,
      imageUrl: bannerImageUrl,
      ctaText: bannerCtaText || undefined,
      clickDestination: bannerClickDestination || undefined,
      startDate: bannerStartDate ? new Date(bannerStartDate).toISOString() : undefined,
      endDate: bannerEndDate ? new Date(bannerEndDate).toISOString() : undefined,
      campaignType: bannerCampaignType,
      isActive: bannerIsActive,
      sortOrder: Number(bannerSortOrder) || 0,
    };

    try {
      if (selectedBanner) {
        await updateBanner({ id: selectedBanner.id, ...payload }).unwrap();
        Alert.alert('Success', 'Campaign banner updated successfully');
      } else {
        await createBanner(payload).unwrap();
        Alert.alert('Success', 'New campaign banner created successfully');
      }
      setBannerModalVisible(false);
      refetchBanners();
    } catch (err: any) {
      Alert.alert('Error', err?.data?.error || 'Failed to save banner');
    }
  };

  const handleDeleteBanner = (id: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to remove this promotion campaign?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBanner(id).unwrap();
              refetchBanners();
              Alert.alert('Success', 'Banner deleted successfully');
            } catch (err: any) {
              Alert.alert('Error', 'Failed to delete banner');
            }
          }
        }
      ]
    );
  };

  const handleMoveBanner = async (index: number, direction: 'up' | 'down') => {
    if (!banners) return;
    const list = [...banners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const current = list[index];
    const target = list[targetIndex];
    
    const reorders = [
      { id: current.id, sortOrder: target.sortOrder },
      { id: target.id, sortOrder: current.sortOrder }
    ];

    try {
      await reorderBanners({ reorders }).unwrap();
      refetchBanners();
    } catch (err) {
      Alert.alert('Error', 'Failed to update order');
    }
  };

  const handleToggleActive = async (banner: any) => {
    try {
      await updateBanner({ id: banner.id, isActive: !banner.isActive }).unwrap();
      refetchBanners();
    } catch (err) {
      Alert.alert('Error', 'Failed to toggle status');
    }
  };

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
            <TouchableOpacity style={styles.menuToggleButton} onPress={() => setDrawerOpen(true)}>
              <SlidersHorizontal size={20} color={Colors.primary} strokeWidth={2.5} />
            </TouchableOpacity>
            <View style={{ marginLeft: 6 }}>
              <Text style={styles.appBarTitle}>Operations Control</Text>
              <Text style={styles.appBarSub}>Blink Box Hub Dispatch Center</Text>
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
            style={[styles.tab, activeTab === 'banners' && styles.tabActive]}
            onPress={() => setActiveTab('banners')}
          >
            <Text style={[styles.tabText, activeTab === 'banners' && styles.tabTextActive]}>Promotions</Text>
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

        {/* Dynamic Promotional Banners Tab */}
        {activeTab === 'banners' && (
          <View style={styles.bannersTabContainer}>
            <View style={styles.bannersHeaderRow}>
              <Text style={styles.sectionTitle}>Campaign Banners</Text>
              <TouchableOpacity style={styles.addBannerBtn} onPress={() => openBannerModal()}>
                <Plus size={14} color={Colors.white} strokeWidth={2.5} />
                <Text style={styles.addBannerBtnText}>Add Banner</Text>
              </TouchableOpacity>
            </View>

            {bannersLoading ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 40 }} />
            ) : banners && banners.length === 0 ? (
              <View style={styles.emptyBannersBox}>
                <Tag size={48} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyBannersText}>No promotions configured.</Text>
                <Text style={styles.emptyBannersSub}>Create a banner campaign to display on the customer home page.</Text>
              </View>
            ) : (
              <View style={{ gap: 14 }}>
                {banners?.map((banner, index) => (
                  <View key={banner.id} style={[styles.adminBannerCard, !banner.isActive && styles.adminBannerCardInactive]}>
                    <View style={styles.adminBannerImageContainer}>
                      <Image
                        source={{ uri: getFullImageUrl(banner.imageUrl) }}
                        style={styles.adminBannerImage}
                        contentFit="cover"
                      />
                      <View style={[styles.campaignTypeTag, { backgroundColor: banner.isActive ? Colors.primary : Colors.dark.textMuted }]}>
                        <Text style={styles.campaignTypeTagText}>{(banner.campaignType || 'promo').toUpperCase()}</Text>
                      </View>
                    </View>

                    <View style={styles.adminBannerDetails}>
                      <Text style={styles.adminBannerTitleText}>{banner.title}</Text>
                      {banner.subtitle ? <Text style={styles.adminBannerSubtitleText}>{banner.subtitle}</Text> : null}
                      <Text style={styles.adminBannerDestText}>Destination: <Text style={{ color: Colors.white }}>{banner.clickDestination || '/'}</Text></Text>
                      
                      <View style={styles.adminBannerInfoRow}>
                        <Text style={styles.adminBannerInfoLabel}>
                          Clicks: <Text style={{ color: Colors.primary, fontFamily: 'BeVietnamPro-Bold' }}>{banner.clicks || 0}</Text>
                        </Text>
                        <Text style={styles.adminBannerInfoLabel}>
                          Order: <Text style={{ color: Colors.white }}>{banner.sortOrder}</Text>
                        </Text>
                      </View>

                      {banner.startDate || banner.endDate ? (
                        <Text style={styles.adminBannerDatesText}>
                          Sched: {banner.startDate ? banner.startDate.split('T')[0] : 'Any'} to {banner.endDate ? banner.endDate.split('T')[0] : 'Any'}
                        </Text>
                      ) : (
                        <Text style={styles.adminBannerDatesText}>Sched: Always Active</Text>
                      )}

                      <View style={styles.adminBannerActionRow}>
                        <TouchableOpacity
                          style={[styles.toggleBtn, banner.isActive ? styles.toggleBtnActive : styles.toggleBtnInactive]}
                          onPress={() => handleToggleActive(banner)}
                        >
                          <Text style={styles.toggleBtnText}>{banner.isActive ? 'Active' : 'Paused'}</Text>
                        </TouchableOpacity>

                        <View style={{ flexDirection: 'row', gap: 6, marginLeft: 12 }}>
                          <TouchableOpacity
                            style={[styles.moveBtn, index === 0 && styles.moveBtnDisabled]}
                            disabled={index === 0}
                            onPress={() => handleMoveBanner(index, 'up')}
                          >
                            <ChevronUp size={16} color={index === 0 ? 'rgba(255,255,255,0.2)' : Colors.white} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.moveBtn, index === (banners?.length || 0) - 1 && styles.moveBtnDisabled]}
                            disabled={index === (banners?.length || 0) - 1}
                            onPress={() => handleMoveBanner(index, 'down')}
                          >
                            <ChevronDown size={16} color={index === (banners?.length || 0) - 1 ? 'rgba(255,255,255,0.2)' : Colors.white} />
                          </TouchableOpacity>
                        </View>

                        <View style={{ flexDirection: 'row', gap: 8, marginLeft: 'auto' }}>
                          <TouchableOpacity style={styles.editBtn} onPress={() => openBannerModal(banner)}>
                            <Edit size={14} color={Colors.white} />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteBanner(banner.id)}>
                            <Trash2 size={14} color={Colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Slide-out Operations Drawer Menu Overlay */}
      {drawerOpen && (
        <View style={StyleSheet.absoluteFillObject}>
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={() => setDrawerOpen(false)}
          />
          <Animated.View style={[styles.drawerPanel, { transform: [{ translateX: drawerAnim }] }]}>
            <SafeAreaView edges={['top', 'bottom']} style={{ flex: 1 }}>
              <View style={styles.drawerHeader}>
                <Activity size={18} color={Colors.primary} strokeWidth={2.5} />
                <View style={{ marginLeft: 8 }}>
                  <Text style={styles.drawerTitle}>Operations Hub</Text>
                  <Text style={styles.drawerSub}>Chapra Central Hub Desk</Text>
                </View>
              </View>

              <View style={styles.drawerMenuContainer}>
                {[
                  { id: 'fleet', label: 'Hub Dispatch Center', icon: Bike },
                  { id: 'users', label: 'User Access Roles', icon: UserCheck },
                  { id: 'banners', label: 'Campaign Manager', icon: Tag },
                  { id: 'metrics', label: 'Metrics & Analytics', icon: TrendingUp },
                ].map(item => {
                  const active = activeTab === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.drawerMenuItem, active && styles.drawerMenuItemActive]}
                      onPress={() => {
                        setActiveTab(item.id as any);
                        setDrawerOpen(false);
                      }}
                      activeOpacity={0.8}
                    >
                      <item.icon size={18} color={active ? Colors.primary : 'rgba(255,255,255,0.6)'} />
                      <Text style={[styles.drawerMenuLabel, active && styles.drawerMenuLabelActive]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={{ marginTop: 'auto', paddingVertical: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
                <TouchableOpacity 
                  style={styles.drawerLogoutBtn} 
                  onPress={() => {
                    setDrawerOpen(false);
                    router.replace('/(auth)/user-type');
                  }}
                >
                  <LogOut size={16} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.drawerLogoutText}>Exit Operations</Text>
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      )}

      {/* Create / Edit Banner Campaign Modal */}
      {bannerModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedBanner ? 'Modify Campaign' : 'Schedule Promotion'}</Text>
              <TouchableOpacity onPress={() => setBannerModalVisible(false)}>
                <X size={18} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalScroll}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Title (Headline) *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={bannerTitle}
                  onChangeText={setBannerTitle}
                  placeholder="Welcome to Blink Box"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Subtitle (Subheadline)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={bannerSubtitle}
                  onChangeText={setBannerSubtitle}
                  placeholder="Fresh Groceries Delivered in Minutes"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Image URL *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={bannerImageUrl}
                  onChangeText={setBannerImageUrl}
                  placeholder="/static/banners/welcome.png"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CTA Text</Text>
                <TextInput
                  style={styles.modalInput}
                  value={bannerCtaText}
                  onChangeText={setBannerCtaText}
                  placeholder="Start Shopping"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Click Destination (Category slug or page path)</Text>
                <TextInput
                  style={styles.modalInput}
                  value={bannerClickDestination}
                  onChangeText={setBannerClickDestination}
                  placeholder="grocery"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Start Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={bannerStartDate}
                    onChangeText={setBannerStartDate}
                    placeholder="2026-06-12"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>End Date (YYYY-MM-DD)</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={bannerEndDate}
                    onChangeText={setBannerEndDate}
                    placeholder="2026-07-12"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Campaign Type</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={bannerCampaignType}
                    onChangeText={setBannerCampaignType}
                    placeholder="welcome / seasonal / flash"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Sort Order Weight</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={bannerSortOrder}
                    onChangeText={setBannerSortOrder}
                    placeholder="0"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10, marginBottom: 12 }}>
                <TouchableOpacity
                  style={[styles.checkboxContainer, bannerIsActive && styles.checkboxActive]}
                  onPress={() => setBannerIsActive(!bannerIsActive)}
                >
                  {bannerIsActive && <Check size={12} color={Colors.white} />}
                </TouchableOpacity>
                <Text style={{ fontFamily: 'BeVietnamPro-Medium', fontSize: 13, color: Colors.white }}>
                  Enable Campaign Visibility (isActive)
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setBannerModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBanner}>
                <Text style={styles.saveBtnText}>Save Campaign</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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

  // Drawer Styles
  drawerBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100 },
  drawerPanel: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 280, backgroundColor: '#0B0D14', borderRightWidth: 1, borderRightColor: 'rgba(255,255,255,0.07)', zIndex: 101, padding: 20 },
  drawerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', marginBottom: 20 },
  drawerTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.white },
  drawerSub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 11, color: Colors.dark.textMuted },
  drawerMenuContainer: { gap: 6 },
  drawerMenuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16, borderRadius: Radius.lg },
  drawerMenuItemActive: { backgroundColor: 'rgba(255,107,0,0.12)' },
  drawerMenuLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  drawerMenuLabelActive: { color: Colors.primary },
  drawerLogoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  drawerLogoutText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: 'rgba(255,255,255,0.6)' },
  menuToggleButton: { padding: 4 },

  // Banners Management styles
  bannersTabContainer: { gap: 14 },
  bannersHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  addBannerBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: Radius.full },
  addBannerBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 12, color: Colors.white },
  emptyBannersBox: { alignItems: 'center', paddingVertical: 48, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: Radius.xl, borderStyle: 'dashed', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)' },
  emptyBannersText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 15, color: Colors.white, marginTop: 12 },
  emptyBannersSub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.dark.textMuted, textAlign: 'center', paddingHorizontal: 32, marginTop: 4, lineHeight: 18 },
  sectionTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 18, color: Colors.white },
  
  adminBannerCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', borderRadius: Radius.xl, overflow: 'hidden' },
  adminBannerCardInactive: { opacity: 0.55 },
  adminBannerImageContainer: { height: 120, position: 'relative' },
  adminBannerImage: { width: '100%', height: '100%' },
  campaignTypeTag: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.sm },
  campaignTypeTagText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 8, color: Colors.white },
  
  adminBannerDetails: { padding: 16 },
  adminBannerTitleText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.white },
  adminBannerSubtitleText: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.dark.textMuted, marginTop: 2 },
  adminBannerDestText: { fontFamily: 'BeVietnamPro-Medium', fontSize: 12, color: Colors.dark.textSecondary, marginTop: 8 },
  adminBannerInfoRow: { flexDirection: 'row', gap: 20, marginTop: 6 },
  adminBannerInfoLabel: { fontFamily: 'BeVietnamPro-Medium', fontSize: 11, color: Colors.dark.textMuted },
  adminBannerDatesText: { fontFamily: 'BeVietnamPro-Medium', fontSize: 11, color: Colors.dark.textMuted, marginTop: 4 },
  
  adminBannerActionRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 12 },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1 },
  toggleBtnActive: { backgroundColor: 'rgba(0,200,83,0.15)', borderColor: 'rgba(0,200,83,0.3)' },
  toggleBtnInactive: { backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)' },
  toggleBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 10, color: Colors.successLight },
  moveBtn: { width: 32, height: 32, borderRadius: Radius.sm, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  moveBtnDisabled: { opacity: 0.3 },
  editBtn: { width: 32, height: 32, borderRadius: Radius.sm, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 32, height: 32, borderRadius: Radius.sm, backgroundColor: 'rgba(186,26,26,0.1)', alignItems: 'center', justifyContent: 'center' },

  // Modal styles
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 200 },
  modalContainer: { width: '100%', maxHeight: '85%', backgroundColor: '#0F121C', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: Radius.xxl, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 12, marginBottom: 14 },
  modalTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.white },
  modalScroll: { gap: 12 },
  inputGroup: { gap: 6 },
  inputLabel: { fontFamily: 'BeVietnamPro-Bold', fontSize: 11, color: Colors.dark.textSecondary },
  modalInput: { height: 42, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: Radius.lg, paddingHorizontal: 12, color: Colors.white, fontFamily: 'BeVietnamPro-Medium', fontSize: 13 },
  checkboxContainer: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  modalFooter: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingTop: 14, marginTop: 14 },
  cancelBtn: { flex: 1, paddingVertical: 12, borderRadius: Radius.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  cancelBtnText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.dark.textSecondary },
  saveBtn: { flex: 2, backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: Radius.xl, alignItems: 'center' },
  saveBtnText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 13, color: Colors.white },
});
