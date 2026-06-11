'use client';

import { useEffect, Suspense } from 'react';
import { analyticsService } from '@/lib/services/analytics.service';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { usePathname, useSearchParams } from 'next/navigation';

function PostHogPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Track pageviews natively (since autocapture is disabled for explicit control, but pageviews are generally safe)
  useEffect(() => {
    if (pathname && typeof window !== 'undefined') {
      let url = window.origin + pathname;
      if (searchParams?.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      // Note: posthog-js automatically handles capture_pageview if configured,
      // but we can enforce strict page tracking here if needed.
    }
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();

  useEffect(() => {
    // Initialize PostHog
    analyticsService.init();
  }, []);

  useEffect(() => {
    // Identify user when auth state changes
    if (user) {
      analyticsService.identify(user.id, {
        email: user.email,
        name: user.user_metadata?.full_name,
      });
    } else {
      analyticsService.reset();
    }
  }, [user]);

  return (
    <>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </>
  );
}
