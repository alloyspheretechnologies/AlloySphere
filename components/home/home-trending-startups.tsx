"use client";

import Link from "next/link";

interface TrendingStartup {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  stage: string;
  team_size: number;
  description: string | null;
  followers_count?: number;
}

export default function HomeTrendingStartups({ startups }: { startups: TrendingStartup[] }) {
  if (startups.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center">
        <span className="material-symbols-outlined text-[36px] text-on-surface-variant/30 mb-2 block">rocket</span>
        <p className="text-sm text-on-surface-variant">No startups in the ecosystem yet. Be the first to launch!</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-4 md:p-6 rounded-2xl border border-white/10">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant">trending_up</span>
          Trending Startups
        </h3>
        <Link href="/discover" className="text-xs text-on-surface-variant hover:text-white transition-colors">
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {startups.slice(0, 6).map((s, idx) => (
          <Link key={s.id} href={`/startup/${s.slug}`}
            className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 hover:border-white/10 transition-all group">
            <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-lg font-bold text-white shrink-0 group-hover:border-white/20 transition-colors">
              {s.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white truncate group-hover:text-white/90">{s.name}</div>
              <div className="text-xs text-on-surface-variant">
                {s.industry} • <span className="capitalize">{s.stage?.replace("_", " ")}</span> • {s.team_size} members
              </div>
            </div>
            {idx < 3 && (
              <span className="bg-white/5 text-on-surface-variant text-[10px] px-2 py-0.5 rounded-full font-bold">
                #{idx + 1}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
