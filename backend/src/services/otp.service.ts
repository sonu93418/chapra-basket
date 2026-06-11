import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { pool } from '../config/db.js';
import { UserRole } from '../types/domain.js';

const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>();

export function sendOtp(phone: string) {
  const code = env.otpProvider === 'mock' ? '123456' : String(Math.floor(100000 + Math.random() * 900000));
  otpStore.set(phone, { code, expiresAt: Date.now() + 5 * 60 * 1000, attempts: 0 });
  return { phone, expiresInSeconds: 300, devOtp: env.nodeEnv === 'production' ? undefined : code };
}

export async function verifyOtp(phone: string, code: string, role: UserRole = 'customer') {
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

  let user: any = null;

  if (pool) {
    // 1. Fetch or create user in Postgres
    const existing = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
    if (existing.rows.length > 0) {
      user = {
        id: existing.rows[0].id,
        phone: existing.rows[0].phone,
        name: existing.rows[0].name || 'User',
        role: existing.rows[0].role,
        referralCode: existing.rows[0].referral_code,
        createdAt: existing.rows[0].created_at,
      };
    } else {
      const referralCode = `CB${phone.slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
      const newUser = await pool.query(
        'INSERT INTO users (phone, name, role, referral_code) VALUES ($1, $2, $3, $4) RETURNING *',
        [phone, `User ${phone.slice(-4)}`, role, referralCode]
      );
      user = {
        id: newUser.rows[0].id,
        phone: newUser.rows[0].phone,
        name: newUser.rows[0].name,
        role: newUser.rows[0].role,
        referralCode: newUser.rows[0].referral_code,
        createdAt: newUser.rows[0].created_at,
      };

      // 2. Initialize Wallet
      await pool.query('INSERT INTO wallets (user_id, balance) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user.id, 0]);
    }
  } else {
    // Fallback to mock logic
    user = {
      id: `user-${phone.slice(-6)}`,
      phone,
      role,
      referralCode: `CB${phone.slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
  }

  const token = jwt.sign(user, env.jwtSecret, { expiresIn: '15d' });
  return { user, token };
}
