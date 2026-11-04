'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { BottleArt } from '@/components/ui/BottleArt';
import { X, Heart, ShoppingBag, Sparkles, Check } from 'lucide-react';

export const ProductModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct } = useUIStore();
  const { addItem } = useCartStore();
  const { toggleWishlist, isWishlisted } = useWishlistStore();

  const [selectedVol, setSelectedVol] = useState<string>('50');
  const [activeTab, setActiveTab] = useState<'desc' | 'usage' | 'features'>('desc');

  if (!selectedProduct) return null;

  const isFavorite = isWishlisted(selectedProduct.id);

  const handleAddToCart = () => {
    addItem(selectedProduct, selectedVol);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={() => setSelectedProduct(null)}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-surface-1 rounded-2xl border border-border-hairline p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto shadow-2xl">
        <button
          type="button"
          onClick={() => setSelectedProduct(null)}
          className="absolute top-5 right-5 p-1.5 rounded-full text-text-muted hover:text-text-main hover:bg-surface-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 items-start">
          {/* Chap: Art / Bottle */}
          <div className="sm:col-span-5 bg-surface-2/60 rounded-xl p-8 flex items-center justify-center border border-border-hairline">
            <BottleArt art={selectedProduct.art} size="lg" />
          </div>

          {/* O'ng: Ma'lumot */}
          <div className="sm:col-span-7 space-y-5">
            <div>
              <span className="text-[10px] tracking-[0.25em] text-text-muted uppercase block font-medium">
                {selectedProduct.brand}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-text-main mt-0.5">
                {selectedProduct.name}
              </h2>
              <span className="text-xl font-serif font-semibold text-gold-primary mt-2 block">
                {selectedProduct.price}
              </span>
            </div>

            {/* Notalar piramidasi */}
            <div className="p-3.5 bg-surface-2/80 rounded-xl border border-border-hairline space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted font-medium">Yuqori nota:</span>
                <span className="text-text-main">{selectedProduct.top}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted font-medium">Yurak nota:</span>
                <span className="text-text-main">{selectedProduct.heart}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted font-medium">Baza nota:</span>
                <span className="text-text-main">{selectedProduct.base}</span>
              </div>
            </div>

            {/* Hajm tanlash */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1.5">
                Hajm tanlang
              </label>
              <div className="flex gap-2">
                {['30', '50', '100'].map((vol) => (
                  <button
                    key={vol}
                    type="button"
                    onClick={() => setSelectedVol(vol)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                      selectedVol === vol
                        ? 'bg-gold-primary text-black'
                        : 'bg-surface-2 border border-border-hairline text-text-muted hover:text-text-main'
                    }`}
                  >
                    {vol} ml
                  </button>
                ))}
              </div>
            </div>

            {/* Tabs */}
            <div>
              <div className="flex gap-4 border-b border-border-hairline pb-2 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab('desc')}
                  className={`pb-1 transition-colors uppercase tracking-wider ${
                    activeTab === 'desc'
                      ? 'text-gold-primary border-b border-gold-primary font-semibold'
                      : 'text-text-muted'
                  }`}
                >
                  Tavsif
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('usage')}
                  className={`pb-1 transition-colors uppercase tracking-wider ${
                    activeTab === 'usage'
                      ? 'text-gold-primary border-b border-gold-primary font-semibold'
                      : 'text-text-muted'
                  }`}
                >
                  Qo‘llash
                </button>
              </div>

              <div className="pt-3 text-xs text-text-muted font-light leading-relaxed">
                {activeTab === 'desc' && <p>{selectedProduct.description}</p>}
                {activeTab === 'usage' && <p>{selectedProduct.usage}</p>}
              </div>
            </div>

            {/* Amallar */}
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-3.5 rounded-xl bg-gold-primary hover:bg-gold-light text-black text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md shadow-gold-primary/20"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Savatga qo‘shish</span>
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(selectedProduct.id)}
                className={`p-3.5 rounded-xl border transition-all ${
                  isFavorite
                    ? 'bg-gold-primary text-black border-gold-primary'
                    : 'border-border-hairline bg-surface-2 text-text-muted hover:text-gold-primary'
                }`}
                title="Sevimlilarga olish"
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
