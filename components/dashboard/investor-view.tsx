"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { profileService } from "@/lib/services/profile.service";
import { startupService } from "@/lib/services/startup.service";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function InvestorView() {
  const [profile, setProfile] = useState<any>(null);
  const [investorProfile, setInvestorProfile] = useState<any>(null);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [discoveredStartups, setDiscoveredStartups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: prof } = await profileService.getCurrentProfile();
      setProfile(prof);
      if (!prof) return;

      const supabase = getSupabaseBrowserClient();

      // Load investor profile
      const { data: ip } = await supabase
        .from("investor_profiles")
        .select("*")
        .eq("user_id", prof.id)
        .maybeSingle();
      setInvestorProfile(ip);

      // Load watchlist
      const { data: saved } = await supabase
        .from("saved_startups")
        .select("*, startup:startups(*)")
        .eq("user_id", prof.id)
        .order("created_at", { ascending: false });
      setWatchlist(saved || []);

      // Load startups for discovery
      const { data: startups } = await startupService.listStartups({ pageSize: 8 });
      setDiscoveredStartups(startups || []);
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Main */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Watchlist", value: watchlist.length, icon: "bookmark" },
            { label: "Portfolio", value: investorProfile?.portfolio_count || 0, icon: "business_center" },
            { label: "Deal Flow", value: discoveredStartups.length, icon: "trending_up" },
            { label: "Stages", value: investorProfile?.preferred_stages?.length || 0, icon: "filter_list" },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">{stat.icon}</span>
                <span className="text-xs text-on-surface-variant uppercase">{stat.label}</span>
              </div>
              <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Watchlist */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Your Watchlist</h3>
            <Link href="/investments" className="text-sm text-on-surface-variant hover:text-white transition-colors">Manage →</Link>
          </div>
          {watchlist.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {watchlist.map((item: any) => (
                <Link key={item.id} href={`/startup/${item.startup?.slug || ""}`}
                  className="glass-panel p-5 rounded-xl border border-white/10 hover:border-white/20 transition-all holographic-lift">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-bold text-white">{item.startup?.name}</h4>
                    <span className="bg-white/5 text-on-surface-variant text-[10px] px-2 py-1 rounded font-bold capitalize">{item.startup?.stage?.replace("_", " ")}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mb-3">{item.startup?.industry}</p>
                  {item.notes && (
                    <p className="text-xs text-on-surface-variant/70 italic border-t border-white/5 pt-3 mt-3 line-clamp-2">&ldquo;{item.notes}&rdquo;</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-xl border border-white/10 text-center">
              <p className="text-sm text-on-surface-variant mb-4">No startups saved yet. Discover promising ventures to track.</p>
              <Link href="/discover" className="px-6 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 transition-all inline-block">
                Discover Startups
              </Link>
            </div>
          )}
        </div>

        {/* Deal Flow */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Deal Flow</h3>
            <Link href="/discover" className="text-sm text-on-surface-variant hover:text-white transition-colors">Browse all →</Link>
          </div>
          <div className="space-y-3">
            {discoveredStartups.slice(0, 4).map((s: any) => (
              <Link key={s.id} href={`/startup/${s.slug}`}
                className="glass-panel p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all flex items-center gap-4">
                <div className="w-11 h-11 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold text-white shrink-0">
                  {s.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white">{s.name}</div>
                  <div className="text-xs text-on-surface-variant">{s.industry} • <span className="capitalize">{s.stage?.replace("_", " ")}</span> • {s.team_size} members</div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">arrow_forward</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Execution & Velocity */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Execution & Velocity</h3>
            <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-on-surface-variant">Watchlist Analytics</span>
          </div>
          <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 block">query_stats</span>
            <h4 className="text-base font-bold text-white mb-2">Roadmap Tracking</h4>
            <p className="text-sm text-on-surface-variant max-w-sm mx-auto mb-4">Monitor startup velocity by tracking completed milestones and roadmap progress directly from your watchlist.</p>
            <div className="flex justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-on-surface-variant">Live tracking active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        {/* Investor Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          <div className="flex items-center gap-4 mb-4">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-14 h-14 rounded-xl object-cover border border-white/10" />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl font-bold text-white">
                {(profile?.name || "I").charAt(0)}
              </div>
            )}
            <div>
              <div className="font-bold text-white">{profile?.name}</div>
              <div className="text-xs text-on-surface-variant">{investorProfile?.firm_name || profile?.headline || "Investor"}</div>
            </div>
          </div>

          {investorProfile?.investment_thesis && (
            <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">{investorProfile.investment_thesis}</p>
          )}

          {investorProfile?.preferred_industries && investorProfile.preferred_industries.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {investorProfile.preferred_industries.slice(0, 5).map((ind: string) => (
                <span key={ind} className="bg-white/5 text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-medium border border-white/5">{ind}</span>
              ))}
            </div>
          )}

          <Link href="/profile" className="w-full py-2 border border-white/10 rounded-lg text-sm text-white hover:bg-white/5 transition-colors text-center block">
            Edit Profile
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/discover" className="glass-panel p-4 rounded-xl border border-white/10 hover:border-white/30 text-center transition-all holographic-lift">
            <span className="material-symbols-outlined text-white mb-2 block">explore</span>
            <div className="text-sm font-semibold">Discover</div>
          </Link>
          <Link href="/investments" className="glass-panel p-4 rounded-xl border border-white/10 hover:border-white/30 text-center transition-all holographic-lift">
            <span className="material-symbols-outlined text-white mb-2 block">account_tree</span>
            <div className="text-sm font-semibold">Pipeline</div>
          </Link>
        </div>

        {/* Check Size */}
        {investorProfile && (investorProfile.check_size_min || investorProfile.check_size_max) && (
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-base font-bold text-on-surface mb-3">Check Size</h3>
            <div className="text-2xl font-bold text-white">
              ${investorProfile.check_size_min ? (investorProfile.check_size_min / 1000).toFixed(0) + "K" : "—"}
              {" – "}
              ${investorProfile.check_size_max ? (investorProfile.check_size_max >= 1000000 ? (investorProfile.check_size_max / 1000000).toFixed(0) + "M" : (investorProfile.check_size_max / 1000).toFixed(0) + "K") : "—"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
