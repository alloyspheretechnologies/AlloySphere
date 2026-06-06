"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import FounderView from "@/components/dashboard/founder-view";
import TalentView from "@/components/dashboard/talent-view";
import InvestorView from "@/components/dashboard/investor-view";

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, role, onboardingComplete, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (!role) {
      router.push("/role-selection");
    } else if (!onboardingComplete) {
      router.push("/onboarding");
    }
  }, [isAuthenticated, role, onboardingComplete, router]);

  if (!onboardingComplete || !role) return null;

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-display-lg font-bold text-on-surface">
          Good evening, {user?.name?.split(' ')[0] || 'User'} <span className="inline-block animate-bounce">👋</span>
        </h1>
        <p className="text-on-surface-variant mt-2">
          {role === 'founder' && "Command center for your high-growth venture."}
          {role === 'talent' && "Discover high-growth startups and track the ecosystem."}
          {role === 'investor' && "Track your investments and discover the next big opportunity."}
        </p>
      </header>

      {role === "founder" && <FounderView />}
      {role === "talent" && <TalentView />}
      {role === "investor" && <InvestorView />}
    </div>
  );
}
