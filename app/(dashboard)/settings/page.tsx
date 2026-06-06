"use client";

import { useEffect, useState } from "react";
import { profileService } from "@/lib/services/profile.service";

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit fields
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await profileService.getCurrentProfile();
      if (data) {
        setProfile(data);
        setName(data.name || "");
        setHeadline(data.headline || "");
        setBio(data.bio || "");
        setSkills(data.skills?.join(", ") || "");
        setLocation(data.location || "");
        setGithub(data.github_url || "");
        setLinkedin(data.linkedin_url || "");
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await profileService.updateProfile(profile.user_id, {
        name, headline, bio, location, github_url: github, linkedin_url: linkedin,
        skills: skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : [],
      });
      await loadData();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

  return (
    <div className="w-full max-w-[800px] mx-auto animate-in fade-in pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">Settings</h1>
        <p className="text-on-surface-variant mt-1">Manage your profile and preferences.</p>
      </header>

      <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-8">
        <div>
          <h3 className="text-lg font-bold text-white mb-4">Public Profile</h3>
          <div className="flex gap-6 items-center mb-6">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-20 h-20 rounded-2xl object-cover border border-white/10" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-bold text-white">
                {(name || "U").substring(0, 2).toUpperCase()}
              </div>
            )}
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors">
              Change Avatar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">Headline</label>
              <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" placeholder="e.g. Senior Full-Stack Engineer" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-on-surface-variant font-medium">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none min-h-[100px] resize-none" placeholder="Tell the community about yourself..." />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">Skills</label>
              <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" placeholder="React, UI Design, Marketing (comma separated)" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">GitHub URL</label>
              <input type="text" value={github} onChange={(e) => setGithub(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">LinkedIn URL</label>
              <input type="text" value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex justify-end">
          <button onClick={handleSave} disabled={saving}
            className="px-8 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-50 btn-glow">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
