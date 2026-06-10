import { Router } from 'express';

export const storesRouter = Router();

const stores = [
  { id: 'store-1', name: 'Fresh Bazaar Chapra', type: 'grocery', etaMinutes: 30, isOpen: true },
  { id: 'store-2', name: 'Sadar Fresh Vegetables', type: 'vegetables', etaMinutes: 25, isOpen: true },
];

storesRouter.get('/', (_req, res) => res.json({ success: true, data: stores }));
storesRouter.get('/:id', (req, res) => {
  const store = stores.find(item => item.id === req.params.id);
  if (!store) return res.status(404).json({ success: false, error: 'Store not found' });
  res.json({ success: true, data: store });
});
