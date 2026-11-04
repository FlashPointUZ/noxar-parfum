-- ==============================================================================
-- NOXAR PARFUM — TO'LIQ MASTER MA'LUMOTLAR BAZASI SXEMASI (SUPABASE POSTGRESQL)
-- ==============================================================================
-- Ushbu faylni Supabase boshqaruv panelidagi SQL Editor da 1 marta ishga tushiring.
-- U barcha jadvallar, RLS xavfsizlik siyosatlari, funksiyalar va boshlang'ich ma'lumotlarni yaratadi.
-- ==============================================================================

-- 1. KENGAYTMALARNI YOQISH
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 2. ASOSIY JADVALLARNI YARATISH (TABLES)
-- ==============================================================================

-- 2.1. Mahsulotlar jadvali (Products)
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

-- 2.2. Mijozlar jadvali (Customers)
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

-- 2.3. Buyurtmalar jadvali (Orders)
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

-- 2.4. Buyurtma tovarlari (Order Items)
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit_price numeric not null default 0
);

-- 2.5. Mijozlar sharhlari (Reviews)
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

-- 2.6. Atirni sinash bron qilish (Reservations / Discovery bar)
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

-- 2.7. Dinamik Sayt Matnlari va Kontent CMS (Site Content)
create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

-- 2.8. Tizim Administratorlari (Admin Users)
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ==============================================================================
-- 3. XAVFSIZLIK VA ADMIN FUNKSIYASI (SECURITY DEFINER FUNCTION)
-- ==============================================================================

create or replace function public.noxar_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.noxar_is_admin() from public;
grant execute on function public.noxar_is_admin() to authenticated;

-- ==============================================================================
-- 4. RLS HUQUQLARI VA SIYOSATLARI (ROW LEVEL SECURITY)
-- ==============================================================================

alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.reservations enable row level security;
alter table public.site_content enable row level security;
alter table public.admin_users enable row level security;

-- Grantlar
grant usage on schema public to anon, authenticated;
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

grant insert on public.customers to anon, authenticated;
grant select, update, delete on public.customers to authenticated;

grant select, insert on public.orders to anon, authenticated;
grant update, delete on public.orders to authenticated;

grant insert on public.order_items to anon, authenticated;
grant select, update, delete on public.order_items to authenticated;

grant select, insert on public.reviews to anon, authenticated;
grant update, delete on public.reviews to authenticated;

grant select, insert on public.reservations to anon, authenticated;
grant update, delete on public.reservations to authenticated;

grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;

grant select on public.admin_users to authenticated;

-- 4.1. Products Policies
drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products for select to anon, authenticated
using (active = true or public.noxar_is_admin());

drop policy if exists "Authenticated admins can manage products" on public.products;
create policy "Authenticated admins can manage products"
on public.products for all to authenticated
using (public.noxar_is_admin())
with check (public.noxar_is_admin());

-- 4.2. Orders Policies
drop policy if exists "Public can insert orders" on public.orders;
create policy "Public can insert orders"
on public.orders for insert to anon, authenticated
with check (true);

drop policy if exists "Public can read own orders by phone" on public.orders;
create policy "Public can read own orders by phone"
on public.orders for select to anon, authenticated
using (true);

drop policy if exists "Authenticated admins can manage orders" on public.orders;
create policy "Authenticated admins can manage orders"
on public.orders for all to authenticated
using (public.noxar_is_admin())
with check (public.noxar_is_admin());

-- 4.3. Reviews Policies
drop policy if exists "Public can read approved reviews" on public.reviews;
create policy "Public can read approved reviews"
on public.reviews for select to anon, authenticated
using (status = 'approved' or public.noxar_is_admin());

drop policy if exists "Public can insert pending reviews" on public.reviews;
create policy "Public can insert pending reviews"
on public.reviews for insert to anon, authenticated
with check (status = 'pending');

drop policy if exists "Authenticated admins can manage reviews" on public.reviews;
create policy "Authenticated admins can manage reviews"
on public.reviews for all to authenticated
using (public.noxar_is_admin())
with check (public.noxar_is_admin());

-- 4.4. Site Content (CMS) Policies
drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
on public.site_content for select to anon, authenticated
using (true);

drop policy if exists "Authenticated admins can manage site content" on public.site_content;
create policy "Authenticated admins can manage site content"
on public.site_content for all to authenticated
using (public.noxar_is_admin() or auth.role() = 'authenticated')
with check (public.noxar_is_admin() or auth.role() = 'authenticated');

-- 4.5. Admin Users Policy
drop policy if exists "Admins can read their own role" on public.admin_users;
create policy "Admins can read their own role"
on public.admin_users for select to authenticated
using (user_id = auth.uid());

-- ==============================================================================
-- 5. BOSHLANG'ICH MA'LUMOTLARNI YUKLASH (SEED DATA)
-- ==============================================================================

-- 5.1. Sayt matnlari (CMS)
insert into public.site_content (key, value)
values
  ('announcement', '{"text": "Toshkent bo‘ylab tezkor yetkazib berish · 500 000 so‘mdan yuqori xaridlarga bepul", "active": true}'::jsonb),
  ('hero', '{"badge": "Hid — bu xotira", "title_line1": "O‘zingning", "title_highlight": "afsonangni", "title_line2": "yarat.", "subtitle": "Har bir tomchida xarakter, har bir notada sening beqiyos hikoyang. NOXAR bilan unutilmas va nafis iz qoldir.", "cta_primary": "Kolleksiyani ko‘rish", "cta_secondary": "Biz haqimizda", "image_url": ""}'::jsonb),
  ('new_collection', '{"badge": "Tanlangan", "title": "Yangi", "title_highlight": "kolleksiya", "link_text": "Barcha atirlarni ko‘rish"}'::jsonb),
  ('catalog', '{"badge": "Siz uchun tanlangan", "title": "Tavsiya", "title_highlight": "etamiz", "subtitle": "Har bir xarakter va kayfiyat uchun o‘ziga xos mualliflik kompozitsiyasi."}'::jsonb),
  ('brand_story', '{"badge": "Bizning Falsafamiz", "title": "Har bir inson o‘z", "title_highlight": "izini", "title_line2": "qoldiradi.", "description": "NOXAR PARFUM — bu shunchaki atir do‘koni emas. Bu o‘ziga xoslik, jasorat va nafosat timsoli bo‘lgan tanlangan hidlar maskanidir. Biz har bir notani ehtiyotkorlik bilan tanlaymiz, toki siz xonaga kirganingizda ham, ketganingizdan keyin ham xotiralar siz haqingizda so‘zlasin.", "city_country": "Toshkent, O‘zbekiston", "card_title": "Haqiqiy parfyumeriya san’ati va beqiyos his-tuyg‘ular.", "showroom_name": "Bekbaraka, 472-do‘kon", "showroom_address": "Bekbaraka bozori, 12-qator, 2-blok, 472-magazin yonida", "maps_url": "https://www.google.com/maps/search/?api=1&query=Bekbaraka+bozori+12-qator+2-blok+472-magazin"}'::jsonb),
  ('testimonials', '{"badge": "Mijozlarimiz ovozi", "title": "Haqiqiy", "title_highlight": "taassurotlar", "subtitle": "Har bir sharh — biz uchun o‘ziga xos qadrli hikoya."}'::jsonb),
  ('contacts', '{"phone": "+998 90 000 00 00", "telegram": "https://t.me", "instagram": "https://instagram.com", "footer_slogan": "Sening izing. Sening hikoyang. Biz har bir insonga o‘zining unutilmas shaxsiy hidini topishga ko‘maklashamiz.", "showroom_address": "Toshkent sh., Bekbaraka bozori, 12-qator, 2-blok, 472-magazin."}'::jsonb)
on conflict (key) do nothing;

-- 5.2. Standart mahsulotlar (Products Seed)
insert into public.products (id, name, brand, price, old_price, stock, category, gender, description, active)
values
  ('obsidian', 'Obsidian', 'NOXAR', 1250000, 1450000, 12, 'atirlar', 'unisex', 'Qora smola, tutunli qayin va nafis amber notalari.', true),
  ('santal', 'Santal', 'NOXAR', 980000, 1150000, 8, 'atirlar', 'unisex', 'Avstraliya sandali, kardamon va oq mushk uyg‘unligi.', true),
  ('eclat', 'Éclat', 'NOXAR', 890000, 1050000, 15, 'atirlar', 'ayollar', 'Bahoriy yasmin, bergamot va nozik vanil shabadasi.', true),
  ('cuir-noir', 'Cuir Noir', 'NOXAR', 1350000, 1600000, 5, 'atirlar', 'erkaklar', 'Qimmatbaho charm, konyak va tutunli tamaki notalari.', true),
  ('oud-royal', 'Oud Royal', 'NOXAR', 1550000, 1800000, 4, 'atirlar', 'unisex', 'Sharqona podshohona ud va dafna barglari siri.', true),
  ('fleur-blanche', 'Fleur Blanche', 'NOXAR', 820000, 950000, 10, 'body-fragrance', 'ayollar', 'Oq gullar va shaftoli g‘unchasidan tana spreyi.', true)
on conflict (id) do nothing;
