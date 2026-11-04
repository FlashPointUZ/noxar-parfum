'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { initialProducts } from '@/lib/data/products';
import { BottleArt } from '@/components/ui/BottleArt';
import { Search, X, ArrowUpRight } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setSearchOpen, setSelectedProduct } = useUIStore();
  const [query, setQuery] = useState('');

  if (!isSearchOpen) return null;

  const filtered = query.trim()
    ? initialProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.toLowerCase().includes(query.toLowerCase()) ||
          p.notes.toLowerCase().includes(query.toLowerCase())
      )
    : initialProducts.slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      {/* Backdrop */}
      <div onClick={() => setSearchOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative w-full max-w-lg bg-surface-1 rounded-2xl border border-border-hairline p-6 z-10 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border-hairline pb-4 mb-4">
          <Search className="w-5 h-5 text-gold-primary" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Atir nomi, brend yoki notalar bo‘yicha qidirish..."
            className="w-full bg-transparent text-text-main text-sm outline-none placeholder:text-text-muted"
          />
          <button
            type="button"
            onClick={() => setSearchOpen(false)}
            className="p-1 rounded-lg text-text-muted hover:text-text-main"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <span className="text-[10px] uppercase tracking-wider text-text-muted block mb-3 font-medium">
            {query.trim() ? `Natijalar (${filtered.length})` : 'Mashhur qidiruvlar'}
          </span>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {filtered.map((product) => (
              <div
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  setSearchOpen(false);
                }}
                className="p-3 rounded-xl hover:bg-surface-2 border border-transparent hover:border-border-hairline cursor-pointer flex items-center justify-between transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-12 bg-surface-2 rounded flex items-center justify-center flex-shrink-0">
                    <BottleArt art={product.art} size="sm" className="scale-50" />
                  </div>
                  <div>
                    <h4 className="font-serif text-sm text-text-main group-hover:text-gold-primary transition-colors">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-text-muted truncate max-w-xs">{product.notes}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-serif font-medium text-gold-primary">{product.price}</span>
                  <ArrowUpRight className="w-4 h-4 text-text-muted group-hover:text-gold-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
