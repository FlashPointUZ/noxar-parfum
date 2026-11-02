-- NOXAR PARFUM demo schema reset.
-- Run this entire file in Supabase SQL Editor.

drop table if exists public.order_items cascade;
drop table if exists public.orders cascade;
drop table if exists public.reservations cascade;
drop table if exists public.reviews cascade;
drop table if exists public.products cascade;
drop table if exists public.customers cascade;

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

create table public.products (
  id text primary key,
  name text not null,
  brand text not null default 'NOXAR',
  price numeric not null default 0,
  old_price numeric,
  stock integer not null default 0,
  category text,
  gender text,
  description text,
  image text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_address text,
  total numeric not null default 0,
  payment_method text,
  delivery_method text,
  status text not null default 'pending'
    check (status in ('pending', 'processing', 'delivered', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text,
  product_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric not null default 0
);

create table public.reservations (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  product_name text not null,
  brand text,
  volume_ml integer,
  quantity integer not null default 1 check (quantity > 0),
  request_type text not null,
  customer_name text not null,
  customer_phone text not null,
  customer_message text,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  review_text text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reservations enable row level security;
alter table public.reviews enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant select on public.reservations to anon, authenticated;
grant insert on public.reservations to anon, authenticated;
grant update on public.reservations to anon, authenticated;
grant select on public.reviews to anon, authenticated;
grant insert on public.reviews to anon, authenticated;
grant insert on public.customers to anon, authenticated;
grant insert on public.orders to anon, authenticated;
grant insert on public.order_items to anon, authenticated;

create policy "Public can read active products"
on public.products for select to anon, authenticated
using (active = true);

create policy "Authenticated admins can create products"
on public.products for insert to authenticated
with check (true);

create policy "Authenticated admins can update products"
on public.products for update to authenticated
using (true)
with check (true);

create policy "Authenticated admins can delete products"
on public.products for delete to authenticated
using (true);

create policy "Public can read reservations"
on public.reservations for select to anon, authenticated
using (true);

create policy "Public can create pending reservations"
on public.reservations for insert to anon, authenticated
with check (status = 'pending');

create policy "Public can update reservation status"
on public.reservations for update to anon, authenticated
using (true)
with check (status in ('pending', 'confirmed', 'cancelled'));

create policy "Public can read approved reviews"
on public.reviews for select to anon, authenticated
using (status = 'approved');

create policy "Public can create pending reviews"
on public.reviews for insert to anon, authenticated
with check (status = 'pending');

create policy "Public can create customers"
on public.customers for insert to anon, authenticated
with check (true);

create policy "Public can create orders"
on public.orders for insert to anon, authenticated
with check (status = 'pending');

create policy "Public can create order items"
on public.order_items for insert to anon, authenticated
with check (quantity > 0);
