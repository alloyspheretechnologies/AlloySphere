import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Project, ProjectInsert, ProjectUpdate, Milestone } from '@/lib/types';

export const projectService = {
  /**
   * Create a new project
   */
  async createProject(data: ProjectInsert) {
    const supabase = getSupabaseBrowserClient();
    const { data: project, error } = await supabase
      .from('projects')
      .insert(data)
      .select()
      .single();

    return { data: project as Project | null, error };
  },

  /**
   * Get a project by ID
   */
  async getProject(projectId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        milestones(*),
        tasks(count)
      `)
      .eq('id', projectId)
      .single();

    return { data, error };
  },

  /**
   * List projects in a workspace
   */
  async listProjects(workspaceId: string, options?: { status?: Project['status'] }) {
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId);

    if (options?.status) query = query.eq('status', options.status);

    const { data, error } = await query
      .order('created_at', { ascending: false });

    return { data: (data as Project[]) ?? [], error };
  },

  /**
   * Update a project
   */
  async updateProject(projectId: string, updates: ProjectUpdate) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', projectId)
      .select()
      .single();

    return { data: data as Project | null, error };
  },

  /**
   * Delete a project
   */
  async deleteProject(projectId: string) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    return { error };
  },

  // ===== Milestones =====

  async createMilestone(data: Omit<Milestone, 'id' | 'created_at' | 'completed_at'>) {
    const supabase = getSupabaseBrowserClient();
    const { data: milestone, error } = await supabase
      .from('milestones')
      .insert(data)
      .select()
      .single();

    return { data: milestone as Milestone | null, error };
  },

  async listMilestones(projectId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('project_id', projectId)
      .order('target_date', { ascending: true });

    return { data: (data as Milestone[]) ?? [], error };
  },

  async updateMilestone(milestoneId: string, updates: Partial<Milestone>) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('milestones')
      .update(updates)
      .eq('id', milestoneId)
      .select()
      .single();

    return { data: data as Milestone | null, error };
  },

  async completeMilestone(milestoneId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('milestones')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', milestoneId)
      .select()
      .single();

    return { data: data as Milestone | null, error };
  },
};
