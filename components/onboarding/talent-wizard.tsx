"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { profileService } from "@/lib/services/profile.service";
import { useAuthStore } from "@/lib/store/useAuthStore";

const SKILL_OPTIONS = [
  "React", "TypeScript", "Next.js", "Node.js", "Python", "Go", "Rust",
  "PostgreSQL", "MongoDB", "AWS", "Docker", "Kubernetes",
  "UI/UX Design", "Figma", "Product Management", "Data Science",
  "Machine Learning", "DevOps", "Swift", "Kotlin", "Flutter",
  "Blockchain", "Growth Marketing", "Content Strategy", "Sales",
];

const INTERESTS = [
  { icon: "code", label: "Engineering", desc: "Build products and systems" },
  { icon: "brush", label: "Design", desc: "Create beautiful experiences" },
  { icon: "campaign", label: "Marketing", desc: "Grow users and brand" },
  { icon: "analytics", label: "Data & AI", desc: "Insights and intelligence" },
  { icon: "business_center", label: "Business", desc: "Strategy and operations" },
  { icon: "devices", label: "Mobile", desc: "iOS, Android, cross-platform" },
];

export default function TalentWizard() {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const { user, syncSession } = useAuthStore();

  // Step 1: Personal
  const [name, setName] = useState(user?.user_metadata?.full_name || user?.user_metadata?.name || "");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  // Step 2: Skills
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");

  // Step 3: Interests
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleComplete = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await profileService.updateProfile(user.id, {
        name: name || undefined,
        headline: headline || undefined,
        bio: bio || undefined,
        location: location || undefined,
        skills: selectedSkills,
        portfolio_url: portfolioUrl || undefined,
        github_url: githubUrl || undefined,
      });
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
    if (step === 2) return selectedSkills.length > 0;
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
          <h2 className="text-xl font-bold text-on-surface">Personal Profile</h2>
          <p className="text-sm text-on-surface-variant">Tell startups who you are and what you bring to the table.</p>

          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Full Name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none transition-colors"
              placeholder="Your full name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Headline</label>
            <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none transition-colors"
              placeholder="e.g. Senior Full-Stack Engineer" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Bio</label>
            <textarea value={bio} onChange={(e) => setBio(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none min-h-[100px] resize-none transition-colors"
              placeholder="Share your experience, passions, and what you're looking for..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Location</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none transition-colors"
              placeholder="e.g. San Francisco, CA" />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-on-surface">Skills & Portfolio</h2>
          <p className="text-sm text-on-surface-variant">Select your skills so we can match you with the right startups.</p>

          <div>
            <label className="text-sm text-on-surface-variant font-medium block mb-3">Skills * (select at least 1)</label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    selectedSkills.includes(skill)
                      ? "bg-white text-black border-white"
                      : "bg-surface-container-high border-white/10 text-on-surface-variant hover:border-white/30 hover:text-white"
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">Portfolio URL</label>
            <input type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none transition-colors"
              placeholder="https://yourportfolio.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-on-surface-variant font-medium">GitHub URL</label>
            <input type="url" value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full bg-surface-container-high border border-white/10 rounded-xl p-3 text-sm text-white focus:border-white/40 focus:outline-none transition-colors"
              placeholder="https://github.com/yourusername" />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
          <h2 className="text-xl font-bold text-on-surface">What excites you?</h2>
          <p className="text-sm text-on-surface-variant">Select areas you&apos;re most interested in contributing to.</p>

          <div className="grid grid-cols-2 gap-3">
            {INTERESTS.map((item) => (
              <button
                key={item.label}
                onClick={() => toggleInterest(item.label)}
                className={`p-4 rounded-xl border transition-all text-left ${
                  selectedInterests.includes(item.label)
                    ? "border-white/40 bg-white/5"
                    : "border-white/10 bg-surface-container-high hover:border-white/20"
                }`}
              >
                <span className="material-symbols-outlined text-white mb-2 block" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {item.icon}
                </span>
                <div className="text-sm font-semibold text-white">{item.label}</div>
                <div className="text-xs text-on-surface-variant">{item.desc}</div>
              </button>
            ))}
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
          ) : step === 3 ? "Start Exploring →" : "Continue"}
        </button>
      </div>
    </div>
  );
}
