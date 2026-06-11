"use client";

import { useState, useRef } from "react";
import { documentService } from "@/lib/services/document.service";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

interface DocumentUploadProps {
  label: string;
  description?: string;
  currentUrl?: string | null;
  bucketName: string;
  folderPath: string; // e.g. "resumes", "pitch_decks"
  acceptedTypes?: string; // e.g. ".pdf,.docx"
  onUploadSuccess: (url: string) => Promise<void>;
  onDeleteSuccess?: () => Promise<void>;
}

export function DocumentUpload({
  label,
  description,
  currentUrl,
  bucketName,
  folderPath,
  acceptedTypes = ".pdf,.docx,.pptx,.xlsx,.png,.jpg,.jpeg",
  onUploadSuccess,
  onDeleteSuccess
}: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (file.size > 20 * 1024 * 1024) { // 20MB limit
      setError("File must be less than 20MB");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // We don't use documentService.uploadDocument here because that also inserts into the 'documents' table.
      // We just need the raw storage upload for profile/startup docs mapped to specific columns.
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${folderPath}/${Date.now()}.${fileExt}`;

      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Call the success callback with the path
      await onUploadSuccess(data.path);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDownload = async () => {
    if (!currentUrl) return;
    setDownloading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.storage.from(bucketName).createSignedUrl(currentUrl, 60);
      if (error) throw error;
      
      // Open in new tab
      window.open(data.signedUrl, '_blank');
    } catch (err: any) {
      console.error("Failed to download:", err);
      setError("Failed to generate download link.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentUrl || !onDeleteSuccess) return;
    if (!confirm(`Are you sure you want to remove your ${label}?`)) return;

    setUploading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      await supabase.storage.from(bucketName).remove([currentUrl]);
      await onDeleteSuccess();
    } catch (err: any) {
      console.error("Failed to delete:", err);
      setError("Failed to delete document.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm font-medium text-white">{label}</div>
          {description && <div className="text-xs text-on-surface-variant mt-1 max-w-[80%]">{description}</div>}
          
          {error && <div className="text-xs text-red-400 mt-2">{error}</div>}
        </div>

        <div className="flex items-center gap-2">
          {currentUrl ? (
            <>
              <button 
                onClick={handleDownload} 
                disabled={downloading}
                className="px-3 py-1.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                {downloading ? "Loading..." : "View"}
              </button>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3 py-1.5 text-xs font-semibold bg-white/5 text-white border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">sync</span>
                {uploading ? "Uploading..." : "Replace"}
              </button>

              {onDeleteSuccess && (
                <button 
                  onClick={handleDelete}
                  disabled={uploading}
                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Remove Document"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              )}
            </>
          ) : (
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-4 py-1.5 text-xs font-semibold bg-blue-500 text-white rounded-lg hover:bg-blue-400 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              {uploading ? "Uploading..." : "Upload"}
            </button>
          )}
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept={acceptedTypes} 
        className="hidden" 
      />
    </div>
  );
}
