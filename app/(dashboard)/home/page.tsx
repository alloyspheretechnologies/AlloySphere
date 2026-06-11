"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { profileService } from "@/lib/services/profile.service";
import { startupService } from "@/lib/services/startup.service";
import { applicationService } from "@/lib/services/application.service";
import { opportunityService } from "@/lib/services/opportunity.service";
import { workspaceService } from "@/lib/services/workspace.service";
import { taskService } from "@/lib/services/task.service";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

import HomeEcosystemStats from "@/components/home/home-ecosystem-stats";
import HomeTrendingStartups from "@/components/home/home-trending-startups";
import HomeEcosystemFeed from "@/components/home/home-ecosystem-feed";
import HomeRoleWidgets from "@/components/home/home-role-widgets";
import HomeActivityStream from "@/components/home/home-activity-stream";
import HomeTopContributors from "@/components/home/home-top-contributors";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, role, onboardingComplete, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Ecosystem data
  const [ecosystemStats, setEcosystemStats] = useState({
    totalStartups: 0, totalMembers: 0, totalInvestors: 0,
    activeProjects: 0, applicationsThisWeek: 0, totalOpportunities: 0,
  });
  const [trendingStartups, setTrendingStartups] = useState<any[]>([]);
  const [feedPosts, setFeedPosts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [topContributors, setTopContributors] = useState<any[]>([]);

  // Role-specific data
  const [founderData, setFounderData] = useState<any>(null);
  const [talentData, setTalentData] = useState<any>(null);
  const [investorData, setInvestorData] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    } else if (!role) {
      router.push("/role-selection");
    } else if (!onboardingComplete) {
      router.push("/onboarding");
    }
  }, [isAuthenticated, role, onboardingComplete, router]);

  useEffect(() => {
    if (isAuthenticated && role && onboardingComplete) {
      loadAllData();
    }
  }, [isAuthenticated, role, onboardingComplete]);

  const loadAllData = async () => {
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: prof } = await profileService.getCurrentProfile();
      setProfile(prof);

      // ---- Ecosystem Stats ----
      const [
        { count: startupCount },
        { count: memberCount },
        { count: investorCount },
        { count: projectCount },
        { count: opportunityCount },
      ] = await Promise.all([
        supabase.from("startups").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "investor"),
        supabase.from("projects").select("*", { count: "exact", head: true }).neq("status", "cancelled"),
        supabase.from("opportunities").select("*", { count: "exact", head: true }).eq("status", "open"),
      ]);

      // Applications this week
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { count: appWeekCount } = await supabase
        .from("applications").select("*", { count: "exact", head: true })
        .gte("applied_at", weekAgo);

      setEcosystemStats({
        totalStartups: startupCount || 0,
        totalMembers: memberCount || 0,
        totalInvestors: investorCount || 0,
        activeProjects: projectCount || 0,
        applicationsThisWeek: appWeekCount || 0,
        totalOpportunities: opportunityCount || 0,
      });

      // ---- Trending Startups ----
      const { data: trending } = await startupService.getTrendingStartups({ pageSize: 6 });
      const startups = trending.map((t: any) => ({
        ...t.startup,
        score: t.score,
        rank_position: t.rank_position
      }));
      setTrendingStartups(startups || []);

      // ---- Community Feed ----
      const { data: posts } = await supabase
        .from("posts")
        .select("*, author:profiles!posts_author_id_fkey(name, avatar_url, headline), startup:startups!posts_startup_id_fkey(name, slug)")
        .order("created_at", { ascending: false })
        .limit(5);
      setFeedPosts(posts || []);

      // ---- Activity Stream ----
      const { data: activityData } = await supabase
        .from("activity_logs")
        .select("*, profile:profiles!activity_logs_user_id_fkey(name, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(10);
      setActivities(
        (activityData || []).map((a: any) => ({
          ...a,
          user_name: a.profile?.name,
          user_avatar: a.profile?.avatar_url,
        }))
      );

      // ---- Top Contributors ----
      const { data: contributors } = await supabase
        .from("profiles")
        .select("id, name, avatar_url, headline, role, skills")
        .order("created_at", { ascending: true })
        .limit(5);
      setTopContributors(
        (contributors || []).map((c: any) => ({ ...c, contributions: 0 }))
      );

      // ---- Role-specific Data ----
      if (prof) {
        await loadRoleData(prof, supabase);
      }
    } catch (e) {
      console.error("Home data load error:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadRoleData = async (prof: any, supabase: any) => {
    if (role === "founder") {
      const { data: startups } = await startupService.listStartups({ pageSize: 50 });
      const myStartup = startups?.find((s: any) => s.owner_id === prof.id);
      if (myStartup) {
        const { data: apps } = await applicationService.getStartupApplications(myStartup.id, { pageSize: 50 });
        const { data: opps } = await opportunityService.listOpportunities({ startupId: myStartup.id });
        const { data: ws } = await workspaceService.getWorkspaceByStartup(myStartup.id);
        let tasks: any[] = [];
        if (ws) {
          const { data: taskData } = await taskService.listTasks(ws.id, { pageSize: 50 });
          tasks = taskData || [];
        }
        const pendingApps = (apps || []).filter((a: any) => a.status === "applied" || a.status === "reviewing").length;
        const completedTasks = tasks.filter((t: any) => t.status === "done").length;
        setFounderData({
          startupName: myStartup.name,
          applicationsReceived: apps?.length || 0,
          pendingApplications: pendingApps,
          openRoles: opps?.length || 0,
          completedTasks,
          totalTasks: tasks.length,
        });
      }
    }

    if (role === "talent") {
      const { data: apps } = await applicationService.getMyApplications(prof.id, { pageSize: 50 });
      const { data: opps } = await opportunityService.listOpportunities({ pageSize: 3 });
      const { count: taskCount } = await supabase
        .from("tasks").select("*", { count: "exact", head: true })
        .eq("assignee_id", prof.id).eq("status", "done");

      setTalentData({
        totalApplications: apps?.length || 0,
        acceptedApplications: (apps || []).filter((a: any) => a.status === "accepted").length,
        pendingApplications: (apps || []).filter((a: any) => a.status === "applied" || a.status === "reviewing").length,
        contributions: taskCount || 0,
        recommendedOpportunities: opps || [],
      });
    }

    if (role === "investor") {
      const { data: saved } = await supabase
        .from("saved_startups").select("id")
        .eq("user_id", prof.id);
      const { data: ip } = await supabase
        .from("investor_profiles").select("*")
        .eq("user_id", prof.id).maybeSingle();
      const { data: startups } = await startupService.listStartups({ pageSize: 50 });

      setInvestorData({
        watchlistCount: saved?.length || 0,
        portfolioCount: ip?.portfolio_count || 0,
        dealFlowCount: startups?.length || 0,
        preferredStages: ip?.preferred_stages || [],
      });
    }
  };

  if (!onboardingComplete || !role) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1600px] mx-auto animate-in fade-in duration-500 pb-12">
      {/* Hero */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">
          {getGreeting()}, {profile?.name?.split(" ")[0] || user?.user_metadata?.name?.split(" ")[0] || "User"}{" "}
          <span className="inline-block animate-bounce">👋</span>
        </h1>
        <p className="text-on-surface-variant mt-2">
          Here&apos;s what&apos;s happening across the AlloySphere ecosystem.
        </p>
      </header>

      {/* Ecosystem Stats */}
      <div className="mb-8">
        <HomeEcosystemStats stats={ecosystemStats} />
      </div>

      {/* Role-specific Widgets */}
      <div className="mb-8">
        <HomeRoleWidgets
          role={role}
          founderData={founderData}
          talentData={talentData}
          investorData={investorData}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column — Feed + Startups */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <HomeTrendingStartups startups={trendingStartups} />
          <HomeEcosystemFeed posts={feedPosts} />
        </div>

        {/* Right Column — Activity + Contributors */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <HomeActivityStream activities={activities} />
          <HomeTopContributors contributors={topContributors} />
        </div>
      </div>
    </div>
  );
}
