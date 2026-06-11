"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { startupService } from "@/lib/services/startup.service";
import { opportunityService } from "@/lib/services/opportunity.service";
import { profileService } from "@/lib/services/profile.service";
import { projectService } from "@/lib/services/project.service";
import { workspaceService } from "@/lib/services/workspace.service";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { roadmapService } from "@/lib/services/roadmap.service";
import { realtimeService } from "@/lib/services/realtime.service";

export default function StartupProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [startup, setStartup] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [rankScore, setRankScore] = useState(0);
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => { if (slug) loadData(); }, [slug]);

  const loadData = async () => {
    try {
      const { data: prof } = await profileService.getCurrentProfile();
      setProfile(prof);

      const { data: s } = await startupService.getStartupBySlug(slug);
      if (!s) { setLoading(false); return; }
      setStartup(s);

      const [membersRes, oppsRes] = await Promise.all([
        startupService.getMembers(s.id),
        opportunityService.listOpportunities({ startupId: s.id }),
      ]);
      setMembers(membersRes.data || []);
      setOpportunities(oppsRes.data || []);

      // Load milestones & roadmaps from workspace
      const { data: ws } = await workspaceService.getWorkspaceByStartup(s.id);
      if (ws) {
        const { data: projects } = await projectService.listProjects(ws.id);
        const allMs: any[] = [];
        for (const p of (projects || []).slice(0, 3)) {
          const { data: ms } = await projectService.listMilestones(p.id);
          allMs.push(...(ms || []).map((m: any) => ({ ...m, projectName: p.name })));
        }
        setMilestones(allMs);

        // Fetch roadmaps
        const { data: rmData } = await roadmapService.getRoadmaps(ws.id);
        // Expose public roadmaps
        setRoadmaps((rmData || []).filter(r => r.visibility === 'public'));
      }

      // Load posts
      const supabase = getSupabaseBrowserClient();
      const { data: postData } = await supabase.from("posts").select("*, author:profiles!posts_author_id_fkey(name, avatar_url)")
        .eq("startup_id", s.id).order("created_at", { ascending: false }).limit(5);
      setPosts(postData || []);

      // Check follow/like/save status
      if (prof) {
        const [{ isFollowing }, { isLiked }, { data: savedData }] = await Promise.all([
          startupService.isFollowing(s.id, prof.id),
          startupService.isLiked(s.id, prof.id),
          supabase.from("saved_startups").select("id").eq("startup_id", s.id).eq("user_id", prof.id).maybeSingle()
        ]);
        setIsFollowing(isFollowing);
        setIsLiked(isLiked);
        setIsSaved(!!savedData);
      }

      // Get initial counts
      const [{ count: likes }, { count: followers }, { data: ranking }] = await Promise.all([
        supabase.from("startup_likes").select("*", { count: 'exact', head: true }).eq("startup_id", s.id),
        supabase.from("startup_followers").select("*", { count: 'exact', head: true }).eq("startup_id", s.id),
        supabase.from("startup_rankings").select("score").eq("startup_id", s.id).maybeSingle()
      ]);
      setLikesCount(likes ?? 0);
      setFollowersCount(followers ?? 0);
      setRankScore(ranking?.score ?? 0);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (!startup?.id) return;
    
    const unsubscribe = realtimeService.subscribeToStartupEngagement(startup.id, {
      onLike: (payload) => {
        if (payload.eventType === 'INSERT') setLikesCount(c => c + 1);
        if (payload.eventType === 'DELETE') setLikesCount(c => Math.max(0, c - 1));
      },
      onFollow: (payload) => {
        if (payload.eventType === 'INSERT') setFollowersCount(c => c + 1);
        if (payload.eventType === 'DELETE') setFollowersCount(c => Math.max(0, c - 1));
      },
      onRankingUpdate: (payload) => {
        if (payload.new && payload.new.score !== undefined) {
          setRankScore(payload.new.score);
        }
      }
    });

    return () => unsubscribe();
  }, [startup?.id]);

  const handleFollow = async () => {
    if (!profile || !startup) return;
    if (startup.owner_id === profile.id) return alert('You cannot follow your own startup.');
    
    const prev = isFollowing;
    setIsFollowing(!prev);
    setFollowersCount(c => prev ? Math.max(0, c - 1) : c + 1);
    
    const { error } = prev 
      ? await startupService.unfollowStartup(startup.id, profile.id)
      : await startupService.followStartup(startup.id, profile.id);
      
    if (error) {
      setIsFollowing(prev);
      setFollowersCount(c => prev ? c + 1 : Math.max(0, c - 1));
    }
  };

  const handleLike = async () => {
    if (!profile || !startup) return;
    
    const prev = isLiked;
    setIsLiked(!prev);
    setLikesCount(c => prev ? Math.max(0, c - 1) : c + 1);

    const { error } = prev
      ? await startupService.unlikeStartup(startup.id, profile.id)
      : await startupService.likeStartup(startup.id, profile.id);

    if (error) {
      setIsLiked(prev);
      setLikesCount(c => prev ? c + 1 : Math.max(0, c - 1));
    }
  };

  const handleSave = async () => {
    if (!profile || !startup) return;
    const supabase = getSupabaseBrowserClient();
    if (isSaved) {
      await supabase.from("saved_startups").delete().eq("startup_id", startup.id).eq("user_id", profile.id);
    } else {
      await supabase.from("saved_startups").insert({ startup_id: startup.id, user_id: profile.id });
    }
    setIsSaved(!isSaved);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;
  if (!startup) return <div className="text-center py-20 text-on-surface-variant">Startup not found</div>;

  const tabs = ["overview", "roadmap", "team", "opportunities", "updates"];

  return (
    <div className="w-full max-w-[1200px] mx-auto animate-in fade-in pb-12">
      <Link href="/discover" className="text-sm text-on-surface-variant hover:text-white mb-4 inline-flex items-center gap-1 transition-colors">
        <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Discover
      </Link>

      {/* Hero */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden mb-8 mt-2">
        <div className="h-32 bg-gradient-to-r from-white/5 via-white/10 to-white/5" />
        <div className="p-6 -mt-10">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 rounded-2xl bg-surface-container border-4 border-surface-container flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                {startup.name.charAt(0)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{startup.name}</h1>
                <p className="text-sm text-on-surface-variant">
                  {startup.industry} • <span className="capitalize">{startup.stage?.replace("_", " ")}</span> • {startup.team_size || members.length} Members
                  {rankScore > 0 && <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/20">Rank Score: {rankScore}</span>}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleLike}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 border ${
                  isLiked ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : "bg-white/5 text-white border-white/10 hover:bg-white/10"
                }`}>
                <span className="material-symbols-outlined text-[18px]" style={isLiked ? { fontVariationSettings: "'FILL' 1" } : undefined}>favorite</span>
                {likesCount} {isLiked ? "Liked" : "Like"}
              </button>
              <button onClick={handleFollow}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                  isFollowing ? "bg-white/10 text-white border border-white/10" : "bg-white text-black hover:bg-white/90"
                }`}>
                {followersCount} {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-white/5 pb-px">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              activeTab === tab ? "text-white border-white" : "text-on-surface-variant border-transparent hover:text-white"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in">
          {startup.description && (
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="font-bold text-white mb-3">About</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">{startup.description}</p>
            </div>
          )}
          {startup.website && (
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="font-bold text-white mb-3">Website</h3>
              <a href={startup.website} target="_blank" rel="noopener noreferrer" className="text-sm text-white hover:underline flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">language</span> {startup.website}
              </a>
            </div>
          )}
          {milestones.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="font-bold text-white mb-4">Milestones</h3>
              <div className="space-y-3">
                {milestones.slice(0, 5).map((ms: any) => (
                  <div key={ms.id} className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${ms.status === "completed" ? "bg-emerald-400" : ms.status === "in_progress" ? "bg-amber-400" : "bg-white/20"}`} />
                    <div>
                      <div className="text-sm text-white">{ms.title}</div>
                      <div className="text-xs text-on-surface-variant">{ms.projectName} {ms.target_date ? `• ${new Date(ms.target_date).toLocaleDateString()}` : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "roadmap" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">Public Roadmap</h3>
              <p className="text-sm text-on-surface-variant mt-1">Track our execution and upcoming milestones.</p>
            </div>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Tracking
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {roadmaps.length > 0 ? roadmaps.map(r => (
              <div key={r.id} className="glass-panel p-6 rounded-2xl border border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-bold text-white">{r.title}</h4>
                  <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${
                    r.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                    r.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                    r.status === 'at_risk' ? 'bg-red-500/20 text-red-400' :
                    'bg-white/10 text-white/70'
                  }`}>{r.status.replace('_', ' ')}</span>
                </div>
                <p className="text-sm text-on-surface-variant mb-6">{r.description}</p>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs text-on-surface-variant mb-1">
                      <span>Progress</span>
                      <span>{roadmapService.calculateProgress(r.milestones || [])}%</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${roadmapService.calculateProgress(r.milestones || [])}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full glass-panel p-12 rounded-2xl border border-white/10 text-center">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 block">lock</span>
                <h3 className="text-lg font-bold text-white mb-2">No public roadmaps</h3>
                <p className="text-sm text-on-surface-variant">This startup has not published any public roadmaps yet.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "team" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in">
          {members.map((m: any) => (
            <div key={m.id} className="glass-panel p-5 rounded-xl border border-white/10 flex items-center gap-4">
              {m.profile?.avatar_url ? (
                <img src={m.profile.avatar_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-white/10" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                  {(m.profile?.name || "M").substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-sm font-bold text-white">{m.profile?.name}</div>
                <div className="text-xs text-on-surface-variant">{m.profile?.headline || ""}</div>
                <span className="text-[10px] uppercase font-bold text-on-surface-variant capitalize">{m.role}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "opportunities" && (
        <div className="space-y-4 animate-in fade-in">
          {opportunities.length > 0 ? opportunities.map((opp: any) => (
            <div key={opp.id} className="glass-panel p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-white">{opp.title}</h3>
                <span className={`text-[10px] uppercase px-2 py-1 rounded font-bold ${opp.status === "open" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-on-surface-variant"}`}>{opp.status}</span>
              </div>
              {opp.description && <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">{opp.description}</p>}
              <div className="flex flex-wrap gap-2 mb-4">
                {opp.required_skills?.map((s: string) => (
                  <span key={s} className="bg-white/5 text-on-surface-variant text-xs px-2 py-0.5 rounded">{s}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-on-surface-variant border-t border-white/5 pt-4">
                <div className="flex items-center gap-4">
                  <span className="capitalize">{opp.commitment?.replace("_", " ")}</span>
                  <span>{opp.location}</span>
                  {opp.equity_range && <span>{opp.equity_range} equity</span>}
                </div>
                <Link href="/jobs" className="px-4 py-1.5 bg-white text-black rounded-lg text-xs font-semibold hover:bg-white/90">Apply</Link>
              </div>
            </div>
          )) : <p className="text-center text-on-surface-variant py-8">No open positions right now.</p>}
        </div>
      )}

      {activeTab === "updates" && (
        <div className="space-y-4 animate-in fade-in">
          {posts.length > 0 ? posts.map((post: any) => (
            <div key={post.id} className="glass-panel p-5 rounded-xl border border-white/10">
              <div className="flex items-center gap-3 mb-3">
                {post.author?.avatar_url ? (
                  <img src={post.author.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-white">{(post.author?.name || "U").charAt(0)}</div>
                )}
                <div>
                  <span className="text-sm font-medium text-white">{post.author?.name}</span>
                  <span className="text-xs text-on-surface-variant ml-2">{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="text-sm text-on-surface leading-relaxed">{post.content}</p>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5 text-xs text-on-surface-variant">
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">favorite</span> {post.likes_count || 0}</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">chat_bubble</span> {post.comments_count || 0}</span>
              </div>
            </div>
          )) : <p className="text-center text-on-surface-variant py-8">No updates posted yet.</p>}
        </div>
      )}
    </div>
  );
}
