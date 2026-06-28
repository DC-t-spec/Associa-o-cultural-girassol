import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

function hasValidSupabaseUrl(value: string | undefined): value is string {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export const isSupabaseConfigured = hasValidSupabaseUrl(supabaseUrl) && Boolean(supabaseAnonKey);

export const supabase = (() => {
  if (!hasValidSupabaseUrl(supabaseUrl) || !supabaseAnonKey) return null;

  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch {
    return null;
  }
})();
