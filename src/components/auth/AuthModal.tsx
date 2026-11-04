'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { ordersService } from '@/services/ordersService';
import { formatPrice } from '@/lib/utils';
import { Order } from '@/types/database';
import { useRouter } from 'next/navigation';
import { X, User, Mail, Lock, Phone, LogOut, Package, ShieldAlert, Sparkles, ShieldCheck } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { user, isAdmin, loading, error, signUp, signIn, signOut, clearError, checkSession } = useAuthStore();
  const { isAuthOpen, setAuthOpen } = useUIStore();
  const router = useRouter();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+998 ');

  // Botlarga qarshi Honeypot
  const [honeypot, setHoneypot] = useState('');

  // Foydalanuvchining o'z buyurtmalari
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (isAuthOpen) {
      clearError();
    }
  }, [isAuthOpen, clearError]);

  // Buyurtmalarni yuklash
  useEffect(() => {
    async function loadUserOrders() {
      if (!user) return;
      setLoadingOrders(true);
      try {
        const data = await ordersService.fetchCustomerOrders(user.fullName, user.phone);
        setUserOrders(data);
      } catch (_) {
        setUserOrders([]);
      } finally {
        setLoadingOrders(false);
      }
    }

    if (user && isAuthOpen) {
      loadUserOrders();
    }
  }, [user, isAuthOpen]);

  if (!isAuthOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn(email, password);
    if (result.success) {
      setEmail('');
      setPassword('');
      // Agar admin bo'lsa, avtomatik ravishda admin panelga o'tadi!
      if (result.isAdmin) {
        setAuthOpen(false);
        router.push('/admin');
      }
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await signUp(email, password, fullName, phone, honeypot);
    if (success) {
      setEmail('');
      setPassword('');
      setFullName('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div onClick={() => setAuthOpen(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-surface-1 rounded-2xl border border-border-hairline p-5 sm:p-8 z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={() => setAuthOpen(false)}
          className="absolute top-5 right-5 p-1.5 rounded-full text-text-muted hover:text-text-main hover:bg-surface-2 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {user ? (
          /* FOYDALANUVCHI PROFILI & BUYURTMALARI */
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border border-gold-primary/40 bg-gold-primary/10 flex items-center justify-center font-serif text-lg text-gold-primary font-bold">
                {user.fullName ? user.fullName[0].toUpperCase() : 'N'}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider text-gold-primary block">Shaxsiy Kabinet</span>
                  {isAdmin && (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-gold-primary text-black">
                      Admin
                    </span>
                  )}
                </div>
                <h3 className="font-serif text-xl text-text-main">{user.fullName || 'Mijoz'}</h3>
                <p className="text-xs text-text-muted">{user.email}</p>
              </div>
            </div>

            {/* Admin bo'lsa maxsus havola */}
            {isAdmin && (
              <div className="p-4 rounded-xl bg-gold-primary/10 border border-gold-primary/30 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-text-main flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-gold-primary" />
                    <span>Tizim Ma’muri</span>
                  </h4>
                  <p className="text-[11px] text-text-muted">Boshqaruv paneliga to‘liq ruxsat mavjud.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAuthOpen(false);
                    router.push('/admin');
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-gold-primary text-black text-xs font-semibold uppercase tracking-wider hover:bg-gold-light transition-colors"
                >
                  Boshqaruv ↗
                </button>
              </div>
            )}

            {/* Buyurtmalar Tarixi */}
            <div className="border-t border-border-hairline pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-text-main flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-gold-primary" />
                  <span>Buyurtmalarim</span>
                </span>
                <span className="text-[11px] text-text-muted">{userOrders.length} ta xarid</span>
              </div>

              {loadingOrders ? (
                <div className="py-6 text-center text-xs text-text-muted flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-gold-primary animate-spin" />
                  <span>Buyurtmalar yuklanmoqda...</span>
                </div>
              ) : userOrders.length === 0 ? (
                <div className="p-4 rounded-xl bg-surface-2/60 border border-border-hairline text-center text-xs text-text-muted">
                  Sizda hali yakunlangan buyurtmalar mavjud emas.
                </div>
              ) : (
                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {userOrders.map((order, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-surface-2/60 border border-border-hairline flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-mono text-gold-primary text-[11px] font-semibold block">
                          {order.order_number || `BUY-${order.id?.slice(0, 8)}`}
                        </span>
                        <span className="text-[10px] text-text-muted block mt-0.5">
                          {order.delivery_method || order.shipping_method || 'Standart'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-text-main block">{formatPrice(order.total)}</span>
                        <span className="text-[10px] text-gold-light uppercase font-medium">
                          {order.status || order.order_status || 'Jarayonda'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chiqish tugmasi */}
            <div className="pt-2 border-t border-border-hairline">
              <button
                type="button"
                onClick={signOut}
                className="w-full py-2.5 rounded-xl border border-border-hairline hover:border-red-400 hover:text-red-400 text-text-muted text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Kabinetdan chiqish</span>
              </button>
            </div>
          </div>
        ) : (
          /* LOGIN VA REGISTER FORMALARI */
          <div>
            <div className="flex border-b border-border-hairline pb-3 mb-6 gap-6 text-sm">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  clearError();
                }}
                className={`pb-1 transition-colors uppercase tracking-wider text-xs font-semibold ${
                  tab === 'login' ? 'text-gold-primary border-b-2 border-gold-primary' : 'text-text-muted'
                }`}
              >
                Kirish
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  clearError();
                }}
                className={`pb-1 transition-colors uppercase tracking-wider text-xs font-semibold ${
                  tab === 'register' ? 'text-gold-primary border-b-2 border-gold-primary' : 'text-text-muted'
                }`}
              >
                Ro‘yxatdan o‘tish
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {tab === 'login' ? (
              /* Kirish Formasi */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">
                    Email manzil
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Elektron pochta manzili"
                      className="w-full bg-surface-2 text-text-main text-xs pl-9 pr-3 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">
                    Parol
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Parol"
                      className="w-full bg-surface-2 text-text-main text-xs pl-9 pr-3 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gold-primary hover:bg-gold-light text-black font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {loading ? 'Kirilmoqda...' : 'Kirish'}
                </button>
              </form>
            ) : (
              /* Ro'yxatdan O'tish Formasi */
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div style={{ display: 'none' }} aria-hidden="true">
                  <input
                    type="text"
                    name="website_url_honeypot"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">
                    Ism va familiya
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ism va familiyangiz"
                      className="w-full bg-surface-2 text-text-main text-xs pl-9 pr-3 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">
                    Telefon raqam
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+998 __ ___ __ __"
                      className="w-full bg-surface-2 text-text-main text-xs pl-9 pr-3 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">
                    Email manzil
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Elektron pochta manzili"
                      className="w-full bg-surface-2 text-text-main text-xs pl-9 pr-3 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">
                    Parol (kamida 6 belgi)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Parol (kamida 6 ta belgi)"
                      className="w-full bg-surface-2 text-text-main text-xs pl-9 pr-3 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gold-primary hover:bg-gold-light text-black font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                >
                  {loading ? 'Yaratilmoqda...' : 'Ro‘yxatdan o‘tish'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
