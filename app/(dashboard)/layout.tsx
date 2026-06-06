import { TopNav } from "@/components/workspace/top-nav";
import { SideNav } from "@/components/workspace/side-nav";
import { ThreeBackground } from "@/components/ui/three-background";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-transparent text-foreground">
      <ThreeBackground />
      <TopNav />
      <div className="flex flex-1 pt-20">
        <SideNav />
        <main className="flex-1 min-w-0 w-full md:ml-64 p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
