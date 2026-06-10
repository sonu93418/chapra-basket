import { Router } from 'express';
import { demoAddress } from '../data/demoStore.js';
import { optionalAuth } from '../middleware/auth.js';

export const addressesRouter = Router();

addressesRouter.use(optionalAuth);
addressesRouter.get('/', (_req, res) => res.json({ success: true, data: [demoAddress] }));
addressesRouter.post('/', (req, res) => res.status(201).json({ success: true, data: { id: `addr-${Date.now()}`, ...req.body } }));
addressesRouter.patch('/:id', (req, res) => res.json({ success: true, data: { id: req.params.id, ...req.body } }));
addressesRouter.delete('/:id', (req, res) => res.json({ success: true, data: { id: req.params.id, deleted: true } }));
