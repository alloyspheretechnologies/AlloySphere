import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Application, ApplicationInsert, ApplicationStatus, ApplicationPipelineView } from '@/lib/types';

export const applicationService = {
  async apply(data: ApplicationInsert) {
    const supabase = getSupabaseBrowserClient();
    const { data: app, error } = await supabase
      .from('applications')
      .insert(data)
      .select()
      .single();
    return { data: app as Application | null, error };
  },

  async getApplication(appId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('application_pipeline_view')
      .select('*')
      .eq('id', appId)
      .single();
    return { data: data as ApplicationPipelineView | null, error };
  },

  async getMyApplications(applicantId: string, options?: { status?: ApplicationStatus; page?: number; pageSize?: number }) {
    const supabase = getSupabaseBrowserClient();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('application_pipeline_view')
      .select('*', { count: 'exact' })
      .eq('applicant_id', applicantId);

    if (options?.status) query = query.eq('status', options.status);

    const { data, error, count } = await query
      .order('applied_at', { ascending: false })
      .range(from, to);

    return { data: data ?? [], count: count ?? 0, page, pageSize, error };
  },

  async getStartupApplications(startupId: string, options?: { status?: ApplicationStatus; opportunityId?: string; page?: number; pageSize?: number }) {
    const supabase = getSupabaseBrowserClient();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Query the raw applications table with joins — the pipeline view doesn't expose startup_id or opportunity_id.
    let query = supabase
      .from('applications')
      .select(`
        *,
        opportunity:opportunities!inner(id, title, commitment, location),
        startup:startups!inner(id, name, logo_url, slug),
        applicant:profiles!applications_applicant_id_fkey(id, name, avatar_url, headline, skills)
      `, { count: 'exact' })
      .eq('startup_id', startupId);

    if (options?.status) query = query.eq('status', options.status);
    if (options?.opportunityId) query = query.eq('opportunity_id', options.opportunityId);

    const { data, error, count } = await query
      .order('applied_at', { ascending: false })
      .range(from, to);

    return { data: data ?? [], count: count ?? 0, page, pageSize, error };
  },

  async updateStatus(appId: string, status: ApplicationStatus) {
    const supabase = getSupabaseBrowserClient();
    const updates: Partial<Application> = { status };
    if (status !== 'applied') updates.reviewed_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', appId)
      .select()
      .single();
    return { data: data as Application | null, error };
  },

  async withdraw(appId: string) {
    return this.updateStatus(appId, 'withdrawn');
  },

  subscribeToApplications(startupId: string, callback: (payload: unknown) => void) {
    const supabase = getSupabaseBrowserClient();
    return supabase
      .channel(`applications-${startupId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications', filter: `startup_id=eq.${startupId}` }, callback)
      .subscribe();
  },
};
