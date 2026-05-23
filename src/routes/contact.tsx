import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { Reveal } from "@/components/site/reveal";
import { Phone, Mail, MapPin, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & Book Demo — Unique Wellness Institute" },
      {
        name: "description",
        content:
          "Book a demo class or get in touch. Phone +91 9594373644, email info@uniquewellnessinstitute.com, Mumbai, India.",
      },
      { property: "og:title", content: "Contact — Unique Wellness Institute" },
      { property: "og:description", content: "Book a demo class or contact us." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    course: "Beginner",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Please fill in name, email and phone.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("demo_bookings").insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      course: form.course,
      source: "contact",
      message: form.message.trim() || null,
    });
    setLoading(false);
    if (error) {
      toast.error("Could not submit right now. Please call us directly.");
      return;
    }
    toast.success("Thanks! We'll get back to you within 24 hours.");
    setForm({ name: "", email: "", phone: "", course: "Beginner", message: "" });
  };

  return (
    <PageShell>
      <section className="px-3 sm:px-6">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-10 py-10">
          <div>
            <Reveal>
              <h1 className="font-display text-5xl sm:text-6xl leading-tight">
                Let's <span className="text-gradient">talk</span>
              </h1>
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                Book a free demo class, ask about courses, or just say hello. We respond within 24
                hours.
              </p>
            </Reveal>
            <div className="mt-8 space-y-4">
              <Reveal delay={100}>
                <a
                  href="tel:+919594373644"
                  className="glass-strong rounded-2xl p-5 flex items-center gap-4 hover-lift"
                >
                  <span className="h-11 w-11 rounded-xl bg-primary text-primary-foreground inline-flex items-center justify-center">
                    <Phone size={18} />
                  </span>
                  <div>
                    <div className="text-xs text-muted-foreground">Phone</div>
                    <div className="font-semibold">+91 9594373644</div>
                  </div>
                </a>
              </Reveal>
              <Reveal delay={200}>
                <a
                  href="mailto:info@uniquewellnessinstitute.com"
                  className="glass-strong rounded-2xl p-5 flex items-center gap-4 hover-lift"
                >
                  <span className="h-11 w-11 rounded-xl bg-primary text-primary-foreground inline-flex items-center justify-center">
                    <Mail size={18} />
                  </span>
                  <div>
                    <div className="text-xs text-muted-foreground">Email</div>
                    <div className="font-semibold break-all">info@uniquewellnessinstitute.com</div>
                  </div>
                </a>
              </Reveal>
              <Reveal delay={300}>
                <div className="glass-strong rounded-2xl p-5 flex items-center gap-4">
                  <span className="h-11 w-11 rounded-xl bg-primary text-primary-foreground inline-flex items-center justify-center">
                    <MapPin size={18} />
                  </span>
                  <div>
                    <div className="text-xs text-muted-foreground">Address</div>
                    <div className="font-semibold">Mumbai, India</div>
                  </div>
                </div>
              </Reveal>
            </div>
          </div>

          <Reveal delay={150}>
            <form onSubmit={onSubmit} className="glass-strong rounded-3xl p-7 sm:p-8 space-y-4">
              <h2 className="font-display text-3xl">Book a demo class</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Full name"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                />
                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                />
              </div>
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
              />
              <div>
                <label
                  htmlFor="course-select"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
                >
                  Interested in
                </label>
                <select
                  id="course-select"
                  value={form.course}
                  onChange={(e) => setForm({ ...form, course: e.target.value })}
                  className="mt-2 w-full rounded-xl bg-white/70 backdrop-blur border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
                  aria-label="Select a course"
                >
                  <option>Beginner</option>
                  <option>Advanced Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced Level 1</option>
                  <option>Advanced Level 2</option>
                  <option>Career Guidance</option>
                  <option>Wellness</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="message-textarea"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
                >
                  Message (optional)
                </label>
                <textarea
                  id="message-textarea"
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="mt-2 w-full rounded-xl bg-white/70 backdrop-blur border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all resize-none"
                  aria-label="Additional message"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-primary text-primary-foreground px-6 py-3.5 text-sm font-semibold inline-flex items-center justify-center gap-2 hover-lift shadow-soft disabled:opacity-60 disabled:pointer-events-none transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    Submit <Send size={15} />
                  </>
                )}
              </button>
            </form>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div>
      <label
        htmlFor={id}
        className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-xl bg-white/70 backdrop-blur border border-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
        aria-label={label}
      />
    </div>
  );
}
