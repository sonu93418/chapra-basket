import { Request, Response } from 'express';
import { pool } from '../config/db.js';

function getUserId(req: Request): string {
  return req.user?.id || 'user-1';
}

export async function getProfile(req: Request, res: Response) {
  const userId = getUserId(req);

  if (pool) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return res.json({
          success: true,
          data: {
            id: row.id,
            phone: row.phone,
            name: row.name,
            email: row.email,
            avatarUrl: row.avatar_url,
            role: row.role,
            referralCode: row.referral_code,
            createdAt: row.created_at,
          },
        });
      }
    } catch (err: any) {
      console.warn('[DB User] getProfile failed, using mock:', err.message);
    }
  }

  // Fallback mock
  res.json({
    success: true,
    data: {
      id: userId,
      phone: '+919876543210',
      name: 'Anup Kumar',
      email: 'anup.kumar@example.com',
      avatarUrl: null,
      role: 'customer',
      referralCode: 'ANUP2024',
      createdAt: new Date().toISOString(),
    },
  });
}

export async function updateProfile(req: Request, res: Response) {
  const userId = getUserId(req);
  const { name, email, avatarUrl } = req.body;

  if (pool) {
    try {
      const result = await pool.query(
        `UPDATE users
         SET name = COALESCE($1, name),
             email = COALESCE($2, email),
             avatar_url = COALESCE($3, avatar_url),
             updated_at = NOW()
         WHERE id = $4 RETURNING *`,
        [name, email, avatarUrl, userId]
      );
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return res.json({
          success: true,
          data: {
            id: row.id,
            phone: row.phone,
            name: row.name,
            email: row.email,
            avatarUrl: row.avatar_url,
            role: row.role,
            referralCode: row.referral_code,
            createdAt: row.created_at,
          },
        });
      }
    } catch (err: any) {
      console.warn('[DB User] updateProfile failed, using mock:', err.message);
    }
  }

  // Fallback mock
  res.json({
    success: true,
    data: {
      id: userId,
      phone: '+919876543210',
      name: name || 'Anup Kumar',
      email: email || 'anup.kumar@example.com',
      avatarUrl: avatarUrl || null,
      role: 'customer',
      referralCode: 'ANUP2024',
      createdAt: new Date().toISOString(),
    },
  });
}
