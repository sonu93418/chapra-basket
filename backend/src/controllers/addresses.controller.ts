import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { demoAddress } from '../data/demoStore.js';

function getUserId(req: Request): string {
  // If user is authenticated via JWT middleware
  return req.user?.id || 'user-1';
}

export async function listAddresses(req: Request, res: Response) {
  const userId = getUserId(req);
  if (pool) {
    try {
      const result = await pool.query(
        'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
        [userId]
      );
      if (result.rows.length > 0) {
        const data = result.rows.map(row => ({
          id: row.id,
          label: row.label,
          fullAddress: row.full_address,
          landmark: row.landmark,
          lat: Number(row.lat),
          lng: Number(row.lng),
          city: row.city,
          state: row.state,
          pincode: row.pincode,
          isDefault: row.is_default,
        }));
        return res.json({ success: true, data });
      }
    } catch (err: any) {
      console.warn('[DB Addresses] listAddresses failed, falling back to mock:', err.message);
    }
  }
  res.json({ success: true, data: [demoAddress] });
}

export async function createAddress(req: Request, res: Response) {
  const userId = getUserId(req);
  const { label, fullAddress, landmark, lat, lng, city, state, pincode, isDefault } = req.body;

  if (pool) {
    try {
      // If setting this one as default, unset others first
      if (isDefault) {
        await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
      }

      const result = await pool.query(
        `INSERT INTO addresses (user_id, label, full_address, landmark, lat, lng, city, state, pincode, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          userId,
          label || 'Home',
          fullAddress,
          landmark || '',
          lat || 25.774,
          lng || 84.7374,
          city || 'Chapra',
          state || 'Bihar',
          pincode || '841301',
          isDefault || false,
        ]
      );
      const row = result.rows[0];
      return res.status(201).json({
        success: true,
        data: {
          id: row.id,
          label: row.label,
          fullAddress: row.full_address,
          landmark: row.landmark,
          lat: Number(row.lat),
          lng: Number(row.lng),
          city: row.city,
          state: row.state,
          pincode: row.pincode,
          isDefault: row.is_default,
        },
      });
    } catch (err: any) {
      console.warn('[DB Addresses] createAddress failed, falling back to mock:', err.message);
    }
  }

  res.status(201).json({
    success: true,
    data: {
      id: `addr-${Date.now()}`,
      label: label || 'Home',
      fullAddress,
      landmark,
      lat: lat || 25.774,
      lng: lng || 84.7374,
      city: city || 'Chapra',
      state: state || 'Bihar',
      pincode: pincode || '841301',
      isDefault: isDefault || false,
    },
  });
}

export async function updateAddress(req: Request, res: Response) {
  const userId = getUserId(req);
  const { id } = req.params;
  const { label, fullAddress, landmark, lat, lng, city, state, pincode, isDefault } = req.body;

  if (pool) {
    try {
      if (isDefault) {
        await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
      }
      const result = await pool.query(
        `UPDATE addresses
         SET label = COALESCE($1, label),
             full_address = COALESCE($2, full_address),
             landmark = COALESCE($3, landmark),
             lat = COALESCE($4, lat),
             lng = COALESCE($5, lng),
             city = COALESCE($6, city),
             state = COALESCE($7, state),
             pincode = COALESCE($8, pincode),
             is_default = COALESCE($9, is_default)
         WHERE id = $10 AND user_id = $11 RETURNING *`,
        [label, fullAddress, landmark, lat, lng, city, state, pincode, isDefault, id, userId]
      );
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return res.json({
          success: true,
          data: {
            id: row.id,
            label: row.label,
            fullAddress: row.full_address,
            landmark: row.landmark,
            lat: Number(row.lat),
            lng: Number(row.lng),
            city: row.city,
            state: row.state,
            pincode: row.pincode,
            isDefault: row.is_default,
          },
        });
      }
    } catch (err: any) {
      console.warn('[DB Addresses] updateAddress failed, falling back to mock:', err.message);
    }
  }

  res.json({
    success: true,
    data: {
      id,
      label,
      fullAddress,
      landmark,
      lat,
      lng,
      city,
      state,
      pincode,
      isDefault,
    },
  });
}

export async function deleteAddress(req: Request, res: Response) {
  const userId = getUserId(req);
  const { id } = req.params;

  if (pool) {
    try {
      await pool.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [id, userId]);
      return res.json({ success: true, data: { id, deleted: true } });
    } catch (err: any) {
      console.warn('[DB Addresses] deleteAddress failed, falling back to mock:', err.message);
    }
  }

  res.json({ success: true, data: { id, deleted: true } });
}
