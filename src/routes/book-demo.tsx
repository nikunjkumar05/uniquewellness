import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PageShell } from "@/components/site/page-shell";
import { Reveal } from "@/components/site/reveal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Send } from "lucide-react";

export const Route = createFileRoute("/book-demo")({
  head: () => ({
    meta: [
      { title: "Book a Free Demo — Unique Wellness Institute" },
      {
        name: "description",
        content:
          "Book a free demo class at Unique Wellness Institute. Chess, career guidance, and wellness for students aged 5–16.",
      },
      { property: "og:title", content: "Book a Free Demo Class" },
      { property: "og:description", content: "Reserve a no-commitment demo session." },
    ],
  }),
  component: BookDemoPage,
});

function BookDemoPage() {
  const [form, setForm] = useState({
    name: "",
    parent_name: "",
    phone: "",
    email: "",
    student_class: "",
    preferred_subject: "Chess",
    preferred_timing: "",
    message: "",
  });
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email)
      return toast.error("Name, mobile and email required");
    setBusy(true);
    const { error } = await supabase.from("demo_bookings").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      parent_name: form.parent_name.trim() || null,
      student_class: form.student_class.trim() || null,
      preferred_subject: form.preferred_subject,
      preferred_timing: form.preferred_timing.trim() || null,
      course: form.preferred_subject,
      message: form.message.trim() || null,
    });
    setBusy(false);
    if (error) return toast.error("Could not submit. Please call us directly.");
    toast.success("Thank you! We'll reach out within 24 hours.");
    setForm({
      name: "",
      parent_name: "",
      phone: "",
      email: "",
      student_class: "",
      preferred_subject: "Chess",
      preferred_timing: "",
      message: "",
    });
  }

  return (
    <PageShell>
      <section className="px-3 sm:px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <Reveal>
            <div className="text-center mb-8">
              <span className="text-xs font-bold tracking-widest text-primary uppercase">
                Free demo
              </span>
              <h1 className="text-5xl sm:text-6xl mt-2 section-title">Book a Demo Class</h1>
              <p className="mt-3 text-muted-foreground">
                No commitment. One focused session. We'll get back within 24 hours.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <form onSubmit={onSubmit} className="glass-premium rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label>Student name *</Label>
                  <Input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Parent / Guardian name</Label>
                  <Input
                    value={form.parent_name}
                    onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Mobile number *</Label>
                  <Input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Class / Grade</Label>
                  <Input
                    placeholder="e.g. Class 5"
                    value={form.student_class}
                    onChange={(e) => setForm({ ...form, student_class: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Preferred subject</Label>
                  <select
                    className="mt-2 w-full rounded-xl bg-white/70 backdrop-blur border border-border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    value={form.preferred_subject}
                    onChange={(e) => setForm({ ...form, preferred_subject: e.target.value })}
                  >
                    <option>Chess</option>
                    <option>Career Guidance</option>
                    <option>Wellness</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <Label>Preferred timing</Label>
                  <Input
                    placeholder="e.g. Weekdays 5–7pm"
                    value={form.preferred_timing}
                    onChange={(e) => setForm({ ...form, preferred_timing: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Notes / message</Label>
                <Textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
              <Button type="submit" disabled={busy} className="w-full font-bold py-6">
                {busy ? (
                  "Sending…"
                ) : (
                  <span className="inline-flex items-center gap-2">
                    Submit booking <Send size={16} />
                  </span>
                )}
              </Button>
            </form>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
