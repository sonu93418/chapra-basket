import { Request, Response } from 'express';
import { pool } from '../config/db.js';
import { Banner } from '../types/domain.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mockDbPath = path.resolve(__dirname, '../data/banners_db.json');

function mapRowToBanner(row: any): Banner {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || undefined,
    imageUrl: row.image_url,
    ctaText: row.cta_text || undefined,
    clickDestination: row.click_destination || undefined,
    isActive: row.is_active,
    sortOrder: Number(row.sort_order),
    startDate: row.start_date ? new Date(row.start_date).toISOString() : null,
    endDate: row.end_date ? new Date(row.end_date).toISOString() : null,
    campaignType: row.campaign_type || undefined,
    clicks: Number(row.clicks || 0),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : undefined,
  };
}

async function readMockDb(): Promise<Banner[]> {
  try {
    const data = await fs.readFile(mockDbPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeMockDb(data: Banner[]): Promise<void> {
  await fs.mkdir(path.dirname(mockDbPath), { recursive: true });
  await fs.writeFile(mockDbPath, JSON.stringify(data, null, 2), 'utf8');
}

export async function listActiveBanners(req: Request, res: Response) {
  const now = new Date();
  if (pool) {
    try {
      const result = await pool.query(
        `SELECT * FROM banners 
         WHERE is_active = true 
           AND (start_date IS NULL OR start_date <= $1)
           AND (end_date IS NULL OR end_date >= $1)
         ORDER BY sort_order ASC, created_at DESC`,
        [now]
      );
      const data = result.rows.map(mapRowToBanner);
      return res.json({ success: true, data });
    } catch (err: any) {
      console.warn('[DB Banners] listActiveBanners failed, falling back to mock:', err.message);
    }
  }

  const db = await readMockDb();
  const data = db.filter(b => {
    if (!b.isActive) return false;
    if (b.startDate && new Date(b.startDate) > now) return false;
    if (b.endDate && new Date(b.endDate) < now) return false;
    return true;
  });
  data.sort((a, b) => a.sortOrder - b.sortOrder);
  res.json({ success: true, data });
}

export async function listAllBanners(req: Request, res: Response) {
  if (pool) {
    try {
      const result = await pool.query(
        'SELECT * FROM banners ORDER BY sort_order ASC, created_at DESC'
      );
      const data = result.rows.map(mapRowToBanner);
      return res.json({ success: true, data });
    } catch (err: any) {
      console.warn('[DB Banners] listAllBanners failed, falling back to mock:', err.message);
    }
  }

  const db = await readMockDb();
  db.sort((a, b) => a.sortOrder - b.sortOrder);
  res.json({ success: true, data: db });
}

export async function createBanner(req: Request, res: Response) {
  const { title, subtitle, imageUrl, ctaText, clickDestination, startDate, endDate, campaignType, isActive, sortOrder } = req.body;

  if (!title || !imageUrl) {
    return res.status(400).json({ success: false, error: 'Title and imageUrl are required fields' });
  }

  const newIsActive = isActive !== undefined ? isActive : true;
  const newSortOrder = sortOrder !== undefined ? Number(sortOrder) : 0;

  if (pool) {
    try {
      const result = await pool.query(
        `INSERT INTO banners (title, subtitle, image_url, cta_text, click_destination, start_date, end_date, campaign_type, is_active, sort_order)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          title,
          subtitle || null,
          imageUrl,
          ctaText || null,
          clickDestination || null,
          startDate ? new Date(startDate) : null,
          endDate ? new Date(endDate) : null,
          campaignType || null,
          newIsActive,
          newSortOrder,
        ]
      );
      return res.status(201).json({
        success: true,
        data: mapRowToBanner(result.rows[0]),
      });
    } catch (err: any) {
      console.warn('[DB Banners] createBanner failed, falling back to mock:', err.message);
    }
  }

  const db = await readMockDb();
  const newBanner: Banner = {
    id: `banner-${Date.now()}`,
    title,
    subtitle: subtitle || undefined,
    imageUrl,
    ctaText: ctaText || undefined,
    clickDestination: clickDestination || undefined,
    isActive: newIsActive,
    sortOrder: newSortOrder,
    startDate: startDate || null,
    endDate: endDate || null,
    campaignType: campaignType || undefined,
    clicks: 0,
    createdAt: new Date().toISOString(),
  };

  db.push(newBanner);
  await writeMockDb(db);

  res.status(201).json({
    success: true,
    data: newBanner,
  });
}

export async function updateBanner(req: Request, res: Response) {
  const { id } = req.params;
  const { title, subtitle, imageUrl, ctaText, clickDestination, startDate, endDate, campaignType, isActive, sortOrder } = req.body;

  if (pool) {
    try {
      const result = await pool.query(
        `UPDATE banners
         SET title = COALESCE($1, title),
             subtitle = COALESCE($2, subtitle),
             image_url = COALESCE($3, image_url),
             cta_text = COALESCE($4, cta_text),
             click_destination = COALESCE($5, click_destination),
             start_date = COALESCE($6, start_date),
             end_date = COALESCE($7, end_date),
             campaign_type = COALESCE($8, campaign_type),
             is_active = COALESCE($9, is_active),
             sort_order = COALESCE($10, sort_order),
             updated_at = now()
         WHERE id = $11 RETURNING *`,
        [
          title !== undefined ? title : null,
          subtitle !== undefined ? subtitle : null,
          imageUrl !== undefined ? imageUrl : null,
          ctaText !== undefined ? ctaText : null,
          clickDestination !== undefined ? clickDestination : null,
          startDate !== undefined ? (startDate ? new Date(startDate) : null) : null,
          endDate !== undefined ? (endDate ? new Date(endDate) : null) : null,
          campaignType !== undefined ? campaignType : null,
          isActive !== undefined ? isActive : null,
          sortOrder !== undefined ? Number(sortOrder) : null,
          id,
        ]
      );
      if (result.rows.length > 0) {
        return res.json({
          success: true,
          data: mapRowToBanner(result.rows[0]),
        });
      }
    } catch (err: any) {
      console.warn('[DB Banners] updateBanner failed, falling back to mock:', err.message);
    }
  }

  const db = await readMockDb();
  const idx = db.findIndex(b => b.id === id);
  if (idx !== -1) {
    const current = db[idx];
    const updated: Banner = {
      ...current,
      title: title !== undefined ? title : current.title,
      subtitle: subtitle !== undefined ? subtitle : current.subtitle,
      imageUrl: imageUrl !== undefined ? imageUrl : current.imageUrl,
      ctaText: ctaText !== undefined ? ctaText : current.ctaText,
      clickDestination: clickDestination !== undefined ? clickDestination : current.clickDestination,
      isActive: isActive !== undefined ? isActive : current.isActive,
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : current.sortOrder,
      startDate: startDate !== undefined ? startDate : current.startDate,
      endDate: endDate !== undefined ? endDate : current.endDate,
      campaignType: campaignType !== undefined ? campaignType : current.campaignType,
      updatedAt: new Date().toISOString(),
    };
    db[idx] = updated;
    await writeMockDb(db);
    return res.json({ success: true, data: updated });
  }

  res.status(404).json({ success: false, error: 'Banner not found' });
}

export async function deleteBanner(req: Request, res: Response) {
  const { id } = req.params;

  if (pool) {
    try {
      const result = await pool.query('DELETE FROM banners WHERE id = $1 RETURNING id', [id]);
      if (result.rows.length > 0) {
        return res.json({ success: true, data: { id, deleted: true } });
      }
    } catch (err: any) {
      console.warn('[DB Banners] deleteBanner failed, falling back to mock:', err.message);
    }
  }

  const db = await readMockDb();
  const filtered = db.filter(b => b.id !== id);
  await writeMockDb(filtered);
  res.json({ success: true, data: { id, deleted: true } });
}

export async function reorderBanners(req: Request, res: Response) {
  const { reorders } = req.body; // Array of { id: string, sortOrder: number }

  if (!reorders || !Array.isArray(reorders)) {
    return res.status(400).json({ success: false, error: 'Reorders list is required and must be an array' });
  }

  if (pool) {
    try {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const item of reorders) {
          await client.query('UPDATE banners SET sort_order = $1 WHERE id = $2', [item.sortOrder, item.id]);
        }
        await client.query('COMMIT');
        return res.json({ success: true });
      } catch (err: any) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    } catch (err: any) {
      console.warn('[DB Banners] reorderBanners failed, falling back to mock:', err.message);
    }
  }

  const db = await readMockDb();
  reorders.forEach((item: any) => {
    const banner = db.find(b => b.id === item.id);
    if (banner) {
      banner.sortOrder = Number(item.sortOrder);
    }
  });
  await writeMockDb(db);
  res.json({ success: true });
}

export async function trackClick(req: Request, res: Response) {
  const { id } = req.params;

  if (pool) {
    try {
      const result = await pool.query(
        'UPDATE banners SET clicks = clicks + 1 WHERE id = $1 RETURNING clicks',
        [id]
      );
      if (result.rows.length > 0) {
        return res.json({ success: true, clicks: result.rows[0].clicks });
      }
    } catch (err: any) {
      console.warn('[DB Banners] trackClick failed, falling back to mock:', err.message);
    }
  }

  const db = await readMockDb();
  const banner = db.find(b => b.id === id);
  if (banner) {
    banner.clicks = (banner.clicks || 0) + 1;
    await writeMockDb(db);
    return res.json({ success: true, clicks: banner.clicks });
  }

  res.status(404).json({ success: false, error: 'Banner not found' });
}
