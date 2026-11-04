'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { initialProducts } from '@/lib/data/products';
import { Product, Order, Review, SiteContent } from '@/types/database';
import { productsService, ordersService, reviewsService, contentService } from '@/services';
import { checkIsAdmin } from '@/lib/auth/adminAuth';
import { useAuthStore } from '@/store/useAuthStore';
import { useSiteContentStore } from '@/store/useSiteContentStore';
import { uploadImage } from '@/lib/supabase/storage';
import { formatPrice } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  AlertTriangle,
  MessageSquare,
  Users,
  Plus,
  Trash2,
  ArrowLeft,
  Search,
  Lock,
  LogOut,
  Star,
  RefreshCw,
  FileText,
  Upload,
  Image as ImageIcon,
  Save,
  Check,
  Edit,
  Eye,
  X,
  Phone,
  MapPin,
  ToggleLeft,
  ToggleRight,
  ShieldAlert,
} from 'lucide-react';

export default function AdminPage() {
  const { user, isAdmin, signIn, signOut, checkSession } = useAuthStore();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Tab boshqaruvi
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'orders' | 'reviews' | 'customers' | 'inventory' | 'content'
  >('dashboard');

  // Backenddan keluvchi ma'lumotlar holati
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(false);

  // Qidiruv va filtrlar
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [productDeptFilter, setProductDeptFilter] = useState<string>('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [reviewStatusFilter, setReviewStatusFilter] = useState<string>('all');

  // Sayt Kontentini boshqarish holati (CMS)
  const { content, updateFullContent, fetchContent: fetchSiteContent } = useSiteContentStore();
  const [editingContent, setEditingContent] = useState<SiteContent>(content);
  const [savingContent, setSavingContent] = useState(false);
  const [contentSaveSuccess, setContentSaveSuccess] = useState(false);

  // Modallar
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Yangi mahsulot formasi
  const [newProductName, setNewProductName] = useState('');
  const [newProductBrand, setNewProductBrand] = useState('NOXAR');
  const [newProductPrice, setNewProductPrice] = useState('890000');
  const [newProductStock, setNewProductStock] = useState('10');
  const [newProductDept, setNewProductDept] = useState('atirlar');
  const [customCategory, setCustomCategory] = useState('');
  const [newProductGender, setNewProductGender] = useState('unisex');
  const [newProductNotes, setNewProductNotes] = useState('');
  const [newProductImage, setNewProductImage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  // Tahrirlash formasi
  const [editName, setEditName] = useState('');
  const [editBrand, setEditBrand] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editGender, setEditGender] = useState('unisex');
  const [editNotes, setEditNotes] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [updatingProduct, setUpdatingProduct] = useState(false);

  useEffect(() => {
    setEditingContent(content);
  }, [content]);

  // 1. Foydalanuvchi sessiyasini tekshirish
  useEffect(() => {
    async function verifyUser() {
      setCheckingAuth(true);
      await checkSession();
      setCheckingAuth(false);
    }
    verifyUser();
  }, [checkSession]);

  // 2. Real ma'lumotlarni Service Layer orqali yuklash
  const loadSupabaseData = useCallback(async () => {
    setLoadingData(true);
    try {
      // Mahsulotlar
      const remoteProducts = await productsService.fetchProducts();
      setProducts(remoteProducts);

      // Sayt Kontenti (CMS)
      await fetchSiteContent();

      // Buyurtmalar
      const remoteOrders = await ordersService.fetchOrders();
      setOrders(remoteOrders);

      // Sharhlar (Reviews)
      const remoteReviews = await reviewsService.fetchAllReviews();
      setReviews(remoteReviews);
    } catch (err) {
      console.warn('Admin ma’lumotlarini yuklashda xatolik:', err);
    } finally {
      setLoadingData(false);
    }
  }, [fetchSiteContent]);

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

  // Yangi Mahsulot Qo'shish (Service Layer orqali)
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProduct(true);

    const finalCategory =
      newProductDept === 'custom' ? customCategory.trim().toLowerCase() || 'atirlar' : newProductDept;
    const amount = Number(newProductPrice);

    const res = await productsService.createProduct({
      name: newProductName,
      brand: newProductBrand,
      price: amount,
      stock: Number(newProductStock),
      category: finalCategory,
      gender: newProductGender,
      description: newProductNotes,
      image: newProductImage || undefined,
      active: true,
    });

    if (res.data) {
      setProducts([res.data, ...products]);
    }

    setSubmittingProduct(false);
    setShowAddModal(false);
    setNewProductName('');
    setNewProductNotes('');
    setCustomCategory('');
    setNewProductImage('');
  };

  // Mahsulotni tahrirlash oynasini ochish
  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditName(p.name);
    setEditBrand(p.brand);
    setEditPrice(String(p.amount));
    setEditStock(String(p.stock));
    setEditDept(p.department || 'atirlar');
    setEditGender(p.gender || 'unisex');
    setEditNotes(p.notes || p.description || '');
    setEditImage(p.image || '');
    setEditActive(p.active !== false);
  };

  // Mahsulotni tahrirlash (Service Layer orqali)
  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setUpdatingProduct(false);

    const amount = Number(editPrice);
    const updatedItem: Product = {
      ...editingProduct,
      name: editName,
      brand: editBrand,
      price: `${amount.toLocaleString('uz-UZ')} so'm`,
      amount,
      stock: Number(editStock),
      department: editDept,
      categories: [editDept, editGender],
      gender: editGender as any,
      notes: editNotes,
      description: editNotes,
      image: editImage || undefined,
      active: editActive,
    };

    await productsService.updateProduct(editingProduct.id, {
      name: editName,
      brand: editBrand,
      price: amount,
      stock: Number(editStock),
      category: editDept,
      gender: editGender,
      description: editNotes,
      image: editImage || undefined,
      active: editActive,
    });

    setProducts(products.map((p) => (p.id === editingProduct.id ? updatedItem : p)));
    setUpdatingProduct(false);
    setEditingProduct(null);
  };

  // Mahsulotni o'chirish (Service Layer orqali)
  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Haqiqatan ham bu mahsulotni o‘chirmoqchimisiz?')) return;
    setProducts(products.filter((p) => p.id !== id));
    await productsService.deleteProduct(id);
  };

  // Mahsulot faolligini tezkor o'zgartirish (Toggle Active/Inactive)
  const handleToggleProductActive = async (p: Product) => {
    const currentActive = p.active !== false;
    const newStatus = !currentActive;
    setProducts(products.map((item) => (item.id === p.id ? { ...item, active: newStatus } : item)));
    await productsService.toggleActive(p.id, currentActive);
  };

  // Stokni tezkor o'zgartirish (+1 / -1)
  const handleStockDelta = async (p: Product, delta: number) => {
    const newStock = Math.max(0, p.stock + delta);
    setProducts(products.map((item) => (item.id === p.id ? { ...item, stock: newStock } : item)));
    await productsService.updateStock(p.id, newStock);
  };

  // Buyurtma holatini yangilash (Service Layer orqali)
  const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus, order_status: newStatus } : o));
    setOrders(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus, order_status: newStatus });
    }
    await ordersService.updateOrderStatus(orderId, newStatus);
  };

  // Buyurtmani o'chirish (Service Layer orqali)
  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Ushbu buyurtmani butunlay o‘chirmoqchimisiz?')) return;
    setOrders(orders.filter((o) => o.id !== orderId));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(null);
    }
    await ordersService.deleteOrder(orderId);
  };

  // Sharh holatini tasdiqlash / rad etish (Service Layer orqali)
  const handleReviewStatusChange = async (reviewId: string, status: 'approved' | 'rejected') => {
    const updated = reviews.map((r) => (r.id === reviewId ? { ...r, status } : r));
    setReviews(updated);
    await reviewsService.updateReviewStatus(reviewId, status);
  };

  // Noo'rin sharhni o'chirish (Service Layer orqali)
  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Ushbu noo‘rin sharhni butunlay o‘chirmoqchimisiz?')) return;
    setReviews(reviews.filter((r) => r.id !== reviewId));
    await reviewsService.deleteReview(reviewId);
  };

  // Sayt Kontentini (CMS) saqlash
  const handleSaveContent = async () => {
    setSavingContent(true);
    setContentSaveSuccess(false);
    try {
      const ok = await updateFullContent(editingContent);
      if (ok) {
        setContentSaveSuccess(true);
        setTimeout(() => setContentSaveSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Kontent saqlashda xatolik:', err);
    } finally {
      setSavingContent(false);
    }
  };

  // Kategoriyalar
  const allCategories = [
    { id: 'atirlar', label: 'Atirlar' },
    { id: 'body-fragrance', label: 'Tana parvarishi' },
    { id: 'deodorants', label: 'Dezodorantlar' },
    { id: 'perfume-oils', label: 'Parfyum moylari' },
    { id: 'home-fragrance', label: 'Uy aromatlari' },
    { id: 'bath-shower', label: 'Dush & vanna' },
    { id: 'accessories', label: 'Aksessuarlar' },
    { id: 'gift-sets', label: 'Sovg‘a to‘plamlari' },
    { id: 'custom', label: '+ Yangi kategoriya kiritish...' },
  ];

  // Statistika ko'rsatkichlari
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const lowStockProducts = products.filter((p) => p.stock <= 4);
  const pendingReviews = reviews.filter((r) => r.status === 'pending');
  const pendingOrders = orders.filter((o) => (o.status || o.order_status) === 'pending');

  // Mijozlar ro'yxatini shakllantirish (Mijozlar LTV)
  const customerMap = new Map<string, { name: string; phone: string; address: string; ordersCount: number; totalSpent: number; lastDate: string }>();
  orders.forEach((o) => {
    const key = o.phone || o.customer_phone || o.customer_name;
    if (!key) return;
    const existing = customerMap.get(key);
    const amount = Number(o.total) || 0;
    const date = o.created_at || '';
    if (existing) {
      existing.ordersCount += 1;
      existing.totalSpent += amount;
      if (date && date > existing.lastDate) existing.lastDate = date;
    } else {
      customerMap.set(key, {
        name: o.customer_name || 'Noma’lum mijoz',
        phone: o.phone || o.customer_phone || '-',
        address: o.address || o.customer_address || '-',
        ordersCount: 1,
        totalSpent: amount,
        lastDate: date,
      });
    }
  });
  const customersList = Array.from(customerMap.values());

  // Filtrlangan ma'lumotlar
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = productDeptFilter === 'all' || p.department === productDeptFilter;
    return matchesSearch && matchesDept;
  });

  const filteredOrders = orders.filter((o) => {
    const status = o.status || o.order_status || 'pending';
    const matchesStatus = orderStatusFilter === 'all' || status === orderStatusFilter;
    const matchesSearch =
      !searchQuery ||
      o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.phone?.includes(searchQuery) ||
      o.customer_phone?.includes(searchQuery) ||
      o.order_number?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredReviews = reviews.filter((r) => {
    const status = r.status || 'pending';
    return reviewStatusFilter === 'all' || status === reviewStatusFilter;
  });

  // Sessiya yuklanayotganda
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface-0 text-text-muted text-xs">
        <RefreshCw className="w-4 h-4 text-gold-primary animate-spin mr-2" />
        <span>Admin sessiyasi tekshirilmoqda...</span>
      </div>
    );
  }

  // 1-HOLAT: Foydalanuvchi kirmagan bo'lsa yoki Admin bo'lmasa -> REAL SUPABASE LOGIN FORMASI
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-surface-0">
        <div className="w-full max-w-sm bg-surface-1 border border-border-hairline rounded-2xl p-6 sm:p-8 shadow-2xl text-center">
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
    <div className="flex-1 flex flex-col bg-surface-0 min-h-screen">
      {/* Top Bar (Barcha ekranlarga moslashtirilgan) */}
      <header className="h-16 bg-surface-1 border-b border-border-hairline px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5 sm:gap-4">
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
            <h1 className="font-serif text-sm sm:text-base tracking-wider text-text-main font-semibold">
              NOXAR ADMIN
            </h1>
            <span className="hidden md:inline-block px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-green-500/10 text-green-400 border border-green-500/20">
              Real Supabase
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={loadSupabaseData}
            className="p-2 rounded-lg border border-border-hairline text-text-muted hover:text-gold-primary transition-colors flex items-center gap-1.5 text-xs"
            title="Ma’lumotlarni yangilash"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin text-gold-primary' : ''}`} />
            <span className="hidden lg:inline text-[11px]">Yangilash</span>
          </button>
          <span className="text-xs text-text-muted hidden md:inline truncate max-w-[150px]">{user?.email}</span>
          <button
            type="button"
            onClick={signOut}
            className="p-2 rounded-lg border border-border-hairline hover:border-red-400 text-text-muted hover:text-red-400 transition-colors"
            title="Tizimdan chiqish"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Admin Asosiy Maydoni */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full py-5 flex-1 flex flex-col">
        {/* Gorizontal Scrollable Tabs (Mobile uchun qulay) */}
        <div className="flex items-center gap-2 border-b border-border-hairline pb-3 mb-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'dashboard', label: 'Boshqaruv', icon: LayoutDashboard, count: null },
            { id: 'products', label: 'Mahsulotlar', icon: Package, count: products.length },
            { id: 'orders', label: 'Buyurtmalar', icon: ShoppingBag, count: orders.length, alert: pendingOrders.length },
            { id: 'reviews', label: 'Sharhlar', icon: MessageSquare, count: reviews.length, alert: pendingReviews.length },
            { id: 'customers', label: 'Mijozlar', icon: Users, count: customersList.length },
            { id: 'inventory', label: 'Ombor', icon: AlertTriangle, count: lowStockProducts.length, alert: lowStockProducts.length },
            { id: 'content', label: 'Sayt Matnlari (CMS)', icon: FileText, count: null },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchQuery('');
                }}
                className={`px-3.5 py-2 rounded-xl text-xs uppercase tracking-wider font-medium flex items-center gap-2 whitespace-nowrap transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-gold-primary text-black font-semibold shadow-sm'
                    : 'bg-surface-1 border border-border-hairline text-text-muted hover:text-text-main hover:bg-surface-2'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive
                        ? 'bg-black/20 text-black'
                        : tab.alert
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-surface-2 text-text-muted'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 1. DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-surface-1 border border-border-hairline">
                <span className="text-[11px] uppercase tracking-wider text-text-muted block">Jami Buyurtmalar</span>
                <strong className="text-3xl font-serif text-text-main mt-2 block">{orders.length}</strong>
                <span className="text-xs text-green-400 mt-1 block">
                  {pendingOrders.length} ta yangi kutilmoqda
                </span>
              </div>

              <div className="p-5 rounded-2xl bg-surface-1 border border-border-hairline">
                <span className="text-[11px] uppercase tracking-wider text-text-muted block">Jami Tushum</span>
                <strong className="text-3xl font-serif text-gold-primary mt-2 block">{formatPrice(totalRevenue)}</strong>
                <span className="text-xs text-text-muted mt-1 block">Barcha qabul qilingan to‘lovlar</span>
              </div>

              <div className="p-5 rounded-2xl bg-surface-1 border border-border-hairline">
                <span className="text-[11px] uppercase tracking-wider text-text-muted block">Kam Qolgan Mahsulotlar</span>
                <strong className="text-3xl font-serif text-red-400 mt-2 block">{lowStockProducts.length}</strong>
                <span className="text-xs text-text-muted mt-1 block">Zaxirani to‘ldirish kerak</span>
              </div>

              <div className="p-5 rounded-2xl bg-surface-1 border border-border-hairline">
                <span className="text-[11px] uppercase tracking-wider text-text-muted block">Kutilayotgan Sharhlar</span>
                <strong className="text-3xl font-serif text-text-main mt-2 block">{pendingReviews.length}</strong>
                <span className="text-xs text-gold-light mt-1 block">Moderatsiya talab qilinadi</span>
              </div>
            </div>

            {/* So'nggi buyurtmalar */}
            <div className="bg-surface-1 rounded-2xl border border-border-hairline p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-base sm:text-lg text-text-main">So‘nggi buyurtmalar</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className="text-xs text-gold-primary hover:underline"
                >
                  Barchasini ko‘rish →
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-text-muted py-6 text-center">Hali buyurtmalar kelib tushmagan.</p>
              ) : (
                <>
                  {/* Mobil ko'rinish (Cards) */}
                  <div className="block md:hidden space-y-3">
                    {orders.slice(0, 5).map((o, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedOrder(o)}
                        className="p-3.5 bg-surface-2/60 rounded-xl border border-border-hairline cursor-pointer hover:border-gold-primary/40 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs text-gold-primary font-semibold">
                            {o.order_number || o.id?.slice(0, 8)}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-gold-primary/10 text-gold-primary">
                            {o.status || o.order_status || 'Kutilmoqda'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-text-main font-medium">{o.customer_name}</span>
                          <span className="text-gold-primary font-serif font-semibold">{formatPrice(o.total)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop ko'rinish (Jadval) */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border-hairline text-text-muted uppercase text-[10px] tracking-wider">
                          <th className="py-3 px-2">Raqam</th>
                          <th className="py-3 px-2">Mijoz</th>
                          <th className="py-3 px-2">Telefon</th>
                          <th className="py-3 px-2">Summa</th>
                          <th className="py-3 px-2">Holat</th>
                          <th className="py-3 px-2 text-right">Batafsil</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-hairline">
                        {orders.slice(0, 5).map((o, idx) => (
                          <tr key={idx} className="hover:bg-surface-2/40">
                            <td className="py-3 px-2 font-mono text-gold-primary font-medium">
                              {o.order_number || o.id?.slice(0, 8)}
                            </td>
                            <td className="py-3 px-2 text-text-main font-medium">{o.customer_name}</td>
                            <td className="py-3 px-2 text-text-muted">{o.phone || o.customer_phone}</td>
                            <td className="py-3 px-2 text-text-main font-semibold">{formatPrice(o.total)}</td>
                            <td className="py-3 px-2">
                              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-gold-primary/10 text-gold-primary">
                                {o.status || o.order_status || 'Kutilmoqda'}
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedOrder(o)}
                                className="p-1.5 rounded-lg border border-border-hairline hover:text-gold-primary text-text-muted"
                                title="Batafsil ko‘rish"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 2. MAHSULOTLAR VIEW (CRUD + Dual View) */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {/* Filtrlar va Yangi mahsulot tugmasi */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-1 p-3 sm:p-4 rounded-xl border border-border-hairline">
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Mahsulot nomi yoki brend bo‘yicha qidirish..."
                    className="w-full bg-surface-2 text-text-main text-xs pl-8 pr-3 py-2 rounded-lg border border-border-hairline outline-none focus:border-gold-primary"
                  />
                </div>

                <select
                  value={productDeptFilter}
                  onChange={(e) => setProductDeptFilter(e.target.value)}
                  className="bg-surface-2 text-text-main text-xs px-3 py-2 rounded-lg border border-border-hairline outline-none focus:border-gold-primary cursor-pointer"
                >
                  <option value="all">Barcha kategoriyalar</option>
                  {allCategories
                    .filter((c) => c.id !== 'custom')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                </select>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 rounded-xl bg-gold-primary hover:bg-gold-light text-black text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Yangi mahsulot</span>
              </button>
            </div>

            {/* Mahsulotlar ro'yxati */}
            {filteredProducts.length === 0 ? (
              <div className="bg-surface-1 rounded-2xl border border-border-hairline p-8 text-center text-xs text-text-muted">
                Qidiruv bo‘yicha mahsulot topilmadi.
              </div>
            ) : (
              <>
                {/* Mobil ko'rinish (Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      className="bg-surface-1 rounded-xl border border-border-hairline p-3.5 flex flex-col justify-between space-y-3"
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-20 rounded-lg bg-surface-2 border border-border-hairline flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                          ) : (
                            <span className="font-serif text-lg text-gold-primary">N</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] text-text-muted uppercase tracking-wider block truncate">
                              {p.brand}
                            </span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ${
                                p.active !== false
                                  ? 'bg-green-500/10 text-green-400'
                                  : 'bg-surface-2 text-text-muted'
                              }`}
                            >
                              {p.active !== false ? 'Faol' : 'Nofaol'}
                            </span>
                          </div>

                          <h4 className="font-serif text-sm text-text-main font-medium truncate mt-0.5">{p.name}</h4>
                          <span className="text-xs text-gold-primary font-serif font-semibold block mt-1">
                            {p.price}
                          </span>

                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-text-muted uppercase">{p.department}</span>
                            <span className="text-text-muted">•</span>
                            <span
                              className={`text-[10px] font-semibold ${
                                p.stock <= 3 ? 'text-red-400' : 'text-text-muted'
                              }`}
                            >
                              {p.stock} dona qoldi
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mobil Amallar */}
                      <div className="pt-2 border-t border-border-hairline flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleProductActive(p)}
                          className="px-2.5 py-1 rounded bg-surface-2 text-text-muted hover:text-text-main text-[11px] flex items-center gap-1"
                        >
                          {p.active !== false ? (
                            <ToggleRight className="w-4 h-4 text-green-400" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-text-muted" />
                          )}
                          <span>{p.active !== false ? 'O‘chirish' : 'Yoqish'}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg border border-border-hairline text-text-muted hover:text-gold-primary hover:bg-surface-2 transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1.5 rounded-lg border border-border-hairline text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            title="O‘chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop ko'rinish (Jadval) */}
                <div className="hidden md:block bg-surface-1 rounded-2xl border border-border-hairline overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead>
                      <tr className="border-b border-border-hairline text-text-muted uppercase text-[10px] tracking-wider bg-surface-2/40">
                        <th className="py-3.5 px-4">Mahsulot</th>
                        <th className="py-3.5 px-3">Brend</th>
                        <th className="py-3.5 px-3">Kategoriya</th>
                        <th className="py-3.5 px-3">Jins</th>
                        <th className="py-3.5 px-3">Narx</th>
                        <th className="py-3.5 px-3">Qoldiq</th>
                        <th className="py-3.5 px-3">Holat</th>
                        <th className="py-3.5 px-4 text-right">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-hairline">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-surface-2/30">
                          <td className="py-3.5 px-4 font-serif text-text-main font-medium">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-11 rounded bg-surface-2 border border-border-hairline flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {p.image ? (
                                  <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                                ) : (
                                  <span className="font-serif text-xs text-gold-primary">N</span>
                                )}
                              </div>
                              <span className="font-medium truncate max-w-[180px]">{p.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 text-text-muted">{p.brand}</td>
                          <td className="py-3.5 px-3">
                            <span className="px-2 py-0.5 rounded text-[10px] uppercase font-medium bg-surface-2 text-gold-primary border border-border-hairline">
                              {p.department || 'atirlar'}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-text-muted uppercase text-[10px]">{p.gender || 'unisex'}</td>
                          <td className="py-3.5 px-3 text-gold-primary font-semibold">{p.price}</td>
                          <td className="py-3.5 px-3">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleStockDelta(p, -1)}
                                className="w-5 h-5 rounded bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-text-muted"
                                title="Kamaytirish"
                              >
                                -
                              </button>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  p.stock <= 3 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                                }`}
                              >
                                {p.stock} dona
                              </span>
                              <button
                                type="button"
                                onClick={() => handleStockDelta(p, 1)}
                                className="w-5 h-5 rounded bg-surface-2 hover:bg-surface-3 flex items-center justify-center text-text-muted"
                                title="Oshirish"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <button
                              type="button"
                              onClick={() => handleToggleProductActive(p)}
                              className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                                p.active !== false
                                  ? 'bg-green-500/10 text-green-400'
                                  : 'bg-surface-2 text-text-muted'
                              }`}
                            >
                              {p.active !== false ? 'Faol' : 'Nofaol'}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(p)}
                              className="p-1.5 rounded-lg border border-border-hairline text-text-muted hover:text-gold-primary hover:bg-surface-2 transition-colors"
                              title="Tahrirlash"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p.id)}
                              className="p-1.5 rounded-lg border border-border-hairline text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="O‘chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* 3. BUYURTMALAR VIEW (Barcha buyurtmalar va Tafsilotlar) */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {/* Status filtrlari */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-surface-1 p-3 sm:p-4 rounded-xl border border-border-hairline">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: 'all', label: 'Barchasi' },
                  { id: 'pending', label: 'Kutilmoqda' },
                  { id: 'processing', label: 'Jarayonda' },
                  { id: 'delivered', label: 'Yetkazildi' },
                  { id: 'cancelled', label: 'Bekor qilindi' },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setOrderStatusFilter(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                      orderStatusFilter === s.id
                        ? 'bg-surface-2 text-gold-primary font-semibold border border-gold-primary/40'
                        : 'text-text-muted hover:text-text-main'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Mijoz yoki raqam..."
                  className="w-full sm:w-56 bg-surface-2 text-text-main text-xs pl-8 pr-3 py-1.5 rounded-lg border border-border-hairline outline-none focus:border-gold-primary"
                />
              </div>
            </div>

            {/* Buyurtmalar ro'yxati */}
            {filteredOrders.length === 0 ? (
              <div className="bg-surface-1 rounded-2xl border border-border-hairline p-8 text-center text-xs text-text-muted">
                Tanlangan filtr bo‘yicha buyurtmalar mavjud emas.
              </div>
            ) : (
              <>
                {/* Mobil ko'rinish (Cards) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
                  {filteredOrders.map((o, idx) => (
                    <div
                      key={idx}
                      className="bg-surface-1 rounded-xl border border-border-hairline p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-gold-primary font-semibold">
                          {o.order_number || o.id?.slice(0, 8)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                            o.status === 'delivered'
                              ? 'bg-green-500/10 text-green-400'
                              : o.status === 'cancelled'
                              ? 'bg-red-500/10 text-red-400'
                              : 'bg-gold-primary/10 text-gold-primary'
                          }`}
                        >
                          {o.status || 'Kutilmoqda'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-medium text-text-main text-xs">{o.customer_name}</h4>
                        <span className="text-xs text-text-muted block mt-0.5">{o.phone || o.customer_phone}</span>
                        <span className="text-[11px] text-text-muted block truncate mt-0.5">
                          {o.address || o.customer_address}
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border-hairline">
                        <span className="text-sm font-serif font-semibold text-gold-primary">
                          {formatPrice(o.total)}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedOrder(o)}
                            className="px-2.5 py-1 rounded bg-surface-2 text-text-main hover:text-gold-primary text-xs flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Batafsil</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop ko'rinish (Jadval) */}
                <div className="hidden md:block bg-surface-1 rounded-2xl border border-border-hairline overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead>
                      <tr className="border-b border-border-hairline text-text-muted uppercase text-[10px] tracking-wider bg-surface-2/40">
                        <th className="py-3.5 px-4">Raqam</th>
                        <th className="py-3.5 px-3">Mijoz</th>
                        <th className="py-3.5 px-3">Telefon</th>
                        <th className="py-3.5 px-3">Manzil</th>
                        <th className="py-3.5 px-3">Summa</th>
                        <th className="py-3.5 px-3">Holat</th>
                        <th className="py-3.5 px-4 text-right">Amallar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-hairline">
                      {filteredOrders.map((o, idx) => (
                        <tr key={idx} className="hover:bg-surface-2/30">
                          <td className="py-3.5 px-4 font-mono text-gold-primary font-medium">
                            {o.order_number || o.id?.slice(0, 8)}
                          </td>
                          <td className="py-3.5 px-3 text-text-main font-medium">{o.customer_name}</td>
                          <td className="py-3.5 px-3 text-text-muted">{o.phone || o.customer_phone}</td>
                          <td className="py-3.5 px-3 text-text-muted max-w-xs truncate">
                            {o.address || o.customer_address}
                          </td>
                          <td className="py-3.5 px-3 text-text-main font-semibold">{formatPrice(o.total)}</td>
                          <td className="py-3.5 px-3">
                            <select
                              value={o.status || o.order_status || 'pending'}
                              onChange={(e) => handleOrderStatusChange(o.id, e.target.value)}
                              className="bg-surface-2 text-text-main text-[11px] px-2.5 py-1 rounded-lg border border-border-hairline outline-none cursor-pointer"
                            >
                              <option value="pending">Kutilmoqda</option>
                              <option value="processing">Jarayonda</option>
                              <option value="delivered">Yetkazildi</option>
                              <option value="cancelled">Bekor qilindi</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(o)}
                              className="p-1.5 rounded-lg border border-border-hairline text-text-muted hover:text-gold-primary hover:bg-surface-2 transition-colors"
                              title="Tafsilotlar"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOrder(o.id)}
                              className="p-1.5 rounded-lg border border-border-hairline text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              title="O‘chirish"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* 4. SHARHLAR VIEW (Moderatsiya + O'chirish) */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 bg-surface-1 p-3 rounded-xl border border-border-hairline overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'Barchasi' },
                { id: 'pending', label: 'Kutilayotgan (Moderatsiya)' },
                { id: 'approved', label: 'Tasdiqlangan' },
                { id: 'rejected', label: 'Rad etilgan' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setReviewStatusFilter(s.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all ${
                    reviewStatusFilter === s.id
                      ? 'bg-surface-2 text-gold-primary font-semibold border border-gold-primary/40'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {filteredReviews.length === 0 ? (
              <div className="bg-surface-1 rounded-2xl border border-border-hairline p-8 text-center text-xs text-text-muted">
                Sharhlar mavjud emas.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredReviews.map((r) => (
                  <div
                    key={r.id}
                    className="bg-surface-1 rounded-xl border border-border-hairline p-4 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-xs text-text-main">
                          {r.customer_name || r.reviewer || 'Anonim'}
                        </span>
                        <div className="flex items-center text-gold-primary">
                          {Array.from({ length: r.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-text-muted italic leading-relaxed">
                        “{r.review_text || r.text}”
                      </p>
                    </div>

                    <div className="pt-3 border-t border-border-hairline flex items-center justify-between">
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

                      <div className="flex items-center gap-1.5">
                        {r.status !== 'approved' && (
                          <button
                            type="button"
                            onClick={() => handleReviewStatusChange(r.id, 'approved')}
                            className="px-2 py-1 rounded bg-green-500/15 text-green-400 hover:bg-green-500/25 text-[11px] font-medium"
                          >
                            Tasdiqlash
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button
                            type="button"
                            onClick={() => handleReviewStatusChange(r.id, 'rejected')}
                            className="px-2 py-1 rounded bg-surface-2 text-text-muted hover:text-text-main text-[11px]"
                          >
                            Rad etish
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteReview(r.id)}
                          className="p-1 rounded text-red-400 hover:bg-red-500/10 transition-colors"
                          title="O‘chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. MIJOZLAR VIEW */}
        {activeTab === 'customers' && (
          <div className="space-y-4">
            <div className="bg-surface-1 rounded-xl border border-border-hairline p-4 flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base text-text-main">Mijozlar Bazasi ({customersList.length})</h3>
                <p className="text-xs text-text-muted font-light mt-0.5">
                  Do‘kondan buyurtma bergan mijozlar va ularning faolligi.
                </p>
              </div>
            </div>

            {customersList.length === 0 ? (
              <div className="bg-surface-1 rounded-2xl border border-border-hairline p-8 text-center text-xs text-text-muted">
                Hozircha mijozlar bazasi shakllanmagan.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customersList.map((c, idx) => (
                  <div key={idx} className="bg-surface-1 rounded-xl border border-border-hairline p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-serif text-sm text-text-main font-medium">{c.name}</h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-2 text-gold-primary">
                        {c.ordersCount} ta buyurtma
                      </span>
                    </div>

                    <div className="text-xs text-text-muted space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-gold-primary" />
                        <span>{c.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-gold-primary" />
                        <span className="truncate">{c.address}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border-hairline flex items-center justify-between text-xs">
                      <span className="text-text-muted">Jami xarid:</span>
                      <span className="font-serif font-semibold text-gold-primary">{formatPrice(c.totalSpent)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. OMBOR VIEW */}
        {activeTab === 'inventory' && (
          <div className="bg-surface-1 rounded-2xl border border-border-hairline p-4 sm:p-6 space-y-4">
            <div>
              <h3 className="font-serif text-lg text-text-main">Kam qolgan mahsulotlar nazorati</h3>
              <p className="text-xs text-text-muted font-light mt-0.5">
                Stok qoldig‘i 4 donadan kam qolgan tovarlar ro‘yxati.
              </p>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-8 text-center text-xs text-green-400">
                Ajoyib! Hozirda omborda barcha mahsulotlar zaxirasi yetarli.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl bg-surface-2/60 border border-border-hairline flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h4 className="font-serif text-sm text-text-main truncate">{p.name}</h4>
                      <span className="text-xs text-text-muted block">{p.brand}</span>
                      <span className="text-xs text-red-400 font-bold block mt-1">Faqat {p.stock} ta qoldi!</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStockDelta(p, 5)}
                        className="px-2.5 py-1.5 rounded-lg bg-gold-primary text-black text-xs font-semibold hover:bg-gold-light transition-colors"
                        title="Stokni +5 taga oshirish"
                      >
                        +5 ta
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 7. SAYT MATNLARI VA CMS VIEW */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-1 p-4 sm:p-6 rounded-2xl border border-border-hairline">
              <div>
                <h3 className="font-serif text-base sm:text-lg text-text-main">Sayt Matnlari va Kontent Boshqaruvi (CMS)</h3>
                <p className="text-xs text-text-muted font-light mt-1">
                  Barcha sarlavhalar, tavsiflar va kontaktlarni Supabase backend bazasida real vaqtda saqlang.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSaveContent}
                disabled={savingContent}
                className={`px-5 py-2.5 rounded-xl text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-all ${
                  contentSaveSuccess
                    ? 'bg-green-500 text-white'
                    : 'bg-gold-primary hover:bg-gold-light text-black disabled:opacity-50'
                }`}
              >
                {savingContent ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saqlanmoqda...</span>
                  </>
                ) : contentSaveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Bazada saqlandi!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>O‘zgarishlarni saqlash</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. E'lonlar satri */}
              <div className="bg-surface-1 rounded-2xl border border-border-hairline p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border-hairline pb-3">
                  <h4 className="font-serif text-sm text-text-main font-medium">1. E’lonlar satri (Announcement Bar)</h4>
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-text-muted">
                    <input
                      type="checkbox"
                      checked={editingContent.announcement?.active !== false}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          announcement: {
                            ...editingContent.announcement,
                            active: e.target.checked,
                          },
                        })
                      }
                      className="accent-gold-primary"
                    />
                    <span>Faol</span>
                  </label>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">
                    E’lon matni
                  </label>
                  <input
                    type="text"
                    value={editingContent.announcement?.text || ''}
                    onChange={(e) =>
                      setEditingContent({
                        ...editingContent,
                        announcement: {
                          ...editingContent.announcement,
                          text: e.target.value,
                        },
                      })
                    }
                    className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                  />
                </div>
              </div>

              {/* 2. Hero seksiyasi */}
              <div className="bg-surface-1 rounded-2xl border border-border-hairline p-5 space-y-4 lg:col-span-2">
                <div className="border-b border-border-hairline pb-3">
                  <h4 className="font-serif text-sm text-text-main font-medium">2. Bosh Sahifa Asosiy Bloki (Hero Section)</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Badj</label>
                    <input
                      type="text"
                      value={editingContent.hero?.badge || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          hero: { ...editingContent.hero, badge: e.target.value },
                        })
                      }
                      className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Sarlavha (1-qator)</label>
                    <input
                      type="text"
                      value={editingContent.hero?.title_line1 || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          hero: { ...editingContent.hero, title_line1: e.target.value },
                        })
                      }
                      className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-gold-primary block mb-1">
                      Ajratilgan / Kursiv So‘z
                    </label>
                    <input
                      type="text"
                      value={editingContent.hero?.title_highlight || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          hero: { ...editingContent.hero, title_highlight: e.target.value },
                        })
                      }
                      className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2 rounded-xl border border-gold-primary/60 outline-none focus:border-gold-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Sarlavha (2-qator)</label>
                    <input
                      type="text"
                      value={editingContent.hero?.title_line2 || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          hero: { ...editingContent.hero, title_line2: e.target.value },
                        })
                      }
                      className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Tugma Matni</label>
                    <input
                      type="text"
                      value={editingContent.hero?.cta_primary || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          hero: { ...editingContent.hero, cta_primary: e.target.value },
                        })
                      }
                      className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Tavsif (Subtitle)</label>
                  <textarea
                    rows={2}
                    value={editingContent.hero?.subtitle || ''}
                    onChange={(e) =>
                      setEditingContent({
                        ...editingContent,
                        hero: { ...editingContent.hero, subtitle: e.target.value },
                      })
                    }
                    className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary resize-none"
                  />
                </div>

                {/* Hero rasm */}
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Banner Rasmi</label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {editingContent.hero?.image_url ? (
                      <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-border-hairline bg-surface-2 flex items-center justify-center">
                        <img src={editingContent.hero.image_url} alt="Hero banner" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setEditingContent({
                              ...editingContent,
                              hero: { ...editingContent.hero, image_url: '' },
                            })
                          }
                          className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white hover:bg-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-16 rounded-xl border border-dashed border-border-hairline flex flex-col items-center justify-center text-text-muted text-[10px]">
                        <ImageIcon className="w-4 h-4 opacity-40 mb-0.5" />
                        <span>Flakon san'ati</span>
                      </div>
                    )}

                    <div className="flex-1 w-full space-y-2">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-2 border border-border-hairline hover:border-gold-primary text-xs text-text-main transition-colors">
                        <Upload className="w-3.5 h-3.5 text-gold-primary" />
                        <span>{uploadingImage ? 'Yuklanmoqda...' : 'Rasmni kompyuterdan tanlash'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadingImage(true);
                            try {
                              const url = await uploadImage(file, 'banners');
                              setEditingContent((prev) => ({
                                ...prev,
                                hero: { ...prev.hero, image_url: url },
                              }));
                            } finally {
                              setUploadingImage(false);
                            }
                          }}
                        />
                      </label>
                      <input
                        type="url"
                        value={editingContent.hero?.image_url || ''}
                        onChange={(e) =>
                          setEditingContent({
                            ...editingContent,
                            hero: { ...editingContent.hero, image_url: e.target.value },
                          })
                        }
                        placeholder="Yoki rasm havolasini kiriting (https://...)"
                        className="w-full bg-surface-2 text-text-main text-xs px-3 py-1.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Yangi Kolleksiya */}
              <div className="bg-surface-1 rounded-2xl border border-border-hairline p-5 space-y-4">
                <div className="border-b border-border-hairline pb-3">
                  <h4 className="font-serif text-sm text-text-main font-medium">3. Yangi Kolleksiya Bloki</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Badj</label>
                    <input
                      type="text"
                      value={editingContent.new_collection?.badge || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          new_collection: { ...editingContent.new_collection, badge: e.target.value },
                        })
                      }
                      className="w-full bg-surface-2 text-text-main text-xs px-3 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Sarlavha</label>
                    <input
                      type="text"
                      value={editingContent.new_collection?.title || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          new_collection: { ...editingContent.new_collection, title: e.target.value },
                        })
                      }
                      className="w-full bg-surface-2 text-text-main text-xs px-3 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-gold-primary block mb-1">Ajratilgan So‘z</label>
                  <input
                    type="text"
                    value={editingContent.new_collection?.title_highlight || ''}
                    onChange={(e) =>
                      setEditingContent({
                        ...editingContent,
                        new_collection: { ...editingContent.new_collection, title_highlight: e.target.value },
                      })
                    }
                    className="w-full bg-surface-2 text-text-main text-xs px-3 py-2 rounded-xl border border-gold-primary/60 outline-none focus:border-gold-primary"
                  />
                </div>
              </div>

              {/* 4. Katalog Bloki */}
              <div className="bg-surface-1 rounded-2xl border border-border-hairline p-5 space-y-4">
                <div className="border-b border-border-hairline pb-3">
                  <h4 className="font-serif text-sm text-text-main font-medium">4. Katalog Seksiyasi</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Badj</label>
                    <input
                      type="text"
                      value={editingContent.catalog?.badge || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          catalog: { ...editingContent.catalog, badge: e.target.value },
                        })
                      }
                      className="w-full bg-surface-2 text-text-main text-xs px-3 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Sarlavha</label>
                    <input
                      type="text"
                      value={editingContent.catalog?.title || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          catalog: { ...editingContent.catalog, title: e.target.value },
                        })
                      }
                      className="w-full bg-surface-2 text-text-main text-xs px-3 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-gold-primary block mb-1">Kursiv So‘z</label>
                  <input
                    type="text"
                    value={editingContent.catalog?.title_highlight || ''}
                    onChange={(e) =>
                      setEditingContent({
                        ...editingContent,
                        catalog: { ...editingContent.catalog, title_highlight: e.target.value },
                      })
                    }
                    className="w-full bg-surface-2 text-text-main text-xs px-3 py-2 rounded-xl border border-gold-primary/60 outline-none focus:border-gold-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Tavsif</label>
                  <input
                    type="text"
                    value={editingContent.catalog?.subtitle || ''}
                    onChange={(e) =>
                      setEditingContent({
                        ...editingContent,
                        catalog: { ...editingContent.catalog, subtitle: e.target.value },
                      })
                    }
                    className="w-full bg-surface-2 text-text-main text-xs px-3 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                  />
                </div>
              </div>

              {/* 5. Biz haqimizda & Showroom */}
              <div className="bg-surface-1 rounded-2xl border border-border-hairline p-5 space-y-4 lg:col-span-2">
                <div className="border-b border-border-hairline pb-3">
                  <h4 className="font-serif text-sm text-text-main font-medium">5. Biz haqimizda & Showroom</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Badj</label>
                    <input
                      type="text"
                      value={editingContent.brand_story?.badge || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          brand_story: { ...editingContent.brand_story, badge: e.target.value },
                        })
                      }
                      className="w-full bg-surface-2 text-text-main text-xs px-3 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Sarlavha</label>
                    <input
                      type="text"
                      value={editingContent.brand_story?.title || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          brand_story: { ...editingContent.brand_story, title: e.target.value },
                        })
                      }
                      className="w-full bg-surface-2 text-text-main text-xs px-3 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-gold-primary block mb-1">Kursiv So‘z</label>
                    <input
                      type="text"
                      value={editingContent.brand_story?.title_highlight || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          brand_story: { ...editingContent.brand_story, title_highlight: e.target.value },
                        })
                      }
                      className="w-full bg-surface-2 text-text-main text-xs px-3 py-2 rounded-xl border border-gold-primary/60 outline-none focus:border-gold-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Falsafa Matni</label>
                  <textarea
                    rows={3}
                    value={editingContent.brand_story?.description || ''}
                    onChange={(e) =>
                      setEditingContent({
                        ...editingContent,
                        brand_story: { ...editingContent.brand_story, description: e.target.value },
                      })
                    }
                    className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Showroom Nomi</label>
                    <input
                      type="text"
                      value={editingContent.brand_story?.showroom_name || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          brand_story: { ...editingContent.brand_story, showroom_name: e.target.value },
                        })
                      }
                      className="w-full bg-surface-2 text-text-main text-xs px-3 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Showroom Manzili</label>
                    <input
                      type="text"
                      value={editingContent.brand_story?.showroom_address || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          brand_story: { ...editingContent.brand_story, showroom_address: e.target.value },
                        })
                      }
                      className="w-full bg-surface-2 text-text-main text-xs px-3 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Google Maps Havolasi</label>
                    <input
                      type="url"
                      value={editingContent.brand_story?.maps_url || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          brand_story: { ...editingContent.brand_story, maps_url: e.target.value },
                        })
                      }
                      className="w-full bg-surface-2 text-text-main text-xs px-3 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                </div>
              </div>

              {/* 6. Aloqa & Footer */}
              <div className="bg-surface-1 rounded-2xl border border-border-hairline p-5 space-y-4 lg:col-span-2">
                <div className="border-b border-border-hairline pb-3">
                  <h4 className="font-serif text-sm text-text-main font-medium">6. Aloqa & Ijtimoiy Tarmoqlar</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Telefon</label>
                    <input
                      type="text"
                      value={editingContent.contacts?.phone || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          contacts: { ...editingContent.contacts, phone: e.target.value },
                        })
                      }
                      className="w-full bg-surface-2 text-text-main text-xs px-3 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Telegram Havolasi</label>
                    <input
                      type="url"
                      value={editingContent.contacts?.telegram || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          contacts: { ...editingContent.contacts, telegram: e.target.value },
                        })
                      }
                      className="w-full bg-surface-2 text-text-main text-xs px-3 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Instagram Havolasi</label>
                    <input
                      type="url"
                      value={editingContent.contacts?.instagram || ''}
                      onChange={(e) =>
                        setEditingContent({
                          ...editingContent,
                          contacts: { ...editingContent.contacts, instagram: e.target.value },
                        })
                      }
                      className="w-full bg-surface-2 text-text-main text-xs px-3 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Footer Shiori</label>
                  <input
                    type="text"
                    value={editingContent.contacts?.footer_slogan || ''}
                    onChange={(e) =>
                      setEditingContent({
                        ...editingContent,
                        contacts: { ...editingContent.contacts, footer_slogan: e.target.value },
                      })
                    }
                    className="w-full bg-surface-2 text-text-main text-xs px-3 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 1. Yangi Mahsulot Qo'shish Modali */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div onClick={() => setShowAddModal(false)} className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-surface-1 rounded-2xl border border-border-hairline p-5 sm:p-7 z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg sm:text-xl text-text-main">Yangi Mahsulot Qo‘shish</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3.5">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Kategoriya</label>
                  <select
                    value={newProductDept}
                    onChange={(e) => setNewProductDept(e.target.value)}
                    className="w-full bg-surface-2 text-text-main text-xs px-3 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary cursor-pointer"
                  >
                    {allCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
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
                    placeholder="Masalan: niche-parfum"
                    className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-gold-primary outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Boshlang‘ich stok</label>
                <input
                  type="number"
                  required
                  value={newProductStock}
                  onChange={(e) => setNewProductStock(e.target.value)}
                  placeholder="10"
                  className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                />
              </div>

              {/* Rasm Yuklash */}
              <div>
                <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Mahsulot Rasmi</label>
                <div className="flex items-center gap-3">
                  {newProductImage ? (
                    <div className="relative w-16 h-16 rounded-xl border border-border-hairline overflow-hidden bg-surface-2 flex items-center justify-center">
                      <img src={newProductImage} alt="Mahsulot" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setNewProductImage('')}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-500 text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null}

                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2 border border-border-hairline hover:border-gold-primary text-xs text-text-main transition-colors flex-1 justify-center">
                    <Upload className="w-3.5 h-3.5 text-gold-primary" />
                    <span>{uploadingImage ? 'Yuklanmoqda...' : 'Rasm faylini tanlash'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingImage(true);
                        try {
                          const url = await uploadImage(file, 'products');
                          if (url) setNewProductImage(url);
                        } finally {
                          setUploadingImage(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Notalar va tavsif</label>
                <textarea
                  rows={2}
                  value={newProductNotes}
                  onChange={(e) => setNewProductNotes(e.target.value)}
                  placeholder="Xushbo‘y kompozitsiya notalari..."
                  className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
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

      {/* 2. Mahsulotni Tahrirlash Modali */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div onClick={() => setEditingProduct(null)} className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-surface-1 rounded-2xl border border-border-hairline p-5 sm:p-7 z-10 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-lg sm:text-xl text-text-main">Mahsulotni Tahrirlash</h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-3.5">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Mahsulot nomi</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Brend</label>
                  <input
                    type="text"
                    required
                    value={editBrand}
                    onChange={(e) => setEditBrand(e.target.value)}
                    className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Narx (so‘m)</label>
                  <input
                    type="number"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Kategoriya</label>
                  <select
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                    className="w-full bg-surface-2 text-text-main text-xs px-3 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary cursor-pointer"
                  >
                    {allCategories
                      .filter((c) => c.id !== 'custom')
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.label}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Jins</label>
                  <select
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full bg-surface-2 text-text-main text-xs px-3 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary cursor-pointer"
                  >
                    <option value="unisex">Uniseks</option>
                    <option value="erkaklar">Erkaklar</option>
                    <option value="ayollar">Ayollar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 items-center">
                <div>
                  <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Qoldiq soni</label>
                  <input
                    type="number"
                    required
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary"
                  />
                </div>
                <div className="pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-text-main">
                    <input
                      type="checkbox"
                      checked={editActive}
                      onChange={(e) => setEditActive(e.target.checked)}
                      className="accent-gold-primary w-4 h-4"
                    />
                    <span>Saytda ko‘rsatish (Faol)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Mahsulot Rasmi</label>
                <div className="flex items-center gap-3">
                  {editImage ? (
                    <div className="relative w-16 h-16 rounded-xl border border-border-hairline overflow-hidden bg-surface-2 flex items-center justify-center">
                      <img src={editImage} alt="Mahsulot" className="w-full h-full object-contain" />
                      <button
                        type="button"
                        onClick={() => setEditImage('')}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-500 text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : null}

                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2 border border-border-hairline hover:border-gold-primary text-xs text-text-main transition-colors flex-1 justify-center">
                    <Upload className="w-3.5 h-3.5 text-gold-primary" />
                    <span>{uploadingImage ? 'Yuklanmoqda...' : 'Yangi rasm tanlash'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingImage(true);
                        try {
                          const url = await uploadImage(file, 'products');
                          if (url) setEditImage(url);
                        } finally {
                          setUploadingImage(false);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1">Tavsif</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full bg-surface-2 text-text-main text-xs px-3.5 py-2 rounded-xl border border-border-hairline outline-none focus:border-gold-primary resize-none"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border-hairline text-text-muted hover:bg-surface-2 text-xs"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={updatingProduct}
                  className="flex-1 py-2.5 rounded-xl bg-gold-primary hover:bg-gold-light text-black text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
                >
                  {updatingProduct ? 'Saqlanmoqda...' : 'O‘zgarishlarni saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Buyurtma Tafsilotlari Modali (Order Details) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/70 backdrop-blur-sm" />
          <div className="relative w-full max-w-lg bg-surface-1 rounded-2xl border border-border-hairline p-5 sm:p-7 z-10 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-border-hairline pb-3">
              <div>
                <span className="font-mono text-sm text-gold-primary font-bold">
                  {selectedOrder.order_number || selectedOrder.id}
                </span>
                <span className="text-[11px] text-text-muted block mt-0.5">Buyurtma tafsilotlari</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text-main"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mijoz ma'lumotlari */}
            <div className="p-3.5 bg-surface-2/60 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Mijoz:</span>
                <strong className="text-text-main">{selectedOrder.customer_name}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Telefon:</span>
                <a
                  href={`tel:${selectedOrder.phone || selectedOrder.customer_phone}`}
                  className="text-gold-primary hover:underline font-mono"
                >
                  {selectedOrder.phone || selectedOrder.customer_phone}
                </a>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-text-muted flex-shrink-0">Manzil:</span>
                <span className="text-text-main text-right">
                  {selectedOrder.address || selectedOrder.customer_address || 'Showroomdan olib ketish'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">To‘lov turi:</span>
                <span className="uppercase text-[11px] text-text-main font-semibold">
                  {selectedOrder.payment_method || 'Naqd'}
                </span>
              </div>
            </div>

            {/* Mahsulotlar ro'yxati */}
            <div>
              <span className="text-[11px] uppercase tracking-wider text-text-muted block mb-2 font-semibold">
                Buyurtma qilingan tovarlar
              </span>

              {selectedOrder.items && selectedOrder.items.length > 0 ? (
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-surface-2/40 border border-border-hairline flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-serif text-text-main block">{item.name}</span>
                        <span className="text-[10px] text-text-muted">
                          {formatPrice(item.amount)} × {item.quantity} dona
                        </span>
                      </div>
                      <span className="font-serif font-semibold text-gold-primary">
                        {formatPrice(item.amount * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-surface-2/40 rounded-lg text-xs text-text-muted text-center">
                  Standart to‘plam ({formatPrice(selectedOrder.total)})
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-border-hairline mt-3 text-sm">
                <span className="font-semibold text-text-main">Jami:</span>
                <strong className="font-serif text-base text-gold-primary">
                  {formatPrice(selectedOrder.total)}
                </strong>
              </div>
            </div>

            {/* Holatni o'zgartirish */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-text-muted block mb-1.5 font-semibold">
                Buyurtma holatini yangilash
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {[
                  { id: 'pending', label: 'Kutilmoqda' },
                  { id: 'processing', label: 'Jarayonda' },
                  { id: 'delivered', label: 'Yetkazildi' },
                  { id: 'cancelled', label: 'Bekor' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => handleOrderStatusChange(selectedOrder.id, st.id)}
                    className={`py-2 rounded-lg text-xs font-medium transition-all ${
                      (selectedOrder.status || selectedOrder.order_status) === st.id
                        ? 'bg-gold-primary text-black font-semibold'
                        : 'bg-surface-2 text-text-muted hover:text-text-main border border-border-hairline'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* O'chirish tugmasi */}
            <div className="pt-2 flex justify-between items-center">
              <button
                type="button"
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Buyurtmani o‘chirish</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-surface-2 text-xs text-text-main hover:bg-surface-3 transition-colors"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
