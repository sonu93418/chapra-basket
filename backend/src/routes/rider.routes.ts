import { Router } from 'express';
import { riderLocations } from '../data/demoStore.js';
import { emitRiderLocation } from '../realtime/events.js';
import { requireRole } from '../middleware/auth.js';

export const riderRouter = Router();

riderRouter.get('/orders/available', requireRole(['rider', 'admin']), (_req, res) => {
  res.json({
    success: true,
    data: [
      { id: 'ord-live-1', orderNumber: 'CB-2026-10001', distanceKm: 1.2, payout: 85, expiresInSeconds: 180 },
    ],
  });
});

riderRouter.post('/location', requireRole(['rider', 'admin']), (req, res) => {
  const location = {
    orderId: req.body.orderId,
    riderId: req.body.riderId ?? 'rider-1',
    lat: req.body.lat,
    lng: req.body.lng,
    heading: req.body.heading,
    eta: req.body.eta,
    updatedAt: new Date().toISOString(),
  };
  riderLocations[location.orderId] = location;
  emitRiderLocation(location);
  res.json({ success: true, data: location });
});
