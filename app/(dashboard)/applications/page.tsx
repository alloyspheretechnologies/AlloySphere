"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { applicationService } from "@/lib/services/application.service";
import { profileService } from "@/lib/services/profile.service";

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: profile } = await profileService.getCurrentProfile();
      if (!profile) return;
      const { data: apps } = await applicationService.getMyApplications(profile.id, { pageSize: 50 });
      setApplications(apps || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleWithdraw = async (appId: string) => {
    if (!confirm("Withdraw this application?")) return;
    await applicationService.withdraw(appId);
    await loadData();
  };

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const statusConfig: Record<string, { bg: string; text: string }> = {
    applied: { bg: "bg-white/5", text: "text-on-surface-variant" },
    reviewing: { bg: "bg-blue-500/20", text: "text-blue-400" },
    interview: { bg: "bg-amber-500/20", text: "text-amber-400" },
    accepted: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
    rejected: { bg: "bg-red-500/20", text: "text-red-400" },
    withdrawn: { bg: "bg-white/5", text: "text-on-surface-variant" },
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-in fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">My Applications</h1>
        <p className="text-on-surface-variant mt-2">Track the status of your applications across startups.</p>
      </header>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "applied", "reviewing", "interview", "accepted", "rejected"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
              filter === s ? "bg-white text-black border-white" : "bg-surface-container-high border-white/10 text-on-surface-variant hover:border-white/20"
            }`}>
            {s === "all" ? `All (${applications.length})` : `${s} (${applications.filter(a => a.status === s).length})`}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map((app: any) => {
            const cfg = statusConfig[app.status] || statusConfig.applied;
            return (
              <div key={app.id} className="glass-panel p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold text-white">
                      {(app.startup_name || "S").charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">{app.opportunity_title || "Role"}</h3>
                      <p className="text-sm text-on-surface-variant">{app.startup_name || "Startup"} • Applied {new Date(app.applied_at || app.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs uppercase tracking-wider px-3 py-1 rounded font-bold ${cfg.bg} ${cfg.text}`}>{app.status}</span>
                    {(app.status === "applied" || app.status === "reviewing") && (
                      <button onClick={() => handleWithdraw(app.id)}
                        className="text-xs text-on-surface-variant hover:text-red-400 px-3 py-1 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>
                {app.cover_letter && (
                  <div className="mt-4 pt-4 border-t border-white/5">
                    <p className="text-xs text-on-surface-variant line-clamp-2">&ldquo;{app.cover_letter}&rdquo;</p>
                  </div>
                )}

                {/* Application Timeline */}
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                  {["applied", "reviewing", "interview", "accepted"].map((step, i) => {
                    const stepOrder = ["applied", "reviewing", "interview", "accepted"];
                    const currentIdx = stepOrder.indexOf(app.status);
                    const isActive = i <= currentIdx && app.status !== "rejected";
                    return (
                      <div key={step} className="flex items-center gap-2 flex-1">
                        <div className={`w-2.5 h-2.5 rounded-full ${isActive ? "bg-white" : "bg-white/10"}`} />
                        <span className={`text-[10px] uppercase tracking-wider ${isActive ? "text-white" : "text-on-surface-variant/50"}`}>{step}</span>
                        {i < 3 && <div className={`flex-1 h-px ${isActive && i < currentIdx ? "bg-white/30" : "bg-white/5"}`} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 block">description</span>
          <h3 className="text-lg font-bold text-white mb-2">No applications yet</h3>
          <p className="text-sm text-on-surface-variant mb-6">Browse opportunities and apply to your first role.</p>
          <Link href="/jobs" className="px-6 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 inline-block">
            Browse Opportunities
          </Link>
        </div>
      )}
    </div>
  );
}
