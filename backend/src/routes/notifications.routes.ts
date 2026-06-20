import { Router } from 'express';
import {
  listNotificationsController,
  markAllNotificationsReadController,
  markNotificationReadController,
} from '../controllers/notifications.controller.js';
import { requireAuth } from '../middleware/auth.js';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth);
notificationsRouter.get('/', listNotificationsController);
notificationsRouter.patch('/read-all', markAllNotificationsReadController);
notificationsRouter.patch('/:id/read', markNotificationReadController);
