import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Safe client loader to prevent Next.js static prerender crash when keys are missing.
const safeCreateClient = () => {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseUrl.startsWith('http')) {
    // Return a dummy proxy object that intercept queries to prevent "supabaseUrl is required" errors.
    return new Proxy({} as any, {
      get(target, prop) {
        if (prop === 'from') {
          return () => ({
            select: () => ({
              maybeSingle: () => Promise.resolve({ data: null, error: null }),
              eq: () => ({
                maybeSingle: () => Promise.resolve({ data: null, error: null }),
              }),
            }),
            insert: () => Promise.resolve({ data: null, error: null }),
            update: () => Promise.resolve({ data: null, error: null }),
            delete: () => Promise.resolve({ data: null, error: null }),
          });
        }
        return () => Promise.resolve({ data: null, error: null });
      },
    });
  }
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = safeCreateClient();
