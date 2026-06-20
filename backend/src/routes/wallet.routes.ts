import { Router } from 'express';
import { getWallet, topupWallet } from '../controllers/wallet.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const walletRouter = Router();

walletRouter.use(requireAuth);
walletRouter.get('/', getWallet);
walletRouter.post('/topup', topupWallet);
