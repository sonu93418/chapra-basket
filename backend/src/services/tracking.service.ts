import { demoAddress, riderLocations } from '../data/demoStore.js';
import { getOrder } from './order.service.js';

export function getTracking(orderId: string) {
  const order = getOrder(orderId);
  if (!order) throw new Error('Order not found');

  return {
    orderId,
    status: order.status,
    rider: order.riderId ? {
      id: order.riderId,
      name: order.riderName,
      phone: order.riderPhone,
      vehicleNumber: 'BR 04 AB 1234',
      lat: riderLocations[orderId]?.lat,
      lng: riderLocations[orderId]?.lng,
    } : undefined,
    storeLat: 25.7782,
    storeLng: 84.7352,
    customerLat: demoAddress.lat,
    customerLng: demoAddress.lng,
    eta: riderLocations[orderId]?.eta ?? order.estimatedMinutes,
    timeline: [
      { status: 'pending', label: 'Order placed', done: true },
      { status: 'confirmed', label: 'Store confirmed', done: ['confirmed', 'preparing', 'packed', 'picked_up', 'out_for_delivery', 'delivered'].includes(order.status) },
      { status: 'packed', label: 'Packed', done: ['packed', 'picked_up', 'out_for_delivery', 'delivered'].includes(order.status) },
      { status: 'out_for_delivery', label: 'Out for delivery', done: ['out_for_delivery', 'delivered'].includes(order.status) },
      { status: 'delivered', label: 'Delivered', done: order.status === 'delivered' },
    ],
  };
}
