"use client";

import { motion } from "framer-motion";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  angle: number; // Position on the circle in degrees
  distance: number; // Distance from center (0-100)
}

export function ConferenceScene({ members }: { members: TeamMember[] }) {
  // Calculate apparent 2D positions to avoid 3D transform squishing
  const getPosition = (angle: number, distance: number) => {
    const rad = (angle * Math.PI) / 180;
    // Base radius is 350px.
    const r = (distance / 100) * 350;
    const x = r * Math.cos(rad);
    // Y is squished to simulate isometric perspective (scaleY ~ 0.4)
    const y = r * Math.sin(rad) * 0.4;
    return { x, y };
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[200px] pointer-events-none" />

      {/* The Holographic Base (Rings) */}
      <div 
        className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none"
        style={{ transform: "rotateX(65deg)" }}
      >
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border border-indigo-500/20 shadow-[0_0_100px_rgba(99,102,241,0.1)_inset]" 
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[100px] rounded-full border-2 border-indigo-400/30 border-dashed" 
        />
        <div className="absolute inset-[220px] rounded-full border border-indigo-300/40 shadow-[0_0_80px_rgba(99,102,241,0.3)_inset] bg-indigo-900/10 backdrop-blur-sm" />
        
        {/* Core Generator */}
        <div className="absolute inset-[320px] rounded-full bg-indigo-500/20 border-4 border-indigo-400/60 shadow-[0_0_80px_rgba(99,102,241,0.8)] flex items-center justify-center">
           <motion.div 
             animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
             transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
             className="w-full h-full rounded-full bg-white/20 blur-xl" 
           />
        </div>
      </div>

      {/* Center Animated Hologram Projection */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[150px] flex flex-col items-center justify-center z-20 pointer-events-none">
        {/* Hologram Light Cone */}
        <div 
          className="absolute top-[80px] w-[150px] h-[250px] opacity-30 blur-2xl"
          style={{ 
            background: `linear-gradient(to top, rgba(99,102,241,0.8), transparent)`,
            clipPath: 'polygon(50% 100%, 0 0, 100% 0)'
          }}
        />
        
        <motion.div 
          animate={{ y: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="glass-panel p-6 rounded-3xl border border-indigo-400/60 bg-indigo-950/60 backdrop-blur-2xl shadow-[0_0_50px_rgba(99,102,241,0.5)] flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Animated scanline */}
          <motion.div 
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-0.5 bg-indigo-300/50 blur-[1px]"
          />

          <h2 className="text-white font-black text-2xl tracking-[0.2em] uppercase mb-1 drop-shadow-glow">Conference</h2>
          <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-bold">AI Synergy Protocol Active</p>
          
          <div className="mt-6 w-full flex justify-between items-end gap-2 h-16 px-4">
            {[40, 80, 50, 100, 70, 90].map((h, i) => (
              <motion.div 
                key={i} 
                animate={{ height: [`${Math.max(20, h - 30)}%`, `${h}%`, `${Math.max(20, h - 30)}%`] }}
                transition={{ duration: 1.5 + i * 0.2, repeat: Infinity, ease: "easeInOut" }}
                className="w-3 bg-indigo-400 rounded-t-sm shadow-glow" 
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Avatars Overlay (Perfect 2D rendering placed on 3D coordinates) */}
      <div className="absolute top-1/2 left-1/2 w-0 h-0 z-30">
        {members.map((member) => {
          const { x, y } = getPosition(member.angle, member.distance);
          return (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: Math.random() * 0.5 }}
              className="absolute flex flex-col items-center"
              style={{
                left: x,
                top: y,
                transform: "translate(-50%, -100%)", // Anchor at the bottom
              }}
            >
              {/* Base Ring connecting to the table */}
              <div 
                className="absolute bottom-0 w-24 h-8 rounded-[100%] border-2 shadow-[0_0_20px_currentColor_inset] pointer-events-none"
                style={{ borderColor: member.color, color: member.color, transform: "translateY(50%)" }}
              >
                <motion.div 
                  animate={{ scale: [1, 1.5], opacity: [0.8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                  className="absolute inset-0 rounded-[100%] border-2 border-inherit"
                />
              </div>
              
              {/* Vertical Beam */}
              <div 
                className="absolute bottom-0 w-[60px] h-[100px] opacity-40 blur-md pointer-events-none origin-bottom"
                style={{ background: `linear-gradient(to top, ${member.color}, transparent)` }}
              />
              
              {/* Avatar Panel */}
              <motion.div 
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3 + Math.random(), repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 flex flex-col items-center group cursor-pointer"
              >
                <div 
                  className="relative w-20 h-24 overflow-hidden rounded-t-[40px] rounded-b-xl border border-white/20 bg-surface-container-high/90 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.8)]"
                  style={{ boxShadow: `0 0 20px ${member.color}40` }}
                >
                  {member.avatar ? (
                    <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white bg-gradient-to-br from-white/10 to-transparent">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  {/* Speaking indicator border glow */}
                  <motion.div 
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 border-2 border-white/50 rounded-inherit mix-blend-overlay"
                  />
                </div>
                
                {/* Info Card */}
                <div className="mt-3 glass-panel px-4 py-2 rounded-xl border border-white/10 flex flex-col items-center min-w-[140px] shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundColor: member.color }} />
                  <span className="text-sm font-bold text-white whitespace-nowrap relative z-10">{member.name}</span>
                  <span className="text-[10px] text-on-surface-variant whitespace-nowrap relative z-10 mt-0.5">{member.role}</span>
                  <span 
                    className="mt-1.5 text-[8px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full relative z-10 shadow-glow"
                    style={{ backgroundColor: `${member.color}20`, color: member.color, border: `1px solid ${member.color}50` }}
                  >
                    Online
                  </span>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Bottom Action Bar (Removed Camera) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 glass-panel rounded-2xl border border-white/10 p-3 flex items-center gap-2 shadow-2xl z-50 bg-black/40 backdrop-blur-3xl">
        <button className="flex flex-col items-center gap-1 p-3 hover:bg-white/10 rounded-xl transition-all text-white min-w-[70px]">
          <span className="material-symbols-outlined text-[20px]">mic</span>
          <span className="text-[10px] font-bold tracking-wider">Mic</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-3 hover:bg-white/10 rounded-xl transition-all text-white min-w-[70px]">
          <span className="material-symbols-outlined text-[20px]">screen_share</span>
          <span className="text-[10px] font-bold tracking-wider">Share</span>
        </button>
        
        {/* Glowing Center Cube Button */}
        <button className="relative w-16 h-16 mx-4 rounded-2xl bg-indigo-500/20 border-2 border-indigo-400 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.6)] group overflow-hidden">
           <div className="absolute inset-0 bg-indigo-500/40 blur-xl group-hover:bg-indigo-400/60 transition-colors" />
           <motion.span 
             animate={{ rotate: 180 }}
             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
             className="material-symbols-outlined text-[32px] text-white relative z-10 drop-shadow-glow"
           >
             view_in_ar
           </motion.span>
        </button>

        <button className="flex flex-col items-center gap-1 p-3 hover:bg-white/10 rounded-xl transition-all text-white min-w-[70px]">
          <span className="material-symbols-outlined text-[20px]">draw</span>
          <span className="text-[10px] font-bold tracking-wider">Board</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-3 hover:bg-white/10 rounded-xl transition-all text-white min-w-[70px]">
          <span className="material-symbols-outlined text-[20px]">group</span>
          <span className="text-[10px] font-bold tracking-wider">Team</span>
        </button>
        <button className="flex flex-col items-center gap-1 p-3 hover:bg-red-500/20 rounded-xl transition-all text-red-400 min-w-[70px] ml-4 border border-red-500/30">
          <span className="material-symbols-outlined text-[20px]">logout</span>
          <span className="text-[10px] font-bold tracking-wider">Leave</span>
        </button>
      </div>

    </div>
  );
}
