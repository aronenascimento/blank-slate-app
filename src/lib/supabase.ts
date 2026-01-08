import { createClient } from '@supabase/supabase-js';

// Certifique-se de que estas variáveis de ambiente estão definidas
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase environment variables are not set.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);