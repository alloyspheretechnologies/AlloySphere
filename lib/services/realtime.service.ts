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

    let channel = channelRegistry.get(channelId);
    let isNewChannel = false;

    if (!channel) {
      channel = supabase.channel(channelId);
      isNewChannel = true;
      channelRegistry.set(channelId, channel);
    }

    // Add specific listener
    channel.on(
      'postgres_changes',
      // @ts-ignore
      { event, schema, table, filter },
      (payload) => callback(payload)
    );

    if (isNewChannel) {
      channel.subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR') {
          console.error(`[Realtime] Error on channel ${channelId}`, err);
        }
      });
    }

    return () => {
      // Intentionally NOT destroying the channel on unmount to prevent websocket flapping
      // We rely on unsubscribeAll during logout to clean up.
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

    // If a channel already exists for this startup, tear it down first
    // to avoid "cannot add postgres_changes after subscribe()" errors
    const existingChannel = channelRegistry.get(channelId);
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
      channelRegistry.delete(channelId);
    }

    const channel = supabase.channel(channelId);
    channelRegistry.set(channelId, channel);

    if (callbacks.onLike) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'startup_likes', filter: `startup_id=eq.${startupId}` }, callbacks.onLike);
    }
    
    if (callbacks.onFollow) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'startup_followers', filter: `startup_id=eq.${startupId}` }, callbacks.onFollow);
    }

    if (callbacks.onRankingUpdate) {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'startup_rankings', filter: `startup_id=eq.${startupId}` }, callbacks.onRankingUpdate);
    }

    channel.subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR') {
        console.error(`[Realtime] Error on channel ${channelId}`, err);
      }
    });

    return () => {
      const ch = channelRegistry.get(channelId);
      if (ch) {
        supabase.removeChannel(ch);
        channelRegistry.delete(channelId);
      }
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
