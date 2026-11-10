/* NOXAR PARFUM — umumiy sozlamalar va Supabase kliyenti.
   Bu yerdagi kalit "publishable" (ochiq) kalit: u brauzerda turishi normal.
   Ma'lumotlarni haqiqiy himoya qiladigan narsa — Supabase RLS siyosatlari
   (noxar-supabase-setup.sql faylini qarang). */

const NOXAR_SUPABASE_URL = 'https://pcjrtdrqzaclctkbndqe.supabase.co';
const NOXAR_SUPABASE_KEY = 'sb_publishable_FrPtkLWvyuIlyDYX7Z-kdQ_jNB4I8xd';
const NOXAR_AUTH_STORAGE = 'noxar-supabase-session';

/* Do'kon ma'lumotlari — o'zgartirish kerak bo'lsa faqat shu yerda. */
const NOXAR_SHOP = {
  telegram: 'ITishnikN1',
  address: 'Bekbaraka bozori, 12-qator, 2-blok, 472-magazin yonida',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bekbaraka+bozori+12-qator+2-blok+472-magazin'
};

const NOXAR_MEDIA_BUCKET = 'product-media';

function noxarEscape(value) {
  return String(value ?? '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[character]));
}

/* Faqat http(s) va nisbiy manzillarni o'tkazadi (javascript: va shunga o'xshashlarni to'sadi). */
function noxarSafeUrl(value) {
  const url = String(value ?? '').trim();
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url) || /^[\w./-]+$/.test(url)) return noxarEscape(url);
  return '';
}

/* 1 250 000 so'm ko'rinishida narx (barcha brauzerlarda bir xil). */
function noxarFormatPrice(amount) {
  const value = Math.round(Number(amount) || 0);
  return `${String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so‘m`;
}

/* localStorage bilan xavfsiz ishlash (buzilgan JSON yoki to'lib ketgan xotira saytni yiqitmaydi). */
function noxarReadJSON(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || 'null');
    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function noxarWriteJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

/* ---------- Mahsulot: bazadagi qatorni sayt ko'rinishiga o'tkazish ---------- */
const NOXAR_DEPARTMENTS = ['atirlar', 'body-fragrance', 'deodorants', 'perfume-oils', 'home-fragrance', 'bath-shower', 'accessories'];
const NOXAR_DEPARTMENT_LABEL = {
  atirlar: 'Atirlar',
  'body-fragrance': 'Tana parvarishi',
  deodorants: 'Dezodorantlar',
  'perfume-oils': 'Parfyum moylari',
  'home-fragrance': 'Uy aromati',
  'bath-shower': 'Dush va vanna',
  accessories: 'Aksessuarlar'
};
const NOXAR_GENDERS = ['ayollar', 'erkaklar', 'unisex'];

function noxarProductFromRow(row, stats) {
  const rawCategory = String(row.category || '');
  const department = NOXAR_DEPARTMENTS.includes(rawCategory) ? rawCategory : 'atirlar';
  const gender = NOXAR_GENDERS.includes(row.gender) ? row.gender : (NOXAR_GENDERS.includes(rawCategory) ? rawCategory : 'unisex');
  const notes = String(row.notes || '').trim();
  const noteParts = notes.split(/\s*[·|•]\s*/).filter(Boolean);
  const amount = Number(row.price) || 0;
  const oldAmount = Number(row.old_price) || 0;
  const discount = oldAmount > amount && amount > 0 ? Math.round((1 - amount / oldAmount) * 100) : 0;
  const stat = stats?.[row.id];
  return {
    id: String(row.id),
    name: String(row.name || ''),
    brand: String(row.brand || 'NOXAR'),
    amount,
    oldAmount: discount ? oldAmount : 0,
    discount,
    stock: Math.max(0, Number(row.stock) || 0),
    department,
    gender,
    volume: String(row.volume || ''),
    badge: String(row.badge || '').trim(),
    art: gender === 'erkaklar' ? 'black-art' : gender === 'ayollar' ? 'rose-art' : 'cream-art',
    image: String(row.image || ''),
    video: String(row.video || ''),
    notes,
    top: noteParts.length >= 3 ? noteParts[0] : '',
    heart: noteParts.length >= 3 ? noteParts[1] : '',
    base: noteParts.length >= 3 ? noteParts.slice(2).join(' · ') : '',
    description: String(row.description || ''),
    popularity: Number(row.popularity) || 0,
    createdAt: Date.parse(row.created_at) || 0,
    rating: stat ? stat.sum / stat.count : 0,
    reviewCount: stat ? stat.count : 0
  };
}

function noxarReadSession() {
  try {
    return JSON.parse(localStorage.getItem(NOXAR_AUTH_STORAGE) || 'null');
  } catch (error) {
    return null;
  }
}

/* prefer: 'return=minimal' (standart) — anon foydalanuvchiga SELECT huquqi shart emas.
   Ma'lumot qaytishi kerak bo'lsa, 'return=representation' beriladi. */
async function noxarRequest(table, method, body, query = '', prefer = 'return=minimal') {
  const send = () => {
    const session = noxarReadSession();
    const headers = {
      apikey: NOXAR_SUPABASE_KEY,
      Authorization: `Bearer ${session?.access_token || NOXAR_SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    };
    if (method !== 'GET' && prefer) headers.Prefer = prefer;
    return fetch(`${NOXAR_SUPABASE_URL}/rest/v1/${table}${query}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  };

  let response = await send();
  let data = await response.json().catch(() => null);
  const expired = response.status === 401
    && (data?.message === 'JWT expired' || data?.code === 'PGRST301' || /jwt/i.test(data?.message || ''));
  if (expired) {
    const session = noxarReadSession();
    if (session?.refresh_token) {
      await noxarAuth.refreshSession(session.refresh_token);
    } else {
      localStorage.removeItem(NOXAR_AUTH_STORAGE);
    }
    response = await send();
    data = await response.json().catch(() => null);
  }
  if (!response.ok) {
    const error = new Error(data?.message || data?.hint || `Supabase xatosi: ${response.status}`);
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }
  return { data, error: null };
}

const noxarSupabase = {
  from(table) {
    const filterPart = (column, value) => `${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`;
    return {
      /* insert(body)                — javob qaytarmaydi (anon uchun xavfsiz)
         insert(body, { returning }) — yozilgan qatorni qaytaradi (SELECT huquqi kerak) */
      insert: (body, options = {}) => noxarRequest(
        table, 'POST', body, '', options.returning ? 'return=representation' : 'return=minimal'
      ),
      upsert(body, options = {}) {
        const conflict = options.onConflict || 'id';
        const resolution = options.ignoreDuplicates ? 'ignore-duplicates' : 'merge-duplicates';
        return noxarRequest(
          table, 'POST', body, `?on_conflict=${encodeURIComponent(conflict)}`, `resolution=${resolution},return=minimal`
        );
      },
      delete() {
        return {
          eq: (column, value) => noxarRequest(table, 'DELETE', undefined, `?${filterPart(column, value)}`)
        };
      },
      update(body) {
        return {
          eq: (column, value) => noxarRequest(table, 'PATCH', body, `?${filterPart(column, value)}`)
        };
      },
      select(columns = '*') {
        const state = { query: `?select=${encodeURIComponent(columns)}` };
        const builder = {
          order(column, options = {}) {
            state.query += `&order=${encodeURIComponent(column)}.${options.ascending === false ? 'desc' : 'asc'}`;
            return builder;
          },
          eq(column, value) {
            state.query += `&${filterPart(column, value)}`;
            return builder;
          },
          limit(count) {
            state.query += `&limit=${Number(count) || 100}`;
            return builder;
          },
          then(resolve, reject) {
            return noxarRequest(table, 'GET', undefined, state.query).then(resolve, reject);
          }
        };
        return builder;
      }
    };
  }
};

/* Supabase Storage — rasm va videolarni bazaga base64 qilib yozmaslik uchun. */
const noxarStorage = {
  publicUrl(path, bucket = NOXAR_MEDIA_BUCKET) {
    return `${NOXAR_SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
  },
  async upload(file, folder = 'products', bucket = NOXAR_MEDIA_BUCKET) {
    const session = noxarReadSession();
    if (!session?.access_token) throw new Error('Fayl yuklash uchun admin sifatida kiring.');
    const extension = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 5) || 'bin';
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
    const response = await fetch(`${NOXAR_SUPABASE_URL}/storage/v1/object/${bucket}/${path}`, {
      method: 'POST',
      headers: {
        apikey: NOXAR_SUPABASE_KEY,
        Authorization: `Bearer ${session.access_token}`,
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'false'
      },
      body: file
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || data?.error || `Fayl yuklanmadi (${response.status})`);
    }
    return noxarStorage.publicUrl(path, bucket);
  }
};

const noxarAuth = {
  readSession: noxarReadSession,
  /* Joriy foydalanuvchi (sessiyadan). Sessiya yo'q bo'lsa — null. */
  currentUser() {
    const session = noxarReadSession();
    const user = session?.user;
    if (!session?.access_token || !user) return null;
    const email = user.email || '';
    return {
      id: user.id,
      email,
      name: user.user_metadata?.name || email.split('@')[0] || 'Mijoz'
    };
  },
  async signUp(email, password, name) {
    const response = await fetch(`${NOXAR_SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: { apikey: NOXAR_SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, data: { name } })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error_description || data?.msg || 'Ro‘yxatdan o‘tish amalga oshmadi');
    if (data?.access_token) localStorage.setItem(NOXAR_AUTH_STORAGE, JSON.stringify(data));
    return data;
  },
  async signIn(email, password) {
    const response = await fetch(`${NOXAR_SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { apikey: NOXAR_SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error_description || data?.msg || 'Email yoki parol noto‘g‘ri');
    localStorage.setItem(NOXAR_AUTH_STORAGE, JSON.stringify(data));
    return data;
  },
  async refreshSession(refreshToken) {
    const response = await fetch(`${NOXAR_SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { apikey: NOXAR_SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      localStorage.removeItem(NOXAR_AUTH_STORAGE);
      throw new Error(data?.error_description || 'Sessiya tugagan. Qayta kiring.');
    }
    localStorage.setItem(NOXAR_AUTH_STORAGE, JSON.stringify(data));
    return data;
  },
  async getUser() {
    const session = noxarReadSession();
    if (!session?.access_token) return null;
    const response = await fetch(`${NOXAR_SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: NOXAR_SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` }
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error_description || 'Foydalanuvchi ma’lumotini olishda xatolik');
    return data;
  },
  async resetPassword(email) {
    const response = await fetch(`${NOXAR_SUPABASE_URL}/auth/v1/recover`, {
      method: 'POST',
      headers: { apikey: NOXAR_SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) throw new Error(data?.error_description || data?.msg || 'Parolni tiklash xati yuborilmadi');
    return data;
  },
  async signOut() {
    const session = noxarReadSession();
    localStorage.removeItem(NOXAR_AUTH_STORAGE);
    if (session?.access_token) {
      try {
        await fetch(`${NOXAR_SUPABASE_URL}/auth/v1/logout`, {
          method: 'POST',
          headers: { apikey: NOXAR_SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` }
        });
      } catch (error) {
        /* Tarmoq xatosi bo'lsa ham mahalliy sessiya allaqachon o'chirilgan. */
      }
    }
  }
};

window.noxarSupabase = noxarSupabase;
window.noxarAuth = noxarAuth;
window.noxarStorage = noxarStorage;
window.noxarEscape = noxarEscape;
window.noxarSafeUrl = noxarSafeUrl;
window.noxarFormatPrice = noxarFormatPrice;
window.noxarReadJSON = noxarReadJSON;
window.noxarProductFromRow = noxarProductFromRow;
window.noxarWriteJSON = noxarWriteJSON;
window.NOXAR_SHOP = NOXAR_SHOP;
