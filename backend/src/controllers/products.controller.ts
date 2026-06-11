import { Request, Response } from 'express';
import { products } from '../data/demoStore.js';
import { pool } from '../config/db.js';

export async function listProducts(req: Request, res: Response) {
  const { category, search, page = '1', limit = '20', sort } = req.query;
  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const start = (pageNumber - 1) * limitNumber;

  if (pool) {
    try {
      // Build basic query
      let queryText = 'SELECT * FROM products WHERE is_active = true';
      const params: any[] = [];
      let paramCount = 1;

      if (category) {
        queryText += ` AND (category_id = $${paramCount} OR $${paramCount} = ANY(tags))`;
        params.push(category);
        paramCount++;
      }

      if (search) {
        queryText += ` AND (LOWER(name) LIKE $${paramCount} OR $${paramCount} = ANY(tags))`;
        params.push(`%${String(search).toLowerCase()}%`);
        paramCount++;
      }

      if (sort === 'price_asc') {
        queryText += ' ORDER BY price ASC';
      } else if (sort === 'price_desc') {
        queryText += ' ORDER BY price DESC';
      } else if (sort === 'rating') {
        // Fallback since rating column is computed
        queryText += ' ORDER BY created_at DESC';
      } else {
        queryText += ' ORDER BY created_at DESC';
      }

      const countResult = await pool.query(queryText, params);
      const total = countResult.rows.length;

      queryText += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
      params.push(limitNumber, start);

      const dbResult = await pool.query(queryText, params);
      if (dbResult.rows.length > 0) {
        // Hydrate discountPercent and images fields to match domain
        const items = dbResult.rows.map(row => ({
          ...row,
          categoryId: row.category_id,
          storeId: row.store_id,
          stockQuantity: row.stock_quantity,
          isActive: row.is_active,
          isFeatured: row.is_featured,
          isFresh: row.is_fresh,
          images: Array.isArray(row.images) ? row.images : JSON.parse(row.images || '[]'),
          discountPercent: row.mrp && row.price ? Math.round(((row.mrp - row.price) / row.mrp) * 100) : 0,
        }));
        return res.json({
          success: true,
          data: {
            items,
            total,
            page: pageNumber,
            hasMore: start + limitNumber < total,
          },
        });
      }
    } catch (err: any) {
      console.warn('[DB Products] Query failed, falling back to mock store:', err.message);
    }
  }

  // Fallback to mock arrays
  let items = products.filter(product => product.isActive);

  if (category) {
    items = items.filter(product => product.categoryId === category || product.tags.includes(String(category)));
  }
  if (search) {
    const needle = String(search).toLowerCase();
    items = items.filter(product =>
      product.name.toLowerCase().includes(needle) ||
      product.tags.some(tag => tag.includes(needle))
    );
  }

  if (sort === 'price_asc') {
    items.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    items.sort((a, b) => b.price - a.price);
  }

  res.json({
    success: true,
    data: {
      items: items.slice(start, start + limitNumber),
      total: items.length,
      page: pageNumber,
      hasMore: start + limitNumber < items.length,
    },
  });
}

export async function getProduct(req: Request, res: Response) {
  const { id } = req.params;

  if (pool) {
    try {
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return res.json({
          success: true,
          data: {
            ...row,
            categoryId: row.category_id,
            storeId: row.store_id,
            stockQuantity: row.stock_quantity,
            isActive: row.is_active,
            isFeatured: row.is_featured,
            isFresh: row.is_fresh,
            images: Array.isArray(row.images) ? row.images : JSON.parse(row.images || '[]'),
            discountPercent: row.mrp && row.price ? Math.round(((row.mrp - row.price) / row.mrp) * 100) : 0,
          },
        });
      }
    } catch (err: any) {
      console.warn('[DB Products] getProduct failed, falling back to mock:', err.message);
    }
  }

  const product = products.find(item => item.id === id);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
  res.json({ success: true, data: product });
}

export async function featuredProducts(_req: Request, res: Response) {
  if (pool) {
    try {
      const result = await pool.query('SELECT * FROM products WHERE is_featured = true AND is_active = true');
      if (result.rows.length > 0) {
        const data = result.rows.map(row => ({
          ...row,
          categoryId: row.category_id,
          storeId: row.store_id,
          images: Array.isArray(row.images) ? row.images : JSON.parse(row.images || '[]'),
        }));
        return res.json({ success: true, data });
      }
    } catch (err: any) {
      console.warn('[DB Featured] failed, falling back to mock:', err.message);
    }
  }
  res.json({ success: true, data: products.filter(product => product.isFeatured) });
}

export async function flashSaleProducts(_req: Request, res: Response) {
  if (pool) {
    try {
      const result = await pool.query('SELECT * FROM products WHERE mrp > price AND is_active = true');
      if (result.rows.length > 0) {
        const data = result.rows.map(row => ({
          ...row,
          categoryId: row.category_id,
          storeId: row.store_id,
          images: Array.isArray(row.images) ? row.images : JSON.parse(row.images || '[]'),
          discountPercent: Math.round(((row.mrp - row.price) / row.mrp) * 100),
        })).filter(p => p.discountPercent >= 15);
        return res.json({ success: true, data });
      }
    } catch (err: any) {
      console.warn('[DB Flash] failed, falling back to mock:', err.message);
    }
  }
  res.json({ success: true, data: products.filter(product => (product.discountPercent ?? 0) >= 15) });
}

export async function trendingProducts(_req: Request, res: Response) {
  if (pool) {
    try {
      const result = await pool.query('SELECT * FROM products WHERE is_active = true LIMIT 10');
      if (result.rows.length > 0) {
        const data = result.rows.map(row => ({
          ...row,
          categoryId: row.category_id,
          storeId: row.store_id,
          images: Array.isArray(row.images) ? row.images : JSON.parse(row.images || '[]'),
          discountPercent: row.mrp && row.price ? Math.round(((row.mrp - row.price) / row.mrp) * 100) : 0,
        }));
        return res.json({ success: true, data });
      }
    } catch (err: any) {
      console.warn('[DB Trending] failed, falling back to mock:', err.message);
    }
  }
  res.json({ success: true, data: products.slice().sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0)) });
}

export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params;
  const { price, mrp, stockQuantity, isActive, name } = req.body;

  if (pool) {
    try {
      const result = await pool.query(
        `UPDATE products
         SET price = COALESCE($1, price),
             mrp = COALESCE($2, mrp),
             stock_quantity = COALESCE($3, stock_quantity),
             is_active = COALESCE($4, is_active),
             name = COALESCE($5, name),
             updated_at = NOW()
         WHERE id = $6
         RETURNING *`,
        [
          price !== undefined ? Number(price) : null,
          mrp !== undefined ? Number(mrp) : null,
          stockQuantity !== undefined ? Number(stockQuantity) : null,
          isActive !== undefined ? Boolean(isActive) : null,
          name !== undefined ? name : null,
          id
        ]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }

      const row = result.rows[0];
      return res.json({
        success: true,
        data: {
          ...row,
          categoryId: row.category_id,
          storeId: row.store_id,
          stockQuantity: row.stock_quantity,
          isActive: row.is_active,
          isFeatured: row.is_featured,
          isFresh: row.is_fresh,
          images: Array.isArray(row.images) ? row.images : JSON.parse(row.images || '[]'),
          discountPercent: row.mrp && row.price ? Math.round(((row.mrp - row.price) / row.mrp) * 100) : 0,
        }
      });
    } catch (err: any) {
      console.warn('[DB Products] updateProduct failed, using mock:', err.message);
    }
  }

  // Fallback mock update
  const idx = products.findIndex(p => p.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'Product not found' });
  }

  if (price !== undefined) products[idx].price = Number(price);
  if (mrp !== undefined) products[idx].mrp = Number(mrp);
  if (stockQuantity !== undefined) products[idx].stockQuantity = Number(stockQuantity);
  if (isActive !== undefined) products[idx].isActive = Boolean(isActive);
  if (name !== undefined) products[idx].name = name;

  res.json({
    success: true,
    data: products[idx]
  });
}

