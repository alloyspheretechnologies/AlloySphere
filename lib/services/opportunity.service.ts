import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Opportunity, OpportunityInsert, OpportunityUpdate, OpportunityListingView } from '@/lib/types';

export const opportunityService = {
  async createOpportunity(data: OpportunityInsert) {
    const supabase = getSupabaseBrowserClient();
    const { data: opp, error } = await supabase
      .from('opportunities')
      .insert(data)
      .select()
      .single();
    return { data: opp as Opportunity | null, error };
  },

  async getOpportunity(oppId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('opportunity_listing_view')
      .select('*')
      .eq('id', oppId)
      .single();
    return { data: data as OpportunityListingView | null, error };
  },

  async listOpportunities(options?: {
    startupId?: string;
    commitment?: Opportunity['commitment'];
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
      .from('opportunity_listing_view')
      .select('*', { count: 'exact' })
      .eq('status', 'open');

    if (options?.startupId) query = query.eq('startup_id', options.startupId);
    if (options?.commitment) query = query.eq('commitment', options.commitment);
    if (options?.skills?.length) query = query.overlaps('required_skills', options.skills);
    if (options?.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    return { data: data ?? [], count: count ?? 0, page, pageSize, totalPages: Math.ceil((count ?? 0) / pageSize), error };
  },

  async updateOpportunity(oppId: string, updates: OpportunityUpdate) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.from('opportunities').update(updates).eq('id', oppId).select().single();
    return { data: data as Opportunity | null, error };
  },

  async deleteOpportunity(oppId: string) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('opportunities').delete().eq('id', oppId);
    return { error };
  },

  async saveOpportunity(userId: string, oppId: string) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('saved_opportunities').insert({ user_id: userId, opportunity_id: oppId });
    return { error };
  },

  async unsaveOpportunity(userId: string, oppId: string) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('saved_opportunities').delete().eq('user_id', userId).eq('opportunity_id', oppId);
    return { error };
  },

  async getSavedOpportunities(userId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('saved_opportunities')
      .select('*, opportunity:opportunities(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data: data ?? [], error };
  },
};
