import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions, Linking, PanResponder,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, Rect, Defs, RadialGradient, Stop, Ellipse, Line } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { Colors, Radius, Spacing, Shadows } from '../../src/theme';
import { useAppSelector, useAppDispatch } from '../../src/hooks/useAppDispatch';
import { useOrderTracking } from '../../src/hooks/useSocket';
import { updateOrderStatus } from '../../src/features/orders/ordersSlice';
import {
  ArrowLeft, Phone, MessageCircle, MapPin, Store,
  Bike, CheckCircle, Clock, Package, X,
  Navigation, User, Battery, ShieldAlert, HelpCircle,
  Plus, Minus, Share2, Copy
} from '../../src/components/ui/Icon';

const { width, height } = Dimensions.get('window');

// Try loading native maps conditionally
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polyline = Maps.Polyline;
} catch {
  console.log('[Maps] Native MapView fallback active');
}

// Visual Boundaries for Vector Map Viewport Projection
const MAP_BOUNDS = {
  minLat: 25.7720,
  maxLat: 25.7795,
  minLng: 84.7335,
  maxLng: 84.7385,
};

// Route coordinates representing realistic streets in Chapra
const ROUTE_POINTS = [
  { latitude: 25.7782, longitude: 84.7352 }, // Store (Park Avenue)
  { latitude: 25.7782, longitude: 84.7368 }, // Corner 1 (Park Ave & Temp St)
  { latitude: 25.7765, longitude: 84.7368 }, // Corner 2 (Temp St & Market Hrd)
  { latitude: 25.7765, longitude: 84.7374 }, // Corner 3 (Market Hrd & Res Lane)
  { latitude: 25.7740, longitude: 84.7374 }, // Customer (Res Lane & Bypass)
];

interface Point {
  latitude: number;
  longitude: number;
}

// Translate geographical coordinates to absolute layout offsets for the isometric city map canvas (500 x 400 viewBox)
function getIsometricCoords(lat: number, lng: number) {
  const pctX = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng));
  const pctY = 1 - ((lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat));
  
  const u = (pctX - 0.5) * 240;
  const v = (pctY - 0.5) * 240;
  
  const rad = 30 * Math.PI / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  
  const screenX = 250 + (u - v) * cosA;
  const screenY = 200 + (u + v) * sinA;
  
  return { left: screenX, top: screenY };
}

const getIsometricCoordsWorklet = (lat: number, lng: number) => {
  'worklet';
  const pctX = ((lng - MAP_BOUNDS.minLng) / (MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng));
  const pctY = 1 - ((lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat));
  
  const u = (pctX - 0.5) * 240;
  const v = (pctY - 0.5) * 240;
  
  const rad = 30 * Math.PI / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);
  
  const screenX = 250 + (u - v) * cosA;
  const screenY = 200 + (u + v) * sinA;
  
  return { x: screenX, y: screenY };
};

// Convert polyline coordinates to SVG line points matching isometric vector canvas coordinates
const pointsToSvgPath = (pts: Point[]) => {
  if (pts.length === 0) return '';
  return pts.map((p, idx) => {
    const pos = getIsometricCoords(p.latitude, p.longitude);
    return `${idx === 0 ? 'M' : 'L'} ${pos.left} ${pos.top}`;
  }).join(' ');
};

// Smoke Puff Component for exhaust trails
function SmokeBubble({ progress }: { progress: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const p = progress.value;
    const opacity = (1 - p) * 0.45;
    const scale = 0.35 + p * 1.3;
    const ty = p * 13; // Drift backwards along direction angle
    const tx = Math.sin(p * Math.PI * 2) * 2.5; // Slight drift
    return {
      transform: [
        { translateY: ty },
        { translateX: tx },
        { scale }
      ],
      opacity,
    };
  });

  return (
    <Animated.View style={[styles.smokeBubble, style]} />
  );
}

// High-Fidelity Animated Delivery Rider Component (Side-Isometric View)
function RiderSvgContainer({ suspensionY, leanAngle, shadowScale, shadowOpacity, smoke1, smoke2, smoke3 }: {
  suspensionY: SharedValue<number>,
  leanAngle: SharedValue<number>,
  shadowScale: SharedValue<number>,
  shadowOpacity: SharedValue<number>,
  smoke1: SharedValue<number>,
  smoke2: SharedValue<number>,
  smoke3: SharedValue<number>
}) {
  const suspensionStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: suspensionY.value }],
  }));

  const leanStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${leanAngle.value}deg` },
      { skewX: `${-leanAngle.value * 0.22}deg` }
    ],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    transform: [{ scale: shadowScale.value }],
    opacity: shadowOpacity.value,
  }));

  return (
    <View style={styles.riderWrapper}>
      {/* Dynamic Exhaust Smoke Trails */}
      <SmokeBubble progress={smoke1} />
      <SmokeBubble progress={smoke2} />
      <SmokeBubble progress={smoke3} />

      {/* Soft Drop Shadow Layer */}
      <Animated.View style={[styles.riderShadow, shadowStyle]}>
        <Svg width="56" height="56" viewBox="0 0 64 64">
          <Ellipse cx="32" cy="44" rx="20" ry="8" fill="#1E293B" />
        </Svg>
      </Animated.View>

      {/* Scooter & Driver Layer (Side-Isometric) */}
      <Animated.View style={[styles.riderBody, suspensionStyle, leanStyle]}>
        <Svg width="58" height="58" viewBox="0 0 64 64" fill="none">
          {/* Back Wheel */}
          <Circle cx="16" cy="42" r="6" fill="#1E293B" stroke="#475569" strokeWidth="2.5" />
          <Circle cx="16" cy="42" r="2.5" fill="#64748B" />

          {/* Front Wheel */}
          <Circle cx="46" cy="42" r="6" fill="#1E293B" stroke="#475569" strokeWidth="2.5" />
          <Circle cx="46" cy="42" r="2.5" fill="#64748B" />

          {/* Scooter Chassis connection */}
          <Path d="M 16,42 L 32,44 L 46,42" stroke="#334155" strokeWidth="3" strokeLinecap="round" />

          {/* Branded Scooter Side Panels & Floorboard (Blue body, yellow accents) */}
          <Path d="M 20,40 L 36,41 L 39,26 L 35,26 Z" fill="#1D4ED8" />
          <Path d="M 14,40 C 14,30 22,30 26,40 Z" fill="#F59E0B" />

          {/* Steering handlebar stem */}
          <Path d="M 43,42 L 39,22" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
          <Line x1="39" y1="22" x2="35" y2="18" stroke="#334155" strokeWidth="3" />
          <Circle cx="35" cy="18" r="2" fill="#1E293B" />

          {/* Branded Delivery Cargo Box (Isometric 3D Box on back rack - Brand Orange) */}
          {/* Front vertical face */}
          <Path d="M 8,32 L 18,32 L 18,20 L 8,20 Z" fill="#CC5500" />
          {/* Side face */}
          <Path d="M 18,32 L 24,28 L 24,16 L 18,20 Z" fill="#FF6B00" />
          {/* Top face */}
          <Path d="M 8,20 L 18,20 L 24,16 L 14,16 Z" fill="#FFA366" />
          {/* Logo Stripe */}
          <Path d="M 12,32 L 12,20" stroke="#FFF" strokeWidth="1.5" />

          {/* Rider legs */}
          <Path d="M 24,36 L 31,37 L 33,26" stroke="#1E293B" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Rider Uniform Torso */}
          <Path d="M 23,28 C 23,19 32,19 32,28 Z" fill="#2563EB" />
          {/* Branded Delivery Bag harness */}
          <Path d="M 23,24 H 28" stroke="#1E293B" strokeWidth="1.5" />
          {/* Rider Arm reaching handle */}
          <Path d="M 28,23 L 36,20" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" />

          {/* Helmet (Blue) */}
          <Circle cx="28" cy="15" r="5" fill="#1D4ED8" stroke="#FFF" strokeWidth="0.8" />
          {/* Visor */}
          <Path d="M 28,13 C 30,13 32,15 32,17 Z" fill="#0F172A" />
        </Svg>
      </Animated.View>

      {/* Floating Scooter Badge Marker above rider */}
      <View style={styles.riderMarkerBadge}>
        <View style={styles.riderBadgeCircle}>
          <Bike size={13} color="#FFF" strokeWidth={2.5} />
        </View>
        <View style={styles.riderBadgeTriangle} />
      </View>
    </View>
  );
}

// Custom Premium Isometric Store Building SVG Marker (Green Badge)
function StoreMarker() {
  return (
    <View style={styles.markerContainer as any}>
      <Svg width="46" height="46" viewBox="0 0 46 46" fill="none">
        {/* Soft shadow */}
        <Circle cx="23" cy="25" r="17" fill="rgba(15,23,42,0.15)" />
        {/* White Border Ring */}
        <Circle cx="23" cy="23" r="18" fill="#FFF" />
        {/* Green Core */}
        <Circle cx="23" cy="23" r="15" fill="#006E2F" />
        {/* Store Icon */}
        <Path d="M 16,27 V 21 L 23,16 L 30,21 V 27 Z" fill="#FFF" />
        <Path d="M 14,21 H 32 V 23 H 14 Z" fill="#FF6B00" />
      </Svg>
    </View>
  );
}

// Custom Premium Isometric Customer House SVG Marker (Blue Badge)
function CustomerHomeMarker() {
  return (
    <View style={styles.markerContainer as any}>
      <Svg width="46" height="46" viewBox="0 0 46 46" fill="none">
        {/* Soft shadow */}
        <Circle cx="23" cy="25" r="17" fill="rgba(15,23,42,0.15)" />
        {/* White Border Ring */}
        <Circle cx="23" cy="23" r="18" fill="#FFF" />
        {/* Blue Core */}
        <Circle cx="23" cy="23" r="15" fill="#005BFF" />
        {/* Home Icon */}
        <Path d="M 16,28 V 22 H 20 V 28 Z" fill="#FFF" />
        <Path d="M 14,22 L 23,15 L 32,22 H 28 V 28 H 18 V 22 Z" fill="#FFF" />
      </Svg>
    </View>
  );
}

// Volumetric 3D Building Generator inside SVG
function IsometricBuilding({ u, v, w, d, h, color = '#E2E8F0', shadowColor = '#CBD5E1', roofColor = '#F8FAFC', windows = true, windowColor = '#93C5FD' }: {
  u: number;
  v: number;
  w: number;
  d: number;
  h: number;
  color?: string;
  shadowColor?: string;
  roofColor?: string;
  windows?: boolean;
  windowColor?: string;
}) {
  const rad = 30 * Math.PI / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  const getPos = (uVal: number, vVal: number) => {
    return {
      x: 250 + (uVal - vVal) * cosA,
      y: 200 + (uVal + vVal) * sinA,
    };
  };

  const bBack = getPos(u, v);
  const bLeft = getPos(u, v + d);
  const bRight = getPos(u + w, v);
  const bFront = getPos(u + w, v + d);

  const rBack = { x: bBack.x, y: bBack.y - h };
  const rLeft = { x: bLeft.x, y: bLeft.y - h };
  const rRight = { x: bRight.x, y: bRight.y - h };
  const rFront = { x: bFront.x, y: bFront.y - h };

  const leftFace = `M ${bFront.x} ${bFront.y} L ${bLeft.x} ${bLeft.y} L ${rLeft.x} ${rLeft.y} L ${rFront.x} ${rFront.y} Z`;
  const rightFace = `M ${bFront.x} ${bFront.y} L ${bRight.x} ${bRight.y} L ${rRight.x} ${rRight.y} L ${rFront.x} ${rFront.y} Z`;
  const roofFace = `M ${rBack.x} ${rBack.y} L ${rLeft.x} ${rLeft.y} L ${rFront.x} ${rFront.y} L ${rRight.x} ${rRight.y} Z`;

  const windowElements: React.JSX.Element[] = [];
  if (windows && h > 15) {
    const rows = Math.floor(h / 12);
    const cols = Math.floor(w / 14);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const hOffset = h - (r * 12 + 8);
        const uFrac = (c + 0.3) / cols;
        const uW = u + w;
        const vW = v + d - uFrac * d;
        const pos = getPos(uW, vW);
        const winX = pos.x;
        const winY = pos.y - hOffset;
        
        const wSz = 3;
        const wH = 4;
        const wPoly = `M ${winX} ${winY} L ${winX + wSz * cosA} ${winY - wSz * sinA} L ${winX + wSz * cosA} ${winY - wSz * sinA + wH} L ${winX} ${winY + wH} Z`;
        windowElements.push(
          <Path key={`w-${r}-${c}`} d={wPoly} fill={windowColor} opacity={0.9} />
        );
      }
    }
  }

  return (
    <>
      <Path d={leftFace} fill={shadowColor} stroke="rgba(0,0,0,0.05)" strokeWidth={0.5} />
      <Path d={rightFace} fill={color} stroke="rgba(0,0,0,0.05)" strokeWidth={0.5} />
      <Path d={roofFace} fill={roofColor} stroke="rgba(0,0,0,0.05)" strokeWidth={0.5} />
      {windowElements}
    </>
  );
}

// 3D Tree Renderer inside SVG
function IsometricTree({ u, v, isDarkMode }: { u: number; v: number; isDarkMode?: boolean }) {
  const rad = 30 * Math.PI / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  const x = 250 + (u - v) * cosA;
  const y = 200 + (u + v) * sinA;

  const crownColor1 = isDarkMode ? '#065F46' : '#22C55E';
  const crownColor2 = isDarkMode ? '#064E3B' : '#15803D';
  const highlightColor = isDarkMode ? '#34D399' : '#A7F3D0';

  return (
    <>
      {/* Soft Shadow */}
      <Ellipse cx={x} cy={y + 1} rx={7} ry={3} fill="#000" opacity={isDarkMode ? 0.25 : 0.12} />
      {/* Trunk */}
      <Line x1={x} y1={y} x2={x} y2={y - 12} stroke={isDarkMode ? '#451A03' : '#78350F'} strokeWidth={2} strokeLinecap="round" />
      
      {/* Volumetric Crown: Bottom Leaf Cluster */}
      <Circle cx={x} cy={y - 12} r={8} fill={crownColor2} />
      {/* Middle Leaf Cluster */}
      <Circle cx={x - 2} cy={y - 16} r={7.5} fill={crownColor1} />
      {/* Top Leaf Cluster */}
      <Circle cx={x + 2} cy={y - 20} r={6} fill={crownColor1} />
      
      {/* Tree Highlight for 3D Volume */}
      <Circle cx={x - 3} cy={y - 18} r={3.2} fill={highlightColor} opacity={isDarkMode ? 0.25 : 0.4} />
    </>
  );
}

// 7-Stage Order Timeline Configuration
interface TimelineStep {
  id: string;
  label: string;
  sublabel: string;
  Icon: any;
  done: boolean;
  active: boolean;
}

const getTimeline = (status: string): TimelineStep[] => [
  { id: 'placed', label: 'Order Placed', sublabel: 'Your order is confirmed', Icon: CheckCircle, done: true, active: status === 'pending' },
  { id: 'confirmed', label: 'Store Confirmed', sublabel: 'Store accepted your order', Icon: CheckCircle, done: ['confirmed', 'preparing', 'packed', 'picked_up', 'out_for_delivery', 'delivered'].includes(status), active: status === 'confirmed' },
  { id: 'preparing', label: 'Preparing', sublabel: 'Store is packing your items', Icon: Package, done: ['preparing', 'packed', 'picked_up', 'out_for_delivery', 'delivered'].includes(status), active: status === 'preparing' },
  { id: 'packed', label: 'Packed Ready', sublabel: 'Order is ready for pick up', Icon: Package, done: ['packed', 'picked_up', 'out_for_delivery', 'delivered'].includes(status), active: status === 'packed' },
  { id: 'picked_up', label: 'Picked Up', sublabel: 'Rider collected your order', Icon: Bike, done: ['picked_up', 'out_for_delivery', 'delivered'].includes(status), active: status === 'picked_up' },
  { id: 'delivery', label: 'Out for Delivery', sublabel: 'Rider is heading to you', Icon: Navigation, done: status === 'delivered', active: status === 'out_for_delivery' },
  { id: 'delivered', label: 'Delivered', sublabel: 'Enjoy your essentials!', Icon: CheckCircle, done: status === 'delivered', active: false },
];

const STATUS_COPY: Record<string, { title: string; subtitle: string }> = {
  pending: { title: 'Order Placed', subtitle: 'Waiting for store confirmation' },
  confirmed: { title: 'Confirmed', subtitle: 'Store accepted your order' },
  preparing: { title: 'Being Prepared', subtitle: 'Store is packing your items' },
  packed: { title: 'Packed Ready', subtitle: 'Order is ready for pickup' },
  picked_up: { title: 'Picked Up', subtitle: 'Rider collected your order' },
  out_for_delivery: { title: 'Out for Delivery', subtitle: 'Your order is on the way!' },
  delivered: { title: 'Delivered', subtitle: 'Order delivered successfully' },
  cancelled: { title: 'Cancelled', subtitle: 'This order was cancelled' },
};

// Route interpolation math helper to place rider locks along polylines
function interpolateRoute(points: Point[], progress: number) {
  if (points.length === 0) return { latitude: 0, longitude: 0, heading: 0, segmentIndex: 0, fraction: 0 };
  if (points.length === 1) return { latitude: points[0].latitude, longitude: points[0].longitude, heading: 0, segmentIndex: 0, fraction: 0 };

  const lengths: number[] = [];
  let totalLength = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const lat1 = points[i].latitude;
    const lng1 = points[i].longitude;
    const lat2 = points[i+1].latitude;
    const lng2 = points[i+1].longitude;
    const len = Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2));
    lengths.push(len);
    totalLength += len;
  }

  const targetDist = Math.max(0, Math.min(1, progress)) * totalLength;
  let accumulated = 0;
  let segmentIndex = 0;
  let fraction = 0;

  for (let i = 0; i < lengths.length; i++) {
    const nextAccumulated = accumulated + lengths[i];
    if (targetDist >= accumulated && targetDist <= nextAccumulated) {
      segmentIndex = i;
      fraction = lengths[i] > 0 ? (targetDist - accumulated) / lengths[i] : 0;
      break;
    }
    accumulated = nextAccumulated;
    if (i === lengths.length - 1) {
      segmentIndex = i;
      fraction = 1;
    }
  }

  const p1 = points[segmentIndex];
  const p2 = points[segmentIndex + 1] || p1;

  const latitude = p1.latitude + fraction * (p2.latitude - p1.latitude);
  const longitude = p1.longitude + fraction * (p2.longitude - p1.longitude);

  const dLat = p2.latitude - p1.latitude;
  const dLng = p2.longitude - p1.longitude;
  let heading = (Math.atan2(dLng, dLat) * 180) / Math.PI;
  if (heading < 0) heading += 360;

  return { latitude, longitude, heading, segmentIndex, fraction };
}

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const order = useAppSelector(s => s.orders.items.find(item => item.id === id));
  
  // Real GPS and Socket telemetry updates
  const tracking = useOrderTracking(id ?? null);
  const liveLocation = useAppSelector(s => id ? s.orders.riderLocations[id] : undefined);
  
  // Simulation and interactive tracking configuration
  const [isSimulating, setIsSimulating] = useState(false);
  const [simProgress, setSimProgress] = useState(0);
  const [simSpeed, setSimSpeed] = useState(0);
  const [simEta, setSimEta] = useState(12);

  // Dark mode, Fullscreen mode & Toast notification states
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useSharedValue(0);

  // Bottom Sheet Draggable Gesture state variables
  const sheetHeight = 520;
  const collapsedOffset = 360;
  const sheetTranslateY = useSharedValue(collapsedOffset);
  const startTranslateY = useRef(collapsedOffset);

  const bottomSheetPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        startTranslateY.current = sheetTranslateY.value;
      },
      onPanResponderMove: (_, gestureState) => {
        const newVal = startTranslateY.current + gestureState.dy;
        sheetTranslateY.value = Math.max(0, Math.min(collapsedOffset, newVal));
      },
      onPanResponderRelease: (_, gestureState) => {
        const currentVal = sheetTranslateY.value;
        const velocityY = gestureState.vy;
        
        let target = collapsedOffset;
        if (velocityY < -0.3 || (velocityY <= 0.3 && currentVal < collapsedOffset * 0.5)) {
          target = 0; // Snap expanded
        } else {
          target = collapsedOffset; // Snap collapsed
        }
        
        sheetTranslateY.value = withTiming(target, {
          duration: 250,
          easing: Easing.out(Easing.ease),
        });
        startTranslateY.current = target;
      },
    })
  ).current;

  // Sync sheet translation when fullscreen toggles
  useEffect(() => {
    if (isFullscreen) {
      sheetTranslateY.value = withTiming(sheetHeight, { duration: 250 });
    } else {
      sheetTranslateY.value = withTiming(collapsedOffset, { duration: 250 });
    }
  }, [isFullscreen]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    toastOpacity.value = withTiming(1, { duration: 200 });
    setTimeout(() => {
      toastOpacity.value = withTiming(0, { duration: 250 });
      setTimeout(() => setShowToast(false), 250);
    }, 2000);
  };

  // Constant anchors
  const storeLat = ROUTE_POINTS[0].latitude;
  const storeLng = ROUTE_POINTS[0].longitude;
  const customerLat = ROUTE_POINTS[ROUTE_POINTS.length - 1].latitude;
  const customerLng = ROUTE_POINTS[ROUTE_POINTS.length - 1].longitude;

  // Reanimated shared values
  const animatedLat = useSharedValue(storeLat);
  const animatedLng = useSharedValue(storeLng);
  const animatedHeading = useSharedValue(90);
  const leanAngle = useSharedValue(0);
  const suspensionY = useSharedValue(0);
  const shadowScale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.4);

  // Smoke trails phase shared values
  const smoke1 = useSharedValue(0);
  const smoke2 = useSharedValue(0);
  const smoke3 = useSharedValue(0);

  // Map panning & zoom control systems
  const autoFollow = useSharedValue(true);
  const zoomScale = useSharedValue(1.1);
  const panX = useSharedValue(0);
  const panY = useSharedValue(0);

  // Cloud shadows scrolling shared value
  const cloudX = useSharedValue(-120);

  // Pulse effect loops for live sync badge
  const syncPulse = useSharedValue(0);

  // Setup loop for engine suspension bounce, shadow scaling, and exhaust particles
  useEffect(() => {
    suspensionY.value = withRepeat(
      withTiming(-1.5, { duration: 160, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    shadowScale.value = withRepeat(
      withTiming(0.85, { duration: 160, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
    shadowOpacity.value = withRepeat(
      withTiming(0.25, { duration: 160, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Continuous cloud drift
    cloudX.value = withRepeat(
      withTiming(450 + 120, { duration: 32000, easing: Easing.linear }),
      -1,
      false
    );

    // Continuous green sync pulse ring
    syncPulse.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );

    // Start exhaust smoke loops sequentially to phase-shift puff releases
    smoke1.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1, false);
    
    setTimeout(() => {
      smoke2.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1, false);
    }, 300);

    setTimeout(() => {
      smoke3.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1, false);
    }, 600);
  }, []);

  // Sync route simulation clock loop
  useEffect(() => {
    if (!isSimulating) return;

    let previousHeading = animatedHeading.value;
    let currentSpeed = 0;

    const interval = setInterval(() => {
      setSimProgress(prev => {
        const next = prev + 0.0032; // Increment progress tick

        if (next >= 1) {
          clearInterval(interval);
          setIsSimulating(false);
          setSimSpeed(0);
          setSimEta(0);
          dispatch(updateOrderStatus({ orderId: id ?? 'ord-active-1', status: 'delivered' }));
          return 1;
        }

        // Apply path interpolation physics
        const { latitude, longitude, heading, segmentIndex, fraction } = interpolateRoute(ROUTE_POINTS, next);

        animatedLat.value = latitude;
        animatedLng.value = longitude;

        // Turn deceleration algorithm
        let targetSpeed = 45; // standard cruising speed on straight lines
        const isNearTurnEnd = fraction > 0.8;
        const isNearTurnStart = fraction < 0.2;
        const currentSegHeading = heading;
        const nextPoint = ROUTE_POINTS[segmentIndex + 1];
        const afterNextPoint = ROUTE_POINTS[segmentIndex + 2];

        if (nextPoint && afterNextPoint && (isNearTurnEnd || isNearTurnStart)) {
          const dLatNext = afterNextPoint.latitude - nextPoint.latitude;
          const dLngNext = afterNextPoint.longitude - nextPoint.longitude;
          let nextSegHeading = (Math.atan2(dLngNext, dLatNext) * 180) / Math.PI;
          if (nextSegHeading < 0) nextSegHeading += 360;

          const headingDiff = Math.abs(nextSegHeading - currentSegHeading);
          if (headingDiff > 25 && headingDiff < 335) {
            targetSpeed = 15; // Slow down before corners
          }
        }

        // Smooth speed transition
        currentSpeed = currentSpeed + (targetSpeed - currentSpeed) * 0.15;
        setSimSpeed(Number(currentSpeed.toFixed(1)));

        // ETA decreases dynamically
        setSimEta(Math.max(1, Math.round((1 - next) * 12)));

        // Dynamic Lean tilting math during direction rotation changes
        const headingDiff = heading - previousHeading;
        let tilt = Math.max(-14, Math.min(14, headingDiff * 2.0));
        leanAngle.value = withTiming(tilt, { duration: 150 });
        
        // Reset tilt slowly after turn completes
        setTimeout(() => {
          if (isSimulating) {
            leanAngle.value = withTiming(0, { duration: 250 });
          }
        }, 500);

        animatedHeading.value = heading;
        previousHeading = heading;

        // Auto-update timeline statuses in Redux to demonstrate full checkout flow
        let nextStatus: any = 'pending';
        if (next > 0.02) nextStatus = 'confirmed';
        if (next > 0.18) nextStatus = 'preparing';
        if (next > 0.35) nextStatus = 'packed';
        if (next > 0.48) nextStatus = 'picked_up';
        if (next > 0.6) nextStatus = 'out_for_delivery';
        
        dispatch(updateOrderStatus({ orderId: id ?? 'ord-active-1', status: nextStatus }));

        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isSimulating, dispatch, id]);

  // Sync rider updates from WebSocket socket data
  useEffect(() => {
    if (isSimulating || !tracking.riderLocation) return;

    const { lat, lng, heading } = tracking.riderLocation;

    animatedLat.value = withTiming(lat, { duration: 4800, easing: Easing.linear });
    animatedLng.value = withTiming(lng, { duration: 4800, easing: Easing.linear });

    if (heading !== undefined) {
      const headingDiff = heading - animatedHeading.value;
      const tilt = Math.max(-12, Math.min(12, headingDiff * 1.5));
      leanAngle.value = withTiming(tilt, { duration: 400 });
      animatedHeading.value = withTiming(heading, { duration: 600 });
      
      setTimeout(() => {
        leanAngle.value = withTiming(0, { duration: 600 });
      }, 1200);
    }
  }, [tracking.riderLocation, isSimulating]);

  const currentStatus = order?.status ?? tracking.orderStatus ?? 'out_for_delivery';
  const statusCopy = STATUS_COPY[currentStatus] ?? STATUS_COPY.out_for_delivery;
  const timeline = getTimeline(currentStatus);

  const displayEta = isSimulating ? simEta : (tracking.eta ?? order?.estimatedMinutes ?? 12);
  const displaySpeed = isSimulating ? simSpeed : (liveLocation?.speed ?? 0);
  const displayBattery = liveLocation?.battery ?? 89;
  const displayNetwork = isSimulating ? 'Excellent (Simulated)' : (liveLocation?.networkStatus ?? 'Excellent');

  const rider = {
    name: order?.riderName ?? 'sonu kumar ray',
    phone: order?.riderPhone ?? '+91 98765 43210',
    rating: order?.riderRating ?? 4.9,
    vehicle: 'Electric Cargo Scooter',
    regNo: 'BR 04 AB 1234',
  };

  // Camera viewport follow style (centers on the rider)
  const mapContentStyle = useAnimatedStyle(() => {
    const mapWidth = width;
    const mapHeight = height;

    if (!autoFollow.value) {
      return {
        transform: [
          { translateX: panX.value },
          { translateY: panY.value },
          { scale: zoomScale.value }
        ]
      };
    }

    const coords = getIsometricCoordsWorklet(animatedLat.value, animatedLng.value);

    // Center viewport on the rider, shifted slightly upwards to avoid bottom sheet overlap
    const offsetY = isFullscreen ? 0 : -50;
    const tx = mapWidth / 2 - coords.x * zoomScale.value;
    const ty = (mapHeight / 2 + offsetY) - coords.y * zoomScale.value;

    // Save offsets for panning release
    panX.value = tx;
    panY.value = ty;

    return {
      transform: [
        { translateX: tx },
        { translateY: ty },
        { scale: zoomScale.value }
      ]
    };
  });

  // Animated style for rider positioning on projected canvas
  const animatedRiderStyle = useAnimatedStyle(() => {
    const coords = getIsometricCoordsWorklet(animatedLat.value, animatedLng.value);
    
    // Scale X depending on travel direction (heading)
    const isFacingLeft = animatedHeading.value > 180 && animatedHeading.value < 360;
    const scaleX = isFacingLeft ? -1 : 1;
    
    return {
      left: coords.x,
      top: coords.y,
      transform: [
        { scaleX },
        { rotate: `${leanAngle.value}deg` },
      ],
    };
  });

  // Slow Cloud shadow drift animation
  const cloudStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: cloudX.value },
      { translateY: 35 }
    ]
  }));

  // Sync pulsing style for live sync badge
  const syncPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + syncPulse.value * 1.5 }],
    opacity: 1 - syncPulse.value,
  }));

  // Pan Gestures Responder for manual map exploration
  const mapPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        autoFollow.value = false;
      },
      onPanResponderMove: (_, gestureState) => {
        panX.value = panX.value + gestureState.dx * 0.75;
        panY.value = panY.value + gestureState.dy * 0.75;
      },
    })
  ).current;

  // Handle phone calls
  const handleCallRider = () => {
    Linking.openURL(`tel:${rider.phone}`).catch(() => alert('Calling is not supported.'));
  };

  const storePercent = getIsometricCoords(storeLat, storeLng);
  const customerPercent = getIsometricCoords(customerLat, customerLng);

  // Slice route for completed vs remaining visual paths
  const currentSegInfo = interpolateRoute(ROUTE_POINTS, isSimulating ? simProgress : 0);
  const completedPathPoints = [
    ...ROUTE_POINTS.slice(0, currentSegInfo.segmentIndex + 1),
    { latitude: animatedLat.value, longitude: animatedLng.value }
  ];
  const remainingPathPoints = [
    { latitude: animatedLat.value, longitude: animatedLng.value },
    ...ROUTE_POINTS.slice(currentSegInfo.segmentIndex + 1)
  ];

  // Dynamic theme colors for isometric city map
  const mapColors = {
    grass: isDarkMode ? '#1E293B' : '#E2F3E7',
    park: isDarkMode ? '#0F172A' : '#D2EDDB',
    parkStroke: isDarkMode ? '#1E293B' : '#BCDFCA',
    roadBg: isDarkMode ? '#475569' : '#CBD5E1',
    roadFill: isDarkMode ? '#1E293B' : '#94A3B8',
    roadDashes: isDarkMode ? 'rgba(255,255,255,0.2)' : '#FFF',
    river: isDarkMode ? '#0F172A' : '#BAE6FD',
    riverInner: isDarkMode ? '#1E293B' : '#E0F2FE',
    bridgeBg: isDarkMode ? '#0F172A' : '#475569',
    bridgeFill: isDarkMode ? '#1E293B' : '#64748B',
    buildingRoof: isDarkMode ? '#1E293B' : '#F8FAFC',
    buildingWallRight: isDarkMode ? '#111827' : '#E2E8F0',
    buildingWallLeft: isDarkMode ? '#030712' : '#CBD5E1',
    buildingWindow: isDarkMode ? '#F59E0B' : '#93C5FD',
    completedPath: isDarkMode ? '#64748B' : '#818CF8',
    remainingPath: Colors.primary,
  };

  const bottomSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetTranslateY.value }],
  }));

  const toastStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
  }));

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.containerDark]} edges={['top']}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Floating Header */}
      {!isFullscreen && (
        <View style={[styles.floatingHeader, isDarkMode && styles.floatingHeaderDark]}>
          <TouchableOpacity style={[styles.backBtn, isDarkMode && styles.backBtnDark]} onPress={() => router.back()} activeOpacity={0.8}>
            <ArrowLeft size={22} color={isDarkMode ? '#FFF' : Colors.textPrimary} strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, isDarkMode && styles.headerTitleDark]}>Track Order</Text>
            <Text style={[styles.headerSub, isDarkMode && styles.headerSubDark]}>Order #{order?.orderNumber ?? 'CB-2026-9482'}</Text>
          </View>
          <TouchableOpacity style={[styles.helpBtn, isDarkMode && styles.helpBtnDark]} onPress={handleCallRider} activeOpacity={0.8}>
            <HelpCircle size={18} color={isDarkMode ? '#FFB693' : Colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      )}

      {/* Full-Screen map viewport layout */}
      <View style={styles.mapContainer}>
        <View style={styles.mapCanvas} {...mapPanResponder.panHandlers}>
          <Animated.View style={[styles.mapContentFrame, mapContentStyle, { width: 500, height: 400 }]}>
            <Svg width="500" height="400" viewBox="0 0 500 400">
              <Defs>
                <RadialGradient id="treeGrad" cx="35%" cy="35%" r="65%">
                  <Stop offset="0%" stopColor="#A7F3D0" />
                  <Stop offset="40%" stopColor="#4ADE80" />
                  <Stop offset="80%" stopColor="#22C55E" />
                  <Stop offset="100%" stopColor="#15803D" />
                </RadialGradient>
                <RadialGradient id="riverGrad" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="#A5F3FC" />
                  <Stop offset="100%" stopColor="#E0F7FA" />
                </RadialGradient>
              </Defs>

              {/* Grass Pasture background */}
              <Rect x={-150} y={-150} width={800} height={700} fill={mapColors.grass} />

              {/* Parks / Green Zones */}
              <Path d="M 50 140 L 150 90 L 220 120 L 120 170 Z" fill={mapColors.park} stroke={mapColors.parkStroke} strokeWidth={1} />
              <Path d="M 280 230 L 380 180 L 450 215 L 350 265 Z" fill={mapColors.park} stroke={mapColors.parkStroke} strokeWidth={1} />
              <Path d="M 120 280 L 220 230 L 290 265 L 190 315 Z" fill={mapColors.park} stroke={mapColors.parkStroke} strokeWidth={1} />

              {/* Natural Landscapes - Winding River */}
              <Path d="M -50 280 Q 150 340 280 300 T 550 420" fill="none" stroke={mapColors.river} strokeWidth={24} opacity={0.8} />
              <Path d="M -50 280 Q 150 340 280 300 T 550 420" fill="none" stroke={mapColors.riverInner} strokeWidth={18} opacity={0.5} />

              {/* Sidewalks & Roads */}
              {/* 1. Park Avenue (v = -78.24) */}
              <Line x1={250 + (-150 - (-78.24)) * 0.866} y1={200 + (-150 + (-78.24)) * 0.5} x2={250 + (150 - (-78.24)) * 0.866} y2={200 + (150 + (-78.24)) * 0.5} stroke={mapColors.roadBg} strokeWidth={20} strokeLinecap="round" />
              <Line x1={250 + (-150 - (-78.24)) * 0.866} y1={200 + (-150 + (-78.24)) * 0.5} x2={250 + (150 - (-78.24)) * 0.866} y2={200 + (150 + (-78.24)) * 0.5} stroke={mapColors.roadFill} strokeWidth={16} strokeLinecap="round" />
              <Line x1={250 + (-150 - (-78.24)) * 0.866} y1={200 + (-150 + (-78.24)) * 0.5} x2={250 + (150 - (-78.24)) * 0.866} y2={200 + (150 + (-78.24)) * 0.5} stroke={mapColors.roadDashes} strokeWidth={1.2} strokeDasharray="5,6" opacity={0.8} />

              {/* 2. Market Street (v = -24.0) */}
              <Line x1={250 + (-150 - (-24)) * 0.866} y1={200 + (-150 + (-24)) * 0.5} x2={250 + (150 - (-24)) * 0.866} y2={200 + (150 + (-24)) * 0.5} stroke={mapColors.roadBg} strokeWidth={20} strokeLinecap="round" />
              <Line x1={250 + (-150 - (-24)) * 0.866} y1={200 + (-150 + (-24)) * 0.5} x2={250 + (150 - (-24)) * 0.866} y2={200 + (150 + (-24)) * 0.5} stroke={mapColors.roadFill} strokeWidth={16} strokeLinecap="round" />
              <Line x1={250 + (-150 - (-24)) * 0.866} y1={200 + (-150 + (-24)) * 0.5} x2={250 + (150 - (-24)) * 0.866} y2={200 + (150 + (-24)) * 0.5} stroke={mapColors.roadDashes} strokeWidth={1.2} strokeDasharray="5,6" opacity={0.8} />

              {/* 3. Main Bypass Road (v = 56.16) */}
              <Line x1={250 + (-150 - 56.16) * 0.866} y1={200 + (-150 + 56.16) * 0.5} x2={250 + (150 - 56.16) * 0.866} y2={200 + (150 + 56.16) * 0.5} stroke={mapColors.roadBg} strokeWidth={20} strokeLinecap="round" />
              <Line x1={250 + (-150 - 56.16) * 0.866} y1={200 + (-150 + 56.16) * 0.5} x2={250 + (150 - 56.16) * 0.866} y2={200 + (150 + 56.16) * 0.5} stroke={mapColors.roadFill} strokeWidth={16} strokeLinecap="round" />
              <Line x1={250 + (-150 - 56.16) * 0.866} y1={200 + (-150 + 56.16) * 0.5} x2={250 + (150 - 56.16) * 0.866} y2={200 + (150 + 56.16) * 0.5} stroke={mapColors.roadDashes} strokeWidth={1.2} strokeDasharray="5,6" opacity={0.8} />

              {/* 4. Temp Street (u = 38.4) */}
              <Line x1={250 + (38.4 - (-150)) * 0.866} y1={200 + (38.4 + (-150)) * 0.5} x2={250 + (38.4 - 150) * 0.866} y2={200 + (38.4 + 150) * 0.5} stroke={mapColors.roadBg} strokeWidth={20} strokeLinecap="round" />
              <Line x1={250 + (38.4 - (-150)) * 0.866} y1={200 + (38.4 + (-150)) * 0.5} x2={250 + (38.4 - 150) * 0.866} y2={200 + (38.4 + 150) * 0.5} stroke={mapColors.roadFill} strokeWidth={16} strokeLinecap="round" />
              <Line x1={250 + (38.4 - (-150)) * 0.866} y1={200 + (38.4 + (-150)) * 0.5} x2={250 + (38.4 - 150) * 0.866} y2={200 + (38.4 + 150) * 0.5} stroke={mapColors.roadDashes} strokeWidth={1.2} strokeDasharray="5,6" opacity={0.8} />

              {/* 5. Residential Lane (u = 89.6) */}
              <Line x1={250 + (89.6 - (-150)) * 0.866} y1={200 + (89.6 + (-150)) * 0.5} x2={250 + (89.6 - 150) * 0.866} y2={200 + (89.6 + 150) * 0.5} stroke={mapColors.roadBg} strokeWidth={20} strokeLinecap="round" />
              <Line x1={250 + (89.6 - (-150)) * 0.866} y1={200 + (89.6 + (-150)) * 0.5} x2={250 + (89.6 - 150) * 0.866} y2={200 + (89.6 + 150) * 0.5} stroke={mapColors.roadFill} strokeWidth={16} strokeLinecap="round" />
              <Line x1={250 + (89.6 - (-150)) * 0.866} y1={200 + (89.6 + (-150)) * 0.5} x2={250 + (89.6 - 150) * 0.866} y2={200 + (89.6 + 150) * 0.5} stroke={mapColors.roadDashes} strokeWidth={1.2} strokeDasharray="5,6" opacity={0.8} />

              {/* 6. Station Road (u = -38.4) */}
              <Line x1={250 + (-38.4 - (-150)) * 0.866} y1={200 + (-38.4 + (-150)) * 0.5} x2={250 + (-38.4 - 150) * 0.866} y2={200 + (-38.4 + 150) * 0.5} stroke={mapColors.roadBg} strokeWidth={20} strokeLinecap="round" />
              <Line x1={250 + (-38.4 - (-150)) * 0.866} y1={200 + (-38.4 + (-150)) * 0.5} x2={250 + (-38.4 - 150) * 0.866} y2={200 + (-38.4 + 150) * 0.5} stroke={mapColors.roadFill} strokeWidth={16} strokeLinecap="round" />
              <Line x1={250 + (-38.4 - (-150)) * 0.866} y1={200 + (-38.4 + (-150)) * 0.5} x2={250 + (-38.4 - 150) * 0.866} y2={200 + (-38.4 + 150) * 0.5} stroke={mapColors.roadDashes} strokeWidth={1.2} strokeDasharray="5,6" opacity={0.8} />

              {/* River Bridge */}
              <Line x1={250 + (-38.4 - 90) * 0.866} y1={200 + (-38.4 + 90) * 0.5} x2={250 + (-38.4 - 130) * 0.866} y2={200 + (-38.4 + 130) * 0.5} stroke={mapColors.bridgeBg} strokeWidth={22} />
              <Line x1={250 + (-38.4 - 90) * 0.866} y1={200 + (-38.4 + 90) * 0.5} x2={250 + (-38.4 - 130) * 0.866} y2={200 + (-38.4 + 130) * 0.5} stroke={mapColors.bridgeFill} strokeWidth={18} />

              {/* Roundabout Island at intersection of Temp St & Market St */}
              {/* Curb Shadow */}
              <Ellipse cx={304} cy={208.7} rx={22} ry={12} fill="rgba(0,0,0,0.15)" />
              {/* Curb outer ring */}
              <Ellipse cx={304} cy={207.2} rx={21} ry={11} fill={mapColors.roadBg} />
              {/* Center Grass Island */}
              <Ellipse cx={304} cy={207.2} rx={16} ry={8.5} fill={mapColors.park} />
              {/* Center decorative patch */}
              <Ellipse cx={304} cy={207.2} rx={9} ry={5} fill={isDarkMode ? '#047857' : '#4ADE80'} />
              {/* Center post */}
              <Line x1={304} y1={207.2} x2={304} y2={199} stroke="#FFF" strokeWidth={2} strokeLinecap="round" />
              <Circle cx={304} cy={197.5} r={2.2} fill={mapColors.remainingPath} />

              {/* Volumetric 3D Buildings */}
              {/* Block 1 (Top-Left Apartment) */}
              <IsometricBuilding u={-110} v={-125} w={45} d={30} h={36} color={mapColors.buildingWallRight} shadowColor={mapColors.buildingWallLeft} roofColor={mapColors.buildingRoof} windowColor={mapColors.buildingWindow} />
              {/* Block 2 (Top-Middle Residential Tower) */}
              <IsometricBuilding u={-8} v={-120} w={38} d={28} h={48} color={isDarkMode ? '#312E81' : '#FFF1F2'} shadowColor={isDarkMode ? '#1E1B4B' : '#FFE4E6'} roofColor={isDarkMode ? '#3730A3' : '#FFF'} windowColor={mapColors.buildingWindow} />
              {/* Block 3 (Top-Right House) */}
              <IsometricBuilding u={105} v={-120} w={35} d={28} h={22} color={isDarkMode ? '#065F46' : '#FEF3C7'} shadowColor={isDarkMode ? '#064E3B' : '#FDE68A'} roofColor={isDarkMode ? '#0F766E' : '#FEF9E7'} windowColor={mapColors.buildingWindow} />
              {/* Block 4 (Middle-Left-1 Medium Apartment) */}
              <IsometricBuilding u={-110} v={-62} w={45} d={24} h={30} color={mapColors.buildingWallRight} shadowColor={mapColors.buildingWallLeft} roofColor={mapColors.buildingRoof} windowColor={mapColors.buildingWindow} />
              {/* Block 5 (Middle-Center-1 Corporate Complex) */}
              <IsometricBuilding u={-8} v={-62} w={38} d={24} h={52} color={isDarkMode ? '#1E293B' : '#EEF2F6'} shadowColor={isDarkMode ? '#0F172A' : '#D0D9E4'} roofColor={isDarkMode ? '#334155' : '#F8FAFC'} windowColor={mapColors.buildingWindow} />
              {/* Block 6 (Middle-Right-1 Standard Shops) */}
              <IsometricBuilding u={53} v={-62} w={26} d={24} h={18} color={isDarkMode ? '#701A75' : '#FCF6F0'} shadowColor={isDarkMode ? '#4A044E' : '#ECE0D5'} roofColor={isDarkMode ? '#86198F' : '#FFF'} windowColor={mapColors.buildingWindow} />
              {/* Block 7 (Middle-Far-Right-1 Small House) */}
              <IsometricBuilding u={110} v={-62} w={28} d={24} h={20} color={isDarkMode ? '#065F46' : '#FEF3C7'} shadowColor={isDarkMode ? '#064E3B' : '#FDE68A'} roofColor={isDarkMode ? '#0F766E' : '#FEF9E7'} windowColor={mapColors.buildingWindow} />
              {/* Block 8 (Middle-Left-2 Resident Block) */}
              <IsometricBuilding u={-110} v={10} w={45} d={32} h={26} color={mapColors.buildingWallRight} shadowColor={mapColors.buildingWallLeft} roofColor={mapColors.buildingRoof} windowColor={mapColors.buildingWindow} />
              {/* Block 9 (Middle-Center-2 Plaza) */}
              <IsometricBuilding u={-8} v={10} w={38} d={32} h={28} color={isDarkMode ? '#581C87' : '#F5F3FF'} shadowColor={isDarkMode ? '#3B0764' : '#DDD6FE'} roofColor={isDarkMode ? '#6B21A8' : '#FAF5FF'} windowColor={mapColors.buildingWindow} />
              {/* Block 10 (Middle-Right-2 Market Storefronts) */}
              <IsometricBuilding u={53} v={10} w={26} d={32} h={16} color={isDarkMode ? '#701A75' : '#FCF6F0'} shadowColor={isDarkMode ? '#4A044E' : '#ECE0D5'} roofColor={isDarkMode ? '#86198F' : '#FFF'} windowColor={mapColors.buildingWindow} />

              {/* 3D Volumetric Trees in Parks & Sidewalks */}
              <IsometricTree u={-90} v={-100} isDarkMode={isDarkMode} />
              <IsometricTree u={-76} v={-95} isDarkMode={isDarkMode} />
              <IsometricTree u={-100} v={-90} isDarkMode={isDarkMode} />
              <IsometricTree u={85} v={30} isDarkMode={isDarkMode} />
              <IsometricTree u={100} v={22} isDarkMode={isDarkMode} />
              <IsometricTree u={90} v={42} isDarkMode={isDarkMode} />
              <IsometricTree u={-50} v={-110} isDarkMode={isDarkMode} />
              <IsometricTree u={12} v={-100} isDarkMode={isDarkMode} />
              <IsometricTree u={-80} v={42} isDarkMode={isDarkMode} />
              <IsometricTree u={115} v={-30} isDarkMode={isDarkMode} />

              {/* Route Elevation Shadow (for floating route depth effect) */}
              <Path d={pointsToSvgPath(completedPathPoints)} stroke="rgba(15, 23, 42, 0.15)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" transform="translate(1, 3.5)" />
              <Path d={pointsToSvgPath(remainingPathPoints)} stroke="rgba(15, 23, 42, 0.15)" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" transform="translate(1, 3.5)" />

              {/* Actual SVG Route Lines */}
              {/* Completed Path (solid soft lavender-indigo) */}
              <Path d={pointsToSvgPath(completedPathPoints)} stroke={mapColors.completedPath} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" />
              {/* Remaining Path (neon glowing orange path) */}
              <Path d={pointsToSvgPath(remainingPathPoints)} stroke={mapColors.remainingPath} strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round" strokeDasharray="6,6" />
            </Svg>

            {/* Store building custom illustration (floating marker badge overlay) */}
            <View style={[styles.marker, { top: storePercent.top, left: storePercent.left, transform: [{ translateX: -23 }, { translateY: -40 }] } as any]}>
              <StoreMarker />
            </View>

            {/* Animated Scooter Rider Overlay */}
            <Animated.View style={[styles.animatedRider, animatedRiderStyle]}>
              <RiderSvgContainer
                suspensionY={suspensionY}
                leanAngle={leanAngle}
                shadowScale={shadowScale}
                shadowOpacity={shadowOpacity}
                smoke1={smoke1}
                smoke2={smoke2}
                smoke3={smoke3}
              />
            </Animated.View>

            {/* Customer house custom illustration (floating marker badge overlay) */}
            <View style={[styles.marker, { top: customerPercent.top, left: customerPercent.left, transform: [{ translateX: -23 }, { translateY: -40 }] } as any]}>
              <CustomerHomeMarker />
            </View>

            {/* Ambient Passing Cloud Shadow Overlay */}
            <Animated.View style={[styles.cloudLayer, cloudStyle]}>
              <Svg width="120" height="60" viewBox="0 0 100 50">
                <Path d="M 20,40 C 20,40 10,34 15,22 C 20,10 38,12 42,20 C 48,12 68,8 78,18 C 88,28 82,40 82,40 Z" fill={isDarkMode ? "#334155" : "#94A3B8"} opacity={isDarkMode ? 0.08 : 0.12} />
              </Svg>
            </Animated.View>
          </Animated.View>
        </View>

        {/* Floating Live Sync status indicator badge */}
        {!isFullscreen && (
          <View style={styles.liveIndicatorFrame}>
            <Animated.View style={[styles.liveSyncPulse, syncPulseStyle]} />
            <View style={styles.liveSyncDot} />
            <Text style={styles.liveSyncText}>
              {isSimulating ? 'Demo Active' : 'Live Syncing'}
            </Text>
          </View>
        )}

        {/* Floating Simulation Badge */}
        {!isFullscreen && (
          <View style={styles.simControlPanel}>
            <TouchableOpacity
              style={[styles.simButton, isSimulating && styles.simButtonActive]}
              onPress={() => {
                if (isSimulating) {
                  setIsSimulating(false);
                  setSimSpeed(0);
                } else {
                  setSimProgress(0);
                  setIsSimulating(true);
                }
              }}
              activeOpacity={0.85}
            >
              <Bike size={14} color={isSimulating ? Colors.white : Colors.primary} strokeWidth={2.5} />
              <Text style={[styles.simButtonText, isSimulating && styles.simButtonTextActive]}>
                {isSimulating ? 'Stop Demo' : 'Simulate'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Floating Map Controls Panel */}
      <View style={[styles.floatingMapControls, isFullscreen && styles.floatingMapControlsFullscreen]}>
        <TouchableOpacity
          style={[styles.controlBtn, isDarkMode && styles.controlBtnDark]}
          onPress={() => {
            zoomScale.value = withTiming(Math.min(2.5, zoomScale.value + 0.25));
          }}
          activeOpacity={0.8}
        >
          <Plus size={18} color={isDarkMode ? '#FFF' : Colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlBtn, isDarkMode && styles.controlBtnDark]}
          onPress={() => {
            zoomScale.value = withTiming(Math.max(0.6, zoomScale.value - 0.25));
          }}
          activeOpacity={0.8}
        >
          <Minus size={18} color={isDarkMode ? '#FFF' : Colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlBtn, isDarkMode && styles.controlBtnDark]}
          onPress={() => {
            autoFollow.value = true;
          }}
          activeOpacity={0.8}
        >
          <Navigation size={16} color={isDarkMode ? '#FFF' : Colors.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Theme Toggle (Light/Dark map compatibility) */}
        <TouchableOpacity
          style={[styles.controlBtn, isDarkMode && styles.controlBtnDark]}
          onPress={() => setIsDarkMode(!isDarkMode)}
          activeOpacity={0.8}
        >
          {isDarkMode ? (
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFA366" strokeWidth="2.2">
              <Circle cx="12" cy="12" r="5" fill="#FFA366" />
              <Line x1="12" y1="1" x2="12" y2="3" />
              <Line x1="12" y1="21" x2="12" y2="23" />
              <Line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <Line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <Line x1="1" y1="12" x2="3" y2="12" />
              <Line x1="21" y1="12" x2="23" y2="12" />
              <Line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <Line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </Svg>
          ) : (
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={Colors.textPrimary} strokeWidth="2.2">
              <Path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#E2E8F0" />
            </Svg>
          )}
        </TouchableOpacity>

        {/* Fullscreen Map Toggle */}
        <TouchableOpacity
          style={[styles.controlBtn, isDarkMode && styles.controlBtnDark]}
          onPress={() => setIsFullscreen(!isFullscreen)}
          activeOpacity={0.8}
        >
          {isFullscreen ? (
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? '#FFF' : Colors.textPrimary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M4 14h6v6M20 10h-6V4M14 10l7-7M10 14l-7 7" />
            </Svg>
          ) : (
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isDarkMode ? '#FFF' : Colors.textPrimary} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
            </Svg>
          )}
        </TouchableOpacity>
      </View>

      {/* Exit Fullscreen Floating Button */}
      {isFullscreen && (
        <TouchableOpacity
          style={[styles.exitFullscreenBtn, isDarkMode && styles.exitFullscreenBtnDark]}
          onPress={() => setIsFullscreen(false)}
          activeOpacity={0.85}
        >
          <Text style={styles.exitFullscreenText}>Exit Fullscreen</Text>
        </TouchableOpacity>
      )}

      {/* Draggable Bottom Sheet */}
      {!isFullscreen && (
        <Animated.View style={[styles.bottomSheet, bottomSheetStyle, isDarkMode && styles.bottomSheetDark]} {...bottomSheetPanResponder.panHandlers}>
          {/* Drag Handle Bar */}
          <View style={styles.dragHandleContainer}>
            <View style={styles.dragHandle} />
          </View>

          {/* Collapsed Header Content (Summary Area) */}
          <View style={styles.collapsedHeader}>
            <View style={styles.statusHeaderRow}>
              <View style={styles.estimatedDeliveryWrap}>
                <Clock size={15} color={isDarkMode ? '#B5A09A' : Colors.textMuted} strokeWidth={2.2} />
                <Text style={[styles.estimatedDeliveryLabel, isDarkMode && styles.estimatedDeliveryLabelDark]}>Estimated delivery</Text>
              </View>
              <View style={[styles.onTimeBadge, isDarkMode && styles.onTimeBadgeDark]}>
                <Text style={[styles.onTimeBadgeText, isDarkMode && styles.onTimeBadgeTextDark]}>ON TIME</Text>
              </View>
            </View>

            <Text style={[styles.etaLargeText, isDarkMode && styles.etaLargeTextDark]}>
              {currentStatus === 'delivered' ? 'Order Delivered' : `Arriving in ${displayEta} min${displayEta !== 1 ? 's' : ''}`}
            </Text>

            {/* Rider Row inside Summary Area */}
            <View style={styles.riderSummaryRow}>
              <View style={[styles.riderAvatarFrame, isDarkMode && styles.riderAvatarFrameDark]}>
                <User size={20} color={Colors.white} strokeWidth={2} />
                <View style={styles.activeDot} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.riderName, isDarkMode && styles.riderNameDark]}>{rider.name}</Text>
                <Text style={[styles.riderVehicle, isDarkMode && styles.riderVehicleDark]}>{rider.vehicle} • ★{rider.rating}</Text>
              </View>
              <View style={styles.riderActions}>
                <TouchableOpacity style={[styles.riderActionBtn, isDarkMode && styles.riderActionBtnDark]} onPress={handleCallRider} activeOpacity={0.85}>
                  <Phone size={16} color={isDarkMode ? '#FFB693' : Colors.primary} strokeWidth={2.2} />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.riderActionBtn, isDarkMode && styles.riderActionBtnDark]} onPress={() => alert('Opening chat with rider...')} activeOpacity={0.85}>
                  <MessageCircle size={16} color={isDarkMode ? '#FFB693' : Colors.primary} strokeWidth={2.2} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={[styles.divider, isDarkMode && styles.dividerDark]} />

          {/* Expanded Detail Content (Scrollable) */}
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            contentContainerStyle={styles.expandedContent}
          >
            {/* Distance and Telemetry details row */}
            <View style={styles.detailStatsRow}>
              <View style={[styles.statTile, isDarkMode && styles.statTileDark]}>
                <Text style={[styles.statVal, isDarkMode && styles.statValDark]}>{(1.4 * (1 - (isSimulating ? simProgress : 0))).toFixed(1)} km</Text>
                <Text style={styles.statLbl}>Distance Left</Text>
              </View>
              <View style={[styles.statTile, isDarkMode && styles.statTileDark]}>
                <Text style={[styles.statVal, isDarkMode && styles.statValDark]}>{displaySpeed} km/h</Text>
                <Text style={styles.statLbl}>Rider Speed</Text>
              </View>
              <View style={[styles.statTile, isDarkMode && styles.statTileDark]}>
                <Text style={[styles.statVal, isDarkMode && styles.statValDark]}>{displayBattery}%</Text>
                <Text style={styles.statLbl}>Rider Battery</Text>
              </View>
            </View>

            {/* Share Tracking Link Button */}
            <TouchableOpacity 
              style={[styles.shareLinkBtn, isDarkMode && styles.shareLinkBtnDark]}
              onPress={() => {
                Clipboard?.setString(`https://blinkbox.in/track/${id}`);
                triggerToast('Tracking link copied to clipboard!');
              }}
              activeOpacity={0.85}
            >
              <Share2 size={16} color="#FFF" strokeWidth={2.2} />
              <Text style={styles.shareLinkText}>Share Live Tracking Link</Text>
            </TouchableOpacity>

            {/* Delivery Instructions Card */}
            <View style={[styles.instructionsCard, isDarkMode && styles.instructionsCardDark]}>
              <Text style={[styles.instructionsHeader, isDarkMode && styles.instructionsHeaderDark]}>Delivery Instructions</Text>
              <Text style={[styles.instructionsBody, isDarkMode && styles.instructionsBodyDark]}>
                Leave the package at the main security gate. Please call once dropped. Ring doorbell when you arrive.
              </Text>
            </View>

            {/* Milestones Order Timeline */}
            <Text style={[styles.sectionTitle, isDarkMode && styles.sectionTitleDark]}>Order Milestones</Text>
            <View style={[styles.timelineCard, isDarkMode && styles.timelineCardDark]}>
              {timeline.map((step, i) => (
                <View key={step.id} style={styles.timelineStep}>
                  {i < timeline.length - 1 && (
                    <View style={[styles.timelineLine, step.done && styles.timelineLineDone]} />
                  )}
                  
                  {/* Visual Indicators */}
                  <View style={[
                    styles.timelineIconWrap,
                    step.done && styles.timelineIconDone,
                    step.active && styles.timelineIconActive,
                    isDarkMode && styles.timelineIconWrapDark,
                  ]}>
                    {step.active ? (
                      <View style={styles.activePulseCircle} />
                    ) : null}
                    <step.Icon
                      size={14}
                      color={step.done || step.active ? Colors.white : (isDarkMode ? '#8E7164' : Colors.textMuted)}
                      strokeWidth={2.5}
                    />
                  </View>

                  <View style={styles.timelineContent}>
                    <Text style={[
                      styles.timelineLabel, 
                      (step.done || step.active) && styles.timelineLabelActive,
                      isDarkMode && styles.timelineLabelDark,
                      isDarkMode && (step.done || step.active) && styles.timelineLabelActiveDark
                    ]}>
                      {step.label}
                    </Text>
                    <Text style={[styles.timelineSub, isDarkMode && styles.timelineSubDark]}>{step.sublabel}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Cancel Button */}
            {['pending', 'confirmed'].includes(currentStatus) && (
              <TouchableOpacity style={styles.cancelBtn} activeOpacity={0.85}>
                <X size={15} color={Colors.error} strokeWidth={2.5} />
                <Text style={styles.cancelText}>Cancel Order</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Animated.View>
      )}

      {/* Custom Toast Notification Overlay */}
      {showToast && (
        <Animated.View style={[styles.toastContainer, toastStyle]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  containerDark: { backgroundColor: '#0C0908' },
  
  // Floating Header
  floatingHeader: {
    position: 'absolute',
    top: 16,
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  floatingHeaderDark: {
    backgroundColor: 'rgba(26, 18, 16, 0.95)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  backBtnDark: { backgroundColor: '#2A1F1A' },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 16, color: Colors.textPrimary },
  headerTitleDark: { color: '#FFF' },
  headerSub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 11, color: Colors.textMuted },
  headerSubDark: { color: '#B5A09A' },
  helpBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  helpBtnDark: { backgroundColor: '#2A1F1A' },

  // Map Container & Canvas (Fullscreen Absolute background)
  mapContainer: { ...StyleSheet.absoluteFillObject, position: 'absolute', zIndex: 1, backgroundColor: '#F8FAFC' },
  mapCanvas: { flex: 1, position: 'relative', overflow: 'hidden' },
  mapContentFrame: { position: 'absolute', width: width, height: height },

  // Interactive Rider Wrapper Shapes
  riderWrapper: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  riderShadow: { position: 'absolute', width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  riderBody: { position: 'absolute', width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },

  // Exhaust smoke bubble style
  smokeBubble: { position: 'absolute', left: 21, top: 48, width: 6, height: 6, borderRadius: 3, backgroundColor: '#94A3B8', opacity: 0.35 },

  // Floating scooter badge marker
  riderMarkerBadge: {
    position: 'absolute',
    top: -38,
    alignItems: 'center',
    zIndex: 15,
  },
  riderBadgeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#A04100', // Brown-orange base
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
  riderBadgeTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFFFFF',
    marginTop: -1,
  },

  // Cloud layer
  cloudLayer: { position: 'absolute', width: 120, height: 60 },

  // Projected Canvas Marker Overlays
  marker: { position: 'absolute', alignItems: 'center', zIndex: 5 },
  markerContainer: { alignItems: 'center', justifyContent: 'center' },
  animatedRider: { position: 'absolute', width: 56, height: 56, marginLeft: -28, marginTop: -28, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  
  // Floating map controls panel on the right
  floatingMapControls: {
    position: 'absolute',
    right: 16,
    bottom: 180, // floating above bottom sheet collapsed state
    zIndex: 40,
    gap: 8,
  },
  floatingMapControlsFullscreen: {
    bottom: 24,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlBtnDark: {
    backgroundColor: '#1A1210',
    borderColor: 'rgba(255,255,255,0.08)',
  },

  // Exit Fullscreen Floating Button
  exitFullscreenBtn: {
    position: 'absolute',
    top: 24,
    alignSelf: 'center',
    zIndex: 100,
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.full,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  exitFullscreenBtnDark: {
    backgroundColor: '#FF7A00',
  },
  exitFullscreenText: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 12,
    color: '#FFF',
  },

  // Floating live connection sync indicator badge
  liveIndicatorFrame: { position: 'absolute', top: 82, left: 16, zIndex: 20, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(15, 23, 42, 0.75)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: Radius.full, ...Shadows.sm },
  liveSyncPulse: { position: 'absolute', left: 10, width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.success, zIndex: 0 },
  liveSyncDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.success, marginLeft: 3, zIndex: 1 },
  liveSyncText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 10, color: Colors.white },

  // Simulation Controls Panel
  simControlPanel: { position: 'absolute', top: 82, right: 16, zIndex: 20 },
  simButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryContainer, paddingHorizontal: 12, paddingVertical: 5, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.primary + '30', ...Shadows.sm },
  simButtonActive: { backgroundColor: Colors.primary },
  simButtonText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 11, color: Colors.primary },
  simButtonTextActive: { color: Colors.white },

  // Draggable Bottom Sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 520,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    zIndex: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  bottomSheetDark: {
    backgroundColor: '#120B09',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  dragHandleContainer: {
    width: '100%',
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#CBD5E1',
  },
  collapsedHeader: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
  },
  dividerDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  expandedContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // Telemetry details row
  detailStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 12,
  },
  statTile: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: Radius.xl,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statTileDark: {
    backgroundColor: '#1A1210',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statVal: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 14,
    color: Colors.textPrimary,
  },
  statValDark: { color: '#FFF' },
  statLbl: {
    fontFamily: 'BeVietnamPro-Medium',
    fontSize: 9,
    color: Colors.textMuted,
    marginTop: 1,
  },

  // Share Tracking Link Button
  shareLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: Radius.xl,
    marginVertical: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  shareLinkBtnDark: {
    backgroundColor: '#FF7A00',
    shadowColor: '#FF7A00',
  },
  shareLinkText: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 13,
    color: '#FFF',
  },

  // Delivery Instructions Card
  instructionsCard: {
    backgroundColor: Colors.primaryContainer,
    borderRadius: Radius.xl,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.primary + '20',
  },
  instructionsCardDark: {
    backgroundColor: '#2A1F1A',
    borderColor: 'rgba(255,107,0,0.15)',
  },
  instructionsHeader: {
    fontFamily: 'BeVietnamPro-Bold',
    fontSize: 12,
    color: Colors.primary,
    marginBottom: 4,
  },
  instructionsHeaderDark: { color: '#FFB693' },
  instructionsBody: {
    fontFamily: 'BeVietnamPro-Regular',
    fontSize: 11,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  instructionsBodyDark: { color: '#B5A09A' },

  // Custom Toast notification overlay
  toastContainer: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: Radius.full,
    zIndex: 100,
  },
  toastText: {
    fontFamily: 'BeVietnamPro-SemiBold',
    fontSize: 12,
    color: '#FFF',
  },

  // Header and elements
  statusGradient: { padding: 16 },
  statusContent: { width: '100%' },
  statusHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  estimatedDeliveryWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  estimatedDeliveryLabel: { fontFamily: 'BeVietnamPro-Medium', fontSize: 12, color: Colors.textMuted },
  estimatedDeliveryLabelDark: { color: '#B5A09A' },
  onTimeBadge: { backgroundColor: Colors.primaryContainer, paddingHorizontal: 10, paddingVertical: 4, borderRadius: Radius.full, borderWidth: 1, borderColor: Colors.borderLight },
  onTimeBadgeDark: { backgroundColor: '#2A1F1A', borderColor: 'rgba(255,107,0,0.15)' },
  onTimeBadgeText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 10, color: Colors.primary, letterSpacing: 0.5 },
  onTimeBadgeTextDark: { color: '#FFB693' },
  etaLargeText: { fontFamily: 'BeVietnamPro-Bold', fontSize: 24, color: Colors.textPrimary, marginVertical: 4 },
  etaLargeTextDark: { color: '#FFF' },
  statusProgressBarBg: { height: 6, backgroundColor: Colors.borderLight, borderRadius: 3, marginVertical: 8, overflow: 'hidden' },
  statusProgressBarFill: { height: '100%', backgroundColor: Colors.primary, borderRadius: 3 },
  statusSubText: { fontFamily: 'BeVietnamPro-Regular', fontSize: 12, color: Colors.textMuted },

  // Rider Details Row
  riderSummaryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  riderAvatarFrame: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  riderAvatarFrameDark: { backgroundColor: '#2A1F1A' },
  activeDot: { position: 'absolute', bottom: 1, right: 1, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success, borderWidth: 1.5, borderColor: '#FFF' },
  riderName: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.textPrimary },
  riderNameDark: { color: '#FFF' },
  riderVehicle: { fontFamily: 'BeVietnamPro-Regular', fontSize: 11, color: Colors.textMuted },
  riderVehicleDark: { color: '#B5A09A' },
  riderActions: { flexDirection: 'row', gap: 8 },
  riderActionBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.primaryContainer, alignItems: 'center', justifyContent: 'center' },
  riderActionBtnDark: { backgroundColor: '#2A1F1A' },

  // Milestones Timeline
  sectionTitle: { fontFamily: 'BeVietnamPro-Bold', fontSize: 14, color: Colors.textPrimary, marginTop: 16, marginBottom: 8 },
  sectionTitleDark: { color: '#FFF' },
  timelineCard: { backgroundColor: Colors.white, borderRadius: Radius.xxl, padding: 16, borderWidth: 1, borderColor: Colors.borderLight },
  timelineCardDark: { backgroundColor: '#1A1210', borderColor: 'rgba(255,255,255,0.05)' },
  timelineStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingVertical: 8, position: 'relative' },
  timelineLine: { position: 'absolute', left: 17, top: 34, width: 2, height: '100%', backgroundColor: Colors.borderLight },
  timelineLineDone: { backgroundColor: Colors.primary },
  timelineIconWrap: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.surfaceVariant, alignItems: 'center', justifyContent: 'center', zIndex: 1, position: 'relative' },
  timelineIconWrapDark: { backgroundColor: '#2A1F1A' },
  timelineIconDone: { backgroundColor: Colors.success },
  timelineIconActive: { backgroundColor: Colors.primary },
  activePulseCircle: { position: 'absolute', width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: Colors.primary + '40', zIndex: 0 },
  timelineContent: { flex: 1, paddingTop: 2 },
  timelineLabel: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 12, color: Colors.textMuted },
  timelineLabelDark: { color: '#8E7164' },
  timelineLabelActive: { color: Colors.textPrimary },
  timelineLabelActiveDark: { color: '#FFF' },
  timelineSub: { fontFamily: 'BeVietnamPro-Regular', fontSize: 10, color: Colors.textMuted, marginTop: 1 },
  timelineSubDark: { color: '#8E7164' },

  // Cancel order Button
  cancelBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16, paddingVertical: 12, borderRadius: Radius.xl, borderWidth: 1.5, borderColor: Colors.error + '40', backgroundColor: Colors.errorContainer },
  cancelText: { fontFamily: 'BeVietnamPro-SemiBold', fontSize: 13, color: Colors.error },
});
