import { Request, Response } from 'express';
import { z } from 'zod';
import { sendOtp, verifyOtp, refreshSession, logoutSession } from '../services/otp.service.js';

export const sendOtpSchema = z.object({
  phone: z.string().min(10),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(10),
  code: z.string().length(6),
  role: z.enum(['customer', 'rider', 'store_owner', 'admin']).default('customer'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutSchema = z.object({
  refreshToken: z.string().min(1),
});

export async function sendOtpController(req: Request, res: Response) {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress || undefined;
    const deviceInfo = req.headers['user-agent'] || undefined;
    const data = await sendOtp(req.body.phone, ipAddress, deviceInfo);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function verifyOtpController(req: Request, res: Response) {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress || undefined;
    const deviceInfo = req.headers['user-agent'] || undefined;
    const data = await verifyOtp(req.body.phone, req.body.code, req.body.role, ipAddress, deviceInfo);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function refreshController(req: Request, res: Response) {
  try {
    const ipAddress = req.ip || req.socket.remoteAddress || undefined;
    const deviceInfo = req.headers['user-agent'] || undefined;
    const data = await refreshSession(req.body.refreshToken, ipAddress, deviceInfo);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message });
  }
}

export async function logoutController(req: Request, res: Response) {
  try {
    await logoutSession(req.body.refreshToken);
    res.json({ success: true, data: { loggedOut: true } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
}
