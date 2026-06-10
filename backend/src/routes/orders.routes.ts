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
import { optionalAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

export const ordersRouter = Router();

ordersRouter.use(optionalAuth);
ordersRouter.get('/', listOrdersController);
ordersRouter.post('/', validateBody(createOrderSchema), createOrderController);
ordersRouter.get('/:id', getOrderController);
ordersRouter.get('/:id/tracking', getTrackingController);
ordersRouter.post('/:id/cancel', cancelOrderController);
ordersRouter.patch('/:id/status', validateBody(updateOrderStatusSchema), updateOrderStatusController);
