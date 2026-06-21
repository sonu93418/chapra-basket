import pg from 'pg';

const sql = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS otp_verifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone varchar(20) NOT NULL,
  otp_hash varchar(64) NOT NULL,
  expires_at timestamptz NOT NULL,
  attempts int NOT NULL DEFAULT 0,
  is_verified boolean NOT NULL DEFAULT false,
  ip_address varchar(45),
  device_info text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone varchar(20) NOT NULL,
  ip_address varchar(45),
  device_info text,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  success boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token_hash varchar(64) NOT NULL,
  device_info text,
  ip_address varchar(45),
  is_active boolean NOT NULL DEFAULT true,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS device_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id varchar(120) NOT NULL,
  device_name varchar(120),
  push_token text,
  last_active timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, device_id)
);

CREATE TABLE IF NOT EXISTS otp_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone varchar(20) NOT NULL,
  provider varchar(40) NOT NULL,
  provider_message_id varchar(120),
  delivery_status varchar(40) NOT NULL,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone varchar(20) UNIQUE NOT NULL,
  name varchar(120),
  email varchar(160),
  avatar_url text,
  role varchar(24) NOT NULL DEFAULT 'customer',
  referral_code varchar(24) UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS addresses (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name varchar(120) NOT NULL,
  phone_number varchar(20) NOT NULL,
  address_line_1 text NOT NULL,
  address_line_2 text,
  landmark text,
  city varchar(80) NOT NULL,
  state varchar(80) NOT NULL,
  postal_code varchar(12) NOT NULL,
  country varchar(80) NOT NULL DEFAULT 'India',
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  is_default boolean NOT NULL DEFAULT false,
  address_type varchar(30) NOT NULL DEFAULT 'Home',
  delivery_instructions text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone_created ON otp_verifications(phone, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_login_attempts_phone ON login_attempts(phone, attempted_at DESC);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(user_id, is_default);

CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title varchar(180) NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  cta_text varchar(60),
  click_destination varchar(255),
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  start_date timestamptz,
  end_date timestamptz,
  campaign_type varchar(60),
  clicks int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_banners_active_order ON banners(is_active, sort_order);

-- ALTER STATEMENTS TO PATCH EXISTING INSTANCES
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS address_type varchar(30) DEFAULT 'Home';
ALTER TABLE addresses ADD COLUMN IF NOT EXISTS delivery_instructions text;
ALTER TABLE addresses ALTER COLUMN latitude DROP NOT NULL;
ALTER TABLE addresses ALTER COLUMN longitude DROP NOT NULL;
`;

export async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/blink_box';
  const dbName = databaseUrl.match(/\/([^/?#]+)/)?.[1] || 'blink_box';

  if (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')) {
    const parentUrl = databaseUrl.replace(/\/([^/]+)$/, '/postgres');
    const parentPool = new pg.Pool({ connectionString: parentUrl });
    try {
      const client = await parentPool.connect();
      const checkDb = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
      if (checkDb.rows.length === 0) {
        console.log(`MIGRATION: Creating database "${dbName}"...`);
        await client.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
      }
      client.release();
    } catch (err: any) {
      console.warn('MIGRATION: Database auto-creation check failed:', err.message);
    } finally {
      await parentPool.end();
    }
  }

  const pool = new pg.Pool({ connectionString: databaseUrl });
  try {
    const client = await pool.connect();
    console.log('MIGRATION: CONNECTED TO POSTGRES');
    await client.query(sql);
    console.log('MIGRATION: TABLES SUCCESSFULLY CREATED/VERIFIED');
    client.release();
  } catch (err: any) {
    console.error('MIGRATION FAILED:', err);
  } finally {
    await pool.end();
  }
}

import { fileURLToPath } from 'url';
const isMain = process.argv[1] && (
  fileURLToPath(import.meta.url) === process.argv[1] ||
  process.argv[1].endsWith('migrate.ts') ||
  process.argv[1].endsWith('migrate.js')
);
if (isMain) {
  runMigrations();
}
