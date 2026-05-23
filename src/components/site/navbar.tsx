import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, LogIn, LogOut, Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth, dashboardPathForRole } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/", label: "Home" },
  { to: "/chess", label: "Chess Coaching" },
  { to: "/practice-lab", label: "Practice Lab" },
  { to: "/career", label: "Career Guidance" },
  { to: "/wellness", label: "Wellness" },
  { to: "/founder", label: "Founder" },
  { to: "/contact", label: "Contact" },
];

export function Navbar() {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);
  const initialized = useRef(false);

  const showDemoCta = !user;
  const dashboardHref = dashboardPathForRole(role);

  async function signOut() {
    await supabase.auth.signOut();
    setOpen(false);
    navigate({ to: "/" });
  }

  useEffect(() => {
    const onScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 8);

      if (!initialized.current) {
        initialized.current = true;
        lastScrollY.current = current;
        setHidden(false);
        return;
      }

      if (open) {
        setHidden(false);
        lastScrollY.current = current;
        return;
      }

      const scrollingDown = current > lastScrollY.current + 4;
      const nearTop = current < 56;
      setHidden(scrollingDown && !nearTop);
      lastScrollY.current = current;
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  useEffect(() => {
    if (open) setHidden(false);
  }, [open]);

  return (
    <header
      className="fixed top-0 inset-x-0 isolate px-3 sm:px-6 pt-2 sm:pt-3 pointer-events-none transition-[transform,opacity] duration-300 ease-out"
      style={{
        zIndex: 99999,
        willChange: "transform",
        transform: hidden ? "translate3d(0,-115%,0)" : "translate3d(0,0,0)",
        opacity: hidden ? 0 : 1,
        WebkitTransform: hidden ? "translate3d(0,-115%,0)" : "translate3d(0,0,0)",
        backfaceVisibility: "hidden",
      }}
    >
      <nav
        className={`glass-premium premium-panel pointer-events-auto mx-auto w-full max-w-6xl rounded-2xl border border-white/60 bg-white/70 px-4 sm:px-6 py-3 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.28)] backdrop-blur-3xl transition-all duration-300 ${
          scrolled ? "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)]" : ""
        }`}
      >
        <div className="flex items-center gap-3 lg:gap-4">
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-2 rounded-2xl px-1 py-1 transition-transform duration-500 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            aria-label="Unique Wellness Institute — Home"
          >
            <img
              src={logo}
              alt="Unique Wellness Institute Logo"
              className="h-9 w-auto transition-transform duration-500 group-hover:scale-[1.04] group-hover:rotate-[-1deg] sm:h-10"
            />
          </Link>

          <div className="hidden flex-1 items-center justify-center lg:flex">
            <ul className="flex items-center gap-1 rounded-full border border-white/60 bg-white/55 p-1 shadow-sm backdrop-blur-sm">
              {links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="rounded-full px-3 py-2 text-sm font-medium text-foreground/72 transition hover:bg-white/70 hover:text-foreground"
                    activeProps={{
                      className:
                        "rounded-full px-3 py-2 text-sm font-semibold text-foreground bg-white/85 shadow-sm",
                    }}
                    activeOptions={{ exact: l.to === "/" }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 lg:flex">
              {user ? (
                <>
                  <Link
                    to={dashboardHref}
                    className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-2 text-[11px] font-semibold text-foreground transition hover:bg-primary/15 sm:text-sm"
                  >
                    <LayoutDashboard size={14} />
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={signOut}
                    className="inline-flex items-center gap-2 rounded-full bg-white/65 px-3 py-2 text-[11px] font-semibold text-foreground/80 transition hover:bg-white/90 sm:text-sm"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-[11px] font-semibold text-foreground/80 transition hover:bg-white/95 sm:text-sm"
                  >
                    <LogIn size={14} />
                    Sign In
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5"
                  >
                    Book Demo
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-full bg-white/65 p-2.5 text-foreground/80 transition hover:bg-white/95 lg:hidden"
              aria-label="Menu"
              aria-expanded={open}
              aria-controls="mobile-navigation"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div
          id="mobile-navigation"
          className="lg:hidden mt-2 mx-auto w-full max-w-6xl glass-premium premium-panel rounded-2xl p-3 pointer-events-auto"
        >
          <div className="space-y-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="block rounded-xl px-3 py-2 text-sm font-medium hover:bg-primary-soft/60"
                activeProps={{
                  className: "block rounded-xl px-3 py-2 text-sm font-semibold bg-primary-soft",
                }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="mt-3 grid gap-2 border-t border-white/50 pt-3">
            {user ? (
              <>
                <Link
                  to={dashboardHref}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-3 text-sm font-semibold text-foreground"
                >
                  <LayoutDashboard size={14} />
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={signOut}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/70 px-4 py-3 text-sm font-semibold text-foreground/80"
                >
                  <LogOut size={14} />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/70 px-4 py-3 text-sm font-semibold text-foreground/80"
                >
                  <LogIn size={14} />
                  Sign In
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setOpen(false)}
                  className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
                >
                  Book Demo
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
