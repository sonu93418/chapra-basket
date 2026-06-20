import { Router } from 'express';
import {
  cancelOrderController,
  createOrderController,
  createOrderSchema,
  getOrderController,
  getTrackingController,
  listOrdersController,
  updateOrderStatusController,
  updateOrderStatusSchema,
} from '../controllers/orders.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

export const ordersRouter = Router();

ordersRouter.use(requireAuth);
ordersRouter.get('/', listOrdersController);
ordersRouter.post('/', validateBody(createOrderSchema), createOrderController);
ordersRouter.get('/:id', getOrderController);
ordersRouter.get('/:id/tracking', getTrackingController);
ordersRouter.post('/:id/cancel', requireRole(['customer', 'store_owner', 'admin']), cancelOrderController);
ordersRouter.patch('/:id/status', requireRole(['rider', 'store_owner', 'admin']), validateBody(updateOrderStatusSchema), updateOrderStatusController);
