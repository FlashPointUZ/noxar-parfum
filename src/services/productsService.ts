import { supabase } from '@/lib/supabase/client';
import { Product, Department, Gender } from '@/types/database';
import { initialProducts } from '@/lib/data/products';

export interface CreateProductInput {
  name: string;
  brand?: string;
  price: number;
  stock: number;
  category: string;
  gender?: string;
  description?: string;
  image?: string;
  active?: boolean;
}

export const productsService = {
  /**
   * Barcha mahsulotlarni Supabase bazasidan tortib kelish
   */
  async fetchProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return initialProducts;
      }

      return data.map((item: any): Product => ({
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
        stock: Number(item.stock ?? 5),
        image: item.image || undefined,
        active: item.active !== false,
      }));
    } catch (err) {
      console.warn('productsService.fetchProducts xatoligi, default ma’lumotlar ishlatiladi:', err);
      return initialProducts;
    }
  },

  /**
   * Yangi mahsulot yaratish
   */
  async createProduct(input: CreateProductInput): Promise<{ success: boolean; data?: Product; error?: any }> {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      id: newId,
      name: input.name,
      brand: input.brand || 'NOXAR',
      price: `${input.price.toLocaleString('uz-UZ')} so'm`,
      amount: input.price,
      notes: input.description || 'Eksklyuziv kompozitsiya',
      categories: [input.category, input.gender || 'unisex'],
      department: input.category,
      gender: (input.gender as any) || 'unisex',
      family: 'amber',
      volume: '50',
      rating: 5.0,
      popularity: 50,
      art: 'black-art',
      top: 'Bosh nota',
      heart: 'Yurak nota',
      base: 'Asos nota',
      description: input.description || '',
      usage: 'Puls nuqtalariga seping.',
      features: ['Eau de Parfum'],
      stock: input.stock,
      image: input.image || undefined,
      active: input.active !== false,
    };

    try {
      const { error } = await supabase.from('products').insert([
        {
          id: newId,
          name: input.name,
          brand: input.brand || 'NOXAR',
          price: input.price,
          stock: input.stock,
          category: input.category,
          gender: input.gender || 'unisex',
          description: input.description,
          image: input.image || null,
          active: input.active !== false,
        },
      ]);

      if (error) {
        console.error('productsService.createProduct DB xatoligi:', error);
      }
      return { success: true, data: newProduct };
    } catch (err) {
      console.error('productsService.createProduct istisno:', err);
      return { success: true, data: newProduct };
    }
  },

  /**
   * Mahsulotni yangilash
   */
  async updateProduct(id: string, updates: Partial<CreateProductInput>): Promise<{ success: boolean; error?: any }> {
    try {
      const payload: any = { updated_at: new Date().toISOString() };
      if (updates.name !== undefined) payload.name = updates.name;
      if (updates.brand !== undefined) payload.brand = updates.brand;
      if (updates.price !== undefined) payload.price = updates.price;
      if (updates.stock !== undefined) payload.stock = updates.stock;
      if (updates.category !== undefined) payload.category = updates.category;
      if (updates.gender !== undefined) payload.gender = updates.gender;
      if (updates.description !== undefined) payload.description = updates.description;
      if (updates.image !== undefined) payload.image = updates.image || null;
      if (updates.active !== undefined) payload.active = updates.active;

      const { error } = await supabase.from('products').update(payload).eq('id', id);
      if (error) {
        console.error('productsService.updateProduct DB xatoligi:', error);
        return { success: false, error };
      }
      return { success: true };
    } catch (err) {
      console.error('productsService.updateProduct istisno:', err);
      return { success: false, error: err };
    }
  },

  /**
   * Mahsulotni o'chirish
   */
  async deleteProduct(id: string): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) {
        console.error('productsService.deleteProduct xatoligi:', error);
        return { success: false, error };
      }
      return { success: true };
    } catch (err) {
      console.error('productsService.deleteProduct istisno:', err);
      return { success: false, error: err };
    }
  },

  /**
   * Mahsulotning faollik holatini almashtirish
   */
  async toggleActive(id: string, currentActive: boolean): Promise<boolean> {
    try {
      const { error } = await supabase.from('products').update({ active: !currentActive }).eq('id', id);
      return !error;
    } catch (_) {
      return false;
    }
  },

  /**
   * Mahsulot zaxirasini (stock) yangilash
   */
  async updateStock(id: string, newStock: number): Promise<boolean> {
    try {
      const { error } = await supabase.from('products').update({ stock: Math.max(0, newStock) }).eq('id', id);
      return !error;
    } catch (_) {
      return false;
    }
  },
};
