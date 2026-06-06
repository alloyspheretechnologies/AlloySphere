import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Roadmap } from '@/lib/types';

export const roadmapService = {
  /**
   * Get all roadmaps for a workspace
   */
  async getRoadmaps(workspaceId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('roadmaps')
      .select('*, milestones(*), projects(*)')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    return { data, error };
  },

  /**
   * Create a new roadmap
   */
  async createRoadmap(payload: {
    workspace_id: string;
    title: string;
    description?: string;
    status?: string;
    target_date?: string;
    visibility?: string;
    owner_id: string;
  }) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('roadmaps')
      .insert({
        workspace_id: payload.workspace_id,
        title: payload.title,
        description: payload.description,
        status: payload.status || 'planning',
        target_date: payload.target_date,
        visibility: payload.visibility || 'team',
        owner_id: payload.owner_id
      })
      .select()
      .single();

    return { data, error };
  },

  /**
   * Update roadmap details
   */
  async updateRoadmap(roadmapId: string, updates: any) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('roadmaps')
      .update(updates)
      .eq('id', roadmapId)
      .select()
      .single();

    return { data, error };
  },

  /**
   * Delete a roadmap
   */
  async deleteRoadmap(roadmapId: string) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('roadmaps').delete().eq('id', roadmapId);
    return { error };
  },

  /**
   * Calculate roadmap progress based on milestones
   */
  calculateProgress(milestones: any[]) {
    if (!milestones || milestones.length === 0) return 0;
    const completed = milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / milestones.length) * 100);
  }
};
