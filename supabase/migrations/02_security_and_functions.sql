-- ==============================================================================
-- MIGRATION 02: SECURITY FUNCTIONS & PERMISSIONS
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

-- Grants
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
