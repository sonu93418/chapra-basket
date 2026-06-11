import pg from 'pg';

const connectionString = 'postgres://postgres:postgres@localhost:5432/chapra_basket';
const pool = new pg.Pool({ connectionString });

const sql = `
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

CREATE INDEX IF NOT EXISTS idx_otp_verifications_phone_created ON otp_verifications(phone, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(refresh_token_hash);
CREATE INDEX IF NOT EXISTS idx_login_attempts_phone ON login_attempts(phone, attempted_at DESC);
`;

async function migrate() {
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

migrate();
