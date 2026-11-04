import { create } from 'zustand';
import { CartItem, Product, PromoCode } from '@/types/database';

interface CartState {
  items: CartItem[];
  promo: PromoCode | null;
  addItem: (product: Product, volume?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  applyPromo: (promo: PromoCode | null) => void;
  clearCart: () => void;
  getTotals: () => {
    subtotal: number;
    discount: number;
    shipping: number;
    total: number;
  };
}

export const useCartStore = create<CartState>((set, get) => ({
  items: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('noxar-cart') || '[]') : [],
  promo: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('noxar-promo') || 'null') : null,

  addItem: (product, volume = '50') => {
    set((state) => {
      const existing = state.items.find((item) => item.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = state.items.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        updated = [
          ...state.items,
          {
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            amount: product.amount,
            art: product.art,
            image: product.image,
            quantity: 1,
            selectedVolume: volume,
          },
        ];
      }
      if (typeof window !== 'undefined') {
        localStorage.setItem('noxar-cart', JSON.stringify(updated));
      }
      return { items: updated };
    });
  },

  removeItem: (id) => {
    set((state) => {
      const updated = state.items.filter((item) => item.id !== id);
      if (typeof window !== 'undefined') {
        localStorage.setItem('noxar-cart', JSON.stringify(updated));
      }
      return { items: updated };
    });
  },

  updateQuantity: (id, delta) => {
    set((state) => {
      const updated = state.items
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);

      if (typeof window !== 'undefined') {
        localStorage.setItem('noxar-cart', JSON.stringify(updated));
      }
      return { items: updated };
    });
  },

  applyPromo: (promo) => {
    if (typeof window !== 'undefined') {
      if (promo) localStorage.setItem('noxar-promo', JSON.stringify(promo));
      else localStorage.removeItem('noxar-promo');
    }
    set({ promo });
  },

  clearCart: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('noxar-cart');
      localStorage.removeItem('noxar-promo');
    }
    set({ items: [], promo: null });
  },

  getTotals: () => {
    const { items, promo } = get();
    const subtotal = items.reduce((sum, item) => sum + item.amount * item.quantity, 0);

    let discount = 0;
    if (promo && subtotal > 0) {
      if (promo.type === 'fixed') {
        discount = Math.min(subtotal, promo.value);
      } else if (promo.percent) {
        discount = Math.round((subtotal * promo.percent) / 100);
      }
    }

    const shippingBase = subtotal - discount;
    const shipping = shippingBase === 0 || shippingBase >= 500000 ? 0 : 30000;
    const total = Math.max(0, subtotal - discount + shipping);

    return { subtotal, discount, shipping, total };
  },
}));
