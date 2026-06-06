"use client";

import { useEffect, useState, useCallback } from "react";
import { taskService } from "@/lib/services/task.service";
import { projectService } from "@/lib/services/project.service";
import { profileService } from "@/lib/services/profile.service";
import { startupService } from "@/lib/services/startup.service";
import { workspaceService } from "@/lib/services/workspace.service";
import { Modal } from "@/components/shared/modal";
import { SlideOver } from "@/components/shared/slide-over";
import type { TaskStatus } from "@/lib/types";

const STATUS_COLUMNS: { key: TaskStatus; label: string; color: string }[] = [
  { key: "todo", label: "To Do", color: "text-on-surface-variant" },
  { key: "in_progress", label: "In Progress", color: "text-amber-400" },
  { key: "in_review", label: "In Review", color: "text-blue-400" },
  { key: "done", label: "Done", color: "text-emerald-400" },
];

const PRIORITIES = [
  { value: "low", label: "Low", dot: "bg-white/30" },
  { value: "medium", label: "Medium", dot: "bg-amber-400" },
  { value: "high", label: "High", dot: "bg-orange-400" },
  { value: "urgent", label: "Urgent", dot: "bg-red-400" },
];

export default function TasksPage() {
  const [grouped, setGrouped] = useState<Record<TaskStatus, any[]>>({
    todo: [], in_progress: [], in_review: [], done: [], cancelled: [],
  });
  const [workspace, setWorkspace] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState("medium");
  const [newAssignee, setNewAssignee] = useState("");
  const [newProject, setNewProject] = useState("");
  const [newTags, setNewTags] = useState("");
  const [creating, setCreating] = useState(false);

  // Detail panel
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [comment, setComment] = useState("");
  const [taskComments, setTaskComments] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const { data: profile } = await profileService.getCurrentProfile();
      if (!profile) return;
      const { data: startups } = await startupService.listStartups({ pageSize: 50 });
      const myStartup = startups?.find((s) => s.owner_id === profile.id) || startups?.[0];
      if (!myStartup) { setLoading(false); return; }

      const { data: ws } = await workspaceService.getWorkspaceByStartup(myStartup.id);
      setWorkspace(ws);
      if (!ws) { setLoading(false); return; }

      const [tasksRes, membersRes, projectsRes] = await Promise.all([
        taskService.listTasksByStatus(ws.id),
        startupService.getMembers(myStartup.id),
        projectService.listProjects(ws.id),
      ]);

      if (tasksRes.data) setGrouped(tasksRes.data as any);
      setMembers(membersRes.data || []);
      setProjects(projectsRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !workspace) return;
    setCreating(true);
    try {
      await taskService.createTask({
        workspace_id: workspace.id,
        project_id: newProject || null,
        title: newTitle,
        description: newDesc || null,
        status: "todo",
        priority: newPriority as any,
        assignee_id: newAssignee || null,
        reporter_id: null,
        tags: newTags ? newTags.split(",").map((t) => t.trim()).filter(Boolean) : [],
        due_date: null,
      });
      setShowCreate(false);
      setNewTitle(""); setNewDesc(""); setNewPriority("medium"); setNewAssignee(""); setNewProject(""); setNewTags("");
      await loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    await taskService.moveTask(taskId, newStatus, 0);
    await loadData();
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, status: newStatus });
    }
  };

  const openTaskDetail = async (task: any) => {
    setSelectedTask(task);
    setShowDetail(true);
    const { data } = await taskService.getTask(task.id);
    if (data) {
      setSelectedTask(data);
      setTaskComments(data.comments || []);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !selectedTask) return;
    const { data: profile } = await profileService.getCurrentProfile();
    if (!profile) return;
    const { data } = await taskService.addComment(selectedTask.id, profile.id, comment);
    if (data) setTaskComments((prev) => [...prev, data]);
    setComment("");
  };

  const handleDeleteTask = async (taskId: string) => {
    await taskService.deleteTask(taskId);
    setShowDetail(false);
    setSelectedTask(null);
    await loadData();
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in h-[calc(100vh-140px)] flex flex-col">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Tasks</h1>
          <p className="text-on-surface-variant mt-1">Kanban board for team execution.</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-5 py-2 bg-white text-black rounded-xl font-semibold text-sm hover:bg-white/90 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span> New Task
        </button>
      </header>

      <div className="flex-1 flex gap-5 overflow-x-auto pb-4">
        {STATUS_COLUMNS.map((col) => (
          <div key={col.key} className="w-[300px] shrink-0 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <span className={`text-xs font-bold uppercase tracking-wider ${col.color}`}>{col.label}</span>
              <span className="bg-white/5 text-on-surface-variant px-2 py-0.5 rounded-full text-xs font-bold border border-white/5">
                {grouped[col.key]?.length || 0}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {(grouped[col.key] || []).map((task: any) => (
                <div key={task.id} onClick={() => openTaskDetail(task)}
                  className="glass-panel p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer holographic-lift">
                  {task.tags?.length > 0 && (
                    <div className="flex gap-1.5 mb-2 flex-wrap">
                      {task.tags.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="bg-white/5 text-on-surface-variant text-[10px] px-2 py-0.5 rounded font-medium">{tag}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-sm text-white font-medium mb-3 line-clamp-2">{task.title}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${PRIORITIES.find(p => p.value === task.priority)?.dot || "bg-white/30"}`} />
                      <span className="text-[10px] text-on-surface-variant capitalize">{task.priority}</span>
                    </div>
                    <div className="w-6 h-6 rounded bg-white/5 text-white flex items-center justify-center text-[10px] font-bold border border-white/10">
                      {(task.assignee?.name || "?").substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                </div>
              ))}

              <button onClick={() => { setShowCreate(true); }}
                className="w-full py-3 rounded-xl border border-dashed border-white/15 text-on-surface-variant hover:text-white hover:border-white/30 transition-colors text-sm flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[16px]">add</span> Add
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Task" size="lg">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Title *</label>
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none"
              placeholder="What needs to be done?" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Description</label>
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none min-h-[80px] resize-none"
              placeholder="Add details..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">Priority</label>
              <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none appearance-none">
                {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">Assignee</label>
              <select value={newAssignee} onChange={(e) => setNewAssignee(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none appearance-none">
                <option value="">Unassigned</option>
                {members.map((m: any) => <option key={m.user_id} value={m.user_id}>{m.profile?.name || "Member"}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">Project</label>
              <select value={newProject} onChange={(e) => setNewProject(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none appearance-none">
                <option value="">No project</option>
                {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">Tags</label>
              <input type="text" value={newTags} onChange={(e) => setNewTags(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none"
                placeholder="Frontend, Bug (comma separated)" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:text-white">Cancel</button>
            <button onClick={handleCreate} disabled={!newTitle.trim() || creating}
              className="px-6 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 disabled:opacity-50">
              {creating ? "Creating..." : "Create Task"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Task Detail Panel */}
      <SlideOver open={showDetail} onClose={() => { setShowDetail(false); setSelectedTask(null); }} title="Task Details" width="lg">
        {selectedTask && (
          <div className="p-6 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">{selectedTask.title}</h2>
              {selectedTask.description && <p className="text-sm text-on-surface-variant">{selectedTask.description}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-on-surface-variant uppercase tracking-wider block mb-2">Status</label>
                <select value={selectedTask.status} onChange={(e) => handleStatusChange(selectedTask.id, e.target.value as TaskStatus)}
                  className="w-full bg-surface-container-high border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none appearance-none">
                  {STATUS_COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-on-surface-variant uppercase tracking-wider block mb-2">Priority</label>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${PRIORITIES.find(p => p.value === selectedTask.priority)?.dot || "bg-white/30"}`} />
                  <span className="text-sm text-white capitalize">{selectedTask.priority}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-on-surface-variant uppercase tracking-wider block mb-2">Assignee</label>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                    {(selectedTask.assignee?.name || "?").substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm text-white">{selectedTask.assignee?.name || "Unassigned"}</span>
                </div>
              </div>
              {selectedTask.tags?.length > 0 && (
                <div>
                  <label className="text-xs text-on-surface-variant uppercase tracking-wider block mb-2">Tags</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTask.tags.map((t: string) => (
                      <span key={t} className="bg-white/5 text-on-surface-variant text-xs px-2 py-0.5 rounded">{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="border-t border-white/5 pt-6">
              <h3 className="text-sm font-bold text-white mb-4">Comments</h3>
              <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto">
                {taskComments.length > 0 ? taskComments.map((c: any, i: number) => (
                  <div key={c.id || i} className="flex gap-3">
                    <div className="w-7 h-7 rounded bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                      {(c.author?.name || "U").substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-bold text-white">{c.author?.name || "User"}</span>
                        <span className="text-[10px] text-on-surface-variant">{new Date(c.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-on-surface-variant mt-0.5">{c.content}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs text-on-surface-variant text-center py-4">No comments yet</p>
                )}
              </div>
              <div className="flex gap-2">
                <input type="text" value={comment} onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  className="flex-1 bg-surface-container-high border border-white/10 rounded-lg p-2 text-sm text-white focus:border-white/40 focus:outline-none"
                  placeholder="Add a comment..." />
                <button onClick={handleAddComment} className="bg-white/10 text-white p-2 rounded-lg hover:bg-white/20 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">send</span>
                </button>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <button onClick={() => handleDeleteTask(selectedTask.id)}
                className="text-red-400 hover:text-red-300 text-xs font-medium flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">delete</span> Delete Task
              </button>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
