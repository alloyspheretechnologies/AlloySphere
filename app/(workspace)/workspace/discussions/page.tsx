"use client";

import { useEffect, useState, useRef } from "react";
import { profileService } from "@/lib/services/profile.service";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";
import type { RealtimeChannel } from "@supabase/supabase-js";

interface DiscussionMessage {
  id: string;
  channel: string;
  author_name: string;
  author_avatar: string;
  author_color: string;
  content: string;
  created_at: string;
}

const CHANNELS = [
  { id: "general", label: "general", color: "#8b5cf6" },
  { id: "product", label: "product-strategy", color: "#10b981" },
  { id: "dev", label: "development", color: "#3b82f6" },
  { id: "design", label: "design", color: "#ec4899" },
];

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899"];

export default function DiscussionsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState("general");
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { startup } = useWorkspaceStore();

  useEffect(() => {
    profileService.getCurrentProfile().then(({ data }) => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

  // Setup Supabase Realtime broadcast channel for discussions
  useEffect(() => {
    if (!startup) return;

    const supabase = getSupabaseBrowserClient();
    const channelId = `discussions-${startup.id}`;

    // Clean up previous channel if it exists
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    const channel = supabase.channel(channelId);
    channelRef.current = channel;

    channel.on("broadcast", { event: "discussion_message" }, (payload) => {
      const msg = payload.payload as DiscussionMessage;
      // Only add messages from other users (we already added ours optimistically)
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [startup]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, activeChannel]);

  const handleSend = () => {
    if (!input.trim() || !profile) return;
    const msg: DiscussionMessage = {
      id: Date.now().toString(),
      channel: activeChannel,
      author_name: profile.name || "You",
      author_avatar: profile.avatar_url || "",
      author_color: COLORS[profile.name?.charCodeAt(0) % COLORS.length || 0],
      content: input.trim(),
      created_at: new Date().toISOString(),
    };

    // Add message locally (optimistic)
    setMessages((prev) => [...prev, msg]);
    setInput("");

    // Broadcast to other users
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "discussion_message",
        payload: msg,
      });
    }
  };

  const channelMessages = messages.filter((m) => m.channel === activeChannel);
  const activeChannelObj = CHANNELS.find((c) => c.id === activeChannel);

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

  return (
    <div className="w-full h-[calc(100vh-100px)] flex animate-in fade-in">
      {/* Channel Sidebar */}
      <div className="w-64 shrink-0 glass-panel border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-sm font-bold text-white">Discussions</h2>
          <p className="text-[10px] text-white/40 mt-0.5">Team channels & conversations</p>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-0.5">
          {CHANNELS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${activeChannel === ch.id ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5 hover:text-white/70"}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-white/30 font-mono text-xs">#</span>
                <span className="font-medium">{ch.label}</span>
              </div>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ch.color }} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Channel Header */}
        <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between bg-surface-container-low/30">
          <div className="flex items-center gap-2">
            <span className="text-white/30 font-mono">#</span>
            <h3 className="text-white font-bold text-sm">{activeChannelObj?.label}</h3>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeChannelObj?.color }} />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </button>
            <button className="p-1.5 hover:bg-white/5 rounded-lg text-white/40 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-[18px]">push_pin</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          {channelMessages.length > 0 ? channelMessages.map((msg) => (
            <div key={msg.id} className="flex gap-3 group">
              <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white border-2" style={{ borderColor: msg.author_color, backgroundColor: `${msg.author_color}20` }}>
                {msg.author_name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-bold text-white">{msg.author_name}</span>
                  <span className="text-[10px] text-white/30">{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <p className="text-sm text-white/80 leading-relaxed mt-0.5">{msg.content}</p>
              </div>
            </div>
          )) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="material-symbols-outlined text-[48px] text-white/10 mb-4">forum</span>
              <p className="text-sm text-white/30">No messages in #{activeChannelObj?.label} yet.</p>
              <p className="text-xs text-white/20 mt-1">Be the first to start the conversation!</p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-2 items-center bg-white/5 border border-white/10 rounded-xl px-3 py-1 focus-within:border-white/20 transition-colors">
            <button className="p-1.5 text-white/30 hover:text-white/60 transition-colors">
              <span className="material-symbols-outlined text-[18px]">add_circle</span>
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-transparent py-2 text-sm text-white placeholder:text-white/25 focus:outline-none"
              placeholder={`Message #${activeChannelObj?.label}...`}
            />
            <button className="p-1.5 text-white/30 hover:text-white/60 transition-colors">
              <span className="material-symbols-outlined text-[18px]">sentiment_satisfied</span>
            </button>
            <button onClick={handleSend} disabled={!input.trim()} className="p-1.5 text-indigo-400 hover:text-indigo-300 disabled:text-white/15 transition-colors">
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
