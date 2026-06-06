"use client";

import { useEffect, useState } from "react";
import { profileService } from "@/lib/services/profile.service";
import { startupService } from "@/lib/services/startup.service";

export default function WorkspaceSettingsPage() {
  const [startup, setStartup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [stage, setStage] = useState("");
  const [visibility, setVisibility] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: prof } = await profileService.getCurrentProfile();
      if (!prof) return;

      const { data: startups } = await startupService.listStartups({ pageSize: 50 });
      const myStartup = startups?.find(s => s.owner_id === prof.id) || startups?.[0];
      if (myStartup) {
        setStartup(myStartup);
        setName(myStartup.name || "");
        setIndustry(myStartup.industry || "");
        setStage(myStartup.stage || "");
        setVisibility(myStartup.visibility || "");
        setDescription(myStartup.description || "");
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const handleSave = async () => {
    if (!startup) return;
    setSaving(true);
    try {
      await startupService.updateStartup(startup.id, {
        name, industry, stage: stage as any, visibility: visibility as any, description
      });
      await loadData();
    } catch (e) { console.error(e); } finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;

  if (!startup) return <div className="text-center py-20 text-on-surface-variant">No startup found</div>;

  return (
    <div className="w-full max-w-[800px] mx-auto animate-in fade-in pb-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-on-surface">Workspace Settings</h1>
        <p className="text-on-surface-variant mt-1">Manage your startup&apos;s profile and preferences.</p>
      </header>

      <div className="glass-panel p-8 rounded-2xl border border-white/10 space-y-8">
        <div>
          <h3 className="text-lg font-bold text-white mb-6">Startup Profile</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-on-surface-variant font-medium">Startup Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">Industry</label>
              <input type="text" value={industry} onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">Stage</label>
              <select value={stage} onChange={(e) => setStage(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none appearance-none">
                {["idea", "mvp", "seed", "series_a", "series_b", "growth"].map(s => <option key={s} value={s} className="capitalize">{s.replace("_", " ")}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">Visibility</label>
              <select value={visibility} onChange={(e) => setVisibility(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none appearance-none">
                <option value="public">Public (Discoverable)</option>
                <option value="private">Private (Invite Only)</option>
                <option value="stealth">Stealth (Hidden)</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm text-on-surface-variant font-medium">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none min-h-[100px] resize-none" />
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
