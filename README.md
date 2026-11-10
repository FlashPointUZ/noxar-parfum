# NOXAR PARFUM

Premium parfyumeriya do‘koni sayti (GitHub Pages + Supabase). Rejim: mahsulotni **ajratib qo‘yish / do‘konda hidlab ko‘rish** — onlayn savat va to‘lov yo‘q.

## O‘rnatish (bir marta)

1. **Supabase → SQL Editor** ga `noxar-supabase-setup.sql` faylini to‘liq tashlab **Run** bosing.
   - Fayl ichidagi admin emailini (`cazizbek540@gmail.com`) kerak bo‘lsa o‘zgartiring. Bu email avval saytda “Ro‘yxatdan o‘tish” orqali akkaunt ochgan bo‘lishi shart.
   - Fayl xavfsiz: qayta ishga tushirsangiz ma’lumotlar o‘chmaydi.
2. (Ixtiyoriy) Katalog bo‘sh bo‘lsa, `noxar-seed-demo-products.sql` ni ham ishga tushiring — 16 ta namunaviy mahsulot qo‘shiladi. Keyin ularni admin paneldan tahrirlang/o‘chiring.
3. **Authentication → URL Configuration → Site URL** ga sayt manzilini yozing (parolni tiklash xati shu manzilga olib keladi).
4. Repozitoriyga hamma fayllarni yuklang va **eski fayllarni o‘chiring**: `noxar-supabase-reset.sql`, `noxar-admin-role-policy.sql`, `noxar-checkout-policy.sql`, `noxar-admin-products-policy.sql`, `admin - Copy.css`, `file.jpe` (eskilari qayta ishga tushirilsa, xavfsizlik sozlamalarini buzadi).

## Admin panel

`admin.html` — admin email va paroli bilan kiring. Mahsulot rasmi/videosi Supabase Storage (`product-media`) ga yuklanadi, bazada faqat havola saqlanadi.

## Do‘kon ma’lumotlari

Manzil va Telegram `supabase-config.js` ichidagi `NOXAR_SHOP` da; shuningdek `index.html` dagi “Bog‘lanish” bo‘limi va footerdagi Telegram havolasida ham yozilgan — o‘zgartirsangiz hammasini yangilang.

## Fayllar

| Fayl | Vazifasi |
| --- | --- |
| `index.html`, `script.js`, `style.css` | Bosh sahifa va katalog |
| `product.html`, `product-detail.js`, `product-detail.css` | Mahsulot sahifasi (`product.html?id=...`) |
| `admin.html`, `admin.js`, `admin.css` | Admin panel |
| `supabase-config.js` | Umumiy sozlamalar, Supabase kliyenti |
| `noxar-supabase-setup.sql` | Baza, xavfsizlik (RLS) va Storage sozlamasi |
| `sw.js`, `manifest.webmanifest`, `icon-*.png` | Oflayn kesh va ilova ikonkalari |
