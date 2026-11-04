-- Run once in Supabase SQL Editor.
-- Replace the email below with the email used for the admin login.

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
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
$$;

revoke all on function public.noxar_is_admin() from public;
grant execute on function public.noxar_is_admin() to authenticated;

insert into public.admin_users (user_id)
select id from auth.users
where email = 'cazizbek540@gmail.com'
on conflict (user_id) do nothing;

drop policy if exists "Authenticated admins can create products" on public.products;
drop policy if exists "Authenticated admins can update products" on public.products;
drop policy if exists "Authenticated admins can delete products" on public.products;
drop policy if exists "Authenticated admins can read products" on public.products;

create policy "Authenticated admins can read products"
on public.products for select to authenticated
using (public.noxar_is_admin());

create policy "Authenticated admins can create products"
on public.products for insert to authenticated
with check (public.noxar_is_admin());

create policy "Authenticated admins can update products"
on public.products for update to authenticated
using (public.noxar_is_admin())
with check (public.noxar_is_admin());

create policy "Authenticated admins can delete products"
on public.products for delete to authenticated
using (public.noxar_is_admin());

drop policy if exists "Public can read reservations" on public.reservations;
drop policy if exists "Public can update reservation status" on public.reservations;

create policy "Admins can read reservations"
on public.reservations for select to authenticated
using (public.noxar_is_admin());

create policy "Admins can update reservations"
on public.reservations for update to authenticated
using (public.noxar_is_admin())
with check (public.noxar_is_admin());

-- Buyurtmalar (Orders) boshqaruvi
grant select, update, delete on public.orders to authenticated;
drop policy if exists "Admins can manage orders" on public.orders;
create policy "Admins can manage orders"
on public.orders for all to authenticated
using (public.noxar_is_admin())
with check (public.noxar_is_admin());

-- Sharhlar (Reviews) moderatsiyasi va o'chirish
grant select, update, delete on public.reviews to authenticated;
drop policy if exists "Admins can manage reviews" on public.reviews;
create policy "Admins can manage reviews"
on public.reviews for all to authenticated
using (public.noxar_is_admin())
with check (public.noxar_is_admin());
