import { create } from 'zustand';

interface WishlistState {
  items: string[]; // mahsulot id lari
  toggleWishlist: (id: string) => void;
  isWishlisted: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('noxar-wishlist') || '[]') : [],

  toggleWishlist: (id: string) => {
    set((state) => {
      const exists = state.items.includes(id);
      const updated = exists ? state.items.filter((item) => item !== id) : [...state.items, id];
      if (typeof window !== 'undefined') {
        localStorage.setItem('noxar-wishlist', JSON.stringify(updated));
      }
      return { items: updated };
    });
  },

  isWishlisted: (id: string) => {
    return get().items.includes(id);
  },
}));
