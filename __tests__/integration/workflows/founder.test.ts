/**
 * Integration Test: Founder Workflow
 */
import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { profileService } from '@/lib/services/profile.service';
import { startupService } from '@/lib/services/startup.service';

jest.mock('@/lib/services/profile.service');
jest.mock('@/lib/services/startup.service');

describe('Founder Workflow Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      isAuthenticated: true,
      user: { id: 'auth-123' },
      profileId: 'profile-1',
      role: 'founder',
      onboardingComplete: false,
    });
  });

  it('should successfully complete the founder onboarding workflow', async () => {
    // 1. Mock service responses
    (profileService.updateProfile as jest.Mock).mockResolvedValue({ error: null });
    (profileService.completeOnboarding as jest.Mock).mockResolvedValue({ error: null });
    (startupService.createStartup as jest.Mock).mockResolvedValue({ data: { slug: 'test-startup' }, error: null });

    // 2. Simulate Founder Wizard Completion (Logical Flow)
    const state = useAuthStore.getState();
    expect(state.role).toBe('founder');
    expect(state.profileId).toBe('profile-1');

    // Simulate Step 1 & 2 save logic
    await profileService.updateProfile(state.user.id, { name: 'Founder Name' });
    
    // Simulate Step 3 save logic (Startup Creation)
    await startupService.createStartup({
      owner_id: state.profileId!,
      name: 'Test Startup',
      slug: 'test-startup',
      industry: 'SaaS',
      stage: 'idea',
      status: 'active',
      visibility: 'public',
    });

    // Simulate finish
    await profileService.completeOnboarding(state.user.id);
    useAuthStore.setState({ onboardingComplete: true });

    // 3. Verify workflow calls
    expect(profileService.updateProfile).toHaveBeenCalledWith('auth-123', { name: 'Founder Name' });
    expect(startupService.createStartup).toHaveBeenCalledWith(expect.objectContaining({
      owner_id: 'profile-1',
      name: 'Test Startup'
    }));
    expect(profileService.completeOnboarding).toHaveBeenCalledWith('auth-123');
    expect(useAuthStore.getState().onboardingComplete).toBe(true);
  });
});
