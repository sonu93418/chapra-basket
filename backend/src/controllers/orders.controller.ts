import { Request, Response } from 'express';
import { z } from 'zod';
import { carts } from '../data/demoStore.js';
import { clearCart } from '../services/cart.service.js';
import {
  cancelOrder,
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
} from '../services/order.service.js';
import { getTracking } from '../services/tracking.service.js';
import { PaymentMethod } from '../types/domain.js';
import { emitNotification, emitOrderCreated, emitOrderStatus } from '../realtime/events.js';

export const createOrderSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number().int().positive() })).optional(),
  paymentMethod: z.enum(['upi', 'card', 'cod', 'wallet', 'netbanking']).default('cod'),
  couponDiscount: z.number().min(0).optional(),
  addressId: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'packed', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled', 'returned']),
});

function userId(req: Request) {
  return req.user?.id ?? 'user-1';
}

function paramId(req: Request) {
  const value = req.params.id;
  return Array.isArray(value) ? value[0] : value;
}

export async function listOrdersController(req: Request, res: Response) {
  try {
    const list = await listOrders(userId(req));
    res.json({ success: true, data: { items: list, total: list.length } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function getOrderController(req: Request, res: Response) {
  try {
    const order = await getOrder(paramId(req));
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function createOrderController(req: Request, res: Response) {
  try {
    const customerId = userId(req);
    const items = req.body.items ?? carts[customerId] ?? [];
    const order = await createOrder({
      customerId,
      items,
      paymentMethod: req.body.paymentMethod as PaymentMethod,
      couponDiscount: req.body.couponDiscount,
      addressId: req.body.addressId,
    });

    clearCart(customerId);
    emitOrderCreated(order);
    emitNotification({
      id: `ntf-${Date.now()}`,
      userId: customerId,
      title: 'Order placed',
      body: `Your order ${order.orderNumber} has been placed.`,
      type: 'order_update',
      isRead: false,
      data: { orderId: order.id },
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ success: true, data: order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function updateOrderStatusController(req: Request, res: Response) {
  try {
    const order = await updateOrderStatus(paramId(req), req.body.status);
    emitOrderStatus(order, req.body.status);
    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function cancelOrderController(req: Request, res: Response) {
  try {
    const order = await cancelOrder(paramId(req));
    emitOrderStatus(order, 'cancelled');
    res.json({ success: true, data: order });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export function getTrackingController(req: Request, res: Response) {
  res.json({ success: true, data: getTracking(paramId(req)) });
}
