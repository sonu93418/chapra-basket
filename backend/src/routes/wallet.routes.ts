import { Router } from 'express';

export const walletRouter = Router();

walletRouter.get('/', (_req, res) => {
  res.json({
    success: true,
    data: {
      balance: 120,
      transactions: [
        { id: 'wt-1', type: 'credit', amount: 100, description: 'Wallet top-up', createdAt: new Date().toISOString() },
      ],
    },
  });
});
