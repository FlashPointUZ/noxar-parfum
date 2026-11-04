-- ==============================================================================
-- MIGRATION 01: TABLES INITIALIZATION
-- ==============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Products
create table if not exists public.products (
  id text primary key,
  name text not null,
  brand text not null default 'NOXAR',
  price numeric not null default 0,
  old_price numeric,
  stock integer not null default 0,
  category text not null default 'atirlar',
  gender text not null default 'unisex',
  description text,
  image text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Customers
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text,
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  phone text,
  address text,
  total numeric not null default 0,
  payment_method text default 'cash',
  payment_status text default 'pending',
  shipping_method text default 'standart',
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'delivered', 'cancelled')),
  order_status text default 'pending',
  items jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Order Items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric not null default 0
);

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null default 'general',
  customer_name text,
  reviewer text,
  rating integer not null default 5 check (rating between 1 and 5),
  review_text text,
  text text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

-- Reservations
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  product_name text not null,
  brand text default 'NOXAR',
  volume_ml integer default 50,
  quantity integer not null default 1 check (quantity > 0),
  request_type text not null default 'try',
  customer_name text not null,
  customer_phone text not null,
  customer_message text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Site Content (CMS)
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- Admin Users
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
