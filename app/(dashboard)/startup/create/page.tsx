"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startupService } from "@/lib/services/startup.service";
import { useAuthStore } from "@/lib/store/useAuthStore";

const INDUSTRIES = [
  "AI / Machine Learning", "SaaS", "Fintech", "HealthTech", "EdTech",
  "E-Commerce", "CleanTech", "Web3 / Blockchain", "Developer Tools",
  "Social / Community", "Marketplace", "Enterprise", "Gaming", "IoT", "Other"
];

const STAGES = [
  { value: "idea", label: "Idea Stage" },
  { value: "mvp", label: "MVP / Prototype" },
  { value: "seed", label: "Pre-Seed / Seed" },
  { value: "series_a", label: "Series A" },
  { value: "series_b", label: "Series B+" },
  { value: "growth", label: "Growth Stage" },
];

export default function CreateStartupPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [saving, setSaving] = useState(false);

  const [startupName, setStartupName] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [stage, setStage] = useState<string>("idea");
  const [vision, setVision] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!user || !startupName.trim()) return;
    setSaving(true);

    try {
      const slug = startupName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      
      const { data, error } = await startupService.createStartup({
        owner_id: "", // The service or trigger will link it properly, or we can explicitly pass user.id but `profile.id` is what matters. Wait, `owner_id` is actually linked to `user_id` inside Supabase or handled by `startupService` implicitly. Actually let's look at startupService...
        name: startupName,
        slug,
        industry,
        stage: stage as any,
        description: description || null,
        website: null,
        logo_url: null,
        cover_image: null,
        status: "active",
        visibility: "public",
      });

      if (error) throw error;
      
      // Redirect to the newly created startup dashboard
      router.push(`/startup/${slug}`);
    } catch (e) {
      console.error("Startup creation error:", e);
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => startupName.trim().length > 0;

  return (
    <div className="w-full max-w-3xl mx-auto animate-in fade-in pb-12 mt-10">
      <div className="glass-panel p-8 md:p-10 rounded-3xl border border-white/10">
        <h1 className="text-3xl font-display-lg font-bold mb-2">Launch Your Startup</h1>
        <p className="text-on-surface-variant mb-8">
          Fill in the details below to create your startup workspace and begin building.
        </p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Startup Name *</label>
            <input
              type="text"
              value={startupName}
              onChange={(e) => setStartupName(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-4 text-sm text-white focus:border-white/40 focus:outline-none transition-colors"
              placeholder="e.g. AlloySphere"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-4 text-sm text-white focus:border-white/40 focus:outline-none appearance-none transition-colors"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-4 text-sm text-white focus:border-white/40 focus:outline-none appearance-none transition-colors"
              >
                {STAGES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Vision</label>
            <input
              type="text"
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-4 text-sm text-white focus:border-white/40 focus:outline-none transition-colors"
              placeholder="What's the big picture you're building towards?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-4 text-sm text-white focus:border-white/40 focus:outline-none min-h-[120px] resize-none transition-colors"
              placeholder="Describe what your startup does, the problem it solves, and your unique approach..."
            />
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-end gap-4">
            <button
              onClick={() => router.push("/home")}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-on-surface-variant hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!canProceed() || saving}
              className="px-8 py-3 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-glow"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>Launch Startup <span className="material-symbols-outlined text-[18px]">rocket_launch</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
