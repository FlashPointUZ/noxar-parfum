'use client';

import React from 'react';
import { initialProducts } from '@/lib/data/products';
import { BottleArt } from '@/components/ui/BottleArt';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';
import { ShoppingBag, Eye, ArrowUpRight } from 'lucide-react';

export const NewCollectionBento: React.FC = () => {
  const { addItem } = useCartStore();
  const { setSelectedProduct } = useUIStore();

  const featured = initialProducts[0]; // Obsidian
  const second = initialProducts[1]; // Santal
  const third = initialProducts[2]; // Eclat

  return (
    <section id="new" className="py-20 lg:py-28 border-b border-border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold-primary block mb-2 font-medium">
              Tanlangan
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text-main">
              Yangi <span className="italic text-gold-light">kolleksiya</span>
            </h2>
          </div>
          <a
            href="#catalog"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold-primary hover:text-gold-light transition-colors pb-1 border-b border-gold-primary/30 self-start md:self-auto"
          >
            <span>Barcha atirlarni ko‘rish</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        {/* Bento Grid Layout (Hallmark Pattern) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Flagman Mahsulot: Katta Bento Karta (8 ustun) */}
          <div className="lg:col-span-7 bg-surface-1 rounded-2xl border border-border-hairline p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden group hover:border-gold-primary/40 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold bg-gold-primary/10 text-gold-primary border border-gold-primary/20">
                {featured.badge || 'Flagman'}
              </span>
              <span className="font-serif text-2xl font-light text-gold-primary/40">01</span>
            </div>

            <div className="my-8 flex justify-center items-center py-6">
              <BottleArt art={featured.art} size="lg" className="transition-transform duration-500 group-hover:scale-105" />
            </div>

            <div>
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border-hairline pt-6">
                <div>
                  <span className="text-[11px] tracking-widest text-text-muted uppercase block">{featured.brand}</span>
                  <h3 className="font-serif text-2xl text-text-main mt-0.5">{featured.name}</h3>
                  <p className="text-xs text-text-muted mt-1">{featured.notes}</p>
                </div>
                <div className="text-right">
                  <span className="text-lg font-serif font-medium text-gold-primary">{featured.price}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => addItem(featured)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gold-primary hover:bg-gold-light text-black text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-gold-primary/10"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Savatga</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(featured)}
                  className="p-3 rounded-xl border border-border-hairline hover:border-gold-primary/40 hover:bg-surface-2 text-text-muted hover:text-text-main transition-all"
                  aria-label="Tafsilotlar"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* O'ng tomon: Ikkita vertikal Bento Karta (5 ustun) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* 2-Mahsulot (Santal) */}
            <div className="flex-1 bg-surface-1 rounded-2xl border border-border-hairline p-6 flex flex-col justify-between group hover:border-gold-primary/40 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] tracking-widest text-text-muted uppercase block">{second.brand}</span>
                  <h4 className="font-serif text-xl text-text-main mt-0.5">{second.name}</h4>
                  <p className="text-xs text-text-muted mt-1">{second.notes}</p>
                  <span className="text-sm font-serif font-medium text-gold-primary block mt-2">{second.price}</span>
                </div>
                <BottleArt art={second.art} size="sm" className="transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border-hairline">
                <button
                  type="button"
                  onClick={() => addItem(second)}
                  className="flex-1 py-2 px-3 rounded-lg bg-surface-2 hover:bg-gold-primary hover:text-black text-xs text-text-main tracking-wider uppercase transition-colors"
                >
                  Savatga olish
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(second)}
                  className="p-2 rounded-lg border border-border-hairline hover:text-gold-primary text-text-muted transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 3-Mahsulot (Eclat) */}
            <div className="flex-1 bg-surface-1 rounded-2xl border border-border-hairline p-6 flex flex-col justify-between group hover:border-gold-primary/40 transition-all duration-300">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] tracking-widest text-text-muted uppercase block">{third.brand}</span>
                  <h4 className="font-serif text-xl text-text-main mt-0.5">{third.name}</h4>
                  <p className="text-xs text-text-muted mt-1">{third.notes}</p>
                  <span className="text-sm font-serif font-medium text-gold-primary block mt-2">{third.price}</span>
                </div>
                <BottleArt art={third.art} size="sm" className="transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-border-hairline">
                <button
                  type="button"
                  onClick={() => addItem(third)}
                  className="flex-1 py-2 px-3 rounded-lg bg-surface-2 hover:bg-gold-primary hover:text-black text-xs text-text-main tracking-wider uppercase transition-colors"
                >
                  Savatga olish
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedProduct(third)}
                  className="p-2 rounded-lg border border-border-hairline hover:text-gold-primary text-text-muted transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
