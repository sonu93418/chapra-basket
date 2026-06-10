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

export interface Address {
  id: string;
  label: 'Home' | 'Work' | 'Other';
  fullAddress: string;
  landmark?: string;
  lat: number;
  lng: number;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
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
