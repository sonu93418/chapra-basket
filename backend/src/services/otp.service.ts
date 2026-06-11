import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { pool } from '../config/db.js';
import { UserRole } from '../types/domain.js';
import { sendSmsOtp } from './sms.service.js';

// In-memory fallbacks for offline/mock mode
const otpStore = new Map<string, { hash: string; expiresAt: number; attempts: number; ipAddress?: string; deviceInfo?: string }>();
const mockSessions = new Map<string, { userId: string; expiresAt: number; isActive: boolean }>();
const mockRateLimit = new Map<string, number[]>();

function hashSha256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

// 1. Send OTP
export async function sendOtp(
  phone: string,
  ipAddress?: string,
  deviceInfo?: string
): Promise<{ phone: string; expiresInSeconds: number; devOtp?: string }> {
  const code = env.otpProvider === 'mock' ? '123456' : String(Math.floor(100000 + Math.random() * 900000));
  const otpHash = hashSha256(code);
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 Minutes expiry
  const nowSec = Date.now();

  // Rate Limiting Check (Max 3 OTP requests per 15 minutes)
  if (pool) {
    try {
      const rateLimitRes = await pool.query(
        `SELECT COUNT(*) as count FROM otp_verifications 
         WHERE phone = $1 AND created_at > NOW() - INTERVAL '15 minutes'`,
        [phone]
      );
      const requestCount = parseInt(rateLimitRes.rows[0]?.count || '0', 10);
      if (requestCount >= 3) {
        throw new Error('Too many requests. Please wait before requesting another OTP.');
      }
    } catch (err: any) {
      if (err.message.includes('Too many requests')) throw err;
      console.warn('[DB OTP RateLimit] Failed to query, using memory check:', err.message);
    }
  } else {
    // In-memory rate limiting check
    const times = mockRateLimit.get(phone) || [];
    const recentTimes = times.filter(t => nowSec - t < 15 * 60 * 1000);
    if (recentTimes.length >= 3) {
      throw new Error('Too many requests. Please wait before requesting another OTP.');
    }
    recentTimes.push(nowSec);
    mockRateLimit.set(phone, recentTimes);
  }

  // Store OTP Verification Record
  if (pool) {
    try {
      // Invalidate previous OTPs for this number
      await pool.query(
        `UPDATE otp_verifications SET expires_at = NOW() 
         WHERE phone = $1 AND is_verified = false AND expires_at > NOW()`,
        [phone]
      );

      await pool.query(
        `INSERT INTO otp_verifications (phone, otp_hash, expires_at, ip_address, device_info)
         VALUES ($1, $2, TO_TIMESTAMP($3 / 1000.0), $4, $5)`,
        [phone, otpHash, expiresAt, ipAddress || null, deviceInfo || null]
      );
    } catch (err: any) {
      console.warn('[DB OTP Store] Failed to insert verification, using memory:', err.message);
    }
  }

  // Memory store backup
  otpStore.set(phone, { hash: otpHash, expiresAt, attempts: 0, ipAddress, deviceInfo });

  // Delivery via SMS Provider Wrapper
  await sendSmsOtp(phone, code);

  return {
    phone,
    expiresInSeconds: 300,
    devOtp: env.nodeEnv === 'production' ? undefined : code,
  };
}

// 2. Verify OTP and Create Session
export async function verifyOtp(
  phone: string,
  code: string,
  role: UserRole = 'customer',
  ipAddress?: string,
  deviceInfo?: string
): Promise<{ user: any; accessToken: string; refreshToken: string }> {
  const codeHash = hashSha256(code);
  let isVerified = false;
  let user: any = null;

  // Verification from Database
  if (pool) {
    try {
      const res = await pool.query(
        `SELECT * FROM otp_verifications 
         WHERE phone = $1 AND is_verified = false AND expires_at > NOW() 
         ORDER BY created_at DESC LIMIT 1`
      );

      if (res.rows.length === 0) {
        throw new Error('OTP expired or not found. Please request a new OTP.');
      }

      const verification = res.rows[0];

      // Limit incorrect verification tries (Brute-Force Guard)
      if (verification.attempts >= 5) {
        throw new Error('Too many incorrect verification attempts. Please request a new OTP.');
      }

      // Increment attempt counter
      await pool.query(
        'UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = $1',
        [verification.id]
      );

      if (verification.otp_hash !== codeHash) {
        // Log failed attempt
        await pool.query(
          'INSERT INTO login_attempts (phone, ip_address, device_info, success) VALUES ($1, $2, $3, false)',
          [phone, ipAddress || null, deviceInfo || null]
        );
        throw new Error('Invalid OTP code');
      }

      // Successful verification
      await pool.query(
        'UPDATE otp_verifications SET is_verified = true WHERE id = $1',
        [verification.id]
      );
      await pool.query(
        'INSERT INTO login_attempts (phone, ip_address, device_info, success) VALUES ($1, $2, $3, true)',
        [phone, ipAddress || null, deviceInfo || null]
      );
      isVerified = true;
    } catch (err: any) {
      if (
        err.message.includes('expired') ||
        err.message.includes('attempts') ||
        err.message.includes('Invalid OTP')
      ) {
        throw err;
      }
      console.warn('[DB OTP Verify] Failed DB query, using memory check:', err.message);
    }
  }

  // Memory check fallback if DB query was skipped/failed
  if (!isVerified) {
    const record = otpStore.get(phone);
    if (!record || record.expiresAt < Date.now()) {
      throw new Error('OTP expired or not found. Please request a new OTP.');
    }
    if (record.attempts >= 5) {
      throw new Error('Too many incorrect verification attempts. Please request a new OTP.');
    }
    record.attempts += 1;
    if (record.hash !== codeHash) {
      throw new Error('Invalid OTP code');
    }
    otpStore.delete(phone);
  }

  // Create User Profile
  if (pool) {
    try {
      const existing = await pool.query('SELECT * FROM users WHERE phone = $1', [phone]);
      if (existing.rows.length > 0) {
        const row = existing.rows[0];
        user = {
          id: row.id,
          phone: row.phone,
          name: row.name || `User ${phone.slice(-4)}`,
          email: row.email || '',
          avatarUrl: row.avatar_url || '',
          role: row.role,
          referralCode: row.referral_code,
          createdAt: row.created_at,
        };
      } else {
        const referralCode = `CB${phone.slice(-4)}${Math.floor(100 + Math.random() * 900)}`;
        const newUser = await pool.query(
          'INSERT INTO users (phone, name, role, referral_code) VALUES ($1, $2, $3, $4) RETURNING *',
          [phone, `User ${phone.slice(-4)}`, role, referralCode]
        );
        const row = newUser.rows[0];
        user = {
          id: row.id,
          phone: row.phone,
          name: row.name,
          email: row.email || '',
          avatarUrl: row.avatar_url || '',
          role: row.role,
          referralCode: row.referral_code,
          createdAt: row.created_at,
        };

        // Automatic wallet creation
        await pool.query('INSERT INTO wallets (user_id, balance) VALUES ($1, $2) ON CONFLICT DO NOTHING', [user.id, 0]);
      }
    } catch (err: any) {
      console.warn('[DB User Creation] Query failed, using mock profile:', err.message);
    }
  }

  // Mock profile fallback
  if (!user) {
    user = {
      id: `user-${phone.slice(-6)}`,
      phone,
      name: `User ${phone.slice(-4)}`,
      email: '',
      avatarUrl: '',
      role,
      referralCode: `CB${phone.slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
  }

  // Session JWT Generation
  const accessToken = jwt.sign(user, env.jwtSecret, { expiresIn: '15d' });
  const refreshToken = crypto.randomBytes(32).toString('hex');
  const refreshTokenHash = hashSha256(refreshToken);

  // Store Refresh Token Session
  if (pool) {
    try {
      const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 Days expiry
      await pool.query(
        `INSERT INTO user_sessions (user_id, refresh_token_hash, device_info, ip_address, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, refreshTokenHash, deviceInfo || null, ipAddress || null, sessionExpiry]
      );
    } catch (err: any) {
      console.warn('[DB Session Store] Failed to save session, using memory:', err.message);
    }
  }

  mockSessions.set(refreshTokenHash, {
    userId: user.id,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    isActive: true,
  });

  return { user, accessToken, refreshToken };
}

// 3. Refresh Session
export async function refreshSession(
  refreshToken: string,
  ipAddress?: string,
  deviceInfo?: string
): Promise<{ user: any; accessToken: string; refreshToken: string }> {
  const tokenHash = hashSha256(refreshToken);
  let userId: string | null = null;

  if (pool) {
    try {
      const sessionRes = await pool.query(
        `SELECT * FROM user_sessions 
         WHERE refresh_token_hash = $1 AND is_active = true AND expires_at > NOW()`,
        [tokenHash]
      );

      if (sessionRes.rows.length > 0) {
        userId = sessionRes.rows[0].user_id;

        // Invalidate old refresh token (Replay Protection)
        await pool.query(
          'UPDATE user_sessions SET is_active = false, updated_at = NOW() WHERE id = $1',
          [sessionRes.rows[0].id]
        );
      }
    } catch (err: any) {
      console.warn('[DB Session Refresh] Query failed, checking memory fallback:', err.message);
    }
  }

  // Memory check
  if (!userId) {
    const session = mockSessions.get(tokenHash);
    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      throw new Error('Invalid or expired refresh session. Please login again.');
    }
    session.isActive = false; // Invalidate
    userId = session.userId;
  }

  // Fetch User Details
  let user: any = null;
  if (pool && userId) {
    try {
      const userRes = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
      if (userRes.rows.length > 0) {
        const row = userRes.rows[0];
        user = {
          id: row.id,
          phone: row.phone,
          name: row.name || `User ${row.phone.slice(-4)}`,
          email: row.email || '',
          avatarUrl: row.avatar_url || '',
          role: row.role,
          referralCode: row.referral_code,
          createdAt: row.created_at,
        };
      }
    } catch (err: any) {
      console.warn('[DB Session User Fetch] failed:', err.message);
    }
  }

  if (!user) {
    user = {
      id: userId,
      phone: '+919999999999',
      name: 'User',
      role: 'customer',
      referralCode: 'CB9999',
      createdAt: new Date().toISOString(),
    };
  }

  // Generate new token pair
  const accessToken = jwt.sign(user, env.jwtSecret, { expiresIn: '15d' });
  const newRefreshToken = crypto.randomBytes(32).toString('hex');
  const newRefreshTokenHash = hashSha256(newRefreshToken);

  if (pool) {
    try {
      const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      await pool.query(
        `INSERT INTO user_sessions (user_id, refresh_token_hash, device_info, ip_address, expires_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, newRefreshTokenHash, deviceInfo || null, ipAddress || null, sessionExpiry]
      );
    } catch (err: any) {
      console.warn('[DB Session Save New] failed, using memory:', err.message);
    }
  }

  mockSessions.set(newRefreshTokenHash, {
    userId: user.id,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    isActive: true,
  });

  return { user, accessToken, refreshToken: newRefreshToken };
}

// 4. Logout Session
export async function logoutSession(refreshToken: string): Promise<void> {
  const tokenHash = hashSha256(refreshToken);

  if (pool) {
    try {
      await pool.query(
        'UPDATE user_sessions SET is_active = false, updated_at = NOW() WHERE refresh_token_hash = $1',
        [tokenHash]
      );
    } catch (err: any) {
      console.warn('[DB Logout] update failed:', err.message);
    }
  }

  const session = mockSessions.get(tokenHash);
  if (session) {
    session.isActive = false;
  }
}
