# NOXAR PARFUM — Supabase Ma'lumotlar Bazasi Hujjatlari

Ushbu katalogda NOXAR PARFUM loyihasining to'liq ma'lumotlar bazasi arxitekturasi, jadvallar sxemasi va Row Level Security (RLS) xavfsizlik siyosatlari joylashgan.

## 🚀 Tezkor O'rnatish (1 Qadamda)

1. Supabase boshqaruv panelingizga kiring: [https://supabase.com/dashboard](https://supabase.com/dashboard).
2. Chap menyudan **SQL Editor** bo'limini oching.
3. Yangi so'rov ochib, [`supabase/schema.sql`](./schema.sql) faylining to'liq matnini nusxalab qo'ying va **Run** tugmasini bosing.
4. Tizim avtomatik ravishda barcha jadvallar, RLS xavfsizlik qoidalari, admin tekshiruv funksiyalari va boshlang'ich mahsulotlar hamda CMS matnlarini yaratadi!

---

## 📂 Fayllar Tuzilmasi

- [`schema.sql`](./schema.sql) — Yagona birlashtirilgan to'liq master sxema (idempotent, qayta ishga tushirilsa ham xatolik bermaydi).
- `migrations/` — Bosqichma-bosqich migratsiya fayllari:
  - [`01_tables.sql`](./migrations/01_tables.sql) — Jadvallar (`products`, `orders`, `order_items`, `customers`, `reviews`, `reservations`, `site_content`, `admin_users`).
  - [`02_security_and_functions.sql`](./migrations/02_security_and_functions.sql) — Xavfsizlik funksiyalari (`noxar_is_admin()`) va grant huquqlari.
  - [`03_rls_policies.sql`](./migrations/03_rls_policies.sql) — RLS siyosatlari (anonim xaridorlar va adminlar uchun rollar).
  - [`04_site_content_and_seed.sql`](./migrations/04_site_content_and_seed.sql) — Standart mahsulotlar va CMS matnlari.

---

## 🛡️ Admin Huquqini Biriktirish

Yangi foydalanuvchini admin qilish uchun Supabase SQL Editor da quyidagi buyruqni bajaring:

```sql
insert into public.admin_users (user_id)
select id from auth.users
where email = 'SIZNING_ADMIN_EMAILINGIZ@gmail.com'
on conflict (user_id) do nothing;
```

---

## 📊 Jadvallar Tavsifi

| Jadval | Vazifasi | Ruxsatlar |
|---|---|---|
| `products` | Barcha atirlar, parfyum va mahsulotlar katalogi | Ochiq o'qish (active=true), Faqat admin yozish/o'chirish |
| `orders` | Xaridorlar tomonidan rasmiylashtirilgan buyurtmalar | Ochiq buyurtma berish, Faqat admin status o'zgartirish/o'chirish |
| `order_items` | Har bir buyurtmaning tarkibi va tovarlari | Ochiq qo'shish, Admin to'liq boshqaruvi |
| `reviews` | Mijozlarning sharhlari | Ochiq qoldirish (pending), Faqat tasdiqlanganlar ommaviy ko'rinadi |
| `site_content` | Dinamik CMS: sarlavhalar, e'lonlar, kontaktlar | Barcha o'qiy oladi, Faqat admin tahrirlay oladi |
| `customers` | Do'kon mijozlari bazasi | Buyurtma berishda yaratiladi, Admin ko'ra oladi |
| `admin_users` | Admin rollari ro'yxati | Faqat tizim ichki funksiyasi (`noxar_is_admin`) tekshiradi |
