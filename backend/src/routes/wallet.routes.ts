import { Router } from 'express';
import { getWallet, topupWallet } from '../controllers/wallet.controller.js';
import { optionalAuth } from '../middleware/auth.js';

export const walletRouter = Router();

walletRouter.use(optionalAuth);
walletRouter.get('/', getWallet);
walletRouter.post('/topup', topupWallet);
