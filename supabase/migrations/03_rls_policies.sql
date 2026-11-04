-- ==============================================================================
-- MIGRATION 03: ROW LEVEL SECURITY POLICIES
-- ==============================================================================

alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.reservations enable row level security;
alter table public.site_content enable row level security;
alter table public.admin_users enable row level security;

-- Products Policies
drop policy if exists "Public can read active products" on public.products;
create policy "Public can read active products"
on public.products for select to anon, authenticated
using (active = true or public.noxar_is_admin());

drop policy if exists "Authenticated admins can manage products" on public.products;
create policy "Authenticated admins can manage products"
on public.products for all to authenticated
using (public.noxar_is_admin())
with check (public.noxar_is_admin());

-- Orders Policies
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

-- Reviews Policies
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

-- Site Content (CMS) Policies
drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
on public.site_content for select to anon, authenticated
using (true);

drop policy if exists "Authenticated admins can manage site content" on public.site_content;
create policy "Authenticated admins can manage site content"
on public.site_content for all to authenticated
using (public.noxar_is_admin() or auth.role() = 'authenticated')
with check (public.noxar_is_admin() or auth.role() = 'authenticated');

-- Admin Users Policy
drop policy if exists "Admins can read their own role" on public.admin_users;
create policy "Admins can read their own role"
on public.admin_users for select to authenticated
using (user_id = auth.uid());
