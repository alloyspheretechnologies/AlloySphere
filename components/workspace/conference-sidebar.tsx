"use client";

export function ConferenceSidebar() {
  return (
    <div className="w-80 shrink-0 flex flex-col gap-6 relative z-10 h-full overflow-y-auto custom-scrollbar pr-2 pb-8">
      
      {/* Workspace Activity */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-sm">Conference Logs</h3>
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider hover:underline cursor-pointer">View all</span>
        </div>
        <div className="space-y-4">
          {[
            { user: "Riya Singh", action: "shared", target: "UI Design System.fig", time: "2m ago", icon: "upload_file" },
            { user: "Karan Verma", action: "joined", target: "the conference", time: "5m ago", icon: "login" },
            { user: "Neha Patel", action: "updated", target: "Landing Page Design", time: "15m ago", icon: "edit_document" },
            { user: "David Kumar", action: "created", target: "Marketing Strategy Doc", time: "1h ago", icon: "note_add" },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 items-start group cursor-pointer">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant shrink-0 group-hover:bg-white/10 group-hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  <span className="font-bold text-white">{item.user}</span> {item.action} <span className="text-white">{item.target}</span>
                </p>
                <span className="text-[10px] text-on-surface-variant/50">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Discussions */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-sm">Active Channels</h3>
          <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider hover:underline cursor-pointer">View all</span>
        </div>
        <div className="space-y-2">
          {[
            { channel: "general", new: 8, color: "#8b5cf6" },
            { channel: "product-strategy", new: 12, color: "#10b981" },
            { channel: "development", new: 5, color: "#3b82f6" },
            { channel: "design", new: 3, color: "#ec4899" },
          ].map((c) => (
            <div key={c.channel} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <span className="text-on-surface-variant text-sm font-mono">#</span>
                <div>
                  <div className="text-sm font-medium text-white">{c.channel}</div>
                  <div className="text-[10px] text-on-surface-variant">{c.new} new messages</div>
                </div>
              </div>
              <div className="w-2 h-2 rounded-full shadow-glow" style={{ backgroundColor: c.color }} />
            </div>
          ))}
        </div>
      </div>

      {/* Workspace Progress */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-sm">Sprint Progress</h3>
          <span className="text-[10px] text-on-surface-variant flex items-center gap-1 cursor-pointer hover:text-white">
            This Week <span className="material-symbols-outlined text-[14px]">expand_more</span>
          </span>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Radial Chart Mockup */}
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="48" cy="48" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle cx="48" cy="48" r="40" fill="transparent" stroke="#8b5cf6" strokeWidth="8" strokeDasharray="251" strokeDashoffset="70" className="drop-shadow-glow" />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold text-white">72%</span>
              <span className="text-[8px] text-on-surface-variant uppercase tracking-wider">Completion</span>
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs text-on-surface-variant">Tasks</span>
              <span className="text-sm font-bold text-emerald-400">32<span className="text-on-surface-variant text-xs">/45</span></span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-xs text-on-surface-variant">Docs</span>
              <span className="text-sm font-bold text-white">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-on-surface-variant">Meetings</span>
              <span className="text-sm font-bold text-white">3</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
