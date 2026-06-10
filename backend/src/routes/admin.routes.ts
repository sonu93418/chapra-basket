import { Router } from 'express';

export const adminRouter = Router();

adminRouter.get('/analytics', (_req, res) => {
  res.json({
    success: true,
    data: {
      ordersToday: 0,
      revenueToday: 0,
      activeRiders: 0,
      lowStockItems: 0,
    },
  });
});
