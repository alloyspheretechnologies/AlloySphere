import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export const dataRoomService = {
  async getStartupDocuments(startupId: string, category?: 'investor_facing' | 'internal') {
    const supabase = getSupabaseBrowserClient();
    let query = supabase
      .from('startup_documents')
      .select(`
        *,
        uploader:profiles!startup_documents_uploaded_by_fkey(id, name, avatar_url)
      `)
      .eq('startup_id', startupId);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    return { data, error };
  },

  async uploadStartupDocument(params: {
    startupId: string;
    file: File;
    category: 'investor_facing' | 'internal';
    documentType: string;
    isPublic: boolean;
  }) {
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: new Error("Not authenticated") };

    const fileExt = params.file.name.split('.').pop();
    const filePath = `${params.startupId}/${params.category}/${Date.now()}.${fileExt}`;

    // 1. Upload to storage bucket
    const { error: uploadError } = await supabase.storage
      .from('startup_documents')
      .upload(filePath, params.file);

    if (uploadError) return { error: uploadError };

    // 2. Insert into relational table
    const { data: document, error: dbError } = await supabase
      .from('startup_documents')
      .insert({
        startup_id: params.startupId,
        uploaded_by: user.id,
        name: params.file.name,
        file_url: filePath,
        category: params.category,
        document_type: params.documentType,
        file_size: params.file.size,
        file_type: params.file.type,
        is_public: params.isPublic,
      })
      .select()
      .single();

    if (dbError) return { error: dbError };

    // 3. Log Audit Event
    await this.logAudit(document.id, 'upload');

    return { data: document, error: null };
  },

  async deleteDocument(documentId: string, fileUrl: string) {
    const supabase = getSupabaseBrowserClient();
    
    await this.logAudit(documentId, 'delete');

    // Remove from storage
    await supabase.storage.from('startup_documents').remove([fileUrl]);

    // Remove from DB
    const { error } = await supabase
      .from('startup_documents')
      .delete()
      .eq('id', documentId);

    return { error };
  },

  async getDocumentUrl(documentId: string, fileUrl: string) {
    const supabase = getSupabaseBrowserClient();
    
    // Log view event
    await this.logAudit(documentId, 'view');

    // Create 60 second signed URL
    const { data, error } = await supabase.storage
      .from('startup_documents')
      .createSignedUrl(fileUrl, 60);

    return { url: data?.signedUrl || null, error };
  },

  async logAudit(documentId: string, action: 'upload' | 'view' | 'download' | 'share' | 'delete' | 'replace') {
    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('document_audit_logs').insert({
      document_id: documentId,
      user_id: user.id,
      action: action,
      user_agent: navigator.userAgent
    });
  },

  async getAuditLogs(startupId: string) {
    const supabase = getSupabaseBrowserClient();
    
    // We fetch logs for all documents belonging to this startup
    const { data, error } = await supabase
      .from('document_audit_logs')
      .select(`
        *,
        user:profiles!document_audit_logs_user_id_fkey(id, name, avatar_url),
        document:startup_documents!inner(id, name, startup_id)
      `)
      .eq('document.startup_id', startupId)
      .order('created_at', { ascending: false });

    return { data, error };
  }
};
