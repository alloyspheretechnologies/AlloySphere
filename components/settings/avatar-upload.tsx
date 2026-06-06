"use client";

import { useState, useRef } from "react";
import { profileService } from "@/lib/services/profile.service";
import { useAuthStore } from "@/lib/store/useAuthStore";

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  onUploadSuccess: (url: string) => void;
}

export default function AvatarUpload({ currentAvatarUrl, onUploadSuccess }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("File must be an image");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const { url, error: uploadError } = await profileService.uploadAvatar(user.id, file);
      if (uploadError) throw uploadError;
      if (url) onUploadSuccess(url);
    } catch (err: any) {
      console.error("Avatar upload failed:", err);
      setError(err.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-24 h-24 rounded-full bg-surface-container-high border border-white/10 overflow-hidden flex-shrink-0 group">
        {currentAvatarUrl ? (
          <img src={currentAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
              person
            </span>
          </div>
        )}
        <div 
          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="material-symbols-outlined text-white">photo_camera</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-3 items-center">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {uploading ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                Uploading...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">upload</span>
                Upload new picture
              </>
            )}
          </button>
        </div>
        <p className="text-xs text-on-surface-variant">
          JPG, GIF or PNG. 5MB max.
        </p>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="hidden"
      />
    </div>
  );
}
