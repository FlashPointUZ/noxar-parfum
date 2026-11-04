import { supabase } from '@/lib/supabase/client';

/**
 * Foydalanuvchining admin ekanligini Supabase orqali tekshirish
 * 1. public.admin_users jadvalidan tekshiradi
 * 2. auth.users dagi metadata (role: 'admin') ni tekshiradi
 * 3. Maxsus admin emaili (cazizbek540@gmail.com) bilan tekshiradi
 */
export async function checkIsAdmin(userId?: string, userEmail?: string): Promise<boolean> {
  if (!userId && !userEmail) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;
    userId = session.user.id;
    userEmail = session.user.email;
  }

  // 1. Asosiy admin emaillar ro'yxati
  const defaultAdminEmails = ['cazizbek540@gmail.com', 'admin@noxar.com'];
  if (userEmail && defaultAdminEmails.includes(userEmail.toLowerCase())) {
    return true;
  }

  if (!userId) return false;

  try {
    // 2. public.admin_users jadvalidan tekshirish
    const { data, error } = await supabase
      .from('admin_users')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!error && data) {
      return true;
    }

    // 3. User metadata tekshiruvi
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.user_metadata?.role === 'admin') {
      return true;
    }
  } catch (err) {
    console.warn('Admin huquqlarini tekshirishda xatolik:', err);
  }

  return false;
}
