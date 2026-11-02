import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/select-tenant")({
  component: SelectTenantPage,
});

function SelectTenantPage() {
  const navigate = useNavigate();
  const { loading, isAuthenticated, needsTenant, tenants, setTenant } = useAuth();
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      void navigate({ to: "/login" });
      return;
    }
    if (!needsTenant) {
      void navigate({ to: "/home" });
    }
  }, [loading, isAuthenticated, needsTenant, navigate]);

  async function choose(tenantId: string) {
    setPendingId(tenantId);
    try {
      await setTenant(tenantId);
      void navigate({ to: "/home" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not select tenant");
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="inv-enter-forward flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Select tenant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {tenants.map((tenant) => (
            <Button
              key={tenant.id}
              variant="outline"
              className="w-full justify-start"
              disabled={pendingId !== null}
              onClick={() => void choose(tenant.id)}
            >
              {tenant.name || tenant.id}
            </Button>
          ))}
          {tenants.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tenant is assigned to this user.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
