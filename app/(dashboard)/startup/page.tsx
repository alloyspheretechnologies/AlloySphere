import { redirect } from "next/navigation";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function StartupRedirectPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login");
  }

  // Resolve auth user.id → profiles.id (these are different UUIDs!)
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("user_id", session.user.id)
    .single();

  if (!profile) {
    redirect("/startup/create");
  }

  // Find the startup owned by this profile
  const { data: startups } = await supabase
    .from("startups")
    .select("slug")
    .eq("owner_id", profile.id)
    .limit(1)
    .single();

  if (startups && startups.slug) {
    redirect(`/startup/${startups.slug}`);
  } else {
    // If they don't own a startup, maybe they are a member of one?
    const { data: membership } = await supabase
      .from("startup_members")
      .select("startup:startups(slug)")
      .eq("user_id", profile.id)
      .limit(1)
      .single();
    const startupInfo: any = Array.isArray(membership?.startup) ? membership.startup[0] : membership?.startup;
    if (startupInfo && startupInfo.slug) {
      redirect(`/startup/${startupInfo.slug}`);
    } else {
      // If no startup found, redirect to create startup
      redirect("/startup/create");
    }
  }
}
