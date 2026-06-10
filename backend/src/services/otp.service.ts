import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UserRole } from '../types/domain.js';

const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

export function sendOtp(phone: string) {
  const code = env.otpProvider === 'mock' ? '123456' : String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000, attempts: 0 });
  return { phone, expiresInSeconds: 300, devOtp: env.nodeEnv === 'production' ? undefined : code };
}

export function verifyOtp(phone: string, code: string, role: UserRole = 'customer') {
  const record = otpStore.get(phone);
  if (!record || record.expiresAt < Date.now()) {
    throw new Error('OTP expired. Please request a new OTP.');
  }
  if (record.attempts >= 5) {
    throw new Error('Too many attempts. Please request a new OTP.');
  }
  record.attempts += 1;
  if (record.code !== code) throw new Error('Invalid OTP');

  otpStore.delete(phone);
  const user = {
    id: `user-${phone.slice(-6)}`,
    phone,
    role,
    referralCode: `CB${phone.slice(-4)}`,
    createdAt: new Date().toISOString(),
  };
  const token = jwt.sign(user, env.jwtSecret, { expiresIn: '15d' });
  return { user, token };
}
