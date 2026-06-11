import { Router } from 'express';
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from '../controllers/addresses.controller.js';
import { optionalAuth } from '../middleware/auth.js';

export const addressesRouter = Router();

addressesRouter.use(optionalAuth);
addressesRouter.get('/', listAddresses);
addressesRouter.post('/', createAddress);
addressesRouter.patch('/:id', updateAddress);
addressesRouter.delete('/:id', deleteAddress);
