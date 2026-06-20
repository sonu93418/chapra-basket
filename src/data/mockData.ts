import { Category, Product, Order, Coupon, Notification, WalletTransaction, RiderOrder } from '../types';
import { generateProducts } from './catalogGenerator';

// ─── Categories ────────────────────────────────────────────────
export const CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Grocery', slug: 'grocery', iconName: 'storefront', color: '#FFF3E0', productCount: 100 },
  { id: 'cat-2', name: 'Fruits', slug: 'fruits', iconName: 'nutrition', color: '#FCE4EC', productCount: 60 },
  { id: 'cat-3', name: 'Vegetables', slug: 'vegetables', iconName: 'eco', color: '#E8F5E9', productCount: 60 },
  { id: 'cat-4', name: 'Dairy', slug: 'dairy', iconName: 'water_drop', color: '#E3F2FD', productCount: 50 },
  { id: 'cat-5', name: 'Medicines', slug: 'medicines', iconName: 'medication', color: '#EDE7F6', productCount: 50 },
  { id: 'cat-6', name: 'Snacks', slug: 'snacks', iconName: 'cookie', color: '#FFF8E1', productCount: 80 },
  { id: 'cat-7', name: 'Beverages', slug: 'beverages', iconName: 'local_cafe', color: '#E0F7FA', productCount: 60 },
  { id: 'cat-8', name: 'Electronics', slug: 'electronics', iconName: 'devices', color: '#F3E5F5', productCount: 50 },
  { id: 'cat-9', name: 'Stationery', slug: 'stationery', iconName: 'edit', color: '#E8EAF6', productCount: 40 },
  { id: 'cat-10', name: 'Personal Care', slug: 'personal-care', iconName: 'spa', color: '#FBE9E7', productCount: 60 },
];

// ─── Products ─────────────────────────────────────────────────
export const PRODUCTS: Product[] = generateProducts();

// ─── Featured / Flash Sale Products ───────────────────────────
export const FLASH_SALE_PRODUCTS = PRODUCTS.filter(p => (p.discountPercent ?? 0) >= 15).slice(0, 8);
export const FEATURED_PRODUCTS = PRODUCTS.filter(p => p.isFeatured);
export const FRESH_PRODUCTS = PRODUCTS.filter(p => p.isFresh);

// ─── Mock Coupons ─────────────────────────────────────────────
export const COUPONS: Coupon[] = [
  { id: 'c1', code: 'WELCOME30', description: 'Get ₹30 off on your first order', discountType: 'flat', discountValue: 30, minOrderValue: 100, isApplied: false },
  { id: 'c2', code: 'FRESH20', description: 'Get 20% off on fresh vegetables & fruits', discountType: 'percent', discountValue: 20, maxDiscount: 60, minOrderValue: 150, isApplied: false },
  { id: 'c3', code: 'BLINK50', description: 'Blink Special offer — ₹50 off above ₹300', discountType: 'flat', discountValue: 50, minOrderValue: 300, isApplied: false },
  { id: 'c4', code: 'FREEDEL', description: 'Free delivery on your next order', discountType: 'flat', discountValue: 25, minOrderValue: 199, isApplied: false },
];

// ─── Mock Orders ──────────────────────────────────────────────
export const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-1', orderNumber: 'CB-2024-00156',
    customerId: 'user-1', riderId: 'rider-1',
    riderName: 'Rajan Kumar', riderPhone: '+917654321098', riderRating: 4.8,
    address: { id: 'addr-1', userId: 'user-1', fullName: 'Sonu Kumar', phoneNumber: '9876543210', addressLine1: 'Plot 12, Sadar Bazaar', addressLine2: 'near SBI Bank', landmark: 'Near SBI Bank', latitude: 25.7740, longitude: 84.7374, city: 'Chapra', state: 'Bihar', postalCode: '841301', country: 'India', isDefault: true },
    items: [
      { id: 'oi-1', productId: 'p-cat-4-1', name: 'Gold Pasteurized Milk', price: 68, quantity: 2, unit: '1 L', imageUrl: PRODUCTS[220].images[0] },
      { id: 'oi-2', productId: 'p-cat-2-1', name: 'Banana Robusta', price: 50, quantity: 1, unit: '1 dozen', imageUrl: PRODUCTS[100].images[0] },
    ],
    status: 'out_for_delivery', subtotal: 186, deliveryFee: 20, platformFee: 5, discount: 0, couponDiscount: 0, total: 211,
    paymentMethod: 'cod', paymentStatus: 'pending', estimatedMinutes: 12, deliveryOtp: '4829',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
  },
  {
    id: 'ord-2', orderNumber: 'CB-2024-00154',
    customerId: 'user-1',
    address: { id: 'addr-1', userId: 'user-1', fullName: 'Sonu Kumar', phoneNumber: '9876543210', addressLine1: 'Plot 12, Sadar Bazaar', addressLine2: 'near SBI Bank', landmark: 'Near SBI Bank', latitude: 25.7740, longitude: 84.7374, city: 'Chapra', state: 'Bihar', postalCode: '841301', country: 'India', isDefault: true },
    items: [
      { id: 'oi-3', productId: 'p-cat-1-1', name: 'Basmati Rice Premium', price: 135, quantity: 1, unit: '1 kg', imageUrl: PRODUCTS[0].images[0] },
      { id: 'oi-4', productId: 'p-cat-4-1', name: 'Gold Pasteurized Milk', price: 68, quantity: 3, unit: '1 L', imageUrl: PRODUCTS[220].images[0] },
    ],
    status: 'delivered', subtotal: 339, deliveryFee: 0, platformFee: 5, discount: 50, couponDiscount: 50, total: 294,
    paymentMethod: 'upi', paymentStatus: 'success',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString(),
    deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60000 + 28 * 60000).toISOString(),
  },
  {
    id: 'ord-3', orderNumber: 'CB-2024-00149',
    customerId: 'user-1',
    address: { id: 'addr-1', userId: 'user-1', fullName: 'Sonu Kumar', phoneNumber: '9876543210', addressLine1: 'Plot 12, Sadar Bazaar', addressLine2: 'near SBI Bank', landmark: 'Near SBI Bank', latitude: 25.7740, longitude: 84.7374, city: 'Chapra', state: 'Bihar', postalCode: '841301', country: 'India', isDefault: true },
    items: [
      { id: 'oi-5', productId: 'p-cat-7-1', name: 'Original Coca-Cola Can', price: 40, quantity: 4, unit: '330 ml', imageUrl: PRODUCTS[400].images[0] },
      { id: 'oi-6', productId: 'p-cat-6-1', name: 'Potato Chips Magic Masala', price: 20, quantity: 3, unit: '50 g', imageUrl: PRODUCTS[320].images[0] },
    ],
    status: 'delivered', subtotal: 220, deliveryFee: 20, platformFee: 5, discount: 0, couponDiscount: 0, total: 245,
    paymentMethod: 'wallet', paymentStatus: 'success',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString(),
    deliveredAt: new Date(Date.now() - 5 * 24 * 60 * 60000 + 22 * 60000).toISOString(),
  },
];

// ─── Mock Rider Orders ─────────────────────────────────────────
export const RIDER_AVAILABLE_ORDERS: RiderOrder[] = [
  { id: 'ro-1', orderNumber: '9928', storeName: 'Blink Kitchen', storeIcon: 'restaurant', storeType: 'restaurant', distanceKm: 1.2, payout: 125, bonus: 20, hasBonus: true, itemImages: [PRODUCTS[400].images[0], PRODUCTS[320].images[0]], customerName: 'Priya Singh', customerAddress: 'Sadar Bazaar, Chapra' },
  { id: 'ro-2', orderNumber: '9931', storeName: 'Fresh Bazaar', storeIcon: 'shopping_basket', storeType: 'grocery', distanceKm: 2.8, payout: 85, hasBonus: false, expiresInSeconds: 240, itemImages: [PRODUCTS[100].images[0]], customerName: 'Ramesh Yadav', customerAddress: 'Station Road, Chapra' },
  { id: 'ro-3', orderNumber: '9933', storeName: 'MedPlus Pharmacy', storeIcon: 'medication', storeType: 'pharmacy', distanceKm: 0.9, payout: 65, hasBonus: false, itemImages: [PRODUCTS[270].images[0]], customerName: 'Anita Kumari', customerAddress: 'Kotwali Chowk, Chapra' },
];

// ─── Mock Notifications ───────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'n1', title: 'Order Out for Delivery!', body: 'Rajan Kumar is on the way. Estimated: 12 minutes.', type: 'order_update', isRead: false, createdAt: new Date(Date.now() - 10 * 60000).toISOString() },
  { id: 'n2', title: 'Flash Sale Alert!', body: '20% off on all fresh vegetables. Only for next 2 hours!', type: 'offer', isRead: false, createdAt: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: 'n3', title: 'Order Delivered', body: 'Your order CB-2024-00154 has been delivered. Rate your experience!', type: 'order_update', isRead: true, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString() },
  { id: 'n4', title: 'Referral Credits added to Wallet', body: 'Your referral reward has been credited. Invite more friends!', type: 'wallet', isRead: true, createdAt: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString() },
];

// ─── Mock Wallet Transactions ─────────────────────────────────
export const MOCK_WALLET_TRANSACTIONS: WalletTransaction[] = [
  { id: 'wt-1', type: 'credit', amount: 50, description: 'Referral reward — Priya joined', createdAt: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString() },
  { id: 'wt-2', type: 'debit', amount: 50, description: 'Used in order #CB-2024-00154', createdAt: new Date(Date.now() - 2 * 24 * 60 * 60000).toISOString() },
  { id: 'wt-3', type: 'credit', amount: 100, description: 'Added via UPI', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60000).toISOString() },
  { id: 'wt-4', type: 'debit', amount: 80, description: 'Used in order #CB-2024-00149', createdAt: new Date(Date.now() - 5 * 24 * 60 * 60000 + 30 * 60000).toISOString() },
];

// ─── Promotional Banners ──────────────────────────────────────
export const BANNERS = [
  {
    id: 'b1',
    title: 'Fresh Vegetables',
    subtitle: 'Up to 25% off today!',
    ctaText: 'Shop Now',
    imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
    clickDestination: 'vegetables',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'b2',
    title: 'Dairy Essentials',
    subtitle: 'Delivered in 30 minutes',
    ctaText: 'Order Now',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800',
    clickDestination: 'dairy',
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'b3',
    title: 'Puja Special Offer',
    subtitle: 'Complete Samagri Kit Available',
    ctaText: 'Explore',
    imageUrl: 'https://images.unsplash.com/photo-1610389801517-3e01c32a5d41?w=800',
    clickDestination: 'grocery',
    isActive: true,
    sortOrder: 3,
  },
];
