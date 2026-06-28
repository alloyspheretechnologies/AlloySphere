"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface InvestorCard {
  user_id: string;
  name: string;
  avatar_url: string | null;
  headline: string | null;
  location: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  portfolio_url: string | null;
  firm_name: string | null;
  investment_thesis: string | null;
  check_size_min: number | null;
  check_size_max: number | null;
  preferred_industries: string[];
  preferred_stages: string[];
  portfolio_count: number;
  website: string | null;
}

const STAGE_LABELS: Record<string, string> = {
  idea: "Idea",
  pre_seed: "Pre-Seed",
  seed: "Seed",
  series_a: "Series A",
  series_b: "Series B",
  series_c: "Series C+",
  growth: "Growth",
};

export default function InvestorsDirectoryPage() {
  const [investors, setInvestors] = useState<InvestorCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  useEffect(() => {
    loadInvestors();
  }, []);

  const loadInvestors = async () => {
    try {
      const supabase = getSupabaseBrowserClient();

      // Fetch all investor profiles joined with their base profile
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, avatar_url, headline, location, linkedin_url, github_url, portfolio_url")
        .eq("role", "investor")
        .order("name", { ascending: true });

      if (!profiles || profiles.length === 0) {
        setInvestors([]);
        return;
      }

      // Fetch investor_profiles for all investor user_ids
      const userIds = profiles.map((p) => p.user_id);
      const { data: investorProfiles } = await supabase
        .from("investor_profiles")
        .select("user_id, firm_name, investment_thesis, check_size_min, check_size_max, preferred_industries, preferred_stages, portfolio_count, website")
        .in("user_id", userIds);

      const invMap = new Map<string, any>();
      (investorProfiles || []).forEach((ip) => invMap.set(ip.user_id, ip));

      const merged: InvestorCard[] = profiles.map((p) => {
        const inv = invMap.get(p.user_id);
        return {
          user_id: p.user_id,
          name: p.name,
          avatar_url: p.avatar_url,
          headline: p.headline,
          location: p.location,
          linkedin_url: p.linkedin_url,
          github_url: p.github_url,
          portfolio_url: p.portfolio_url,
          firm_name: inv?.firm_name || null,
          investment_thesis: inv?.investment_thesis || null,
          check_size_min: inv?.check_size_min || null,
          check_size_max: inv?.check_size_max || null,
          preferred_industries: inv?.preferred_industries || [],
          preferred_stages: inv?.preferred_stages || [],
          portfolio_count: inv?.portfolio_count || 0,
          website: inv?.website || null,
        };
      });

      setInvestors(merged);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Collect all unique industries and stages for filter chips
  const allIndustries = useMemo(() => {
    const set = new Set<string>();
    investors.forEach((inv) => inv.preferred_industries.forEach((i) => set.add(i)));
    return Array.from(set).sort();
  }, [investors]);

  const allStages = useMemo(() => {
    const set = new Set<string>();
    investors.forEach((inv) => inv.preferred_stages.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [investors]);

  // Filtered list
  const filtered = useMemo(() => {
    let list = investors;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (inv) =>
          inv.name.toLowerCase().includes(q) ||
          (inv.firm_name && inv.firm_name.toLowerCase().includes(q)) ||
          (inv.headline && inv.headline.toLowerCase().includes(q)) ||
          inv.preferred_industries.some((i) => i.toLowerCase().includes(q))
      );
    }
    if (selectedIndustry) {
      list = list.filter((inv) => inv.preferred_industries.includes(selectedIndustry));
    }
    if (selectedStage) {
      list = list.filter((inv) => inv.preferred_stages.includes(selectedStage));
    }
    return list;
  }, [investors, search, selectedIndustry, selectedStage]);

  const formatCheckSize = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    const fmt = (v: number) => (v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}k`);
    if (min && max) return `${fmt(min)} – ${fmt(max)}`;
    if (min) return `${fmt(min)}+`;
    return `Up to ${fmt(max!)}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-in fade-in pb-12">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-on-surface flex items-center gap-3">
          Investors
          <span className="material-symbols-outlined text-emerald-400 text-2xl md:text-3xl">account_balance</span>
        </h1>
        <p className="text-on-surface-variant mt-1 text-sm md:text-base">
          Discover and connect with investors on AlloySphere.
        </p>
      </header>

      {/* Search & Filters */}
      <div className="space-y-4 mb-8">
        {/* Search bar */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, firm, or industry..."
            className="w-full bg-surface-container-high border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder:text-on-surface-variant focus:border-white/30 focus:outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-white transition-colors min-h-0 p-1"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          )}
        </div>

        {/* Filter chips row */}
        {(allIndustries.length > 0 || allStages.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {/* Industry filters */}
            {allIndustries.map((ind) => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(selectedIndustry === ind ? null : ind)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border min-h-0 ${
                  selectedIndustry === ind
                    ? "bg-white/15 border-white/30 text-white"
                    : "bg-white/[0.03] border-white/10 text-on-surface-variant hover:bg-white/5 hover:text-white"
                }`}
              >
                {ind}
              </button>
            ))}

            {/* Stage filters */}
            {allStages.map((stg) => (
              <button
                key={stg}
                onClick={() => setSelectedStage(selectedStage === stg ? null : stg)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border min-h-0 ${
                  selectedStage === stg
                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                    : "bg-white/[0.03] border-white/10 text-on-surface-variant hover:bg-white/5 hover:text-white"
                }`}
              >
                {STAGE_LABELS[stg] || stg.replace("_", " ")}
              </button>
            ))}

            {/* Clear all filters */}
            {(selectedIndustry || selectedStage) && (
              <button
                onClick={() => {
                  setSelectedIndustry(null);
                  setSelectedStage(null);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-all min-h-0"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-xs text-on-surface-variant mb-4">
        {filtered.length} investor{filtered.length !== 1 ? "s" : ""} found
      </div>

      {/* Investors Grid */}
      {filtered.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant/30 mb-4 block">person_search</span>
          <h3 className="text-lg font-semibold text-white mb-2">No investors found</h3>
          <p className="text-sm text-on-surface-variant">
            {search || selectedIndustry || selectedStage
              ? "Try adjusting your search or filters."
              : "No investors have joined the platform yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((inv) => (
            <div
              key={inv.user_id}
              className="glass-panel rounded-2xl border border-white/10 hover:border-white/25 transition-all group relative overflow-hidden"
            >
              {/* Subtle gradient accent */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/40 via-emerald-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="p-5">
                {/* Top row: avatar + name + firm */}
                <div className="flex items-start gap-4 mb-4">
                  {inv.avatar_url ? (
                    <img
                      src={inv.avatar_url}
                      alt={inv.name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white/10 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border-2 border-emerald-500/10 flex items-center justify-center text-lg font-bold text-emerald-400 shrink-0">
                      {inv.name?.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-white text-base truncate">{inv.name}</h3>
                    {inv.firm_name && (
                      <p className="text-xs text-emerald-400 font-semibold truncate">{inv.firm_name}</p>
                    )}
                    {inv.headline && (
                      <p className="text-xs text-on-surface-variant truncate mt-0.5">{inv.headline}</p>
                    )}
                  </div>
                </div>

                {/* Check size */}
                {formatCheckSize(inv.check_size_min, inv.check_size_max) && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant">payments</span>
                    <span className="text-xs text-on-surface font-medium">
                      {formatCheckSize(inv.check_size_min, inv.check_size_max)}
                    </span>
                  </div>
                )}

                {/* Location */}
                {inv.location && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="material-symbols-outlined text-[14px] text-on-surface-variant">location_on</span>
                    <span className="text-xs text-on-surface-variant">{inv.location}</span>
                  </div>
                )}

                {/* Industry tags */}
                {inv.preferred_industries.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {inv.preferred_industries.slice(0, 3).map((ind) => (
                      <span
                        key={ind}
                        className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-on-surface-variant font-medium"
                      >
                        {ind}
                      </span>
                    ))}
                    {inv.preferred_industries.length > 3 && (
                      <span className="px-2 py-0.5 text-[10px] text-on-surface-variant font-medium">
                        +{inv.preferred_industries.length - 3}
                      </span>
                    )}
                  </div>
                )}

                {/* Stage tags */}
                {inv.preferred_stages.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {inv.preferred_stages.map((stg) => (
                      <span
                        key={stg}
                        className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/10 rounded text-[10px] text-emerald-400 font-medium capitalize"
                      >
                        {STAGE_LABELS[stg] || stg.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bottom actions: social links + view profile */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    {inv.linkedin_url && (
                      <a
                        href={inv.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-on-surface-variant hover:text-white"
                        title="LinkedIn"
                      >
                        <span className="material-symbols-outlined text-[18px]">link</span>
                      </a>
                    )}
                    {inv.website && (
                      <a
                        href={inv.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-on-surface-variant hover:text-white"
                        title="Website"
                      >
                        <span className="material-symbols-outlined text-[18px]">language</span>
                      </a>
                    )}
                    {inv.portfolio_url && (
                      <a
                        href={inv.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-on-surface-variant hover:text-white"
                        title="Portfolio"
                      >
                        <span className="material-symbols-outlined text-[18px]">work</span>
                      </a>
                    )}
                    {inv.github_url && (
                      <a
                        href={inv.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-on-surface-variant hover:text-white"
                        title="GitHub"
                      >
                        <span className="material-symbols-outlined text-[18px]">code</span>
                      </a>
                    )}
                  </div>
                  <Link
                    href={`/investor/${inv.user_id}`}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
