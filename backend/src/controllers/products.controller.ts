import { Request, Response } from 'express';
import { products } from '../data/demoStore.js';

export function listProducts(req: Request, res: Response) {
  const { category, search, page = '1', limit = '20' } = req.query;
  let items = products.filter(product => product.isActive);

  if (category) items = items.filter(product => product.categoryId === category || product.tags.includes(String(category)));
  if (search) {
    const needle = String(search).toLowerCase();
    items = items.filter(product =>
      product.name.toLowerCase().includes(needle) ||
      product.tags.some(tag => tag.includes(needle))
    );
  }

  const pageNumber = Number(page);
  const limitNumber = Number(limit);
  const start = (pageNumber - 1) * limitNumber;

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

export function getProduct(req: Request, res: Response) {
  const product = products.find(item => item.id === req.params.id);
  if (!product) return res.status(404).json({ success: false, error: 'Product not found' });
  res.json({ success: true, data: product });
}

export function featuredProducts(_req: Request, res: Response) {
  res.json({ success: true, data: products.filter(product => product.isFeatured) });
}

export function flashSaleProducts(_req: Request, res: Response) {
  res.json({ success: true, data: products.filter(product => (product.discountPercent ?? 0) >= 15) });
}

export function trendingProducts(_req: Request, res: Response) {
  res.json({ success: true, data: products.slice().sort((a, b) => (b.discountPercent ?? 0) - (a.discountPercent ?? 0)) });
}
