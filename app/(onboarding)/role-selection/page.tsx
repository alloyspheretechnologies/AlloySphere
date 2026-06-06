"use client";

import { useRouter } from "next/navigation";
import { profileService } from "@/lib/services/profile.service";
import { useEffect, useState } from "react";
import type { Profile } from "@/lib/types";
import { useAuthStore } from "@/lib/store/useAuthStore";

export default function RoleSelectionPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);

  const { syncSession, user } = useAuthStore();

  useEffect(() => {
    profileService.getCurrentProfile().then(({ data }) => {
      if (!data) router.push("/login");
      else if (data.role) router.push("/onboarding");
      else setProfile(data);
    });
  }, [router]);

  const selectRole = async (selectedRole: "founder" | "talent" | "investor") => {
    if (!profile || !user) return;
    setLoading(true);
    await profileService.setRole(user.id, selectedRole);
    await syncSession();
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-[0] overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute -top-1/4 left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col items-center">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-display-lg font-bold mb-4">Choose Your Path</h1>
          <p className="text-lg text-on-surface-variant max-w-2xl mx-auto">
            Select how you will interact with the AlloySphere ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {/* Founder Card */}
          <button 
            onClick={() => selectRole("founder")}
            disabled={loading}
            className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center border border-white/10 hover:border-primary/50 transition-all holographic-lift group disabled:opacity-50"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[40px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>rocket_launch</span>
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-3">Founder</h2>
            <p className="text-sm text-on-surface-variant">
              I am building or managing a startup. I want to build my workspace, track progress, and recruit talent.
            </p>
          </button>

          {/* Talent Card */}
          <button 
            onClick={() => selectRole("talent")}
            disabled={loading}
            className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center border border-white/10 hover:border-tertiary/50 transition-all holographic-lift group disabled:opacity-50"
          >
            <div className="w-20 h-20 rounded-full bg-tertiary/10 border border-tertiary/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[40px] text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>code_blocks</span>
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-3">Talent / Builder</h2>
            <p className="text-sm text-on-surface-variant">
              I want to join startups and contribute. I am looking for projects, experience, and portfolio growth.
            </p>
          </button>

          {/* Investor Card */}
          <button 
            onClick={() => selectRole("investor")}
            disabled={loading}
            className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center border border-white/10 hover:border-secondary/50 transition-all holographic-lift group disabled:opacity-50"
          >
            <div className="w-20 h-20 rounded-full bg-secondary/10 border border-secondary/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[40px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
            </div>
            <h2 className="text-2xl font-bold text-on-surface mb-3">Investor</h2>
            <p className="text-sm text-on-surface-variant">
              I am exploring startups for investment opportunities. I want startup discovery and real-time analytics.
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
