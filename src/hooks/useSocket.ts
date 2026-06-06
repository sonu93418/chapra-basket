/**
 * Chapra Basket — useSocket Hook
 * Manages socket connection lifecycle tied to auth state
 */
import { useEffect, useRef } from 'react';
import { useAppSelector } from './useAppDispatch';
import {
  connectSocket,
  disconnectSocket,
  subscribeToNotifications,
} from '../services/socket';
import type { Socket } from 'socket.io-client';

export const useSocket = () => {
  const token = useAppSelector(s => s.auth?.token);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    socketRef.current = connectSocket(token);

    // Subscribe to global notifications
    const unsub = subscribeToNotifications((notification) => {
      console.log('[Notification]', notification.title, notification.body);
      // TODO: dispatch to Redux notification slice
    });

    return () => {
      unsub();
    };
  }, [token]);

  return socketRef.current;
};

// ─── Order Tracking Hook ───────────────────────────────────────────────────
import { useState } from 'react';
import { subscribeToOrder, subscribeToRiderLocation } from '../services/socket';

export interface RiderLocation {
  lat: number;
  lng: number;
  heading?: number;
  eta?: number;
}

export const useOrderTracking = (orderId: string | null) => {
  const [riderLocation, setRiderLocation] = useState<RiderLocation | null>(null);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  const [eta, setEta] = useState<number | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const unsubOrder = subscribeToOrder(orderId, {
      onAccepted: () => setOrderStatus('confirmed'),
      onPacked: () => setOrderStatus('packed'),
      onPicked: () => setOrderStatus('picked_up'),
      onOutForDelivery: () => setOrderStatus('out_for_delivery'),
      onDelivered: () => setOrderStatus('delivered'),
      onCancelled: () => setOrderStatus('cancelled'),
    });

    const unsubLocation = subscribeToRiderLocation(orderId, (data) => {
      setRiderLocation({ lat: data.lat, lng: data.lng, heading: data.heading });
      if (data.eta) setEta(data.eta);
    });

    return () => {
      unsubOrder();
      unsubLocation();
    };
  }, [orderId]);

  return { riderLocation, orderStatus, eta };
};
