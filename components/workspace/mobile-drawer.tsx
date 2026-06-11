"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SlideOver } from "@/components/shared/slide-over";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function MobileDrawer({ profile }: { profile: any }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Listen for clicks on the trigger button defined in mobile-bottom-nav
    const handleDrawerOpen = () => setOpen(true);
    const trigger = document.getElementById("mobile-drawer-trigger");
    if (trigger) trigger.addEventListener("click", handleDrawerOpen);
    
    // Close on route change
    setOpen(false);

    return () => {
      if (trigger) trigger.removeEventListener("click", handleDrawerOpen);
    };
  }, [pathname]);

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <SlideOver open={open} onClose={() => setOpen(false)} title="Menu" width="sm">
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-white/10 flex items-center gap-4">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-primary" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg font-bold text-white border-2 border-primary">
              {(profile?.name || "U").substring(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h3 className="font-bold text-white">{profile?.name}</h3>
            <p className="text-xs text-on-surface-variant capitalize">{profile?.role?.replace("_", " ")}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div>
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Network</h4>
            <div className="space-y-1">
              <Link href="/workspace" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-on-surface hover:text-white">
                <span className="material-symbols-outlined">grid_view</span> Workspace
              </Link>
              <Link href="/applications" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-on-surface hover:text-white">
                <span className="material-symbols-outlined">description</span> Applications
              </Link>
              <Link href="/investments" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-on-surface hover:text-white">
                <span className="material-symbols-outlined">account_balance_wallet</span> Investments
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Account</h4>
            <div className="space-y-1">
              <Link href="/profile" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-on-surface hover:text-white">
                <span className="material-symbols-outlined">person</span> View Profile
              </Link>
              <Link href="/settings" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors text-on-surface hover:text-white">
                <span className="material-symbols-outlined">settings</span> Settings
              </Link>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors font-medium"
          >
            <span className="material-symbols-outlined">logout</span> Log Out
          </button>
        </div>
      </div>
    </SlideOver>
  );
}
