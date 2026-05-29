import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, BriefcaseBusiness, Home, LayoutDashboard, Phone, Sparkles } from "lucide-react";
import { dashboardPathForRole, useAuth } from "@/hooks/use-auth";

const primaryLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chess", label: "Chess", icon: BookOpen },
  { to: "/career", label: "Career", icon: BriefcaseBusiness },
  { to: "/wellness", label: "Wellness", icon: Sparkles },
  { to: "/contact", label: "Contact", icon: Phone },
] as const;

export function BottomNavigation() {
  const { user, role } = useAuth();
  const location = useLocation();
  const dashboardHref = dashboardPathForRole(role);
  const links = user
    ? [
        ...primaryLinks.slice(0, 4),
        { to: dashboardHref, label: "Dashboard", icon: LayoutDashboard },
      ]
    : primaryLinks;

  return (
    <nav
      aria-label="Primary mobile navigation"
      className="bottom-app-nav fixed inset-x-0 bottom-0 z-[99998] px-3 pb-[calc(env(safe-area-inset-bottom)+8px)] pt-2 lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 rounded-[24px] border border-white/70 bg-white/88 p-1.5 shadow-[0_-12px_38px_-24px_rgba(15,23,42,0.42)] backdrop-blur-2xl">
        {links.map((item) => {
          const isActive =
            item.to === "/"
              ? location.pathname === "/"
              : location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.to}
              to={item.to}
              preload="intent"
              className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[18px] px-1 text-[11px] font-semibold transition-[background,color,transform] duration-200 active:scale-95 ${
                isActive ? "bg-primary text-primary-foreground shadow-soft" : "text-foreground/62"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={19} strokeWidth={isActive ? 2.6 : 2.1} />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
