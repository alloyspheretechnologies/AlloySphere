import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { sanitizeSearchInput } from '@/lib/utils';
import { safeQuery } from '@/lib/utils/safe-query';
import type { Startup, StartupInsert, StartupUpdate, StartupMember, StartupDashboardView } from '@/lib/types';

export const startupService = {
  /**
   * Create a new startup
   */
  async createStartup(data: StartupInsert) {
    const supabase = getSupabaseBrowserClient();
    const { data: startup, error } = await supabase
      .from('startups')
      .insert(data)
      .select()
      .single();

    return { data: startup as Startup | null, error };
  },

  /**
   * Get a startup by ID
   */
  async getStartup(startupId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await safeQuery(
      supabase.from('startups').select('*').eq('id', startupId).single(),
      { context: 'getStartup', retries: 1 }
    );

    return { data: data as Startup | null, error };
  },

  /**
   * Get a startup by slug
   */
  async getStartupBySlug(slug: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await safeQuery(
      supabase.from('startups').select('*').eq('slug', slug).single(),
      { context: 'getStartupBySlug', retries: 1 }
    );

    return { data: data as Startup | null, error };
  },

  /**
   * Update a startup
   */
  async updateStartup(startupId: string, updates: StartupUpdate) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('startups')
      .update(updates)
      .eq('id', startupId)
      .select()
      .single();

    return { data: data as Startup | null, error };
  },

  /**
   * Delete a startup
   */
  async deleteStartup(startupId: string) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from('startups')
      .delete()
      .eq('id', startupId);

    return { error };
  },

  /**
   * List startups with filters
   */
  async listStartups(options?: {
    industry?: string;
    stage?: Startup['stage'];
    search?: string;
    ownerId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const supabase = getSupabaseBrowserClient();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('startups')
      .select('*', { count: 'exact' });

    if (options?.industry) query = query.eq('industry', options.industry);
    if (options?.stage) query = query.eq('stage', options.stage);
    if (options?.ownerId) query = query.eq('owner_id', options.ownerId);
    if (options?.search) {
      const q = sanitizeSearchInput(options.search);
      query = query.or(`name.ilike.%${q}%,industry.ilike.%${q}%,description.ilike.%${q}%`);
    }

    const { data, error, count } = await query
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(from, to);

    return {
      data: (data as Startup[]) ?? [],
      count: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
      error,
    };
  },

  /**
   * Get startup dashboard view (aggregated metrics)
   */
  async getStartupDashboard(startupId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await safeQuery(
      supabase.from('startup_dashboard_view').select('*').eq('id', startupId).single(),
      { context: 'getStartupDashboard', retries: 1 }
    );

    return { data: data as StartupDashboardView | null, error };
  },

  /**
   * Get startups owned by a user (profile ID)
   */
  async getMyStartups(profileId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('startups')
      .select('*')
      .eq('owner_id', profileId)
      .order('created_at', { ascending: false });

    return { data: (data as Startup[]) ?? [], error };
  },

  // ===== Members =====

  /**
   * Get startups where the user is an active member
   */
  async getMyMemberships(profileId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('startup_members')
      .select('startup_id, role, status, startup:startups(*)')
      .eq('user_id', profileId)
      .eq('status', 'active');
      
    return { data: data ?? [], error };
  },

  /**
   * Get members of a startup
   */
  async getMembers(startupId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('startup_members')
      .select(`
        *,
        profile:profiles(id, name, username, avatar_url, headline, role)
      `)
      .eq('startup_id', startupId)
      .eq('status', 'active')
      .order('joined_at', { ascending: true });

    return { data: data ?? [], error };
  },

  /**
   * Invite a member to a startup
   */
  async inviteMember(startupId: string, userId: string, role: StartupMember['role'] = 'member') {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('startup_members')
      .insert({
        startup_id: startupId,
        user_id: userId,
        role,
        status: 'invited',
      })
      .select()
      .single();

    return { data, error };
  },

  /**
   * Remove a member from a startup
   */
  async removeMember(startupId: string, userId: string) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from('startup_members')
      .delete()
      .eq('startup_id', startupId)
      .eq('user_id', userId);

    return { error };
  },

  // ===== Followers =====

  /**
   * Follow a startup
   */
  async followStartup(startupId: string, profileId: string) {
    const supabase = getSupabaseBrowserClient();
    
    // Check if user is owner
    const { data: startup } = await supabase.from('startups').select('owner_id').eq('id', startupId).single();
    if (startup?.owner_id === profileId) {
      return { error: new Error('You cannot follow your own startup') };
    }

    const { error } = await supabase
      .from('startup_followers')
      .insert({ startup_id: startupId, user_id: profileId });

    return { error };
  },

  /**
   * Unfollow a startup
   */
  async unfollowStartup(startupId: string, profileId: string) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from('startup_followers')
      .delete()
      .eq('startup_id', startupId)
      .eq('user_id', profileId);

    return { error };
  },

  /**
   * Check if user follows a startup
   */
  async isFollowing(startupId: string, profileId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('startup_followers')
      .select('id')
      .eq('startup_id', startupId)
      .eq('user_id', profileId)
      .maybeSingle();

    return { isFollowing: !!data, error };
  },

  // ===== Likes =====

  /**
   * Like a startup
   */
  async likeStartup(startupId: string, profileId: string) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from('startup_likes')
      .insert({ startup_id: startupId, user_id: profileId });

    return { error };
  },

  /**
   * Unlike a startup
   */
  async unlikeStartup(startupId: string, profileId: string) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from('startup_likes')
      .delete()
      .eq('startup_id', startupId)
      .eq('user_id', profileId);

    return { error };
  },

  /**
   * Check if user likes a startup
   */
  async isLiked(startupId: string, profileId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('startup_likes')
      .select('id')
      .eq('startup_id', startupId)
      .eq('user_id', profileId)
      .maybeSingle();

    return { isLiked: !!data, error };
  },

  // ===== Rankings =====

  /**
   * Get trending startups
   */
  async getTrendingStartups(options?: { page?: number; pageSize?: number }) {
    const supabase = getSupabaseBrowserClient();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 10;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('startup_rankings')
      .select(`
        score,
        rank_position,
        startup:startups (
          id,
          name,
          slug,
          industry,
          logo_url,
          description
        )
      `, { count: 'exact' })
      .order('score', { ascending: false })
      .range(from, to);

    return {
      data: data ?? [],
      count: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
      error,
    };
  },
};
