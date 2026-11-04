'use client';

import React, { useState, useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { formatPrice, generateOrderNumber } from '@/lib/utils';
import { ordersService } from '@/services/ordersService';
import { antiBot } from '@/lib/rateLimit';
import { X, CheckCircle2, ShieldCheck, Truck, CreditCard, ShieldAlert } from 'lucide-react';

export const CheckoutModal: React.FC = () => {
  const { items, getTotals, clearCart } = useCartStore();
  const { isCheckoutOpen, setCheckoutOpen } = useUIStore();
  const { user } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [address, setAddress] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'standart' | 'express' | 'pickup'>('standart');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'payme'>('cash');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState<string | null>(null);

  // Botlarga qarshi Honeypot va ochilish vaqti
  const [honeypot, setHoneypot] = useState('');
  const [formOpenTime, setFormOpenTime] = useState<number>(Date.now());

  useEffect(() => {
    if (isCheckoutOpen) {
      setFormOpenTime(Date.now());
      setErrorMessage('');
      if (user) {
        if (user.fullName) setFullName(user.fullName);
        if (user.phone) setPhone(user.phone);
      }
    }
  }, [isCheckoutOpen, user]);

  if (!isCheckoutOpen) return null;

  const { total } = getTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // 1. Bot Honeypot tekshiruvi
    if (!antiBot.checkHoneypot(honeypot)) {
      setErrorMessage('Xavfsizlik tekshiruvidan o‘tmadiniz.');
      return;
    }

    // 2. Juda tez yuborish (Speed test)
    if (!antiBot.checkSubmissionSpeed(formOpenTime, 1.5)) {
      setErrorMessage('Iltimos, ma’lumotlarni to‘g‘ri to‘ldiring.');
      return;
    }

    // 3. Rate Limit / Cooldown (har 15 soniyada faqat 1 ta buyurtma)
    const rateCheck = antiBot.checkRateLimit('checkout_order', 15);
    if (!rateCheck.allowed) {
      setErrorMessage(`Iltimos, ${rateCheck.remainingSeconds} soniya kuting va qayta urinib ko‘ring.`);
      return;
    }

    setLoading(true);

    const orderNumber = generateOrderNumber();
    await ordersService.createOrder({
      orderNumber,
      customerName: fullName,
      phone,
      address: shippingMethod === 'pickup' ? 'Showroomdan olib ketish (Bekbaraka)' : address,
      items: items.map((i) => ({ id: i.id, name: i.name, amount: i.amount, quantity: i.quantity })),
      total,
      paymentMethod,
      shippingMethod,
    });

    clearCart();
    setLoading(false);
    setOrderConfirmed(orderNumber);
  };

  const handleClose = () => {
    setOrderConfirmed(null);
    setCheckoutOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={handleClose} className="fixed inset-0 bg-black/65 backdrop-blur-sm" />

      {/* Modal Card */}
      <div className="relative w-full max-w-xl bg-surface-1 rounded-2xl border border-border-hairline p-5 sm:p-8 z-10 max-h-[90vh] overflow-y-auto shadow-2xl">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-text-muted hover:text-text-main hover:bg-surface-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {orderConfirmed ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-gold-primary/10 border border-gold-primary/30 flex items-center justify-center mx-auto text-gold-primary">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h3 className="font-serif text-2xl text-text-main">Buyurtma qabul qilindi!</h3>
            <p className="text-xs text-text-muted max-w-sm mx-auto font-light">
              Buyurtmangiz muvaffaqiyatli rasmiylashtirildi. Tez orada menejerimiz siz bilan bog‘lanadi.
            </p>

            <div className="p-4 bg-surface-2 rounded-xl border border-border-hairline inline-block">
              <span className="text-[11px] uppercase tracking-wider text-text-muted block">Buyurtma kodi:</span>
              <strong className="text-xl font-serif text-gold-primary tracking-widest">{orderConfirmed}</strong>
            </div>

            <div>
              <button
                type="button"
                onClick={handleClose}
                className="mt-4 px-8 py-3 rounded-full bg-gold-primary hover:bg-gold-light text-black text-xs font-semibold uppercase tracking-wider transition-all"
              >
                Xaridni yakunlash
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold-primary block mb-1 font-medium">
                Xaridni rasmiylashtirish
              </span>
              <h2 className="font-serif text-2xl text-text-main">Buyurtma berish</h2>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* BOT HONEYPOT: Inson ko'rmaydi, botlar esa to'ldiradi */}
              <div style={{ display: 'none' }} aria-hidden="true">
                <input
                  type="text"
                  name="checkout_honeypot_field"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">
                    Ism va familiya
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ism va familiyangiz"
                    className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">
                    Telefon raqam
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 __ ___ __ __"
                    className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                  />
                </div>
              </div>

              {shippingMethod !== 'pickup' && (
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">
                    Yetkazib berish manzili
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Shahar, tuman, ko‘cha va xonadon raqami"
                    className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary resize-none"
                  />
                </div>
              )}

              {/* Yetkazib berish usullari */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-2">
                  Yetkazib berish turi
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'standart', label: 'Standart', desc: '1-2 kun' },
                    { id: 'express', label: 'Express', desc: '6 soatda' },
                    { id: 'pickup', label: 'Do‘kondan', desc: 'Showroom' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setShippingMethod(s.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        shippingMethod === s.id
                          ? 'border-gold-primary bg-gold-primary/10 text-text-main'
                          : 'border-border-hairline bg-surface-2/60 text-text-muted hover:border-gold-primary/30'
                      }`}
                    >
                      <Truck className="w-4 h-4 mb-1 text-gold-primary" />
                      <span className="text-xs font-semibold block">{s.label}</span>
                      <span className="text-[10px] opacity-75">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* To'lov usuli */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-2">
                  To‘lov turi
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cash', label: 'Naqd pul' },
                    { id: 'card', label: 'Karta' },
                    { id: 'payme', label: 'Payme / Click' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPaymentMethod(p.id as any)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        paymentMethod === p.id
                          ? 'border-gold-primary bg-gold-primary/10 text-text-main font-semibold'
                          : 'border-border-hairline bg-surface-2/60 text-text-muted hover:border-gold-primary/30 text-xs'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 mx-auto mb-1 text-gold-primary" />
                      <span className="text-xs block">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Jami summa va tasdiqlash */}
              <div className="pt-4 border-t border-border-hairline flex items-center justify-between">
                <div>
                  <span className="text-xs text-text-muted block">To‘lov summasi:</span>
                  <span className="text-xl font-serif font-semibold text-gold-primary">{formatPrice(total)}</span>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-7 py-3.5 rounded-xl bg-gold-primary hover:bg-gold-light text-black text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-all shadow-md shadow-gold-primary/20 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>{loading ? 'Yuborilmoqda...' : 'Tasdiqlash'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
