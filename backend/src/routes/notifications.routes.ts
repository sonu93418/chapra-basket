import { Router } from 'express';
import {
  listNotificationsController,
  markAllNotificationsReadController,
  markNotificationReadController,
} from '../controllers/notifications.controller.js';
import { optionalAuth } from '../middleware/auth.js';

export const notificationsRouter = Router();

notificationsRouter.use(optionalAuth);
notificationsRouter.get('/', listNotificationsController);
notificationsRouter.patch('/read-all', markAllNotificationsReadController);
notificationsRouter.patch('/:id/read', markNotificationReadController);
