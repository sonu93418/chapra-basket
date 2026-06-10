import { SOCKET_EVENTS, API_BASE_URL } from '../constants';
import { Notification, Order, OrderStatus } from '../types';

export interface RealtimeSocket {
  id?: string;
  connected?: boolean;
  on: (event: string, callback: (...args: any[]) => void) => RealtimeSocket;
  off: (event: string, callback?: (...args: any[]) => void) => RealtimeSocket;
  emit: (event: string, ...args: any[]) => RealtimeSocket;
  disconnect: () => void;
}

type SocketFactory = (url: string, options: Record<string, any>) => RealtimeSocket;

let socket: RealtimeSocket | null = null;
let ioFactory: SocketFactory | null = null;

const SOCKET_IO_PACKAGE = 'socket.io-client';

async function loadSocketFactory(): Promise<SocketFactory | null> {
  if (ioFactory) return ioFactory;

  try {
    const socketModule = await import(SOCKET_IO_PACKAGE);
    ioFactory = (socketModule as any).io;
    return ioFactory;
  } catch {
    console.warn('[Socket] socket.io-client is not installed. Real-time features are disabled.');
    return null;
  }
}

export const connectSocket = async (token: string): Promise<RealtimeSocket | null> => {
  if (socket?.connected) return socket;

  const io = await loadSocketFactory();
  if (!io) return null;

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

export const getSocket = (): RealtimeSocket | null => socket;

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

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
  if (!socket) return () => {};

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

  return () => {
    socket?.emit('order:unsubscribe', { orderId });
    handlers.forEach(([event, cb]) => {
      if (cb) socket?.off(event, cb);
    });
  };
};

export const subscribeToOrderEvents = (
  onOrderCreated: (order: Order) => void,
  onStatusUpdate: (payload: {
    orderId: string;
    status: OrderStatus;
    estimatedMinutes?: number;
    riderId?: string;
    riderName?: string;
    riderPhone?: string;
    riderRating?: number;
  }) => void,
  onPaymentUpdate: (payload: { orderId: string; paymentStatus: 'pending' | 'success' | 'failed' }) => void
): (() => void) => {
  if (!socket) return () => {};

  const statusEvents: [string, OrderStatus][] = [
    [SOCKET_EVENTS.ORDER_ACCEPTED, 'confirmed'],
    [SOCKET_EVENTS.ORDER_PACKED, 'packed'],
    [SOCKET_EVENTS.ORDER_PICKED, 'picked_up'],
    [SOCKET_EVENTS.ORDER_OUT_FOR_DELIVERY, 'out_for_delivery'],
    [SOCKET_EVENTS.ORDER_DELIVERED, 'delivered'],
    [SOCKET_EVENTS.ORDER_CANCELLED, 'cancelled'],
  ];

  const createdHandler = (payload: Order | { order: Order }) => {
    onOrderCreated('order' in payload ? payload.order : payload);
  };
  const paymentSuccessHandler = (payload: { orderId: string }) => {
    onPaymentUpdate({ orderId: payload.orderId, paymentStatus: 'success' });
  };
  const paymentFailedHandler = (payload: { orderId: string }) => {
    onPaymentUpdate({ orderId: payload.orderId, paymentStatus: 'failed' });
  };

  socket.on(SOCKET_EVENTS.ORDER_CREATED, createdHandler);
  socket.on(SOCKET_EVENTS.PAYMENT_SUCCESS, paymentSuccessHandler);
  socket.on(SOCKET_EVENTS.PAYMENT_FAILED, paymentFailedHandler);

  const statusHandlers = statusEvents.map(([event, status]) => {
    const handler = (payload: any) => onStatusUpdate({ ...payload, status });
    socket?.on(event, handler);
    return [event, handler] as const;
  });

  return () => {
    socket?.off(SOCKET_EVENTS.ORDER_CREATED, createdHandler);
    socket?.off(SOCKET_EVENTS.PAYMENT_SUCCESS, paymentSuccessHandler);
    socket?.off(SOCKET_EVENTS.PAYMENT_FAILED, paymentFailedHandler);
    statusHandlers.forEach(([event, handler]) => socket?.off(event, handler));
  };
};

export const subscribeToRiderLocation = (
  orderId: string,
  onLocation: (data: {
    orderId?: string;
    lat: number;
    lng: number;
    heading?: number;
    eta?: number;
    speed?: number;
    battery?: number;
    networkStatus?: string;
  }) => void
): (() => void) => {
  if (!socket) return () => {};

  socket.emit('rider:subscribe', { orderId });
  socket.on(SOCKET_EVENTS.RIDER_LOCATION, onLocation);
  socket.on(SOCKET_EVENTS.ETA_UPDATE, onLocation);

  return () => {
    socket?.emit('rider:unsubscribe', { orderId });
    socket?.off(SOCKET_EVENTS.RIDER_LOCATION, onLocation);
    socket?.off(SOCKET_EVENTS.ETA_UPDATE, onLocation);
  };
};

export const emitRiderLocation = (data: {
  orderId: string;
  lat: number;
  lng: number;
  heading?: number;
  eta?: number;
  speed?: number;
  battery?: number;
  networkStatus?: string;
}): void => {
  socket?.emit(SOCKET_EVENTS.RIDER_LOCATION, data);
};

export const subscribeToNotifications = (
  onNotification: (data: Notification) => void
): (() => void) => {
  if (!socket) return () => {};

  socket.on(SOCKET_EVENTS.NOTIFICATION_PUSH, onNotification);
  return () => socket?.off(SOCKET_EVENTS.NOTIFICATION_PUSH, onNotification);
};
