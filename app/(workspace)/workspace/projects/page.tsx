"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { projectService } from "@/lib/services/project.service";
import { profileService } from "@/lib/services/profile.service";
import { startupService } from "@/lib/services/startup.service";
import { workspaceService } from "@/lib/services/workspace.service";
import { Modal } from "@/components/shared/modal";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [workspace, setWorkspace] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newStatus, setNewStatus] = useState("planning");
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: profile } = await profileService.getCurrentProfile();
      if (!profile) return;
      const { data: startups } = await startupService.listStartups({ pageSize: 50 });
      const myStartup = startups?.find((s) => s.owner_id === profile.id) || startups?.[0];
      if (!myStartup) { setLoading(false); return; }
      const { data: ws } = await workspaceService.getWorkspaceByStartup(myStartup.id);
      setWorkspace(ws);
      if (ws) {
        const { data: projs } = await projectService.listProjects(ws.id);
        setProjects(projs || []);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!newName.trim() || !workspace) return;
    setCreating(true);
    try {
      const { data: profile } = await profileService.getCurrentProfile();
      await projectService.createProject({
        workspace_id: workspace.id,
        name: newName,
        description: newDesc || null,
        status: newStatus as any,
        start_date: null,
        due_date: null,
        created_by: profile?.id || null,
      });
      setShowCreate(false);
      setNewName(""); setNewDesc(""); setNewStatus("planning");
      await loadData();
    } catch (e) { console.error(e); } finally { setCreating(false); }
  };

  const filtered = filter === "all" ? projects : projects.filter((p) => p.status === filter);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in">
      <header className="mb-6 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Projects</h1>
          <p className="text-on-surface-variant mt-1">Manage your startup initiatives and roadmap.</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-5 py-2 bg-white text-black rounded-xl font-semibold text-sm hover:bg-white/90 transition-all flex items-center gap-2 self-start">
          <span className="material-symbols-outlined text-[18px]">add</span> New Project
        </button>
      </header>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {["all", "planning", "in_progress", "completed", "on_hold"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
              filter === f ? "bg-white text-black border-white" : "bg-surface-container-high border-white/10 text-on-surface-variant hover:border-white/20"
            }`}>
            {f === "all" ? "All" : f.replace("_", " ")}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((project: any) => (
            <Link key={project.id} href={`/workspace/projects/${project.id}`}
              className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all holographic-lift flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-white">{project.name}</h3>
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                  project.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                  project.status === "in_progress" ? "bg-amber-500/20 text-amber-400" :
                  project.status === "on_hold" ? "bg-red-500/20 text-red-400" :
                  "bg-white/5 text-on-surface-variant"
                }`}>{project.status?.replace("_", " ")}</span>
              </div>
              {project.description && <p className="text-xs text-on-surface-variant mb-4 line-clamp-2">{project.description}</p>}
              <div className="mt-auto">
                <div className="flex justify-between text-xs text-on-surface-variant mb-1.5">
                  <span>Progress</span>
                  <span>{project.progress || 0}%</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-white h-full rounded-full transition-all duration-500" style={{ width: `${project.progress || 0}%` }} />
                </div>
              </div>
              {(project.start_date || project.due_date) && (
                <div className="flex items-center gap-1 text-xs text-on-surface-variant mt-3 pt-3 border-t border-white/5">
                  <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                  {project.due_date ? new Date(project.due_date).toLocaleDateString() : "No due date"}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 block">folder_off</span>
          <h3 className="text-lg font-bold text-white mb-2">No projects yet</h3>
          <p className="text-sm text-on-surface-variant mb-6">Create your first project to start organizing work.</p>
          <button onClick={() => setShowCreate(true)} className="px-6 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90">
            Create Project
          </button>
        </div>
      )}

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Project" size="md">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Project Name *</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none" placeholder="e.g. MVP Launch" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Description</label>
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none min-h-[80px] resize-none" placeholder="What is this project about?" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Initial Status</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none appearance-none">
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:text-white">Cancel</button>
            <button onClick={handleCreate} disabled={!newName.trim() || creating}
              className="px-6 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 disabled:opacity-50">
              {creating ? "Creating..." : "Create Project"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
