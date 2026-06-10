import { Router } from 'express';
import {
  createPaymentController,
  createPaymentSchema,
  razorpayWebhookController,
  verifyPaymentController,
} from '../controllers/payments.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

export const paymentsRouter = Router();

paymentsRouter.use(optionalAuth);
paymentsRouter.post('/create-order', validateBody(createPaymentSchema), createPaymentController);
paymentsRouter.post('/verify', verifyPaymentController);
paymentsRouter.post('/webhooks/razorpay', razorpayWebhookController);
