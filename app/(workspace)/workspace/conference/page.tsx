"use client";

import { useEffect, useState } from "react";
import { profileService } from "@/lib/services/profile.service";
import { workspaceService } from "@/lib/services/workspace.service";
import { startupService } from "@/lib/services/startup.service";

import { ConferenceScene } from "@/components/workspace/conference-scene";
import { ConferenceSidebar } from "@/components/workspace/conference-sidebar";
import { BottomStrategyBar } from "@/components/workspace/bottom-strategy-bar";

export default function ConferencePage() {
  const [profile, setProfile] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Distribute members evenly around the circle
  // distance is a percentage of the max radius (0-100)
  const members = [
    { id: "founder", name: "Arjun Mehta", role: "Founder & CEO", avatar: "", color: "#8b5cf6", angle: 270, distance: 40 }, 
    { id: "1", name: "Riya Singh", role: "Co-Founder & CTO", avatar: "", color: "#3b82f6", angle: 220, distance: 70 }, 
    { id: "2", name: "Karan Verma", role: "Lead Developer", avatar: "", color: "#3b82f6", angle: 320, distance: 70 }, 
    { id: "3", name: "Neha Patel", role: "UI/UX Designer", avatar: "", color: "#10b981", angle: 180, distance: 90 }, 
    { id: "4", name: "Emma Wilson", role: "Product Manager", avatar: "", color: "#f59e0b", angle: 0, distance: 90 }, 
    { id: "5", name: "David Kumar", role: "Marketing Lead", avatar: "", color: "#10b981", angle: 140, distance: 80 }, 
    { id: "6", name: "Sarah Chen", role: "Advisor", avatar: "", color: "#f59e0b", angle: 40, distance: 80 }, 
    { id: "7", name: "John Carter", role: "Investor", avatar: "", color: "#8b5cf6", angle: 90, distance: 60 }, 
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: prof } = await profileService.getCurrentProfile();
      setProfile(prof);
      if (!prof) return;

      const { data: startups } = await startupService.listStartups({ pageSize: 50 });
      const myStartup = startups?.find((s: any) => s.owner_id === prof.id) || startups?.[0];
      if (!myStartup) return;

      const { data: ws } = await workspaceService.getWorkspaceByStartup(myStartup.id);
      setWorkspace(ws);
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 h-screen">
        <div className="w-8 h-8 border-2 border-indigo-500/50 border-t-indigo-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[calc(100vh-80px)] flex flex-col animate-in fade-in pb-8">
      
      {/* Header Area */}
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Conference
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-widest shadow-glow">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </span>
          </h1>
          <p className="text-on-surface-variant text-sm mt-1">Real-time collaborative session</p>
        </div>
        
        {/* Next Meeting Widget */}
        <div className="glass-panel px-4 py-2 rounded-xl border border-white/10 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">calendar_month</span>
            <div>
              <div className="text-[10px] text-on-surface-variant uppercase tracking-wider font-bold">Next Meeting</div>
              <div className="text-sm font-bold text-white">Product Strategy Discussion</div>
              <div className="text-[10px] text-on-surface-variant">Today, 6:00 PM</div>
            </div>
          </div>
          <button className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/40 px-4 py-1.5 rounded-lg text-xs font-bold transition-colors">
            Join
          </button>
        </div>
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 flex gap-6 min-h-[600px]">
        {/* Left/Center: The 3D Scene */}
        <div className="flex-1 glass-panel border border-white/10 rounded-2xl relative overflow-hidden flex flex-col bg-surface-container-lowest/80">
          <ConferenceScene members={members} />
        </div>

        {/* Right Sidebar */}
        <ConferenceSidebar />
      </div>

      {/* Bottom Strategy Bar */}
      <BottomStrategyBar />
      
    </div>
  );
}
