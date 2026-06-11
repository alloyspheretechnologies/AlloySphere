import { PostgrestError } from '@supabase/supabase-js';

export interface SafeQueryResponse<T> {
  data: T | null;
  error: PostgrestError | Error | null;
  count?: number | null;
}

/**
 * A wrapper for Supabase queries to catch errors, prevent Unhandled Rejections,
 * and implement retry logic for transient errors (like 500s or timeouts).
 */
export async function safeQuery<T>(
  queryPromise: PromiseLike<{ data: T | null; error: PostgrestError | null; count?: number | null }>,
  options?: { fallbackData?: T; retries?: number; context?: string }
): Promise<SafeQueryResponse<T>> {
  const maxRetries = options?.retries ?? 0;
  let attempts = 0;

  while (attempts <= maxRetries) {
    try {
      const response = await queryPromise;

      if (response.error) {
        // Log API errors without breaking the application
        console.warn(`[SafeQuery Error] ${options?.context || 'Supabase API'}:`, response.error.message, response.error.details || '');
        
        // Return fallback data if provided
        return { 
          data: options?.fallbackData !== undefined ? options.fallbackData : null, 
          error: response.error,
          count: response.count ?? 0
        };
      }

      return {
        data: response.data,
        error: null,
        count: response.count
      };
    } catch (err: any) {
      attempts++;
      console.error(`[SafeQuery Exception] ${options?.context || 'Supabase API'} (Attempt ${attempts}):`, err);

      if (attempts > maxRetries) {
        return {
          data: options?.fallbackData !== undefined ? options.fallbackData : null,
          error: err instanceof Error ? err : new Error(String(err)),
          count: 0
        };
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempts) * 100));
    }
  }

  return { data: options?.fallbackData !== undefined ? options.fallbackData : null, error: new Error('Max retries exceeded') };
}
