import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, LogIn, LogOut, Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth, dashboardPathForRole } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/", label: "Home" },
  { to: "/chess", label: "Chess Coaching" },
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
      className="fixed top-0 inset-x-0 isolate px-3 sm:px-6 pt-3 pointer-events-none transition-[transform,opacity] duration-300 ease-out"
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
        className={`glass-premium premium-panel pointer-events-auto mx-auto max-w-6xl rounded-[28px] border border-white/60 bg-white/70 px-3 sm:px-4 py-2.5 shadow-[0_20px_60px_-24px_rgba(15,23,42,0.28)] backdrop-blur-3xl transition-all duration-300 ${
          scrolled ? "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)]" : ""
        }`}
      >
        <div className="grid grid-cols-[auto,1fr,auto] items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 min-w-0">
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
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-[11px] font-semibold text-foreground/80 transition hover:bg-white/95 sm:text-sm"
              >
                <LogIn size={14} />
                Sign In
              </Link>
            )}
          </div>

          <Link
            to="/"
            className="group mx-auto flex min-w-0 items-center justify-center gap-2 rounded-2xl px-2 py-1 transition-transform duration-500 hover:-translate-y-0.5"
          >
            <img
              src={logo}
              alt="Unique Wellness Institute"
              className="h-9 w-auto transition-transform duration-500 group-hover:scale-[1.04] group-hover:rotate-[-1deg] sm:h-10"
            />
          </Link>

          <div className="flex items-center justify-end gap-2">
            <ul className="hidden xl:flex items-center gap-1">
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

            {showDemoCta && (
              <Link
                to="/contact"
                className="hidden sm:inline-flex rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5"
              >
                Book Demo
              </Link>
            )}

            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-full bg-white/65 p-2.5 text-foreground/80 transition hover:bg-white/95 xl:hidden"
              aria-label="Menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div className="xl:hidden mt-2 mx-auto max-w-6xl glass-premium premium-panel rounded-[24px] p-3 space-y-1 pointer-events-auto">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 rounded-xl text-sm font-medium hover:bg-primary-soft/60"
              activeProps={{
                className: "block px-3 py-2 rounded-xl text-sm font-semibold bg-primary-soft",
              }}
              activeOptions={{ exact: l.to === "/" }}
            >
              {l.label}
            </Link>
          ))}

          {showDemoCta && (
            <Link
              to="/contact"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              Book Demo
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
