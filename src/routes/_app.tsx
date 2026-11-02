import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppTopbar } from "@/components/layout/app-topbar";
import { PageFadeIn } from "@/components/shared/page-fade-in";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { loading, isAuthenticated, needsTenant } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      void navigate({ to: "/login" });
      return;
    }
    if (needsTenant) {
      void navigate({ to: "/select-tenant" });
    }
  }, [loading, isAuthenticated, needsTenant, navigate]);

  if (loading || !isAuthenticated || needsTenant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background text-sm text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p>Checking session…</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <AppTopbar />
          <main className="flex flex-1 flex-col">
            <PageFadeIn key={pathname}>
              <Outlet />
            </PageFadeIn>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
