import { Request, Response } from 'express';
import { notifications } from '../data/demoStore.js';

function userId(req: Request) {
  return req.user?.id ?? 'user-1';
}

export function listNotificationsController(req: Request, res: Response) {
  res.json({ success: true, data: notifications.filter(item => item.userId === userId(req)) });
}

export function markNotificationReadController(req: Request, res: Response) {
  const notification = notifications.find(item => item.id === req.params.id && item.userId === userId(req));
  if (notification) notification.isRead = true;
  res.json({ success: true, data: notification });
}

export function markAllNotificationsReadController(req: Request, res: Response) {
  notifications.forEach(item => {
    if (item.userId === userId(req)) item.isRead = true;
  });
  res.json({ success: true, data: { updated: true } });
}
