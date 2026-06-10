import { customAlphabet } from 'nanoid';
import { demoAddress, orders, products } from '../data/demoStore.js';
import { Order, OrderStatus, PaymentMethod } from '../types/domain.js';

const makeId = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

export function listOrders(customerId: string) {
  return orders.filter(order => order.customerId === customerId);
}

export function getOrder(id: string) {
  return orders.find(order => order.id === id);
}

export function createOrder(params: {
  customerId: string;
  items: { productId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  couponDiscount?: number;
}) {
  const orderItems = params.items.map((item, index) => {
    const product = products.find(candidate => candidate.id === item.productId);
    if (!product || !product.isActive) throw new Error(`Product not available: ${item.productId}`);
    if (item.quantity > product.stockQuantity) throw new Error(`${product.name} is out of stock`);
    return {
      id: `oi-${Date.now()}-${index}`,
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      unit: product.unit,
      imageUrl: product.images[0],
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = subtotal >= 299 ? 0 : 25;
  const platformFee = 5;
  const couponDiscount = params.couponDiscount ?? 0;

  const order: Order = {
    id: `ord-${Date.now()}`,
    orderNumber: `CB-${new Date().getFullYear()}-${makeId()}`,
    customerId: params.customerId,
    address: demoAddress,
    items: orderItems,
    status: 'pending',
    subtotal,
    deliveryFee,
    platformFee,
    discount: couponDiscount,
    couponDiscount,
    total: subtotal + deliveryFee + platformFee - couponDiscount,
    paymentMethod: params.paymentMethod,
    paymentStatus: params.paymentMethod === 'cod' ? 'pending' : 'success',
    estimatedMinutes: 30,
    deliveryOtp: String(Math.floor(1000 + Math.random() * 9000)),
    createdAt: new Date().toISOString(),
  };

  orders.unshift(order);
  return order;
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const order = getOrder(orderId);
  if (!order) throw new Error('Order not found');

  order.status = status;
  const now = new Date().toISOString();
  if (status === 'confirmed') order.confirmedAt = now;
  if (status === 'delivered') order.deliveredAt = now;
  if (status === 'cancelled') order.cancelledAt = now;

  return order;
}

export function cancelOrder(orderId: string) {
  return updateOrderStatus(orderId, 'cancelled');
}
