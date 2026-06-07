"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { opportunityService } from "@/lib/services/opportunity.service";
import { applicationService } from "@/lib/services/application.service";
import { profileService } from "@/lib/services/profile.service";
import { Modal } from "@/components/shared/modal";

export default function JobsPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [filterCommit, setFilterCommit] = useState("all");

  // Apply modal
  const [showApply, setShowApply] = useState(false);
  const [applyOpp, setApplyOpp] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [applying, setApplying] = useState(false);
  // Track full application status per opportunity for persistence across refreshes
  const [appliedStatuses, setAppliedStatuses] = useState<Map<string, string>>(new Map());

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [oppsRes, profileRes] = await Promise.all([
        opportunityService.listOpportunities({ pageSize: 50 }),
        profileService.getCurrentProfile(),
      ]);
      setOpportunities(oppsRes.data || []);
      setProfile(profileRes.data);

      if (profileRes.data) {
        // Query applications table directly (not the view) to reliably get applied statuses
        const supabase = (await import("@/lib/supabase/client")).getSupabaseBrowserClient();
        const { data: apps } = await supabase
          .from("applications")
          .select("opportunity_id, status")
          .eq("applicant_id", profileRes.data.id);
        if (apps) {
          const statusMap = new Map<string, string>();
          apps.forEach((a: any) => statusMap.set(a.opportunity_id, a.status));
          setAppliedStatuses(statusMap);
        }
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleApply = async () => {
    if (!profile || !applyOpp) return;
    setApplying(true);
    try {
      const { error } = await applicationService.apply({
        opportunity_id: applyOpp.id,
        applicant_id: profile.id,
        startup_id: applyOpp.startup_id,
        cover_letter: coverLetter || null,
        resume_url: null,
        metadata: {},
      });
      if (error) {
        // Handle duplicate constraint violation gracefully
        if (error.code === "23505") {
          setAppliedStatuses((prev) => new Map(prev).set(applyOpp.id, "applied"));
        } else {
          console.error(error);
        }
      } else {
        setAppliedStatuses((prev) => new Map(prev).set(applyOpp.id, "applied"));
      }
      setShowApply(false);
      setCoverLetter("");
      setApplyOpp(null);
    } catch (e) { console.error(e); } finally { setApplying(false); }
  };

  const filtered = opportunities.filter((o) => {
    const matchSearch = !search || o.title?.toLowerCase().includes(search.toLowerCase()) || o.startup_name?.toLowerCase().includes(search.toLowerCase());
    const matchCommit = filterCommit === "all" || o.commitment === filterCommit;
    return matchSearch && matchCommit;
  });

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">Opportunities</h1>
        <p className="text-on-surface-variant mt-2">Find your next mission. Connect with high-growth startups.</p>
      </header>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-high border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none"
            placeholder="Search roles or companies..." />
        </div>
        <div className="flex gap-2">
          {["all", "full_time", "part_time", "contract", "cofounder"].map((c) => (
            <button key={c} onClick={() => setFilterCommit(c)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all capitalize ${
                filterCommit === c ? "bg-white text-black border-white" : "bg-surface-container-high border-white/10 text-on-surface-variant hover:border-white/20"
              }`}>
              {c === "all" ? "All Types" : c.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length > 0 ? filtered.map((opp: any) => (
          <div key={opp.id} className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all holographic-lift flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div className="flex gap-4 items-center flex-1 min-w-0">
              <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold text-white shrink-0">
                {(opp.startup_name || "S").charAt(0)}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-bold text-white">{opp.title}</h3>
                <div className="text-sm text-on-surface-variant flex flex-wrap gap-x-2">{opp.startup_name} • {opp.location} • <span className="capitalize">{opp.commitment?.replace("_", " ")}</span></div>
                {opp.required_skills?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {opp.required_skills.slice(0, 4).map((s: string) => (
                      <span key={s} className="bg-white/5 text-on-surface-variant text-[10px] px-2 py-0.5 rounded font-medium">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              {opp.equity_range && <span className="text-xs text-on-surface-variant">{opp.equity_range} equity</span>}
              {appliedStatuses.has(opp.id) ? (
                <span className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  appliedStatuses.get(opp.id) === "accepted" ? "bg-emerald-500/20 text-emerald-400" :
                  appliedStatuses.get(opp.id) === "rejected" ? "bg-red-500/20 text-red-400" :
                  appliedStatuses.get(opp.id) === "interview" ? "bg-amber-500/20 text-amber-400" :
                  appliedStatuses.get(opp.id) === "reviewing" ? "bg-blue-500/20 text-blue-400" :
                  appliedStatuses.get(opp.id) === "withdrawn" ? "bg-white/5 text-on-surface-variant" :
                  "bg-emerald-500/20 text-emerald-400"
                } capitalize`}>{appliedStatuses.get(opp.id) === "applied" ? "Applied ✓" : appliedStatuses.get(opp.id)?.replace("_", " ")}</span>
              ) : (
                <button onClick={() => { setApplyOpp(opp); setShowApply(true); }}
                  className="bg-white text-black px-6 py-2 rounded-xl transition-all font-semibold text-sm hover:bg-white/90">
                  Apply
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 block">work_off</span>
            <h3 className="text-lg font-bold text-white mb-2">No opportunities found</h3>
            <p className="text-sm text-on-surface-variant">Try adjusting your filters or check back soon.</p>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      <Modal open={showApply} onClose={() => setShowApply(false)} title={`Apply: ${applyOpp?.title || ""}`} size="lg">
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-xl border border-white/5">
            <div className="text-sm font-medium text-white">{applyOpp?.startup_name}</div>
            <div className="text-xs text-on-surface-variant capitalize">{applyOpp?.commitment?.replace("_", " ")} • {applyOpp?.location}</div>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Cover Letter</label>
            <textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none min-h-[120px] resize-none"
              placeholder="Tell the team why you're a great fit for this role..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button onClick={() => setShowApply(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:text-white">Cancel</button>
            <button onClick={handleApply} disabled={applying}
              className="px-6 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 disabled:opacity-50">
              {applying ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
