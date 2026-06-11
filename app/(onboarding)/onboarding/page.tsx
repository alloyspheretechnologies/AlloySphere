"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import FounderWizard from "@/components/onboarding/founder-wizard";
import TalentWizard from "@/components/onboarding/talent-wizard";
import InvestorWizard from "@/components/onboarding/investor-wizard";

export default function OnboardingPage() {
  const router = useRouter();
  const { isAuthenticated, role, onboardingComplete, loading } = useAuthStore();

  useEffect(() => {
    if (loading) return; // Wait for session sync
    
    if (!isAuthenticated) {
      router.push("/login");
    } else if (!role) {
      router.push("/role-selection");
    } else if (onboardingComplete) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, role, onboardingComplete, loading, router]);

  if (!role || onboardingComplete) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background Particles */}
      <div className="absolute inset-0 z-[0] overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen translate-x-1/2 -translate-y-1/2"></div>
      </div>

      <div className="relative z-10 w-full max-w-3xl glass-panel p-8 md:p-12 rounded-3xl border border-white/10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              {role === "founder" ? "rocket_launch" : role === "talent" ? "code_blocks" : "monitoring"}
            </span>
            <span className="text-sm text-primary font-bold uppercase tracking-wider">
              {role} Onboarding
            </span>
          </div>
          <h1 className="text-3xl font-display-lg font-bold">Complete your profile</h1>
        </div>

        {role === "founder" && <FounderWizard />}
        {role === "talent" && <TalentWizard />}
        {role === "investor" && <InvestorWizard />}
      </div>
    </div>
  );
}
