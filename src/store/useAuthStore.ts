import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { antiBot } from '@/lib/rateLimit';
import { checkIsAdmin } from '@/lib/auth/adminAuth';

export interface UserProfile {
  id: string;
  email?: string;
  fullName?: string;
  phone?: string;
}

interface AuthState {
  user: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  signUp: (email: string, pass: string, fullName: string, phone: string, honeypot?: string) => Promise<boolean>;
  signIn: (email: string, pass: string) => Promise<{ success: boolean; isAdmin: boolean }>;
  signOut: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  checkSession: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const isAdmin = await checkIsAdmin(session.user.id, session.user.email);
        set({
          user: {
            id: session.user.id,
            email: session.user.email,
            fullName: session.user.user_metadata?.full_name || 'Mijoz',
            phone: session.user.user_metadata?.phone || '',
          },
          isAdmin,
        });
      } else {
        set({ user: null, isAdmin: false });
      }
    } catch (_) {}
  },

  signUp: async (email, pass, fullName, phone, honeypot = '') => {
    if (!antiBot.checkHoneypot(honeypot)) {
      set({ error: 'Xavfsizlik tekshiruvidan o‘tmadiniz.' });
      return false;
    }

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
        const isAdmin = await checkIsAdmin(data.user.id, data.user.email);
        set({
          user: {
            id: data.user.id,
            email: data.user.email,
            fullName,
            phone,
          },
          isAdmin,
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
    const limit = antiBot.checkRateLimit('auth_signin', 3);
    if (!limit.allowed) {
      set({ error: `Juda ko‘p urinish. ${limit.remainingSeconds} soniya kuting.` });
      return { success: false, isAdmin: false };
    }

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });

      if (error) {
        set({ error: error.message, loading: false });
        return { success: false, isAdmin: false };
      }

      if (data.user) {
        const isAdmin = await checkIsAdmin(data.user.id, data.user.email);
        set({
          user: {
            id: data.user.id,
            email: data.user.email,
            fullName: data.user.user_metadata?.full_name || 'Mijoz',
            phone: data.user.user_metadata?.phone || '',
          },
          isAdmin,
          loading: false,
        });
        return { success: true, isAdmin };
      }

      set({ loading: false });
      return { success: false, isAdmin: false };
    } catch (err: any) {
      set({ error: err.message || 'Kirishda xatolik yuz berdi.', loading: false });
      return { success: false, isAdmin: false };
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
    } catch (_) {}
    set({ user: null, isAdmin: false });
  },
}));
