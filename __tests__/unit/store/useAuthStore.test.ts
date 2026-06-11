/**
 * Unit Tests: useAuthStore
 */

// Mock services
const mockSignOut = jest.fn().mockResolvedValue(true);
const mockGetUser = jest.fn().mockResolvedValue({ user: { id: 'auth-123' } });
jest.mock('@/lib/services/auth.service', () => ({
  authService: {
    signOut: () => mockSignOut(),
    getUser: () => mockGetUser(),
  }
}));

const mockGetCurrentProfile = jest.fn().mockResolvedValue({ 
  data: { id: 'profile-1', role: 'founder', onboarding_complete: true } 
});
jest.mock('@/lib/services/profile.service', () => ({
  profileService: {
    getCurrentProfile: () => mockGetCurrentProfile(),
  }
}));

import { useAuthStore } from '@/lib/store/useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      isAuthenticated: false,
      user: null,
      profileId: null,
      role: null,
      onboardingComplete: false,
      loading: true,
    });
  });

  describe('syncSession', () => {
    it('should fetch user and profile and populate the store', async () => {
      await useAuthStore.getState().syncSession();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
      expect(state.user?.id).toBe('auth-123');
      expect(state.profileId).toBe('profile-1');
      expect(state.role).toBe('founder');
      expect(state.onboardingComplete).toBe(true);
      expect(state.loading).toBe(false);
    });

    it('should clear store if no user is found', async () => {
      mockGetUser.mockResolvedValueOnce({ user: null });
      
      await useAuthStore.getState().syncSession();

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.profileId).toBeNull();
      expect(state.loading).toBe(false);
    });
  });

  describe('logout', () => {
    let consoleErrorSpy: jest.SpyInstance;

    beforeAll(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation((msg) => {
        if (msg && msg.toString().includes('Not implemented: navigation')) return;
        if (typeof msg === 'object' && msg.message && msg.message.includes('Not implemented: navigation')) return;
        // Output other errors normally
        console.warn(msg); // using warn to not trigger the spy again if we used error
      });
    });

    afterAll(() => {
      consoleErrorSpy.mockRestore();
    });

    it('should prevent re-entrancy if already logged out', async () => {
      useAuthStore.setState({ isAuthenticated: false, user: null });
      
      await useAuthStore.getState().logout();

      expect(mockSignOut).not.toHaveBeenCalled();
    });

    it('should clear the store and call authService.signOut', async () => {
      useAuthStore.setState({ 
        isAuthenticated: true, 
        user: { id: 'auth-123' },
        profileId: 'profile-1',
        role: 'founder'
      });
      
      try {
        await useAuthStore.getState().logout();
      } catch (e) {
        // Ignore jsdom navigation error
      }

      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.profileId).toBeNull();
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});
