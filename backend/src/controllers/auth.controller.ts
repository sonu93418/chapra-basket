import { Request, Response } from 'express';
import { z } from 'zod';
import { sendOtp, verifyOtp } from '../services/otp.service.js';

export const sendOtpSchema = z.object({
  phone: z.string().min(10),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(10),
  code: z.string().length(6),
  role: z.enum(['customer', 'rider', 'store_owner', 'admin']).default('customer'),
});

export function sendOtpController(req: Request, res: Response) {
  res.json({ success: true, data: sendOtp(req.body.phone) });
}

export async function verifyOtpController(req: Request, res: Response) {
  try {
    const data = await verifyOtp(req.body.phone, req.body.code, req.body.role);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export function refreshController(_req: Request, res: Response) {
  res.json({ success: true, data: { refreshed: true } });
}

export function logoutController(_req: Request, res: Response) {
  res.json({ success: true, data: { loggedOut: true } });
}
