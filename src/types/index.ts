// ─── User Types ───────────────────────────────────────────────
export type UserRole = 'customer' | 'rider' | 'admin';

export interface User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  role: UserRole;
  referralCode: string;
  createdAt: string;
}

// ─── Address Types ─────────────────────────────────────────────
export type AddressLabel = 'Home' | 'Work' | 'Other';

export interface Address {
  id: string;
  label: AddressLabel;
  fullAddress: string;
  landmark?: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

// ─── Category Types ────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  nameHindi?: string;
  slug: string;
  iconName: string;
  color: string;
  productCount?: number;
  parentId?: string;
}

// ─── Product Types ─────────────────────────────────────────────
export interface Product {
  id: string;
  categoryId: string;
  name: string;
  nameHindi?: string;
  description?: string;
  price: number;
  mrp?: number;
  unit: string;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  isFresh: boolean;
  images: string[];
  tags: string[];
  discountPercent?: number;
}

// ─── Cart Types ────────────────────────────────────────────────
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  couponCode?: string;
  couponDiscount: number;
}

// ─── Order Types ───────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'packed'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentMethod = 'upi' | 'card' | 'cod' | 'wallet' | 'netbanking';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  riderRating?: number;
  address: Address;
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  platformFee: number;
  discount: number;
  couponDiscount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'success' | 'failed';
  estimatedMinutes?: number;
  deliveryOtp?: string;
  specialInstructions?: string;
  createdAt: string;
  confirmedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

// ─── Rider Types ───────────────────────────────────────────────
export type VehicleType = 'bicycle' | 'motorcycle';
export type KycStatus = 'pending' | 'approved' | 'rejected';

export interface RiderProfile {
  userId: string;
  vehicleType: VehicleType;
  vehicleNumber?: string;
  licenseNumber?: string;
  kycStatus: KycStatus;
  isOnline: boolean;
  currentLat?: number;
  currentLng?: number;
  totalDeliveries: number;
  avgRating: number;
  todayEarnings: number;
  todayTrips: number;
  todayHours: number;
}

export interface RiderOrder {
  id: string;
  orderNumber: string;
  storeName: string;
  storeIcon: string;
  storeType: 'grocery' | 'restaurant' | 'pharmacy' | 'other';
  distanceKm: number;
  payout: number;
  bonus?: number;
  expiresInSeconds?: number;
  hasBonus: boolean;
  itemImages: string[];
  customerName: string;
  customerAddress: string;
}

// ─── Coupon Types ──────────────────────────────────────────────
export type DiscountType = 'flat' | 'percent';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscount?: number;
  minOrderValue: number;
  isApplied: boolean;
  expiresAt?: string;
}

// ─── Notification Types ────────────────────────────────────────
export type NotificationType = 'order_update' | 'offer' | 'system' | 'wallet' | 'referral';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, string>;
}

// ─── Wallet Types ──────────────────────────────────────────────
export type TransactionType = 'credit' | 'debit';

export interface WalletTransaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  createdAt: string;
}

export interface Wallet {
  balance: number;
  transactions: WalletTransaction[];
}

// ─── API Types ─────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
