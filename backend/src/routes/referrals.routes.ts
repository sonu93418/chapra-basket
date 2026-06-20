import { Router } from 'express';
import { getReferralInfo } from '../controllers/referrals.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const referralsRouter = Router();

referralsRouter.use(requireAuth);
referralsRouter.get('/', getReferralInfo);
