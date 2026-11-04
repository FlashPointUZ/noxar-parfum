'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';
import { BottleArt } from '@/components/ui/BottleArt';
import { formatPrice } from '@/lib/utils';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Tag, Check } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { items, updateQuantity, removeItem, promo, applyPromo, getTotals } = useCartStore();
  const { isCartOpen, setCartOpen, setCheckoutOpen } = useUIStore();
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoError, setPromoError] = useState('');

  if (!isCartOpen) return null;

  const { subtotal, discount, shipping, total } = getTotals();

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCodeInput.trim().toUpperCase();

    if (code === 'NOXAR10') {
      applyPromo({ code: 'NOXAR10', type: 'percent', percent: 10, value: 0 });
      setPromoCodeInput('');
    } else if (code === 'VIP50') {
      applyPromo({ code: 'VIP50', type: 'fixed', value: 50000 });
      setPromoCodeInput('');
    } else {
      setPromoError('Promo-kod noto‘g‘ri yoki muddati tugagan.');
    }
  };

  const proceedToCheckout = () => {
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        onClick={() => setCartOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md bg-surface-1 border-l border-border-hairline h-full flex flex-col justify-between z-10 shadow-2xl transition-all">
        {/* Head */}
        <div className="p-6 border-b border-border-hairline flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-gold-primary" />
            <h2 className="font-serif text-xl text-text-main">Savat</h2>
            <span className="text-xs text-text-muted">({items.length} ta mahsulot)</span>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="p-1.5 rounded-full text-text-muted hover:text-text-main hover:bg-surface-2 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center text-text-muted">
                <ShoppingBag className="w-8 h-8 text-gold-primary/60" />
              </div>
              <h3 className="font-serif text-lg text-text-main">Savatingiz bo‘sh</h3>
              <p className="text-xs text-text-muted max-w-xs font-light">
                O‘zingizga yoqqan muattar hidni tanlang va uni shu yerda saqlang.
              </p>
              <button
                type="button"
                onClick={() => setCartOpen(false)}
                className="mt-4 px-6 py-2.5 rounded-full bg-gold-primary text-black text-xs font-semibold uppercase tracking-wider hover:bg-gold-light transition-all"
              >
                Katalogni ko‘rish
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-surface-2/60 border border-border-hairline flex items-center gap-4"
              >
                {/* Rasm yoki BottleArt */}
                <div className="w-16 h-20 bg-surface-1 rounded-lg border border-border-hairline flex items-center justify-center flex-shrink-0 overflow-hidden p-1">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  ) : (
                    <BottleArt art={item.art} size="sm" className="scale-75" />
                  )}
                </div>

                {/* Tafsilot */}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] tracking-wider text-text-muted uppercase block">{item.brand}</span>
                  <h4 className="font-serif text-sm text-text-main truncate">{item.name}</h4>
                  <span className="text-xs font-semibold text-gold-primary mt-1 block">
                    {formatPrice(item.amount * item.quantity)}
                  </span>

                  {/* Miqdor kontrolleri */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 rounded bg-surface-1 border border-border-hairline flex items-center justify-center text-text-main hover:border-gold-primary transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-medium text-text-main min-w-[16px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 rounded bg-surface-1 border border-border-hairline flex items-center justify-center text-text-main hover:border-gold-primary transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* O'chirish tugmasi */}
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-2 text-text-muted hover:text-red-400 transition-colors"
                  title="O‘chirish"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer / Summary */}
        {items.length > 0 && (
          <div className="p-6 border-t border-border-hairline bg-surface-1 space-y-4">
            {/* Promo-kod formasi */}
            <form onSubmit={handlePromoSubmit} className="space-y-1.5">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="Promo-kod"
                    className="w-full bg-surface-2 text-text-main text-xs pl-8 pr-3 py-2 rounded-lg border border-border-hairline outline-none focus:border-gold-primary uppercase tracking-wider"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-surface-2 border border-border-hairline hover:border-gold-primary text-xs uppercase tracking-wider text-text-main transition-colors"
                >
                  Qo‘llash
                </button>
              </div>
              {promo && (
                <div className="text-[11px] text-green-500 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Check className="w-3.5 h-3.5 text-green-500" />
                    <span>Promo-kod faol: {promo.code}</span>
                  </span>
                  <button type="button" onClick={() => applyPromo(null)} className="underline text-text-muted hover:text-red-400">
                    Bekor qilish
                  </button>
                </div>
              )}
              {promoError && <p className="text-[11px] text-red-400">{promoError}</p>}
            </form>

            {/* Hisob-kitob qatori */}
            <div className="space-y-1.5 text-xs text-text-muted pt-2 border-t border-border-hairline">
              <div className="flex justify-between">
                <span>Mahsulotlar:</span>
                <span className="text-text-main">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>Chegirma:</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Yetkazib berish:</span>
                <span className="text-text-main">{shipping === 0 ? 'Bepul' : formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-base font-serif font-medium text-text-main pt-2 border-t border-border-hairline">
                <span>Jami:</span>
                <span className="text-gold-primary">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout tugmasi */}
            <button
              type="button"
              onClick={proceedToCheckout}
              className="w-full py-3.5 rounded-xl bg-gold-primary hover:bg-gold-light text-black font-semibold text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-gold-primary/20"
            >
              <span>Buyurtma berish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
