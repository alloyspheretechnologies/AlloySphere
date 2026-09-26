export default function AnalyticsPage() {
  return (
    <div className="w-full max-w-[1200px] mx-auto animate-in fade-in">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-on-surface">Analytics</h1>
        <p className="text-on-surface-variant mt-1">View insights and metrics for your startup.</p>
      </header>
      <div className="glass-panel rounded-2xl border border-white/10 p-12 text-center">
        <span className="material-symbols-outlined text-[48px] text-white/20 mb-4 block">analytics</span>
        <h2 className="text-xl font-bold text-white mb-2">Coming Soon</h2>
        <p className="text-on-surface-variant">The analytics dashboard is currently under development.</p>
      </div>
    </div>
  );
}
