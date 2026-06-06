"use client";

import { useEffect, useState } from "react";
import { profileService } from "@/lib/services/profile.service";
import { startupService } from "@/lib/services/startup.service";
import { workspaceService } from "@/lib/services/workspace.service";
import { taskService } from "@/lib/services/task.service";
import { projectService } from "@/lib/services/project.service";
import { applicationService } from "@/lib/services/application.service";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["#ffffff", "#a1a1aa", "#d4d4d8", "#71717a"];

export default function AnalyticsPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: profile } = await profileService.getCurrentProfile();
      if (!profile) return;
      const { data: startups } = await startupService.listStartups({ pageSize: 50 });
      const myStartup = startups?.find((s) => s.owner_id === profile.id) || startups?.[0];
      if (!myStartup) { setLoading(false); return; }

      const { data: ws } = await workspaceService.getWorkspaceByStartup(myStartup.id);
      const [membersRes, appsRes] = await Promise.all([
        startupService.getMembers(myStartup.id),
        applicationService.getStartupApplications(myStartup.id, { pageSize: 50 }),
      ]);
      setMembers(membersRes.data || []);
      setApplications(appsRes.data || []);

      if (ws) {
        const [tasksRes, projsRes] = await Promise.all([
          taskService.listTasks(ws.id, { pageSize: 100 }),
          projectService.listProjects(ws.id),
        ]);
        setTasks(tasksRes.data || []);
        setProjects(projsRes.data || []);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t: any) => t.status === "done").length;
  const inProgressTasks = tasks.filter((t: any) => t.status === "in_progress").length;
  const completionRate = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Task distribution for pie chart
  const taskDistribution = [
    { name: "Done", value: doneTasks },
    { name: "In Progress", value: inProgressTasks },
    { name: "To Do", value: tasks.filter((t: any) => t.status === "todo").length },
    { name: "In Review", value: tasks.filter((t: any) => t.status === "in_review").length },
  ].filter((d) => d.value > 0);

  // Member productivity
  const memberStats = members.map((m: any) => {
    const memberTasks = tasks.filter((t: any) => t.assignee_id === m.user_id);
    const completed = memberTasks.filter((t: any) => t.status === "done").length;
    return { name: (m.profile?.name || "Member").split(" ")[0], total: memberTasks.length, completed };
  }).filter((m) => m.total > 0);

  // Application funnel
  const appStatuses = ["applied", "reviewing", "interview", "accepted", "rejected"];
  const appFunnel = appStatuses.map((s) => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: applications.filter((a: any) => a.status === s).length,
  }));

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">Analytics</h1>
        <p className="text-on-surface-variant mt-1">Track your startup&apos;s execution and growth metrics.</p>
      </header>

      {/* Top Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Tasks", value: totalTasks, icon: "task_alt" },
          { label: "Completion Rate", value: `${completionRate}%`, icon: "trending_up" },
          { label: "Team Members", value: members.length, icon: "group" },
          { label: "Applications", value: applications.length, icon: "description" },
        ].map((stat) => (
          <div key={stat.label} className="glass-panel p-5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">{stat.icon}</span>
              <span className="text-xs text-on-surface-variant uppercase">{stat.label}</span>
            </div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Distribution */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h3 className="font-bold text-white mb-6">Task Distribution</h3>
          {taskDistribution.length > 0 ? (
            <div className="flex items-center gap-8">
              <div className="w-[180px] h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={taskDistribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" strokeWidth={0}>
                      {taskDistribution.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {taskDistribution.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-sm text-on-surface-variant">{d.name}</span>
                    <span className="text-sm font-bold text-white ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <p className="text-sm text-on-surface-variant text-center py-8">No task data yet</p>}
        </div>

        {/* Team Productivity */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <h3 className="font-bold text-white mb-6">Team Productivity</h3>
          {memberStats.length > 0 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={memberStats} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                  <Bar dataKey="total" fill="rgba(255,255,255,0.15)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" fill="#ffffff" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-sm text-on-surface-variant text-center py-8">No productivity data yet</p>}
        </div>

        {/* Recruitment Funnel */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 lg:col-span-2">
          <h3 className="font-bold text-white mb-6">Recruitment Funnel</h3>
          {applications.length > 0 ? (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appFunnel} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} tickLine={false} axisLine={false} width={80} />
                  <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} />
                  <Bar dataKey="value" fill="#ffffff" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <p className="text-sm text-on-surface-variant text-center py-8">No application data yet</p>}
        </div>
      </div>
    </div>
  );
}
