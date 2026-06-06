"use client";

import { useEffect, useState } from "react";
import { opportunityService } from "@/lib/services/opportunity.service";
import { applicationService } from "@/lib/services/application.service";
import { profileService } from "@/lib/services/profile.service";
import { startupService } from "@/lib/services/startup.service";
import { workspaceService } from "@/lib/services/workspace.service";
import { Modal } from "@/components/shared/modal";
import { SlideOver } from "@/components/shared/slide-over";

const COLUMNS = ["applied", "reviewing", "interview"];

export default function RecruitmentPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Create Opp Modal
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newSkills, setNewSkills] = useState("");
  const [newCommitment, setNewCommitment] = useState("full_time");
  const [newLocation, setNewLocation] = useState("Remote");
  const [creating, setCreating] = useState(false);

  // Application Detail
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [showAppDetail, setShowAppDetail] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: profile } = await profileService.getCurrentProfile();
      if (!profile) return;
      const { data: startups } = await startupService.listStartups({ pageSize: 50 });
      const myStartup = startups?.find((s) => s.owner_id === profile.id) || startups?.[0];
      if (!myStartup) { setLoading(false); return; }
      setStartup(myStartup);

      const [oppsRes, appsRes] = await Promise.all([
        opportunityService.listOpportunities({ startupId: myStartup.id }),
        applicationService.getStartupApplications(myStartup.id, { pageSize: 100 }),
      ]);
      setOpportunities(oppsRes.data || []);
      setApplications(appsRes.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleCreateOpp = async () => {
    if (!newTitle.trim() || !startup) return;
    setCreating(true);
    try {
      await opportunityService.createOpportunity({
        startup_id: startup.id,
        title: newTitle,
        description: newDesc || null,
        required_skills: newSkills ? newSkills.split(",").map(s => s.trim()).filter(Boolean) : [],
        commitment: newCommitment as any,
        location: newLocation,
        experience_level: null, equity_range: null, status: "open",
      });
      setShowCreate(false); setNewTitle(""); setNewDesc(""); setNewSkills("");
      await loadData();
    } catch (e) { console.error(e); } finally { setCreating(false); }
  };

  const handleStatusChange = async (appId: string, newStatus: string) => {
    await applicationService.updateStatus(appId, newStatus as any);
    if (selectedApp?.id === appId) setSelectedApp({ ...selectedApp, status: newStatus });
    await loadData();
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

  const groupedApps: Record<string, any[]> = { applied: [], reviewing: [], interview: [] };
  applications.forEach(a => {
    if (groupedApps[a.status]) groupedApps[a.status].push(a);
  });

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in h-[calc(100vh-140px)] flex flex-col">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Recruitment</h1>
          <p className="text-on-surface-variant mt-1">Manage open roles and applicant pipeline.</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-5 py-2 bg-white text-black rounded-xl font-semibold text-sm hover:bg-white/90 transition-all flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span> Post Role
        </button>
      </header>

      {/* Open Roles */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-wider mb-4">Open Roles</h3>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {opportunities.filter(o => o.status === "open").map(o => (
            <div key={o.id} className="w-[280px] shrink-0 glass-panel p-4 rounded-xl border border-white/10">
              <div className="text-sm font-bold text-white mb-1">{o.title}</div>
              <div className="text-xs text-on-surface-variant flex items-center justify-between">
                <span>{applications.filter((a: any) => a.opportunity_id === o.id).length} applicants</span>
                <span className="capitalize">{o.commitment?.replace("_", " ")}</span>
              </div>
            </div>
          ))}
          {opportunities.filter(o => o.status === "open").length === 0 && (
            <div className="text-sm text-on-surface-variant">No open roles. Post one to start recruiting.</div>
          )}
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="flex-1 flex gap-5 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <div key={col} className="w-[320px] shrink-0 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">{col}</span>
              <span className="bg-white/5 text-on-surface-variant px-2 py-0.5 rounded-full text-xs font-bold border border-white/5">
                {groupedApps[col].length}
              </span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              {groupedApps[col].map((app: any) => (
                <div key={app.id} onClick={() => { setSelectedApp(app); setShowAppDetail(true); }}
                  className="glass-panel p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all cursor-pointer holographic-lift">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                        {(app.applicant_name || "U").substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white leading-tight">{app.applicant_name}</div>
                        <div className="text-[10px] text-on-surface-variant">{new Date(app.applied_at || app.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-medium text-white mb-2">{app.opportunity_title}</div>
                  {app.cover_letter && <p className="text-[10px] text-on-surface-variant line-clamp-2 border-t border-white/5 pt-2">{app.cover_letter}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Decisions */}
        <div className="w-[320px] shrink-0 flex flex-col opacity-80">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">Decisions</span>
          </div>
          <div className="space-y-3">
            {applications.filter(a => a.status === "accepted" || a.status === "rejected").slice(0, 10).map((app: any) => (
              <div key={app.id} className="glass-panel p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-white">{app.applicant_name}</div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    app.status === "accepted" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                  }`}>{app.status}</span>
                </div>
                <div className="text-xs text-on-surface-variant mt-1">{app.opportunity_title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Post New Role" size="lg">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Job Title *</label>
            <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" placeholder="e.g. Senior Full-Stack Engineer" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">Commitment</label>
              <select value={newCommitment} onChange={(e) => setNewCommitment(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none appearance-none">
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="cofounder">Co-founder</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">Location</label>
              <input type="text" value={newLocation} onChange={(e) => setNewLocation(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" placeholder="e.g. Remote or San Francisco, CA" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Required Skills</label>
            <input type="text" value={newSkills} onChange={(e) => setNewSkills(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" placeholder="React, Node.js, System Design (comma separated)" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Description</label>
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none min-h-[100px] resize-none" placeholder="Job description and responsibilities..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:text-white">Cancel</button>
            <button onClick={handleCreateOpp} disabled={!newTitle.trim() || creating}
              className="px-6 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 disabled:opacity-50">
              {creating ? "Posting..." : "Post Role"}
            </button>
          </div>
        </div>
      </Modal>

      <SlideOver open={showAppDetail} onClose={() => setShowAppDetail(false)} title="Application Details" width="lg">
        {selectedApp && (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-bold text-white">
                {(selectedApp.applicant_name || "U").substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{selectedApp.applicant_name}</h2>
                <p className="text-sm text-on-surface-variant">Applied for: <span className="text-white font-medium">{selectedApp.opportunity_title}</span></p>
              </div>
            </div>

            <div className="flex gap-2">
              {["applied", "reviewing", "interview"].map(s => (
                <button key={s} onClick={() => handleStatusChange(selectedApp.id, s)}
                  className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg border transition-colors ${
                    selectedApp.status === s ? "bg-white/10 text-white border-white/20" : "bg-transparent text-on-surface-variant border-white/10 hover:border-white/20"
                  }`}>
                  {s}
                </button>
              ))}
            </div>

            {selectedApp.cover_letter && (
              <div>
                <h3 className="text-sm font-bold text-white mb-2">Cover Letter</h3>
                <div className="bg-surface-container-high p-4 rounded-xl border border-white/5 text-sm text-on-surface-variant whitespace-pre-wrap">
                  {selectedApp.cover_letter}
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-white/5 flex gap-3">
              <button onClick={() => { handleStatusChange(selectedApp.id, "rejected"); setShowAppDetail(false); }}
                className="flex-1 py-3 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-bold transition-colors">
                Reject
              </button>
              <button onClick={() => { handleStatusChange(selectedApp.id, "accepted"); setShowAppDetail(false); }}
                className="flex-1 py-3 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-sm font-bold transition-colors">
                Accept Candidate
              </button>
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
