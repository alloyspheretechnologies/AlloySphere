"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { profileService } from "@/lib/services/profile.service";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Modal } from "@/components/shared/modal";

export default function FeedPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  // Likes & Comments state
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<string | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commenting, setCommenting] = useState(false);

  // Trending state
  const [trendingStartups, setTrendingStartups] = useState<any[]>([]);

  // Create Post
  const [showCreate, setShowCreate] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [postType, setPostType] = useState<any>("general_update");
  const [posting, setPosting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [docFiles, setDocFiles] = useState<File[]>([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: prof } = await profileService.getCurrentProfile();
      setProfile(prof);

      const supabase = getSupabaseBrowserClient();
      
      // Load Posts
      const { data } = await supabase
        .from("posts")
        .select("*, author:profiles!posts_author_id_fkey(*), startup:startups!posts_startup_id_fkey(name, slug)")
        .order("created_at", { ascending: false })
        .limit(50);
      setPosts(data || []);

      if (prof) {
        // Fetch liked post ids
        const { data: likes } = await supabase.from("post_likes").select("post_id").eq("user_id", prof.id);
        if (likes) {
          setLikedPostIds(new Set(likes.map(l => l.post_id)));
        }
      }

      // Fetch Trending Startups
      const { postService } = await import('@/lib/services/post.service');
      const { data: trending } = await postService.getTrendingStartups(5);
      setTrendingStartups(trending || []);

    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    const mFiles = files.filter(f => f.type.startsWith('image/'));
    const dFiles = files.filter(f => !f.type.startsWith('image/'));
    setMediaFiles(prev => [...prev, ...mFiles]);
    setDocFiles(prev => [...prev, ...dFiles]);
  };

  const handlePost = async () => {
    if (!profile || (!newContent.trim() && mediaFiles.length === 0 && docFiles.length === 0)) return;
    setPosting(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { postService } = await import('@/lib/services/post.service');
      
      const { data: userStartups } = await supabase.from("startup_members").select("startup_id").eq("user_id", profile.id).eq("role", "owner").maybeSingle();

      const mediaUrls: string[] = [];
      const attachments: any[] = [];

      for (const file of mediaFiles) {
        const { data } = await postService.uploadAttachment(profile.id, file, 'media');
        if (data) mediaUrls.push(data.url);
      }

      for (const file of docFiles) {
        const { data } = await postService.uploadAttachment(profile.id, file, 'document');
        if (data) attachments.push(data);
      }

      await postService.createPost({
        author_id: profile.id,
        startup_id: userStartups?.startup_id || null,
        content: newContent,
        type: postType,
        media_urls: mediaUrls,
        attachments: attachments,
      });

      setShowCreate(false); setNewContent(""); setMediaFiles([]); setDocFiles([]); setPostType("general_update");
      await loadData();
    } catch (e) { console.error(e); } finally { setPosting(false); }
  };

  const handleLike = async (postId: string) => {
    if (!profile) return;
    const supabase = getSupabaseBrowserClient();
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const isLiked = likedPostIds.has(postId);

    if (isLiked) {
      // Unlike
      const { data: existingLike } = await supabase.from("post_likes").select("id").eq("post_id", postId).eq("user_id", profile.id).maybeSingle();
      if (existingLike) await supabase.from("post_likes").delete().eq("id", existingLike.id);
      
      setLikedPostIds(prev => { const next = new Set(prev); next.delete(postId); return next; });
      setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: Math.max(0, (p.likes_count || 1) - 1) } : p));
    } else {
      // Like
      await supabase.from("post_likes").insert({ post_id: postId, user_id: profile.id });
      setLikedPostIds(prev => { const next = new Set(prev); next.add(postId); return next; });
      setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p));
    }
  };

  const toggleComments = async (postId: string) => {
    if (expandedComments === postId) {
      setExpandedComments(null);
      return;
    }
    setExpandedComments(postId);
    setComments([]);
    const { postService } = await import('@/lib/services/post.service');
    const { data } = await postService.getComments(postId);
    setComments(data || []);
  };

  const submitComment = async (postId: string) => {
    if (!profile || !newComment.trim() || commenting) return;
    setCommenting(true);
    try {
      const { postService } = await import('@/lib/services/post.service');
      const { data } = await postService.createComment({
        post_id: postId,
        author_id: profile.id,
        content: newComment.trim()
      });
      if (data) {
        setComments(prev => [...prev, data]);
        setNewComment("");
        setPosts(posts.map(p => p.id === postId ? { ...p, comments_count: (p.comments_count || 0) + 1 } : p));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCommenting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-[1100px] mx-auto animate-in fade-in pb-12">
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Community Feed</h1>
          <p className="text-on-surface-variant mt-1">Updates, milestones, and announcements.</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="px-5 py-2 bg-white text-black rounded-xl font-semibold text-sm hover:bg-white/90 transition-all flex items-center gap-2 shadow-glow">
          <span className="material-symbols-outlined text-[18px]">add</span> Create Post
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Feed Column */}
        <div className="lg:col-span-8 space-y-6">
          {posts.length > 0 ? posts.map((post) => {
            const isLiked = likedPostIds.has(post.id);
            const isCommentsExpanded = expandedComments === post.id;
            
            return (
              <div key={post.id} className="glass-panel p-6 rounded-2xl border border-white/10 holographic-lift">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/${post.author?.role === 'investor' ? 'investor' : post.author?.role === 'talent' ? 'talent' : 'profile'}/${post.author?.id}`}>
                      {post.author?.avatar_url ? (
                        <img src={post.author.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-white/10 hover:border-white/30 transition-colors" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white hover:border-white/30 transition-colors">
                          {(post.author?.name || "U").substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </Link>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/${post.author?.role === 'investor' ? 'investor' : post.author?.role === 'talent' ? 'talent' : 'profile'}/${post.author?.id}`} className="text-base font-bold text-white hover:underline">
                          {post.author?.name}
                        </Link>
                        {post.startup && (
                          <Link href={`/startup/${post.startup.slug}`} className="text-xs bg-white/10 text-white px-2 py-0.5 rounded font-medium hover:bg-white/20 transition-colors">
                            {post.startup.name}
                          </Link>
                        )}
                      </div>
                      <div className="text-xs text-on-surface-variant">{post.author?.headline} • {new Date(post.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>

                <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] uppercase tracking-wider font-bold text-primary mb-3">
                  {post.type.replace('_', ' ')}
                </div>
                
                {post.content && (
                  <p className="text-[15px] text-white leading-relaxed whitespace-pre-wrap mb-4">{post.content}</p>
                )}

                {/* Media Carousel */}
                {post.media_urls && post.media_urls.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar mb-4">
                    {post.media_urls.map((url: string, i: number) => (
                      <img key={i} src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/documents/${url}`} alt="" className="h-48 rounded-xl object-cover border border-white/10 flex-shrink-0" />
                    ))}
                  </div>
                )}

                {/* Attachments */}
                {post.attachments && post.attachments.length > 0 && (
                  <div className="flex flex-col gap-2 mb-4">
                    {post.attachments.map((doc: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-primary text-2xl">description</span>
                          <div>
                            <div className="text-sm font-semibold text-white">{doc.name}</div>
                            <div className="text-xs text-on-surface-variant">{(doc.size / 1024 / 1024).toFixed(2)} MB</div>
                          </div>
                        </div>
                        <button className="text-xs font-semibold px-3 py-1.5 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors">
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                  <button onClick={() => handleLike(post.id)} className={`flex items-center gap-2 text-sm transition-colors group ${isLiked ? 'text-red-400' : 'text-on-surface-variant hover:text-white'}`}>
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isLiked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                    <span>{post.likes_count || 0}</span>
                  </button>
                  <button onClick={() => toggleComments(post.id)} className={`flex items-center gap-2 text-sm transition-colors ${isCommentsExpanded ? 'text-primary' : 'text-on-surface-variant hover:text-white'}`}>
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isCommentsExpanded ? "'FILL' 1" : "'FILL' 0" }}>chat_bubble</span>
                    <span>{post.comments_count || 0}</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-white transition-colors ml-auto">
                    <span className="material-symbols-outlined text-[20px]">share</span>
                  </button>
                </div>

                {/* Expandable Comments Section */}
                {isCommentsExpanded && (
                  <div className="mt-4 pt-4 border-t border-white/5 animate-in slide-in-from-top-2">
                    <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {comments.length > 0 ? comments.map((comment) => (
                        <div key={comment.id} className="flex gap-3">
                          <Link href={`/${comment.author?.role === 'investor' ? 'investor' : comment.author?.role === 'talent' ? 'talent' : 'profile'}/${comment.author?.id}`}>
                            {comment.author?.avatar_url ? (
                              <img src={comment.author.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0 hover:border-white/30 transition-colors" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0 hover:border-white/30 transition-colors">
                                {(comment.author?.name || "U").substring(0, 2).toUpperCase()}
                              </div>
                            )}
                          </Link>
                          <div className="flex-1 bg-surface-container-high/50 rounded-xl p-3 border border-white/5">
                            <div className="flex items-center justify-between mb-1">
                              <Link href={`/${comment.author?.role === 'investor' ? 'investor' : comment.author?.role === 'talent' ? 'talent' : 'profile'}/${comment.author?.id}`} className="text-sm font-bold text-white hover:underline">
                                {comment.author?.name}
                              </Link>
                              <span className="text-[10px] text-on-surface-variant">{new Date(comment.created_at).toLocaleDateString()}</span>
                            </div>
                            <p className="text-sm text-on-surface-variant whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-sm text-on-surface-variant text-center py-4">No comments yet. Start the conversation!</div>
                      )}
                    </div>
                    
                    <div className="flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {(profile?.name || "U").substring(0, 2).toUpperCase()}
                      </div>
                      <input 
                        type="text" 
                        value={newComment} 
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                        placeholder="Write a comment..."
                        className="flex-1 bg-surface-container-high border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30"
                      />
                      <button 
                        onClick={() => submitComment(post.id)}
                        disabled={!newComment.trim() || commenting}
                        className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center disabled:opacity-50 hover:bg-primary/90 transition-colors shrink-0"
                      >
                        <span className="material-symbols-outlined text-[18px]">send</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          }) : (
            <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 block">dynamic_feed</span>
              <h3 className="text-lg font-bold text-white mb-2">No posts yet</h3>
              <p className="text-sm text-on-surface-variant">Be the first to share an update with the community.</p>
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-6 hidden lg:block">
          {/* Trending Startups Widget */}
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">trending_up</span> 
              Trending Startups
            </h3>
            
            {trendingStartups.length > 0 ? (
              <div className="space-y-4">
                {trendingStartups.map((item, idx) => (
                  <Link href={`/startup/${item.startup.slug}`} key={idx} className="flex gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-surface-container-high border border-white/10 flex items-center justify-center text-lg font-bold text-white group-hover:border-primary/50 transition-colors shrink-0">
                      {item.startup.logo_url ? (
                        <img src={item.startup.logo_url} alt="" className="w-full h-full rounded-xl object-cover" />
                      ) : (
                        item.startup.name.substring(0, 1).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold text-white truncate group-hover:text-primary transition-colors">{item.startup.name}</div>
                      <div className="text-xs text-on-surface-variant flex items-center gap-2">
                        <span className="truncate">{item.startup.industry}</span>
                        <span className="flex items-center gap-1 text-primary">
                          <span className="material-symbols-outlined text-[12px]">local_fire_department</span>
                          {item.score}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-sm text-on-surface-variant text-center py-4">No trending startups yet.</div>
            )}
            
            <Link href="/discover" className="mt-4 w-full py-2 border border-white/10 rounded-lg text-sm text-white hover:bg-white/5 transition-colors text-center block">
              Discover More
            </Link>
          </div>
          
          <div className="glass-panel p-6 rounded-2xl border border-white/10">
            <h3 className="text-base font-bold text-on-surface mb-2">Build Your Network</h3>
            <p className="text-sm text-on-surface-variant mb-4">Engage with posts to discover the next big thing and connect with visionary founders.</p>
            <div className="h-32 rounded-xl bg-gradient-to-br from-primary/20 to-transparent border border-white/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-4xl text-primary/50">hub</span>
            </div>
          </div>
        </div>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Post" size="lg">
        <div className="space-y-4">
          <div className="flex gap-4 mb-2">
            <select value={postType} onChange={(e) => setPostType(e.target.value as any)}
              className="bg-surface-container-high border border-white/10 rounded-xl p-2 text-sm text-white focus:outline-none">
              <option value="general_update">General Update</option>
              <option value="product_launch">Product Launch</option>
              <option value="milestone">Milestone</option>
              <option value="funding_update">Funding Update</option>
              <option value="team_update">Team Update</option>
              <option value="investor_update">Investor Update</option>
              <option value="document_share">Document Share</option>
              <option value="media_gallery">Media Gallery</option>
            </select>
          </div>
          <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)}
            className="w-full bg-surface-container-high border border-white/10 rounded-xl p-4 text-base text-white focus:outline-none min-h-[150px] resize-none" placeholder="What's new with you or your startup?" />
          
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:bg-white/5 transition-colors cursor-pointer relative">
            <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
            <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2 block">cloud_upload</span>
            <p className="text-sm text-white font-semibold">Click or drag files to upload</p>
            <p className="text-xs text-on-surface-variant mt-1">Supports JPG, PNG, PDF, DOCX, ZIP</p>
          </div>

          {/* Uploaded Files Preview */}
          {(mediaFiles.length > 0 || docFiles.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {mediaFiles.map((f, i) => (
                <div key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">image</span> {f.name}
                </div>
              ))}
              {docFiles.map((f, i) => (
                <div key={i} className="px-3 py-1 bg-white/10 rounded-full text-xs text-white flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">description</span> {f.name}
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-on-surface-variant hover:text-white">Cancel</button>
            <button onClick={handlePost} disabled={(!newContent.trim() && mediaFiles.length === 0 && docFiles.length === 0) || posting}
              className="px-6 py-2 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 disabled:opacity-50 flex items-center gap-2">
              {posting ? "Posting..." : "Post"} <span className="material-symbols-outlined text-[16px]">send</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
