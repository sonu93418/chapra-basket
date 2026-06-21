export type UserRole = 'customer' | 'rider' | 'store_owner' | 'admin';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'packed'
  | 'picked_up'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';
export type PaymentMethod = 'upi' | 'card' | 'cod' | 'wallet' | 'netbanking';

export interface Product {
  id: string;
  categoryId: string;
  storeId: string;
  name: string;
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

  // Premium product metadata
  sku?: string;
  barcode?: string;
  brand?: string;
  subcategory?: string;
  shortDescription?: string;
  weightOrVolume?: string;
  gstPercent?: number;
  shelfLife?: string;
  manufacturingDate?: string;
  expiryDate?: string;
  countryOfOrigin?: string;
  manufacturer?: string;
  storageInstructions?: string;
  averageRating?: number;
  reviewCount?: number;
  deliveryEtaMinutes?: number;
  isTrending?: boolean;
}

export interface Address {
  id: string;
  userId?: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  addressType?: 'Home' | 'Work' | 'Other' | string;
  deliveryInstructions?: string;
  createdAt?: string;
  updatedAt?: string;
}

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
  paymentStatus: PaymentStatus;
  estimatedMinutes?: number;
  deliveryOtp?: string;
  createdAt: string;
  confirmedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'order_update' | 'offer' | 'system' | 'wallet' | 'referral';
  isRead: boolean;
  data?: Record<string, string>;
  createdAt: string;
}

export interface RiderLocation {
  orderId: string;
  riderId: string;
  lat: number;
  lng: number;
  heading?: number;
  eta?: number;
  updatedAt: string;
  speed?: number;
  battery?: number;
  networkStatus?: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  ctaText?: string;
  clickDestination?: string;
  isActive: boolean;
  sortOrder: number;
  startDate?: string | null;
  endDate?: string | null;
  campaignType?: string;
  clicks: number;
  createdAt?: string;
  updatedAt?: string;
}
