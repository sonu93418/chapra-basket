import { Router } from 'express';

export const reviewsRouter = Router();

reviewsRouter.post('/orders/:orderId', (req, res) => {
  res.status(201).json({ success: true, data: { id: `rev-${Date.now()}`, orderId: req.params.orderId, ...req.body } });
});
