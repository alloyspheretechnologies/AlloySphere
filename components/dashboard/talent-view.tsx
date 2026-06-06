"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { profileService } from "@/lib/services/profile.service";
import { opportunityService } from "@/lib/services/opportunity.service";
import { applicationService } from "@/lib/services/application.service";
import { startupService } from "@/lib/services/startup.service";

export default function TalentView() {
  const [profile, setProfile] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [recommendedStartups, setRecommendedStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: prof } = await profileService.getCurrentProfile();
      setProfile(prof);

      const [oppsRes, startupsRes] = await Promise.all([
        opportunityService.listOpportunities({ pageSize: 6 }),
        startupService.listStartups({ pageSize: 6 }),
      ]);

      setOpportunities(oppsRes.data || []);
      setRecommendedStartups(startupsRes.data || []);

      if (prof) {
        const { data: apps } = await applicationService.getMyApplications(prof.id, { pageSize: 10 });
        setApplications(apps || []);
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

  const accepted = applications.filter((a) => a.status === "accepted").length;
  const pending = applications.filter((a) => a.status === "applied" || a.status === "reviewing").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Applications", value: applications.length, icon: "send" },
            { label: "Accepted", value: accepted, icon: "check_circle" },
            { label: "Pending", value: pending, icon: "hourglass_top" },
            { label: "Skills", value: profile?.skills?.length || 0, icon: "psychology" },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">{stat.icon}</span>
                <span className="text-xs text-on-surface-variant uppercase">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Recommended Opportunities */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Recommended Opportunities</h3>
            <Link href="/jobs" className="text-sm text-on-surface-variant hover:text-white transition-colors">View all →</Link>
          </div>
          <div className="space-y-3">
            {opportunities.length > 0 ? opportunities.slice(0, 4).map((opp: any) => (
              <div key={opp.id} className="glass-panel p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all holographic-lift flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex gap-4 items-center">
                  <div className="w-11 h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold text-white">
                    {(opp.startup_name || "S").charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{opp.title}</h4>
                    <div className="text-xs text-on-surface-variant">{opp.startup_name} • {opp.location} • <span className="capitalize">{opp.commitment?.replace("_", " ")}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {opp.required_skills?.slice(0, 2).map((s: string) => (
                    <span key={s} className="bg-white/5 text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-medium">{s}</span>
                  ))}
                  <Link href="/jobs" className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-lg transition-colors text-xs font-semibold">
                    Apply
                  </Link>
                </div>
              </div>
            )) : (
              <div className="glass-panel p-8 rounded-xl border border-white/10 text-center text-sm text-on-surface-variant">
                No opportunities found yet. Check back soon!
              </div>
            )}
          </div>
        </div>

        {/* My Applications */}
        {applications.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">My Applications</h3>
              <Link href="/applications" className="text-sm text-on-surface-variant hover:text-white transition-colors">View all →</Link>
            </div>
            <div className="space-y-2">
              {applications.slice(0, 3).map((app: any) => (
                <div key={app.id} className="glass-panel p-4 rounded-xl border border-white/10 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">{app.opportunity_title}</div>
                    <div className="text-xs text-on-surface-variant">{app.startup_name} • Applied {new Date(app.applied_at).toLocaleDateString()}</div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                    app.status === "accepted" ? "bg-emerald-500/20 text-emerald-400" :
                    app.status === "rejected" ? "bg-red-500/20 text-red-400" :
                    app.status === "interview" ? "bg-amber-500/20 text-amber-400" :
                    "bg-white/5 text-on-surface-variant"
                  }`}>{app.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Profile Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-4 mb-4">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-14 h-14 rounded-xl object-cover border border-white/10" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold text-white">
                {(profile?.name || "U").charAt(0)}
              </div>
            )}
            <div>
              <div className="font-bold text-white">{profile?.name}</div>
              <div className="text-xs text-on-surface-variant">{profile?.headline || "Talent"}</div>
            </div>
          </div>
          {profile?.skills && profile.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {profile.skills.slice(0, 6).map((s: string) => (
                <span key={s} className="bg-white/5 text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-medium border border-white/5">{s}</span>
              ))}
            </div>
          )}
          <Link href="/profile" className="w-full py-2 border border-white/10 rounded-lg text-sm text-white hover:bg-white/5 transition-colors text-center block">
            Edit Profile
          </Link>
        </div>

        {/* Trending Startups */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 flex-1">
          <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-on-surface-variant">trending_up</span> Trending Startups
          </h3>
          <div className="space-y-3">
            {recommendedStartups.slice(0, 4).map((s: any) => (
              <Link key={s.id} href={`/startup/${s.slug}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white group-hover:text-white/80 truncate">{s.name}</div>
                  <div className="text-xs text-on-surface-variant">{s.industry} • <span className="capitalize">{s.stage?.replace("_", " ")}</span></div>
                </div>
              </Link>
            ))}
          </div>
          <Link href="/discover" className="mt-4 w-full py-2 border border-white/10 rounded-lg text-sm text-white hover:bg-white/5 transition-colors text-center block">
            Explore All
          </Link>
        </div>
      </div>
    </div>
  );
}
