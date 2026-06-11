import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

// Centralized channel registry to prevent duplicates and memory leaks
const channelRegistry = new Map<string, RealtimeChannel>();

export const realtimeService = {
  /**
   * Subscribe to database changes with a deterministic channel ID
   */
  subscribeToTableChanges(options: {
    channelId: string;
    schema?: string;
    table: string;
    event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
    filter?: string;
    callback: (payload: any) => void;
  }): () => void {
    const supabase = getSupabaseBrowserClient();
    const { channelId, schema = 'public', table, event = '*', filter, callback } = options;

    // Remove existing channel if it exists to ensure clean subscription
    if (channelRegistry.has(channelId)) {
      const existingChannel = channelRegistry.get(channelId);
      if (existingChannel) {
        supabase.removeChannel(existingChannel);
      }
      channelRegistry.delete(channelId);
    }

    const channel = supabase.channel(channelId);

    channel
      .on(
        'postgres_changes',
        // @ts-ignore - Supabase types are sometimes strict about event strings
        { event, schema, table, filter },
        (payload) => {
          callback(payload);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          // Successfully subscribed
        } else if (status === 'CLOSED') {
          // Channel closed
        } else if (status === 'CHANNEL_ERROR') {
          // Handle error, maybe implement retry logic here
          console.error(`[Realtime] Error on channel ${channelId}`);
        }
      });

    channelRegistry.set(channelId, channel);

    // Return a cleanup function
    return () => {
      supabase.removeChannel(channel);
      channelRegistry.delete(channelId);
    };
  },

  /**
   * Subscribe to startup engagement updates (likes, follows, rankings)
   */
  subscribeToStartupEngagement(startupId: string, callbacks: {
    onLike?: (payload: any) => void;
    onFollow?: (payload: any) => void;
    onRankingUpdate?: (payload: any) => void;
  }) {
    const supabase = getSupabaseBrowserClient();
    const channelId = `startup-engagement-${startupId}`;

    if (channelRegistry.has(channelId)) {
      const existingChannel = channelRegistry.get(channelId);
      if (existingChannel) supabase.removeChannel(existingChannel);
      channelRegistry.delete(channelId);
    }

    const channel = supabase.channel(channelId);

    if (callbacks.onLike) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'startup_likes', filter: `startup_id=eq.${startupId}` }, callbacks.onLike);
    }
    
    if (callbacks.onFollow) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'startup_followers', filter: `startup_id=eq.${startupId}` }, callbacks.onFollow);
    }

    if (callbacks.onRankingUpdate) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'startup_rankings', filter: `startup_id=eq.${startupId}` }, callbacks.onRankingUpdate);
    }

    channel.subscribe();
    channelRegistry.set(channelId, channel);

    return () => {
      supabase.removeChannel(channel);
      channelRegistry.delete(channelId);
    };
  },

  /**
   * Clean up a specific channel
   */
  unsubscribe(channelId: string) {
    if (channelRegistry.has(channelId)) {
      const supabase = getSupabaseBrowserClient();
      const channel = channelRegistry.get(channelId);
      if (channel) supabase.removeChannel(channel);
      channelRegistry.delete(channelId);
    }
  },

  /**
   * Clean up all channels (useful on logout)
   */
  unsubscribeAll() {
    const supabase = getSupabaseBrowserClient();
    supabase.removeAllChannels();
    channelRegistry.clear();
  }
};
