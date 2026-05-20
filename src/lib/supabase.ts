import { createClient } from '@supabase/supabase-js';

// Prioritize the standard naming convention
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co';
const supabaseAnonKey = 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
  'placeholder-key';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) {
  console.warn(
    '⚠️ Supabase credentials missing. The app is running in "Demo Mode" with mock data.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
