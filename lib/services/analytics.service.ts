import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export const analyticsService = {
  /**
   * Track an analytics event
   */
  async trackEvent(eventName: string, properties?: Record<string, unknown>, sessionId?: string) {
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Get profile ID
    let profileId: string | null = null;
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      profileId = profile?.id ?? null;
    }

    const { error } = await supabase
      .from('analytics_events')
      .insert({
        user_id: profileId,
        event_name: eventName,
        properties: properties ?? {},
        session_id: sessionId,
      });

    return { error };
  },

  /**
   * Get dashboard metrics for a startup
   */
  async getStartupMetrics(startupId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('startup_dashboard_view')
      .select('*')
      .eq('id', startupId)
      .single();

    return { data, error };
  },

  /**
   * Get user activity log
   */
  async getUserActivity(userId: string, options?: { page?: number; pageSize?: number }) {
    const supabase = getSupabaseBrowserClient();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('activity_logs')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    return { data: data ?? [], count: count ?? 0, page, pageSize, error };
  },

  /**
   * Get event counts by name (for charts)
   */
  async getEventCounts(eventName: string, days: number = 30) {
    const supabase = getSupabaseBrowserClient();
    const since = new Date();
    since.setDate(since.getDate() - days);

    const { data, error } = await supabase
      .from('analytics_events')
      .select('created_at')
      .eq('event_name', eventName)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true });

    return { data: data ?? [], error };
  },

  /**
   * Log an activity (user-facing activity stream)
   */
  async logActivity(userId: string, action: string, entityType?: string, entityId?: string, metadata?: Record<string, unknown>) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        metadata: metadata ?? {},
      });

    return { error };
  },
};
