import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, dashboardPathForRole } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/page-shell";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

function AuthLayout() {
  const { session, role, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  // Role gate: ensure path matches role
  useEffect(() => {
    if (loading || !role) return;
    const path = location.pathname;
    if (role === "student" && (path.startsWith("/admin") || path.startsWith("/coach"))) {
      navigate({ to: "/student" });
    } else if (role === "coach" && path.startsWith("/admin")) {
      navigate({ to: "/coach" });
    }
  }, [role, loading, location.pathname, navigate]);

  if (loading || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <PageShell>
      <div className="container mx-auto px-4 py-8">
        <div className="glass rounded-3xl p-3 mb-6 flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-1 text-sm flex-wrap">
            {role === "admin" && <DashLink to="/admin" label="Admin" />}
            {role === "admin" && <DashLink to="/content" label="Content" />}
            {role === "coach" && <DashLink to="/coach" label="Coach" />}
            {role === "student" && <DashLink to="/student" label="My Dashboard" />}
            <DashLink to="/live-room" label="Live Classes" />
            <DashLink to="/settings" label="Profile" />
          </nav>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {user?.email} · <span className="text-primary uppercase">{role}</span>
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/login" });
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
        <Outlet />
      </div>
    </PageShell>
  );
}

function DashLink({ to, label, hide }: { to: string; label: string; hide?: boolean }) {
  if (hide) return null;
  return (
    <Link
      to={to}
      className="px-3 py-2 rounded-xl font-medium text-foreground/75 hover:bg-primary-soft/60"
      activeProps={{
        className: "px-3 py-2 rounded-xl font-semibold bg-primary-soft text-foreground",
      }}
    >
      {label}
    </Link>
  );
}

export { dashboardPathForRole };
