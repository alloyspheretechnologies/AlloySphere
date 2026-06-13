import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  // If a Supabase OAuth redirect lands on the root (e.g. missing callback URL in Supabase config)
  // catch the code and forward it to our callback route to properly finish auth.
  if (request.nextUrl.searchParams.has('code') && !request.nextUrl.pathname.startsWith('/auth/callback')) {
    const callbackUrl = request.nextUrl.clone();
    callbackUrl.pathname = '/auth/callback';
    return NextResponse.redirect(callbackUrl);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
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
  const protectedPaths = ['/dashboard', '/home', '/workspace', '/onboarding', '/profile', '/discover', '/jobs', '/investments', '/feed', '/applications', '/settings', '/startup'];
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
        
      if (!profile?.onboarding_complete) {
        // Since the DB schema defaults 'role' to 'talent', we use a cookie to track explicit selection.
        const hasSelectedRole = request.cookies.has('role_selected');
        
        if (!hasSelectedRole) {
          const url = request.nextUrl.clone();
          url.pathname = '/role-selection';
          return NextResponse.redirect(url);
        } else {
          const url = request.nextUrl.clone();
          url.pathname = '/onboarding';
          return NextResponse.redirect(url);
        }
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
