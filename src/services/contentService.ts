import { supabase } from '@/lib/supabase/client';
import { SiteContent } from '@/types/database';

export const initialSiteContent: SiteContent = {
  announcement: {
    text: 'Toshkent bo‘ylab tezkor yetkazib berish · 500 000 so‘mdan yuqori xaridlarga bepul',
    active: true,
  },
  hero: {
    badge: 'Hid — bu xotira',
    title_line1: 'O‘zingning',
    title_highlight: 'afsonangni',
    title_line2: 'yarat.',
    subtitle: 'Har bir tomchida xarakter, har bir notada sening beqiyos hikoyang. NOXAR bilan unutilmas va nafis iz qoldir.',
    cta_primary: 'Kolleksiyani ko‘rish',
    cta_secondary: 'Biz haqimizda',
    image_url: '',
  },
  new_collection: {
    badge: 'Tanlangan',
    title: 'Yangi',
    title_highlight: 'kolleksiya',
    link_text: 'Barcha atirlarni ko‘rish',
  },
  catalog: {
    badge: 'Siz uchun tanlangan',
    title: 'Tavsiya',
    title_highlight: 'etamiz',
    subtitle: 'Har bir xarakter va kayfiyat uchun o‘ziga xos mualliflik kompozitsiyasi.',
  },
  brand_story: {
    badge: 'Bizning Falsafamiz',
    title: 'Har bir inson o‘z',
    title_highlight: 'izini',
    title_line2: 'qoldiradi.',
    description:
      'NOXAR PARFUM — bu shunchaki atir do‘koni emas. Bu o‘ziga xoslik, jasorat va nafosat timsoli bo‘lgan tanlangan hidlar maskanidir. Biz har bir notani ehtiyotkorlik bilan tanlaymiz, toki siz xonaga kirganingizda ham, ketganingizdan keyin ham xotiralar siz haqingizda so‘zlasin.',
    city_country: 'Toshkent, O‘zbekiston',
    card_title: 'Haqiqiy parfyumeriya san’ati va beqiyos his-tuyg‘ular.',
    showroom_name: 'Bekbaraka, 472-do‘kon',
    showroom_address: 'Bekbaraka bozori, 12-qator, 2-blok, 472-magazin yonida',
    maps_url: 'https://www.google.com/maps/search/?api=1&query=Bekbaraka+bozori+12-qator+2-blok+472-magazin',
  },
  testimonials: {
    badge: 'Mijozlarimiz ovozi',
    title: 'Haqiqiy',
    title_highlight: 'taassurotlar',
    subtitle: 'Har bir sharh — biz uchun o‘ziga xos qadrli hikoya.',
  },
  contacts: {
    phone: '+998 90 000 00 00',
    telegram: 'https://t.me',
    instagram: 'https://instagram.com',
    footer_slogan: 'Sening izing. Sening hikoyang. Biz har bir insonga o‘zining unutilmas shaxsiy hidini topishga ko‘maklashamiz.',
    showroom_address: 'Toshkent sh., Bekbaraka bozori, 12-qator, 2-blok, 472-magazin.',
  },
};

export const contentService = {
  /**
   * Barcha sayt matnlari va sozlamalarini Supabase dan yuklash
   */
  async fetchContent(): Promise<SiteContent> {
    try {
      const { data, error } = await supabase.from('site_content').select('*');

      if (!error && data && data.length > 0) {
        const merged: SiteContent = { ...initialSiteContent };
        data.forEach((row: { key: string; value: any }) => {
          if (row.key in merged) {
            (merged as any)[row.key] = {
              ...(merged as any)[row.key],
              ...row.value,
            };
          }
        });
        return merged;
      }
      return initialSiteContent;
    } catch (err) {
      console.warn('contentService.fetchContent xatosi:', err);
      return initialSiteContent;
    }
  },

  /**
   * Bitta seksiyani yangilash
   */
  async updateSection<K extends keyof SiteContent>(section: K, data: SiteContent[K]): Promise<boolean> {
    try {
      const { error } = await supabase.from('site_content').upsert(
        {
          key: String(section),
          value: data,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'key' }
      );
      return !error;
    } catch (err) {
      console.error('contentService.updateSection xatosi:', err);
      return false;
    }
  },

  /**
   * Barcha CMS matnlarini to'liq saqlash
   */
  async updateFullContent(data: Partial<SiteContent>): Promise<boolean> {
    try {
      const entries = Object.entries(data);
      for (const [key, val] of entries) {
        await supabase.from('site_content').upsert(
          {
            key,
            value: val,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'key' }
        );
      }
      return true;
    } catch (err) {
      console.error('contentService.updateFullContent xatosi:', err);
      return false;
    }
  },
};
