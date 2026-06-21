import { demoAddress } from '../data/demoStore.js';
import { getOrder } from './order.service.js';
import { getRiderLocation } from './locationCache.service.js';

// Haversine formula to compute distance in meters between two geocoordinates
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function getTracking(orderId: string) {
  const order = await getOrder(orderId);
  if (!order) throw new Error('Order not found');

  const liveLoc = await getRiderLocation(orderId);

  const storeLat = 25.7782;
  const storeLng = 84.7352;
  const customerLat = order.address.latitude ?? 25.774;
  const customerLng = order.address.longitude ?? 84.7374;

  let computedEta = order.estimatedMinutes ?? 15;

  if (liveLoc) {
    // Determine dynamic ETA based on distance to customer
    const distanceToCustomer = getHaversineDistance(
      liveLoc.lat,
      liveLoc.lng,
      customerLat,
      customerLng
    );

    // Winding factor: urban streets are around 1.3x longer than straight-line distance
    const routeDistance = distanceToCustomer * 1.3;

    // Average delivery speed in congested urban environments (e.g., 22 km/h ≈ 6.1 m/s)
    const averageSpeedMPS = 6.1;
    const travelTimeSeconds = routeDistance / averageSpeedMPS;

    // Convert to minutes, rounding up
    computedEta = Math.max(1, Math.ceil(travelTimeSeconds / 60));
  }

  return {
    orderId,
    status: order.status,
    rider: order.riderId ? {
      id: order.riderId,
      name: order.riderName,
      phone: order.riderPhone,
      vehicleNumber: 'BR 04 AB 1234',
      lat: liveLoc?.lat,
      lng: liveLoc?.lng,
      heading: liveLoc?.heading,
    } : undefined,
    storeLat,
    storeLng,
    customerLat,
    customerLng,
    eta: liveLoc?.eta ?? computedEta,
    timeline: [
      { status: 'pending', label: 'Order placed', done: true },
      { status: 'confirmed', label: 'Store confirmed', done: ['confirmed', 'preparing', 'packed', 'picked_up', 'out_for_delivery', 'delivered'].includes(order.status) },
      { status: 'packed', label: 'Packed', done: ['packed', 'picked_up', 'out_for_delivery', 'delivered'].includes(order.status) },
      { status: 'out_for_delivery', label: 'Out for delivery', done: ['out_for_delivery', 'delivered'].includes(order.status) },
      { status: 'delivered', label: 'Delivered', done: order.status === 'delivered' },
    ],
  };
}
