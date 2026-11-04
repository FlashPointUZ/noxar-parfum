'use client';

import React from 'react';
import { Product } from '@/types/database';
import { BottleArt } from '@/components/ui/BottleArt';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useUIStore } from '@/store/useUIStore';
import { Heart, ShoppingBag, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();
  const { setSelectedProduct } = useUIStore();

  const isFavorite = isWishlisted(product.id);

  return (
    <div className="group bg-surface-1 rounded-2xl border border-border-hairline hover:border-gold-primary/40 flex flex-col justify-between overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-gold-primary/5">
      {/* Rasm yoki Bottle Art qismi */}
      <div className="relative h-64 sm:h-72 bg-surface-2/40 flex items-center justify-center p-6 overflow-hidden">
        {/* Badjlar */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {product.badge && (
            <span className="px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-semibold bg-gold-primary/15 text-gold-primary border border-gold-primary/30">
              {product.badge}
            </span>
          )}
          {product.discount && (
            <span className="px-2.5 py-1 rounded-full text-[9px] uppercase tracking-wider font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Wishlist tugmasi */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id)}
          className={`absolute top-3 right-3 p-2 rounded-full border transition-all z-10 ${
            isFavorite
              ? 'bg-gold-primary text-black border-gold-primary'
              : 'bg-surface-1/80 border-border-hairline text-text-muted hover:text-gold-primary hover:border-gold-primary/40'
          }`}
          aria-label="Sevimlilarga qo‘shish"
        >
          <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Flakon san'ati yoki Yuklangan rasm */}
        <div
          onClick={() => setSelectedProduct(product)}
          className="cursor-pointer transition-transform duration-500 group-hover:scale-105 flex items-center justify-center w-full h-full"
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="max-h-52 object-contain drop-shadow-md"
            />
          ) : (
            <BottleArt art={product.art} size="md" />
          )}
        </div>
      </div>

      {/* Ma'lumot qismi */}
      <div className="p-5 flex flex-col flex-1 justify-between">
        <div>
          <span className="text-[10px] tracking-[0.2em] uppercase text-text-muted font-medium block">
            {product.brand}
          </span>
          <h3
            onClick={() => setSelectedProduct(product)}
            className="font-serif text-lg text-text-main mt-0.5 cursor-pointer hover:text-gold-primary transition-colors line-clamp-1"
          >
            {product.name}
          </h3>
          <p className="text-xs text-text-muted mt-1 line-clamp-1">{product.notes}</p>
        </div>

        <div className="pt-4 mt-4 border-t border-border-hairline flex items-center justify-between">
          <div>
            <span className="text-sm sm:text-base font-serif font-medium text-gold-primary">
              {product.price}
            </span>
          </div>

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedProduct(product)}
              className="p-2 rounded-lg border border-border-hairline hover:border-gold-primary/40 hover:bg-surface-2 text-text-muted hover:text-text-main transition-colors"
              title="Batafsil ko‘rish"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => addItem(product)}
              className="px-3 py-2 rounded-lg bg-gold-primary hover:bg-gold-light text-black text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all"
              title="Savatga qo‘shish"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Olish</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
