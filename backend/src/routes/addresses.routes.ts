import { Router } from 'express';
import {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  getDefaultAddress,
  setDefaultAddress,
} from '../controllers/addresses.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const addressesRouter = Router();

addressesRouter.use(requireAuth);
addressesRouter.get('/default', getDefaultAddress);
addressesRouter.patch('/default', setDefaultAddress);
addressesRouter.get('/', listAddresses);
addressesRouter.post('/', createAddress);
addressesRouter.patch('/:id', updateAddress);
addressesRouter.delete('/:id', deleteAddress);
