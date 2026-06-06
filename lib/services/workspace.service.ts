import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Workspace, WorkspaceOverviewView, WorkspaceActivity } from '@/lib/types';

export const workspaceService = {
  /**
   * Get workspace by startup ID
   */
  async getWorkspaceByStartup(startupId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('startup_id', startupId)
      .single();

    return { data: data as Workspace | null, error };
  },

  /**
   * Get workspace overview (with aggregate counts)
   */
  async getWorkspaceOverview(workspaceId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('workspace_overview_view')
      .select('*')
      .eq('id', workspaceId)
      .single();

    return { data: data as WorkspaceOverviewView | null, error };
  },

  /**
   * Update workspace settings
   */
  async updateWorkspace(workspaceId: string, updates: Partial<Pick<Workspace, 'name' | 'settings'>>) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('workspaces')
      .update(updates)
      .eq('id', workspaceId)
      .select()
      .single();

    return { data: data as Workspace | null, error };
  },

  /**
   * Get workspace activity feed
   */
  async getActivity(workspaceId: string, options?: { page?: number; pageSize?: number }) {
    const supabase = getSupabaseBrowserClient();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 30;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('workspace_activity')
      .select(`
        *,
        user:profiles(id, name, avatar_url)
      `, { count: 'exact' })
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })
      .range(from, to);

    return {
      data: data ?? [],
      count: count ?? 0,
      page,
      pageSize,
      error,
    };
  },

  /**
   * Subscribe to workspace activity (realtime)
   */
  subscribeToActivity(workspaceId: string, callback: (payload: WorkspaceActivity) => void) {
    const supabase = getSupabaseBrowserClient();
    return supabase
      .channel(`workspace-activity-${workspaceId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'workspace_activity',
          filter: `workspace_id=eq.${workspaceId}`,
        },
        (payload) => callback(payload.new as WorkspaceActivity)
      )
      .subscribe();
  },
};
