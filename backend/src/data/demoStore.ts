import { Address, Notification, Order, Product, RiderLocation } from '../types/domain.js';

export const demoAddress: Address = {
  id: 'addr-1',
  label: 'Home',
  fullAddress: 'Plot 12, Sadar Bazaar, near SBI Bank, Chapra - 841301',
  landmark: 'Near SBI Bank',
  lat: 25.774,
  lng: 84.7374,
  city: 'Chapra',
  state: 'Bihar',
  pincode: '841301',
  isDefault: true,
};

export const products: Product[] = [
  {
    id: 'p1',
    categoryId: 'cat-1',
    storeId: 'store-1',
    name: 'Aashirvaad Atta',
    price: 285,
    mrp: 320,
    unit: '5 kg',
    stockQuantity: 50,
    isActive: true,
    isFeatured: true,
    isFresh: false,
    images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400'],
    tags: ['atta', 'wheat', 'flour'],
    discountPercent: 11,
  },
  {
    id: 'p18',
    categoryId: 'cat-4',
    storeId: 'store-1',
    name: 'Amul Gold Milk',
    price: 68,
    mrp: 72,
    unit: '1 L',
    stockQuantity: 60,
    isActive: true,
    isFeatured: true,
    isFresh: true,
    images: ['https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'],
    tags: ['milk', 'amul', 'dairy'],
    discountPercent: 6,
  },
  {
    id: 'p12',
    categoryId: 'cat-3',
    storeId: 'store-2',
    name: 'Fresh Tomatoes',
    price: 35,
    mrp: 45,
    unit: '1 kg',
    stockQuantity: 50,
    isActive: true,
    isFeatured: true,
    isFresh: true,
    images: ['https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400'],
    tags: ['tomato', 'vegetable'],
    discountPercent: 22,
  },
];

export const orders: Order[] = [];
export const notifications: Notification[] = [];
export const riderLocations: Record<string, RiderLocation> = {};
export const carts: Record<string, { productId: string; quantity: number }[]> = {};
