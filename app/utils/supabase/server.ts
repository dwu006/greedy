
import { createServerClient } from '@supabase/ssr';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';

// Create a single supabase client for the entire app
export function createClient() {
  // Get cookies from the request
  let cookieStore: ReadonlyRequestCookies;
  
  try {
    // Using dynamic import to avoid tree-shaking issues
    cookieStore = require('next/headers').cookies();
  } catch (e) {
    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        // Empty implementation that does nothing but prevents errors
        cookies: {
          get: () => undefined,
          set: () => {},
          remove: () => {}
        }
      }
    );
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => {
          const cookie = cookieStore.get(name);
          return cookie?.value;
        },
        set: (name: string, value: string, options: any) => {
          try {
            cookieStore.set(name, value, options);
          } catch (e) {
            // This can happen in middleware or server actions
          }
        },
        remove: (name: string, options: any) => {
          try {
            cookieStore.set(name, '', { ...options, maxAge: 0 });
          } catch (e) {
            // This can happen in middleware or server actions
          }
        },
      },
    }
  );
}

