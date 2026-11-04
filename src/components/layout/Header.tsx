'use client';

import React from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useUIStore } from '@/store/useUIStore';
import { useThemeStore } from '@/store/useThemeStore';
import { Search, Heart, ShoppingBag, Sun, Moon, MapPin } from 'lucide-react';

export const Header: React.FC = () => {
  const { items } = useCartStore();
  const { items: wishlist } = useWishlistStore();
  const { setCartOpen, setWishlistOpen, setSearchOpen } = useUIStore();
  const { theme, toggleTheme } = useThemeStore();

  const totalCartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const openLocation = () => {
    const address = 'Bekbaraka bozori, 12-qator, 2-blok, 472-magazin yonida';
    const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=Bekbaraka+bozori+12-qator+2-blok+472-magazin';
    const message = `Assalomu alaykum. NOXAR PARFUM do‘koni manzili:\n${address}\n\nXaritada: ${mapsUrl}`;
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(mapsUrl)}&text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <header className="sticky top-0 z-40 bg-surface-0/90 backdrop-blur-md border-b border-border-hairline transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a href="#home" className="flex items-center gap-3 group">
          <div className="w-9 h-10 border border-gold-primary/70 flex items-center justify-center font-serif text-xl text-gold-primary font-bold transition-transform group-hover:scale-105">
            N
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg tracking-[0.2em] font-semibold text-text-main leading-none">
              NOXAR
            </span>
            <span className="text-[8px] tracking-[0.35em] text-gold-primary uppercase font-sans mt-0.5">
              PARFUM
            </span>
          </div>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-[0.18em] text-text-muted">
          <a href="#new" className="hover:text-gold-primary transition-colors">
            Yangi Kolleksiya
          </a>
          <a href="#catalog" className="hover:text-gold-primary transition-colors">
            Katalog
          </a>
          <a href="#about" className="hover:text-gold-primary transition-colors">
            Biz Haqimizda
          </a>
          <a href="#reviews" className="hover:text-gold-primary transition-colors">
            Fikrlar
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Manzil */}
          <button
            type="button"
            onClick={openLocation}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider text-text-muted hover:text-gold-primary border border-border-hairline rounded-full transition-all"
            title="Do‘kon manzilini xaritada ko‘rish"
          >
            <MapPin className="w-3.5 h-3.5 text-gold-primary" />
            <span>Manzil</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full text-text-muted hover:text-gold-primary hover:bg-surface-2 transition-all"
            aria-label="Mavzuni almashtirish"
            title={theme === 'dark' ? 'Yorug‘ rejimga o‘tish' : 'Qorong‘i rejimga o‘tish'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-gold-light" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Qidiruv */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="p-2 rounded-full text-text-muted hover:text-gold-primary hover:bg-surface-2 transition-all"
            aria-label="Qidiruv"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Sevimlilar */}
          <button
            type="button"
            onClick={() => setWishlistOpen(true)}
            className="relative p-2 rounded-full text-text-muted hover:text-gold-primary hover:bg-surface-2 transition-all"
            aria-label="Sevimlilar ro‘yxati"
          >
            <Heart className="w-4 h-4" />
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-gold-primary text-[9px] font-bold text-black flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Savat */}
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 px-3.5 py-2 rounded-full border border-gold-primary/40 bg-gold-primary/5 hover:bg-gold-primary/10 text-gold-primary text-xs uppercase tracking-wider transition-all font-medium"
            aria-label="Savat"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Savat</span>
            {totalCartCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gold-primary text-[10px] font-bold text-black leading-none">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
