"use client";

import { useState, useEffect } from "react";
import { profileService } from "@/lib/services/profile.service";
import { useAuthStore } from "@/lib/store/useAuthStore";
import type { Profile } from "@/lib/types";
import AvatarUpload from "./avatar-upload";

export default function SettingsView() {
  const { user, syncSession } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"profile" | "links">("profile");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    headline: "",
    location: "",
    bio: "",
    portfolio_url: "",
    linkedin_url: "",
    github_url: "",
    skills: [] as string[],
  });

  const [skillsInput, setSkillsInput] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data } = await profileService.getCurrentProfile();
      if (data) {
        setProfile(data);
        setFormData({
          name: data.name || "",
          username: data.username || "",
          headline: data.headline || "",
          location: data.location || "",
          bio: data.bio || "",
          portfolio_url: data.portfolio_url || "",
          linkedin_url: data.linkedin_url || "",
          github_url: data.github_url || "",
          skills: data.skills || [],
        });
        setSkillsInput(data.skills?.join(", ") || "");
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);

    // Parse skills from comma-separated input
    const parsedSkills = skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const updates = {
      ...formData,
      skills: parsedSkills,
    };

    const { error } = await profileService.updateProfile(user.id, updates);

    setSaving(false);
    if (error) {
      setMessage({ type: "error", text: error.message || "Failed to update profile." });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully!" });
      await syncSession(); // Sync global auth store
      
      // Update local profile state
      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      
      setTimeout(() => setMessage(null), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden holographic-lift">
      {/* Tabs */}
      <div className="flex border-b border-white/10 px-2 pt-2">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "profile" 
              ? "border-primary text-primary" 
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab("links")}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "links" 
              ? "border-primary text-primary" 
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          Social Links
        </button>
      </div>

      <div className="p-8">
        {/* Messages */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-medium border ${
            message.type === "success" 
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}>
            {message.text}
          </div>
        )}

        <div className="space-y-8">
          {activeTab === "profile" && (
            <>
              {/* Avatar Section */}
              <div className="border-b border-white/10 pb-8">
                <h3 className="text-lg font-bold text-on-surface mb-4">Profile Picture</h3>
                <AvatarUpload 
                  currentAvatarUrl={profile?.avatar_url || null} 
                  onUploadSuccess={async (url) => {
                    setProfile((prev) => prev ? { ...prev, avatar_url: url } : null);
                    await syncSession();
                  }}
                />
              </div>

              {/* Personal Info Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant">Full Name</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant">Username</label>
                  <input 
                    type="text" 
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="e.g. alexmorgan"
                    className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-on-surface-variant">Headline</label>
                  <input 
                    type="text" 
                    name="headline"
                    value={formData.headline}
                    onChange={handleChange}
                    placeholder="e.g. Full-Stack Developer | Startup Enthusiast"
                    className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-on-surface-variant">Bio</label>
                  <textarea 
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Tell us about your journey..."
                    className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-y"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant">Location</label>
                  <input 
                    type="text" 
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-on-surface-variant">Skills (comma-separated)</label>
                  <input 
                    type="text" 
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                    placeholder="e.g. React, Node.js, UI/UX"
                    className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
            </>
          )}

          {activeTab === "links" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-lg font-bold text-on-surface mb-4">External Links</h3>
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface-variant">Personal Portfolio / Website</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-lg">language</span>
                  <input 
                    type="url" 
                    name="portfolio_url"
                    value={formData.portfolio_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface-variant">LinkedIn URL</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-lg">link</span>
                  <input 
                    type="url" 
                    name="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-on-surface-variant">GitHub URL</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-lg">code</span>
                  <input 
                    type="url" 
                    name="github_url"
                    value={formData.github_url}
                    onChange={handleChange}
                    placeholder="https://github.com/..."
                    className="w-full bg-surface-container-high border border-white/10 rounded-lg p-3 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-6 mt-8 border-t border-white/10 flex justify-end gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-gradient-to-r from-primary to-secondary text-on-primary rounded-lg text-sm font-semibold hover:shadow-[0_0_15px_rgba(221,183,255,0.4)] transition-all btn-glow flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
