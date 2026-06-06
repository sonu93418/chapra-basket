/**
 * Chapra Basket — Socket.IO Client Service
 * Manages real-time connection for order tracking, chat, notifications
 */
import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS, API_BASE_URL } from '../constants';

let socket: Socket | null = null;

/**
 * Initialize and connect the socket with auth token
 */
export const connectSocket = (token: string): Socket => {
  if (socket?.connected) return socket;

  socket = io(API_BASE_URL.replace('/api/v1', ''), {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
  });

  socket.on(SOCKET_EVENTS.CONNECT, () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  socket.on(SOCKET_EVENTS.ERROR, (err) => {
    console.error('[Socket] Error:', err);
  });

  return socket;
};

/**
 * Get current socket instance
 */
export const getSocket = (): Socket | null => socket;

/**
 * Disconnect and cleanup
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Subscribe to order lifecycle events for a given orderId
 */
export const subscribeToOrder = (
  orderId: string,
  callbacks: {
    onAccepted?: () => void;
    onPacked?: () => void;
    onPicked?: () => void;
    onOutForDelivery?: () => void;
    onDelivered?: () => void;
    onCancelled?: (reason: string) => void;
  }
): (() => void) => {
  if (!socket) return () => { };

  socket.emit('order:subscribe', { orderId });

  const handlers = [
    [SOCKET_EVENTS.ORDER_ACCEPTED, callbacks.onAccepted],
    [SOCKET_EVENTS.ORDER_PACKED, callbacks.onPacked],
    [SOCKET_EVENTS.ORDER_PICKED, callbacks.onPicked],
    [SOCKET_EVENTS.ORDER_OUT_FOR_DELIVERY, callbacks.onOutForDelivery],
    [SOCKET_EVENTS.ORDER_DELIVERED, callbacks.onDelivered],
    [SOCKET_EVENTS.ORDER_CANCELLED, callbacks.onCancelled],
  ] as [string, ((...args: any[]) => void) | undefined][];

  handlers.forEach(([event, cb]) => {
    if (cb) socket?.on(event, cb);
  });

  // Return cleanup function
  return () => {
    socket?.emit('order:unsubscribe', { orderId });
    handlers.forEach(([event, cb]) => {
      if (cb) socket?.off(event, cb);
    });
  };
};

/**
 * Subscribe to rider location updates
 */
export const subscribeToRiderLocation = (
  orderId: string,
  onLocation: (data: { lat: number; lng: number; heading?: number; eta?: number }) => void
): (() => void) => {
  if (!socket) return () => { };

  socket.emit('rider:subscribe', { orderId });
  socket.on(SOCKET_EVENTS.RIDER_LOCATION, onLocation);
  socket.on(SOCKET_EVENTS.ETA_UPDATE, onLocation);

  return () => {
    socket?.emit('rider:unsubscribe', { orderId });
    socket?.off(SOCKET_EVENTS.RIDER_LOCATION, onLocation);
    socket?.off(SOCKET_EVENTS.ETA_UPDATE, onLocation);
  };
};

/**
 * Emit rider's current location (used in Rider app)
 */
export const emitRiderLocation = (data: {
  orderId: string;
  lat: number;
  lng: number;
  heading?: number;
}): void => {
  socket?.emit(SOCKET_EVENTS.RIDER_LOCATION, data);
};


/**
 * Subscribe to notification events
 */
export const subscribeToNotifications = (
  onNotification: (data: { title: string; body: string; type: string; data?: any }) => void
): (() => void) => {
  if (!socket) return () => {};

  socket.on(SOCKET_EVENTS.NOTIFICATION_PUSH, onNotification);
  return () => socket?.off(SOCKET_EVENTS.NOTIFICATION_PUSH, onNotification);
};