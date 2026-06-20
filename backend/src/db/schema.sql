create extension if not exists "uuid-ossp";

create type user_role as enum ('customer', 'rider', 'store_owner', 'admin');
create type order_status as enum ('pending', 'confirmed', 'preparing', 'packed', 'picked_up', 'out_for_delivery', 'delivered', 'cancelled', 'returned');
create type payment_status as enum ('pending', 'success', 'failed', 'refunded');
create type payment_method as enum ('upi', 'card', 'cod', 'wallet', 'netbanking');
create type notification_type as enum ('order_update', 'offer', 'system', 'wallet', 'referral');

create table users (
  id uuid primary key default uuid_generate_v4(),
  phone varchar(20) unique not null,
  name varchar(120),
  email varchar(160),
  avatar_url text,
  role user_role not null default 'customer',
  referral_code varchar(24) unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  full_name varchar(120) not null,
  phone_number varchar(20) not null,
  address_line_1 text not null,
  address_line_2 text,
  landmark text,
  city varchar(80) not null,
  state varchar(80) not null,
  postal_code varchar(12) not null,
  country varchar(80) not null default 'India',
  latitude numeric(10, 7) not null,
  longitude numeric(10, 7) not null,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table stores (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references users(id),
  name varchar(160) not null,
  type varchar(60) not null,
  phone varchar(20),
  address text not null,
  lat numeric(10, 7) not null,
  lng numeric(10, 7) not null,
  is_open boolean not null default true,
  created_at timestamptz not null default now()
);

create table categories (
  id uuid primary key default uuid_generate_v4(),
  parent_id uuid references categories(id),
  name varchar(120) not null,
  name_hindi varchar(120),
  slug varchar(140) unique not null,
  icon_name varchar(80),
  sort_order int not null default 0
);

create table products (
  id uuid primary key default uuid_generate_v4(),
  store_id uuid not null references stores(id) on delete cascade,
  category_id uuid not null references categories(id),
  name varchar(180) not null,
  name_hindi varchar(180),
  description text,
  price numeric(10, 2) not null,
  mrp numeric(10, 2),
  unit varchar(40) not null,
  stock_quantity int not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_fresh boolean not null default false,
  images jsonb not null default '[]',
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table coupons (
  id uuid primary key default uuid_generate_v4(),
  code varchar(60) unique not null,
  description text not null,
  discount_type varchar(20) not null check (discount_type in ('flat', 'percent')),
  discount_value numeric(10, 2) not null,
  max_discount numeric(10, 2),
  min_order_value numeric(10, 2) not null default 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true
);

create table carts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity int not null check (quantity > 0),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number varchar(40) unique not null,
  customer_id uuid not null references users(id),
  store_id uuid references stores(id),
  rider_id uuid references users(id),
  address_id uuid references addresses(id),
  status order_status not null default 'pending',
  subtotal numeric(10, 2) not null,
  delivery_fee numeric(10, 2) not null default 0,
  platform_fee numeric(10, 2) not null default 0,
  coupon_discount numeric(10, 2) not null default 0,
  total numeric(10, 2) not null,
  payment_method payment_method not null,
  payment_status payment_status not null default 'pending',
  estimated_minutes int,
  delivery_otp varchar(8),
  special_instructions text,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz
);

create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id),
  name varchar(180) not null,
  price numeric(10, 2) not null,
  quantity int not null,
  unit varchar(40) not null,
  image_url text
);

create table payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  provider varchar(40) not null default 'razorpay',
  provider_order_id varchar(120),
  provider_payment_id varchar(120),
  provider_signature text,
  amount numeric(10, 2) not null,
  status payment_status not null default 'pending',
  raw_payload jsonb,
  created_at timestamptz not null default now()
);

create table rider_locations (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  rider_id uuid not null references users(id),
  lat numeric(10, 7) not null,
  lng numeric(10, 7) not null,
  heading numeric(8, 2),
  eta int,
  created_at timestamptz not null default now()
);

-- High frequency telemetry log partitioned by monthly intervals
create table rider_telemetry_history (
  id uuid not null default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  rider_id uuid not null references users(id),
  lat numeric(10, 7) not null,
  lng numeric(10, 7) not null,
  heading numeric(8, 2),
  speed numeric(5, 2),
  accuracy numeric(5, 2),
  created_at timestamptz not null default now(),
  primary key (id, created_at)
) partition by range (created_at);

-- Default partition and initial monthly partitions for 2026/2027
create table rider_telemetry_history_default partition of rider_telemetry_history default;
create table rider_telemetry_history_y2026m06 partition of rider_telemetry_history
  for values from ('2026-06-01 00:00:00+00') to ('2026-07-01 00:00:00+00');
create table rider_telemetry_history_y2026m07 partition of rider_telemetry_history
  for values from ('2026-07-01 00:00:00+00') to ('2026-08-01 00:00:00+00');

create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  title varchar(180) not null,
  body text not null,
  type notification_type not null,
  is_read boolean not null default false,
  data jsonb,
  created_at timestamptz not null default now()
);

create table wallets (
  user_id uuid primary key references users(id) on delete cascade,
  balance numeric(10, 2) not null default 0,
  updated_at timestamptz not null default now()
);

create table wallet_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  type varchar(20) not null check (type in ('credit', 'debit')),
  amount numeric(10, 2) not null,
  description text not null,
  created_at timestamptz not null default now()
);

create table referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_id uuid not null references users(id),
  referred_user_id uuid references users(id),
  reward_amount numeric(10, 2) not null default 0,
  status varchar(30) not null default 'pending',
  created_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  user_id uuid not null references users(id),
  rider_id uuid references users(id),
  store_id uuid references stores(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

create index idx_products_category on products(category_id);
create index idx_products_store on products(store_id);
create index idx_orders_customer_status on orders(customer_id, status);
create index idx_orders_rider_status on orders(rider_id, status);
create index idx_notifications_user_read on notifications(user_id, is_read);
create index idx_rider_locations_order_created on rider_locations(order_id, created_at desc);
create index idx_rider_telemetry_history_order_time on rider_telemetry_history(order_id, created_at desc);

-- OTP & Session Management Upgrade
create table if not exists otp_verifications (
  id uuid primary key default uuid_generate_v4(),
  phone varchar(20) not null,
  otp_hash varchar(64) not null,
  expires_at timestamptz not null,
  attempts int not null default 0,
  is_verified boolean not null default false,
  ip_address varchar(45),
  device_info text,
  created_at timestamptz not null default now()
);

create table if not exists login_attempts (
  id uuid primary key default uuid_generate_v4(),
  phone varchar(20) not null,
  ip_address varchar(45),
  device_info text,
  attempted_at timestamptz not null default now(),
  success boolean not null default false
);

create table if not exists user_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  refresh_token_hash varchar(64) not null,
  device_info text,
  ip_address varchar(45),
  is_active boolean not null default true,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists device_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  device_id varchar(120) not null,
  device_name varchar(120),
  push_token text,
  last_active timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, device_id)
);

create table if not exists otp_logs (
  id uuid primary key default uuid_generate_v4(),
  phone varchar(20) not null,
  provider varchar(40) not null,
  provider_message_id varchar(120),
  delivery_status varchar(40) not null,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_otp_verifications_phone_created on otp_verifications(phone, created_at desc);
create index if not exists idx_user_sessions_token on user_sessions(refresh_token_hash);
create index if not exists idx_login_attempts_phone on login_attempts(phone, attempted_at desc);

create table if not exists banners (
  id uuid primary key default uuid_generate_v4(),
  title varchar(180) not null,
  subtitle text,
  image_url text not null,
  cta_text varchar(60),
  click_destination varchar(255),
  is_active boolean not null default true,
  sort_order int not null default 0,
  start_date timestamptz,
  end_date timestamptz,
  campaign_type varchar(60),
  clicks int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_banners_active_order on banners(is_active, sort_order);


