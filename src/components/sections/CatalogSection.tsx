'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types/database';
import { initialProducts } from '@/lib/data/products';
import { ProductCard } from '@/components/commerce/ProductCard';
import { productsService } from '@/services/productsService';
import { useSiteContentStore } from '@/store/useSiteContentStore';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

export const CatalogSection: React.FC = () => {
  const { content } = useSiteContentStore();
  const catalogContent = content.catalog;
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [loading, setLoading] = useState<boolean>(false);

  // Supabase dan toza xizmat qatlami (productsService) orqali yuklash
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const data = await productsService.fetchProducts();
      setProducts(data);
      setLoading(false);
    }
    loadProducts();
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

  // To'liq kengaytirilgan kategoriyalar (Hallmark toza tipografik tugmalar)
  const departments = [
    { id: 'all', label: 'Barchasi' },
    { id: 'atirlar', label: 'Atirlar' },
    { id: 'body-fragrance', label: 'Tana parvarishi' },
    { id: 'deodorants', label: 'Dezodorantlar' },
    { id: 'perfume-oils', label: 'Parfyum moylari' },
    { id: 'home-fragrance', label: 'Uy aromatlari' },
    { id: 'bath-shower', label: 'Dush & vanna' },
    { id: 'accessories', label: 'Aksessuarlar' },
    { id: 'gift-sets', label: 'Sovg‘a to‘plamlari' },
  ];

  return (
    <section id="catalog" className="py-20 lg:py-28 border-b border-border-hairline bg-surface-0 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            {catalogContent.badge && (
              <span className="text-[10px] uppercase tracking-[0.25em] text-gold-primary block mb-2 font-medium">
                {catalogContent.badge}
              </span>
            )}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-text-main">
              {catalogContent.title} <span className="italic text-gold-light">{catalogContent.title_highlight}</span>
            </h2>
          </div>
          <p className="text-text-muted text-xs sm:text-sm max-w-xs font-light">
            {catalogContent.subtitle}
          </p>
        </div>

        {/* Bo'limlar Navigatsiyasi (Scrollable on Mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 pt-1 no-scrollbar border-b border-border-hairline mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          {departments.map((dept) => (
            <button
              key={dept.id}
              type="button"
              onClick={() => setSelectedDept(dept.id)}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium whitespace-nowrap shrink-0 transition-all ${
                selectedDept === dept.id
                  ? 'bg-gold-primary text-black font-semibold shadow-sm'
                  : 'bg-surface-1 border border-border-hairline text-text-muted hover:text-text-main hover:border-gold-primary/30'
              }`}
            >
              {dept.label}
            </button>
          ))}
        </div>

        {/* Filtrlar va Saralash Paneli */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-8 bg-surface-1 p-2.5 sm:p-4 rounded-2xl border border-border-hairline">
          {/* Jins Filtr */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-xs text-text-muted uppercase tracking-wider hidden md:inline shrink-0">Jins:</span>
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
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
                  className={`px-3 py-1.5 rounded-full text-[11px] sm:text-xs text-center font-medium tracking-wide whitespace-nowrap transition-all ${
                    selectedGender === g.id
                      ? 'bg-gold-primary text-black font-semibold shadow-sm'
                      : 'bg-surface-2/70 text-text-muted hover:text-text-main hover:bg-surface-2'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Saralash Dropdown */}
          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto pt-2.5 sm:pt-0 border-t sm:border-t-0 border-border-hairline/60">
            <div className="flex items-center gap-1.5 text-text-muted text-xs shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gold-primary" />
              <span className="sm:hidden text-text-muted uppercase tracking-wider text-[10px]">Saralash:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-surface-2 text-text-main text-xs px-3 py-1.5 rounded-xl border border-border-hairline outline-none focus:border-gold-primary transition-all cursor-pointer flex-1 sm:flex-initial"
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
