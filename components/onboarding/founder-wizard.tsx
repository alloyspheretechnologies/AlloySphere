"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { profileService } from "@/lib/services/profile.service";
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

const GOALS = [
  { icon: "build", label: "Build MVP", description: "Ship a working product to early users" },
  { icon: "group_add", label: "Acquire Team", description: "Find co-founders and early team members" },
  { icon: "account_balance", label: "Raise Funding", description: "Connect with investors for funding" },
  { icon: "rocket_launch", label: "Launch Product", description: "Take your product to market" },
  { icon: "trending_up", label: "Grow Users", description: "Scale your user base and traction" },
];

export default function FounderWizard() {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { user, syncSession } = useAuthStore();

  // Step 1: Personal
  const [name, setName] = useState(user?.user_metadata?.full_name || user?.user_metadata?.name || "");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [linkedin, setLinkedin] = useState("");

  // Step 2: Startup
  const [startupName, setStartupName] = useState("");
  const [industry, setIndustry] = useState(INDUSTRIES[0]);
  const [stage, setStage] = useState<string>("idea");
  const [vision, setVision] = useState("");
  const [description, setDescription] = useState("");

  // Step 3: Goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);

    try {
      // 1. Update profile
      await profileService.updateProfile(user.id, {
        name: name || undefined,
        headline: headline || undefined,
        bio: bio || undefined,
        linkedin_url: linkedin || undefined,
      });

      // 2. Create startup
      if (startupName.trim()) {
        const slug = startupName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        await startupService.createStartup({
          owner_id: "", // Will be set by the profile ID from getCurrentProfile
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
      }

      // 3. Complete onboarding
      await profileService.completeOnboarding(user.id);
      await syncSession();
      router.push("/dashboard");
    } catch (e) {
      console.error("Onboarding error:", e);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      await handleComplete();
    }
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return startupName.trim().length > 0;
    return true;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${s <= step ? "bg-white" : "bg-white/10"}`} />
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-on-surface">Personal Profile</h2>
          <p className="text-sm text-on-surface-variant">Tell us about yourself. This helps talent and investors connect with you.</p>

          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none transition-colors"
              placeholder="Your full name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Headline</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none transition-colors"
              placeholder="e.g. Founder & CEO @ YourStartup"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none min-h-[100px] resize-none transition-colors"
              placeholder="Tell us about your experience and what drives you..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">LinkedIn URL</label>
            <input
              type="url"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none transition-colors"
              placeholder="https://linkedin.com/in/yourprofile"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-on-surface">Startup Details</h2>
          <p className="text-sm text-on-surface-variant">Set up your startup. A workspace will be created automatically.</p>

          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Startup Name *</label>
            <input
              type="text"
              value={startupName}
              onChange={(e) => setStartupName(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none transition-colors"
              placeholder="e.g. AlloySphere"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-on-surface-variant font-medium">Industry</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none appearance-none transition-colors"
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
                className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none appearance-none transition-colors"
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
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none transition-colors"
              placeholder="What's the big picture you're building towards?"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none min-h-[100px] resize-none transition-colors"
              placeholder="Describe what your startup does, the problem it solves, and your unique approach..."
            />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-on-surface">Your Goals</h2>
          <p className="text-sm text-on-surface-variant">What are you looking to achieve? Select all that apply.</p>

          <div className="space-y-3">
            {GOALS.map((goal) => (
              <button
                key={goal.label}
                onClick={() => toggleGoal(goal.label)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
                  selectedGoals.includes(goal.label)
                    ? "border-white/40 bg-white/5"
                    : "border-white/10 bg-surface-container-high hover:border-white/20"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  selectedGoals.includes(goal.label) ? "bg-white/10" : "bg-white/5"
                }`}>
                  <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                    {goal.icon}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{goal.label}</div>
                  <div className="text-xs text-on-surface-variant">{goal.description}</div>
                </div>
                {selectedGoals.includes(goal.label) && (
                  <span className="material-symbols-outlined text-white text-[18px] ml-auto" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6 pt-6 border-t border-white/10">
        <button
          onClick={() => setStep(step - 1)}
          disabled={step === 1}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:text-white disabled:opacity-30 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          disabled={!canProceed() || saving}
          className="px-8 py-2.5 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 disabled:opacity-50 transition-all"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Setting up...
            </span>
          ) : step === 3 ? "Launch Startup →" : "Continue"}
        </button>
      </div>
    </div>
  );
}
