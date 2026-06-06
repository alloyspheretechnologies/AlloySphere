"use client";

import { authService } from "@/lib/services/auth.service";

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    await authService.signInWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground relative overflow-hidden">
      {/* Background Particles */}
      <div className="absolute inset-0 z-[0] overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[100px] mix-blend-screen"></div>
      </div>

      <div className="glass-panel p-8 md:p-12 rounded-2xl w-full max-w-md relative z-10 border border-white/10 tilt-container flex flex-col items-center">
        <div className="flex items-center gap-3 mb-8">
          <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>change_history</span>
          <span className="text-3xl font-bold text-primary tracking-tight">AlloySphere</span>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-on-surface mb-2">Welcome to the Ecosystem</h2>
          <p className="text-sm text-on-surface-variant">Sign in to orchestrate your venture.</p>
        </div>

        <button 
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-surface-container-high hover:bg-surface-container-highest border border-white/10 hover:border-white/20 py-3 px-4 rounded-xl transition-all duration-300 holographic-lift btn-glow text-on-surface font-semibold"
        >
          {/* Using a placeholder G icon instead of loading an external SVG */}
          <span className="material-symbols-outlined text-xl">account_circle</span>
          Continue with Google
        </button>

        <p className="text-xs text-on-surface-variant mt-8 text-center px-4">
          By continuing, you agree to AlloySphere&apos;s Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
