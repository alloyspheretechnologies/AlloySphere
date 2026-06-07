"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { profileService } from "@/lib/services/profile.service";
import { startupService } from "@/lib/services/startup.service";

export function ConferenceSidebar() {
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivity();
  }, []);

  const loadActivity = async () => {
    try {
      const { data: prof } = await profileService.getCurrentProfile();
      if (!prof) return;

      const { data: startups } = await startupService.listStartups({ pageSize: 50 });
      const myStartup = startups?.find((s: any) => s.owner_id === prof.id) || startups?.[0];
      if (!myStartup) return;

      // Fetch recent notifications for the startup
      const supabase = getSupabaseBrowserClient();
      const { data: notifs } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      setActivity(notifs || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 shrink-0 flex flex-col gap-6 relative z-10 h-full overflow-y-auto custom-scrollbar pr-2 pb-8">
      
      {/* Recent Activity */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-sm">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
          ) : activity.length > 0 ? activity.map((item: any) => (
            <div key={item.id} className="flex gap-3 items-start group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant shrink-0 group-hover:bg-white/10 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[16px]">notifications</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <span className="font-bold text-white">{item.title}</span>
                </p>
                <p className="text-[10px] text-on-surface-variant/70 mt-0.5 line-clamp-2">{item.body}</p>
                <span className="text-[10px] text-on-surface-variant/50">{new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          )) : (
            <p className="text-xs text-white/30 text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
