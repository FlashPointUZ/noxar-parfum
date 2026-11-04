'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { initialProducts } from '@/lib/data/products';
import { Product, Order, Review } from '@/types/database';
import { supabase } from '@/lib/supabase/client';
import { checkIsAdmin } from '@/lib/auth/adminAuth';
import { useAuthStore } from '@/store/useAuthStore';
import { formatPrice } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  AlertTriangle,
  MessageSquare,
  Plus,
  Trash2,
  ArrowLeft,
  Search,
  Lock,
  LogOut,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  Star,
  RefreshCw,
} from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin, signIn, signOut, checkSession } = useAuthStore();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'inventory' | 'reviews'>('dashboard');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Yangi mahsulot formasi holati
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductBrand, setNewProductBrand] = useState('NOXAR');
  const [newProductPrice, setNewProductPrice] = useState('890000');
  const [newProductStock, setNewProductStock] = useState('10');
  const [newProductDept, setNewProductDept] = useState('atirlar');
  const [customCategory, setCustomCategory] = useState('');
  const [newProductGender, setNewProductGender] = useState('unisex');
  const [newProductNotes, setNewProductNotes] = useState('');
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // 1. Foydalanuvchi sessiyasini va Adminlik huquqini tekshirish
  useEffect(() => {
    async function verifyUser() {
      setCheckingAuth(true);
      await checkSession();
      setCheckingAuth(false);
    }
    verifyUser();
  }, [checkSession]);

  // 2. Real ma'lumotlarni Supabase dan yuklash
  const loadSupabaseData = useCallback(async () => {
    setLoadingData(true);
    try {
      // Mahsulotlar
      const { data: remoteProducts } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (remoteProducts && remoteProducts.length > 0) {
        const formatted: Product[] = remoteProducts.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          brand: p.brand || 'NOXAR',
          price: `${Number(p.price || 0).toLocaleString('uz-UZ')} so'm`,
          amount: Number(p.price || 0),
          notes: p.description || p.notes || '',
          categories: [p.category || 'atirlar', p.gender || 'unisex'],
          department: p.category || 'atirlar',
          gender: p.gender || 'unisex',
          family: 'amber',
          volume: '50',
          rating: 4.8,
          popularity: 80,
          art: 'black-art',
          top: 'Bosh nota',
          heart: 'Yurak nota',
          base: 'Asos nota',
          description: p.description || '',
          usage: 'Puls nuqtalariga seping.',
          features: ['Eau de Parfum'],
          stock: Number(p.stock || 0),
          active: p.active !== false,
        }));
        setProducts(formatted);
      }

      // Buyurtmalar
      const { data: remoteOrders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (remoteOrders && remoteOrders.length > 0) {
        setOrders(remoteOrders);
      } else {
        const local = JSON.parse(localStorage.getItem('noxar-orders') || '[]');
        setOrders(local);
      }

      // Sharhlar (Reviews)
      const { data: remoteReviews } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (remoteReviews && remoteReviews.length > 0) {
        setReviews(remoteReviews);
      }
    } catch (err) {
      console.warn('Supabase ma’lumotlarini yuklashda xatolik:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadSupabaseData();
    }
  }, [isAdmin, loadSupabaseData]);

  // Real Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoginLoading(true);

    try {
      const res = await signIn(emailInput, passwordInput);
      if (!res.success) {
        setAuthError('Email yoki parol noto‘g‘ri kiritildi.');
        setLoginLoading(false);
        return;
      }

      // Adminlik tekshiruvi
      const isActualAdmin = await checkIsAdmin(undefined, emailInput);
      if (!isActualAdmin) {
        setAuthError('Ruxsat rad etildi. Ushbu akkaunt tizim administratori huquqiga ega emas.');
        await signOut();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Tizimga kirishda xatolik yuz berdi.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Yangi Mahsulot Qo'shish (Real Supabase Insert)
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProduct(true);

    const finalCategory = newProductDept === 'custom' ? (customCategory.trim().toLowerCase() || 'atirlar') : newProductDept;
    const amount = Number(newProductPrice);
    const newId = `prod-${Date.now()}`;

    const newProdItem: Product = {
      id: newId,
      name: newProductName,
      brand: newProductBrand,
      price: `${amount.toLocaleString('uz-UZ')} so'm`,
      amount,
      notes: newProductNotes || 'Eksklyuziv kompozitsiya',
      categories: [finalCategory, newProductGender],
      department: finalCategory,
      gender: newProductGender as any,
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
      features: ['Eau de Parfum'],
      stock: Number(newProductStock),
      active: true,
    };

    try {
      const { error } = await supabase.from('products').insert([
        {
          id: newId,
          name: newProductName,
          brand: newProductBrand,
          price: amount,
          stock: Number(newProductStock),
          category: finalCategory,
          gender: newProductGender,
          description: newProductNotes,
          active: true,
        },
      ]);

      if (!error) {
        setProducts([newProdItem, ...products]);
      } else {
        // Fallback local
        setProducts([newProdItem, ...products]);
      }
    } catch (_) {
      setProducts([newProdItem, ...products]);
    }

    setSubmittingProduct(false);
    setShowAddModal(false);
    setNewProductName('');
    setNewProductNotes('');
    setCustomCategory('');
  };

  // Mahsulotni o'chirish (Real Supabase Delete)
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Haqiqatan ham bu mahsulotni o‘chirmoqchimisiz?')) return;
    setProducts(products.filter((p) => p.id !== id));
    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (_) {}
  };

  // Buyurtma holatini yangilash
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus, order_status: newStatus } : o));
    setOrders(updated);
    try {
      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
    } catch (_) {}
  };

  // Noo'rin sharhni o'chirish (DELETE)
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Ushbu noo‘rin sharhni butunlay o‘chirmoqchimisiz?')) return;
    setReviews(reviews.filter((r) => r.id !== reviewId));
    try {
      await supabase.from('reviews').delete().eq('id', reviewId);
    } catch (err) {
      console.error('Sharhni o‘chirishda xatolik:', err);
    }
  };

  // Sharh holatini tasdiqlash / rad etish (APPROVE / REJECT)
  const handleReviewStatusChange = async (reviewId: string, status: 'approved' | 'rejected') => {
    const updated = reviews.map((r) => (r.id === reviewId ? { ...r, status } : r));
    setReviews(updated);
    try {
      await supabase.from('reviews').update({ status }).eq('id', reviewId);
    } catch (_) {}
  };

  // Barcha mavjud kategoriyalar
  const allCategories = [
    { id: 'atirlar', label: 'Atirlar' },
    { id: 'body-fragrance', label: 'Tana parvarishi' },
    { id: 'deodorants', label: 'Dezodorant' },
    { id: 'perfume-oils', label: 'Parfyum moylari' },
    { id: 'home-fragrance', label: 'Uy aromati' },
    { id: 'bath-shower', label: 'Dush & vanna' },
    { id: 'accessories', label: 'Aksessuarlar' },
    { id: 'gift-sets', label: 'Sovg‘a to‘plamlari' },
    { id: 'custom', label: '+ Yangi kategoriya kiritish...' },
  ];

  // Statistika
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const lowStockCount = products.filter((p) => p.stock <= 4).length;
  const pendingReviewsCount = reviews.filter((r) => r.status === 'pending').length;

  // Sessiya yuklanayotganda
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface-0 text-text-muted text-xs">
        <RefreshCw className="w-4 h-4 text-gold-primary animate-spin mr-2" />
        <span>Admin sessiyasi tekshirilmoqda...</span>
      </div>
    );
  }

  // 1-HOLAT: Agar Foydalanuvchi kirmagan bo'lsa yoki Admin bo'lmasa -> REAL SUPABASE LOGIN FORMASI
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface-0">
        <div className="w-full max-w-sm bg-surface-1 border border-border-hairline rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-12 h-12 rounded-full border border-gold-primary/30 flex items-center justify-center mx-auto mb-4 text-gold-primary">
            <Lock className="w-5 h-5" />
          </div>

          <h1 className="font-serif text-2xl text-text-main mb-1">Admin Panel</h1>
          <p className="text-xs text-text-muted mb-6">Real Supabase bazasi orqali kirish</p>

          {user && !isAdmin && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-left flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Siz <strong>{user.email}</strong> sifatida kirdingiz. Lekin bu akkauntga admin huquqi berilmagan.
              </span>
            </div>
          )}

          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-left">
              {authError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Elektron pochta manzili"
                className="w-full bg-surface-2 text-text-main text-xs px-4 py-3 rounded-xl border border-border-hairline outline-none focus:border-gold-primary transition-all text-center"
              />
            </div>

            <div>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Parol"
                className="w-full bg-surface-2 text-text-main text-xs px-4 py-3 rounded-xl border border-border-hairline outline-none focus:border-gold-primary transition-all text-center tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-gold-primary hover:bg-gold-light text-black text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50"
            >
              {loginLoading ? 'Tekshirilmoqda...' : 'Kirish'}
            </button>
          </form>

          {user && (
            <button
              type="button"
              onClick={signOut}
              className="mt-3 text-xs text-text-muted hover:text-red-400 block mx-auto underline"
            >
              Boshqa akkaunt bilan kirish
            </button>
          )}

          <a href="/" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-gold-primary mt-6">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Do‘konga qaytish</span>
          </a>
        </div>
      </div>
    );
  }

  // 2-HOLAT: ADMIN HUQUQI BILAN TO'LIQ REAL BOSHQARUV PANELI
  return (
    <div className="flex-1 flex flex-col">
      {/* Top Bar */}
      <header className="h-16 bg-surface-1 border-b border-border-hairline px-6 flex items-center justify-between sticky top-0 z-30">
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
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-green-500/10 text-green-400 border border-green-500/20">
              Real Supabase
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={loadSupabaseData}
            className="p-2 rounded-lg border border-border-hairline text-text-muted hover:text-gold-primary transition-colors"
            title="Ma’lumotlarni yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loadingData ? 'animate-spin' : ''}`} />
          </button>
          <span className="text-xs text-text-muted hidden sm:inline">{user?.email}</span>
          <button
            type="button"
            onClick={signOut}
            className="p-2 rounded-lg border border-border-hairline hover:border-red-400 text-text-muted hover:text-red-400 transition-colors"
            title="Chiqish"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Navigatsiya */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 border-b border-border-hairline pb-4 mb-6 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Boshqaruv', icon: LayoutDashboard },
            { id: 'products', label: `Mahsulotlar (${products.length})`, icon: Package },
            { id: 'orders', label: `Buyurtmalar (${orders.length})`, icon: ShoppingBag },
            { id: 'reviews', label: `Sharhlar (${reviews.length}${pendingReviewsCount > 0 ? ` · ${pendingReviewsCount} yangi` : ''})`, icon: MessageSquare },
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="p-5 sm:p-6 rounded-2xl bg-surface-1 border border-border-hairline">
                <span className="text-[11px] uppercase tracking-wider text-text-muted block">Buyurtmalar</span>
                <strong className="text-3xl font-serif text-text-main mt-2 block">{orders.length}</strong>
                <span className="text-xs text-green-500 mt-1 block">Real Supabase bazasidan</span>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-surface-1 border border-border-hairline">
                <span className="text-[11px] uppercase tracking-wider text-text-muted block">Jami Tushum</span>
                <strong className="text-3xl font-serif text-gold-primary mt-2 block">{formatPrice(totalRevenue)}</strong>
                <span className="text-xs text-text-muted mt-1 block">Rasmiylashtirilgan xaridlar</span>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-surface-1 border border-border-hairline">
                <span className="text-[11px] uppercase tracking-wider text-text-muted block">Kam qolgan tovarlar</span>
                <strong className="text-3xl font-serif text-red-400 mt-2 block">{lowStockCount}</strong>
                <span className="text-xs text-text-muted mt-1 block">Stok kamaygan</span>
              </div>

              <div className="p-5 sm:p-6 rounded-2xl bg-surface-1 border border-border-hairline">
                <span className="text-[11px] uppercase tracking-wider text-text-muted block">Moderatsiya / Sharhlar</span>
                <strong className="text-3xl font-serif text-text-main mt-2 block">{reviews.length}</strong>
                <span className="text-xs text-gold-light mt-1 block">{pendingReviewsCount} ta tasdiqlanmagan</span>
              </div>
            </div>

            {/* So'nggi buyurtmalar jadvali */}
            <div className="bg-surface-1 rounded-2xl border border-border-hairline p-4 sm:p-6">
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
                <p className="text-xs text-text-muted py-6 text-center">Hali buyurtmalar mavjud emas.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[540px]">
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
                          <td className="py-3 px-2 font-mono text-gold-primary">{o.order_number || o.id?.slice(0, 8)}</td>
                          <td className="py-3 px-2 text-text-main font-medium">{o.customer_name}</td>
                          <td className="py-3 px-2 text-text-muted">{o.phone || o.customer_phone}</td>
                          <td className="py-3 px-2 text-text-main font-semibold">{formatPrice(o.total)}</td>
                          <td className="py-3 px-2">
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-gold-primary/10 text-gold-primary">
                              {o.status || o.order_status || 'Kutilmoqda'}
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

        {/* 2. MAHSULOTLAR VA KATEGORIYALAR VIEW */}
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
              <table className="w-full text-left text-xs min-w-[620px]">
                <thead>
                  <tr className="border-b border-border-hairline text-text-muted uppercase text-[10px] tracking-wider bg-surface-2/40">
                    <th className="py-3.5 px-4">Nomi</th>
                    <th className="py-3.5 px-4">Brend</th>
                    <th className="py-3.5 px-4">Kategoriya</th>
                    <th className="py-3.5 px-4">Jins</th>
                    <th className="py-3.5 px-4">Narx</th>
                    <th className="py-3.5 px-4">Qoldiq</th>
                    <th className="py-3.5 px-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-hairline">
                  {products
                    .filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((p) => (
                      <tr key={p.id} className="hover:bg-surface-2/30">
                        <td className="py-3.5 px-4 font-serif text-text-main font-medium">{p.name}</td>
                        <td className="py-3.5 px-4 text-text-muted">{p.brand}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-medium bg-surface-2 text-gold-primary border border-border-hairline">
                            {p.department || p.categories[0] || 'atirlar'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-text-muted uppercase text-[10px]">{p.gender || 'unisex'}</td>
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

        {/* 3. SHARHLAR (NOO'RIN SHARHLARNI O'CHIRISH) VIEW */}
        {activeTab === 'reviews' && (
          <div className="bg-surface-1 rounded-2xl border border-border-hairline p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl text-text-main">Mijozlar Sharhlari & Moderatsiya</h3>
                <p className="text-xs text-text-muted font-light mt-0.5">
                  Noo‘rin, haqoratli yoki spam sharhlarni bazadan darhol o‘chiring yoki saytda ko‘rsatish uchun tasdiqlang.
                </p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-text-muted py-8 text-center">Bazada sharhlar mavjud emas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[620px]">
                  <thead>
                    <tr className="border-b border-border-hairline text-text-muted uppercase text-[10px] tracking-wider bg-surface-2/40">
                      <th className="py-3.5 px-3">Muallif</th>
                      <th className="py-3.5 px-3">Baho</th>
                      <th className="py-3.5 px-3 max-w-sm">Sharh matni</th>
                      <th className="py-3.5 px-3">Holat</th>
                      <th className="py-3.5 px-3 text-right">Moderatsiya</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-hairline">
                    {reviews.map((r) => (
                      <tr key={r.id} className="hover:bg-surface-2/30">
                        <td className="py-3.5 px-3 font-medium text-text-main">
                          {r.customer_name || r.reviewer || 'Anonim'}
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-0.5 text-gold-primary">
                            {Array.from({ length: r.rating || 5 }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-text-muted max-w-md break-words">
                          {r.review_text || r.text}
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                              r.status === 'approved'
                                ? 'bg-green-500/10 text-green-400'
                                : r.status === 'rejected'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-gold-primary/10 text-gold-primary'
                            }`}
                          >
                            {r.status || 'Kutilmoqda'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right space-x-2">
                          {r.status !== 'approved' && (
                            <button
                              type="button"
                              onClick={() => handleReviewStatusChange(r.id, 'approved')}
                              className="px-2.5 py-1 rounded bg-green-500/15 text-green-400 hover:bg-green-500/25 text-[11px] font-medium"
                              title="Saytda ko‘rsatish uchun tasdiqlash"
                            >
                              Tasdiqlash
                            </button>
                          )}
                          {r.status !== 'rejected' && (
                            <button
                              type="button"
                              onClick={() => handleReviewStatusChange(r.id, 'rejected')}
                              className="px-2.5 py-1 rounded bg-surface-2 text-text-muted hover:text-text-main text-[11px]"
                              title="Rad etish"
                            >
                              Rad etish
                            </button>
                          )}
                          {/* Noo'rin sharhni butunlay o'chirish */}
                          <button
                            type="button"
                            onClick={() => handleDeleteReview(r.id)}
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors inline-block"
                            title="Noo‘rin sharhni o‘chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. BUYURTMALAR VIEW */}
        {activeTab === 'orders' && (
          <div className="bg-surface-1 rounded-2xl border border-border-hairline p-6">
            <h3 className="font-serif text-xl text-text-main mb-4">Barcha buyurtmalar</h3>

            {orders.length === 0 ? (
              <p className="text-xs text-text-muted py-8 text-center">Buyurtmalar mavjud emas.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[680px]">
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
                        <td className="py-3.5 px-3 font-mono text-gold-primary">{o.order_number || o.id?.slice(0, 8)}</td>
                        <td className="py-3.5 px-3 text-text-main font-medium">{o.customer_name}</td>
                        <td className="py-3.5 px-3 text-text-muted">{o.phone || o.customer_phone}</td>
                        <td className="py-3.5 px-3 text-text-muted max-w-xs truncate">{o.address || o.customer_address}</td>
                        <td className="py-3.5 px-3 text-text-main font-semibold">{formatPrice(o.total)}</td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-semibold inline-flex items-center gap-1 ${
                              o.status === 'delivered' || o.order_status === 'delivered'
                                ? 'bg-green-500/10 text-green-400'
                                : o.status === 'cancelled' || o.order_status === 'cancelled'
                                ? 'bg-red-500/10 text-red-400'
                                : 'bg-gold-primary/10 text-gold-primary'
                            }`}
                          >
                            {o.status === 'delivered' || o.order_status === 'delivered' ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : o.status === 'cancelled' || o.order_status === 'cancelled' ? (
                              <XCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            <span>{o.status || o.order_status || 'Jarayonda'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <select
                            value={o.status || o.order_status || 'pending'}
                            onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                            className="bg-surface-2 text-text-main text-xs px-2.5 py-1 rounded-lg border border-border-hairline outline-none"
                          >
                            <option value="pending">Kutilmoqda</option>
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

        {/* 5. OMBOR VIEW */}
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

      {/* Yangi Mahsulot Qo'shish Modali (Kategoriyalar bilan) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-surface-1 rounded-2xl border border-border-hairline p-5 sm:p-8 z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl text-text-main mb-4">Yangi Mahsulot Qo‘shish</h3>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Mahsulot nomi</label>
                <input
                  type="text"
                  required
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Mahsulot nomi"
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
                    placeholder="Brend"
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
                    placeholder="0"
                    className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                  />
                </div>
              </div>

              {/* Kategoriya Tanlash */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Kategoriya</label>
                <select
                  value={newProductDept}
                  onChange={(e) => setNewProductDept(e.target.value)}
                  className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary cursor-pointer"
                >
                  {allCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {newProductDept === 'custom' && (
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-gold-primary block mb-1">
                    Yangi Kategoriya Nomi
                  </label>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Kategoriya nomi"
                    className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-gold-primary outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Jins</label>
                  <select
                    value={newProductGender}
                    onChange={(e) => setNewProductGender(e.target.value)}
                    className="w-full bg-surface-2 text-text-main text-xs px-3 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary cursor-pointer"
                  >
                    <option value="unisex">Uniseks</option>
                    <option value="erkaklar">Erkaklar</option>
                    <option value="ayollar">Ayollar</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Stok soni</label>
                  <input
                    type="number"
                    required
                    value={newProductStock}
                    onChange={(e) => setNewProductStock(e.target.value)}
                    placeholder="10"
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
                  placeholder="Xushbo‘y notalari va qisqacha tavsif..."
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
                  disabled={submittingProduct}
                  className="flex-1 py-2.5 rounded-xl bg-gold-primary hover:bg-gold-light text-black text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
                >
                  {submittingProduct ? 'Saqlanmoqda...' : 'Bazada saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
