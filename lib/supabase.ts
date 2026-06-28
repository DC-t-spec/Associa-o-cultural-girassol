import { createClient } from '@supabase/supabase-js';
import { toSafeString } from './utils';

const supabaseUrl = toSafeString(process.env.NEXT_PUBLIC_SUPABASE_URL).trim();
const supabaseAnonKey = toSafeString(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).trim();

function hasValidSupabaseUrl(value: string): value is string {
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
