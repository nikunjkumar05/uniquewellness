import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 px-3 sm:px-6 pb-6">
      <div className="glass-strong mx-auto max-w-6xl rounded-3xl p-8 md:p-12 grid gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <img src={logo} alt="Unique Wellness Institute" className="h-12 w-auto" />
          <p className="mt-4 text-sm text-muted-foreground max-w-md leading-relaxed">
            Chess mastery, career mentorship, and wellness — all under one roof. International
            coaching for kids 5–16 and personalised guidance for students and professionals.
          </p>
        </div>
        <div>
          <h4 className="font-display text-lg mb-3">Explore</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/chess" className="text-muted-foreground hover:text-primary">
                Chess Coaching
              </Link>
            </li>
            <li>
              <Link to="/career" className="text-muted-foreground hover:text-primary">
                Career Guidance
              </Link>
            </li>
            <li>
              <Link to="/wellness" className="text-muted-foreground hover:text-primary">
                Wellness
              </Link>
            </li>
            <li>
              <Link to="/founder" className="text-muted-foreground hover:text-primary">
                Founder
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg mb-3">Contact</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Phone size={15} className="mt-0.5 text-primary" />
              <span suppressHydrationWarning>+91 9594373644</span>
            </li>
            <li className="flex items-start gap-2">
              <Mail size={15} className="mt-0.5 text-primary" />
              <span suppressHydrationWarning>info@uniquewellnessinstitute.com</span>
            </li>
            <li className="flex items-start gap-2">
              <MapPin size={15} className="mt-0.5 text-primary" />
              <span>Mumbai, India</span>
            </li>
          </ul>
        </div>
      </div>
      <p className="mt-6 text-center text-xs text-muted-foreground" suppressHydrationWarning>
        © {year} Unique Wellness Institute. All rights reserved.
      </p>
    </footer>
  );
}
