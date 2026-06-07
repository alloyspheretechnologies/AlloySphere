import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Post, PostInsert, PostType } from '@/lib/types';

export const postService = {
  /**
   * Upload media or documents to Supabase storage.
   */
  async uploadAttachment(userId: string, file: File, type: 'media' | 'document') {
    const supabase = getSupabaseBrowserClient();
    const bucket = 'documents'; // Reusing documents bucket for all post attachments to avoid creating new unconfigured buckets
    const path = `posts/${userId}/${Date.now()}_${file.name}`;

    const { data: storageData, error: storageError } = await supabase.storage
      .from(bucket)
      .upload(path, file);

    if (storageError) return { data: null, error: storageError };

    return {
      data: {
        name: file.name,
        size: file.size,
        type: file.type,
        url: path, // Storing the storage path. Will generate signed URLs on fetch.
      },
      error: null
    };
  },

  /**
   * Create a new post with optional attachments
   */
  async createPost(payload: {
    author_id: string;
    startup_id?: string | null;
    content: string;
    type: PostType;
    media_urls?: string[];
    attachments?: any[];
  }) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('posts')
      .insert({
        author_id: payload.author_id,
        startup_id: payload.startup_id,
        content: payload.content,
        type: payload.type,
        media_urls: payload.media_urls || [],
        attachments: payload.attachments || [],
      })
      .select()
      .single();

    return { data, error };
  },

  /**
   * Delete a post
   */
  async deletePost(postId: string) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    return { error };
  },

  /**
   * Get comments for a post
   */
  async getComments(postId: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('post_comments')
      .select('*, author:profiles!post_comments_author_id_fkey(name, avatar_url, headline)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });
    return { data, error };
  },

  /**
   * Create a comment on a post
   */
  async createComment(payload: { post_id: string; author_id: string; content: string }) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: payload.post_id,
        author_id: payload.author_id,
        content: payload.content,
      })
      .select('*, author:profiles!post_comments_author_id_fkey(name, avatar_url, headline)')
      .single();
    return { data, error };
  },

  /**
   * Get trending startups based on recent post engagement
   */
  async getTrendingStartups(limit: number = 5) {
    const supabase = getSupabaseBrowserClient();
    // Since we don't have a complex algorithm in the DB yet, we'll fetch startups
    // sorted by the sum of likes and comments on their posts.
    // For simplicity, we query posts with a startup_id, group by startup, and sum engagement.
    // Alternatively, we can use an RPC if available. Since it might not be, we'll fetch recent posts and aggregate locally.
    const { data, error } = await supabase
      .from('posts')
      .select('likes_count, comments_count, startup:startups!posts_startup_id_fkey(id, name, slug, logo_url, industry)')
      .not('startup_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data) return { data: [], error };

    const engagementMap = new Map<string, { startup: any; score: number }>();
    
    data.forEach(post => {
      if (!post.startup) return;
      const startupObj = Array.isArray(post.startup) ? post.startup[0] : post.startup;
      if (!startupObj) return;
      
      const sId = startupObj.id;
      const score = (post.likes_count || 0) + (post.comments_count || 0);
      if (!engagementMap.has(sId)) {
        engagementMap.set(sId, { startup: startupObj, score: 0 });
      }
      engagementMap.get(sId)!.score += score;
    });

    const trending = Array.from(engagementMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return { data: trending, error: null };
  }
};
