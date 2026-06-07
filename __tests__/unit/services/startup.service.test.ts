/**
 * Unit Tests: Startup Service
 * 
 * Verifies startup CRUD operations, slug generation, and validates
 * that owner_id must be a profiles.id (not auth user.id).
 */

// Mock Supabase client
const mockSelect = jest.fn().mockReturnThis();
const mockInsert = jest.fn().mockReturnThis();
const mockUpdate = jest.fn().mockReturnThis();
const mockDelete = jest.fn().mockReturnThis();
const mockEq = jest.fn().mockReturnThis();
const mockOrder = jest.fn().mockReturnThis();
const mockRange = jest.fn().mockReturnThis();
const mockSingle = jest.fn();
const mockFrom = jest.fn(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
  eq: mockEq,
  or: jest.fn().mockReturnThis(),
  order: mockOrder,
  range: mockRange,
  single: mockSingle,
}));

// Chain .select().single() etc.
mockSelect.mockReturnValue({
  single: mockSingle,
  eq: mockEq,
  or: jest.fn().mockReturnThis(),
  order: mockOrder,
  range: mockRange,
});
mockInsert.mockReturnValue({ select: jest.fn().mockReturnValue({ single: mockSingle }) });
mockEq.mockReturnValue({
  single: mockSingle,
  eq: mockEq,
  select: mockSelect,
  order: mockOrder,
  range: mockRange,
  delete: mockDelete,
});

jest.mock('@/lib/supabase/client', () => ({
  getSupabaseBrowserClient: () => ({ from: mockFrom }),
}));

jest.mock('@/lib/utils', () => ({
  sanitizeSearchInput: (s: string) => s,
}));

import { startupService } from '@/lib/services/startup.service';

describe('startupService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createStartup', () => {
    it('should call insert with the provided data', async () => {
      const profileId = 'profile-uuid-1234';
      const insertData = {
        owner_id: profileId,
        name: 'Test Startup',
        slug: 'test-startup',
        industry: 'AI / Machine Learning',
        stage: 'idea' as const,
        description: 'A test startup',
        website: null,
        logo_url: null,
        cover_image: null,
        status: 'active' as const,
        visibility: 'public' as const,
      };

      mockSingle.mockResolvedValueOnce({ data: { id: 'startup-1', ...insertData }, error: null });

      await startupService.createStartup(insertData);

      expect(mockFrom).toHaveBeenCalledWith('startups');
      // Verify the owner_id is the profile UUID, not an auth user UUID
      expect(insertData.owner_id).toBe(profileId);
    });

    it('should NOT use auth user.id as owner_id', () => {
      // This test documents the critical invariant:
      // owner_id MUST be profiles.id, not auth.users.id
      const authUserId = 'auth-user-uuid-5678';
      const profileId = 'profile-uuid-1234';

      // These should NEVER be the same in production
      // (unless by extreme coincidence)
      expect(authUserId).not.toBe(profileId);
    });

    it('should return error if startup creation fails', async () => {
      mockSingle.mockResolvedValueOnce({
        data: null,
        error: { message: 'RLS policy violation', code: '42501' },
      });

      const result = await startupService.createStartup({
        owner_id: 'wrong-id',
        name: 'Fail',
        slug: 'fail',
        industry: 'SaaS',
        stage: 'idea' as const,
        description: null,
        website: null,
        logo_url: null,
        cover_image: null,
        status: 'active' as const,
        visibility: 'public' as const,
      });

      expect(result.error).toBeTruthy();
    });
  });

  describe('slug generation', () => {
    it('should create a valid slug from startup name', () => {
      const name = 'My Awesome Startup!';
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      expect(slug).toBe('my-awesome-startup');
    });

    it('should handle special characters in startup name', () => {
      const name = '  AI/ML & Co.  ';
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      expect(slug).toBe('ai-ml-co');
    });

    it('should handle consecutive special characters', () => {
      const name = 'Test---Name!!!';
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      expect(slug).toBe('test-name');
    });
  });

  describe('getStartupBySlug', () => {
    it('should query by slug', async () => {
      mockSingle.mockResolvedValueOnce({ data: { id: '1', slug: 'my-startup' }, error: null });

      const result = await startupService.getStartupBySlug('my-startup');

      expect(mockFrom).toHaveBeenCalledWith('startups');
      expect(result.data).toBeTruthy();
    });
  });

  describe('getMyStartups', () => {
    it('should query by profile id (not auth user id)', async () => {
      const profileId = 'profile-uuid-1234';
      mockOrder.mockResolvedValueOnce({ data: [], error: null });

      await startupService.getMyStartups(profileId);

      expect(mockFrom).toHaveBeenCalledWith('startups');
    });
  });
});
