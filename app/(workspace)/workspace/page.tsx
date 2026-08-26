"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { profileService } from "@/lib/services/profile.service";
import { startupService } from "@/lib/services/startup.service";
import { workspaceService } from "@/lib/services/workspace.service";

export default function WorkspacePage() {
  const [startup, setStartup] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkspace();
  }, []);

  const loadWorkspace = async () => {
    try {
      const { data: profile } = await profileService.getCurrentProfile();
      if (!profile) return;

      const { data: startups } = await startupService.listStartups({ pageSize: 50 });
      const myStartup = startups?.find((s) => s.owner_id === profile.id) || startups?.[0];
      if (!myStartup) { setLoading(false); return; }

      setStartup(myStartup);
      const { data: ws } = await workspaceService.getWorkspaceByStartup(myStartup.id);
      setWorkspace(ws);

      const { data: mems } = await startupService.getMembers(myStartup.id);
      setMembers(mems || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!startup || !workspace) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center max-w-md">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>grid_view</span>
          <h2 className="text-xl font-bold mb-2">No Workspace Found</h2>
          <p className="text-sm text-on-surface-variant mb-6">Create a startup from the dashboard to set up your workspace.</p>
          <Link href="/startup" className="px-6 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 transition-all inline-block">
            Go to Startup
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col gap-8 w-full max-w-[1600px] mx-auto pb-12 animate-in fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2 flex items-center gap-3">
            {startup.name} Workspace
            <span className="bg-white/5 text-on-surface-variant px-2 py-1 rounded text-xs font-semibold capitalize border border-white/10">{startup.stage?.replace("_", " ")}</span>
          </h1>
          <p className="text-on-surface-variant">{members.length} team member{members.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/workspace/team" className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 text-sm text-on-surface hover:bg-white/5 transition-colors border border-white/10">
            <span className="material-symbols-outlined text-[18px]">person_add</span> Invite
          </Link>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6">
        {/* Team */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10 max-w-2xl">
          <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">group</span> Team Members
          </h3>
          <div className="space-y-3">
            {members.map((m: any, i: number) => (
              <div key={m.id || i} className="flex items-center gap-3">
                {m.profile?.avatar_url ? (
                  <img src={m.profile.avatar_url} alt="" className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                    {(m.profile?.name || "U").substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-base font-medium text-white truncate">{m.profile?.name || "Member"}</div>
                  <div className="text-sm text-on-surface-variant capitalize">{m.role}</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400/60" title="Active" />
              </div>
            ))}
          </div>
          <Link href="/workspace/team" className="mt-6 w-full py-2 border border-white/10 rounded-lg text-sm text-white hover:bg-white/5 transition-colors text-center block font-semibold">
            Manage Team
          </Link>
        </div>
      </div>
    </div>
  );
}
