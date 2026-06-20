import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

export const storesRouter = Router();

let mockStores = [
  { id: 'store-1', name: 'Fresh Bazaar Store', type: 'grocery', etaMinutes: 30, isOpen: true },
  { id: 'store-2', name: 'Sadar Fresh Vegetables', type: 'vegetables', etaMinutes: 25, isOpen: true },
];

storesRouter.get('/', async (_req, res) => {
  if (pool) {
    try {
      const result = await pool.query('SELECT id, owner_id as "ownerId", name, type, phone, address, lat, lng, is_open as "isOpen" FROM stores');
      return res.json({
        success: true,
        data: result.rows,
      });
    } catch (err: any) {
      console.warn('[DB Stores] list failed, using mock:', err.message);
    }
  }

  res.json({ success: true, data: mockStores });
});

storesRouter.get('/:id', async (req, res) => {
  const { id } = req.params;

  if (pool) {
    try {
      const result = await pool.query('SELECT id, owner_id as "ownerId", name, type, phone, address, lat, lng, is_open as "isOpen" FROM stores WHERE id = $1', [id]);
      if (result.rows.length > 0) {
        return res.json({
          success: true,
          data: result.rows[0],
        });
      }
    } catch (err: any) {
      console.warn('[DB Stores] get failed, using mock:', err.message);
    }
  }

  const store = mockStores.find(item => item.id === id);
  if (!store) return res.status(404).json({ success: false, error: 'Store not found' });
  res.json({ success: true, data: store });
});

storesRouter.patch('/:id/status', requireRole(['store_owner', 'admin']), async (req, res) => {
  const { id } = req.params;
  const { isOpen } = req.body;

  if (isOpen === undefined) {
    return res.status(400).json({ success: false, error: 'Missing isOpen parameter' });
  }

  if (pool) {
    try {
      const result = await pool.query(
        `UPDATE stores
         SET is_open = $1
         WHERE id = $2
         RETURNING id, owner_id as "ownerId", name, type, phone, address, lat, lng, is_open as "isOpen"`,
        [Boolean(isOpen), id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Store not found' });
      }

      return res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (err: any) {
      console.warn('[DB Stores] patch status failed, using mock:', err.message);
    }
  }

  const store = mockStores.find(item => item.id === id);
  if (!store) return res.status(404).json({ success: false, error: 'Store not found' });

  store.isOpen = Boolean(isOpen);
  res.json({ success: true, data: store });
});

