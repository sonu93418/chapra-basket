import { Router } from 'express';
import { getReferralInfo } from '../controllers/referrals.controller.js';
import { optionalAuth } from '../middleware/auth.js';

export const referralsRouter = Router();

referralsRouter.use(optionalAuth);
referralsRouter.get('/', getReferralInfo);
