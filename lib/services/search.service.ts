import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { sanitizeSearchInput } from '@/lib/utils';
import type { SearchResult } from '@/lib/types';

export const searchService = {
  /**
   * Unified search across all entities using the search_all() PostgreSQL function
   */
  async searchAll(query: string, limit: number = 20) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .rpc('search_all', { search_query: query, result_limit: limit });

    return { data: (data as SearchResult[]) ?? [], error };
  },

  /**
   * Search profiles specifically
   */
  async searchProfiles(query: string, options?: { role?: string; limit?: number }) {
    const supabase = getSupabaseBrowserClient();
    const q = sanitizeSearchInput(query);
    let dbQuery = supabase
      .from('profiles')
      .select('id, name, username, avatar_url, headline, role, skills')
      .or(`name.ilike.%${q}%,username.ilike.%${q}%,headline.ilike.%${q}%,bio.ilike.%${q}%`);

    if (options?.role) dbQuery = dbQuery.eq('role', options.role);

    const { data, error } = await dbQuery.limit(options?.limit ?? 20);
    return { data: data ?? [], error };
  },

  /**
   * Search startups
   */
  async searchStartups(query: string, options?: { industry?: string; stage?: string; limit?: number }) {
    const supabase = getSupabaseBrowserClient();
    const q = sanitizeSearchInput(query);
    let dbQuery = supabase
      .from('startups')
      .select('id, name, slug, industry, stage, logo_url, description, team_size')
      .eq('visibility', 'public')
      .eq('status', 'active')
      .or(`name.ilike.%${q}%,industry.ilike.%${q}%,description.ilike.%${q}%`);

    if (options?.industry) dbQuery = dbQuery.eq('industry', options.industry);
    if (options?.stage) dbQuery = dbQuery.eq('stage', options.stage);

    const { data, error } = await dbQuery.limit(options?.limit ?? 20);
    return { data: data ?? [], error };
  },

  /**
   * Search opportunities
   */
  async searchOpportunities(query: string, options?: { commitment?: string; limit?: number }) {
    const supabase = getSupabaseBrowserClient();
    const q = sanitizeSearchInput(query);
    let dbQuery = supabase
      .from('opportunity_listing_view')
      .select('*')
      .eq('status', 'open')
      .or(`title.ilike.%${q}%,description.ilike.%${q}%,startup_name.ilike.%${q}%`);

    if (options?.commitment) dbQuery = dbQuery.eq('commitment', options.commitment);

    const { data, error } = await dbQuery.limit(options?.limit ?? 20);
    return { data: data ?? [], error };
  },

  /**
   * Search posts
   */
  async searchPosts(query: string, limit: number = 20) {
    const supabase = getSupabaseBrowserClient();
    const q = sanitizeSearchInput(query);
    const { data, error } = await supabase
      .from('user_feed_view')
      .select('*')
      .ilike('content', `%${q}%`)
      .limit(limit);

    return { data: data ?? [], error };
  },

  /**
   * Search tasks within a workspace
   */
  async searchTasks(workspaceId: string, query: string) {
    const supabase = getSupabaseBrowserClient();
    const q = sanitizeSearchInput(query);
    const { data, error } = await supabase
      .from('tasks')
      .select('*, assignee:profiles!tasks_assignee_id_fkey(id, name, avatar_url)')
      .eq('workspace_id', workspaceId)
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .limit(30);

    return { data: data ?? [], error };
  },

  /**
   * Search documents within a workspace
   */
  async searchDocuments(workspaceId: string, query: string) {
    const supabase = getSupabaseBrowserClient();
    const q = sanitizeSearchInput(query);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('workspace_id', workspaceId)
      .ilike('name', `%${q}%`)
      .limit(30);

    return { data: data ?? [], error };
  },
};
