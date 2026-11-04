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

- [ ] **1.1. Yangi Next.js loyihasini yaratish**:
  - `D:\AntigravityAI\Aziz-E-commerce` ichida `noxar-parfum-app` (yoki `noxar-next`) papkasini initsializatsiya qilish.
  - Stack: `Next.js 14+ (App Router)`, `TypeScript`, `Tailwind CSS`, `ESLint`.
  - Buyruq:
    ```powershell
    npx create-next-app@latest noxar-next --typescript --tailwind --app --src-dir --eslint --use-npm
    ```
- [ ] **1.2. Kerakli kutubxonalarni o‘rnatish**:
  - `@supabase/supabase-js`: Supabase API bilan muloqot uchun.
  - `zustand`: Savat (cart), sevimlilar (wishlist) va UI holatlarini boshqarish uchun.
  - `lucide-react`: Yengil va toza vektor ikonkalari uchun.
  - `clsx` va `tailwind-merge`: CSS sinflarini xavfsiz birlashtirish uchun.
- [ ] **1.3. Next.js konfiguratsiyasini GitHub Pages uchun sozlash**:
  - `next.config.mjs` (yoki `.js`) faylida quyidagi parametrlarni o‘rnatish:
    ```javascript
    /** @type {import('next').NextConfig} */
    const isProd = process.env.NODE_ENV === 'production';
    const nextConfig = {
      output: 'export',
      basePath: isProd ? '/noxar-parfum' : '',
      assetPrefix: isProd ? '/noxar-parfum/' : '',
      images: {
        unoptimized: true,
      },
      trailingSlash: true,
    };
    export default nextConfig;
    ```
- [ ] **1.4. Statik aktivlarni joylashtirish (`public/`)**:
  - `manifest.webmanifest`, `sw.js`, `.nojekyll`, va `404.html` fayllarini `public/` papkasiga ko‘chirish.

---

## 🎨 2-BOSQICH: Hallmark Dizayn Tizimi va Stil Tokenslarini Qat'iylashtirish

- [ ] **2.1. Dizayn tokenlarini `globals.css` ga joylashtirish**:
  - Inline hex kodlarni yo‘qotish va qatlamli (Surface layers) rang tizimini yaratish:
    ```css
    :root {
      /* Hallmark Surface Layering */
      --surface-0: #0d0d0d; /* Asosiy qora fon */
      --surface-1: #141210; /* Kartochkalar foni */
      --surface-2: #1c1916; /* Hover va dialog foni */
      --surface-3: #24201c; /* Inputlar va modallar */
      --surface-accent: #322b24;

      /* Brand Gold Palette */
      --gold-primary: #c9a35b;
      --gold-light: #e4c27a;
      --gold-muted: rgba(201, 163, 91, 0.4);
      --gold-glow: rgba(201, 163, 91, 0.15);

      /* Typography & Content */
      --text-main: #f5f1e8;
      --text-muted: #9c958d;
      --text-dim: #6e675f;
      --border-hairline: rgba(245, 241, 232, 0.12);

      --font-serif: var(--font-playfair);
      --font-sans: var(--font-dm-sans);
    }
    ```
- [ ] **2.2. Hallmark Anti-Pattern Filtrlarini qo‘llash**:
  - **Stop Slop 1**: Har bir sarlavha ustiga keraksiz `EYEBROW` yopishtirishni to‘xtatish — faqat asosiy o‘tish nuqtalarida ishlatish.
  - **Stop Slop 2**: Hamma narsani 3 ustunli bir xil card qilmaslik — Bento grid (katta e'tibor kartasi + 2 ta ixcham karta) strukturasini joriy etish.
  - **Stop Slop 3**: Matnlar o‘rtasida soxta gradient clip ishlatmaslik — sof premium oltin va oq rang kontrasti.
  - **Stop Slop 4**: `overflow-x: clip` dan foydalanish (gorizontal scroll nosozliklarini oldini olish).
- [ ] **2.3. Maxsus CSS Atir Flakoni san'atini (CSS Art Bottles) komponentga aylantirish**:
  - `BottleArt.tsx` komponentini yaratish (Obsidian, Santal, Eclat uchun turli gradient va yorug‘lik akslari bilan).

---

## 🗄️ 3-BOSQICH: Supabase Arxitekturasi va Ma'lumotlar Qatlami

- [ ] **3.1. Supabase Client & TypeScript Turlari**:
  - `src/lib/supabase/client.ts` yaratish (`createClient` brauzer-safe instansiyasi).
  - `src/types/database.ts` orqali to‘liq interfeyslarni belgilash:
    - `Product`: id, name, brand, price, notes, description, category, gender, stock, images, rating.
    - `Order`: id, order_number, customer_name, phone, address, items, total, status, payment_status.
    - `Review`: id, product_id, reviewer, rating, text, created_at, status.
- [ ] **3.2. Supabase SQL Migration va RLS (Row Level Security)**:
  - Mavjud `.sql` fayllarni birlashtirib, `schema.sql` yaratish.
  - Xavfsizlik qoidalarini mustahkamlash:
    - `products`: Public SELECT ruxsati, INSERT/UPDATE/DELETE faqat authenticated adminlar uchun.
    - `orders`: Public INSERT (anonim mijozlar xarid qilishi uchun), SELECT/UPDATE faqat admin yoki buyurtma egasiga.
    - `reviews`: Public SELECT (faqat `status = 'approved'`), yangi sharhlar `pending` holatida qo‘shiladi.
- [ ] **3.3. Offline/Fallback va Mock tizimi**:
  - Supabase internet bilan vaqtincha uzilganda ham katalog ishini to‘xtatmaslik uchun `demoProducts` zaxira manbasini integratsiya qilish.

---

## 🧱 4-BOSQICH: Next.js Foydalanuvchi Interfeysi (UI/UX) Komponentlari

- [ ] **4.1. Layout & Navigatsiya (`src/components/layout/`)**:
  - `Header.tsx`: Brand logotipi, desktop menyu, mobil gamburger, qidiruv paneli ochuvchi tugma, savat/sevimlilar hisoblagichlari.
  - `MobileNav.tsx`: Mobil pastki navigatsiya (Home, Catalog, Cart, Account).
  - `Footer.tsx`: Newsletter, havolalar, brand falsafasi.
- [ ] **4.2. Sahifa Seksiyalari (`src/components/sections/`)**:
  - `HeroSection.tsx`: "O‘zingning afsonangni yarat" — asimmetrik tipografiya, animatsiyalangan bottle art, yoritish effektlari.
  - `NewCollectionBento.tsx`: Hallmark Bento Grid uslubidagi yangi kolleksiya (bitta flagman katta karta, ikkita vertikal nafis karta).
  - `CatalogSection.tsx`: Bo‘limlar bo‘yicha filtr (Atirlar, Tana parvarishi, Dezodorantlar), jins filtri, narx bo‘yicha tartiblash.
  - `ReviewsSection.tsx`: Tasdiqlangan mijozlar fikrlari va yangi sharh qoldirish formasi.
- [ ] **4.3. Do‘kon Funktsionallik Komponentlari (`src/components/commerce/`)**:
  - `ProductCard.tsx`: Hover micro-interactions, sevimliga qo‘shish (Heart toggle), tezkor ko‘rish.
  - `ProductModal.tsx`: Mahsulot haqida batafsil ma'lumot, notalar piramidasi (Yuqori, Yurak, Baza), hajm tanlash (30ml, 50ml, 100ml).
  - `CartDrawer.tsx`: Savat paneli, promo-kod kiritish, etkazib berish kalkulyatori, Buyurtmaga o‘tish tugmasi.
  - `CheckoutModal.tsx`: To‘lov va yetkazib berish formasi (telefon raqam formati, viloyat/manzil, to‘lov usuli: Naqd, Karta, Payme/Click).
  - `WishlistDrawer.tsx`: Saqlangan xaridlar ro‘yxati.
  - `TrackOrderModal.tsx`: Buyurtma kodi (`NOX-XXXXXX`) orqali holatni tekshirish.

---

## ⚙️ 5-BOSQICH: Holat Boshqaruvi (State Management)

- [ ] **5.1. Zustand Do‘konlari (`src/store/`)**:
  - `useCartStore.ts`: Savatga qo‘shish, sonini o‘zgartirish, o‘chirish, promo-kod qo‘llash va `localStorage` ga avto-sinxronizatsiya.
  - `useWishlistStore.ts`: Mahsulotlarni sevimlilar ro‘yxatiga olish va saqlash.
  - `useUIStore.ts`: Modallar holati (Cart open, Search open, Modal open, Mobile nav open).
- [ ] **5.2. Toast & Bildirishnoma tizimi**:
  - `Toast.tsx`: Harakatlar (savatga qo‘shildi, xatolik, buyurtma qabul qilindi) bo‘yicha nafis oltin bildirishnomalar.

---

## 🛡️ 6-BOSQICH: Admin Panelini Next.js ga Ko‘chirish (`/admin`)

- [ ] **6.1. Admin Auth & Himoyalangan Marshrut**:
  - `src/app/admin/layout.tsx`: Supabase sessiyasini tekshiruvchi himoyalangan qobiq.
  - `src/app/admin/login/page.tsx`: Admin kirish formasi.
- [ ] **6.2. Admin Dashboard Boshqaruvi**:
  - `StatsCards.tsx`: Bugungi buyurtmalar, tushum, kam qolgan tovarlar.
  - `ProductsManager.tsx`: Yangi mahsulot qo‘shish, narx/stokni tahrirlash, o‘chirish.
  - `OrdersManager.tsx`: Tushgan buyurtmalar holatini yangilash (Jarayonda, Yetkazildi, Bekor qilindi).
  - `InventoryAlerts.tsx`: Stok kamayishi bo‘yicha nazorat.

---

## 🚀 7-BOSQICH: GitHub Pages Deploy & CI/CD Pipeline

- [ ] **7.1. Statik Build va Eksport Sinovi**:
  - `npm run build` orqali `out/` katalogini shakllantirish.
  - Har bir marshrut `.html` sifatida to‘g‘ri generatsiya qilinganligini tekshirish.
- [ ] **7.2. GitHub Actions Workflow yaratish**:
  - `.github/workflows/deploy.yml` faylini sozlash (avtomatik build va GitHub Pages ga yuklash).
- [ ] **7.3. 404 va BasePath tekshiruvi**:
  - `https://<username>.github.io/noxar-parfum/` manzilida shriftlar, rasmlar va CSS fayllarning 404 siz toza yuklanishini ta'minlash.

---

## 🔍 8-BOSQICH: Hallmark Sifat Nazorati (Audit va Verification)

- [ ] **8.1. Sloplint Tekshiruvlari**:
  - [ ] Barcha ranglar `--surface-*` va `--gold-*` tokenlariga tayanganmi?
  - [ ] Shriftlar `Playfair Display` va `DM Sans` chegarasida to‘g‘ri ierarxiyadami?
  - [ ] Tugmalar va havolalar mobilda qator buzilishiga (wrap glitch) uchramayaptimi?
  - [ ] Animatsiyalar va o‘tishlar silliq va ortiqcha shovqinsizmi?
- [ ] **8.2. Ishlash tezligi va Lighthouse ko‘rsatkichlari**:
  - LCP < 1.5s, CLS = 0, FCP < 1.0s.
  - Accessibility (a11y) ARIA atributlari to‘liqligi.

---

## 📅 Amalga Oshirish Ketma-Ketligi Jadvali

| Qadam | Vazifa guruhi | Asosiy Fayllar / Natijalar |
|---|---|---|
| **Step 1** | Next.js o‘rnatish & konfiguratsiya | `package.json`, `next.config.mjs`, `tsconfig.json` |
| **Step 2** | Hallmark Tokenlar & CSS arxitekturasi | `globals.css`, `tailwind.config.ts`, `BottleArt.tsx` |
| **Step 3** | Supabase client & Types | `src/lib/supabase.ts`, `src/types/database.ts` |
| **Step 4** | State Management (Cart, Wishlist) | `useCartStore.ts`, `useWishlistStore.ts` |
| **Step 5** | Core UI & Do‘kon seksiyalari | `Header.tsx`, `HeroSection.tsx`, `Catalog.tsx` |
| **Step 6** | Savat, Buyurtma & Modallar | `CartDrawer.tsx`, `CheckoutModal.tsx`, `ProductModal.tsx` |
| **Step 7** | Admin Panel sahifalari | `src/app/admin/*` |
| **Step 8** | GitHub Pages build & deploy | `deploy.yml`, `out/`, production sinovi |
