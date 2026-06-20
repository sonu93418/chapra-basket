import { Router } from 'express';
import { requireRole } from '../middleware/auth.js';
import {
  listActiveBanners,
  listAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
  trackClick,
} from '../controllers/banners.controller.js';

export const bannersRouter = Router();

// Customer client endpoint - lists active, currently scheduled banners
bannersRouter.get('/', listActiveBanners);

// Click tracking endpoint - increment click counts
bannersRouter.post('/:id/click', trackClick);

// Admin controls endpoints - admin required
bannersRouter.get('/admin', requireRole(['admin']), listAllBanners);
bannersRouter.post('/', requireRole(['admin']), createBanner);
bannersRouter.patch('/reorder', requireRole(['admin']), reorderBanners);
bannersRouter.patch('/:id', requireRole(['admin']), updateBanner);
bannersRouter.delete('/:id', requireRole(['admin']), deleteBanner);
