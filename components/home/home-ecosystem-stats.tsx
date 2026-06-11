"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { profileService } from "@/lib/services/profile.service";
import { startupService } from "@/lib/services/startup.service";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface EcosystemStats {
  totalStartups: number;
  totalMembers: number;
  totalInvestors: number;
  activeProjects: number;
  applicationsThisWeek: number;
  totalOpportunities: number;
}

export default function HomeEcosystemStats({ stats }: { stats: EcosystemStats }) {
  const items = [
    { label: "Startups", value: stats.totalStartups, icon: "rocket_launch", gradient: "from-white/10 to-white/5" },
    { label: "Investors", value: stats.totalInvestors, icon: "account_balance", gradient: "from-white/10 to-white/5" },
    { label: "Opportunities", value: stats.totalOpportunities, icon: "work", gradient: "from-white/10 to-white/5" },
    { label: "Applications", value: stats.applicationsThisWeek, icon: "description", gradient: "from-white/10 to-white/5" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <div key={item.label} className="glass-panel p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all group">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px] group-hover:text-white transition-colors">{item.icon}</span>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">{item.label}</span>
          </div>
          <div className="text-2xl font-bold text-white">{item.value}</div>
        </div>
      ))}
    </div>
  );
}
