import { supabase } from '@/lib/supabase/client';
import { Review } from '@/types/database';

export interface SubmitReviewInput {
  reviewer: string;
  rating: number;
  text: string;
  productId?: string;
}

export const reviewsService = {
  /**
   * Saytda ommaviy ko'rsatiladigan tasdiqlangan sharhlarni yuklash
   */
  async fetchApprovedReviews(): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return [];
      }

      return data.map((r: any): Review => ({
        id: String(r.id),
        product_id: r.product_id || 'general',
        reviewer: r.reviewer || r.customer_name || 'Mijoz',
        customer_name: r.customer_name || r.reviewer || 'Mijoz',
        rating: Number(r.rating || 5),
        text: r.text || r.review_text || '',
        review_text: r.review_text || r.text || '',
        status: r.status,
        created_at: r.created_at,
      }));
    } catch (err) {
      console.warn('reviewsService.fetchApprovedReviews xatosi:', err);
      return [];
    }
  },

  /**
   * Admin paneli uchun barcha sharhlarni (tasdiqlangan, kutilayotgan, rad etilgan) yuklash
   */
  async fetchAllReviews(): Promise<Review[]> {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        return [];
      }

      return data.map((r: any): Review => ({
        id: String(r.id),
        product_id: r.product_id || 'general',
        reviewer: r.reviewer || r.customer_name || 'Mijoz',
        customer_name: r.customer_name || r.reviewer || 'Mijoz',
        rating: Number(r.rating || 5),
        text: r.text || r.review_text || '',
        review_text: r.review_text || r.text || '',
        status: r.status,
        created_at: r.created_at,
      }));
    } catch (err) {
      console.warn('reviewsService.fetchAllReviews xatosi:', err);
      return [];
    }
  },

  /**
   * Yangi sharh yuborish (moderatsiyaga tushadi)
   */
  async submitReview(input: SubmitReviewInput): Promise<{ success: boolean; error?: any }> {
    try {
      const { error } = await supabase.from('reviews').insert([
        {
          product_id: input.productId || 'general',
          reviewer: input.reviewer,
          customer_name: input.reviewer,
          rating: input.rating,
          text: input.text,
          review_text: input.text,
          status: 'pending',
        },
      ]);

      if (error) {
        console.error('reviewsService.submitReview DB xatosi:', error);
        return { success: false, error };
      }
      return { success: true };
    } catch (err) {
      console.error('reviewsService.submitReview istisno:', err);
      return { success: true };
    }
  },

  /**
   * Sharh holatini yangilash (Tasdiqlash / Rad etish)
   */
  async updateReviewStatus(reviewId: string, status: 'approved' | 'rejected'): Promise<boolean> {
    try {
      const { error } = await supabase.from('reviews').update({ status }).eq('id', reviewId);
      return !error;
    } catch (_) {
      return false;
    }
  },

  /**
   * Noo'rin sharhni o'chirish
   */
  async deleteReview(reviewId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
      return !error;
    } catch (_) {
      return false;
    }
  },
};
