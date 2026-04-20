import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    storage: {
      // En Next.js, localStorage solo está disponible en el lado del cliente
      getItem: (key) => (typeof window !== "undefined" ? localStorage.getItem(key) : null),
      setItem: (key, value) => (typeof window !== "undefined" ? localStorage.setItem(key, value) : null),
      removeItem: (key) => (typeof window !== "undefined" ? localStorage.removeItem(key) : null),
    },
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
});
