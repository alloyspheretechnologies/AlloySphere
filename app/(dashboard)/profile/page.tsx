"use client";

import { useAuthStore } from "@/lib/store/useAuthStore";

export default function ProfilePage() {
  const { user, role, logout } = useAuthStore();

  return (
    <div className="w-full max-w-[1000px] mx-auto animate-in fade-in">
      <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 via-secondary/20 to-tertiary/20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start mt-12">
          <img 
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop" 
            alt="Profile" 
            className="w-32 h-32 rounded-2xl border-4 border-surface-container object-cover shadow-[0_0_30px_rgba(221,183,255,0.3)] avatar-glow"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-display-lg font-bold text-white">{user?.name || 'Alex Morgan'}</h1>
            <p className="text-lg text-on-surface-variant mb-4">{user?.email || 'alex@alloysphere.com'}</p>
            <div className="flex gap-2 mb-6">
              <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white">
                Role: {role || 'Talent'}
              </span>
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-primary/30">
                Pro Member
              </span>
            </div>
            <p className="text-sm text-on-surface max-w-2xl">
              Experienced full-stack engineer and UI/UX designer. Passionate about building seamless, highly interactive web experiences and SaaS platforms. Currently exploring new opportunities in the AI and Developer Tools space.
            </p>
          </div>
          
          <div>
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">edit</span> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <button 
          onClick={logout}
          className="text-red-400 hover:text-red-300 font-semibold text-sm flex items-center gap-2 transition-colors px-4 py-2 border border-red-500/20 rounded-lg hover:bg-red-500/10"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span> Sign Out
        </button>
      </div>
    </div>
  );
}
