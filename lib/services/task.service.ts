import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Task, TaskInsert, TaskUpdate, TaskComment, TaskStatus } from '@/lib/types';
import { realtimeService } from './realtime.service';

export const taskService = {
  /**
   * Create a new task
   */
  async createTask(data: TaskInsert) {
    const supabase = getSupabaseBrowserClient();
    const { data: task, error } = await supabase
      .from('tasks')
      .insert(data)
      .select()
      .single();

    return { data: task as Task | null, error };
  },

  /**
   * Get a task by ID with comments and assignee
   */
  async getTask(taskId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(id, name, avatar_url),
        reporter:profiles!tasks_reporter_id_fkey(id, name, avatar_url),
        comments:task_comments(
          *,
          author:profiles(id, name, avatar_url)
        )
      `)
      .eq('id', taskId)
      .single();

    return { data, error };
  },

  /**
   * List tasks in a workspace, grouped by status (Kanban)
   */
  async listTasksByStatus(workspaceId: string, projectId?: string) {
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(id, name, avatar_url)
      `)
      .eq('workspace_id', workspaceId);

    if (projectId) query = query.eq('project_id', projectId);

    const { data, error } = await query
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) return { data: null, error };

    // Group by status for Kanban view
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      in_progress: [],
      in_review: [],
      done: [],
      cancelled: [],
    };

    (data as Task[])?.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });

    return { data: grouped, error: null };
  },

  /**
   * List tasks with filters and pagination
   */
  async listTasks(workspaceId: string, options?: {
    status?: TaskStatus;
    priority?: Task['priority'];
    assigneeId?: string;
    projectId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const supabase = getSupabaseBrowserClient();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(id, name, avatar_url)
      `, { count: 'exact' })
      .eq('workspace_id', workspaceId);

    if (options?.status) query = query.eq('status', options.status);
    if (options?.priority) query = query.eq('priority', options.priority);
    if (options?.assigneeId) query = query.eq('assignee_id', options.assigneeId);
    if (options?.projectId) query = query.eq('project_id', options.projectId);

    const { data, error, count } = await query
      .order('position', { ascending: true })
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
   * Update a task
   */
  async updateTask(taskId: string, updates: TaskUpdate) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    return { data: data as Task | null, error };
  },

  /**
   * Move a task to a new status (Kanban drag & drop)
   */
  async moveTask(taskId: string, newStatus: TaskStatus, newPosition: number) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('tasks')
      .update({ status: newStatus, position: newPosition })
      .eq('id', taskId)
      .select()
      .single();

    return { data: data as Task | null, error };
  },

  /**
   * Delete a task
   */
  async deleteTask(taskId: string) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    return { error };
  },

  // ===== Comments =====

  async addComment(taskId: string, authorId: string, content: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('task_comments')
      .insert({ task_id: taskId, author_id: authorId, content })
      .select(`
        *,
        author:profiles(id, name, avatar_url)
      `)
      .single();

    return { data, error };
  },

  async deleteComment(commentId: string) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from('task_comments')
      .delete()
      .eq('id', commentId);

    return { error };
  },

  // ===== Realtime =====

  subscribeToTasks(workspaceId: string, callback: (payload: unknown) => void) {
    return realtimeService.subscribeToTableChanges({
      channelId: `tasks-${workspaceId}`,
      table: 'tasks',
      event: '*',
      filter: `workspace_id=eq.${workspaceId}`,
      callback
    });
  },
};
