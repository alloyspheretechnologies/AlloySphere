import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100;
const ipRequests = new Map<string, { count: number; timestamp: number }>();

export async function middleware(request: NextRequest) {
  // Basic Rate Limiting
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();
  const reqData = ipRequests.get(ip);

  if (reqData && now - reqData.timestamp < RATE_LIMIT_WINDOW) {
    if (reqData.count >= MAX_REQUESTS) {
      return new Response('Too Many Requests', { status: 429 });
    }
    reqData.count++;
  } else {
    ipRequests.set(ip, { count: 1, timestamp: now });
  }

  // Clear old entries periodically to prevent memory leaks (simple version)
  if (Math.random() < 0.01) {
    for (const [key, val] of ipRequests.entries()) {
      if (now - val.timestamp > RATE_LIMIT_WINDOW) ipRequests.delete(key);
    }
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - API routes that don't need auth
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
