import { Router } from 'express';

export const referralsRouter = Router();

referralsRouter.get('/', (_req, res) => {
  res.json({ success: true, data: { code: 'CB1234', rewardPerReferral: 50, successfulReferrals: 0 } });
});
