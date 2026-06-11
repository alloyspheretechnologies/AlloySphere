import { createSupabaseServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/role-selection';

  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if profile exists and has role/onboarding
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const cookieStore = await cookies();
        const pendingRole = cookieStore.get('pending_role')?.value;

        // If a role was selected pre-auth, update the profile to override the default "talent"
        if (pendingRole) {
          await supabase.from('profiles').update({ role: pendingRole }).eq('user_id', user.id);
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('role, onboarding_complete')
          .eq('user_id', user.id)
          .single();

        let redirectUrl = `${origin}${next}`;

        if (profile?.onboarding_complete) {
          redirectUrl = `${origin}/dashboard`;
        } else if (pendingRole || (profile?.role && profile.role !== 'talent')) {
          redirectUrl = `${origin}/onboarding`;
        }

        const response = NextResponse.redirect(redirectUrl);

        // Clear pending role and set role_selected for middleware
        if (pendingRole) {
          response.cookies.set('pending_role', '', { maxAge: 0, path: '/' });
          response.cookies.set('role_selected', 'true', { path: '/', maxAge: 31536000 });
        }

        return response;
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
