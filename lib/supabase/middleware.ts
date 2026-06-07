import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the auth session
  const { data: { user } } = await supabase.auth.getUser();

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/home', '/workspace', '/onboarding', '/role-selection', '/profile', '/discover', '/jobs', '/investments', '/feed', '/applications', '/settings', '/startup'];
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // If user is authenticated, check onboarding status for core app routes
  if (user) {
    const isAppRoute = !['/login', '/role-selection', '/onboarding'].some(path => request.nextUrl.pathname.startsWith(path));
    
    if (isAppRoute) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, onboarding_complete')
        .eq('user_id', user.id)
        .single();
        
      if (!profile?.role) {
        const url = request.nextUrl.clone();
        url.pathname = '/role-selection';
        return NextResponse.redirect(url);
      } else if (!profile?.onboarding_complete) {
        const url = request.nextUrl.clone();
        url.pathname = '/onboarding';
        return NextResponse.redirect(url);
      }
    }

    // If user is authenticated and visits login, redirect to dashboard
    if (request.nextUrl.pathname === '/login') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
