"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { profileService } from "@/lib/services/profile.service";
import { startupService } from "@/lib/services/startup.service";
import { workspaceService } from "@/lib/services/workspace.service";
import { taskService } from "@/lib/services/task.service";
import { projectService } from "@/lib/services/project.service";

export default function WorkspacePage() {
  const [startup, setStartup] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
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

      if (ws) {
        const { data: tasks } = await taskService.listTasks(ws.id, { pageSize: 5 });
        setRecentTasks(tasks || []);
        const { data: projs } = await projectService.listProjects(ws.id);
        setProjects(projs || []);
      }
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
          <Link href="/dashboard" className="px-6 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 transition-all inline-block">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const completedTasks = recentTasks.filter((t: any) => t.status === "done").length;
  const inProgressTasks = recentTasks.filter((t: any) => t.status === "in_progress").length;
  const activeProjects = projects.filter((p: any) => p.status === "in_progress").length;

  return (
    <div className="flex-1 flex flex-col gap-8 w-full max-w-[1600px] mx-auto pb-12 animate-in fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-on-surface mb-2 flex items-center gap-3">
            {startup.name}
            <span className="bg-white/5 text-on-surface-variant px-2 py-1 rounded text-xs font-semibold capitalize border border-white/10">{startup.stage?.replace("_", " ")}</span>
          </h1>
          <p className="text-on-surface-variant">{members.length} team member{members.length !== 1 ? "s" : ""} • {projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/workspace/team" className="glass-panel px-4 py-2 rounded-lg flex items-center gap-2 text-sm text-on-surface hover:bg-white/5 transition-colors border border-white/10">
            <span className="material-symbols-outlined text-[18px]">person_add</span> Invite
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Projects", value: projects.length, icon: "folder", href: "/workspace/roadmap" },
          { label: "Active", value: activeProjects, icon: "play_circle", href: "/workspace/roadmap" },
          { label: "In Progress", value: inProgressTasks, icon: "pending", href: "/workspace/tasks" },
          { label: "Completed", value: completedTasks, icon: "task_alt", href: "/workspace/tasks" },
        ].map((stat) => (
          <Link key={stat.label} href={stat.href}
            className="glass-panel p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all holographic-lift">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">{stat.icon}</span>
              <span className="text-xs text-on-surface-variant uppercase">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
          </Link>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Team */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border border-white/10">
          <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">group</span> Team
          </h3>
          <div className="space-y-3">
            {members.slice(0, 5).map((m: any, i: number) => (
              <div key={m.id || i} className="flex items-center gap-3">
                {m.profile?.avatar_url ? (
                  <img src={m.profile.avatar_url} alt="" className="w-9 h-9 rounded-lg object-cover border border-white/10" />
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                    {(m.profile?.name || "U").substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{m.profile?.name || "Member"}</div>
                  <div className="text-xs text-on-surface-variant capitalize">{m.role}</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400/60" title="Active" />
              </div>
            ))}
          </div>
          <Link href="/workspace/team" className="mt-4 w-full py-2 border border-white/10 rounded-lg text-sm text-white hover:bg-white/5 transition-colors text-center block">
            Manage Team
          </Link>
        </div>

        {/* Active Tasks */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border border-white/10">
          <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">task_alt</span> Recent Tasks
          </h3>
          <div className="space-y-3">
            {recentTasks.length > 0 ? recentTasks.slice(0, 5).map((task: any, i: number) => (
              <div key={task.id || i} className="bg-surface-container-high/50 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex justify-between items-start mb-1.5">
                  <p className="text-sm text-white font-medium line-clamp-1">{task.title}</p>
                  <div className="w-6 h-6 rounded bg-white/5 text-white flex items-center justify-center text-[10px] font-bold border border-white/10 shrink-0 ml-2">
                    {(task.assignee?.name || "U").substring(0, 2).toUpperCase()}
                  </div>
                </div>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                  task.status === "done" ? "bg-emerald-500/20 text-emerald-400" :
                  task.status === "in_progress" ? "bg-amber-500/20 text-amber-400" :
                  "bg-white/5 text-on-surface-variant"
                }`}>{task.status?.replace("_", " ")}</span>
              </div>
            )) : (
              <p className="text-sm text-on-surface-variant text-center py-4">No tasks yet</p>
            )}
          </div>
          <Link href="/workspace/tasks" className="mt-4 w-full py-2 border border-white/10 rounded-lg text-sm text-white hover:bg-white/5 transition-colors text-center block">
            View All Tasks
          </Link>
        </div>

        {/* Projects */}
        <div className="lg:col-span-4 glass-panel rounded-2xl p-6 border border-white/10">
          <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">folder</span> Projects
          </h3>
          <div className="space-y-3">
            {projects.length > 0 ? projects.slice(0, 4).map((proj: any, i: number) => (
              <Link key={proj.id || i} href={`/workspace/roadmap`}
                className="block bg-surface-container-high/50 p-3 rounded-lg border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm text-white font-medium">{proj.name}</p>
                  <span className={`text-[10px] uppercase px-2 py-0.5 rounded font-bold ${
                    proj.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                    proj.status === "in_progress" ? "bg-amber-500/20 text-amber-400" :
                    "bg-white/5 text-on-surface-variant"
                  }`}>{proj.status?.replace("_", " ")}</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-white h-full rounded-full transition-all" style={{ width: `${proj.progress || 0}%` }} />
                </div>
                <div className="text-[10px] text-on-surface-variant mt-1 text-right">{proj.progress || 0}%</div>
              </Link>
            )) : (
              <p className="text-sm text-on-surface-variant text-center py-4">No projects yet</p>
            )}
          </div>
          <Link href="/workspace/roadmap" className="mt-4 w-full py-2 border border-white/10 rounded-lg text-sm text-white hover:bg-white/5 transition-colors text-center block">
            View All Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
