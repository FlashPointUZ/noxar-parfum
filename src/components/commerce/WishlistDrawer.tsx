'use client';

import React from 'react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';
import { initialProducts } from '@/lib/data/products';
import { BottleArt } from '@/components/ui/BottleArt';
import { X, Heart, Trash2, ShoppingBag } from 'lucide-react';

export const WishlistDrawer: React.FC = () => {
  const { items: wishlistIds, toggleWishlist } = useWishlistStore();
  const { addItem } = useCartStore();
  const { isWishlistOpen, setWishlistOpen, setSelectedProduct } = useUIStore();

  if (!isWishlistOpen) return null;

  const wishlistedProducts = initialProducts.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setWishlistOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-surface-1 border-l border-border-hairline h-full flex flex-col justify-between z-10 shadow-2xl">
        <div className="p-6 border-b border-border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-gold-primary fill-current" />
            <h2 className="font-serif text-xl text-text-main">Sevimlilar</h2>
            <span className="text-xs text-text-muted">({wishlistedProducts.length})</span>
          </div>
          <button
            type="button"
            onClick={() => setWishlistOpen(false)}
            className="p-1.5 rounded-full text-text-muted hover:text-text-main hover:bg-surface-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {wishlistedProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center text-text-muted">
                <Heart className="w-8 h-8 text-gold-primary/40" />
              </div>
              <h3 className="font-serif text-lg text-text-main">Hozircha bo‘sh</h3>
              <p className="text-xs text-text-muted max-w-xs font-light">
                Yoqqan hidlaringizni yurak tugmasi orqali shu yerda saqlang.
              </p>
            </div>
          ) : (
            wishlistedProducts.map((product) => (
              <div
                key={product.id}
                className="p-4 rounded-xl bg-surface-2/60 border border-border-hairline flex items-center gap-4"
              >
                <div
                  onClick={() => {
                    setSelectedProduct(product);
                    setWishlistOpen(false);
                  }}
                  className="w-16 h-20 bg-surface-1 rounded-lg border border-border-hairline flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden p-1"
                >
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                  ) : (
                    <BottleArt art={product.art} size="sm" className="scale-75" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <span className="text-[10px] tracking-wider text-text-muted uppercase block">{product.brand}</span>
                  <h4 className="font-serif text-sm text-text-main truncate">{product.name}</h4>
                  <span className="text-xs font-semibold text-gold-primary mt-1 block">{product.price}</span>

                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        addItem(product);
                        toggleWishlist(product.id);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-gold-primary hover:bg-gold-light text-black text-[11px] font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>Savatga</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className="p-2 text-text-muted hover:text-red-400 transition-colors"
                  title="O‘chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
