-- =====================================================================
-- NOXAR PARFUM — Supabase to'liq sozlash (bitta fayl).
-- Supabase Dashboard -> SQL Editor -> shu faylni to'liq tashlab "Run" bosing.
-- Fayl xavfsiz: bir necha marta ishga tushirsa ham ma'lumotlarni o'chirmaydi.
--
-- MUHIM: pastdagi ADMIN_EMAIL o'rniga admin emailini yozing (avval shu email
-- bilan sayt orqali "Ro'yxatdan o'tish" qilgan bo'lishi kerak).
-- =====================================================================

-- ---------- 1. Jadvallar ----------
create table if not exists public.products (
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

alter table public.products add column if not exists family text default 'amber';
alter table public.products add column if not exists volume text default '50';
alter table public.products add column if not exists notes text;
alter table public.products add column if not exists badge text;
alter table public.products add column if not exists video text;
alter table public.products add column if not exists popularity integer not null default 0;

create table if not exists public.reservations (
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

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  customer_name text not null,
  rating integer not null check (rating between 1 and 5),
  review_text text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists reviews_product_status_idx on public.reviews (product_id, status);
create index if not exists reservations_created_idx on public.reservations (created_at desc);

alter table public.products enable row level security;
alter table public.reservations enable row level security;
alter table public.reviews enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- ---------- 2. Admin roli ----------
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
grant select on public.admin_users to authenticated;

drop policy if exists "Admins can read their own role" on public.admin_users;
create policy "Admins can read their own role"
on public.admin_users for select to authenticated
using (user_id = auth.uid());

create or replace function public.noxar_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function public.noxar_is_admin() from public;
grant execute on function public.noxar_is_admin() to anon, authenticated;

-- >>> ADMIN_EMAIL: o'zingizning admin emailingizni yozing <<<
insert into public.admin_users (user_id)
select id from auth.users where email = 'cazizbek540@gmail.com'
on conflict (user_id) do nothing;

-- ---------- 3. Eski ruxsatlarni tozalash ----------
revoke all on public.products from anon, authenticated;
revoke all on public.reservations from anon, authenticated;
revoke all on public.reviews from anon, authenticated;
revoke all on public.newsletter_subscribers from anon, authenticated;

do $$
declare
  p record;
begin
  for p in
    select schemaname, tablename, policyname from pg_policies
    where schemaname = 'public'
      and tablename in ('products', 'reservations', 'reviews', 'newsletter_subscribers')
  loop
    execute format('drop policy if exists %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end $$;

-- Eski (endi ishlatilmaydigan) buyurtma jadvallari: anon yozish huquqini yopamiz.
do $$
begin
  if to_regclass('public.customers') is not null then
    revoke all on public.customers from anon, authenticated;
    drop policy if exists "Public can create customers" on public.customers;
  end if;
  if to_regclass('public.orders') is not null then
    revoke all on public.orders from anon, authenticated;
    drop policy if exists "Public can create orders" on public.orders;
  end if;
  if to_regclass('public.order_items') is not null then
    revoke all on public.order_items from anon, authenticated;
    drop policy if exists "Public can create order items" on public.order_items;
  end if;
end $$;

-- ---------- 4. Mahsulotlar ----------
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

create policy "Public can read active products"
on public.products for select to anon, authenticated
using (active = true);

create policy "Admins can read all products"
on public.products for select to authenticated
using (public.noxar_is_admin());

create policy "Admins can create products"
on public.products for insert to authenticated
with check (public.noxar_is_admin());

create policy "Admins can update products"
on public.products for update to authenticated
using (public.noxar_is_admin())
with check (public.noxar_is_admin());

create policy "Admins can delete products"
on public.products for delete to authenticated
using (public.noxar_is_admin());

-- ---------- 5. So'rovlar (ajratib qo'yish / hidlab ko'rish) ----------
grant insert on public.reservations to anon, authenticated;
grant select, update, delete on public.reservations to authenticated;

create policy "Public can create pending reservations"
on public.reservations for insert to anon, authenticated
with check (
  status = 'pending'
  and char_length(customer_name) between 2 and 80
  and char_length(customer_phone) between 9 and 24
  and quantity between 1 and 100
  and (customer_message is null or char_length(customer_message) <= 500)
);

create policy "Admins can read reservations"
on public.reservations for select to authenticated
using (public.noxar_is_admin());

create policy "Admins can update reservations"
on public.reservations for update to authenticated
using (public.noxar_is_admin())
with check (public.noxar_is_admin());

create policy "Admins can delete reservations"
on public.reservations for delete to authenticated
using (public.noxar_is_admin());

-- ---------- 6. Sharhlar ----------
grant select on public.reviews to anon, authenticated;
grant insert on public.reviews to anon, authenticated;
grant update, delete on public.reviews to authenticated;

create policy "Public can read approved reviews"
on public.reviews for select to anon, authenticated
using (status = 'approved');

create policy "Admins can read all reviews"
on public.reviews for select to authenticated
using (public.noxar_is_admin());

create policy "Public can create pending reviews"
on public.reviews for insert to anon, authenticated
with check (
  status = 'pending'
  and rating between 1 and 5
  and char_length(customer_name) between 2 and 60
  and char_length(review_text) between 3 and 800
);

create policy "Admins can update reviews"
on public.reviews for update to authenticated
using (public.noxar_is_admin())
with check (public.noxar_is_admin());

create policy "Admins can delete reviews"
on public.reviews for delete to authenticated
using (public.noxar_is_admin());

-- ---------- 7. Yangiliklar obunasi ----------
grant insert on public.newsletter_subscribers to anon, authenticated;
grant select, delete on public.newsletter_subscribers to authenticated;

create policy "Public can subscribe"
on public.newsletter_subscribers for insert to anon, authenticated
with check (
  char_length(email) between 5 and 120
  and email ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$'
);

create policy "Admins can read subscribers"
on public.newsletter_subscribers for select to authenticated
using (public.noxar_is_admin());

create policy "Admins can delete subscribers"
on public.newsletter_subscribers for delete to authenticated
using (public.noxar_is_admin());

-- ---------- 8. Rasm/video ombori (Storage) ----------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-media', 'product-media', true, 26214400,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']
)
on conflict (id) do update
set public = true,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Admins can upload product media" on storage.objects;
drop policy if exists "Admins can update product media" on storage.objects;
drop policy if exists "Admins can delete product media" on storage.objects;

create policy "Admins can upload product media"
on storage.objects for insert to authenticated
with check (bucket_id = 'product-media' and public.noxar_is_admin());

create policy "Admins can update product media"
on storage.objects for update to authenticated
using (bucket_id = 'product-media' and public.noxar_is_admin())
with check (bucket_id = 'product-media' and public.noxar_is_admin());

create policy "Admins can delete product media"
on storage.objects for delete to authenticated
using (bucket_id = 'product-media' and public.noxar_is_admin());
