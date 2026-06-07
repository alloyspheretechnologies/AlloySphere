/**
 * Unit Tests: Profile Service
 */

const mockSelect = jest.fn().mockReturnThis();
const mockInsert = jest.fn().mockReturnThis();
const mockUpdate = jest.fn().mockReturnThis();
const mockDelete = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockSingle = jest.fn();
const mockFrom = jest.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  eq: mockEq,
}));

mockSelect.mockReturnValue({
  single: mockSingle,
  eq: mockEq,
});
mockUpdate.mockReturnValue({
  eq: mockEq,
  select: jest.fn().mockReturnValue({ single: mockSingle }),
});
mockEq.mockReturnValue({
  single: mockSingle,
  maybeSingle: mockSingle,
  eq: mockEq,
  select: mockSelect,
});

jest.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: () => ({
    from: mockFrom,
    auth: {
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'auth-123' } } })
    }
  }),
}));

import { profileService } from '@/lib/services/profile.service';

describe('profileService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentProfile', () => {
    it('should fetch the profile for the current auth user', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'profile-1', user_id: 'auth-123' }, error: null });

      const result = await profileService.getCurrentProfile();

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(result.data?.id).toBe('profile-1');
    });
  });

  describe('updateProfile', () => {
    it('should update the profile using the auth user_id', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: 'profile-1', name: 'New Name' }, error: null });

      const updates = { name: 'New Name' };
      await profileService.updateProfile('auth-123', updates);

      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith('user_id', 'auth-123');
    });
  });

  describe('setRole', () => {
    it('should set the role to founder', async () => {
      mockSingle.mockResolvedValueOnce({ data: { role: 'founder' }, error: null });

      await profileService.setRole('auth-123', 'founder');

      expect(mockUpdate).toHaveBeenCalledWith({ role: 'founder' });
      expect(mockEq).toHaveBeenCalledWith('user_id', 'auth-123');
    });
  });

  describe('completeOnboarding', () => {
    it('should set onboarding_complete to true', async () => {
      mockSingle.mockResolvedValueOnce({ data: { onboarding_complete: true }, error: null });

      await profileService.completeOnboarding('auth-123');

      expect(mockUpdate).toHaveBeenCalledWith({ onboarding_complete: true });
      expect(mockEq).toHaveBeenCalledWith('user_id', 'auth-123');
    });
  });
});
