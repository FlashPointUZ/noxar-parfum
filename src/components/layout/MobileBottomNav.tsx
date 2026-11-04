'use client';

import React from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useUIStore } from '@/store/useUIStore';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Home, Compass, ShoppingBag, Heart, User, Sun, Moon } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const { items: cart } = useCartStore();
  const { items: wishlist } = useWishlistStore();
  const { setCartOpen, setWishlistOpen, setAuthOpen } = useUIStore();
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface-0/95 backdrop-blur-lg border-t border-border-hairline h-16 flex items-center justify-around px-1">
      <a
        href="#home"
        className="flex flex-col items-center gap-1 text-[10px] text-text-muted hover:text-gold-primary transition-colors py-1"
      >
        <Home className="w-4 h-4" />
        <span>Bosh sahifa</span>
      </a>

      <a
        href="#catalog"
        className="flex flex-col items-center gap-1 text-[10px] text-text-muted hover:text-gold-primary transition-colors py-1"
      >
        <Compass className="w-4 h-4" />
        <span>Katalog</span>
      </a>

      {/* Savat */}
      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="relative flex flex-col items-center gap-1 text-[10px] text-text-muted hover:text-gold-primary transition-colors py-1"
      >
        <ShoppingBag className="w-4 h-4" />
        <span>Savat</span>
        {totalCartCount > 0 && (
          <span className="absolute top-0 right-1 w-3.5 h-3.5 rounded-full bg-gold-primary text-black font-bold text-[8px] flex items-center justify-center">
            {totalCartCount}
          </span>
        )}
      </button>

      {/* Sevimlilar */}
      <button
        type="button"
        onClick={() => setWishlistOpen(true)}
        className="relative flex flex-col items-center gap-1 text-[10px] text-text-muted hover:text-gold-primary transition-colors py-1"
      >
        <Heart className="w-4 h-4" />
        <span>Sevimlilar</span>
        {wishlist.length > 0 && (
          <span className="absolute top-0 right-2 w-3.5 h-3.5 rounded-full bg-gold-primary text-black font-bold text-[8px] flex items-center justify-center">
            {wishlist.length}
          </span>
        )}
      </button>

      {/* Shaxsiy Kabinet */}
      <button
        type="button"
        onClick={() => setAuthOpen(true)}
        className="flex flex-col items-center gap-1 text-[10px] text-text-muted hover:text-gold-primary transition-colors py-1"
      >
        <User className={`w-4 h-4 ${user ? 'text-gold-primary' : ''}`} />
        <span>{user ? 'Kabinet' : 'Kirish'}</span>
      </button>

      {/* Dark / Light Toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="flex flex-col items-center gap-1 text-[10px] text-text-muted hover:text-gold-primary transition-colors py-1"
        aria-label="Mavzuni almashtirish"
      >
        {theme === 'dark' ? <Sun className="w-4 h-4 text-gold-light" /> : <Moon className="w-4 h-4" />}
        <span>{theme === 'dark' ? 'Yorug‘' : 'Qorong‘i'}</span>
      </button>
    </nav>
  );
};
