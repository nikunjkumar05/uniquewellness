import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
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
    <PageShell showNavbar={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="glass rounded-3xl p-3 mb-6 flex flex-wrap items-center justify-between gap-3">
          <nav className="flex items-center gap-1 text-sm flex-wrap">
            {role === "admin" && location.pathname.startsWith("/admin") ? (
              // Combined admin + admin-tabs nav when inside admin
              (() => {
                const params = new URLSearchParams(location.search);
                const activeTab = params.get("tab") || "users";
                const isAdminActive = location.pathname === "/admin" && !location.search;
                const isContentActive = location.pathname === "/content";
                const isSettingsActive = location.pathname === "/settings";
                const isTabActive = (tab: string) =>
                  location.pathname.startsWith("/admin") && activeTab === tab;
                const linkClass =
                  "px-3 py-2 rounded-xl font-medium text-foreground/75 hover:bg-primary-soft/60";
                const activeClass =
                  "px-3 py-2 rounded-xl font-semibold bg-primary-soft text-foreground";
                const adminTabLink = (tab: string, label: string) => (
                  <Link
                    to="/admin"
                    search={{ tab }}
                    className={isTabActive(tab) ? activeClass : linkClass}
                  >
                    {label}
                  </Link>
                );

                return (
                  <>
                    <Link to="/" className={location.pathname === "/" ? activeClass : linkClass}>
                      Home
                    </Link>
                    <Link
                      to="/admin"
                      className={isAdminActive ? activeClass : linkClass}
                    >
                      Admin
                    </Link>
                    <Link
                      to="/content"
                      className={isContentActive ? activeClass : linkClass}
                    >
                      Content
                    </Link>
                    {/* global Live Classes link removed (admin view uses admin tab) */}
                    <Link
                      to="/settings"
                      className={isSettingsActive ? activeClass : linkClass}
                    >
                      Profile
                    </Link>

                    {adminTabLink("users", "Users")}
                    {adminTabLink("students", "Add Student")}
                    {adminTabLink("courses", "Courses")}
                    {adminTabLink("classes", "Live Classes")}
                    {adminTabLink("account", "Account")}
                    {adminTabLink("enrollments", "Enrollments")}
                    {adminTabLink("fees", "Fees")}
                    {adminTabLink("demos", "Demo Bookings")}
                    {adminTabLink("password-requests", "Password Requests")}
                  </>
                );
              })()
            ) : (
              <>
                {role === "admin" && <DashLink to="/admin" label="Admin" />}
                {role === "admin" && <DashLink to="/content" label="Content" />}
                {role === "coach" && <DashLink to="/coach" label="Coach" />}
                {role === "student" && <DashLink to="/student" label="My Dashboard" />}
                <DashLink to="/live-room" label="Live Classes" />
                <DashLink to="/settings" label="Profile" />
              </>
            )}
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

function DashLink({
  to,
  label,
  hide,
}: {
  to: "/" | "/admin" | "/content" | "/coach" | "/student" | "/live-room" | "/settings";
  label: string;
  hide?: boolean;
}) {
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

