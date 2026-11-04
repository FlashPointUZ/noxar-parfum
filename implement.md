# NOXAR PARFUM — Implementatsiya Rejasi

## 📋 Loyihaning Hozirgi Holati

**Texnologiyalar:** Vanilla HTML + CSS + JS (statik loyiha)  
**Backend:** Supabase (REST API orqali direct fetch)  
**Hosting:** GitHub Pages compatible (statik fayllar)  
**Admin:** Alohida `admin.html` sahifasi  
**Fayl tuzilishi:** Flat — barcha fayllar root da

### Mavjud Fayllar
```
noxar-parfum/
├── index.html              # Asosiy do'kon sahifasi
├── style.css               # Barcha stillar (minified)
├── script.js               # Barcha JS (1400+ qator)
├── supabase-config.js      # Supabase REST client
├── admin.html              # Admin panel
├── admin.css               # Admin stillar
├── admin.js                # Admin logikasi
├── product.html            # Mahsulot detail sahifasi
├── product-detail.css      # Mahsulot detail stillar
├── product-detail.js       # Mahsulot detail logikasi
├── sw.js                   # Service Worker (PWA)
├── manifest.webmanifest    # PWA manifest
├── README.md
└── *.sql                   # Supabase policy/schema fayllar
```

---

## 🎨 Hallmark Dizayn Prinsiplari (Nutlope/hallmark asosida)

Hallmark — AI tomonidan yaratilgan sifatsiz, shablon-based veb-dizaynlarning ("AI slop") oldini oluvchi framework. U **4 ta rejimda** ishlaydi: `build`, `audit`, `redesign`, `study`. ~48 ta tema, 21 ta macrostructure va avtomatik `sloplint` quality gate'lari mavjud.

### 1. NOXAR AUDIT — Hallmark Prinsiplari bo'yicha Baholash

| Hallmark Anti-Pattern | NOXAR Holati | Ball |
|---|---|---|
| **Purple-Gradient Hero** | ✅ Yo'q — radial-gradient faqat subtle amber tonlarda | 10/10 |
| **Gradient Headline** | ✅ Yo'q — solid ranglar, `background-clip:text` yo'q | 10/10 |
| **Side-Stripe Card** | ✅ Yo'q — hairline border yoki bordersiz | 10/10 |
| **Inter-Everywhere** | ✅ Yo'q — Playfair Display + DM Sans juftligi | 10/10 |
| **3-Column Feature Grid** | ⚠️ Product grid 3-ustunli, lekin badge/art bilan variatsiya bor | 7/10 |
| **Card-in-Card** | ✅ Yo'q — bitta containment layer | 10/10 |
| **Eyebrow-Above-Every-Heading** | ⚠️ Ko'p joyda `.eyebrow` ishlatilgan — Hallmark "kamdan-kam" deydi | 6/10 |
| **One-Colored-Word** | ⚠️ `<i>` taglar bilan gold rang berilgan so'zlar bor | 6/10 |
| **Invented Metrics** | ✅ Yo'q — real mahsulot ma'lumotlari | 10/10 |
| **Full-Viewport Centered Hero** | ✅ Yo'q — hero chapda copy, o'ngda art, asymmetrik | 10/10 |
| **Pure Black/White** | ✅ Yo'q — `#0d0d0d`, `#f5f1e8` subtil tonlar | 10/10 |
| **Fake Testimonials** | ⚠️ Demo sharhlar bor | 5/10 |
| **No Inline Hex Codes** | ⚠️ CSS da ko'p inline hex ranglar (`#493822`, `#1f1a15` va h.k.) | 4/10 |

**Umumiy Hallmark Ball: 8.3/10** — NOXAR loyihasi allaqachon yuqori sifatli dizaynga ega.

### 2. Hallmark Structural Diversity (Macrostructures)

NOXAR hozirgi sahifa **"Marquee Hero"** macrostructure ishlatadi. Next.js ga o'tganda qo'shimcha sahifalar uchun boshqa strukturalar ishlatish kerak:

| Sahifa | Tavsiya Etilgan Macrostructure |
|---|---|
| Bosh sahifa | **Marquee Hero** → aynan hozirgi kabi ✅ |
| Mahsulot katalog | **Workbench** — real mahsulot rasmlar + filtr paneli |
| Mahsulot detail | **Long Document** — chuqur tavsif + sharh + o'xshash |
| Admin dashboard | **Stat-Led** — asosiy metrika bilan boshlanadi |
| Haqimizda | **Manifesto** — brand hikoyasi |
| Blog/yangiliklar | **Conversational FAQ** yoki **Specimen** |

### 3. Vizual Identifikatsiya va Token Tizimi

Hallmark talabi: **Har bir rang/shrift declared token blockda bo'lishi kerak**

```css
:root {
  /* PRIMARY — brand gold spectrum */
  --gold: #c9a35b;
  --gold-light: #e4c27a;
  --gold-dim: #b6915066;
  
  /* SURFACE — depth layers (eng qora → eng och) */
  --surface-0: #0d0d0d;     /* body bg */
  --surface-1: #171513;     /* ink / card bg */
  --surface-2: #1a1816;     /* testimonial bg */
  --surface-3: #1d1915;     /* contact bg */
  --surface-4: #23201c;     /* search panel bg */
  --surface-5: #24211d;     /* announcement bg */
  
  /* TEXT */
  --text-primary: #f5f1e8;  /* cream — asosiy matn */
  --text-muted: #a9a39a;    /* ikkinchi darajali */
  --text-dim: #6f6962;      /* footer / hint */
  
  /* ACCENT */
  --accent-warm: #493822;   /* hero glow */
  --accent-rose: #eac1b6;   /* ayollar palitra */
  --accent-sand: #f9eee0;   /* neutral / cream art */
  
  /* BORDER */
  --line: rgba(245, 241, 232, 0.14);
  --line-gold: rgba(198, 160, 91, 0.5);
  
  /* TYPOGRAPHY */
  --serif: "Playfair Display", Georgia, serif;
  --sans: "DM Sans", Arial, sans-serif;
}
```

### 4. Anti-Slop Qoidalar — NOXAR uchun

#### ✅ Allaqachon To'g'ri
- Brand-ga mos CSS art bottles (stock photo'siz)
- Asymmetrik hero layout
- Real mahsulot nomi, narxi, tarkibi
- Micro-interactions (reveal animatsiyalar, hover effects)
- `prefers-reduced-motion` qo'llab-quvvatlash
- Surface depth — qora rangning turli tonlari
- Shrift juftligi (display + body)

#### ⚠️ Yaxshilash Kerak
1. **Inline hex ranglar** → barcha ranglarni CSS token blockga ko'chirish
2. **Eyebrow labels** → kamroq joyda ishlatish (faqat asosiy seksiya sarlavhalarida)
3. **Gold italic so'zlar** → faqat 1-2 ta muhim joyda ishlatish, har bir h2 da emas
4. **Demo sharhlar** → Supabase dan real sharhlar yoki "hali sharh yo'q" ko'rsatish
5. **Product grid** → 3-ustun o'rniga turli katta/kichik card'lar aralash (bento grid)

### 5. Hallmark Quality Gates (sloplint)

Next.js ga o'tganda quyidagi testlarni amalga oshirish kerak:
- [ ] Barcha ranglar `:root` tokenlardan olinganmi?
- [ ] Hero viewport'ni to'liq to'ldirmaydimi (min-height, lekin centered emas)?
- [ ] CTA va nav linklar kichik ekranda 2 qatorga tushmaydimi?
- [ ] `overflow-x: clip` ishlatilganmi (`hidden` emas)?
- [ ] Forma "rahmat" xabari backend wiring'siz ko'rinmaydimi?
- [ ] Har bir sahifa boshqa macrostructure ishlatadimi?

---

## 🚀 BOSQICH 1: GitHub Pages uchun Optimizatsiya

### Hozirgi holat
NOXAR allaqachon GitHub Pages bilan ishlaydi — barcha fayllar statik. Quyidagilarni qilish kerak:

### Vazifalar

#### 1.1 Repository sozlash
```bash
# GitHub Pages ni yoqish
# Settings > Pages > Source: Deploy from branch > main > / (root)
```

#### 1.2 Base URL to'g'rilash
`index.html` dagi barcha linklar relative bo'lishi kerak (allaqachon ✅):
```html
<link rel="stylesheet" href="style.css">
<script src="supabase-config.js"></script>
<script src="script.js"></script>
```

#### 1.3 404 sahifa qo'shish
```html
<!-- 404.html -->
<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=/">
  <title>NOXAR PARFUM</title>
</head>
<body>
  <script>window.location.href = '/';</script>
</body>
</html>
```

#### 1.4 `.nojekyll` fayl qo'shish
```bash
touch .nojekyll
```
Bu GitHub Pages'da Jekyll protsessingni o'chiradi.

#### 1.5 CNAME (ixtiyoriy)
Agar custom domain kerak bo'lsa:
```
noxar-parfum.uz
```

---

## 🗄️ BOSQICH 2: Supabase Integratsiyasi

### Hozirgi Supabase Config
```javascript
// supabase-config.js
const NOXAR_SUPABASE_URL = 'https://pcjrtdrqzaclctkbndqe.supabase.co';
const NOXAR_SUPABASE_KEY = 'sb_publishable_FrPtkLWvyuIlyDYX7Z-kdQ_jNB4I8xd';
```

### 2.1 Supabase Database Schema

#### `products` table
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  brand TEXT DEFAULT 'NOXAR',
  price NUMERIC NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'atirlar',
  gender TEXT DEFAULT 'unisex',
  image TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `orders` table
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  items JSONB NOT NULL,
  total NUMERIC NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  payment_status TEXT DEFAULT 'pending',
  order_status TEXT DEFAULT 'processing',
  shipping_method TEXT DEFAULT 'standart',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `reviews` table
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id TEXT NOT NULL,
  reviewer TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### `reservations` table
```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  request_type TEXT DEFAULT 'reservation',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 Row Level Security (RLS)

```sql
-- Products: hamma o'qiy oladi, faqat admin yoza oladi
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products read" ON products FOR SELECT USING (true);
CREATE POLICY "Products admin" ON products FOR ALL
  USING (auth.role() = 'authenticated');

-- Orders: authenticated users faqat o'zining buyurtmalarini ko'radi
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Orders insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Orders admin" ON orders FOR ALL
  USING (auth.role() = 'authenticated');

-- Reviews: hamma o'qiy oladi, hamma yoza oladi
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews read" ON reviews FOR SELECT USING (true);
CREATE POLICY "Reviews insert" ON reviews FOR INSERT WITH CHECK (true);
```

### 2.3 Supabase Auth
Hozirgi tizim email/password auth ishlatadi:
- **Admin kirish:** `noxarAuth.signIn(email, password)`
- **Session boshqarish:** localStorage da token saqlash
- **Refresh:** JWT expired bo'lganda avtomatik yangilash

---

## ⚡ BOSQICH 3: Next.js ga Migratsiya

### Nima uchun Next.js?
1. **SSR/SSG** — SEO uchun muhim
2. **App Router** — zamonaviy routing
3. **API Routes** — Supabase bilan xavfsiz aloqa
4. **Image Optimization** — avtomatik
5. **GitHub Pages** yoki **Vercel** da deploy

### 3.1 Yangi Loyiha Tuzilishi

```
noxar-parfum-next/
├── public/
│   ├── manifest.webmanifest
│   └── sw.js
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Bosh sahifa (Hero + Products)
│   │   ├── globals.css             # Global stillar
│   │   ├── products/
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Mahsulot detail
│   │   ├── admin/
│   │   │   ├── layout.tsx          # Admin layout
│   │   │   ├── page.tsx            # Dashboard
│   │   │   ├── products/
│   │   │   │   └── page.tsx        # Mahsulot boshqaruvi
│   │   │   ├── orders/
│   │   │   │   └── page.tsx        # Buyurtmalar
│   │   │   └── customers/
│   │   │       └── page.tsx        # Mijozlar
│   │   └── api/
│   │       ├── products/
│   │       │   └── route.ts        # Products API
│   │       ├── orders/
│   │       │   └── route.ts        # Orders API
│   │       └── auth/
│   │           └── route.ts        # Auth API
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Badge.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── MobileNav.tsx
│   │   │   └── SearchPanel.tsx
│   │   ├── product/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── ProductModal.tsx
│   │   │   └── BottleArt.tsx
│   │   ├── cart/
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── CartItem.tsx
│   │   │   └── CheckoutForm.tsx
│   │   ├── sections/
│   │   │   ├── Hero.tsx
│   │   │   ├── NewCollection.tsx
│   │   │   ├── PopularProducts.tsx
│   │   │   ├── Catalog.tsx
│   │   │   └── Testimonials.tsx
│   │   └── admin/
│   │       ├── Sidebar.tsx
│   │       ├── StatsGrid.tsx
│   │       └── DataTable.tsx
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client
│   │   ├── supabase-server.ts      # Server-side client
│   │   ├── types.ts                # TypeScript types
│   │   └── utils.ts                # Utility functions
│   ├── hooks/
│   │   ├── useCart.ts
│   │   ├── useWishlist.ts
│   │   ├── useProducts.ts
│   │   └── useAuth.ts
│   └── store/
│       └── cartStore.ts            # Zustand yoki Context
├── next.config.js
├── tailwind.config.ts              # Ixtiyoriy — yoki CSS modules
├── package.json
└── tsconfig.json
```

### 3.2 Supabase Client Setup (Next.js)

```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

```typescript
// src/lib/types.ts
export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  description: string;
  category: string;
  gender: 'erkaklar' | 'ayollar' | 'unisex';
  image?: string;
  stock: number;
  created_at: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  payment_method: string;
  payment_status: 'pending' | 'paid';
  order_status: 'processing' | 'delivered' | 'cancelled';
  shipping_method: string;
  created_at: string;
}
```

### 3.3 Environment Variables
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://pcjrtdrqzaclctkbndqe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_FrPtkLWvyuIlyDYX7Z-kdQ_jNB4I8xd
```

### 3.4 Dizayn Tizimi (Hallmark Stilida)

CSS Variables ni saqlash — NOXAR ning mavjud dizayn tili mukammal:
```css
:root {
  /* Colors */
  --black: #0d0d0d;
  --ink: #171513;
  --gold: #c9a35b;
  --gold-light: #e4c27a;
  --cream: #f5f1e8;
  --muted: #a9a39a;
  --line: rgba(245, 241, 232, 0.14);
  
  /* Typography */
  --serif: "Playfair Display", Georgia, serif;
  --sans: "DM Sans", Arial, sans-serif;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 32px;
  --space-xl: 64px;
  --space-2xl: 120px;
  
  /* Layout */
  --container-padding: 11vw;
  --header-height: 85px;
}
```

### 3.5 GitHub Pages uchun Next.js Export

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',      // Statik eksport
  images: {
    unoptimized: true,    // GitHub Pages uchun
  },
  basePath: '/noxar-parfum', // Repo nomi
  trailingSlash: true,
};

module.exports = nextConfig;
```

```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "export": "next build",
    "deploy": "next build && touch out/.nojekyll && gh-pages -d out -t true"
  }
}
```

### 3.6 GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: out
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

---

## 🔄 BOSQICH 4: Migratsiya Qadamlari

### 4.1 HTML → React Components Xaritasi

| Mavjud Element | Next.js Component | Turi |
|---|---|---|
| `<header class="site-header">` | `Header.tsx` | Client |
| `<section class="hero">` | `Hero.tsx` | Server |
| `<section class="new-collection">` | `NewCollection.tsx` | Server |
| `<section class="catalog">` | `Catalog.tsx` | Client |
| `<div class="product-modal">` | `ProductModal.tsx` | Client |
| `<aside class="cart-drawer">` | `CartDrawer.tsx` | Client |
| `<aside class="checkout-modal">` | `CheckoutForm.tsx` | Client |
| `<aside class="wishlist-drawer">` | `WishlistDrawer.tsx` | Client |
| `<aside class="account-panel">` | `AccountPanel.tsx` | Client |
| `<footer>` | `Footer.tsx` | Server |
| `admin.html` | `/admin/*` pages | Client |

### 4.2 JavaScript → React Hooks Xaritasi

| Mavjud Funksiya | Hook/Store | Maqsad |
|---|---|---|
| `cartItems`, `updateCart()` | `useCart()` | Cart state management |
| `wishlistItems`, `toggleWishlist()` | `useWishlist()` | Wishlist logic |
| `loadSupabaseProducts()` | `useProducts()` | Supabase data fetching |
| `noxarAuth.signIn()` | `useAuth()` | Authentication |
| `renderCatalog()` | `<Catalog />` state | Filter/sort logic |
| `showToast()` | `useToast()` | Toast notifications |

### 4.3 CSS Migratsiya

**Tavsiya:** CSS Modules yoki vanilla CSS (Tailwind ixtiyoriy)

Sabab: NOXAR ning mavjud CSS dizayni yuqori sifatli va Hallmark prinsipalariga mos. Tailwind qo'shish nomi o'zgartirish kerak emas.

```
src/app/globals.css          → :root variables + base styles
src/components/**/*.module.css → Component-level styles
```

---

## 📱 BOSQICH 5: PWA va Performance

### 5.1 Service Worker (mavjud)
`sw.js` ni saqlab qolish va `next-pwa` paket bilan integratsiya.

### 5.2 Web Vitals Optimizatsiya
- **LCP:** Hero section rasmlarini preload qilish
- **CLS:** Shrift yuklanishida layout shift oldini olish
- **FID:** Heavy JS ni code-split qilish

### 5.3 SEO
```typescript
// src/app/layout.tsx
export const metadata = {
  title: 'NOXAR PARFUM — Sening izing',
  description: 'NOXAR PARFUM — tanlangan premium hidlar olami.',
  openGraph: {
    title: 'NOXAR PARFUM',
    description: 'Premium parfyumeriya do\'koni',
    url: 'https://flashpointuz.github.io/noxar-parfum/',
    siteName: 'NOXAR PARFUM',
    locale: 'uz_UZ',
    type: 'website',
  },
};
```

---

## 📊 Ishlash Tartibi (Priority)

### ✅ Hozir (GitHub Pages + Statik)
1. [x] Repository clone qilish
2. [ ] `.nojekyll` fayl qo'shish
3. [ ] `404.html` qo'shish
4. [ ] GitHub Pages yoqish
5. [ ] Supabase ulanishni tekshirish

### 🔜 Keyingi bosqich (Next.js migratsiya)
1. [ ] Next.js loyiha yaratish (`npx create-next-app@latest`)
2. [ ] CSS variables va stillarni ko'chirish
3. [ ] React componentlarini yaratish
4. [ ] Supabase client o'rnatish (`@supabase/supabase-js`)
5. [ ] Cart/Wishlist state management (Zustand yoki Context)
6. [ ] Admin panel sahifalarini yaratish
7. [ ] `output: 'export'` bilan GitHub Pages deploy
8. [ ] CI/CD pipeline o'rnatish

### 🚀 Kelajak (Kengaytirish)
1. [ ] Vercel deploy (SSR imkoniyati uchun)
2. [ ] Supabase Realtime (live updates)
3. [ ] Supabase Storage (rasm upload)
4. [ ] Payment integration (Payme/Click)
5. [ ] Push notifications
6. [ ] Analytics (Vercel Analytics / Supabase)

---

## 🔧 Muhim Buyruqlar

```bash
# Hozirgi loyihani GitHub Pages ga deploy
git add .
git commit -m "Initial deploy"
git push origin main
# → Settings > Pages > main branch > Save

# Next.js loyiha yaratish
npx create-next-app@latest noxar-parfum-next --typescript --tailwind --app --src-dir

# Supabase o'rnatish
npm install @supabase/supabase-js

# State management
npm install zustand

# Deploy
npm run build
npx gh-pages -d out -t true
```

---

## 📝 Eslatmalar

1. **Supabase kalitlari** — `.env.local` faylda saqlang, hech qachon git ga push qilmang
2. **Hallmark prinsiplari** — har bir component da vizual ierarxiya va whitespace ga e'tibor
3. **Mobile-first** — barcha yangi componentlarni avval mobil uchun yozing
4. **Accessibility** — ARIA labellar va keyboard navigation saqlang (NOXAR allaqachon yaxshi)
5. **D: disk** — barcha fayllarni `d:\AntigravityAI\Aziz-E-commerce\` direktoriyasida ishlang
