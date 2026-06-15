import { TopNav } from "@/components/workspace/top-nav";
import { SideNav } from "@/components/workspace/side-nav";
import { ThreeBackground } from "@/components/ui/three-background";
import { MobileBottomNav } from "@/components/workspace/mobile-bottom-nav";
import { MobileDrawer } from "@/components/workspace/mobile-drawer";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
    profile = data;
  }

  return (
    <div className="flex flex-col min-h-screen bg-transparent text-foreground">
      <ThreeBackground />
      <TopNav />
      <div className="flex flex-1 pt-14 md:pt-20 pb-16 md:pb-0"> {/* Reduced pt on mobile for smaller top nav, pb for bottom nav */}
        <SideNav />
        {/* Responsive main content area */}
        <main className="flex-1 min-w-0 w-full md:ml-64 p-3 sm:p-4 lg:p-8">
          {children}
        </main>
      </div>
      
      {/* Mobile only components */}
      <MobileBottomNav role={profile?.role || null} />
      <MobileDrawer profile={profile} />
    </div>
  );
}
