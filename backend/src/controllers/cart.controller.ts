import { Request, Response } from 'express';
import { z } from 'zod';
import { clearCart, getCart, setCartItem } from '../services/cart.service.js';

export const cartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(0),
});

function userId(req: Request) {
  return req.user?.id ?? 'user-1';
}

export function getCartController(req: Request, res: Response) {
  res.json({ success: true, data: getCart(userId(req)) });
}

export function setCartItemController(req: Request, res: Response) {
  res.json({ success: true, data: setCartItem(userId(req), req.body.productId, req.body.quantity) });
}

export function clearCartController(req: Request, res: Response) {
  res.json({ success: true, data: clearCart(userId(req)) });
}

export function validateCartController(req: Request, res: Response) {
  const cart = getCart(userId(req));
  const issues = cart.items
    .filter(item => item.product && item.quantity > item.product.stockQuantity)
    .map(item => ({ productId: item.product?.id, message: 'Not enough stock' }));

  res.json({ success: true, data: { valid: issues.length === 0, issues, cart } });
}
