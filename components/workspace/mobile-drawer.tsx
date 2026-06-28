"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SlideOver } from "@/components/shared/slide-over";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { startupService } from "@/lib/services/startup.service";

export function MobileDrawer({ profile }: { profile: any }) {
  const [open, setOpen] = useState(false);
  const [hasStartup, setHasStartup] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const role = profile?.role;

  useEffect(() => {
    // Check if the user is a member of any startup (for conference access)
    if (profile && role !== 'founder') {
      startupService.getMyMemberships(profile.id).then(({ data }) => {
        if (data && data.length > 0) setHasStartup(true);
      });
    } else if (role === 'founder') {
      setHasStartup(true);
    }
  }, [profile, role]);

  useEffect(() => {
    // Listen for the custom event dispatched by mobile-bottom-nav
    const handleDrawerOpen = () => setOpen(true);
    window.addEventListener('open-mobile-drawer', handleDrawerOpen);
    
    // Close on route change
    setOpen(false);

    return () => {
      window.removeEventListener('open-mobile-drawer', handleDrawerOpen);
    };
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  // Role-specific nav sections
  const getNavSections = () => {
    const common = [
      { icon: "home", label: "Home", href: "/home" },
      { icon: "explore", label: "Discover", href: "/discover" },
    ];

    if (role === 'founder') {
      return [
        { title: "Core", items: [
          ...common,
          { icon: "rocket_launch", label: "Startup", href: "/startup" },
          { icon: "grid_view", label: "Workspace", href: "/workspace" },
          ...(hasStartup ? [{ icon: "360", label: "Conference", href: "/workspace/conference" }] : []),
        ]},
        { title: "Network", items: [
          { icon: "dynamic_feed", label: "Community Feed", href: "/feed" },
          { icon: "account_balance_wallet", label: "Investors", href: "/investments" },
          { icon: "insights", label: "Analytics", href: "/workspace/analytics" },
        ]},
      ];
    }

    if (role === 'investor') {
      return [
        { title: "Core", items: [
          ...common,
          { icon: "account_balance_wallet", label: "Portfolio", href: "/investments" },
          { icon: "dynamic_feed", label: "Community Feed", href: "/feed" },
          ...(hasStartup ? [{ icon: "360", label: "Conference", href: "/workspace/conference" }] : []),
        ]},
      ];
    }

    // Talent (default)
    return [
      { title: "Core", items: [
        ...common,
        { icon: "work", label: "Opportunities", href: "/jobs" },
        { icon: "description", label: "Applications", href: "/applications" },
        ...(hasStartup ? [{ icon: "360", label: "Conference", href: "/workspace/conference" }] : []),
      ]},
      { title: "Network", items: [
        { icon: "dynamic_feed", label: "Community Feed", href: "/feed" },
      ]},
    ];
  };

  const sections = getNavSections();

  return (
    <SlideOver open={open} onClose={() => setOpen(false)} title="Menu" width="sm">
      <div className="flex flex-col h-full">
        {/* Profile Header */}
        <div className="p-4 border-b border-white/10 flex items-center gap-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold text-white border-2 border-primary">
              {(profile?.name || "U").substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white truncate">{profile?.name}</h3>
            <p className="text-xs text-on-surface-variant capitalize">{profile?.role?.replace("_", " ")}</p>
          </div>
        </div>

        {/* Role-specific Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {sections.map((section) => (
            <div key={section.title}>
              <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-3">{section.title}</h4>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = item.href === "/home" || item.href === "/workspace" 
                    ? pathname === item.href 
                    : pathname.startsWith(item.href);
                  return (
                    <Link 
                      key={item.label} 
                      href={item.href} 
                      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        isActive 
                          ? "bg-white/10 text-white font-semibold" 
                          : "text-on-surface-variant hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span className="text-sm">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(255,255,255,0.5)]" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Account Section */}
          <div>
            <h4 className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2 px-3">Account</h4>
            <div className="space-y-0.5">
              <Link 
                href="/profile" 
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  pathname === '/profile' 
                    ? "bg-white/10 text-white font-semibold" 
                    : "text-on-surface-variant hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">person</span>
                <span className="text-sm">View Profile</span>
              </Link>
              <Link 
                href="/settings" 
                className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                  pathname.startsWith('/settings') 
                    ? "bg-white/10 text-white font-semibold" 
                    : "text-on-surface-variant hover:bg-white/5 hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">settings</span>
                <span className="text-sm">Settings</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors font-medium min-h-0"
          >
            <span className="material-symbols-outlined">logout</span> Log Out
          </button>
        </div>
      </div>
    </SlideOver>
  );
}
