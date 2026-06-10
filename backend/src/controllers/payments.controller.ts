import { Request, Response } from 'express';
import { z } from 'zod';
import { emitPaymentStatus } from '../realtime/events.js';
import { createPaymentOrder } from '../services/payment.service.js';

export const createPaymentSchema = z.object({
  orderId: z.string(),
  amount: z.number().positive(),
});

export async function createPaymentController(req: Request, res: Response) {
  const data = await createPaymentOrder(req.body.amount, req.body.orderId);
  res.json({ success: true, data });
}

export function verifyPaymentController(req: Request, res: Response) {
  const userId = req.user?.id ?? 'user-1';
  emitPaymentStatus(req.body.orderId, userId, true);
  res.json({ success: true, data: { verified: true } });
}

export function razorpayWebhookController(req: Request, res: Response) {
  res.json({ success: true, data: { received: true } });
}
