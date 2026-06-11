import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { Document, DocumentFolder } from '@/lib/types';

export const documentService = {
  // ===== Folders =====

  async createFolder(workspaceId: string, name: string, parentId?: string, createdBy?: string) {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('document_folders')
      .insert({ workspace_id: workspaceId, name, parent_id: parentId, created_by: createdBy })
      .select()
      .single();
    return { data: data as DocumentFolder | null, error };
  },

  async listFolders(workspaceId: string, parentId?: string | null) {
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from('document_folders')
      .select('*')
      .eq('workspace_id', workspaceId);

    if (parentId === null || parentId === undefined) {
      query = query.is('parent_id', null);
    } else {
      query = query.eq('parent_id', parentId);
    }

    const { data, error } = await query.order('name', { ascending: true });
    return { data: (data as DocumentFolder[]) ?? [], error };
  },

  async deleteFolder(folderId: string) {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from('document_folders').delete().eq('id', folderId);
    return { error };
  },

  // ===== Documents =====

  async uploadDocument(workspaceId: string, file: File, folderId?: string, uploadedBy?: string, bucketName: string = 'documents') {
    const supabase = getSupabaseBrowserClient();
    const path = `${workspaceId}/${folderId ?? 'root'}/${Date.now()}_${file.name}`;

    // Upload to storage
    const { data: storageData, error: storageError } = await supabase.storage
      .from(bucketName)
      .upload(path, file);

    if (storageError) return { data: null, error: storageError };

    // Create document record (we can still track it in the DB even if it's in conference_files)
    const { data, error } = await supabase
      .from('documents')
      .insert({
        workspace_id: workspaceId,
        folder_id: folderId,
        name: file.name,
        file_url: path,
        file_type: file.type,
        file_size: file.size,
        uploaded_by: uploadedBy,
      })
      .select()
      .single();

    return { data: data as Document | null, error, path };
  },

  async listDocuments(workspaceId: string, folderId?: string | null) {
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from('documents')
      .select(`
        *,
        uploader:profiles!documents_uploaded_by_fkey(id, name, avatar_url)
      `)
      .eq('workspace_id', workspaceId);

    if (folderId === null || folderId === undefined) {
      query = query.is('folder_id', null);
    } else {
      query = query.eq('folder_id', folderId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data: data ?? [], error };
  },

  async deleteDocument(documentId: string, bucketName: string = 'documents') {
    const supabase = getSupabaseBrowserClient();

    const { data: doc } = await supabase
      .from('documents')
      .select('file_url')
      .eq('id', documentId)
      .single();

    if (doc?.file_url) {
      // Direct path deletion based on how we stored it
      await supabase.storage.from(bucketName).remove([doc.file_url]);
    }

    const { error } = await supabase.from('documents').delete().eq('id', documentId);
    return { error };
  },

  async getDocumentUrl(path: string, bucketName: string = 'documents') {
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase.storage.from(bucketName).createSignedUrl(path, 3600);
    return { url: data?.signedUrl ?? null };
  },
};
