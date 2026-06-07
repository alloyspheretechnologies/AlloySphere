import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      realtime: {
        params: {
          eventsPerSecond: 2,
        },
      },
    }
  );
}

// Singleton for client-side usage
let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClient();
  }
  return browserClient;
}

// Re-export for backward compatibility
export const supabase = typeof window !== 'undefined'
  ? getSupabaseBrowserClient()
  : (null as unknown as ReturnType<typeof createClient>);
