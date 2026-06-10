import { Router } from 'express';
import {
  featuredProducts,
  flashSaleProducts,
  getProduct,
  listProducts,
  trendingProducts,
} from '../controllers/products.controller.js';

export const productsRouter = Router();

productsRouter.get('/', listProducts);
productsRouter.get('/featured', featuredProducts);
productsRouter.get('/flash-sale', flashSaleProducts);
productsRouter.get('/trending', trendingProducts);
productsRouter.get('/:id', getProduct);
