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
    latitude: row.latitude !== null && row.latitude !== undefined ? Number(row.latitude) : undefined,
    longitude: row.longitude !== null && row.longitude !== undefined ? Number(row.longitude) : undefined,
    isDefault: row.is_default,
    addressType: row.address_type || 'Home',
    deliveryInstructions: row.delivery_instructions || undefined,
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
  console.log('[API Addresses] listAddresses: user_id =', userId);
  if (pool) {
    try {
      const result = await pool.query(
        'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
        [userId]
      );
      const data = result.rows.map(mapRowToAddress);
      console.log(`[API Addresses] listAddresses success: fetched ${data.length} addresses from DB`);
      return res.json({ success: true, data });
    } catch (err: any) {
      console.warn('[DB Addresses] listAddresses failed, falling back to mock:', err.message);
    }
  }
  const db = await readMockDb();
  const data = db.filter(a => a.userId === userId || a.userId === 'user-1');
  console.log(`[API Addresses] listAddresses success: fetched ${data.length} addresses from mock JSON DB`);
  res.json({ success: true, data });
}

export async function createAddress(req: Request, res: Response) {
  const userId = getUserId(req);
  const { 
    fullName, 
    phoneNumber, 
    addressLine1, 
    addressLine2, 
    landmark, 
    city, 
    state, 
    postalCode, 
    country, 
    latitude, 
    longitude, 
    isDefault,
    addressType,
    deliveryInstructions
  } = req.body;

  console.log('[API Addresses] createAddress: user_id =', userId, 'payload =', req.body);

  if (!fullName || !phoneNumber || !addressLine1 || !city || !state || !postalCode) {
    return res.status(400).json({ success: false, error: 'Missing required address fields' });
  }

  if (pool) {
    try {
      // Determine default status
      const countRes = await pool.query('SELECT COUNT(*) as count FROM addresses WHERE user_id = $1', [userId]);
      const hasAddresses = parseInt(countRes.rows[0]?.count || '0', 10) > 0;
      const makeDefault = isDefault || !hasAddresses;

      if (makeDefault) {
        await pool.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
      }

      const result = await pool.query(
        `INSERT INTO addresses (user_id, full_name, phone_number, address_line_1, address_line_2, landmark, city, state, postal_code, country, latitude, longitude, is_default, address_type, delivery_instructions)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
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
          latitude !== undefined && latitude !== null ? Number(latitude) : null,
          longitude !== undefined && longitude !== null ? Number(longitude) : null,
          makeDefault,
          addressType || 'Home',
          deliveryInstructions || '',
        ]
      );
      const row = result.rows[0];
      const savedAddress = mapRowToAddress(row);
      console.log('[API Addresses] createAddress success: saved to DB:', savedAddress.id);
      return res.status(201).json({
        success: true,
        data: savedAddress,
      });
    } catch (err: any) {
      console.warn('[DB Addresses] createAddress failed, falling back to mock:', err.message);
    }
  }

  const db = await readMockDb();
  const userAddresses = db.filter(a => a.userId === userId);
  const makeDefault = isDefault || userAddresses.length === 0;

  if (makeDefault) {
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
    latitude: latitude !== undefined && latitude !== null ? Number(latitude) : undefined,
    longitude: longitude !== undefined && longitude !== null ? Number(longitude) : undefined,
    isDefault: makeDefault,
    addressType: addressType || 'Home',
    deliveryInstructions: deliveryInstructions || undefined,
  };

  db.push(newAddress);
  await writeMockDb(db);

  console.log('[API Addresses] createAddress success: saved to mock JSON DB:', newAddress.id);
  res.status(201).json({
    success: true,
    data: newAddress,
  });
}

export async function updateAddress(req: Request, res: Response) {
  const userId = getUserId(req);
  const { id } = req.params;
  const { 
    fullName, 
    phoneNumber, 
    addressLine1, 
    addressLine2, 
    landmark, 
    city, 
    state, 
    postalCode, 
    country, 
    latitude, 
    longitude, 
    isDefault,
    addressType,
    deliveryInstructions
  } = req.body;

  console.log('[API Addresses] updateAddress: id =', id, 'user_id =', userId, 'payload =', req.body);

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
             address_type = COALESCE($13, address_type),
             delivery_instructions = COALESCE($14, delivery_instructions),
             updated_at = now()
         WHERE id = $15 AND user_id = $16 RETURNING *`,
        [
          fullName, 
          phoneNumber, 
          addressLine1, 
          addressLine2, 
          landmark, 
          city, 
          state, 
          postalCode, 
          country, 
          latitude !== undefined && latitude !== null ? Number(latitude) : null, 
          longitude !== undefined && longitude !== null ? Number(longitude) : null, 
          isDefault,
          addressType,
          deliveryInstructions,
          id, 
          userId
        ]
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
      latitude: latitude !== undefined && latitude !== null ? Number(latitude) : current.latitude,
      longitude: longitude !== undefined && longitude !== null ? Number(longitude) : current.longitude,
      isDefault: isDefault !== undefined ? isDefault : current.isDefault,
      addressType: addressType !== undefined ? addressType : current.addressType,
      deliveryInstructions: deliveryInstructions !== undefined ? deliveryInstructions : current.deliveryInstructions,
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
  console.log('[API Addresses] deleteAddress: id =', id, 'user_id =', userId);

  if (pool) {
    try {
      const checkRes = await pool.query('SELECT is_default FROM addresses WHERE id = $1 AND user_id = $2', [id, userId]);
      const wasDefault = checkRes.rows[0]?.is_default;

      await pool.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [id, userId]);
      console.log('[API Addresses] deleteAddress from DB completed');

      if (wasDefault) {
        await pool.query(
          `UPDATE addresses SET is_default = true WHERE id = (
             SELECT id FROM addresses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1
           )`,
          [userId]
        );
        console.log('[API Addresses] fallback default address updated in DB');
      }
      return res.json({ success: true, data: { id, deleted: true } });
    } catch (err: any) {
      console.warn('[DB Addresses] deleteAddress failed, falling back to mock:', err.message);
    }
  }

  const db = await readMockDb();
  const deletedAddr = db.find(a => a.id === id && (a.userId === userId || a.userId === 'user-1'));
  const filtered = db.filter(a => !(a.id === id && (a.userId === userId || a.userId === 'user-1')));
  if (deletedAddr?.isDefault && filtered.length > 0) {
    const userAddresses = filtered.filter(a => a.userId === userId);
    if (userAddresses.length > 0) {
      userAddresses[0].isDefault = true;
    } else {
      const mockAddresses = filtered.filter(a => a.userId === 'user-1');
      if (mockAddresses.length > 0) {
        mockAddresses[0].isDefault = true;
      }
    }
  }
  await writeMockDb(filtered);
  console.log('[API Addresses] deleteAddress from mock JSON DB completed');

  res.json({ success: true, data: { id, deleted: true } });
}

export async function getDefaultAddress(req: Request, res: Response) {
  const userId = getUserId(req);
  console.log('[API Addresses] getDefaultAddress: user_id =', userId);

  if (pool) {
    try {
      const result = await pool.query(
        'SELECT * FROM addresses WHERE user_id = $1 AND is_default = true LIMIT 1',
        [userId]
      );
      if (result.rows.length > 0) {
        const addr = mapRowToAddress(result.rows[0]);
        console.log('[API Addresses] getDefaultAddress success (DB default):', addr.id);
        return res.json({ success: true, data: addr });
      }
      const allRes = await pool.query(
        'SELECT * FROM addresses WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [userId]
      );
      if (allRes.rows.length > 0) {
        const addr = mapRowToAddress(allRes.rows[0]);
        console.log('[API Addresses] getDefaultAddress success (DB fallback):', addr.id);
        return res.json({ success: true, data: addr });
      }
    } catch (err: any) {
      console.warn('[DB Addresses] getDefaultAddress failed, falling back to mock:', err.message);
    }
  }

  const db = await readMockDb();
  const userAddresses = db.filter(a => a.userId === userId || a.userId === 'user-1');
  const def = userAddresses.find(a => a.isDefault) || userAddresses[0] || null;

  if (def) {
    console.log('[API Addresses] getDefaultAddress success (mock):', def.id);
    return res.json({ success: true, data: def });
  }
  console.log('[API Addresses] getDefaultAddress error: no addresses found for user');
  res.status(404).json({ success: false, error: 'No addresses found' });
}

export async function setDefaultAddress(req: Request, res: Response) {
  const userId = getUserId(req);
  const id = req.body.id || req.params.id;

  console.log('[API Addresses] setDefaultAddress: id =', id, 'user_id =', userId);

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
