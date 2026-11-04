import type { Metadata, Viewport } from 'next';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import { AnnouncementBar } from '@/components/sections/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { CartDrawer } from '@/components/commerce/CartDrawer';
import { WishlistDrawer } from '@/components/commerce/WishlistDrawer';
import { ProductModal } from '@/components/commerce/ProductModal';
import { CheckoutModal } from '@/components/commerce/CheckoutModal';
import { SearchModal } from '@/components/commerce/SearchModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { ContentInitializer } from '@/components/providers/ContentInitializer';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NOXAR PARFUM — Sening izing, sening afsonang',
  description: 'NOXAR PARFUM — Toshkentda tanlangan premium hidlar, original atirlar va tana parvarishi olami.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'NOXAR PARFUM',
    description: 'Premium parfyumeriya do‘koni',
    locale: 'uz_UZ',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#0d0d0d',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className="dark" suppressHydrationWarning>
      <head>
        {/* Dark/Light mode skripti (sahifa yuklanishida miltillashni oldini olish) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const storedTheme = localStorage.getItem('noxar-theme') || 'dark';
                document.documentElement.classList.remove('dark', 'light');
                document.documentElement.classList.add(storedTheme);
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className={`${playfair.variable} ${dmSans.variable} font-sans min-h-screen flex flex-col`}>
        <ContentInitializer />
        <AnnouncementBar />
        <Header />

        <main className="flex-1">{children}</main>

        <Footer />
        <MobileBottomNav />

        {/* Global Modallar va Drawerlar */}
        <CartDrawer />
        <WishlistDrawer />
        <ProductModal />
        <CheckoutModal />
        <SearchModal />
        <AuthModal />
      </body>
    </html>
  );
}
