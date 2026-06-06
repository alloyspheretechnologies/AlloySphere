import { create } from "zustand";
import { startupService } from "../services/startup.service";
import { workspaceService } from "../services/workspace.service";
import type { Startup, Workspace } from "../types";

interface WorkspaceState {
  startup: Startup | null;
  workspace: Workspace | null;
  members: any[];
  userRole: string | null; // 'owner' | 'admin' | 'member' | 'viewer'
  loading: boolean;
  error: string | null;

  loadWorkspace: (profileId: string) => Promise<void>;
  loadWorkspaceByStartupId: (startupId: string, profileId: string) => Promise<void>;
  setStartup: (startup: Startup | null) => void;
  reset: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
  startup: null,
  workspace: null,
  members: [],
  userRole: null,
  loading: true,
  error: null,

  loadWorkspace: async (profileId: string) => {
    set({ loading: true, error: null });
    try {
      // Find the user's first startup (owner or member)
      const { data: startups } = await startupService.listStartups({ pageSize: 50 });
      const myStartup = startups?.find((s) => s.owner_id === profileId) || startups?.[0];

      if (!myStartup) {
        set({ loading: false, startup: null, workspace: null });
        return;
      }

      await get().loadWorkspaceByStartupId(myStartup.id, profileId);
    } catch {
      set({ loading: false, error: "Failed to load workspace" });
    }
  },

  loadWorkspaceByStartupId: async (startupId: string, profileId: string) => {
    set({ loading: true, error: null });
    try {
      const [startupRes, workspaceRes, membersRes] = await Promise.all([
        startupService.getStartup(startupId),
        workspaceService.getWorkspaceByStartup(startupId),
        startupService.getMembers(startupId),
      ]);

      const members = membersRes.data || [];
      const currentMember = members.find((m: any) => m.user_id === profileId);
      const userRole = currentMember?.role || (startupRes.data?.owner_id === profileId ? "owner" : null);

      set({
        startup: startupRes.data,
        workspace: workspaceRes.data,
        members,
        userRole,
        loading: false,
      });
    } catch {
      set({ loading: false, error: "Failed to load workspace" });
    }
  },

  setStartup: (startup) => set({ startup }),

  reset: () =>
    set({
      startup: null,
      workspace: null,
      members: [],
      userRole: null,
      loading: true,
      error: null,
    }),
}));
