"use client";

import Link from "next/link";

interface RoleWidgetsProps {
  role: string;
  founderData?: {
    startupName: string;
    applicationsReceived: number;
    pendingApplications: number;
    openRoles: number;
    completedTasks: number;
    totalTasks: number;
  };
  talentData?: {
    totalApplications: number;
    acceptedApplications: number;
    pendingApplications: number;
    contributions: number;
    recommendedOpportunities: any[];
  };
  investorData?: {
    watchlistCount: number;
    portfolioCount: number;
    dealFlowCount: number;
    preferredStages: string[];
  };
}

export default function HomeRoleWidgets({ role, founderData, talentData, investorData }: RoleWidgetsProps) {
  if (role === "founder" && founderData) {
    return (
      <div className="glass-panel p-4 md:p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-on-surface-variant">dashboard_customize</span>
          Founder Command Center
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mb-4">
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="text-xs text-on-surface-variant uppercase mb-1">Applications</div>
            <div className="text-xl font-bold text-white">{founderData.applicationsReceived}</div>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="text-xs text-on-surface-variant uppercase mb-1">Pending</div>
            <div className="text-xl font-bold text-amber-400">{founderData.pendingApplications}</div>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="text-xs text-on-surface-variant uppercase mb-1">Open Roles</div>
            <div className="text-xl font-bold text-white">{founderData.openRoles}</div>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="text-xs text-on-surface-variant uppercase mb-1">Tasks Done</div>
            <div className="text-xl font-bold text-emerald-400">{founderData.completedTasks}/{founderData.totalTasks}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/workspace" className="flex-1 py-2 md:py-2.5 border border-white/10 rounded-xl text-xs md:text-sm text-white hover:bg-white/5 transition-colors text-center font-medium">
            Open Workspace
          </Link>
          <Link href="/applications" className="flex-1 py-2 md:py-2.5 border border-white/10 rounded-xl text-xs md:text-sm text-white hover:bg-white/5 transition-colors text-center font-medium">
            View Applications
          </Link>
        </div>
      </div>
    );
  }

  if (role === "talent" && talentData) {
    return (
      <div className="glass-panel p-4 md:p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-on-surface-variant">dashboard_customize</span>
          Your Activity
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 mb-4">
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="text-xs text-on-surface-variant uppercase mb-1">Applications</div>
            <div className="text-xl font-bold text-white">{talentData.totalApplications}</div>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="text-xs text-on-surface-variant uppercase mb-1">Accepted</div>
            <div className="text-xl font-bold text-emerald-400">{talentData.acceptedApplications}</div>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="text-xs text-on-surface-variant uppercase mb-1">Pending</div>
            <div className="text-xl font-bold text-amber-400">{talentData.pendingApplications}</div>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="text-xs text-on-surface-variant uppercase mb-1">Contributions</div>
            <div className="text-xl font-bold text-white">{talentData.contributions}</div>
          </div>
        </div>
        {talentData.recommendedOpportunities.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="text-xs text-on-surface-variant uppercase tracking-wider mb-3 font-semibold">Recommended for You</div>
            <div className="space-y-2">
              {talentData.recommendedOpportunities.slice(0, 3).map((opp: any) => (
                <Link key={opp.id} href="/jobs"
                  className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                      {(opp.startup_name || "S").charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{opp.title}</div>
                      <div className="text-[10px] text-on-surface-variant">{opp.startup_name} • <span className="capitalize">{opp.commitment?.replace("_", " ")}</span></div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant/50 text-[16px]">arrow_forward</span>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-2 mt-4">
          <Link href="/jobs" className="flex-1 py-2 md:py-2.5 border border-white/10 rounded-xl text-xs md:text-sm text-white hover:bg-white/5 transition-colors text-center font-medium">
            Browse Opportunities
          </Link>
          <Link href="/applications" className="flex-1 py-2 md:py-2.5 border border-white/10 rounded-xl text-xs md:text-sm text-white hover:bg-white/5 transition-colors text-center font-medium">
            My Applications
          </Link>
        </div>
      </div>
    );
  }

  if (role === "investor" && investorData) {
    return (
      <div className="glass-panel p-4 md:p-6 rounded-2xl border border-white/10">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
          <span className="material-symbols-outlined text-on-surface-variant">dashboard_customize</span>
          Investment Overview
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 mb-4">
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="text-xs text-on-surface-variant uppercase mb-1">Watchlist</div>
            <div className="text-xl font-bold text-white">{investorData.watchlistCount}</div>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="text-xs text-on-surface-variant uppercase mb-1">Portfolio</div>
            <div className="text-xl font-bold text-white">{investorData.portfolioCount}</div>
          </div>
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="text-xs text-on-surface-variant uppercase mb-1">Deal Flow</div>
            <div className="text-xl font-bold text-white">{investorData.dealFlowCount}</div>
          </div>
        </div>
        {investorData.preferredStages.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {investorData.preferredStages.map((stage: string) => (
              <span key={stage} className="bg-white/5 text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-medium border border-white/5 capitalize">
                {stage.replace("_", " ")}
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Link href="/discover" className="flex-1 py-2 md:py-2.5 border border-white/10 rounded-xl text-xs md:text-sm text-white hover:bg-white/5 transition-colors text-center font-medium">
            Discover Startups
          </Link>
          <Link href="/investments" className="flex-1 py-2 md:py-2.5 border border-white/10 rounded-xl text-xs md:text-sm text-white hover:bg-white/5 transition-colors text-center font-medium">
            Manage Portfolio
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
