-- Run once if the original schema was already created.
grant insert on public.customers to anon, authenticated;
grant insert on public.orders to anon, authenticated;
grant insert on public.order_items to anon, authenticated;

drop policy if exists "Public can create customers" on public.customers;
drop policy if exists "Public can create orders" on public.orders;
drop policy if exists "Public can create order items" on public.order_items;

create policy "Public can create customers"
on public.customers for insert to anon, authenticated
with check (true);

create policy "Public can create orders"
on public.orders for insert to anon, authenticated
with check (status = 'pending');

create policy "Public can create order items"
on public.order_items for insert to anon, authenticated
with check (quantity > 0);
