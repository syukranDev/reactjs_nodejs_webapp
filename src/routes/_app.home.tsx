import { createFileRoute } from "@tanstack/react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/home")({
  component: HomePage,
});

function HomePage() {
  const { user, session } = useAuth();

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Home</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>Signed in as {user?.name || user?.id}.</p>
          <p>Role: {session?.role || "—"}</p>
          <p>Tenant: {session?.tenant_id || "—"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
