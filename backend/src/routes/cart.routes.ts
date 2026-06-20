import { Router } from 'express';
import {
  cartItemSchema,
  clearCartController,
  getCartController,
  setCartItemController,
  validateCartController,
} from '../controllers/cart.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';

export const cartRouter = Router();

cartRouter.use(requireAuth);
cartRouter.get('/', getCartController);
cartRouter.post('/items', validateBody(cartItemSchema), setCartItemController);
cartRouter.delete('/items', clearCartController);
cartRouter.post('/validate', validateCartController);
