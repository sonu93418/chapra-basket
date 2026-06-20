import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { demoAddress } from '../data/demoStore.js';
import { Address } from '../types/domain.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mockDbPath = path.resolve(__dirname, '../data/addresses_db.json');

function getUserId(req: Request): string {
  return req.user?.id || 'user-1';
}

function mapRowToAddress(row: any): Address {
  return {
    id: row.id,
    userId: row.user_id,
    fullName: row.full_name,
    phoneNumber: row.phone_number,
    addressLine1: row.address_line_1,
    addressLine2: row.address_line_2 || undefined,
    landmark: row.landmark || undefined,
    city: row.city,
    state: row.state,
    postalCode: row.postal_code,
    country: row.country,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    isDefault: row.is_default,
  };
}

async function readMockDb(): Promise<Address[]> {
  try {
    const data = await fs.readFile(mockDbPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [
      {
        id: 'addr-1',
        userId: 'user-1',
        fullName: 'Sonu Kumar',
        phoneNumber: '9876543210',
        addressLine1: 'Plot 12, Sadar Bazaar',
        addressLine2: 'near SBI Bank',
        landmark: 'Near SBI Bank',
        city: 'Chapra',
        state: 'Bihar',
        postalCode: '841301',
        country: 'India',
        latitude: 25.774,
        longitude: 84.7374,
        isDefault: true,
      }
    ];
  }
}

async function writeMockDb(data: Address[]): Promise<void> {
  await fs.mkdir(path.dirname(mockDbPath), { recursive: true });
  await fs.writeFile(mockDbPath, JSON.stringify(data, null, 2), 'utf8');
}

export async function listAddresses(req: Request, res: Response) {
  const userId = getUserId(req);
  if (pool) {
    try {
      const result = await pool.query(
        'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
        [userId]
      );
      const data = result.rows.map(mapRowToAddress);
      return res.json({ success: true, data });
    } catch (err: any) {
      console.warn('[DB Addresses] listAddresses failed, falling back to mock:', err.message);
    }
  }
  const db = await readMockDb();
  const data = db.filter(a => a.userId === userId || a.userId === 'user-1');
  res.json({ success: true, data });
}

export async function createAddress(req: Request, res: Response) {
  const userId = getUserId(req);
  const { fullName, phoneNumber, addressLine1, addressLine2, landmark, city, state, postalCode, country, latitude, longitude, isDefault } = req.body;

  if (!fullName || !phoneNumber || !addressLine1 || !city || !state || !postalCode || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ success: false, error: 'Missing required address fields' });
  }

  if (pool) {
    try {
      if (isDefault) {
        await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
      }

      const result = await pool.query(
        `INSERT INTO addresses (user_id, full_name, phone_number, address_line_1, address_line_2, landmark, city, state, postal_code, country, latitude, longitude, is_default)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [
          userId,
          fullName,
          phoneNumber,
          addressLine1,
          addressLine2 || '',
          landmark || '',
          city,
          state,
          postalCode,
          country || 'India',
          latitude,
          longitude,
          isDefault || false,
        ]
      );
      const row = result.rows[0];
      return res.status(201).json({
        success: true,
        data: mapRowToAddress(row),
      });
    } catch (err: any) {
      console.warn('[DB Addresses] createAddress failed, falling back to mock:', err.message);
    }
  }

  const db = await readMockDb();
  if (isDefault) {
    db.forEach(a => {
      if (a.userId === userId || a.userId === 'user-1') {
        a.isDefault = false;
      }
    });
  }

  const newAddress: Address = {
    id: `addr-${Date.now()}`,
    userId,
    fullName,
    phoneNumber,
    addressLine1,
    addressLine2: addressLine2 || undefined,
    landmark: landmark || undefined,
    city,
    state,
    postalCode,
    country: country || 'India',
    latitude: Number(latitude),
    longitude: Number(longitude),
    isDefault: isDefault || false,
  };

  db.push(newAddress);
  await writeMockDb(db);

  res.status(201).json({
    success: true,
    data: newAddress,
  });
}

export async function updateAddress(req: Request, res: Response) {
  const userId = getUserId(req);
  const { id } = req.params;
  const { fullName, phoneNumber, addressLine1, addressLine2, landmark, city, state, postalCode, country, latitude, longitude, isDefault } = req.body;

  if (pool) {
    try {
      if (isDefault) {
        await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
      }
      const result = await pool.query(
        `UPDATE addresses
         SET full_name = COALESCE($1, full_name),
             phone_number = COALESCE($2, phone_number),
             address_line_1 = COALESCE($3, address_line_1),
             address_line_2 = COALESCE($4, address_line_2),
             landmark = COALESCE($5, landmark),
             city = COALESCE($6, city),
             state = COALESCE($7, state),
             postal_code = COALESCE($8, postal_code),
             country = COALESCE($9, country),
             latitude = COALESCE($10, latitude),
             longitude = COALESCE($11, longitude),
             is_default = COALESCE($12, is_default),
             updated_at = now()
         WHERE id = $13 AND user_id = $14 RETURNING *`,
        [fullName, phoneNumber, addressLine1, addressLine2, landmark, city, state, postalCode, country, latitude, longitude, isDefault, id, userId]
      );
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return res.json({
          success: true,
          data: mapRowToAddress(row),
        });
      }
    } catch (err: any) {
      console.warn('[DB Addresses] updateAddress failed, falling back to mock:', err.message);
    }
  }

  const db = await readMockDb();
  const idx = db.findIndex(a => a.id === id && (a.userId === userId || a.userId === 'user-1'));
  if (idx !== -1) {
    if (isDefault) {
      db.forEach(a => {
        if (a.userId === userId || a.userId === 'user-1') {
          a.isDefault = false;
        }
      });
    }

    const current = db[idx];
    const updated: Address = {
      ...current,
      fullName: fullName !== undefined ? fullName : current.fullName,
      phoneNumber: phoneNumber !== undefined ? phoneNumber : current.phoneNumber,
      addressLine1: addressLine1 !== undefined ? addressLine1 : current.addressLine1,
      addressLine2: addressLine2 !== undefined ? addressLine2 : current.addressLine2,
      landmark: landmark !== undefined ? landmark : current.landmark,
      city: city !== undefined ? city : current.city,
      state: state !== undefined ? state : current.state,
      postalCode: postalCode !== undefined ? postalCode : current.postalCode,
      country: country !== undefined ? country : current.country,
      latitude: latitude !== undefined ? Number(latitude) : current.latitude,
      longitude: longitude !== undefined ? Number(longitude) : current.longitude,
      isDefault: isDefault !== undefined ? isDefault : current.isDefault,
    };

    db[idx] = updated;
    await writeMockDb(db);

    return res.json({
      success: true,
      data: updated,
    });
  }

  res.status(404).json({ success: false, error: 'Address not found' });
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

  const db = await readMockDb();
  const filtered = db.filter(a => !(a.id === id && (a.userId === userId || a.userId === 'user-1')));
  await writeMockDb(filtered);

  res.json({ success: true, data: { id, deleted: true } });
}

export async function getDefaultAddress(req: Request, res: Response) {
  const userId = getUserId(req);

  if (pool) {
    try {
      const result = await pool.query(
        'SELECT * FROM addresses WHERE user_id = $1 AND is_default = true LIMIT 1',
        [userId]
      );
      if (result.rows.length > 0) {
        return res.json({ success: true, data: mapRowToAddress(result.rows[0]) });
      }
      const allRes = await pool.query(
        'SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      if (allRes.rows.length > 0) {
        return res.json({ success: true, data: mapRowToAddress(allRes.rows[0]) });
      }
    } catch (err: any) {
      console.warn('[DB Addresses] getDefaultAddress failed, falling back to mock:', err.message);
    }
  }

  const db = await readMockDb();
  const userAddresses = db.filter(a => a.userId === userId || a.userId === 'user-1');
  const def = userAddresses.find(a => a.isDefault) || userAddresses[0] || null;

  if (def) {
    return res.json({ success: true, data: def });
  }
  res.status(404).json({ success: false, error: 'No addresses found' });
}

export async function setDefaultAddress(req: Request, res: Response) {
  const userId = getUserId(req);
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Address ID is required' });
  }

  if (pool) {
    try {
      await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
      const result = await pool.query(
        'UPDATE addresses SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING *',
        [id, userId]
      );
      if (result.rows.length > 0) {
        return res.json({ success: true, data: mapRowToAddress(result.rows[0]) });
      }
    } catch (err: any) {
      console.warn('[DB Addresses] setDefaultAddress failed, falling back to mock:', err.message);
    }
  }

  const db = await readMockDb();
  let updatedAddress: Address | null = null;
  db.forEach(a => {
    if (a.userId === userId || a.userId === 'user-1') {
      if (a.id === id) {
        a.isDefault = true;
        updatedAddress = a;
      } else {
        a.isDefault = false;
      }
    }
  });

  if (updatedAddress) {
    await writeMockDb(db);
    return res.json({ success: true, data: updatedAddress });
  }

  res.status(404).json({ success: false, error: 'Address not found' });
}
