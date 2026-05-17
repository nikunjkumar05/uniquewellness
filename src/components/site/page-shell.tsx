import type { ReactNode } from "react";
import { Navbar } from "./navbar";
import { Footer } from "./footer";
import { useAuth } from "@/hooks/use-auth";

export function PageShell({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      {/* ambient blobs */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-primary-soft/70 blur-3xl animate-blob" />
        <div
          className="absolute top-1/3 -right-32 h-[480px] w-[480px] rounded-full bg-primary-light/40 blur-3xl animate-blob"
          style={{ animationDelay: "-6s" }}
        />
        <div
          className="absolute bottom-0 left-1/4 h-[380px] w-[380px] rounded-full bg-warm/15 blur-3xl animate-blob"
          style={{ animationDelay: "-12s" }}
        />
        <div className="absolute left-1/2 top-24 h-[180px] w-[180px] -translate-x-1/2 rounded-full bg-white/40 blur-3xl animate-float" />
      </div>
      {!user && <Navbar />}
      <main className={user ? "pt-6" : "pt-24"}>{children}</main>
      <Footer />
    </div>
  );
}
