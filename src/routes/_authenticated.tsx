import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/page-shell";
import { Button } from "@/components/ui/button";
import {
  Gamepad2,
  Globe,
  LayoutDashboard,
  LogOut,
  UserRound,
  Video,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
});

type AppPath =
  | "/"
  | "/admin"
  | "/coach"
  | "/student"
  | "/live-room"
  | "/settings"
  | "/practice-lab";

type NavItem = { to: AppPath; label: string; icon: ReactNode };

/** Icon-only, role-dependent app navigation. */
function itemsForRole(role: AppRole | null): NavItem[] {
  const dashboard: AppPath =
    role === "admin" ? "/admin" : role === "coach" ? "/coach" : "/student";
  const items: NavItem[] = [
    { to: dashboard, label: "Dashboard", icon: <LayoutDashboard size={19} /> },
  ];
  // Chess practice tools live with the learner role — students are the players.
  if (role === "student") {
    items.push({ to: "/practice-lab", label: "Chess practice", icon: <Gamepad2 size={19} /> });
  }
  items.push(
    { to: "/live-room", label: "Live classes", icon: <Video size={19} /> },
    { to: "/settings", label: "Profile", icon: <UserRound size={19} /> },
  );
  return items;
}

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

  const items = itemsForRole(role);
  const initial = (user?.email || "?").charAt(0).toUpperCase();

  return (
    <PageShell showNavbar={false} showFooter={false}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-white/60 bg-white/70 p-2.5 shadow-sm backdrop-blur">
          <nav className="flex items-center gap-1" aria-label="App navigation">
            {items.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  title={item.label}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl transition ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/70 hover:bg-primary-soft/60 hover:text-foreground"
                  }`}
                >
                  {item.icon}
                </Link>
              );
            })}
            <span className="mx-1 hidden h-6 w-px bg-border sm:inline-block" aria-hidden />
            <Link
              to="/"
              title="View public site"
              aria-label="View public site"
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-foreground/70 transition hover:bg-primary-soft/60 hover:text-foreground"
            >
              <Globe size={19} />
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 sm:inline-flex">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                {initial}
              </span>
              <span className="text-xs text-muted-foreground">
                <span className="block max-w-40 truncate font-semibold text-foreground">
                  {user?.email}
                </span>
                <span className="uppercase text-primary">{role}</span>
              </span>
            </span>
            <Button
              size="icon"
              variant="outline"
              title="Sign out"
              aria-label="Sign out"
              className="rounded-2xl"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate({ to: "/login" });
              }}
            >
              <LogOut size={17} />
            </Button>
          </div>
        </div>
        <Outlet />
        <footer className="mt-10 border-t border-border/60 pt-4 text-center text-xs text-muted-foreground">
          Unique Wellness Institute{role ? ` · ${role} workspace` : ""}
        </footer>
      </div>
    </PageShell>
  );
}
