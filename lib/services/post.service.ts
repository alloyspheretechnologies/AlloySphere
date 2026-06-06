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
  }
};
