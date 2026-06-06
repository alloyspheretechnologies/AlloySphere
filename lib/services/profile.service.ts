import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { sanitizeSearchInput } from '@/lib/utils';
import type { Profile, ProfileUpdate } from '@/lib/types';

export const profileService = {
  /**
   * Get the current user's profile
   */
  async getCurrentProfile() {
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('Not authenticated') };

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!data && !error) {
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          name: user.user_metadata?.full_name || user.user_metadata?.name || 'New User',
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          role: 'talent'
        })
        .select()
        .single();
      return { data: newProfile as Profile | null, error: insertError };
    }

    return { data: data as Profile | null, error };
  },

  /**
   * Get a profile by profile ID
   */
  async getProfile(profileId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    return { data: data as Profile | null, error };
  },

  /**
   * Get a profile by username
   */
  async getProfileByUsername(username: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single();

    return { data: data as Profile | null, error };
  },

  /**
   * Update the current user's profile
   */
  async updateProfile(userId: string, updates: ProfileUpdate) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    return { data: data as Profile | null, error };
  },

  /**
   * Set the user's role (during onboarding)
   */
  async setRole(userId: string, role: Profile['role']) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('user_id', userId)
      .select()
      .single();

    return { data: data as Profile | null, error };
  },

  /**
   * Mark onboarding as complete
   */
  async completeOnboarding(userId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('profiles')
      .update({ onboarding_complete: true })
      .eq('user_id', userId)
      .select()
      .single();

    return { data: data as Profile | null, error };
  },

  /**
   * List profiles with optional filters
   */
  async listProfiles(options?: {
    role?: Profile['role'];
    skills?: string[];
    search?: string;
    page?: number;
    pageSize?: number;
  }) {
    const supabase = getSupabaseBrowserClient();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' });

    if (options?.role) {
      query = query.eq('role', options.role);
    }

    if (options?.skills?.length) {
      query = query.overlaps('skills', options.skills);
    }

    if (options?.search) {
      const q = sanitizeSearchInput(options.search);
      query = query.or(`name.ilike.%${q}%,username.ilike.%${q}%,headline.ilike.%${q}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    return {
      data: (data as Profile[]) ?? [],
      count: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
      error,
    };
  },

  /**
   * Upload avatar
   */
  async uploadAvatar(userId: string, file: File) {
    const supabase = getSupabaseBrowserClient();
    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;

    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (error) return { url: null, error };

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    return { url: publicUrl, error: null };
  },
};
