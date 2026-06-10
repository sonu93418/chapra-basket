import http from 'http';
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { riderLocations } from '../data/demoStore.js';
import { updateOrderStatus } from '../services/order.service.js';
import { RiderLocation } from '../types/domain.js';
import { orderRoom, riderRoom, SOCKET_EVENTS, userRoom } from './eventNames.js';
import { emitOrderStatus, emitRiderLocation, setRealtimeServer } from './events.js';

interface SocketUser {
  id: string;
  phone: string;
  role: string;
}

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
    }

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

    socket.on(SOCKET_EVENTS.RIDER_LOCATION, (payload: RiderLocation) => {
      const location = { ...payload, updatedAt: new Date().toISOString() };
      riderLocations[payload.orderId] = location;
      emitRiderLocation(location);
    });

    socket.on('order:update_status', ({ orderId, status }: { orderId: string; status: any }) => {
      const order = updateOrderStatus(orderId, status);
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
