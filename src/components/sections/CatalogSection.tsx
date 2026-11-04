'use client';

import React, { useState, useEffect } from 'react';
import { Product, Department, Gender } from '@/types/database';
import { initialProducts } from '@/lib/data/products';
import { ProductCard } from '@/components/commerce/ProductCard';
import { supabase } from '@/lib/supabase/client';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

export const CatalogSection: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [loading, setLoading] = useState<boolean>(false);

  // Supabase dan real mahsulotlarni tortish
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && data.length > 0 && !error) {
          const remoteProducts: Product[] = data.map((item: any) => ({
            id: String(item.id),
            name: item.name,
            brand: item.brand || 'NOXAR',
            price: `${Number(item.price || 0).toLocaleString('uz-UZ')} so'm`,
            amount: Number(item.price || 0),
            notes: item.description || item.notes || 'Nafis premium kompozitsiya',
            categories: [item.category || 'atirlar', item.gender || 'unisex'],
            department: (item.category as Department) || 'atirlar',
            gender: (item.gender as Gender) || 'unisex',
            family: item.family || 'amber',
            volume: '50',
            rating: item.rating || 4.8,
            popularity: item.popularity || 80,
            art: item.art || 'black-art',
            badge: item.badge || '',
            top: item.top || 'Bosh nota',
            heart: item.heart || 'Yurak nota',
            base: item.base || 'Asosiy nota',
            description: item.description || '',
            usage: 'Puls nuqtalariga seping.',
            features: ['Eau de Parfum', item.gender || 'Uniseks'],
            stock: Number(item.stock || 5),
            image: item.image,
            active: item.active !== false,
          }));
          setProducts(remoteProducts);
        }
      } catch (e) {
        console.warn('Supabase fetch xatoligi, demo ma’lumotlar ishlatiladi.');
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // Filtrlash va saralash
  const filteredProducts = products.filter((p) => {
    const matchesDept =
      selectedDept === 'all' ||
      p.department === selectedDept ||
      p.categories.includes(selectedDept) ||
      (selectedDept === 'gift-sets' && p.categories.includes('sovga'));
    const matchesGender =
      selectedGender === 'all' || p.gender === selectedGender || p.categories.includes(selectedGender);
    return matchesDept && matchesGender;
  });

  filteredProducts.sort((a, b) => {
    if (sortBy === 'priceAsc') return a.amount - b.amount;
    if (sortBy === 'priceDesc') return b.amount - a.amount;
    if (sortBy === 'popular') return b.popularity - a.popularity;
    return 0;
  });

  // To'liq kengaytirilgan kategoriyalar
  const departments = [
    { id: 'all', label: 'Barchasi', icon: '✦' },
    { id: 'atirlar', label: 'Atirlar', icon: '♢' },
    { id: 'body-fragrance', label: 'Tana parvarishi', icon: '♡' },
    { id: 'deodorants', label: 'Dezodorant', icon: '◉' },
    { id: 'perfume-oils', label: 'Parfyum moylari', icon: '◌' },
    { id: 'home-fragrance', label: 'Uy aromati', icon: '⌂' },
    { id: 'bath-shower', label: 'Dush & vanna', icon: '≋' },
    { id: 'accessories', label: 'Aksessuarlar', icon: '◇' },
    { id: 'gift-sets', label: 'Sovg‘a to‘plamlari', icon: '🎁' },
  ];

  return (
    <section id="catalog" className="py-20 lg:py-28 border-b border-border-hairline bg-surface-0 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold-primary block mb-2 font-medium">
              Siz uchun tanlangan
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text-main">
              Tavsiya <span className="italic text-gold-light">etamiz</span>
            </h2>
          </div>
          <p className="text-text-muted text-xs sm:text-sm max-w-xs font-light">
            Har bir xarakter va kayfiyat uchun o‘ziga xos mualliflik kompozitsiyasi.
          </p>
        </div>

        {/* Bo'limlar Navigatsiyasi (Scrollable on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 pt-1 no-scrollbar border-b border-border-hairline mb-8">
          {departments.map((dept) => (
            <button
              key={dept.id}
              type="button"
              onClick={() => setSelectedDept(dept.id)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedDept === dept.id
                  ? 'bg-gold-primary text-black font-semibold shadow-sm'
                  : 'bg-surface-1 border border-border-hairline text-text-muted hover:text-text-main hover:border-gold-primary/30'
              }`}
            >
              <span className="text-[10px] opacity-80">{dept.icon}</span>
              <span>{dept.label}</span>
            </button>
          ))}
        </div>

        {/* Filtrlar va Saralash Paneli */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 bg-surface-1 p-4 rounded-xl border border-border-hairline">
          {/* Jins Filtr */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-muted uppercase tracking-wider hidden sm:inline">Jins:</span>
            <div className="flex gap-1.5">
              {[
                { id: 'all', label: 'Barchasi' },
                { id: 'ayollar', label: 'Ayollar' },
                { id: 'erkaklar', label: 'Erkaklar' },
                { id: 'unisex', label: 'Uniseks' },
              ].map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGender(g.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs tracking-wider transition-all ${
                    selectedGender === g.id
                      ? 'bg-surface-2 text-gold-primary font-semibold border border-gold-primary/40'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Saralash Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <SlidersHorizontal className="w-3.5 h-3.5 text-text-muted" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-2 text-text-main text-xs px-3 py-1.5 rounded-lg border border-border-hairline outline-none focus:border-gold-primary transition-all cursor-pointer"
            >
              <option value="default">Tavsiya etilgan</option>
              <option value="priceAsc">Narx: arzonidan</option>
              <option value="priceDesc">Narx: qimmatidan</option>
              <option value="popular">Ommabopligi</option>
            </select>
          </div>
        </div>

        {/* Mahsulotlar To'plami */}
        {loading ? (
          <div className="text-center py-20 text-text-muted text-sm flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-gold-primary animate-spin" />
            <span>Katalog yuklanmoqda...</span>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-1 rounded-2xl border border-border-hairline p-8">
            <p className="text-text-muted text-sm">Tanlangan filtrlar bo‘yicha mahsulot topilmadi.</p>
            <button
              type="button"
              onClick={() => {
                setSelectedDept('all');
                setSelectedGender('all');
              }}
              className="mt-4 px-5 py-2 rounded-full border border-gold-primary/40 text-gold-primary text-xs uppercase tracking-wider hover:bg-gold-primary/10 transition-colors"
            >
              Filtrlarni tozalash
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
