-- =====================================================================
-- NOXAR PARFUM — namunaviy mahsulotlar (IXTIYORIY).
-- Faqat katalog bo'sh bo'lsa va sayt qanday ko'rinishini tekshirmoqchi bo'lsangiz
-- ishga tushiring. Keyin mahsulotlarni admin paneldan tahrirlang yoki o'chiring.
-- Avval noxar-supabase-setup.sql ishga tushirilgan bo'lishi kerak.
-- =====================================================================
insert into public.products
  (id, name, brand, price, stock, category, gender, family, volume, badge, notes, description, popularity, created_at)
values
  ('obsidian', 'NO. 01 Obsidian', 'NOXAR', 890000, 3, 'atirlar', 'unisex', 'amber', '50', 'Yangi', 'Qora qalampir · Vetiver · Amber', 'Tutunli amber va vetiver uyg‘unligi bilan yaratilgan chuqur, zamonaviy va uzoq saqlanuvchi kompozitsiya.', 98, now() - interval '0 minutes'),
  ('santal', 'NO. 02 Santal', 'NOXAR', 950000, 8, 'atirlar', 'unisex', 'woody', '100', 'Bestseller', 'Sandal · Iris · Oq mushk', 'Yumshoq sandal daraxti, iris va oq mushkdan tuzilgan nafis, sokin va kundalik foydalanishga mos hid.', 100, now() - interval '1 minutes'),
  ('eclat', 'NO. 03 Éclat', 'NOXAR', 820000, 0, 'atirlar', 'ayollar', 'floral', '50', 'Yangi', 'Atirgul · Lychee · Vanil', 'Lychee va atirgulning yorqin ochilishi vanilning iliq shirinligi bilan muvozanatlangan romantik hid.', 92, now() - interval '2 minutes'),
  ('noir', 'Noir Intense', 'ATELIER N', 1150000, 2, 'atirlar', 'erkaklar', 'amber', '100', '', 'Teri · Oud · Qora amber', 'Qora amber, teri va oud notalari bilan kuchli xarakterga ega bo‘lgan kechki kompozitsiya.', 87, now() - interval '3 minutes'),
  ('velours', 'Velours Rose', 'MAISON N', 1080000, 6, 'atirlar', 'ayollar', 'floral', '30', '', 'Atirgul · Peoniya · Vanil', 'Yangi bergamot va peoniyaning nafis guldastasi vanil-sandal bazasida mayin yakunlanadi.', 79, now() - interval '4 minutes'),
  ('ritual', 'NOXAR Ritual Set', 'NOXAR', 1490000, 4, 'accessories', 'unisex', 'woody', 'set', 'Sovg‘a', '3 mini atir · Sovg‘a qutisi', 'NOXAR olamining uchta mini kompozitsiyasi va premium sovg‘a qutisidan iborat to‘plam.', 83, now() - interval '5 minutes'),
  ('mist', 'Neroli Body Mist', 'NOXAR BODY', 320000, 12, 'body-fragrance', 'unisex', 'floral', '150', 'Yangi', 'Neroli · Paxta · Oq mushk', 'Tana uchun yengil va tetiklantiruvchi mist. Kundalik parvarishdan keyin mayin hid qoldiradi.', 76, now() - interval '6 minutes'),
  ('serum', 'Radiance Face Serum', 'NOXAR SKIN', 460000, 7, 'bath-shower', 'unisex', 'floral', '30', '', 'Vitamin C · Niacinamide · Hyaluronic acid', 'Yuz terisini namlantirish va yorqin ko‘rsatish uchun yengil serum.', 71, now() - interval '7 minutes'),
  ('lipstick', 'Velvet Nude Lipstick', 'NOXAR BEAUTY', 240000, 15, 'accessories', 'unisex', 'floral', '4', '', 'Nude · Velvet · Uzoq saqlanuvchi', 'Yumshoq velvet teksturali, kundalik nude rangdagi lab bo‘yog‘i.', 68, now() - interval '8 minutes'),
  ('shampoo', 'Silk Repair Shampoo', 'NOXAR HAIR', 280000, 10, 'bath-shower', 'unisex', 'woody', '250', '', 'Argan · Keratin · Ipak proteini', 'Quruq va shikastlangan sochlar uchun yumshoq tozalovchi tiklovchi shampun.', 62, now() - interval '9 minutes'),
  ('beauty-set', 'Everyday Beauty Set', 'NOXAR BEAUTY', 690000, 5, 'body-fragrance', 'unisex', 'floral', 'set', 'Sovg‘a', 'Lipstick · Mist · Beauty pouch', 'Kundalik go‘zallik uchun body mist, lab bo‘yog‘i va premium kosmetik sumkadan iborat set.', 74, now() - interval '10 minutes'),
  ('deo', 'Noir Active Deodorant', 'NOXAR MEN', 145000, 5, 'deodorants', 'erkaklar', 'woody', '150', 'Yangi', 'Bergamot · Teri · Vetiver', 'Kun davomida tetiklik va ishonchli himoya beruvchi premium dezodorant.', 63, now() - interval '11 minutes'),
  ('oil', 'Amber Parfum Oil', 'NOXAR OILS', 210000, 5, 'perfume-oils', 'unisex', 'amber', '15', '', 'Amber · Vanil · Sandal', 'Konsentrlangan parfyumeriya moyi. Kichik flakonda uzoq saqlanuvchi iliq hid.', 59, now() - interval '12 minutes'),
  ('home-candle', 'Noir Home Candle', 'NOXAR HOME', 260000, 5, 'home-fragrance', 'unisex', 'woody', '220', '', 'Qora choy · Sadr · Amber', 'Uy muhiti uchun iliq, nafis va sokin aroma beruvchi xushbo‘y sham.', 57, now() - interval '13 minutes'),
  ('bath-set', 'Silk Bath Ritual', 'NOXAR CARE', 390000, 5, 'bath-shower', 'ayollar', 'floral', 'set', 'Set', 'Lavanda · Sut · Oq mushk', 'Dush va vanna uchun mayin hidli, kundalik parvarish to‘plami.', 55, now() - interval '14 minutes'),
  ('atomizer', 'Travel Perfume Atomizer', 'NOXAR ACCESSORIES', 95000, 5, 'accessories', 'unisex', 'woody', '8', '', 'Metall korpus · 8 ml · Qayta to‘ldiriladi', 'Sevimli atiringizni o‘zingiz bilan olib yurish uchun ixcham atomizer.', 48, now() - interval '15 minutes')
on conflict (id) do nothing;
