"use client";

import Link from "next/link";

interface FeedPost {
  id: string;
  type: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author?: {
    name: string;
    avatar_url: string | null;
    headline: string | null;
  };
  startup?: {
    name: string;
    slug: string;
  } | null;
}

export default function HomeEcosystemFeed({ posts }: { posts: FeedPost[] }) {
  if (posts.length === 0) {
    return (
      <div className="glass-panel p-8 rounded-2xl border border-white/10 text-center">
        <span className="material-symbols-outlined text-[36px] text-on-surface-variant/30 mb-2 block">dynamic_feed</span>
        <p className="text-sm text-on-surface-variant">No community activity yet. Share the first update!</p>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 rounded-2xl border border-white/10">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-on-surface-variant">dynamic_feed</span>
          Community Feed
        </h3>
        <Link href="/feed" className="text-xs text-on-surface-variant hover:text-white transition-colors">
          View all →
        </Link>
      </div>
      <div className="space-y-4">
        {posts.slice(0, 5).map((post) => (
          <div key={post.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:bg-white/[0.04] transition-colors">
            <div className="flex items-center gap-3 mb-3">
              {post.author?.avatar_url ? (
                <img src={post.author.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-white/10" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                  {(post.author?.name || "U").substring(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{post.author?.name}</span>
                  {post.startup && (
                    <span className="text-[10px] bg-white/5 text-on-surface-variant px-1.5 py-0.5 rounded font-medium">
                      {post.startup.name}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-on-surface-variant">
                  {post.author?.headline} • {new Date(post.created_at).toLocaleDateString()}
                </div>
              </div>
              <span className="bg-white/5 border border-white/10 rounded-full px-2 py-0.5 text-[9px] uppercase tracking-wider font-bold text-primary">
                {post.type?.replace("_", " ")}
              </span>
            </div>
            <p className="text-sm text-on-surface line-clamp-2 leading-relaxed">{post.content}</p>
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
    </div>
  );
}
