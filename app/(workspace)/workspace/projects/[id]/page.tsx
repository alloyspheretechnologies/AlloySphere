"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { projectService } from "@/lib/services/project.service";
import { taskService } from "@/lib/services/task.service";
import { Modal } from "@/components/shared/modal";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMilestone, setShowMilestone] = useState(false);
  const [msTitle, setMsTitle] = useState("");
  const [msDesc, setMsDesc] = useState("");
  const [msDate, setMsDate] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editProgress, setEditProgress] = useState(0);
  const [editStatus, setEditStatus] = useState("");

  useEffect(() => { if (projectId) loadData(); }, [projectId]);

  const loadData = async () => {
    try {
      const { data: proj } = await projectService.getProject(projectId);
      setProject(proj);
      if (proj) {
        setEditProgress(proj.progress || 0);
        setEditStatus(proj.status);
      }
      const { data: ms } = await projectService.listMilestones(projectId);
      setMilestones(ms || []);
      if (proj?.workspace_id) {
        const { data: taskData } = await taskService.listTasks(proj.workspace_id, { projectId, pageSize: 20 });
        setTasks(taskData || []);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreateMilestone = async () => {
    if (!msTitle.trim()) return;
    setCreating(true);
    try {
      await projectService.createMilestone({
        project_id: projectId, title: msTitle, description: msDesc || null,
        target_date: msDate || null, status: "pending", roadmap_id: null,
      });
      setShowMilestone(false); setMsTitle(""); setMsDesc(""); setMsDate("");
      await loadData();
    } catch (e) { console.error(e); } finally { setCreating(false); }
  };

  const handleCompleteMilestone = async (id: string) => {
    await projectService.completeMilestone(id);
    await loadData();
  };

  const handleSaveProject = async () => {
    setEditing(true);
    try {
      await projectService.updateProject(projectId, { progress: editProgress, status: editStatus as any });
      await loadData();
    } catch (e) { console.error(e); } finally { setEditing(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  if (!project) return <div className="text-center py-20 text-on-surface-variant">Project not found</div>;

  const completedMs = milestones.filter((m) => m.status === "completed").length;
  const doneTasks = tasks.filter((t: any) => t.status === "done").length;

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-in fade-in pb-12">
      <Link href="/workspace/projects" className="text-sm text-on-surface-variant hover:text-white mb-4 inline-flex items-center gap-1 transition-colors">
        <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Projects
      </Link>

      <header className="mb-8 mt-2">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{project.name}</h1>
            {project.description && <p className="text-on-surface-variant">{project.description}</p>}
          </div>
          <span className={`text-xs font-bold uppercase px-3 py-1 rounded ${
            project.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
            project.status === "in_progress" ? "bg-amber-500/20 text-amber-400" :
            "bg-white/5 text-on-surface-variant"
          }`}>{project.status?.replace("_", " ")}</span>
        </div>
      </header>

      {/* Progress + Edit */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="text-xs text-on-surface-variant uppercase tracking-wider block mb-2">Progress</label>
            <input type="range" min="0" max="100" value={editProgress} onChange={(e) => setEditProgress(Number(e.target.value))}
              className="w-full accent-white" />
            <div className="text-right text-sm text-white font-bold mt-1">{editProgress}%</div>
          </div>
          <div>
            <label className="text-xs text-on-surface-variant uppercase tracking-wider block mb-2">Status</label>
            <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none appearance-none">
              {["planning","in_progress","completed","on_hold","cancelled"].map(s => <option key={s} value={s} className="capitalize">{s.replace("_"," ")}</option>)}
            </select>
          </div>
          <button onClick={handleSaveProject} disabled={editing}
            className="px-6 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 disabled:opacity-50 self-end">
            {editing ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Milestones */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">flag</span> Milestones
              <span className="text-xs text-on-surface-variant">({completedMs}/{milestones.length})</span>
            </h3>
            <button onClick={() => setShowMilestone(true)} className="text-xs text-white hover:bg-white/5 px-2 py-1 rounded transition-colors">+ Add</button>
          </div>
          <div className="space-y-3">
            {milestones.length > 0 ? milestones.map((ms) => (
              <div key={ms.id} className="bg-surface-container-high/50 p-4 rounded-lg border border-white/5 flex items-center gap-3">
                <button onClick={() => ms.status !== "completed" && handleCompleteMilestone(ms.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    ms.status === "completed" ? "bg-emerald-500/30 border-emerald-500 text-emerald-400" : "border-white/20 hover:border-white/40"
                  }`}>
                  {ms.status === "completed" && <span className="material-symbols-outlined text-[14px]">check</span>}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${ms.status === "completed" ? "text-on-surface-variant line-through" : "text-white"}`}>{ms.title}</div>
                  {ms.target_date && <div className="text-xs text-on-surface-variant">{new Date(ms.target_date).toLocaleDateString()}</div>}
                </div>
              </div>
            )) : <p className="text-sm text-on-surface-variant text-center py-4">No milestones set</p>}
          </div>
        </div>

        {/* Tasks */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">task_alt</span> Tasks
              <span className="text-xs text-on-surface-variant">({doneTasks}/{tasks.length})</span>
            </h3>
            <Link href="/workspace/tasks" className="text-xs text-white hover:bg-white/5 px-2 py-1 rounded transition-colors">View Board →</Link>
          </div>
          <div className="space-y-2">
            {tasks.length > 0 ? tasks.slice(0, 6).map((task: any) => (
              <div key={task.id} className="bg-surface-container-high/50 p-3 rounded-lg border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    task.status === "done" ? "bg-emerald-400" : task.status === "in_progress" ? "bg-amber-400" : "bg-white/30"
                  }`} />
                  <span className="text-sm text-white truncate">{task.title}</span>
                </div>
                <span className="text-[10px] text-on-surface-variant capitalize shrink-0 ml-2">{task.status?.replace("_", " ")}</span>
              </div>
            )) : <p className="text-sm text-on-surface-variant text-center py-4">No tasks linked</p>}
          </div>
        </div>
      </div>

      <Modal open={showMilestone} onClose={() => setShowMilestone(false)} title="Add Milestone">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Title *</label>
            <input type="text" value={msTitle} onChange={(e) => setMsTitle(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none" placeholder="e.g. Beta Launch" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Description</label>
            <textarea value={msDesc} onChange={(e) => setMsDesc(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none min-h-[60px] resize-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Target Date</label>
            <input type="date" value={msDate} onChange={(e) => setMsDate(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button onClick={() => setShowMilestone(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:text-white">Cancel</button>
            <button onClick={handleCreateMilestone} disabled={!msTitle.trim() || creating}
              className="px-6 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 disabled:opacity-50">
              {creating ? "Adding..." : "Add Milestone"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
