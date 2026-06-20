import { Request, Response } from 'express';
import { z } from 'zod';
import { emitPaymentStatus } from '../realtime/events.js';
import { createPaymentOrder } from '../services/payment.service.js';
import { updateOrderPaymentStatus } from '../services/order.service.js';

export const createPaymentSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
});

export async function createPaymentController(req: Request, res: Response) {
  const data = await createPaymentOrder(req.body.amount, req.body.orderId);
  res.json({ success: true, data });
}

export async function verifyPaymentController(req: Request, res: Response) {
  const userId = req.user?.id ?? 'user-1';
  const { orderId, success = true } = req.body;
  const status = success ? 'success' : 'failed';

  await updateOrderPaymentStatus(orderId, status);
  emitPaymentStatus(orderId, userId, success);
  res.json({ success: true, data: { verified: success } });
}

export function razorpayWebhookController(req: Request, res: Response) {
  res.json({ success: true, data: { received: true } });
}
