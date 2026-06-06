"use client";

import { useEffect, useState, useRef } from "react";
import { profileService } from "@/lib/services/profile.service";
import { workspaceService } from "@/lib/services/workspace.service";
import { startupService } from "@/lib/services/startup.service";

export default function DiscussionsPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (activeChannel) loadMessages();
  }, [activeChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadData = async () => {
    try {
      const { data: prof } = await profileService.getCurrentProfile();
      setProfile(prof);
      if (!prof) return;

      const { data: startups } = await startupService.listStartups({ pageSize: 50 });
      const myStartup = startups?.find(s => s.owner_id === prof.id) || startups?.[0];
      if (!myStartup) return;

      const { data: ws } = await workspaceService.getWorkspaceByStartup(myStartup.id);
      setWorkspace(ws);
      if (!ws) return;

      const mockChannels = [
        { id: "gen", name: "general", isPrivate: false },
        { id: "eng", name: "engineering", isPrivate: false },
        { id: "des", name: "design", isPrivate: false },
        { id: "lead", name: "leadership", isPrivate: true },
      ];
      setChannels(mockChannels);
      setActiveChannel(mockChannels[0]);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const loadMessages = async () => {
    if (!activeChannel) return;
    const mockMsgs = [
      { id: "1", content: "Welcome to " + activeChannel.name, created_at: new Date().toISOString(), author: { name: "System" } }
    ];
    setMessages(mockMsgs);
  };

  const handleSend = () => {
    if (!message.trim() || !profile) return;
    const newMsg = {
      id: Date.now().toString(),
      content: message,
      created_at: new Date().toISOString(),
      author: { name: profile.name, avatar_url: profile.avatar_url }
    };
    setMessages([...messages, newMsg]);
    setMessage("");
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-[1400px] mx-auto animate-in fade-in h-[calc(100vh-100px)] flex border border-white/10 rounded-2xl overflow-hidden glass-panel">
      <div className="w-64 border-r border-white/10 bg-surface-container-high/30 flex flex-col shrink-0">
        <div className="p-4 border-b border-white/10">
          <h2 className="font-bold text-white">Discussions</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-2 mt-2">Channels</div>
          {channels.map((c) => (
            <button key={c.id} onClick={() => setActiveChannel(c)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeChannel?.id === c.id ? "bg-white/10 text-white" : "text-on-surface-variant hover:bg-white/5 hover:text-white"
              }`}>
              <span className="material-symbols-outlined text-[16px]">{c.isPrivate ? "lock" : "tag"}</span>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-surface-container-high/10">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface-container-high/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">{activeChannel?.isPrivate ? "lock" : "tag"}</span>
            <h3 className="font-bold text-white">{activeChannel?.name}</h3>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg: any) => (
            <div key={msg.id} className="flex gap-4">
              {msg.author?.avatar_url ? (
                <img src={msg.author.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white shrink-0">
                  {(msg.author?.name || "U").substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-bold text-white text-sm">{msg.author?.name}</span>
                  <span className="text-[10px] text-on-surface-variant">{new Date(msg.created_at).toLocaleTimeString()}</span>
                </div>
                <div className="text-sm text-on-surface-variant bg-surface-container p-3 rounded-2xl rounded-tl-none border border-white/5 inline-block whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-surface-container-high/30 border-t border-white/10">
          <div className="relative flex items-center">
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="w-full bg-surface-container border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-white/30"
              placeholder={`Message #${activeChannel?.name}`} />
            <button onClick={handleSend} disabled={!message.trim()}
              className="absolute right-3 text-emerald-400 hover:text-emerald-300 disabled:opacity-50">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
