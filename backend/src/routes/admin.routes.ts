import { Router } from 'express';
import { pool } from '../config/db.js';
import { requireAuth } from '../middleware/auth.js';

export const adminRouter = Router();

// In-memory mock users list for fallback when database is not connected
let mockUsers = [
  {
    id: 'admin-1',
    phone: '+919999999999',
    name: 'Ops Manager',
    email: 'ops@blinkbox.com',
    role: 'admin',
    referralCode: 'OPS001',
    createdAt: new Date().toISOString()
  },
  {
    id: 'rider-1',
    phone: '+919876543210',
    name: 'Rajan Kumar',
    email: 'rajan@example.com',
    role: 'rider',
    referralCode: 'RIDER001',
    createdAt: new Date().toISOString()
  },
  {
    id: 'rider-2',
    phone: '+919876543211',
    name: 'Sanjay Kumar Singh',
    email: 'sanjay@example.com',
    role: 'rider',
    referralCode: 'RIDER002',
    createdAt: new Date().toISOString()
  },
  {
    id: 'customer-1',
    phone: '+919876543212',
    name: 'Anup Kumar',
    email: 'anup@example.com',
    role: 'customer',
    referralCode: 'ANUP2024',
    createdAt: new Date().toISOString()
  }
];

// Admin analytics endpoint
adminRouter.get('/analytics', requireAuth, async (_req, res) => {
  if (pool) {
    try {
      const ordersRes = await pool.query("SELECT COUNT(*) as count, SUM(total) as revenue FROM orders WHERE created_at::date = CURRENT_DATE");
      const ridersRes = await pool.query("SELECT COUNT(*) as count FROM users WHERE role = 'rider'");
      const lowStockRes = await pool.query("SELECT COUNT(*) as count FROM products WHERE stock_quantity <= 5");

      return res.json({
        success: true,
        data: {
          ordersToday: parseInt(ordersRes.rows[0]?.count || '0', 10),
          revenueToday: parseFloat(ordersRes.rows[0]?.revenue || '0'),
          activeRiders: parseInt(ridersRes.rows[0]?.count || '0', 10),
          lowStockItems: parseInt(lowStockRes.rows[0]?.count || '0', 10),
        },
      });
    } catch (err: any) {
      console.warn('[DB Admin] analytics query failed:', err.message);
    }
  }

  res.json({
    success: true,
    data: {
      ordersToday: 12,
      revenueToday: 8490,
      activeRiders: 2,
      lowStockItems: 3,
    },
  });
});

// Admin list users endpoint
adminRouter.get('/users', requireAuth, async (_req, res) => {
  if (pool) {
    try {
      const result = await pool.query(
        `SELECT id, phone, name, email, avatar_url as "avatarUrl", role, referral_code as "referralCode", created_at as "createdAt"
         FROM users
         ORDER BY role = 'admin' DESC, created_at DESC`
      );
      return res.json({
        success: true,
        data: result.rows,
      });
    } catch (err: any) {
      console.warn('[DB Admin] get users query failed, using mock:', err.message);
    }
  }

  res.json({
    success: true,
    data: mockUsers,
  });
});

// Admin patch user role endpoint
adminRouter.patch('/users/:userId/role', requireAuth, async (req, res) => {
  const { userId } = req.params;
  const { role } = req.body;

  const validRoles = ['customer', 'rider', 'store_owner', 'admin'];
  if (!role || !validRoles.includes(role)) {
    return res.status(400).json({ success: false, error: 'Invalid or missing role role' });
  }

  if (pool) {
    try {
      const result = await pool.query(
        `UPDATE users
         SET role = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, phone, name, email, avatar_url as "avatarUrl", role, referral_code as "referralCode", created_at as "createdAt"`,
        [role, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      return res.json({
        success: true,
        data: result.rows[0],
      });
    } catch (err: any) {
      console.warn('[DB Admin] update user role query failed, using mock:', err.message);
    }
  }

  // Fallback mock update
  const user = mockUsers.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  user.role = role;
  res.json({
    success: true,
    data: user,
  });
});

