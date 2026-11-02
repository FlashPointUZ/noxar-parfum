-- Run once after the original NOXAR schema reset.
-- Product writes require a Supabase Auth session.

grant insert, update, delete on public.products to authenticated;

drop policy if exists "Authenticated admins can create products" on public.products;
drop policy if exists "Authenticated admins can update products" on public.products;
drop policy if exists "Authenticated admins can delete products" on public.products;

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
