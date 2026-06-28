"use client";

import Link from "next/link";

interface Contributor {
  id: string;
  name: string;
  avatar_url: string | null;
  headline: string | null;
  role: string;
  skills: string[];
  contributions: number;
}

export default function HomeTopContributors({ contributors }: { contributors: Contributor[] }) {
  if (contributors.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel p-4 md:p-6 rounded-2xl border border-white/10">
      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
        <span className="material-symbols-outlined text-on-surface-variant">emoji_events</span>
        Top Contributors
      </h3>
      <div className="space-y-3">
        {contributors.slice(0, 5).map((user, idx) => (
          <div key={user.id} className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="text-sm font-bold text-on-surface-variant/50 w-5 text-center">{idx + 1}</div>
            {user.avatar_url ? (
              <img src={user.avatar_url} alt="" className="w-9 h-9 rounded-lg object-cover border border-white/10" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                {(user.name || "U").substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user.name}</div>
              <div className="text-[10px] text-on-surface-variant truncate">{user.headline || user.role}</div>
            </div>
            {user.skills.length > 0 && (
              <div className="hidden md:flex gap-1">
                {user.skills.slice(0, 2).map((s: string) => (
                  <span key={s} className="bg-white/5 text-on-surface-variant px-1.5 py-0.5 rounded text-[9px] font-medium">{s}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
