import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export const authService = {
  /**
   * Sign in with Google OAuth
   * Redirects to Google, then back to the callback URL
   */
  async signInWithGoogle(redirectTo?: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectTo || `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    return { data, error };
  },

  /**
   * Sign out the current user
   */
  async signOut() {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  /**
   * Get the current session
   */
  async getSession() {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getSession();
    return { session: data.session, error };
  },

  /**
   * Get the current authenticated user
   */
  async getUser() {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  },

  /**
   * Listen for auth state changes
   */
  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    const supabase = getSupabaseBrowserClient();
    return supabase.auth.onAuthStateChange(callback);
  },
};
