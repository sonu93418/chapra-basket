import { carts, products } from '../data/demoStore.js';

const FREE_DELIVERY_ABOVE = 299;
const DELIVERY_FEE = 25;
const PLATFORM_FEE = 5;

export function getCart(userId: string) {
  const items = carts[userId] ?? [];
  const hydratedItems = items
    .map(item => ({ product: products.find(product => product.id === item.productId), quantity: item.quantity }))
    .filter(item => item.product);

  const subtotal = hydratedItems.reduce((sum, item) => sum + (item.product?.price ?? 0) * item.quantity, 0);
  const deliveryFee = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;

  return {
    items: hydratedItems,
    subtotal,
    deliveryFee,
    platformFee: PLATFORM_FEE,
    total: subtotal + deliveryFee + PLATFORM_FEE,
  };
}

export function setCartItem(userId: string, productId: string, quantity: number) {
  const product = products.find(item => item.id === productId && item.isActive);
  if (!product) throw new Error('Product not available');
  if (quantity > product.stockQuantity) throw new Error('Requested quantity is not in stock');

  const cart = carts[userId] ?? [];
  const existing = cart.find(item => item.productId === productId);
  if (quantity <= 0) {
    carts[userId] = cart.filter(item => item.productId !== productId);
  } else if (existing) {
    existing.quantity = quantity;
  } else {
    cart.push({ productId, quantity });
    carts[userId] = cart;
  }

  return getCart(userId);
}

export function clearCart(userId: string) {
  carts[userId] = [];
  return getCart(userId);
}
