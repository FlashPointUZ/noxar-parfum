const NOXAR_SUPABASE_URL = 'https://pcjrtdrqzaclctkbndqe.supabase.co';
const NOXAR_SUPABASE_KEY = 'sb_publishable_FrPtkLWvyuIlyDYX7Z-kdQ_jNB4I8xd';
const NOXAR_AUTH_STORAGE = 'noxar-supabase-session';

async function noxarRequest(table, method, body, query = '') {
  let session = (() => {
    try {
      return JSON.parse(localStorage.getItem(NOXAR_AUTH_STORAGE) || 'null');
    } catch (error) {
      return null;
    }
  })();
  const request = () => fetch(`${NOXAR_SUPABASE_URL}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: NOXAR_SUPABASE_KEY,
      Authorization: `Bearer ${session?.access_token || NOXAR_SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  let response = await request();
  let data = await response.json().catch(() => null);
  if (response.status === 401 && data?.message === 'JWT expired' && session?.refresh_token) {
    await noxarAuth.refreshSession(session.refresh_token);
    session = noxarAuth.readSession();
    response = await request();
    data = await response.json().catch(() => null);
  }
  if (!response.ok) throw new Error(data?.message || data?.hint || `Supabase xatosi: ${response.status}`);
  return { data, error: null };
}

const noxarSupabase = {
  from(table) {
    return {
      insert: (body) => noxarRequest(table, 'POST', body),
      upsert(body) {
        return noxarRequest(table, 'POST', body, '?on_conflict=id');
      },
      delete() {
        return {
          eq(column, value) {
            return noxarRequest(table, 'DELETE', undefined, `?${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`);
          }
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
            state.query += `&${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`;
            return builder;
          },
          then(resolve, reject) {
            return noxarRequest(table, 'GET', undefined, state.query).then(resolve, reject);
          }
        };

        return builder;
      },
      update(body) {
        return {
          eq(column, value) {
            return noxarRequest(table, 'PATCH', body, `?${encodeURIComponent(column)}=eq.${encodeURIComponent(value)}`);
          }
        };
      }
    };
  }
};

const noxarAuth = {
  readSession() {
    try {
      return JSON.parse(localStorage.getItem(NOXAR_AUTH_STORAGE) || 'null');
    } catch (error) {
      return null;
    }
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
    if (!response.ok) throw new Error(data?.error_description || data?.msg || 'Login yoki parol noto‘g‘ri');
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
      throw new Error(data?.error_description || 'Admin sessiyasi tugagan. Qayta kiring.');
    }
    localStorage.setItem(NOXAR_AUTH_STORAGE, JSON.stringify(data));
    return data;
  },
  async getUser() {
    const session = this.readSession();
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
    const session = this.readSession();
    if (session?.access_token) {
      await fetch(`${NOXAR_SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: { apikey: NOXAR_SUPABASE_KEY, Authorization: `Bearer ${session.access_token}` }
      });
    }
    localStorage.removeItem(NOXAR_AUTH_STORAGE);
  }
};

window.noxarSupabase = noxarSupabase;
window.noxarAuth = noxarAuth;
