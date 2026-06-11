import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
  try {
    // 1. Get the current authenticated user from their session cookies
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Initialize the admin client with the SERVICE_ROLE_KEY
    // We use the raw @supabase/supabase-js client because we don't need cookie management for admin tasks
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // 3. Delete the user entirely from the auth.users table
    // This will cascade and delete the user's profile and other data automatically
    // due to the ON DELETE CASCADE constraint on the database.
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user.id);

    if (error) {
      console.error("Error deleting user from auth:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4. Sign out the user session as well
    await supabase.auth.signOut();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
