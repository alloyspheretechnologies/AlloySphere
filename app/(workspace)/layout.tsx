"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { workspaceService } from "@/lib/services/workspace.service";
import { profileService } from "@/lib/services/profile.service";
import { startupService } from "@/lib/services/startup.service";
import { useWorkspaceStore } from "@/lib/store/useWorkspaceStore";
import { TopNav } from "@/components/workspace/top-nav";

export default function WorkspaceGroupLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const { setStartup } = useWorkspaceStore();
  const [localStartup, setLocalStartup] = useState<any>(null);

  useEffect(() => {
    initWorkspace();
  }, []);

  const initWorkspace = async () => {
    try {
      const { data: profile } = await profileService.getCurrentProfile();
      if (!profile) return;

      const { data: startups } = await startupService.listStartups({ pageSize: 50 });
      const myStartup = startups?.find(s => s.owner_id === profile.id) || startups?.[0];

      if (myStartup) {
        setStartup(myStartup);
        setLocalStartup(myStartup);
      }
    } catch (e) {
      console.error("Failed to initialize workspace:", e);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { label: "Overview", href: "/workspace", icon: "grid_view" },
    { label: "Tasks", href: "/workspace/tasks", icon: "task_alt" },
    { label: "Discussions", href: "/workspace/discussions", icon: "forum" },
    { label: "Documents", href: "/workspace/documents", icon: "description" },
    { label: "Roadmap", href: "/workspace/roadmap", icon: "timeline" },
    { label: "Analytics", href: "/workspace/analytics", icon: "analytics" },
    { label: "Team", href: "/workspace/team", icon: "group" },
    { label: "Recruitment", href: "/workspace/recruitment", icon: "work" },
    { label: "Settings", href: "/workspace/settings", icon: "settings" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-on-surface flex flex-col font-sans">
      <TopNav />
      <div className="flex-1 flex overflow-hidden pt-[57px]">
        {/* Workspace Sidebar */}
        <aside className="w-64 border-r border-white/10 bg-surface-container flex flex-col pt-6 z-10 shrink-0 hidden md:flex">
          <div className="px-6 mb-6">
            <Link
              href="/home"
              className="text-xs font-semibold text-on-surface-variant hover:text-white flex items-center gap-1 transition-colors mb-4"
              aria-label="Back to Home"
            >
              <span className="material-symbols-outlined text-[14px]">arrow_back</span> Back to Home
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white font-bold shadow-glow">
                {(localStartup?.name || "W").charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-white truncate">{localStartup?.name || "Workspace"}</div>
                <div className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Workspace</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto px-4 space-y-1 pb-6" aria-label="Workspace navigation">
            {navItems.map((item) => {
              const isActive = item.href === "/workspace"
                ? pathname === "/workspace"
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm ${
                    isActive
                      ? "bg-white/10 text-white font-semibold shadow-glow"
                      : "text-on-surface-variant hover:text-white hover:bg-white/5"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span
                    className="material-symbols-outlined text-[18px]"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content area */}
        <main className="flex-1 overflow-y-auto bg-black p-6 md:p-8 custom-scrollbar relative">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
