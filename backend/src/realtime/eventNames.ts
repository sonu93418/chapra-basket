export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  ORDER_CREATED: 'order:created',
  ORDER_ACCEPTED: 'order:accepted',
  ORDER_PACKED: 'order:packed',
  ORDER_PICKED: 'order:picked',
  ORDER_OUT_FOR_DELIVERY: 'order:out_for_delivery',
  ORDER_DELIVERED: 'order:delivered',
  ORDER_CANCELLED: 'order:cancelled',
  RIDER_LOCATION: 'rider:location',
  ETA_UPDATE: 'eta:update',
  CHAT_MESSAGE: 'chat:message',
  CHAT_TYPING: 'chat:typing',
  PAYMENT_SUCCESS: 'payment:success',
  PAYMENT_FAILED: 'payment:failed',
  NOTIFICATION_PUSH: 'notification:push',
} as const;

export const orderRoom = (orderId: string) => `order:${orderId}`;
export const userRoom = (userId: string) => `user:${userId}`;
export const riderRoom = (riderId: string) => `rider:${riderId}`;
