import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, LockKeyhole, LogIn, User } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import flowLogo from "@/assets/flow-logo.svg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Login" }],
  }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { login, loading, isAuthenticated, needsTenant } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    void navigate({ to: needsTenant ? "/select-tenant" : "/home" });
  }, [loading, isAuthenticated, needsTenant, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!username.trim() || !password) {
      toast.error("Please enter username and password");
      return;
    }

    setSubmitting(true);
    try {
      const result = await login(username.trim(), password);
      toast.success(`Welcome${result.user?.name ? `, ${result.user.name}` : ""}`);
      void navigate({ to: result.needsTenant ? "/select-tenant" : "/home" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="inv-enter-forward flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_oklch(0.93_0.03_230),_oklch(0.79_0.09_238)_38%,_oklch(0.3_0.08_255)_100%)] px-4 py-10">
      <Card className="w-full max-w-md border-white/40 bg-white/95 shadow-xl">
        <CardContent className="space-y-6 p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <img src={flowLogo} alt="" className="h-12 w-12" />
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
              <p className="mt-1 text-sm text-muted-foreground">Use your account to continue.</p>
            </div>
          </div>
          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  autoComplete="username"
                  className="pl-9"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  className="pl-9"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </div>
            <Button className="w-full" type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
              Sign in
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
