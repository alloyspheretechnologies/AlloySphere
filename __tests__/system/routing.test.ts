/**
 * System Test: Routing
 * 
 * Verifies that the platform's core routes and middleware logic
 * correctly handle authentication, onboarding, and role states.
 */
jest.mock('next/server', () => {
  class MockNextRequest {
    url: string;
    nextUrl: any;
    constructor(url: string) {
      this.url = url;
      const parsedUrl = new URL(url);
      this.nextUrl = {
        pathname: parsedUrl.pathname,
        clone: () => new URL(url),
      };
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: {
      redirect: jest.fn().mockImplementation((url: URL) => ({
        headers: { get: (key: string) => key === 'location' ? url.toString() : null },
      })),
      next: jest.fn().mockImplementation(() => ({
        headers: { get: () => null },
      })),
    },
  };
});

import { NextRequest } from 'next/server';
import { updateSession as middleware } from '@/lib/supabase/middleware';

// Mock Supabase SSR
jest.mock('@supabase/ssr', () => ({
  createServerClient: jest.fn().mockImplementation(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: { id: 'auth-123' } },
        error: null,
      }),
    },
  })),
}));

describe('System Routing & Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (pathname: string) => {
    return new NextRequest(new URL(`http://localhost${pathname}`));
  };

  it('should redirect unauthenticated users to /login for protected routes', async () => {
    // Override the mock for this specific test
    const { createServerClient } = require('@supabase/ssr');
    createServerClient.mockImplementationOnce(() => ({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    }));

    const req = createRequest('/dashboard');
    const res = await middleware(req);
    
    expect(res.headers.get('location')).toContain('/login');
  });

  it('should allow unauthenticated access to public routes', async () => {
    const { createServerClient } = require('@supabase/ssr');
    createServerClient.mockImplementationOnce(() => ({
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: null }),
      },
    }));

    const req = createRequest('/login');
    const res = await middleware(req);
    
    // Should not redirect
    expect(res.headers.get('location')).toBeNull();
  });

  it('should redirect authenticated users from /login to /dashboard', async () => {
    const req = createRequest('/login');
    const res = await middleware(req);
    
    expect(res.headers.get('location')).toContain('/dashboard');
  });
});
