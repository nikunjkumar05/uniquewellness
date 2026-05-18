import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — Unique Wellness Institute" }] }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (phone && !/^[+\d\s-]{7,20}$/.test(phone)) return toast.error("Enter a valid mobile number");
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/auth-callback",
        data: { full_name: name, phone },
      },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — you can sign in now");
    navigate({ to: "/login" });
  }

  

  return (
    <PageShell>
      <section className="container mx-auto px-4 py-16 max-w-md">
        <div className="glass-premium rounded-3xl p-7 sm:p-8">
          <h1 className="text-4xl text-foreground mb-1">Create your account</h1>
          <p className="text-sm text-muted-foreground mb-6">Join the academy as a student.</p>

          

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="phone">Mobile number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 9XXXXXXXXX"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full font-bold" disabled={busy}>
              {busy ? "Creating..." : "Create account"}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-5 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </PageShell>
  );
}
