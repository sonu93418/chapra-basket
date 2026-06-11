import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { z } from 'zod';
import { env } from '../config/env.js';
import { getOrder, updateOrderStatus } from '../services/order.service.js';
import { saveRiderLocation } from '../services/locationCache.service.js';
import { RiderLocation } from '../types/domain.js';
import { orderRoom, riderRoom, SOCKET_EVENTS, userRoom } from './eventNames.js';
import { emitOrderStatus, emitRiderLocation, setRealtimeServer } from './events.js';

interface SocketUser {
  id: string;
  phone: string;
  role: string;
}

// Validation schemas for tracking inputs
const riderLocationSchema = z.object({
  orderId: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  heading: z.number().min(0).max(360).optional(),
  eta: z.number().int().nonnegative().optional(),
  speed: z.number().nonnegative().optional(),
  battery: z.number().min(0).max(100).optional(),
  networkStatus: z.string().optional(),
});

const locationSyncSchema = z.object({
  orderId: z.string().min(1),
  updates: z.array(
    z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
      heading: z.number().min(0).max(360).optional(),
      timestamp: z.string().datetime(),
    })
  ).min(1),
});

export function attachRealtimeServer(server: http.Server) {
  const io = new Server(server, {
    cors: {
      origin: env.appOrigin === '*' ? true : env.appOrigin,
      credentials: true,
    },
  });

  setRealtimeServer(io);

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.toString().replace('Bearer ', '');
    if (!token) return next();

    try {
      socket.data.user = jwt.verify(token, env.jwtSecret) as SocketUser;
    } catch {
      socket.data.user = undefined;
    }

    next();
  });

  io.on(SOCKET_EVENTS.CONNECT, (socket) => {
    const user = socket.data.user as SocketUser | undefined;
    if (user) {
      socket.join(userRoom(user.id));
      if (user.role === 'rider') socket.join(riderRoom(user.id));
      if (user.role === 'admin') socket.join('admin:monitoring');
    }

    socket.on('admin:subscribe', () => {
      if (user && user.role === 'admin') {
        socket.join('admin:monitoring');
      }
    });

    socket.on('order:subscribe', ({ orderId }: { orderId: string }) => {
      socket.join(orderRoom(orderId));
    });

    socket.on('order:unsubscribe', ({ orderId }: { orderId: string }) => {
      socket.leave(orderRoom(orderId));
    });

    socket.on('rider:subscribe', ({ orderId }: { orderId: string }) => {
      socket.join(orderRoom(orderId));
    });

    socket.on('rider:unsubscribe', ({ orderId }: { orderId: string }) => {
      socket.leave(orderRoom(orderId));
    });

    // Real-time Single Location Update
    socket.on(SOCKET_EVENTS.RIDER_LOCATION, async (rawPayload: unknown) => {
      try {
        if (!user || user.role !== 'rider') {
          console.warn('[Socket] Unauthorized location update attempt: User is not a rider.');
          return;
        }

        const payload = riderLocationSchema.parse(rawPayload);

        // Security Guard: Verify that the rider is assigned to the order
        const order = await getOrder(payload.orderId);
        if (!order) {
          console.warn(`[Socket] Location rejected: Order ${payload.orderId} not found.`);
          return;
        }

        // Allow updates only from the assigned rider
        if (order.riderId !== user.id) {
          console.warn(`[Socket] Location rejected: Rider ${user.id} is not assigned to order ${payload.orderId}.`);
          return;
        }

        const location: RiderLocation = {
          orderId: payload.orderId,
          riderId: user.id,
          lat: payload.lat,
          lng: payload.lng,
          heading: payload.heading,
          eta: payload.eta,
          speed: payload.speed,
          battery: payload.battery,
          networkStatus: payload.networkStatus,
          updatedAt: new Date().toISOString(),
        };

        // Cache and broadcast
        await saveRiderLocation(location);
        emitRiderLocation(location);
      } catch (err: any) {
        console.error('[Socket] Failed to process rider location update:', err.message);
      }
    });

    // Offline Batch Synchronization recovery
    socket.on('rider:location_sync', async (rawPayload: unknown) => {
      try {
        if (!user || user.role !== 'rider') {
          console.warn('[Socket] Unauthorized batch sync attempt: User is not a rider.');
          return;
        }

        const payload = locationSyncSchema.parse(rawPayload);
        const order = await getOrder(payload.orderId);
        if (!order || order.riderId !== user.id) {
          console.warn(`[Socket] Batch sync rejected: Unassigned or invalid order ${payload.orderId}`);
          return;
        }

        console.log(`[Socket] Syncing ${payload.updates.length} backlogged tracking points for order ${payload.orderId}`);

        // Process all updates into the database log sequentially
        for (const update of payload.updates) {
          const location: RiderLocation = {
            orderId: payload.orderId,
            riderId: user.id,
            lat: update.lat,
            lng: update.lng,
            heading: update.heading,
            updatedAt: update.timestamp,
          };
          await saveRiderLocation(location);
        }

        // Broadcast the last update in the sync batch as the active state
        const lastUpdate = payload.updates[payload.updates.length - 1];
        const activeLocation: RiderLocation = {
          orderId: payload.orderId,
          riderId: user.id,
          lat: lastUpdate.lat,
          lng: lastUpdate.lng,
          heading: lastUpdate.heading,
          updatedAt: lastUpdate.timestamp,
        };
        emitRiderLocation(activeLocation);
      } catch (err: any) {
        console.error('[Socket] Failed to process batch location sync:', err.message);
      }
    });

    socket.on('order:update_status', async ({ orderId, status }: { orderId: string; status: any }) => {
      const order = await updateOrderStatus(orderId, status);
      emitOrderStatus(order, status);
    });

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, (message: { orderId: string; text: string; senderId: string }) => {
      io.to(orderRoom(message.orderId)).emit(SOCKET_EVENTS.CHAT_MESSAGE, {
        ...message,
        id: `msg-${Date.now()}`,
        createdAt: new Date().toISOString(),
      });
    });
  });

  return io;
}
