import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { Reveal } from "@/components/site/reveal";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { Heart, Activity, Apple, ClipboardCheck, LineChart } from "lucide-react";

export const Route = createFileRoute("/wellness")({
  head: () => ({
    meta: [
      { title: "Wellness — Diet & Exercise Plans | Unique Wellness Institute" },
      {
        name: "description",
        content:
          "Personalised, sustainable diet and exercise plans designed around your goals and lifestyle.",
      },
      { property: "og:title", content: "Wellness — Unique Wellness Institute" },
      { property: "og:description", content: "Personalised diet and exercise plans." },
    ],
  }),
  component: WellnessPage,
});

const items = [
  {
    icon: ClipboardCheck,
    title: "Assessment",
    desc: "Detailed lifestyle, goals and health assessment.",
  },
  {
    icon: Apple,
    title: "Diet Plan",
    desc: "Custom, easy-to-follow nutrition built around your routine.",
  },
  {
    icon: Activity,
    title: "Exercise Plan",
    desc: "Workouts matched to your fitness level and equipment.",
  },
  {
    icon: LineChart,
    title: "Tracking",
    desc: "Regular check-ins so you stay on track and see progress.",
  },
];

function WellnessPage() {
  return (
    <PageShell>
      <section className="px-3 sm:px-6">
        <div className="mx-auto max-w-5xl text-center py-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
              <Heart size={14} /> Wellness
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="font-display text-5xl sm:text-6xl mt-5 leading-tight">
              Diet & Exercise <span className="text-gradient">Plans</span>
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Personalised, sustainable plans designed around your goals and lifestyle.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-3 sm:px-6 mt-6">
        <div className="mx-auto max-w-6xl grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((it, i) => (
            <Reveal key={it.title} delay={i * 100}>
              <div className="glass-strong rounded-3xl p-7 hover-lift h-full">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <it.icon size={20} />
                </div>
                <h3 className="font-display text-xl mt-4">{it.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{it.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <div className="mt-20">
        <TestimonialsSection
          title="Healthier, happier members"
          subtitle="Real wellness stories from our community."
        />
      </div>

      <section className="px-3 sm:px-6 mt-20">
        <div className="mx-auto max-w-5xl glass-tint rounded-[32px] p-10 text-center">
          <Reveal>
            <h3 className="font-display text-3xl sm:text-4xl">
              Get started with your wellness plan
            </h3>
            <Link
              to="/contact"
              className="mt-6 inline-flex rounded-2xl bg-primary text-primary-foreground px-6 py-3.5 text-sm font-semibold hover-lift"
            >
              Get started
            </Link>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
