"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { profileService } from "@/lib/services/profile.service";
import { workspaceService } from "@/lib/services/workspace.service";
import { startupService } from "@/lib/services/startup.service";

import { ConferenceScene } from "@/components/workspace/conference-scene";
import { ConferenceSidebar } from "@/components/workspace/conference-sidebar";
import { ConferenceChat } from "@/components/workspace/conference-chat";
import { BottomStrategyBar } from "@/components/workspace/bottom-strategy-bar";

export default function ConferencePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Controls
  const [isMuted, setIsMuted] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);

  const members = [
    { id: "founder", name: "Arjun Mehta", role: "Founder & CEO", avatar: "", color: "#8b5cf6", angle: 270, distance: 45 },
    { id: "1", name: "Riya Singh", role: "Co-Founder & CTO", avatar: "", color: "#3b82f6", angle: 220, distance: 75 },
    { id: "2", name: "Karan Verma", role: "Lead Developer", avatar: "", color: "#3b82f6", angle: 320, distance: 75 },
    { id: "3", name: "Neha Patel", role: "UI/UX Designer", avatar: "", color: "#10b981", angle: 180, distance: 90 },
    { id: "4", name: "Emma Wilson", role: "Product Manager", avatar: "", color: "#f59e0b", angle: 0, distance: 90 },
    { id: "5", name: "David Kumar", role: "Marketing Lead", avatar: "", color: "#10b981", angle: 140, distance: 80 },
    { id: "6", name: "Sarah Chen", role: "Advisor", avatar: "", color: "#f59e0b", angle: 40, distance: 80 },
    { id: "7", name: "John Carter", role: "Investor", avatar: "", color: "#8b5cf6", angle: 90, distance: 60 },
  ];

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: prof } = await profileService.getCurrentProfile();
      setProfile(prof);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500/50 border-t-indigo-400 rounded-full animate-spin" />
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
          <p className="text-on-surface-variant text-xs mt-0.5">{members.length} participants connected</p>
        </div>
        <div className="glass-panel px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-3">
          <span className="material-symbols-outlined text-on-surface-variant text-[18px]">schedule</span>
          <div>
            <div className="text-[9px] text-white/40 uppercase tracking-wider font-bold">Next Meeting</div>
            <div className="text-xs font-semibold text-white">Product Strategy • 6:00 PM</div>
          </div>
          <button className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/40 px-3 py-1 rounded-lg text-[10px] font-bold transition-colors">Join</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-4 min-h-0">

        {/* Left: 3D Scene */}
        <div className="flex-1 glass-panel border border-white/10 rounded-2xl relative overflow-hidden flex flex-col bg-black/30">
          <div className="flex-1 relative">
            <ConferenceScene members={members} isMuted={isMuted} isScreenSharing={isScreenSharing} />
          </div>

          {/* Floating Toolbar */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-50 bg-black/60 backdrop-blur-2xl rounded-2xl border border-white/10 px-3 py-2 shadow-2xl">
            <ToolbarBtn icon={isMuted ? "mic_off" : "mic"} label={isMuted ? "Unmute" : "Mute"} active={!isMuted} activeColor="emerald" onClick={() => setIsMuted(!isMuted)} />
            <ToolbarBtn icon={isScreenSharing ? "stop_screen_share" : "screen_share"} label={isScreenSharing ? "Stop" : "Share"} active={isScreenSharing} activeColor="blue" onClick={() => setIsScreenSharing(!isScreenSharing)} />

            <div className="w-px h-8 bg-white/10 mx-1" />

            <ToolbarBtn icon="draw" label="Board" onClick={() => {}} />
            <ToolbarBtn icon="group" label="Team" onClick={() => {}} />
            <ToolbarBtn icon={showChat ? "chat_bubble" : "chat"} label="Chat" active={showChat} activeColor="indigo" onClick={() => setShowChat(!showChat)} />

            <div className="w-px h-8 bg-white/10 mx-1" />

            <button className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-colors">
              <span className="material-symbols-outlined text-[18px]">call_end</span>
              <span className="text-[8px] font-bold">Leave</span>
            </button>
          </div>
        </div>

        {/* Right: Chat + Sidebar */}
        <div className="w-80 shrink-0 flex flex-col gap-4 min-h-0">
          {showChat && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex-1 glass-panel border border-white/10 rounded-2xl overflow-hidden min-h-0 flex flex-col">
              <ConferenceChat />
            </motion.div>
          )}
          {!showChat && <ConferenceSidebar />}
        </div>
      </div>

      {/* Bottom Strategy Bar */}
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
