# NOXAR PARFUM — Step-by-Step Harakatlar Rejasi (plan.md)

Ushbu reja **NOXAR PARFUM** loyihasini **Nutlope/hallmark** anti-AI-slop dizayn falsafasi asosida qayta ishlab chiqish, **Next.js (App Router)** freymvorkiga o‘tkazish, **Supabase** backend xizmati bilan to‘liq integratsiya qilish hamda **GitHub Pages** orqali statik hostingda uzluksiz ishga tushirish bo‘yicha to‘liq yo‘l xaritasidir.

---

## 🧭 Loyiha Maqsadi va Asosiy Qoidalar

1. **Hallmark Anti-AI-Slop standarti**:
   - Shablonli, jonsiz ("AI slop") ko‘rinishlardan voz kechish.
   - Tasodifiy inline-hex ranglar o‘rniga tokenlashtirilgan qatlamli rang tizimi (`--surface-0` ... `--surface-5`).
   - Sarlavhalarda sun'iy gradientlar emas, qat'iy va nafis shrift kontrasti (`Playfair Display` + `DM Sans`).
   - Bir xil 3-ustunli zerikarli kartochkalar o‘rniga vizual ritmga ega dinamik makrostruktura (Bento Grid, Marquee Hero, Workbench).
2. **Next.js & TypeScript**:
   - Kod bazasini modulli komponentlar, server va client qismlariga ajratish.
   - Statik eksport (`output: 'export'`) orqali har qanday dinamik qismni Supabase brauzer-klienti bilan bog‘lash.
3. **GitHub Pages mosligi**:
   - `basePath: '/noxar-parfum'` bilan to‘g‘ri marshrutlash.
   - SPA marshrutlarini qo‘llab-quvvatlovchi `404.html` va Jekyllni o‘chiruvchi `.nojekyll`.
4. **Ish maydoni**:
   - Barcha amallar va fayllar `D:\AntigravityAI\Aziz-E-commerce` hududida markazlashgan holda olib boriladi.

---

## 📌 1-BOSQICH: Muhit va Next.js Infratuzilmasini O‘rnatish

- [x] **1.1. Yangi Next.js loyihasini yaratish**:
  - `D:\AntigravityAI\Aziz-E-commerce\noxar-parfum` ichida initsializatsiya qilindi.
  - Stack: `Next.js 14+ (App Router)`, `TypeScript`, `Tailwind CSS`, `ESLint`.
- [x] **1.2. Kerakli kutubxonalarni o‘rnatish**:
  - `@supabase/supabase-js`, `zustand`, `lucide-react`, `clsx`, `tailwind-merge`.
- [x] **1.3. Next.js konfiguratsiyasini GitHub Pages uchun sozlash**:
  - `next.config.mjs` da `output: 'export'`, `basePath`, `images: { unoptimized: true }` sozlandi.
- [x] **1.4. Statik aktivlarni joylashtirish (`public/`)**:
  - `manifest.webmanifest`, `sw.js`, `.nojekyll`, va `404.html` joylashtirildi.

---

## 🎨 2-BOSQICH: Hallmark Dizayn Tizimi va Stil Tokenslarini Qat'iylashtirish

- [x] **2.1. Dizayn tokenlarini `globals.css` ga joylashtirish**:
  - Hallmark Dark va Light rejimlari uchun qatlamli (Surface layers) tokenlar yaratildi (`--surface-0` ... `--surface-accent`, `--gold-primary`, `--gold-light`).
- [x] **2.2. Hallmark Anti-Pattern Filtrlarini qo‘llash**:
  - **Stop Slop 1**: Har bir sarlavha ustiga keraksiz `EYEBROW` yopishtirish cheklandi.
  - **Stop Slop 2**: Bento grid (katta e'tibor kartasi + 2 ta ixcham karta) joriy etildi.
  - **Stop Slop 3**: Matnlar o‘rtasida soxta gradient clip ishlatilmasdan, sof kontrast saqlandi.
  - **Stop Slop 4**: `overflow-x: clip` dan foydalanildi.
- [x] **2.3. Maxsus CSS Atir Flakoni san'atini (CSS Art Bottles) komponentga aylantirish**:
  - `BottleArt.tsx` komponenti yaratildi (Obsidian, Santal, Eclat variantlari bilan).

---

## 🗄️ 3-BOSQICH: Supabase Arxitekturasi va Ma'lumotlar Qatlami

- [x] **3.1. Supabase Client & TypeScript Turlari**:
  - `src/lib/supabase/client.ts` va `src/types/database.ts` yaratildi.
  - Kalitlar `.env` va `.env.local` fayllariga xavfsiz tarzda joylashtirildi (`.gitignore` himoyasi bilan).
- [x] **3.2. Supabase SQL Migration va RLS (Row Level Security)**:
  - Jadvallar va anonim mijozlar xaridi uchun RLS mosligi ta'minlandi.
- [x] **3.3. Offline/Fallback va Mock tizimi**:
  - Tarmoq uzilganda do'kon to‘xtamasligi uchun `initialProducts` zaxira manbasi integratsiya qilindi.

---

## 🧱 4-BOSQICH: Next.js Foydalanuvchi Interfeysi (UI/UX) Komponentlari

- [x] **4.1. Layout & Navigatsiya**:
  - `Header.tsx`, `MobileBottomNav.tsx`, `Footer.tsx`.
- [x] **4.2. Sahifa Seksiyalari**:
  - `HeroSection.tsx`: Hallmark Marquee Hero arxitekturasi.
  - `NewCollectionBento.tsx`: Bento Grid formatidagi yangi kolleksiya.
  - `CatalogSection.tsx`: Filtrlar (bo‘lim, jins, narx, qidiruv).
  - `BrandStory.tsx`: Showroom va brend falsafasi.
  - `Testimonials.tsx`: Sharhlar va fikr qoldirish formasi.
- [x] **4.3. Do‘kon Funktsionallik Komponentlari**:
  - `ProductCard.tsx`, `ProductModal.tsx`, `CartDrawer.tsx`, `CheckoutModal.tsx`, `WishlistDrawer.tsx`, `SearchModal.tsx`.

---

## ⚙️ 5-BOSQICH: Holat Boshqaruvi (State Management)

- [x] **5.1. Zustand Do‘konlari (`src/store/`)**:
  - `useCartStore.ts` (Savat, promo-kod, yetkazib berish hisob-kitobi), `useWishlistStore.ts` (Sevimlilar), `useThemeStore.ts` (Dark/Light mode), `useUIStore.ts` (Modallar holati).
- [x] **5.2. Toast & Bildirishnoma tizimi**:
  - Aniq harakatlar uchun bildirishnomalar ta'minlandi.

---

## 🛡️ 6-BOSQICH: Admin Panelini Next.js ga Ko‘chirish (`/admin`)

- [x] **6.1. Admin Auth & Himoyalangan Marshrut**:
  - Sessiya tekshiruvi va parol bilan himoyalangan admin kirish.
- [x] **6.2. Admin Dashboard Boshqaruvi**:
  - Statistika, tovarlar CRUD (qo‘shish/o‘chirish), buyurtmalar holatini o‘zgartirish, ombor monitoringi.

---

## 🚀 7-BOSQICH: GitHub Pages Deploy & CI/CD Pipeline

- [x] **7.1. Statik Build va Eksport Sinovi**:
  - `npm run build` orqali `out/` katalogi (barcha marshrutlar HTML sifatida) muvaffaqiyatli sinovdan o‘tdi.
- [x] **7.2. GitHub Actions Workflow yaratish**:
  - `.github/workflows/deploy.yml` fayli sozlandi.
- [x] **7.3. 404 va BasePath tekshiruvi**:
  - `public/.nojekyll`, `public/manifest.webmanifest`, `public/sw.js` va `404.html` integratsiya qilindi.

---

## 🔍 8-BOSQICH: Hallmark Sifat Nazorati (Audit va Verification)

- [x] **8.1. Sloplint Tekshiruvlari**:
  - Barcha ranglar `--surface-*` va `--gold-*` tokenlariga tayangan.
  - Shriftlar `Playfair Display` va `DM Sans` chegarasida to‘g‘ri ierarxiyada.
  - Mobilda to‘liq moslashuvchan (MobileBottomNav va responsive gridlar).
  - Dark va Light rejimlar mukammal ishlaydi.

---

## 🧹 9-BOSQICH: Hallmark Tozalash, Maxfiylik va Responsivlik Yangilanishi

- [x] **9.1. Hallmark Default Stiker va Gliflarini Tozalash**:
  - Katalog bo‘limlaridan barcha sun'iy AI-slop glif stikerlari (`✦`, `♢`, `♡`, `◉`, `◌`, `⌂`, `≋`, `◇`, `🎁`) to‘liq olib tashlandi, sof va hashamatli tipografik tugmalar o‘rnatildi.
  - E'lonlar panelidan (`AnnouncementBar`) `✦` belgisi olib tashlanib, matnlar nozik `·` ajratgich bilan to‘g‘rilandi.
  - Savat panelidagi xom `✓` belgisi o‘rniga toza Lucide SVG `Check` komponenti joylashtirildi.
- [x] **9.2. Shaxsiy Ma'lumotlar va Default Labellarni Tozalash**:
  - Admin panelidagi kirish formasi: `placeholder="Admin email (cazizbek540@gmail.com)"` -> `placeholder="Elektron pochta manzili"`, paroldagi demo ko‘rsatmalar olib tashlandi.
  - Auth modali: `demo@noxar.com`, `Sardor Alimov`, `+998 90 123 45 67` va boshqa sinov namunalari o‘rniga neytral universal placeholderlar qo‘yildi.
  - Buyurtma rasmiylashtirish (Checkout) va sharh qoldirish formalaridagi barcha namuna ismlar tozalandi.
  - Yangi mahsulot qo‘shish formasidagi barcha placeholderlar umumiy professional formatga keltirildi.
- [x] **9.3. Barcha Ekranlar (320px - 1920px) uchun Moslashuvchanlik**:
  - `globals.css` da `html` va `body` elementlariga `width: 100%; max-width: 100%; overflow-x: clip;` qat'iy o‘rnatildi.
  - Admin paneli jadvallari (Dashboard, Mahsulotlar, Sharhlar moderatsiyasi, Buyurtmalar) kichik ekranlarda (320px) sinmasligi uchun gorizontal scroll konteynerlari va minimal kengliklar (`min-w-[540px]`, `min-w-[620px]`, `min-w-[680px]`) bilan jihozlandi.
  - Dashboard statistika kartalari barcha ekranlar (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) uchun moslashtirildi.
  - Barcha modallar (Auth, Checkout, Product, Add Product) 320px ekranlarda chetidan toshib ketmasligi uchun qulay `p-5 sm:p-8` o‘lchamiga keltirildi.
- [x] **9.4. Yakuniy Statik Build**:
  - `npm run build` muvaffaqiyatli o‘tib, barcha sahifalar to‘liq statik HTML/JS ko‘rinishida eksport qilindi.

---

## 🌐 10-BOSQICH: Barcha Kontentni Backendga (Supabase) Ko‘chirish & Rasm Yuklash

- [x] **10.1. Dinamik Kontent Sxemasi (`public.site_content`)**:
  - `noxar-site-content-schema.sql` yaratildi: barcha sahifalar (announcement, hero, new_collection, catalog, brand_story, testimonials, contacts) uchun JSONB formatidagi moslashuvchan jadval va RLS siyosatlari.
- [x] **10.2. Rasm Yuklash va Siqish Xizmati (`storage.ts`)**:
  - `uploadImage()` va `compressImageFile()` funksiyalari yaratildi: Supabase Storage bucketiga yuklash, mavjud bo‘lmaganda esa brauzerda siqilgan xavfsiz Base64 Data URL formatiga o‘tkazish (100% ishonchlilik).
- [x] **10.3. Dinamik Kontent Do‘koni (`useSiteContentStore.ts`)**:
  - Sayt ochilganda avtomatik Supabase bazasidan yuklanadi, offline holatda esa zaxira ma'lumotlar bilan uzluksiz ishlaydi.
- [x] **10.4. Barcha Sahifa va Seksiyalarni Dinamik Qilish**:
  - `AnnouncementBar.tsx`: E'lon matni va holati backenddan olinadi.
  - `HeroSection.tsx`: Badj, sarlavha, kursiv so‘z, subtitle, tugmalar va banner rasmi backenddan olinadi.
  - `NewCollectionBento.tsx`: Sarlavha, badj va mahsulot rasmlari backenddan olinadi.
  - `CatalogSection.tsx`: Badj, sarlavha va tavsif backenddan olinadi.
  - `BrandStory.tsx`: Hikoya, showroom nomi, manzil va xarita havolasi backenddan olinadi.
  - `Testimonials.tsx`: Sarlavha va tavsif backenddan olinadi.
  - `Footer.tsx`: Aloqa, showroom, ijtimoiy tarmoqlar va shior backenddan olinadi.
- [x] **10.5. Haqiqiy Rasm Ko‘rsatish**:
  - `ProductCard.tsx`, `ProductModal.tsx`, `CartDrawer.tsx`, `WishlistDrawer.tsx` agar rasm yuklangan bo‘lsa haqiqiy rasmni, aks holda BottleArt flakonini ko‘rsatadi.
- [x] **10.6. Admin Panel CMS & Rasm Boshqaruvi**:
  - Yangi "Sayt Matnlari (CMS)" bo‘limi qo‘shildi: admin barcha matnlarni real vaqtda bazada saqlashi mumkin.
  - Yangi mahsulot qo‘shish modaliga rasm yuklash (fayl yoki havola) va preview funksiyasi qo‘shildi.
  - Mahsulotlar jadvalida har bir mahsulotning rasmi ko‘rsatiladi.
- [x] **10.7. Build va Eksport Sinovi**:
  - `npm run build` muvaffaqiyatli o‘tdi (kod 0), barcha sahifalar to‘liq statik HTML/JS ko‘rinishida eksport qilindi.

---

## 📱 11-BOSQICH: Mobile UX, Navigatsiya Dublikatini Yo‘qotish va Filtrlar Moslashuvi

- [x] **11.1. Header va Pastki Navigatsiya Dublikatini Tozalash (`Header.tsx` & `MobileBottomNav.tsx`)**:
  - Mobile ekranlarda (`< md`) tepadagi Headerdan Savat, Sevimlilar va Profil tugmalari yashirildi (`hidden md:flex`).
  - Endi tepadagi Header faqat Brend Logotipi, Dark/Light Mode tugmasi va Qidiruv tugmasini ko‘rsatadi.
  - Barcha asosiy amallar (Bosh sahifa, Katalog, Savat, Sevimlilar, Kirish/Kabinet) faqat pastki `MobileBottomNav` orqali qulay va tartibli boshqariladi (dublikat to‘liq bartaraf etildi).
- [x] **11.2. Katalog Filtrlarini Moslashtirish (`CatalogSection.tsx`)**:
  - Jins tugmalari (`Barchasi`, `Ayollar`, `Erkaklar`, `Uniseks`) 320px–375px mobil ekranlarda qisilib "Un..." bo‘lib kesilib ketishining oldi olindi (`grid grid-cols-4 sm:flex gap-1 sm:gap-1.5 w-full sm:w-auto`).
  - Saralash dropdowni pastki qatorda alohida toza chiziq va to‘liq kenglik bilan ajratildi.
- [x] **11.3. E'lon Qatori (AnnouncementBar) Moslashuvchanligi**:
  - Qat'iy `h-8` o‘rniga `min-h-[28px] sm:h-8 py-1.5 sm:py-0` berildi va harf oraliqlari mobil qurilmalarga moslashtirildi (`tracking-wider sm:tracking-[0.2em]`).
  - Matn hech qachon boshqa qismlarga tegib ketmaydi va chiroyli markazlashgan holda ko‘rinadi.
- [x] **11.4. Build va Sinov**:
  - `npm run build` to‘liq xatolarsiz 0 kodi bilan yakunlandi, barcha 5 ta statik sahifa muvaffaqiyatli hosil qilindi.

---

## ⚡ 12-BOSQICH: Admin Panelda Barcha Backend Ma'lumotlarini Boshqarish & 100% Moslashuvchanlik

- [x] **12.1. Backend Ma'lumotlarini To‘liq Boshqarish (Full CRUD)**:
  - **Mahsulotlar (`products`)**: Ko‘rish, qidirish, kategoriya bo‘yicha filtrlash, yangi mahsulot qo‘shish (rasm yuklash / URL), mavjud mahsulotni **tahrirlash (Edit Modal)**, faollik holatini bitta tugma bilan almashtirish (Faol/Nofaol), tezkor stok boshqaruvi (+/-) va o‘chirish (Supabase delete).
  - **Buyurtmalar (`orders`)**: Barcha buyurtmalarni ko‘rish, status bo‘yicha filtrlash (`pending`, `processing`, `delivered`, `cancelled`), qidirish, **Batafsil ko‘rish modali (Order Details)** (mijoz ismi, telefoni, manzili, buyurtma qilingan barcha tovarlar ro‘yxati, donasi narxi, miqdori va jami summasi), holatni yangilash va o‘chirish.
  - **Sharhlar (`reviews`)**: Filtrlar (`all`, `pending`, `approved`, `rejected`), saytda ko‘rsatish uchun tasdiqlash, rad etish va noo‘rin sharhlarni bazadan butunlay o‘chirish.
  - **Mijozlar (`customers`)**: Buyurtmalar bazasidan barcha mijozlarni avtomatik guruhlash, ularning telefon raqami, manzili, jami buyurtmalari soni va umumiy xaridlari summasini (LTV) ko‘rsatish.
  - **Ombor (`inventory`)**: Kam qolgan tovarlar monitoringi va stokni tezkor oshirish.
  - **Sayt Matnlari (CMS)**: 6 ta asosiy seksiya matnlari, e'lonlar, hero banner rasmlari va kontaktlarni real vaqtda `site_content` jadvaliga saqlash.
- [x] **12.2. Barcha Ekranlar (320px dan 1920px gacha) uchun Dual Responsive Dizayn**:
  - Mobil ekranlarda (`block md:hidden`): Barcha jadvallar noqulay gorizontal scrollsiz ixcham, zamonaviy **Mobil Kartalar (Card Views)** formatida chiqadi (har bir mahsulot, buyurtma, sharh va mijoz qulay barmoq bilan boshqariladigan karta shaklida).
  - Desktop ekranlarda (`hidden md:block`): Yuqori zichlikdagi klassik ma'muriy jadvallar ko‘rsatiladi.
  - Modallar (`showAddModal`, `editingProduct`, `selectedOrder`): Har biri kichik ekranlarda (320px) toshib ketmaydigan qulay `max-h-[90vh] overflow-y-auto` va `p-5 sm:p-7` konteyneriga keltirildi.
  - Header va Tab navigatsiyasi: Gorizontal `no-scrollbar` bilan barcha 7 ta bo‘lim ixcham va tartibli almashinadi.
- [x] **12.3. Build va Eksport Sinovi**:
  - `npm run build` to‘liq xatolarsiz 0 kodi bilan o‘tdi, barcha 5 ta statik sahifa muvaffaqiyatli hosil qilindi.
