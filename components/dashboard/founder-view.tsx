"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { startupService } from "@/lib/services/startup.service";
import { profileService } from "@/lib/services/profile.service";
import { applicationService } from "@/lib/services/application.service";
import { opportunityService } from "@/lib/services/opportunity.service";
import { taskService } from "@/lib/services/task.service";
import { workspaceService } from "@/lib/services/workspace.service";
import { Modal } from "@/components/shared/modal";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const chartData = [
  { name: "W1", tasks: 4 }, { name: "W2", tasks: 9 }, { name: "W3", tasks: 7 },
  { name: "W4", tasks: 14 }, { name: "W5", tasks: 18 }, { name: "W6", tasks: 22 },
];

export default function FounderView() {
  const router = useRouter();
  const [startup, setStartup] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateStartup, setShowCreateStartup] = useState(false);

  // Create startup form state
  const [newName, setNewName] = useState("");
  const [newIndustry, setNewIndustry] = useState("SaaS");
  const [newStage, setNewStage] = useState("idea");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: profile } = await profileService.getCurrentProfile();
      if (!profile) return;

      const { data: startups } = await startupService.listStartups({ pageSize: 50 });
      const myStartup = startups?.find((s) => s.owner_id === profile.id);

      if (myStartup) {
        setStartup(myStartup);
        const { data: ws } = await workspaceService.getWorkspaceByStartup(myStartup.id);
        setWorkspace(ws);

        if (ws) {
          const { data: taskData } = await taskService.listTasks(ws.id, { pageSize: 5 });
          setTasks(taskData || []);
        }

        const { data: apps } = await applicationService.getStartupApplications(myStartup.id, { pageSize: 10 });
        setApplications(apps || []);

        const { data: opps } = await opportunityService.listOpportunities({ startupId: myStartup.id });
        setOpportunities(opps || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStartup = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const { data: profile } = await profileService.getCurrentProfile();
      if (!profile) return;
      const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      await startupService.createStartup({
        owner_id: profile.id,
        name: newName,
        slug,
        industry: newIndustry,
        stage: newStage as any,
        description: newDesc || null,
        website: null, logo_url: null, cover_image: null,
        status: "active", visibility: "public",
      });
      setShowCreateStartup(false);
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!startup) {
    return (
      <>
        <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-[40px] text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
          </div>
          <h2 className="text-2xl font-bold mb-3">Launch Your Startup</h2>
          <p className="text-on-surface-variant mb-8">Create your startup to unlock your workspace, recruit talent, and track execution.</p>
          <button onClick={() => setShowCreateStartup(true)}
            className="px-8 py-3 bg-white text-black rounded-xl font-semibold hover:bg-white/90 transition-all">
            Create Startup
          </button>
        </div>
        <Modal open={showCreateStartup} onClose={() => setShowCreateStartup(false)} title="Create Startup" size="lg">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">Startup Name *</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none" placeholder="e.g. AlloySphere" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-on-surface-variant font-medium">Industry</label>
                <select value={newIndustry} onChange={(e) => setNewIndustry(e.target.value)}
                  className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none appearance-none">
                  {["AI / ML", "SaaS", "Fintech", "HealthTech", "EdTech", "E-Commerce", "Developer Tools", "Other"].map(i => <option key={i}>{i}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-on-surface-variant font-medium">Stage</label>
                <select value={newStage} onChange={(e) => setNewStage(e.target.value)}
                  className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none appearance-none">
                  {[{v:"idea",l:"Idea"},{v:"mvp",l:"MVP"},{v:"seed",l:"Seed"},{v:"series_a",l:"Series A"}].map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">Description</label>
              <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none min-h-[80px] resize-none" placeholder="What does your startup do?" />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
              <button onClick={() => setShowCreateStartup(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:text-white">Cancel</button>
              <button onClick={handleCreateStartup} disabled={!newName.trim() || creating}
                className="px-6 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 disabled:opacity-50 transition-all">
                {creating ? "Creating..." : "Create Startup"}
              </button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  const completedTasks = tasks.filter((t: any) => t.status === "done").length;
  const pendingApps = applications.filter((a: any) => a.status === "applied" || a.status === "reviewing").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main Column */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Startup Overview */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all holographic-lift">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{startup.name}</h2>
                <div className="flex items-center gap-2 text-sm text-on-surface-variant mt-1">
                  <span>{startup.industry}</span> • <span className="capitalize">{startup.stage?.replace("_", " ")}</span> • <span>{startup.team_size || 1} Members</span>
                </div>
              </div>
            </div>
            <Link href="/workspace"
              className="bg-white/5 text-white px-4 py-2 rounded-xl text-xs font-semibold border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">grid_view</span> Open Workspace
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-white/5">
            <div>
              <div className="text-xs text-on-surface-variant uppercase mb-1">Tasks</div>
              <div className="text-2xl font-bold text-white">{completedTasks}/{tasks.length || 0}</div>
            </div>
            <div>
              <div className="text-xs text-on-surface-variant uppercase mb-1">Open Roles</div>
              <div className="text-2xl font-bold text-white">{opportunities.length}</div>
            </div>
            <div>
              <div className="text-xs text-on-surface-variant uppercase mb-1">Applications</div>
              <div className="text-2xl font-bold text-white">{applications.length}</div>
            </div>
            <div>
              <div className="text-xs text-on-surface-variant uppercase mb-1">Pending</div>
              <div className="text-2xl font-bold text-white">{pendingApps}</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 h-[320px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-on-surface">Execution Velocity</h3>
            <span className="text-xs text-on-surface-variant bg-white/5 px-2 py-1 rounded">Last 6 Weeks</span>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="fvGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffffff" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ffffff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                <Area type="monotone" dataKey="tasks" stroke="#ffffff" strokeWidth={2} fill="url(#fvGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Side Column */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/workspace/tasks" className="glass-panel p-4 rounded-xl border border-white/10 hover:border-white/30 text-center transition-all holographic-lift">
            <span className="material-symbols-outlined text-white mb-2 block">add_task</span>
            <div className="text-sm font-semibold">Tasks</div>
          </Link>
          <Link href="/workspace/recruitment" className="glass-panel p-4 rounded-xl border border-white/10 hover:border-white/30 text-center transition-all holographic-lift">
            <span className="material-symbols-outlined text-white mb-2 block">campaign</span>
            <div className="text-sm font-semibold">Recruit</div>
          </Link>
          <Link href="/workspace/team" className="glass-panel p-4 rounded-xl border border-white/10 hover:border-white/30 text-center transition-all holographic-lift">
            <span className="material-symbols-outlined text-white mb-2 block">group_add</span>
            <div className="text-sm font-semibold">Team</div>
          </Link>
          <Link href="/workspace/analytics" className="glass-panel p-4 rounded-xl border border-white/10 hover:border-white/30 text-center transition-all holographic-lift">
            <span className="material-symbols-outlined text-white mb-2 block">monitoring</span>
            <div className="text-sm font-semibold">Analytics</div>
          </Link>
        </div>

        {/* Recent Applications */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex-1 flex flex-col">
          <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">group</span> Recent Applications
          </h3>
          {applications.length > 0 ? (
            <div className="space-y-3 flex-1">
              {applications.slice(0, 4).map((app: any, i: number) => (
                <div key={app.id || i} className="bg-surface-container-high/50 p-3 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                      {(app.applicant_name || "U").substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{app.applicant_name || "Applicant"}</div>
                      <div className="text-xs text-on-surface-variant truncate">{app.opportunity_title || "Role"}</div>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                      app.status === "accepted" ? "bg-emerald-500/20 text-emerald-400" :
                      app.status === "rejected" ? "bg-red-500/20 text-red-400" :
                      "bg-white/5 text-on-surface-variant"
                    }`}>{app.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-on-surface-variant text-center py-6">No applications yet. Create an opportunity to start recruiting.</div>
          )}
          <Link href="/workspace/recruitment" className="mt-4 w-full py-2 border border-white/10 rounded-lg text-sm text-white hover:bg-white/5 transition-colors text-center block">
            View All Applications
          </Link>
        </div>
      </div>
    </div>
  );
}
