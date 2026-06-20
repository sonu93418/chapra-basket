import { Router } from 'express';
import {
  createPaymentController,
  createPaymentSchema,
  razorpayWebhookController,
  verifyPaymentController,
} from '../controllers/payments.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

export const paymentsRouter = Router();

paymentsRouter.post('/create-order', requireAuth, validateBody(createPaymentSchema), createPaymentController);
paymentsRouter.post('/verify', requireAuth, verifyPaymentController);
paymentsRouter.post('/webhooks/razorpay', razorpayWebhookController);
