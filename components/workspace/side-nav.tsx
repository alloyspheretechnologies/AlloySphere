"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { profileService } from "@/lib/services/profile.service";
import { startupService } from "@/lib/services/startup.service";
import { notificationService } from "@/lib/services/notification.service";

export function SideNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasStartup, setHasStartup] = useState(false);

  useEffect(() => {
    profileService.getCurrentProfile().then(async ({ data }) => {
      if (data) {
        setRole(data.role || null);
        
        if (data.role !== 'founder') {
          const { data: memberships } = await startupService.getMyMemberships(data.id);
          if (memberships && memberships.length > 0) {
            setHasStartup(true);
          }
        }
        
        // Fetch real unread count
        const { count } = await notificationService.getUnreadCount(data.id);
        setUnreadCount(count || 0);
      }
    });
  }, []);

  const getFounderMenu = () => [
    { section: "Core", items: [
      { icon: "home", label: "Home", href: "/home" },
      { icon: "rocket_launch", label: "Startup", href: "/startup" },
      { icon: "grid_view", label: "Workspace", href: "/workspace", isFill: true },
      { icon: "handshake", label: "Pitch Requests", href: "/pitch-requests" },
      { icon: "360", label: "Conference", href: "/workspace/conference", isFill: true },
    ]},
    { section: "Network", items: [
      { icon: "dynamic_feed", label: "Community", href: "/feed" },
      { icon: "account_balance_wallet", label: "Investors", href: "/investments" },
      { icon: "insights", label: "Analytics", href: "/workspace/analytics" },
    ]}
  ];

  const getTalentMenu = () => [
    { section: "Core", items: [
      { icon: "home", label: "Home", href: "/home" },
      { icon: "explore", label: "Discover Startups", href: "/discover" },
      { icon: "work", label: "Opportunities", href: "/jobs" },
      { icon: "description", label: "Applications", href: "/applications" },
      ...(hasStartup ? [{ icon: "360", label: "Conference", href: "/workspace/conference", isFill: true }] : []),
    ]},
    { section: "Network", items: [
      { icon: "dynamic_feed", label: "Community", href: "/feed" },
    ]}
  ];

  const getInvestorMenu = () => [
    { section: "Core", items: [
      { icon: "home", label: "Home", href: "/home" },
      { icon: "explore", label: "Discover Startups", href: "/discover" },
      { icon: "account_balance_wallet", label: "Portfolio", href: "/investments" },
      { icon: "handshake", label: "Pitch Requests", href: "/pitch-requests" },
      { icon: "dynamic_feed", label: "Community", href: "/feed" },
      ...(hasStartup ? [{ icon: "360", label: "Conference", href: "/workspace/conference", isFill: true }] : []),
    ]}
  ];

  const menus = role === 'founder' ? getFounderMenu() : role === 'investor' ? getInvestorMenu() : getTalentMenu();

  return (
    <aside className="fixed left-0 top-0 flex flex-col pt-20 pb-8 z-40 bg-surface-container-low/40 backdrop-blur-2xl border-r border-white/5 shadow-2xl h-screen w-64 hidden md:flex">
      <div className="flex-1 overflow-y-auto mt-6 px-3 flex flex-col gap-1 custom-scrollbar">
        {menus.map((section, idx) => (
          <div key={section.section} className={idx > 0 ? "mt-4" : ""}>
            <div className="text-xs font-semibold text-on-surface-variant/50 px-4 py-2 uppercase tracking-wider mb-1">{section.section}</div>
            {section.items.map((item) => {
              const isActive = item.href === "/workspace" || item.href === "/home" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link key={item.label} href={item.href} className={`py-3 px-4 flex items-center gap-3 rounded-lg transition-colors justify-between ${isActive ? 'bg-secondary-container/20 text-primary border-l-2 border-primary rounded-l-none rounded-r-lg' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${(item as any).isFill ? 'font-variation-settings: \'FILL\' 1;' : ''}`}>{item.icon}</span>
                    <span className={`text-sm ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                  </div>
                  {(item as any).badge && (
                    <span className="bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">{(item as any).badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-auto px-4 flex flex-col gap-1 pt-4 border-t border-white/5">
        <Link href="/profile" className={`py-3 px-4 flex items-center gap-3 rounded-lg transition-colors ${pathname === '/profile' ? 'bg-secondary-container/20 text-primary border-l-2 border-primary rounded-l-none rounded-r-lg' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}>
          <span className="material-symbols-outlined text-[20px]">person</span>
          <span className="text-sm">Profile</span>
        </Link>
        <Link href="/settings" className={`py-3 px-4 flex items-center gap-3 rounded-lg transition-colors ${pathname.startsWith('/settings') ? 'bg-secondary-container/20 text-primary border-l-2 border-primary rounded-l-none rounded-r-lg' : 'text-on-surface-variant hover:bg-white/5 hover:text-on-surface'}`}>
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span className="text-sm">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
