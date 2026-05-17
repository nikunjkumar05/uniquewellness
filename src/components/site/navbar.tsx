import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "@/assets/logo.png";
import { useAuth, dashboardPathForRole } from "@/hooks/use-auth";

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
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-3 sm:px-6 pt-3">
      <nav
        className={`glass-premium premium-panel mx-auto max-w-6xl rounded-2xl flex items-center justify-between px-4 sm:px-5 py-2.5 transition-all ${
          scrolled ? "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.15)]" : ""
        }`}
      >
        <Link to="/" className="flex items-center gap-2 hover-lift">
          <img src={logo} alt="Unique Wellness Institute" className="h-10 w-auto" />
        </Link>

        <ul className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="px-3 py-2 rounded-xl text-sm font-medium text-foreground/75 hover:text-foreground hover:bg-primary-soft/60 transition"
                activeProps={{
                  className:
                    "px-3 py-2 rounded-xl text-sm font-semibold text-foreground bg-primary-soft",
                }}
                activeOptions={{ exact: l.to === "/" }}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <Link
              to={dashboardPathForRole(role)}
              className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/75 hover:bg-primary-soft/60"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="rounded-xl px-3 py-2 text-sm font-medium text-foreground/75 hover:bg-primary-soft/60"
            >
              Sign in
            </Link>
          )}

          <Link
            to="/contact"
            className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover-lift shadow-soft"
          >
            Book Demo
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="lg:hidden p-2 rounded-xl hover:bg-primary-soft/60"
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {open && (
        <div className="lg:hidden mt-2 mx-auto max-w-6xl glass-premium premium-panel rounded-2xl p-3 space-y-1">
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

          {user ? (
            <Link
              to={dashboardPathForRole(role)}
              onClick={() => setOpen(false)}
              className="block text-center mt-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="block text-center mt-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold"
            >
              Sign in
            </Link>
          )}

          <Link
            to="/contact"
            onClick={() => setOpen(false)}
            className="block text-center mt-2 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 text-sm font-semibold"
          >
            Book Demo
          </Link>
        </div>
      )}
    </header>
  );
}
