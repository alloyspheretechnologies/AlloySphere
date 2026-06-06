import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Conversation, Message, MessageInsert } from '@/lib/types';

export const messageService = {
  /**
   * Create a new direct conversation
   */
  async createDirectConversation(currentUserId: string, otherUserId: string) {
    const supabase = getSupabaseBrowserClient();

    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', currentUserId);

    if (existing?.length) {
      for (const cp of existing) {
        const { data: other } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', cp.conversation_id)
          .eq('user_id', otherUserId)
          .maybeSingle();

        if (other) {
          // Conversation already exists
          const { data: conv } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', cp.conversation_id)
            .eq('type', 'direct')
            .single();
          if (conv) return { data: conv as Conversation, error: null };
        }
      }
    }

    // Create new conversation
    const { data: conv, error: convError } = await supabase
      .from('conversations')
      .insert({ type: 'direct', created_by: currentUserId })
      .select()
      .single();

    if (convError || !conv) return { data: null, error: convError };

    // Add participants
    await supabase.from('conversation_participants').insert([
      { conversation_id: conv.id, user_id: currentUserId },
      { conversation_id: conv.id, user_id: otherUserId },
    ]);

    return { data: conv as Conversation, error: null };
  },

  /**
   * List conversations for a user
   */
  async getConversations(userId: string) {
    const supabase = getSupabaseBrowserClient();

    const { data: participations } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);

    if (!participations?.length) return { data: [], error: null };

    const convIds = participations.map(p => p.conversation_id);

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participants:conversation_participants(
          user_id,
          last_read_at,
          profile:profiles(id, name, avatar_url, headline)
        )
      `)
      .in('id', convIds)
      .order('last_message_at', { ascending: false });

    return { data: data ?? [], error };
  },

  /**
   * Get messages in a conversation
   */
  async getMessages(conversationId: string, options?: { page?: number; pageSize?: number }) {
    const supabase = getSupabaseBrowserClient();
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 50;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, name, avatar_url)
      `, { count: 'exact' })
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .range(from, to);

    return { data: data ?? [], count: count ?? 0, page, pageSize, error };
  },

  /**
   * Send a message
   */
  async sendMessage(data: MessageInsert) {
    const supabase = getSupabaseBrowserClient();
    const { data: message, error } = await supabase
      .from('messages')
      .insert(data)
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(id, name, avatar_url)
      `)
      .single();

    return { data: message, error };
  },

  /**
   * Mark messages as read
   */
  async markAsRead(conversationId: string, userId: string) {
    const supabase = getSupabaseBrowserClient();
    await supabase
      .from('conversation_participants')
      .update({ last_read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false);

    return { error };
  },

  /**
   * Get unread message count
   */
  async getUnreadCount(userId: string) {
    const supabase = getSupabaseBrowserClient();

    const { data: participations } = await supabase
      .from('conversation_participants')
      .select('conversation_id, last_read_at')
      .eq('user_id', userId);

    if (!participations?.length) return { count: 0, error: null };

    let totalUnread = 0;
    for (const p of participations) {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', p.conversation_id)
        .neq('sender_id', userId)
        .gt('created_at', p.last_read_at);

      totalUnread += count ?? 0;
    }

    return { count: totalUnread, error: null };
  },

  /**
   * Subscribe to new messages in a conversation (realtime)
   */
  subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    const supabase = getSupabaseBrowserClient();
    return supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        (payload) => callback(payload.new as Message)
      )
      .subscribe();
  },
};
