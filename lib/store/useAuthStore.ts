import { create } from "zustand";
import { profileService } from "../services/profile.service";
import { authService } from "../services/auth.service";

type Role = "founder" | "talent" | "investor" | null;

interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  role: Role;
  onboardingComplete: boolean;
  loading: boolean;
  setRole: (role: Role) => void;
  logout: () => Promise<void>;
  syncSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  isAuthenticated: false,
  user: null,
  role: null,
  onboardingComplete: false,
  loading: true,
  setRole: (role) => set({ role }),
  logout: async () => {
    // Prevent infinite loop if already signed out
    if (!get().isAuthenticated && !get().user) return;
    
    // Optimistically set to prevent re-entrancy
    set({ isAuthenticated: false, user: null, role: null, onboardingComplete: false });

    try {
      // Add a 1 second timeout to prevent hanging on server-side sign out
      await Promise.race([
        authService.signOut(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Sign out timeout")), 1000))
      ]);
    } catch (e) {
      console.error("Sign out error:", e);
    }
    
    if (typeof window !== "undefined") {
      // Remove Supabase-specific storage keys without clearing everything
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("sb-") || key.startsWith("supabase"))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      window.location.href = "/login";
    }
  },
  syncSession: async () => {
    set({ loading: true });
    const { user } = await authService.getUser();
    if (user) {
      const { data: profile } = await profileService.getCurrentProfile();
      set({
        isAuthenticated: true,
        user,
        role: profile?.role as Role,
        onboardingComplete: !!profile?.onboarding_complete,
        loading: false,
      });
    } else {
      set({ isAuthenticated: false, user: null, role: null, onboardingComplete: false, loading: false });
    }
  },
}));
