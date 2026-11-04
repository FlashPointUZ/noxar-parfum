import { supabase } from './client';

/**
 * Rasmni brauzerda siqish va Base64 Data URL ga aylantirish.
 * Bu Supabase Storage sozlanmagan bo'lsa ham rasmlar bazada saqlanishini ta'minlaydi.
 */
export async function compressImageFile(
  file: File,
  maxWidth: number = 1000,
  quality: number = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    // Agar serverda ishlasa yoki File bo'lmasa
    if (typeof window === 'undefined' || !file) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // WebP qo'llab-quvvatlansa WebP, aks holda JPEG
        try {
          const dataUrl = canvas.toDataURL('image/webp', quality);
          resolve(dataUrl);
        } catch {
          const fallbackUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(fallbackUrl);
        }
      };
      img.onerror = () => reject(new Error('Rasmni yuklab bo‘lmadi'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Faylni o‘qishda xatolik'));
    reader.readAsDataURL(file);
  });
}

/**
 * Mahsulot yoki banner rasmini yuklash.
 * 1. Avval Supabase Storage 'products' bucketiga yuklashga urinadi.
 * 2. Agar bucket mavjud bo'lmasa yoki xato bersa, brauzerda sifatli siqilgan Base64 ga o'girib qaytaradi.
 */
export async function uploadImage(file: File, bucket: string = 'products'): Promise<string> {
  if (!file) return '';

  try {
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const cleanFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

    // Supabase Storage ga yuklashga urinish
    const { data, error } = await supabase.storage.from(bucket).upload(cleanFileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

    if (!error && data?.path) {
      const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(data.path);
      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }
  } catch (err) {
    console.warn('Supabase storage yuklashda xatolik, Base64 fallback ishlatiladi:', err);
  }

  // Fallback: Sifatli siqilgan Base64 Data URL
  return await compressImageFile(file, 900, 0.8);
}
