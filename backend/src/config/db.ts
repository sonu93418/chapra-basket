import pg from 'pg';
import { env } from './env.js';

export const pool = env.databaseUrl
  ? new pg.Pool({ connectionString: env.databaseUrl })
  : null;

export async function checkDatabase() {
  if (!pool) return { connected: false, reason: 'DATABASE_URL not configured' };
  const client = await pool.connect();
  try {
    await client.query('select 1');
    return { connected: true };
  } finally {
    client.release();
  }
}
