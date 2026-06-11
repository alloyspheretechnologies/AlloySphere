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
}

// Global registry to prevent duplicate subscriptions across components
const activeChannels = new Map<string, RealtimeChannel>();

export function useRealtimeSubscription({
  table,
  schema = "public",
  event = "*",
  filter,
  onData,
  channelName,
}: SubscriptionOptions) {
  const onDataRef = useRef(onData);

  // Keep callback ref fresh to avoid stale closures without triggering resubscription
  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const topic = channelName || `realtime:${schema}:${table}${filter ? `:${filter}` : ""}`;
    
    let channel = activeChannels.get(topic);

    if (!channel) {
      channel = supabase.channel(topic);
      
      channel.on(
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

      // Handle reconnects and errors
      channel.subscribe((status, err) => {
        if (status === "SUBSCRIBED") {
          console.log(`[Realtime] Subscribed to ${topic}`);
        } else if (status === "CLOSED") {
          console.log(`[Realtime] Closed ${topic}`);
        } else if (status === "CHANNEL_ERROR") {
          console.error(`[Realtime] Error in ${topic}:`, err);
        }
      });

      activeChannels.set(topic, channel);
    } else {
      // If channel already exists, we just add another listener to the existing channel
      channel.on(
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
      // In a strict cleanup, we might remove the specific listener.
      // But for simplicity with Supabase, if a component unmounts, we can just leave the singleton channel active
      // or implement ref-counting. 
      // A common source of errors is aggressively destroying channels that other components need.
      // We will rely on Supabase's automatic handling for now, or just remove the channel if we want to be strict.
      // To prevent "channel closed" errors randomly, we won't unsubscribe the global channel here.
    };
  }, [table, schema, event, filter, channelName]);
}
