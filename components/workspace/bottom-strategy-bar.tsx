"use client";

export function BottomStrategyBar() {
  return (
    <div className="w-full glass-panel border border-white/10 rounded-2xl p-4 mt-6 flex flex-wrap lg:flex-nowrap gap-4 md:gap-8 items-center justify-between shadow-xl relative z-10 bg-surface-container-low/50">
      
      <div className="flex gap-4 items-start flex-1 min-w-[200px]">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-glow">
          <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
        </div>
        <div>
          <h4 className="text-white font-bold text-sm mb-1">Startup Mission</h4>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            To empower teams to build, collaborate and launch AI-powered products faster.
          </p>
        </div>
      </div>

      <div className="hidden lg:block w-px h-12 bg-white/10" />

      <div className="flex gap-3 items-start flex-1 min-w-[150px]">
        <span className="material-symbols-outlined text-purple-400 mt-0.5">visibility</span>
        <div>
          <h4 className="text-white font-bold text-xs mb-1">Vision</h4>
          <p className="text-[10px] text-on-surface-variant leading-relaxed">
            Be the #1 AI collaboration platform for startups.
          </p>
        </div>
      </div>

      <div className="hidden lg:block w-px h-12 bg-white/10" />

      <div className="flex gap-3 items-start flex-1 min-w-[150px]">
        <span className="material-symbols-outlined text-blue-400 mt-0.5">flag</span>
        <div>
          <h4 className="text-white font-bold text-xs mb-1">Current Goal</h4>
          <p className="text-[10px] text-on-surface-variant leading-relaxed">
            Launch MVP by<br />30th June 2024
          </p>
        </div>
      </div>

      <div className="hidden lg:block w-px h-12 bg-white/10" />

      <div className="flex gap-3 items-start flex-1 min-w-[150px]">
        <span className="material-symbols-outlined text-emerald-400 mt-0.5">edit</span>
        <div>
          <h4 className="text-white font-bold text-xs mb-1">Focus Area</h4>
          <p className="text-[10px] text-on-surface-variant leading-relaxed">
            Product Development<br />&amp; User Onboarding
          </p>
        </div>
      </div>

      <div className="hidden lg:block w-px h-12 bg-white/10" />

      <div className="flex gap-3 items-start flex-1 min-w-[150px]">
        <span className="material-symbols-outlined text-amber-400 mt-0.5">query_stats</span>
        <div>
          <h4 className="text-white font-bold text-xs mb-1">Key Metric</h4>
          <p className="text-[10px] text-on-surface-variant leading-relaxed">
            10K Users<br />by Q3 2024
          </p>
        </div>
      </div>

    </div>
  );
}
