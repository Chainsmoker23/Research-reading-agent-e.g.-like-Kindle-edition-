
import { createClient } from '@supabase/supabase-js';

// NOTE: Ensure these variables are set in your environment (e.g. .env file)
// REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. App will function in offline/demo mode.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
