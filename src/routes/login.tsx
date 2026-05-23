import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import ForgotPasswordRequest from "@/components/site/forgot-password-request";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { dashboardPathForRole } from "@/hooks/use-auth";
import { PageShell } from "@/components/site/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — Unique Wellness Institute" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function redirectByRole(userId: string) {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const roles = (data ?? []).map((r) => r.role as "admin" | "coach" | "student");
    const role = roles.includes("admin") ? "admin" : roles.includes("coach") ? "coach" : "student";
    navigate({ to: dashboardPathForRole(role) });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) return toast.error(error.message);
    if (data.user) {
      toast.success("Welcome back");
      await redirectByRole(data.user.id);
    }
  }

  

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-16 max-w-md">
        <div className="glass-strong rounded-3xl p-8">
          <h1 className="text-3xl text-foreground mb-1">Sign in</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Welcome back to Unique Wellness Institute.
          </p>

          

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <div className="flex items-center justify-between mt-5 text-sm">
            <ForgotPasswordRequest />
            <Link to="/signup" className="text-primary hover:underline">
              Create account
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
