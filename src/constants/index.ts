/**
 * Chapra Basket — Constants
 * Socket events, app config, endpoints
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';


// ─── App Config ──────────────────────────────────────────────────────────────
export const APP_CONFIG = {
  name: 'Blink Box',
  tagline: 'Fast Delivery. Everyday Essentials.',
  city: 'Chapra',
  state: 'Bihar',
  pincode: '841301',
  deliveryETA: '30 mins',
  minOrderAmount: 50,
  deliveryFee: 20,
  freeDeliveryAbove: 299,
  currency: '₹',
  currencyCode: 'INR',
  supportPhone: '+91-9876543210',
  supportEmail: 'support@blinkbox.com',
};

// ─── Socket Events ─────────────────────────────────────────────────────────
export const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Orders
  ORDER_CREATED: 'order:created',
  ORDER_ACCEPTED: 'order:accepted',
  ORDER_PACKED: 'order:packed',
  ORDER_PICKED: 'order:picked',
  ORDER_OUT_FOR_DELIVERY: 'order:out_for_delivery',
  ORDER_DELIVERED: 'order:delivered',
  ORDER_CANCELLED: 'order:cancelled',

  // Rider Location
  RIDER_LOCATION: 'rider:location',
  ETA_UPDATE: 'eta:update',

  // Chat
  CHAT_MESSAGE: 'chat:message',
  CHAT_TYPING: 'chat:typing',

  // Payments
  PAYMENT_SUCCESS: 'payment:success',
  PAYMENT_FAILED: 'payment:failed',

  // Notifications
  NOTIFICATION_PUSH: 'notification:push',
} as const;

// ─── API Endpoints ─────────────────────────────────────────────────────────
const getHostUri = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  const hostUri = Constants.expoConfig?.hostUri || Constants.manifest?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3000/api/v1`;
  }
  return Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/v1' : 'http://localhost:3000/api/v1';
};

export const API_BASE_URL = getHostUri();

export const ENDPOINTS = {
  // Auth
  AUTH_SEND_OTP: '/auth/send-otp',
  AUTH_VERIFY_OTP: '/auth/verify-otp',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',

  // Products
  PRODUCTS: '/products',
  PRODUCT_BY_ID: (id: string) => `/products/${id}`,
  PRODUCTS_FEATURED: '/products/featured',
  PRODUCTS_FLASH_SALE: '/products/flash-sale',
  PRODUCTS_TRENDING: '/products/trending',

  // Cart
  CART: '/cart',
  CART_ITEMS: '/cart/items',
  CART_COUPON: '/cart/coupon',
  CART_VALIDATE: '/cart/validate',

  // Orders
  ORDERS: '/orders',
  ORDER_BY_ID: (id: string) => `/orders/${id}`,
  ORDER_TRACKING: (id: string) => `/orders/${id}/tracking`,
  ORDER_CANCEL: (id: string) => `/orders/${id}/cancel`,

  // Payments
  PAYMENT_CREATE: '/payments/create-order',
  PAYMENT_VERIFY: '/payments/verify',

  // Addresses
  ADDRESSES: '/addresses',
  ADDRESS_BY_ID: (id: string) => `/addresses/${id}`,

  // User
  USER_PROFILE: '/user/profile',
  USER_NOTIFICATIONS: '/user/notifications',
  USER_WALLET: '/user/wallet',
} as const;

// ─── Storage Keys ──────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@bb_auth_token',
  REFRESH_TOKEN: '@bb_refresh_token',
  USER_DATA: '@bb_user_data',
  CART: '@bb_cart',
  RECENT_SEARCHES: '@bb_recent_searches',
  ONBOARDING_DONE: '@bb_onboarding_done',
} as const;

// ─── Order Statuses ────────────────────────────────────────────────────────
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  PACKED: 'packed',
  PICKED_UP: 'picked_up',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Order Placed',
  confirmed: 'Confirmed',
  preparing: 'Being Prepared',
  packed: 'Packed',
  picked_up: 'Picked Up',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
