import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { antiBot } from '@/lib/rateLimit';

export interface UserProfile {
  id: string;
  email?: string;
  fullName?: string;
  phone?: string;
}

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, pass: string, fullName: string, phone: string, honeypot?: string) => Promise<boolean>;
  signIn: (email: string, pass: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  checkSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        set({
          user: {
            id: session.user.id,
            email: session.user.email,
            fullName: session.user.user_metadata?.full_name || 'Mijoz',
            phone: session.user.user_metadata?.phone || '',
          },
        });
      }
    } catch (_) {}
  },

  signUp: async (email, pass, fullName, phone, honeypot = '') => {
    // 1. Bot tekshiruvi
    if (!antiBot.checkHoneypot(honeypot)) {
      set({ error: 'Xavfsizlik tekshiruvidan o‘tmadiniz.' });
      return false;
    }

    // 2. Rate limit tekshiruvi (har 15 soniyada faqat 1 marta ro'yxatdan o'tish)
    const limit = antiBot.checkRateLimit('auth_signup', 15);
    if (!limit.allowed) {
      set({ error: `Iltimos, ${limit.remainingSeconds} soniyadan keyin qayta urinib ko‘ring.` });
      return false;
    }

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pass,
        options: {
          data: {
            full_name: fullName,
            phone: phone,
          },
        },
      });

      if (error) {
        set({ error: error.message, loading: false });
        return false;
      }

      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email,
            fullName,
            phone,
          },
          loading: false,
        });
        return true;
      }

      set({ loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Ro‘yxatdan o‘tishda xatolik yuz berdi.', loading: false });
      return false;
    }
  },

  signIn: async (email, pass) => {
    // Rate limit: har 5 soniyada 1 marta kirish urinishi
    const limit = antiBot.checkRateLimit('auth_signin', 5);
    if (!limit.allowed) {
      set({ error: `Juda ko‘p urinish. ${limit.remainingSeconds} soniya kuting.` });
      return false;
    }

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        set({ error: error.message, loading: false });
        return false;
      }

      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.user_metadata?.full_name || 'Mijoz',
            phone: data.user.user_metadata?.phone || '',
          },
          loading: false,
        });
        return true;
      }

      set({ loading: false });
      return true;
    } catch (err: any) {
      set({ error: err.message || 'Kirishda xatolik yuz berdi.', loading: false });
      return false;
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    set({ user: null });
  },
}));
