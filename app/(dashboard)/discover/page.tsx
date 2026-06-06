"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { startupService } from "@/lib/services/startup.service";
import { profileService } from "@/lib/services/profile.service";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function DiscoverPage() {
  const [startups, setStartups] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState("all");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [startupsRes, profileRes] = await Promise.all([
        startupService.listStartups({ pageSize: 50 }),
        profileService.getCurrentProfile(),
      ]);
      setStartups(startupsRes.data || []);
      setProfile(profileRes.data);

      if (profileRes.data) {
        const supabase = getSupabaseBrowserClient();
        const { data: saved } = await supabase.from("saved_startups").select("startup_id").eq("user_id", profileRes.data.id);
        if (saved) setSavedIds(new Set(saved.map((s: any) => s.startup_id)));
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSave = async (startupId: string) => {
    if (!profile) return;
    const supabase = getSupabaseBrowserClient();
    if (savedIds.has(startupId)) {
      await supabase.from("saved_startups").delete().eq("user_id", profile.id).eq("startup_id", startupId);
      setSavedIds((prev) => { const n = new Set(prev); n.delete(startupId); return n; });
    } else {
      await supabase.from("saved_startups").insert({ user_id: profile.id, startup_id: startupId });
      setSavedIds((prev) => new Set(prev).add(startupId));
    }
  };

  const handleFollow = async (startupId: string) => {
    if (!profile) return;
    const supabase = getSupabaseBrowserClient();
    await supabase.from("startup_followers").upsert({ startup_id: startupId, user_id: profile.id });
  };

  const filtered = startups.filter((s) => {
    const matchesSearch = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.industry?.toLowerCase().includes(search.toLowerCase());
    const matchesStage = filterStage === "all" || s.stage === filterStage;
    return matchesSearch && matchesStage;
  });

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">Discover Startups</h1>
        <p className="text-on-surface-variant mt-2">Explore the most promising ventures in the AlloySphere ecosystem.</p>
      </header>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-high border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-white/40 focus:outline-none transition-colors"
            placeholder="Search by name or industry..." />
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "idea", "mvp", "seed", "series_a", "series_b", "growth"].map((stage) => (
            <button key={stage} onClick={() => setFilterStage(stage)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all capitalize ${
                filterStage === stage ? "bg-white text-black border-white" : "bg-surface-container-high border-white/10 text-on-surface-variant hover:border-white/20"
              }`}>
              {stage === "all" ? "All Stages" : stage.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((startup) => (
            <div key={startup.id} className="glass-panel p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all holographic-lift flex flex-col">
              <div className="flex justify-between items-start mb-5">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <span className="text-lg font-bold text-white">{startup.name.charAt(0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-white/5 text-on-surface-variant px-2 py-1 rounded text-xs font-semibold capitalize">{startup.stage?.replace("_", " ")}</span>
                  <button onClick={() => handleSave(startup.id)} className="p-1 rounded hover:bg-white/5 transition-colors">
                    <span className={`material-symbols-outlined text-[20px] ${savedIds.has(startup.id) ? "text-white" : "text-on-surface-variant"}`}
                      style={savedIds.has(startup.id) ? { fontVariationSettings: "'FILL' 1" } : undefined}>bookmark</span>
                  </button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-1">{startup.name}</h3>
              <p className="text-sm text-on-surface-variant mb-2">{startup.industry}</p>
              {startup.description && <p className="text-xs text-on-surface-variant mb-4 line-clamp-2">{startup.description}</p>}

              <div className="flex items-center gap-4 text-sm text-on-surface-variant mb-5 border-t border-white/5 pt-4 mt-auto">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">group</span> {startup.team_size || 1}</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">visibility</span> <span className="capitalize">{startup.visibility}</span></span>
              </div>

              <div className="flex gap-3">
                <Link href={`/startup/${startup.slug}`}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10 hover:border-white/20 text-sm font-semibold text-center btn-glow">
                  View Profile
                </Link>
                <button onClick={() => handleFollow(startup.id)}
                  className="py-2 px-4 bg-white text-black rounded-xl transition-all text-sm font-semibold hover:bg-white/90">
                  Follow
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 block">search_off</span>
          <h3 className="text-lg font-bold text-white mb-2">No startups found</h3>
          <p className="text-sm text-on-surface-variant">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
}
