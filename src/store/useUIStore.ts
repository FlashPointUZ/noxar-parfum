import { create } from 'zustand';
import { Product } from '@/types/database';

interface UIState {
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isSearchOpen: boolean;
  isCheckoutOpen: boolean;
  isTrackOpen: boolean;
  selectedProduct: Product | null;

  setCartOpen: (open: boolean) => void;
  setWishlistOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setCheckoutOpen: (open: boolean) => void;
  setTrackOpen: (open: boolean) => void;
  setSelectedProduct: (product: Product | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isWishlistOpen: false,
  isSearchOpen: false,
  isCheckoutOpen: false,
  isTrackOpen: false,
  selectedProduct: null,

  setCartOpen: (open) => set({ isCartOpen: open }),
  setWishlistOpen: (open) => set({ isWishlistOpen: open }),
  setSearchOpen: (open) => set({ isSearchOpen: open }),
  setCheckoutOpen: (open) => set({ isCheckoutOpen: open }),
  setTrackOpen: (open) => set({ isTrackOpen: open }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
}));
