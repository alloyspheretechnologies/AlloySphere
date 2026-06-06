import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Notification } from '@/lib/types';

export const notificationService = {
  async getNotifications(userId: string, options?: { unreadOnly?: boolean; page?: number; pageSize?: number }) {
    const supabase = getSupabaseBrowserClient();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 30;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (options?.unreadOnly) query = query.eq('is_read', false);

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    return { data: (data as Notification[]) ?? [], count: count ?? 0, page, pageSize, error };
  },

  async getUnreadCount(userId: string) {
    const supabase = getSupabaseBrowserClient();
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    return { count: count ?? 0, error };
  },

  async markAsRead(notificationId: string) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    return { error };
  },

  async markAllAsRead(userId: string) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    return { error };
  },

  subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    const supabase = getSupabaseBrowserClient();
    return supabase
      .channel(`notifications-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => callback(payload.new as Notification)
      )
      .subscribe();
  },
};
