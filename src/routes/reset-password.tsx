import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Unique Wellness Institute" }] }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId: number | undefined;

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const queryParams = new URLSearchParams(window.location.search);
    const errorDescription =
      hashParams.get("error_description") ||
      queryParams.get("error_description") ||
      hashParams.get("error") ||
      queryParams.get("error");

    if (errorDescription) {
      setLinkError(errorDescription.replace(/\+/g, " "));
      return;
    }

    const recoveryCode = queryParams.get("code");

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if ((event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") && session?.user) {
        setReady(true);
        setLinkError(null);
      }
    });

    const getRecoverySession = recoveryCode
      ? supabase.auth.exchangeCodeForSession(recoveryCode)
      : supabase.auth.getSession();

    getRecoverySession.then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setLinkError(error.message);
        return;
      }
      if (data.session?.user) {
        setReady(true);
        setLinkError(null);
        return;
      }

      timeoutId = window.setTimeout(() => {
        if (!mounted) return;
        setLinkError("This reset link is invalid or expired. Please request a new one.");
      }, 1200);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!ready) {
      toast.error("Open the reset link from your email before setting a new password");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated");
    navigate({ to: "/login" });
  }

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-16 max-w-md">
        <div className="glass-strong rounded-3xl p-8">
          <h1 className="text-3xl mb-1">Set new password</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {ready ? "Enter your new password below." : "Verifying your password reset link..."}
          </p>
          {linkError ? (
            <div className="space-y-4">
              <p className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {linkError}
              </p>
              <Button
                type="button"
                className="w-full"
                onClick={() => navigate({ to: "/forgot-password" })}
              >
                Request a new link
              </Button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  minLength={8}
                  required
                  disabled={!ready || busy}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" disabled={!ready || busy}>
                {busy ? "Updating..." : "Update password"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </PageShell>
  );
}
