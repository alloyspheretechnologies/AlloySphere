export default function RoadmapPage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto animate-in fade-in">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-on-surface">Roadmap</h1>
        <p className="text-on-surface-variant mt-1">Plan and track your startup's milestones.</p>
      </header>
      <div className="glass-panel rounded-2xl border border-white/10 p-12 text-center">
        <span className="material-symbols-outlined text-[48px] text-white/20 mb-4 block">timeline</span>
        <h2 className="text-xl font-bold text-white mb-2">Coming Soon</h2>
        <p className="text-on-surface-variant">The roadmap feature is currently under development.</p>
      </div>
    </div>
  );
}
