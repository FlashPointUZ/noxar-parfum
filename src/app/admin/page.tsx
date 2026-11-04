'use client';

import React, { useState, useEffect } from 'react';
import { initialProducts } from '@/lib/data/products';
import { Product, Order } from '@/types/database';
import { supabase } from '@/lib/supabase/client';
import { formatPrice } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  AlertTriangle,
  Plus,
  Trash2,
  ArrowLeft,
  Search,
  Lock,
  LogOut,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'inventory'>('dashboard');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Yangi mahsulot formasi
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductBrand, setNewProductBrand] = useState('NOXAR');
  const [newProductPrice, setNewProductPrice] = useState('890000');
  const [newProductStock, setNewProductStock] = useState('10');
  const [newProductDept, setNewProductDept] = useState('atirlar');
  const [newProductNotes, setNewProductNotes] = useState('');

  // Sessiyani tekshirish
  useEffect(() => {
    const isLogged = localStorage.getItem('noxar-admin-auth');
    if (isLogged === 'true') {
      setIsAuthenticated(true);
    }

    // Mahalliy buyurtmalarni o'qish
    try {
      const localOrders = JSON.parse(localStorage.getItem('noxar-orders') || '[]');
      setOrders(localOrders);
    } catch (_) {}

    // Supabase dan buyurtma va mahsulotlarni tortish
    async function loadData() {
      try {
        const { data: remoteOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
        if (remoteOrders && remoteOrders.length > 0) {
          setOrders(remoteOrders);
        }

        const { data: remoteProducts } = await supabase.from('products').select('*');
        if (remoteProducts && remoteProducts.length > 0) {
          setProducts(remoteProducts as any);
        }
      } catch (_) {}
    }
    loadData();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin123' || passwordInput === 'noxar2026') {
      setIsAuthenticated(true);
      localStorage.setItem('noxar-admin-auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Parol noto‘g‘ri. (Standart: admin123)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('noxar-admin-auth');
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(newProductPrice);
    const newProduct: Product = {
      id: `custom-${Date.now()}`,
      name: newProductName,
      brand: newProductBrand,
      price: `${amount.toLocaleString('uz-UZ')} so'm`,
      amount,
      notes: newProductNotes || 'Eksklyuziv kompozitsiya',
      categories: [newProductDept, 'unisex'],
      department: newProductDept as any,
      family: 'amber',
      volume: '50',
      rating: 5.0,
      popularity: 50,
      art: 'black-art',
      top: 'Bosh nota',
      heart: 'Yurak nota',
      base: 'Asos nota',
      description: newProductNotes,
      usage: 'Puls nuqtalariga seping.',
      features: ['Eau de Parfum', 'Uniseks'],
      stock: Number(newProductStock),
    };

    setProducts([newProduct, ...products]);

    try {
      await supabase.from('products').insert([
        {
          name: newProductName,
          brand: newProductBrand,
          price: amount,
          stock: Number(newProductStock),
          category: newProductDept,
          description: newProductNotes,
        },
      ]);
    } catch (_) {}

    setShowAddModal(false);
    setNewProductName('');
    setNewProductNotes('');
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Haqiqatan ham bu mahsulotni o‘chirmoqchimisiz?')) return;
    setProducts(products.filter((p) => p.id !== id));
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (_) {}
  };

  const handleOrderStatusChange = async (orderId: string, status: any) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, order_status: status } : o));
    setOrders(updated);
    localStorage.setItem('noxar-orders', JSON.stringify(updated));

    try {
      await supabase.from('orders').update({ order_status: status }).eq('id', orderId);
    } catch (_) {}
  };

  // Statistika
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const lowStockCount = products.filter((p) => p.stock <= 4).length;

  // Agar login qilinmagan bo'lsa:
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface-0">
        <div className="w-full max-w-sm bg-surface-1 border border-border-hairline rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-12 h-12 rounded-full border border-gold-primary/30 flex items-center justify-center mx-auto mb-4 text-gold-primary">
            <Lock className="w-5 h-5" />
          </div>

          <h1 className="font-serif text-2xl text-text-main mb-1">Admin Panel</h1>
          <p className="text-xs text-text-muted mb-6">NOXAR PARFUM boshqaruv tizimi</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Admin paroli (admin123)"
                className="w-full bg-surface-2 text-text-main text-xs px-4 py-3 rounded-xl border border-border-hairline outline-none focus:border-gold-primary transition-all text-center tracking-widest"
              />
            </div>

            {authError && <p className="text-xs text-red-400">{authError}</p>}

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gold-primary hover:bg-gold-light text-black text-xs font-semibold uppercase tracking-wider transition-all"
            >
              Kirish
            </button>
          </form>

          <a href="/" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-gold-primary mt-6">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Do‘konga qaytish</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Top Bar */}
      <header className="h-16 bg-surface-1 border-b border-border-hairline px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="p-2 rounded-lg border border-border-hairline text-text-muted hover:text-gold-primary transition-colors"
            title="Do‘konga qaytish"
          >
            <ArrowLeft className="w-4 h-4" />
          </a>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border border-gold-primary flex items-center justify-center font-serif text-xs text-gold-primary font-bold">
              N
            </div>
            <h1 className="font-serif text-base tracking-wider text-text-main">NOXAR ADMIN</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-text-muted hidden sm:inline">Admin: Superuser</span>
          <button
            type="button"
            onClick={handleLogout}
            className="p-2 rounded-lg border border-border-hairline hover:border-red-400 text-text-muted hover:text-red-400 transition-colors"
            title="Chiqish"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 border-b border-border-hairline pb-4 mb-6 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Boshqaruv (Dashboard)', icon: LayoutDashboard },
            { id: 'products', label: 'Mahsulotlar', icon: Package },
            { id: 'orders', label: 'Buyurtmalar', icon: ShoppingBag },
            { id: 'inventory', label: 'Ombor', icon: AlertTriangle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-medium flex items-center gap-2 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-gold-primary text-black font-semibold'
                    : 'bg-surface-1 border border-border-hairline text-text-muted hover:text-text-main'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1. DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Statistika Kartochkalari */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-surface-1 border border-border-hairline">
                <span className="text-[11px] uppercase tracking-wider text-text-muted block">Buyurtmalar soni</span>
                <strong className="text-3xl font-serif text-text-main mt-2 block">{orders.length}</strong>
                <span className="text-xs text-green-500 mt-1 block">Barcha qabul qilinganlar</span>
              </div>

              <div className="p-6 rounded-2xl bg-surface-1 border border-border-hairline">
                <span className="text-[11px] uppercase tracking-wider text-text-muted block">Jami Tushum</span>
                <strong className="text-3xl font-serif text-gold-primary mt-2 block">{formatPrice(totalRevenue)}</strong>
                <span className="text-xs text-text-muted mt-1 block">Showroom va yetkazib berish</span>
              </div>

              <div className="p-6 rounded-2xl bg-surface-1 border border-border-hairline">
                <span className="text-[11px] uppercase tracking-wider text-text-muted block">Kam qolgan tovarlar</span>
                <strong className="text-3xl font-serif text-red-400 mt-2 block">{lowStockCount}</strong>
                <span className="text-xs text-text-muted mt-1 block">Omborni to‘ldirish talab qilinadi</span>
              </div>
            </div>

            {/* So'nggi buyurtmalar */}
            <div className="bg-surface-1 rounded-2xl border border-border-hairline p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-lg text-text-main">So‘nggi buyurtmalar</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-gold-primary hover:underline"
                >
                  Barchasini ko‘rish →
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-text-muted py-6 text-center">Hali buyurtmalar kelib tushmadi.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border-hairline text-text-muted uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-2">Raqam</th>
                        <th className="py-3 px-2">Mijoz</th>
                        <th className="py-3 px-2">Telefon</th>
                        <th className="py-3 px-2">Summa</th>
                        <th className="py-3 px-2">Holat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-hairline">
                      {orders.slice(0, 5).map((o, idx) => (
                        <tr key={idx} className="hover:bg-surface-2/40">
                          <td className="py-3 px-2 font-mono text-gold-primary">{o.order_number}</td>
                          <td className="py-3 px-2 text-text-main font-medium">{o.customer_name}</td>
                          <td className="py-3 px-2 text-text-muted">{o.phone}</td>
                          <td className="py-3 px-2 text-text-main font-semibold">{formatPrice(o.total)}</td>
                          <td className="py-3 px-2">
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-gold-primary/10 text-gold-primary">
                              {o.order_status || 'Kutilmoqda'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. MAHSULOTLAR VIEW */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Mahsulot nomi yoki brend..."
                  className="w-full bg-surface-1 text-text-main text-xs pl-8 pr-3 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gold-primary hover:bg-gold-light text-black text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi mahsulot</span>
              </button>
            </div>

            {/* Mahsulotlar jadvali */}
            <div className="bg-surface-1 rounded-2xl border border-border-hairline overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border-hairline text-text-muted uppercase text-[10px] tracking-wider bg-surface-2/40">
                    <th className="py-3.5 px-4">Nomi</th>
                    <th className="py-3.5 px-4">Brend</th>
                    <th className="py-3.5 px-4">Bo‘lim</th>
                    <th className="py-3.5 px-4">Narx</th>
                    <th className="py-3.5 px-4">Qoldiq</th>
                    <th className="py-3.5 px-4 text-right">Amal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-hairline">
                  {products
                    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-surface-2/30">
                        <td className="py-3.5 px-4 font-serif text-text-main font-medium">{p.name}</td>
                        <td className="py-3.5 px-4 text-text-muted">{p.brand}</td>
                        <td className="py-3.5 px-4 text-text-muted uppercase text-[10px]">{p.department}</td>
                        <td className="py-3.5 px-4 text-gold-primary font-semibold">{p.price}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              p.stock <= 3
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-green-500/10 text-green-400'
                            }`}
                          >
                            {p.stock} dona
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 text-text-muted hover:text-red-400 transition-colors"
                            title="O‘chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. BUYURTMALAR VIEW */}
        {activeTab === 'orders' && (
          <div className="bg-surface-1 rounded-2xl border border-border-hairline p-6">
            <h3 className="font-serif text-xl text-text-main mb-4">Barcha buyurtmalar</h3>

            {orders.length === 0 ? (
              <p className="text-xs text-text-muted py-8 text-center">Buyurtmalar mavjud emas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border-hairline text-text-muted uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-3">Raqam</th>
                      <th className="py-3.5 px-3">Mijoz</th>
                      <th className="py-3.5 px-3">Telefon</th>
                      <th className="py-3.5 px-3">Manzil</th>
                      <th className="py-3.5 px-3">Summa</th>
                      <th className="py-3.5 px-3">Holat</th>
                      <th className="py-3.5 px-3">O‘zgartirish</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-hairline">
                    {orders.map((o, idx) => (
                      <tr key={idx} className="hover:bg-surface-2/30">
                        <td className="py-3.5 px-3 font-mono text-gold-primary">{o.order_number}</td>
                        <td className="py-3.5 px-3 text-text-main font-medium">{o.customer_name}</td>
                        <td className="py-3.5 px-3 text-text-muted">{o.phone}</td>
                        <td className="py-3.5 px-3 text-text-muted max-w-xs truncate">{o.address}</td>
                        <td className="py-3.5 px-3 text-text-main font-semibold">{formatPrice(o.total)}</td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-semibold inline-flex items-center gap-1 ${
                              o.order_status === 'delivered'
                                ? 'bg-green-500/10 text-green-400'
                                : o.order_status === 'cancelled'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-gold-primary/10 text-gold-primary'
                            }`}
                          >
                            {o.order_status === 'delivered' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : o.order_status === 'cancelled' ? (
                              <XCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            <span>{o.order_status || 'Jarayonda'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <select
                            value={o.order_status || 'processing'}
                            onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                            className="bg-surface-2 text-text-main text-xs px-2.5 py-1 rounded-lg border border-border-hairline outline-none"
                          >
                            <option value="processing">Jarayonda</option>
                            <option value="delivered">Yetkazildi</option>
                            <option value="cancelled">Bekor qilindi</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. OMBOR VIEW */}
        {activeTab === 'inventory' && (
          <div className="bg-surface-1 rounded-2xl border border-border-hairline p-6 space-y-4">
            <h3 className="font-serif text-xl text-text-main">Kam qolgan mahsulotlar nazorati</h3>
            <p className="text-xs text-text-muted font-light">
              Qoldig‘i 4 donadan kam qolgan tovarlar ro‘yxati.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {products
                .filter((p) => p.stock <= 4)
                .map((p) => (
                  <div key={p.id} className="p-4 rounded-xl bg-surface-2/60 border border-border-hairline flex justify-between items-center">
                    <div>
                      <h4 className="font-serif text-sm text-text-main">{p.name}</h4>
                      <span className="text-xs text-text-muted">{p.brand}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400">
                      Faqat {p.stock} ta qoldi
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Yangi Mahsulot Qo'shish Modali */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-md bg-surface-1 rounded-2xl border border-border-hairline p-6 z-10 shadow-2xl">
            <h3 className="font-serif text-xl text-text-main mb-4">Yangi Mahsulot Qo‘shish</h3>

            <form onSubmit={handleAddProduct} className="space-y-3.5">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Nomi</label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="NO. 04 Amber Noir"
                  className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Brend</label>
                  <input
                    type="text"
                    required
                    value={newProductBrand}
                    onChange={(e) => setNewProductBrand(e.target.value)}
                    className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Narx (so‘m)</label>
                  <input
                    type="number"
                    required
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Bo‘lim</label>
                  <select
                    value={newProductDept}
                    onChange={(e) => setNewProductDept(e.target.value)}
                    className="w-full bg-surface-2 text-text-main text-xs px-3 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary cursor-pointer"
                  >
                    <option value="atirlar">Atirlar</option>
                    <option value="body-fragrance">Tana parvarishi</option>
                    <option value="deodorants">Dezodorant</option>
                    <option value="perfume-oils">Parfyum moyi</option>
                    <option value="home-fragrance">Uy aromati</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Stok soni</label>
                  <input
                    type="number"
                    required
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Notalar va tavsif</label>
                <textarea
                  rows={2}
                  value={newProductNotes}
                  onChange={(e) => setNewProductNotes(e.target.value)}
                  placeholder="Amber, sandal va oq mushk..."
                  className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary resize-none"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-border-hairline text-text-muted hover:bg-surface-2 text-xs"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gold-primary hover:bg-gold-light text-black text-xs font-semibold uppercase tracking-wider"
                >
                  Qo‘shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
