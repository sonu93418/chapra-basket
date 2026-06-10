import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from './useAppDispatch';
import {
  connectSocket,
  disconnectSocket,
  RealtimeSocket,
  subscribeToNotifications,
  subscribeToOrder,
  subscribeToOrderEvents,
  subscribeToRiderLocation,
} from '../services/socket';
import { addNotification } from '../features/notifications/notificationsSlice';
import {
  updateOrderStatus,
  updatePaymentStatus,
  updateRiderLocation,
  upsertOrder,
} from '../features/orders/ordersSlice';

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector(s => s.auth?.token);
  const socketRef = useRef<RealtimeSocket | null>(null);

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    const start = async () => {
      if (!token) {
        disconnectSocket();
        socketRef.current = null;
        return;
      }

      const socket = await connectSocket(token);
      if (cancelled) return;
      socketRef.current = socket;

      const unsubscribeNotifications = subscribeToNotifications((notification) => {
        dispatch(addNotification({
          ...notification,
          id: notification.id ?? `ntf-${Date.now()}`,
          isRead: notification.isRead ?? false,
          createdAt: notification.createdAt ?? new Date().toISOString(),
        }));
      });

      const unsubscribeOrders = subscribeToOrderEvents(
        (order) => dispatch(upsertOrder(order)),
        (payload) => dispatch(updateOrderStatus(payload)),
        (payload) => dispatch(updatePaymentStatus(payload))
      );

      cleanup = () => {
        unsubscribeNotifications();
        unsubscribeOrders();
      };
    };

    start();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [dispatch, token]);

  return socketRef.current;
};

export interface RiderLocation {
  lat: number;
  lng: number;
  heading?: number;
  eta?: number;
}

export const useOrderTracking = (orderId: string | null) => {
  const dispatch = useAppDispatch();
  const liveLocation = useAppSelector(s => orderId ? s.orders.riderLocations[orderId] : undefined);
  const currentOrder = useAppSelector(s => orderId ? s.orders.items.find(order => order.id === orderId) : undefined);
  const [riderLocation, setRiderLocation] = useState<RiderLocation | null>(liveLocation ?? null);

  useEffect(() => {
    if (!orderId) return;

    const unsubOrder = subscribeToOrder(orderId, {
      onAccepted: () => dispatch(updateOrderStatus({ orderId, status: 'confirmed' })),
      onPacked: () => dispatch(updateOrderStatus({ orderId, status: 'packed' })),
      onPicked: () => dispatch(updateOrderStatus({ orderId, status: 'picked_up' })),
      onOutForDelivery: () => dispatch(updateOrderStatus({ orderId, status: 'out_for_delivery' })),
      onDelivered: () => dispatch(updateOrderStatus({ orderId, status: 'delivered' })),
      onCancelled: () => dispatch(updateOrderStatus({ orderId, status: 'cancelled' })),
    });

    const unsubLocation = subscribeToRiderLocation(orderId, (data) => {
      const location = { lat: data.lat, lng: data.lng, heading: data.heading, eta: data.eta };
      setRiderLocation(location);
      dispatch(updateRiderLocation({ orderId: data.orderId ?? orderId, ...location }));
    });

    return () => {
      unsubOrder();
      unsubLocation();
    };
  }, [dispatch, orderId]);

  return {
    riderLocation,
    orderStatus: currentOrder?.status ?? null,
    eta: liveLocation?.eta ?? currentOrder?.estimatedMinutes ?? null,
  };
};
