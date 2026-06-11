"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { profileService } from "@/lib/services/profile.service";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { authService } from "@/lib/services/auth.service";
import AvatarUpload from "@/components/settings/avatar-upload";

type SettingsSection = "profile" | "account" | "notifications" | "privacy" | "appearance" | "danger";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, syncSession } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  // Profile form fields
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // Notification prefs (visual placeholders)
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [appActivity, setAppActivity] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  // Privacy prefs (visual placeholders)
  const [profilePublic, setProfilePublic] = useState(true);
  const [showEmail, setShowEmail] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data } = await profileService.getCurrentProfile();
      if (data) {
        setProfile(data);
        setName(data.name || "");
        setUsername(data.username || "");
        setHeadline(data.headline || "");
        setBio(data.bio || "");
        setSkills(data.skills?.join(", ") || "");
        setLocation(data.location || "");
        setGithub(data.github_url || "");
        setLinkedin(data.linkedin_url || "");
        setPortfolio(data.portfolio_url || "");
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage(null);
    try {
      await profileService.updateProfile(profile.user_id, {
        name, username, headline, bio, location,
        github_url: github, linkedin_url: linkedin, portfolio_url: portfolio,
        skills: skills ? skills.split(",").map(s => s.trim()).filter(Boolean) : [],
      });
      await syncSession();
      await loadData();
      setMessage({ type: "success", text: "Settings saved successfully!" });
      setTimeout(() => setMessage(null), 3000);
    } catch (e) { 
      console.error(e);
      setMessage({ type: "error", text: "Failed to save settings." });
    } finally { setSaving(false); }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await logout();
      // logout() from the store already redirects to /login
    } catch (e) {
      console.error(e);
      setSigningOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to completely delete your account? This action CANNOT be undone.")) return;
    setSigningOut(true);
    try {
      // Call our secure backend endpoint to delete the user from auth.users
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete account");
      }

      // Then clear the local session and redirect
      await logout();
    } catch (e) {
      console.error(e);
      alert("Failed to delete account. Please try again or contact support.");
      setSigningOut(false);
    }
  };

  const sections: { id: SettingsSection; label: string; icon: string }[] = [
    { id: "profile", label: "Profile", icon: "person" },
    { id: "account", label: "Account", icon: "manage_accounts" },
    { id: "notifications", label: "Notifications", icon: "notifications" },
    { id: "privacy", label: "Privacy", icon: "lock" },
    { id: "appearance", label: "Appearance", icon: "palette" },
    { id: "danger", label: "Danger Zone", icon: "warning" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="w-full max-w-[1100px] mx-auto animate-in fade-in pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">Settings</h1>
        <p className="text-on-surface-variant mt-1">Manage your account, profile, and preferences.</p>
      </header>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-medium border ${
          message.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
        }`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Nav */}
        <nav className="md:w-56 shrink-0">
          <div className="glass-panel rounded-2xl border border-white/10 p-2 md:sticky md:top-28">
            {sections.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  activeSection === sec.id
                    ? "bg-white/10 text-white font-semibold"
                    : sec.id === "danger"
                    ? "text-red-400/70 hover:text-red-400 hover:bg-red-500/5"
                    : "text-on-surface-variant hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{sec.icon}</span>
                {sec.label}
              </button>
            ))}

            <div className="border-t border-white/5 mt-2 pt-2">
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">logout</span>
                {signingOut ? "Signing out..." : "Sign Out"}
              </button>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Profile Settings */}
          {activeSection === "profile" && (
            <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Profile Settings</h2>
                <p className="text-sm text-on-surface-variant">Update your public profile information.</p>
              </div>

              {/* Avatar */}
              <div className="pb-6 border-b border-white/5">
                <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">Profile Photo</h3>
                <AvatarUpload
                  currentAvatarUrl={profile?.avatar_url || null}
                  onUploadSuccess={async (url) => {
                    setProfile((prev: any) => prev ? { ...prev, avatar_url: url } : null);
                    await syncSession();
                  }}
                />
              </div>

              {/* Personal Info */}
              <div>
                <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm text-on-surface-variant font-medium">Full Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                      className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/30 focus:outline-none transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-on-surface-variant font-medium">Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/30 focus:outline-none transition-all" placeholder="e.g. alexmorgan" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-on-surface-variant font-medium">Headline</label>
                    <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)}
                      className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/30 focus:outline-none transition-all" placeholder="e.g. Senior Full-Stack Engineer" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm text-on-surface-variant font-medium">Bio</label>
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/30 focus:outline-none min-h-[100px] resize-none transition-all" placeholder="Tell the community about yourself..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-on-surface-variant font-medium">Location</label>
                    <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/30 focus:outline-none transition-all" placeholder="e.g. San Francisco, CA" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-on-surface-variant font-medium">Skills</label>
                    <input type="text" value={skills} onChange={(e) => setSkills(e.target.value)}
                      className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/30 focus:outline-none transition-all" placeholder="React, UI Design, Marketing (comma separated)" />
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-6 border-t border-white/5">
                <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-4">Social Links</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-on-surface-variant font-medium">Portfolio / Website</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[18px]">language</span>
                      <input type="url" value={portfolio} onChange={(e) => setPortfolio(e.target.value)}
                        className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 pl-10 text-sm text-white focus:border-white/30 focus:outline-none transition-all" placeholder="https://..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-on-surface-variant font-medium">LinkedIn URL</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[18px]">link</span>
                      <input type="url" value={linkedin} onChange={(e) => setLinkedin(e.target.value)}
                        className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 pl-10 text-sm text-white focus:border-white/30 focus:outline-none transition-all" placeholder="https://linkedin.com/in/..." />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-on-surface-variant font-medium">GitHub URL</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant text-[18px]">code</span>
                      <input type="url" value={github} onChange={(e) => setGithub(e.target.value)}
                        className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 pl-10 text-sm text-white focus:border-white/30 focus:outline-none transition-all" placeholder="https://github.com/..." />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save */}
              <div className="pt-6 border-t border-white/10 flex justify-end">
                <button onClick={handleSave} disabled={saving}
                  className="px-8 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-50 btn-glow">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}

          {/* Account Settings */}
          {activeSection === "account" && (
            <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Account</h2>
                <p className="text-sm text-on-surface-variant">Your account details and connected services.</p>
              </div>

              <div className="space-y-6">
                {/* Email */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-on-surface-variant">email</span>
                      <div>
                        <div className="text-sm font-medium text-white">Email Address</div>
                        <div className="text-xs text-on-surface-variant">{user?.email || "Not set"}</div>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Verified</span>
                  </div>
                </div>

                {/* Role */}
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant">badge</span>
                    <div>
                      <div className="text-sm font-medium text-white">Role</div>
                      <div className="text-xs text-on-surface-variant capitalize">{profile?.role || "Not set"}</div>
                    </div>
                  </div>
                </div>

                {/* Connected Accounts */}
                <div>
                  <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Connected Accounts</h3>
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">account_circle</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">Google Account</div>
                          <div className="text-xs text-on-surface-variant">{user?.email}</div>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Connected</span>
                    </div>
                  </div>
                </div>

                {/* Sign Out */}
                <div className="pt-6 border-t border-white/5">
                  <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Session</h3>
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="flex items-center gap-3 px-5 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-500/20 transition-all disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    {signingOut ? "Signing out..." : "Sign Out of AlloySphere"}
                  </button>
                  <p className="text-xs text-on-surface-variant mt-2">This will end your session and redirect you to the landing page.</p>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Notifications</h2>
                <p className="text-sm text-on-surface-variant">Choose what notifications you want to receive.</p>
              </div>

              <div className="space-y-4">
                {[
                  { label: "Email Notifications", desc: "Receive updates via email", state: emailNotifs, set: setEmailNotifs },
                  { label: "Push Notifications", desc: "Browser push notifications", state: pushNotifs, set: setPushNotifs },
                  { label: "Application Updates", desc: "When your application status changes", state: appActivity, set: setAppActivity },
                  { label: "Weekly Digest", desc: "Summary of ecosystem activity", state: weeklyDigest, set: setWeeklyDigest },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                    <div>
                      <div className="text-sm font-medium text-white">{item.label}</div>
                      <div className="text-xs text-on-surface-variant">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => item.set(!item.state)}
                      className={`w-11 h-6 rounded-full transition-all relative ${item.state ? "bg-white" : "bg-white/10"}`}
                    >
                      <div className={`w-5 h-5 rounded-full transition-all absolute top-0.5 ${
                        item.state ? "left-[22px] bg-black" : "left-0.5 bg-white/40"
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Privacy */}
          {activeSection === "privacy" && (
            <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Privacy</h2>
                <p className="text-sm text-on-surface-variant">Control who sees your information.</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div>
                    <div className="text-sm font-medium text-white">Public Profile</div>
                    <div className="text-xs text-on-surface-variant">Allow others to find and view your profile</div>
                  </div>
                  <button
                    onClick={() => setProfilePublic(!profilePublic)}
                    className={`w-11 h-6 rounded-full transition-all relative ${profilePublic ? "bg-white" : "bg-white/10"}`}
                  >
                    <div className={`w-5 h-5 rounded-full transition-all absolute top-0.5 ${
                      profilePublic ? "left-[22px] bg-black" : "left-0.5 bg-white/40"
                    }`} />
                  </button>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div>
                    <div className="text-sm font-medium text-white">Show Email on Profile</div>
                    <div className="text-xs text-on-surface-variant">Display your email address to other users</div>
                  </div>
                  <button
                    onClick={() => setShowEmail(!showEmail)}
                    className={`w-11 h-6 rounded-full transition-all relative ${showEmail ? "bg-white" : "bg-white/10"}`}
                  >
                    <div className={`w-5 h-5 rounded-full transition-all absolute top-0.5 ${
                      showEmail ? "left-[22px] bg-black" : "left-0.5 bg-white/40"
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance */}
          {activeSection === "appearance" && (
            <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Appearance</h2>
                <p className="text-sm text-on-surface-variant">Customize how AlloySphere looks.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
                  <div className="text-sm font-medium text-white mb-3">Theme</div>
                  <div className="flex gap-3">
                    <button className="flex-1 p-4 rounded-xl border-2 border-white/30 bg-black text-center transition-all">
                      <span className="material-symbols-outlined text-white mb-1 block">dark_mode</span>
                      <span className="text-xs font-medium text-white">Dark</span>
                    </button>
                    <button className="flex-1 p-4 rounded-xl border border-white/10 bg-white/5 text-center transition-all hover:border-white/20 opacity-50 cursor-not-allowed">
                      <span className="material-symbols-outlined text-on-surface-variant mb-1 block">light_mode</span>
                      <span className="text-xs font-medium text-on-surface-variant">Light</span>
                    </button>
                    <button className="flex-1 p-4 rounded-xl border border-white/10 bg-white/5 text-center transition-all hover:border-white/20 opacity-50 cursor-not-allowed">
                      <span className="material-symbols-outlined text-on-surface-variant mb-1 block">monitor</span>
                      <span className="text-xs font-medium text-on-surface-variant">System</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          {activeSection === "danger" && (
            <div className="glass-panel p-8 rounded-2xl border border-red-500/20 space-y-8 animate-in fade-in">
              <div>
                <h2 className="text-xl font-bold text-red-400 mb-1">Danger Zone</h2>
                <p className="text-sm text-on-surface-variant">Irreversible actions that affect your account.</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">Export My Data</div>
                      <div className="text-xs text-on-surface-variant">Download all your data as a JSON file</div>
                    </div>
                    <button className="px-4 py-2 text-xs font-semibold border border-white/10 rounded-lg text-on-surface-variant hover:bg-white/5 transition-colors">
                      Export
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-red-400">Delete Account</div>
                      <div className="text-xs text-on-surface-variant">Permanently delete your account and all associated data</div>
                    </div>
                    <button 
                      onClick={handleDeleteAccount}
                      disabled={signingOut}
                      className="px-4 py-2 text-xs font-semibold border border-red-500/20 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {signingOut ? "Deleting..." : "Delete Account"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
