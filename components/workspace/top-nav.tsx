"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { profileService } from "@/lib/services/profile.service";
import { NotificationCenter } from "./notification-center";

export function TopNav() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: profData } = await profileService.getCurrentProfile();
      if (!profData) return;
      setProfile(profData);
    };

    loadData();
  }, []);

  return (
    <>
      <nav className="bg-background/80 backdrop-blur-xl flex justify-between items-center w-full px-8 py-2 max-w-[1920px] mx-auto z-50 fixed top-0 border-b border-white/10 shadow-[0_0_20px_rgba(132,43,210,0.1)]">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>change_history</span>
            <span className="text-2xl font-bold text-primary">AlloySphere</span>
          </Link>
        </div>

        <div className="flex-1 max-w-2xl mx-8 hidden md:block">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
              className="w-full bg-surface-container-high/50 border border-white/10 rounded-full py-2 pl-12 pr-4 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-on-surface-variant/50 hover:border-white/20 holographic-lift" 
              placeholder="Search workspaces, members, startups..." 
              type="text"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-50">
              <span className="text-xs border border-white/20 rounded px-1.5 py-0.5">⌘</span>
              <span className="text-xs border border-white/20 rounded px-1.5 py-0.5">K</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <NotificationCenter />
          
          <Link href="/profile" className="flex items-center gap-3 p-1 pr-3 hover:bg-white/5 rounded-full transition-all duration-300 border border-transparent hover:border-white/10 holographic-lift">
            {profile?.avatar_url ? (
              <img alt="Profile" className="w-8 h-8 rounded-full object-cover border border-primary/30" src={profile.avatar_url} />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-primary/30 font-bold text-xs text-white">
                {(profile?.name || "U").substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-on-surface">{profile?.name || "Loading..."}</div>
              <div className="text-[10px] text-on-surface-variant capitalize">{profile?.role?.replace("_", " ") || ""}</div>
            </div>
          </Link>
        </div>
      </nav>

    </>
  );
}
