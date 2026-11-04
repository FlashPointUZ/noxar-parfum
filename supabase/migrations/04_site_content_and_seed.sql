-- ==============================================================================
-- MIGRATION 04: SEED DATA & CMS CONTENT
-- ==============================================================================

-- Site content (CMS default values)
insert into public.site_content (key, value)
values
  ('announcement', '{"text": "Toshkent bo‘ylab tezkor yetkazib berish", "active": true}'::jsonb),
  ('hero', '{"badge": "Hid — bu xotira", "title_line1": "O‘zingning", "title_highlight": "afsonangni", "title_line2": "yarat.", "subtitle": "Har bir tomchida xarakter, har bir notada sening beqiyos hikoyang. NOXAR bilan unutilmas va nafis iz qoldir.", "cta_primary": "Kolleksiyani ko‘rish", "cta_secondary": "Biz haqimizda", "image_url": ""}'::jsonb),
  ('new_collection', '{"badge": "Tanlangan", "title": "Yangi", "title_highlight": "kolleksiya", "link_text": "Barcha atirlarni ko‘rish"}'::jsonb),
  ('catalog', '{"badge": "Siz uchun tanlangan", "title": "Tavsiya", "title_highlight": "etamiz", "subtitle": "Har bir xarakter va kayfiyat uchun o‘ziga xos mualliflik kompozitsiyasi."}'::jsonb),
  ('brand_story', '{"badge": "Bizning Falsafamiz", "title": "Har bir inson o‘z", "title_highlight": "izini", "title_line2": "qoldiradi.", "description": "NOXAR PARFUM — bu shunchaki atir do‘koni emas. Bu o‘ziga xoslik, jasorat va nafosat timsoli bo‘lgan tanlangan hidlar maskanidir. Biz har bir notani ehtiyotkorlik bilan tanlaymiz, toki siz xonaga kirganingizda ham, ketganingizdan keyin ham xotiralar siz haqingizda so‘zlasin.", "city_country": "Toshkent, O‘zbekiston", "card_title": "Haqiqiy parfyumeriya san’ati va beqiyos his-tuyg‘ular.", "showroom_name": "Bekbaraka, 472-do‘kon", "showroom_address": "Bekbaraka bozori, 12-qator, 2-blok, 472-magazin yonida", "maps_url": "https://www.google.com/maps/search/?api=1&query=Bekbaraka+bozori+12-qator+2-blok+472-magazin"}'::jsonb),
  ('testimonials', '{"badge": "Mijozlarimiz ovozi", "title": "Haqiqiy", "title_highlight": "taassurotlar", "subtitle": "Har bir sharh — biz uchun o‘ziga xos qadrli hikoya."}'::jsonb),
  ('contacts', '{"phone": "+998 90 000 00 00", "telegram": "https://t.me", "instagram": "https://instagram.com", "footer_slogan": "Sening izing. Sening hikoyang. Biz har bir insonga o‘zining unutilmas shaxsiy hidini topishga ko‘maklashamiz.", "showroom_address": "Toshkent sh., Bekbaraka bozori, 12-qator, 2-blok, 472-magazin."}'::jsonb)
on conflict (key) do nothing;

-- Default Products Seed
insert into public.products (id, name, brand, price, old_price, stock, category, gender, description, active)
values
  ('obsidian', 'Obsidian', 'NOXAR', 1250000, 1450000, 12, 'atirlar', 'unisex', 'Qora smola, tutunli qayin va nafis amber notalari.', true),
  ('santal', 'Santal', 'NOXAR', 980000, 1150000, 8, 'atirlar', 'unisex', 'Avstraliya sandali, kardamon va oq mushk uyg‘unligi.', true),
  ('eclat', 'Éclat', 'NOXAR', 890000, 1050000, 15, 'atirlar', 'ayollar', 'Bahoriy yasmin, bergamot va nozik vanil shabadasi.', true),
  ('cuir-noir', 'Cuir Noir', 'NOXAR', 1350000, 1600000, 5, 'atirlar', 'erkaklar', 'Qimmatbaho charm, konyak va tutunli tamaki notalari.', true),
  ('oud-royal', 'Oud Royal', 'NOXAR', 1550000, 1800000, 4, 'atirlar', 'unisex', 'Sharqona podshohona ud va dafna barglari siri.', true),
  ('fleur-blanche', 'Fleur Blanche', 'NOXAR', 820000, 950000, 10, 'body-fragrance', 'ayollar', 'Oq gullar va shaftoli g‘unchasidan tana spreyi.', true)
on conflict (id) do nothing;
