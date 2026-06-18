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

  async createNotification(payload: { user_id: string; title: string; body: string; type: string; metadata?: any; link?: string }) {
    const supabase = getSupabaseBrowserClient();
    // Store link inside the data jsonb field since there's no separate link column
    const { link, metadata, ...rest } = payload;
    const data_field = { ...(metadata || {}), ...(link ? { link } : {}) };
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ ...rest, data: data_field }])
      .select()
      .single();
    return { data, error };
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
    const channelId = `notifications-${userId}`;

    // Remove any existing channel with this ID to prevent duplicates
    const existingChannels = supabase.getChannels();
    const existing = existingChannels.find((ch: any) => ch.topic === channelId);
    if (existing) {
      supabase.removeChannel(existing);
    }

    const channel = supabase
      .channel(channelId)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        (payload) => callback(payload.new as Notification)
      );
      
    channel.subscribe();
    
    // Return the channel so callers can clean up
    return channel;
  },
};
