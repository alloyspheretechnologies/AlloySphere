"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { authService } from "@/lib/services/auth.service";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { syncSession, logout } = useAuthStore();

  useEffect(() => {
    syncSession();

    const { data: { subscription } } = authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        logout();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        syncSession();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncSession, logout]);

  return <>{children}</>;
}
