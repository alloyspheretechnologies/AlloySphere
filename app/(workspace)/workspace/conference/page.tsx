"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { profileService } from "@/lib/services/profile.service";
import { startupService } from "@/lib/services/startup.service";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";

import { ConferenceScene } from "@/components/workspace/conference-scene";
import { ConferenceChat } from "@/components/workspace/conference-chat";
import { BottomStrategyBar } from "@/components/workspace/bottom-strategy-bar";

interface Participant {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  angle: number;
  distance: number;
}

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ec4899", "#ef4444", "#06b6d4", "#f97316"];

export default function ConferencePage() {
  const [profile, setProfile] = useState<any>(null);
  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  // Controls
  const [isMuted, setIsMuted] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);

  const channelRef = useRef<any>(null);

  useEffect(() => { loadData(); return () => { leaveConference(); }; }, []);

  const loadData = async () => {
    try {
      const { data: prof } = await profileService.getCurrentProfile();
      setProfile(prof);
      if (!prof) return;

      const { data: startups } = await startupService.listStartups({ pageSize: 50 });
      const myStartup = startups?.find((s: any) => s.owner_id === prof.id) || startups?.[0];
      setStartup(myStartup);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const distributePositions = (count: number, index: number) => {
    const angle = (360 / Math.max(count, 1)) * index - 90; // Start from top
    const distance = count <= 4 ? 60 : count <= 8 ? 75 : 85;
    return { angle, distance };
  };

  const [liveKitToken, setLiveKitToken] = useState<string | null>(null);

  const startConference = async () => {
    if (!profile || !startup) return;

    setIsLive(true);
    
    // 1. Setup Supabase Channel for Chat/Presence
    const supabase = getSupabaseBrowserClient();
    const channelId = `conference-${startup.id}`;
    const channel = supabase.channel(channelId, {
      config: { presence: { key: profile.id } },
    });

    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state).map((key, idx, arr) => {
          const pres: any = state[key][0];
          const { angle, distance } = distributePositions(arr.length, idx);
          return {
            id: key,
            name: pres.name || "Unknown",
            role: pres.role || "Member",
            avatar: pres.avatar || "",
            color: COLORS[idx % COLORS.length],
            angle,
            distance,
          } as Participant;
        });
        setParticipants(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            name: profile.name,
            role: profile.headline || profile.role || "Member",
            avatar: profile.avatar_url || "",
            joined_at: new Date().toISOString(),
          });
        }
      });

    // 2. Fetch LiveKit Token for Audio
    try {
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomName: channelId }),
      });
      const data = await res.json();
      if (data.token) {
        setLiveKitToken(data.token);
      } else {
        console.error("Failed to fetch LiveKit token:", data.error);
        alert("Failed to connect to audio server.");
      }
    } catch (err) {
      console.error("LiveKit connection error:", err);
    }
  };

  const leaveConference = () => {
    if (channelRef.current) {
      const supabase = getSupabaseBrowserClient();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    setLiveKitToken(null);
    setIsLive(false);
    setParticipants([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500/50 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  // Not live — show "Start Conference" screen
  if (!isLive) {
    return (
      <div className="w-full h-[calc(100vh-100px)] flex flex-col items-center justify-center animate-in fade-in">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06),transparent_70%)] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center text-center max-w-md">
          <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="w-24 h-24 rounded-3xl bg-indigo-500/10 border-2 border-indigo-500/30 flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(99,102,241,0.3)]">
            <span className="material-symbols-outlined text-[48px] text-indigo-400">video_call</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Start a Conference</h1>
          <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
            Launch a live conference session. Your {startup?.name || "startup"} team will be notified and can join instantly.
          </p>
          <button onClick={startConference} className="px-8 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-2xl transition-colors text-sm shadow-[0_0_30px_rgba(99,102,241,0.4)] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">play_arrow</span>
            Start Conference
          </button>
          <p className="text-[10px] text-white/20 mt-4">{startup?.name ? `Team: ${startup.name}` : "No startup found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[calc(100vh-80px)] flex flex-col animate-in fade-in pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            Conference
            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-widest">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </h1>
          <p className="text-on-surface-variant text-xs mt-0.5">{participants.length} participant{participants.length !== 1 ? "s" : ""} connected</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">
        <div className="flex-1 glass-panel border border-white/10 rounded-2xl relative overflow-hidden flex flex-col bg-black/30">
          <div className="flex-1 relative">
            {liveKitToken ? (
              <LiveKitRoom
                video={false}
                audio={!isMuted}
                token={liveKitToken}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                // Use default connect options
                connect={true}
              >
                <ConferenceScene members={participants} isMuted={isMuted} isScreenSharing={isScreenSharing} />
                <RoomAudioRenderer />
              </LiveKitRoom>
            ) : (
              <ConferenceScene members={participants} isMuted={isMuted} isScreenSharing={isScreenSharing} />
            )}
          </div>

          {/* Floating Toolbar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-50 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 px-3 py-2 shadow-2xl">
            <ToolbarBtn icon={isMuted ? "mic_off" : "mic"} label={isMuted ? "Unmute" : "Mute"} active={!isMuted} activeColor="emerald" onClick={() => setIsMuted(!isMuted)} />
            <ToolbarBtn icon={isScreenSharing ? "stop_screen_share" : "screen_share"} label={isScreenSharing ? "Stop" : "Share"} active={isScreenSharing} activeColor="blue" onClick={() => setIsScreenSharing(!isScreenSharing)} />
            <div className="w-px h-8 bg-white/10 mx-1" />
            <ToolbarBtn icon={showChat ? "chat_bubble" : "chat"} label="Chat" active={showChat} activeColor="indigo" onClick={() => setShowChat(!showChat)} />
            <div className="w-px h-8 bg-white/10 mx-1" />
            <button onClick={leaveConference} className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors">
              <span className="material-symbols-outlined text-[18px]">call_end</span>
              <span className="text-[8px] font-bold">Leave</span>
            </button>
          </div>
        </div>

        {showChat && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="w-80 shrink-0 glass-panel border border-white/10 rounded-2xl overflow-hidden min-h-0 flex flex-col">
            <ConferenceChat channel={channelRef.current} profile={profile} />
          </motion.div>
        )}
      </div>

      <BottomStrategyBar />
    </div>
  );
}

function ToolbarBtn({ icon, label, active, activeColor, onClick }: { icon: string; label: string; active?: boolean; activeColor?: string; onClick: () => void }) {
  const colorMap: Record<string, string> = {
    emerald: "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
    blue: "bg-blue-500/20 border-blue-500/40 text-blue-400",
    indigo: "bg-indigo-500/20 border-indigo-500/40 text-indigo-300",
  };
  const activeClasses = active && activeColor ? colorMap[activeColor] : "";

  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all border ${active ? activeClasses : "border-transparent text-white/50 hover:bg-white/5 hover:text-white"}`}>
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      <span className="text-[8px] font-bold tracking-wide">{label}</span>
    </button>
  );
}
