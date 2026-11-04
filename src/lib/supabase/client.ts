import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pcjrtdrqzaclctkbndqe.supabase.co';
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_FrPtkLWvyuIlyDYX7Z-kdQ_jNB4I8xd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
