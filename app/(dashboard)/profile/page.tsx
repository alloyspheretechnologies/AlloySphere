"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { profileService } from "@/lib/services/profile.service";
import { applicationService } from "@/lib/services/application.service";
import { startupService } from "@/lib/services/startup.service";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [startups, setStartups] = useState<any[]>([]);
  const [stats, setStats] = useState({ followers: 0, following: 0, contributions: 0 });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: prof } = await profileService.getCurrentProfile();
      if (!prof) return;
      setProfile(prof);

      const supabase = getSupabaseBrowserClient();

      // Load applications
      const { data: apps } = await applicationService.getMyApplications(prof.id, { pageSize: 5 });
      setApplications(apps || []);

      // Load recent posts
      const { data: userPosts } = await supabase
        .from("posts")
        .select("*, startup:startups!posts_startup_id_fkey(name, slug)")
        .eq("author_id", prof.id)
        .order("created_at", { ascending: false })
        .limit(5);
      setPosts(userPosts || []);

      // Load startups (founded or member)
      const { data: memberOf } = await supabase
        .from("startup_members")
        .select("startup:startups(*)")
        .eq("user_id", prof.id)
        .eq("status", "active");
      setStartups(memberOf?.map((m: any) => m.startup).filter(Boolean) || []);

      // Load follower/following counts
      const { count: followerCount } = await supabase
        .from("connections")
        .select("*", { count: "exact", head: true })
        .eq("user_b_id", prof.id);
      const { count: followingCount } = await supabase
        .from("connections")
        .select("*", { count: "exact", head: true })
        .eq("user_a_id", prof.id);

      // Contribution score (completed tasks)
      const { count: taskCount } = await supabase
        .from("tasks")
        .select("*", { count: "exact", head: true })
        .eq("assignee_id", prof.id)
        .eq("status", "done");

      setStats({
        followers: followerCount || 0,
        following: followingCount || 0,
        contributions: taskCount || 0,
      });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  if (!profile) return (
    <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center max-w-lg mx-auto">
      <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 block">person_off</span>
      <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
      <p className="text-sm text-on-surface-variant">Please sign in to view your profile.</p>
    </div>
  );

  const statusConfig: Record<string, { bg: string; text: string }> = {
    applied: { bg: "bg-white/5", text: "text-on-surface-variant" },
    reviewing: { bg: "bg-blue-500/20", text: "text-blue-400" },
    interview: { bg: "bg-amber-500/20", text: "text-amber-400" },
    accepted: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
    rejected: { bg: "bg-red-500/20", text: "text-red-400" },
    withdrawn: { bg: "bg-white/5", text: "text-on-surface-variant" },
  };

  return (
    <div className="w-full max-w-[1000px] mx-auto animate-in fade-in pb-12">
      {/* Banner + Profile Header */}
      <div className="glass-panel rounded-3xl border border-white/10 relative overflow-hidden">
        {/* Banner */}
        <div className="h-40 bg-gradient-to-r from-white/5 via-white/10 to-white/5 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.08),transparent_70%)]" />
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[rgba(10,10,10,0.7)] to-transparent" />
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8 -mt-16 relative z-10">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Avatar */}
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-28 h-28 rounded-2xl border-4 border-surface-container object-cover shadow-[0_0_30px_rgba(255,255,255,0.1)] avatar-glow"
              />
            ) : (
              <div className="w-28 h-28 rounded-2xl border-4 border-surface-container bg-surface-container-high flex items-center justify-center text-3xl font-bold text-white shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                {(profile.name || "U").substring(0, 2).toUpperCase()}
              </div>
            )}

            <div className="flex-1 mt-2">
              <h1 className="text-3xl font-bold text-white">{profile.name}</h1>
              {profile.headline && (
                <p className="text-base text-on-surface-variant mt-1">{profile.headline}</p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white">
                  {profile.role}
                </span>
                {profile.location && (
                  <span className="bg-white/5 px-3 py-1 rounded-full text-xs text-on-surface-variant flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {profile.location}
                  </span>
                )}
              </div>
            </div>

            <Link
              href="/settings"
              className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 border border-white/10 hover:border-white/20 mt-4 md:mt-6"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile
            </Link>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-sm text-on-surface leading-relaxed mt-6 max-w-2xl">
              {profile.bio}
            </p>
          )}

          {/* Stats Row */}
          <div className="flex gap-6 mt-6 pt-6 border-t border-white/5">
            <div className="text-center">
              <div className="text-xl font-bold text-white">{stats.contributions}</div>
              <div className="text-xs text-on-surface-variant uppercase tracking-wider">Contributions</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{applications.length}</div>
              <div className="text-xs text-on-surface-variant uppercase tracking-wider">Applications</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{startups.length}</div>
              <div className="text-xs text-on-surface-variant uppercase tracking-wider">Startups</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{stats.followers}</div>
              <div className="text-xs text-on-surface-variant uppercase tracking-wider">Connections</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Skills */}
          {profile.skills && profile.skills.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">psychology</span>
                Skills & Expertise
              </h3>
              <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill: string) => (
                  <span key={skill} className="bg-white/5 text-on-surface px-3 py-1.5 rounded-lg text-xs font-medium border border-white/5 hover:border-white/10 transition-colors">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity / Posts */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">dynamic_feed</span>
                Recent Activity
              </h3>
              <Link href="/feed" className="text-xs text-on-surface-variant hover:text-white transition-colors">
                View all →
              </Link>
            </div>
            {posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post: any) => (
                  <div key={post.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold text-primary">
                        {post.type?.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-on-surface-variant">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-on-surface line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">favorite</span>
                        {post.likes_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                        {post.comments_count || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-[36px] text-on-surface-variant/30 mb-2 block">edit_note</span>
                <p className="text-sm text-on-surface-variant">No posts yet. Share your first update in the Community Feed.</p>
              </div>
            )}
          </div>

          {/* Applications (for talent) */}
          {profile.role === "talent" && applications.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-on-surface-variant text-[20px]">description</span>
                  Recent Applications
                </h3>
                <Link href="/applications" className="text-xs text-on-surface-variant hover:text-white transition-colors">
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {applications.slice(0, 4).map((app: any) => {
                  const cfg = statusConfig[app.status] || statusConfig.applied;
                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                      <div>
                        <div className="text-sm font-medium text-white">{app.opportunity_title}</div>
                        <div className="text-xs text-on-surface-variant">{app.startup_name} • {new Date(app.applied_at || app.created_at).toLocaleDateString()}</div>
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${cfg.bg} ${cfg.text}`}>
                        {app.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          {/* Social Links */}
          {(profile.linkedin_url || profile.github_url || profile.portfolio_url) && (
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">link</span>
                Links
              </h3>
              <div className="space-y-3">
                {profile.portfolio_url && (
                  <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-colors group">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-white text-[20px]">language</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">Portfolio</div>
                      <div className="text-xs text-on-surface-variant truncate">{profile.portfolio_url}</div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant/50 text-[16px]">open_in_new</span>
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-colors group">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-white text-[20px]">link</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">LinkedIn</div>
                      <div className="text-xs text-on-surface-variant truncate">{profile.linkedin_url}</div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant/50 text-[16px]">open_in_new</span>
                  </a>
                )}
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-colors group">
                    <span className="material-symbols-outlined text-on-surface-variant group-hover:text-white text-[20px]">code</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">GitHub</div>
                      <div className="text-xs text-on-surface-variant truncate">{profile.github_url}</div>
                    </div>
                    <span className="material-symbols-outlined text-on-surface-variant/50 text-[16px]">open_in_new</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Startups */}
          {startups.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">rocket_launch</span>
                Startups
              </h3>
              <div className="space-y-3">
                {startups.map((s: any) => (
                  <Link key={s.id} href={`/startup/${s.slug}`}
                    className="flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/5 transition-colors">
                    <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                      {s.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{s.name}</div>
                      <div className="text-[10px] text-on-surface-variant uppercase tracking-wider">{s.industry} • {s.stage?.replace("_", " ")}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Member Since */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant text-[20px]">info</span>
              About
            </h3>
            <div className="space-y-2 text-sm text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                Joined {new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </div>
              {profile.username && (
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">alternate_email</span>
                  {profile.username}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
