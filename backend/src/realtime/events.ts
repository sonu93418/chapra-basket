import { Server } from 'socket.io';
import { Notification, Order, OrderStatus, RiderLocation } from '../types/domain.js';
import { orderRoom, SOCKET_EVENTS, userRoom } from './eventNames.js';

let io: Server | null = null;

export function setRealtimeServer(server: Server) {
  io = server;
}

export function getRealtimeServer() {
  return io;
}

export function emitOrderCreated(order: Order) {
  io?.to(userRoom(order.customerId)).emit(SOCKET_EVENTS.ORDER_CREATED, { order });
}

export function emitOrderStatus(order: Order, status: OrderStatus) {
  const payload = {
    orderId: order.id,
    status,
    estimatedMinutes: order.estimatedMinutes,
    riderId: order.riderId,
    riderName: order.riderName,
    riderPhone: order.riderPhone,
    riderRating: order.riderRating,
  };
  io?.to(orderRoom(order.id)).to(userRoom(order.customerId)).emit(statusEventName(status), payload);
}

export function emitRiderLocation(location: RiderLocation) {
  io?.to(orderRoom(location.orderId)).emit(SOCKET_EVENTS.RIDER_LOCATION, location);
  io?.to(orderRoom(location.orderId)).emit(SOCKET_EVENTS.ETA_UPDATE, location);
}

export function emitNotification(notification: Notification) {
  io?.to(userRoom(notification.userId)).emit(SOCKET_EVENTS.NOTIFICATION_PUSH, notification);
}

export function emitPaymentStatus(orderId: string, userId: string, success: boolean) {
  io?.to(orderRoom(orderId)).to(userRoom(userId)).emit(
    success ? SOCKET_EVENTS.PAYMENT_SUCCESS : SOCKET_EVENTS.PAYMENT_FAILED,
    { orderId }
  );
}

function statusEventName(status: OrderStatus) {
  switch (status) {
    case 'confirmed':
      return SOCKET_EVENTS.ORDER_ACCEPTED;
    case 'packed':
      return SOCKET_EVENTS.ORDER_PACKED;
    case 'picked_up':
      return SOCKET_EVENTS.ORDER_PICKED;
    case 'out_for_delivery':
      return SOCKET_EVENTS.ORDER_OUT_FOR_DELIVERY;
    case 'delivered':
      return SOCKET_EVENTS.ORDER_DELIVERED;
    case 'cancelled':
      return SOCKET_EVENTS.ORDER_CANCELLED;
    default:
      return SOCKET_EVENTS.ORDER_ACCEPTED;
  }
}
