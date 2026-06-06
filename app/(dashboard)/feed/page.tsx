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
      const { data } = await supabase
        .from("posts")
        .select("*, author:profiles!posts_author_id_fkey(*), startup:startups!posts_startup_id_fkey(name, slug)")
        .order("created_at", { ascending: false })
        .limit(50);
      setPosts(data || []);
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

    // Check if already liked to prevent duplicates
    const { data: existingLike } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", profile.id)
      .maybeSingle();

    if (existingLike) {
      // Unlike: remove the like and decrement
      await supabase.from("post_likes").delete().eq("id", existingLike.id);
      await supabase
        .from("posts")
        .update({ likes_count: Math.max(0, (post.likes_count || 1) - 1) })
        .eq("id", postId);
      setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: Math.max(0, (p.likes_count || 1) - 1) } : p));
    } else {
      // Like: insert and increment
      await supabase.from("post_likes").insert({ post_id: postId, user_id: profile.id });
      await supabase
        .from("posts")
        .update({ likes_count: (post.likes_count || 0) + 1 })
        .eq("id", postId);
      setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: (p.likes_count || 0) + 1 } : p));
    }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-[800px] mx-auto animate-in fade-in pb-12">
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

      <div className="space-y-6">
        {posts.length > 0 ? posts.map((post) => (
          <div key={post.id} className="glass-panel p-6 rounded-2xl border border-white/10 holographic-lift">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {post.author?.avatar_url ? (
                  <img src={post.author.avatar_url} alt="" className="w-10 h-10 rounded-xl object-cover border border-white/10" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-sm font-bold text-white">
                    {(post.author?.name || "U").substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white">{post.author?.name}</span>
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
              <button onClick={() => handleLike(post.id)} className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-white transition-colors group">
                <span className="material-symbols-outlined text-[20px] group-hover:text-red-400 transition-colors">favorite</span>
                <span>{post.likes_count || 0}</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
                <span>{post.comments_count || 0}</span>
              </button>
              <button className="flex items-center gap-2 text-sm text-on-surface-variant hover:text-white transition-colors ml-auto">
                <span className="material-symbols-outlined text-[20px]">share</span>
              </button>
            </div>
          </div>
        )) : (
          <div className="glass-panel p-12 rounded-2xl border border-white/10 text-center">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4 block">dynamic_feed</span>
            <h3 className="text-lg font-bold text-white mb-2">No posts yet</h3>
            <p className="text-sm text-on-surface-variant">Be the first to share an update with the community.</p>
          </div>
        )}
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
