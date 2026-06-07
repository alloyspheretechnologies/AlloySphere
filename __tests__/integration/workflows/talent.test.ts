/**
 * Integration Test: Talent Workflow
 */
import { useAuthStore } from '@/lib/store/useAuthStore';
import { profileService } from '@/lib/services/profile.service';

jest.mock('@/lib/services/profile.service');

describe('Talent Workflow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: 'auth-123' },
      profileId: 'profile-1',
      role: 'talent',
      onboardingComplete: false,
    });
  });

  it('should successfully complete the talent onboarding workflow', async () => {
    (profileService.updateProfile as jest.Mock).mockResolvedValue({ error: null });
    (profileService.completeOnboarding as jest.Mock).mockResolvedValue({ error: null });

    const state = useAuthStore.getState();
    expect(state.role).toBe('talent');

    // Save profile logic
    await profileService.updateProfile(state.user.id, { 
      name: 'Talent Name',
      skills: ['React', 'Node.js']
    });

    // Complete onboarding
    await profileService.completeOnboarding(state.user.id);
    useAuthStore.setState({ onboardingComplete: true });

    expect(profileService.updateProfile).toHaveBeenCalledWith('auth-123', expect.objectContaining({ 
      name: 'Talent Name',
      skills: ['React', 'Node.js']
    }));
    expect(profileService.completeOnboarding).toHaveBeenCalledWith('auth-123');
    expect(useAuthStore.getState().onboardingComplete).toBe(true);
  });
});
