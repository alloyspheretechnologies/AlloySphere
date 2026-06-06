"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { profileService } from "@/lib/services/profile.service";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const STAGES = [
  { value: "idea", label: "Idea" },
  { value: "mvp", label: "MVP" },
  { value: "seed", label: "Pre-Seed / Seed" },
  { value: "series_a", label: "Series A" },
  { value: "series_b", label: "Series B" },
  { value: "growth", label: "Growth / Late Stage" },
];

const INDUSTRY_OPTIONS = [
  "AI / Machine Learning", "SaaS", "Fintech", "HealthTech", "EdTech",
  "E-Commerce", "CleanTech", "Web3 / Blockchain", "Developer Tools",
  "Social / Community", "Marketplace", "Enterprise", "Gaming", "IoT",
];

const TICKET_SIZES = [
  { label: "$10K – $50K", min: 10000, max: 50000 },
  { label: "$50K – $250K", min: 50000, max: 250000 },
  { label: "$250K – $1M", min: 250000, max: 1000000 },
  { label: "$1M – $5M", min: 1000000, max: 5000000 },
  { label: "$5M+", min: 5000000, max: 50000000 },
];

export default function InvestorWizard() {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { user, syncSession } = useAuthStore();

  // Step 1: Personal
  const [name, setName] = useState(user?.user_metadata?.full_name || user?.user_metadata?.name || "");
  const [headline, setHeadline] = useState("");
  const [firmName, setFirmName] = useState("");
  const [bio, setBio] = useState("");

  // Step 2: Investment Focus
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [ticketSize, setTicketSize] = useState<number | null>(null);

  // Step 3: Thesis
  const [thesis, setThesis] = useState("");
  const [website, setWebsite] = useState("");

  const toggleStage = (val: string) => {
    setSelectedStages((prev) => prev.includes(val) ? prev.filter((s) => s !== val) : [...prev, val]);
  };

  const toggleIndustry = (val: string) => {
    setSelectedIndustries((prev) => prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]);
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Update profile
      await profileService.updateProfile(user.id, {
        name: name || undefined,
        headline: headline || undefined,
        bio: bio || undefined,
      });

      // Create investor profile
      const { data: profile } = await profileService.getCurrentProfile();
      if (profile) {
        const supabase = getSupabaseBrowserClient();
        const selectedTicket = ticketSize !== null ? TICKET_SIZES[ticketSize] : null;
        await supabase.from("investor_profiles").upsert({
          user_id: profile.id,
          firm_name: firmName || null,
          investment_thesis: thesis || null,
          check_size_min: selectedTicket?.min ?? null,
          check_size_max: selectedTicket?.max ?? null,
          preferred_stages: selectedStages as any,
          preferred_industries: selectedIndustries,
          website: website || null,
          portfolio_count: 0,
        });
      }

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
    return true;
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex-1">
            <div className={`h-1.5 rounded-full transition-all duration-500 ${s <= step ? "bg-white" : "bg-white/10"}`} />
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-on-surface">Investor Profile</h2>
          <p className="text-sm text-on-surface-variant">Tell founders and startups about yourself.</p>

          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Full Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none transition-colors"
              placeholder="Your full name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Firm / Fund Name</label>
            <input type="text" value={firmName} onChange={(e) => setFirmName(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none transition-colors"
              placeholder="e.g. Velocity Ventures" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Headline</label>
            <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none transition-colors"
              placeholder="e.g. General Partner @ Velocity Ventures" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none min-h-[100px] resize-none transition-colors"
              placeholder="Your investment background and what you bring to portfolio companies..." />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-on-surface">Investment Preferences</h2>
          <p className="text-sm text-on-surface-variant">Help us match you with the right startups.</p>

          <div>
            <label className="text-sm text-on-surface-variant font-medium block mb-3">Preferred Stages</label>
            <div className="flex flex-wrap gap-2">
              {STAGES.map((s) => (
                <button key={s.value} onClick={() => toggleStage(s.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedStages.includes(s.value)
                      ? "bg-white text-black border-white"
                      : "bg-surface-container-high border-white/10 text-on-surface-variant hover:border-white/30"
                  }`}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-on-surface-variant font-medium block mb-3">Preferred Industries</label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRY_OPTIONS.map((ind) => (
                <button key={ind} onClick={() => toggleIndustry(ind)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedIndustries.includes(ind)
                      ? "bg-white text-black border-white"
                      : "bg-surface-container-high border-white/10 text-on-surface-variant hover:border-white/30"
                  }`}>
                  {ind}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm text-on-surface-variant font-medium block mb-3">Typical Check Size</label>
            <div className="grid grid-cols-2 gap-2">
              {TICKET_SIZES.map((size, i) => (
                <button key={size.label} onClick={() => setTicketSize(i)}
                  className={`p-3 rounded-xl text-sm font-medium border transition-all ${
                    ticketSize === i
                      ? "border-white/40 bg-white/5 text-white"
                      : "border-white/10 bg-surface-container-high text-on-surface-variant hover:border-white/20"
                  }`}>
                  {size.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-on-surface">Investment Thesis</h2>
          <p className="text-sm text-on-surface-variant">Share your investment philosophy to attract aligned founders.</p>

          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Investment Thesis</label>
            <textarea value={thesis} onChange={(e) => setThesis(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none min-h-[120px] resize-none transition-colors"
              placeholder="Describe your investment philosophy, what you look for in founders, and what excites you..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Website</label>
            <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none transition-colors"
              placeholder="https://yourfirm.vc" />
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6 pt-6 border-t border-white/10">
        <button onClick={() => setStep(step - 1)} disabled={step === 1}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:text-white disabled:opacity-30 transition-colors">
          Back
        </button>
        <button onClick={handleNext} disabled={!canProceed() || saving}
          className="px-8 py-2.5 bg-white text-black rounded-xl text-sm font-semibold hover:bg-white/90 disabled:opacity-50 transition-all">
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              Setting up...
            </span>
          ) : step === 3 ? "Start Discovering →" : "Continue"}
        </button>
      </div>
    </div>
  );
}
