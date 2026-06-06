"use client";

import { useEffect, useState } from "react";
import { roadmapService } from "@/lib/services/roadmap.service";
import { profileService } from "@/lib/services/profile.service";
import { Modal } from "@/components/shared/modal";

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  
  // Create state
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTarget, setNewTarget] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: prof } = await profileService.getCurrentProfile();
      setProfile(prof);
      if (prof) {
        // Find workspace (simplified for this page to just grab the first workspace of the user's startup)
        const { getSupabaseBrowserClient } = await import("@/lib/supabase/client");
        const supabase = getSupabaseBrowserClient();
        const { data: ws } = await supabase.from('workspaces').select('id, startup_id').limit(1).single();
        if (ws) {
          const { data } = await roadmapService.getRoadmaps(ws.id);
          setRoadmaps(data || []);
        }
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!profile || !newTitle.trim()) return;
    try {
      const { getSupabaseBrowserClient } = await import("@/lib/supabase/client");
      const supabase = getSupabaseBrowserClient();
      const { data: ws } = await supabase.from('workspaces').select('id').limit(1).single();
      
      if (ws) {
        await roadmapService.createRoadmap({
          workspace_id: ws.id,
          title: newTitle,
          description: newDesc,
          target_date: newTarget || undefined,
          owner_id: profile.id
        });
        setShowCreate(false); setNewTitle(""); setNewDesc(""); setNewTarget("");
        await loadData();
      }
    } catch (e) { console.error(e); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in pb-12">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Startup Roadmap</h1>
          <p className="text-on-surface-variant mt-1">Plan your vision, goals, and milestones.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-5 py-2 bg-primary text-on-primary font-semibold rounded-xl hover:bg-primary/90 transition-all btn-glow flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">add</span> Create Roadmap
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roadmaps.length > 0 ? roadmaps.map((r) => (
          <div key={r.id} className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-primary/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">{r.title}</h3>
              <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                r.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                r.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                r.status === 'at_risk' ? 'bg-red-500/20 text-red-400' :
                'bg-white/10 text-white/70'
              }`}>{r.status.replace('_', ' ')}</span>
            </div>
            <p className="text-sm text-on-surface-variant mb-6 line-clamp-3">{r.description || "No description provided."}</p>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                  <span>Progress</span>
                  <span>{roadmapService.calculateProgress(r.milestones || [])}%</span>
                </div>
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${roadmapService.calculateProgress(r.milestones || [])}%` }}></div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-on-surface-variant pt-4 border-t border-white/5">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">flag</span> {r.milestones?.length || 0} Milestones</span>
                {r.target_date && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {new Date(r.target_date).toLocaleDateString()}</span>}
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full glass-panel p-12 rounded-2xl border border-white/10 text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 block">map</span>
            <h3 className="text-lg font-bold text-white mb-2">No roadmaps defined</h3>
            <p className="text-sm text-on-surface-variant">Create your first roadmap to align your team on strategic goals.</p>
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create New Roadmap">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-on-surface-variant block mb-1">Roadmap Title</label>
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" placeholder="e.g., Q3 Product Launch" />
          </div>
          <div>
            <label className="text-xs font-semibold text-on-surface-variant block mb-1">Description</label>
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none min-h-[100px] resize-none" placeholder="Strategic objectives..." />
          </div>
          <div>
            <label className="text-xs font-semibold text-on-surface-variant block mb-1">Target Date</label>
            <input type="date" value={newTarget} onChange={(e) => setNewTarget(e.target.value)} className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:text-white">Cancel</button>
            <button onClick={handleCreate} disabled={!newTitle.trim()} className="px-6 py-2 bg-primary text-on-primary rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50">Create Roadmap</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
