-- NOXAR PARFUM - Dynamic Site Content & Settings Schema
-- Run this script in your Supabase SQL Editor.

create table if not exists public.site_content (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
grant usage on schema public to anon, authenticated;
grant select on public.site_content to anon, authenticated;
grant insert, update, delete on public.site_content to authenticated;

-- Policies for public reading and admin managing
drop policy if exists "Public can read site content" on public.site_content;
create policy "Public can read site content"
on public.site_content for select to anon, authenticated
using (true);

drop policy if exists "Authenticated can update site content" on public.site_content;
create policy "Authenticated can update site content"
on public.site_content for all to authenticated
using (true)
with check (true);

-- Insert initial default content rows
insert into public.site_content (key, value)
values
  ('announcement', '{"text": "Toshkent bo‘ylab tezkor yetkazib berish ·", "active": true}'::jsonb),
  ('hero', '{"badge": "Hid — bu xotira", "title_line1": "O‘zingning", "title_highlight": "afsonangni", "title_line2": "yarat.", "subtitle": "Har bir tomchida xarakter, har bir notada sening beqiyos hikoyang. NOXAR bilan unutilmas va nafis iz qoldir.", "cta_primary": "Kolleksiyani ko‘rish", "cta_secondary": "Biz haqimizda", "image_url": ""}'::jsonb),
  ('new_collection', '{"badge": "Tanlangan", "title": "Yangi", "title_highlight": "kolleksiya", "link_text": "Barcha atirlarni ko‘rish"}'::jsonb),
  ('catalog', '{"badge": "Siz uchun tanlangan", "title": "Tavsiya", "title_highlight": "etamiz", "subtitle": "Har bir xarakter va kayfiyat uchun o‘ziga xos mualliflik kompozitsiyasi."}'::jsonb),
  ('brand_story', '{"badge": "Bizning Falsafamiz", "title": "Har bir inson o‘z", "title_highlight": "izini", "title_line2": "qoldiradi.", "description": "NOXAR PARFUM — bu shunchaki atir do‘koni emas. Bu o‘ziga xoslik, jasorat va nafosat timsoli bo‘lgan tanlangan hidlar maskanidir. Biz har bir notani ehtiyotkorlik bilan tanlaymiz, toki siz xonaga kirganingizda ham, ketganingizdan keyin ham xotiralar siz haqingizda so‘zlasin.", "city_country": "Toshkent, O‘zbekiston", "card_title": "Haqiqiy parfyumeriya san’ati va beqiyos his-tuyg‘ular.", "showroom_name": "Bekbaraka, 472-do‘kon", "showroom_address": "Bekbaraka bozori, 12-qator, 2-blok, 472-magazin yonida", "maps_url": "https://www.google.com/maps/search/?api=1&query=Bekbaraka+bozori+12-qator+2-blok+472-magazin"}'::jsonb),
  ('testimonials', '{"badge": "Mijozlarimiz ovozi", "title": "Haqiqiy", "title_highlight": "taassurotlar", "subtitle": "Har bir sharh — biz uchun o‘ziga xos qadrli hikoya."}'::jsonb),
  ('contacts', '{"phone": "+998 90 000 00 00", "telegram": "https://t.me", "instagram": "https://instagram.com", "footer_slogan": "Sening izing. Sening hikoyang. Biz har bir insonga o‘zining unutilmas shaxsiy hidini topishga ko‘maklashamiz.", "showroom_address": "Toshkent sh., Bekbaraka bozori, 12-qator, 2-blok, 472-magazin."}'::jsonb)
on conflict (key) do nothing;
