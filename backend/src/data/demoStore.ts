import { Address, Notification, Order, Product, RiderLocation } from '../types/domain.js';
import { generateProducts } from './catalogGenerator.js';

export const demoAddress: Address = {
  id: 'addr-1',
  userId: 'user-1',
  fullName: 'Sonu Kumar',
  phoneNumber: '9876543210',
  addressLine1: 'Plot 12, Sadar Bazaar',
  addressLine2: 'near SBI Bank',
  landmark: 'Near SBI Bank',
  city: 'Chapra',
  state: 'Bihar',
  postalCode: '841301',
  country: 'India',
  latitude: 25.774,
  longitude: 84.7374,
  isDefault: true,
};

export const products: Product[] = generateProducts();

export const orders: Order[] = [];
export const notifications: Notification[] = [];
export const riderLocations: Record<string, RiderLocation> = {};
export const carts: Record<string, { productId: string; quantity: number }[]> = {};
