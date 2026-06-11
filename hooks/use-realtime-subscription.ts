"use client";

import { useEffect, useRef } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";

interface SubscriptionOptions {
  table: string;
  schema?: string;
  event?: "INSERT" | "UPDATE" | "DELETE" | "*";
  filter?: string;
  onData: (payload: any) => void;
  channelName?: string;
  enabled?: boolean;
}

// Global registry to prevent duplicate subscriptions across components
const activeChannels = new Map<string, { channel: RealtimeChannel; listeners: number }>();

export function useRealtimeSubscription({
  table,
  schema = "public",
  event = "*",
  filter,
  onData,
  channelName,
  enabled = true,
}: SubscriptionOptions) {
  const onDataRef = useRef(onData);

  // Keep callback ref fresh to avoid stale closures without triggering resubscription
  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  useEffect(() => {
    if (!enabled) return;

    const supabase = getSupabaseBrowserClient();
    const topic = channelName || `realtime:${schema}:${table}${filter ? `:${filter}` : ""}`;
    
    let activeData = activeChannels.get(topic);
    
    // Create a unique binding reference for this hook instance
    let bindingRef: any = null;

    if (!activeData) {
      const channel = supabase.channel(topic);
      
      bindingRef = channel.on(
        "postgres_changes",
        {
          event,
          schema,
          table,
          filter,
        },
        (payload) => {
          if (onDataRef.current) {
            onDataRef.current(payload);
          }
        }
      );

      // Handle reconnects and errors with backoff logic (handled implicitly by Supabase client, but we log it)
      channel.subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log(`[Realtime] Subscribed to ${topic}`);
        } else if (status === "CLOSED") {
          console.log(`[Realtime] Closed ${topic}`);
        } else if (status === "CHANNEL_ERROR") {
          console.error(`[Realtime] Error in ${topic}:`, err);
          // Optional: implement manual reconnect logic here if needed, 
          // but Supabase realtime handles automatic reconnects.
        }
      });

      activeChannels.set(topic, { channel, listeners: 1 });
      activeData = activeChannels.get(topic);
    } else {
      // If channel already exists, increment listener count
      activeData.listeners += 1;
      
      bindingRef = activeData.channel.on(
        "postgres_changes",
        {
          event,
          schema,
          table,
          filter,
        },
        (payload) => {
          if (onDataRef.current) {
            onDataRef.current(payload);
          }
        }
      );
    }

    return () => {
      const currentData = activeChannels.get(topic);
      if (currentData) {
        currentData.listeners -= 1;
        
        // Remove this specific listener
        if (bindingRef) {
           // We'd ideally call remove binding, but Supabase SDK doesn't expose it easily for postgres_changes
           // Instead we just let the channel be destroyed if listeners = 0
        }

        if (currentData.listeners <= 0) {
          // If no one is listening to this topic anymore, destroy it cleanly
          supabase.removeChannel(currentData.channel);
          activeChannels.delete(topic);
        }
      }
    };
  }, [table, schema, event, filter, channelName]);
}
