import { Router } from 'express';
import {
  featuredProducts,
  flashSaleProducts,
  getProduct,
  listProducts,
  trendingProducts,
  updateProduct,
} from '../controllers/products.controller.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const productsRouter = Router();

productsRouter.get('/', listProducts);
productsRouter.get('/featured', featuredProducts);
productsRouter.get('/flash-sale', flashSaleProducts);
productsRouter.get('/trending', trendingProducts);
productsRouter.get('/:id', getProduct);
productsRouter.patch('/:id', requireRole(['store_owner', 'admin']), updateProduct);

