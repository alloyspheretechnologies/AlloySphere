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

export const useAuthStore = create<AuthState>()((set) => ({
  isAuthenticated: false,
  user: null,
  role: null,
  onboardingComplete: false,
  loading: true,
  setRole: (role) => set({ role }),
  logout: async () => {
    await authService.signOut();
    set({ isAuthenticated: false, user: null, role: null, onboardingComplete: false });
    // Clear any cached data and redirect to landing page
    if (typeof window !== "undefined") {
      localStorage.clear();
      window.location.href = "/";
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
