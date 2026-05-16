import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { Reveal, Parallax } from "@/components/site/reveal";
import { StatsSection } from "@/components/site/stats-section";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { SuccessStoriesSection } from "@/components/site/success-stories";
import { Crown, Trophy, Users, Check } from "lucide-react";
import pamphlet from "@/assets/vivek-rane-pamphlet.jpeg";

export const Route = createFileRoute("/chess")({
  head: () => ({
    meta: [
      { title: "Chess Coaching — Unique Wellness Institute" },
      {
        name: "description",
        content:
          "International chess coaching for kids 5–16 — beginner to advanced, with tournament preparation. 16 sessions per course.",
      },
      { property: "og:title", content: "Chess Coaching — Unique Wellness Institute" },
      {
        property: "og:description",
        content: "Beginner to advanced chess coaching with international coaches.",
      },
    ],
  }),
  component: ChessPage,
});

const courses = [
  { name: "Beginner", price: "₹5,500" },
  { name: "Advanced Beginner", price: "₹6,000" },
  { name: "Intermediate", price: "₹7,000" },
  { name: "Advanced Level 1", price: "₹8,000" },
  { name: "Advanced Level 2", price: "₹8,000" },
];

const features = [
  "Beginner to Advanced training",
  "Online live classes and more",
  "Tournament preparation",
  "Small focused batches",
  "Trained by an international coach",
  "Structured 16-session curriculum",
];

function ChessPage() {
  return (
    <PageShell>
      <section className="px-3 sm:px-6">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-10 items-center py-10">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
                <Crown size={14} /> Chess Coaching
              </span>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="font-display text-5xl sm:text-6xl mt-5 leading-tight">
                Train with <span className="text-gradient">international coaches</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                Led by Mr. Vivek Rane — a well-respected international chess coach. Programs are
                designed for kids 5–16, covering everything from foundations to tournament-grade
                play.
              </p>
            </Reveal>
            <Reveal delay={300}>
              <ul className="mt-6 grid sm:grid-cols-2 gap-y-2 gap-x-6">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="h-5 w-5 rounded-md bg-primary-soft text-primary inline-flex items-center justify-center">
                      <Check size={13} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={400}>
              <Link
                to="/contact"
                className="mt-7 inline-flex rounded-2xl bg-primary text-primary-foreground px-6 py-3.5 text-sm font-semibold hover-lift shadow-soft"
              >
                Book a Demo Class
              </Link>
            </Reveal>
          </div>
          <Parallax speed={0.08}>
            <Reveal delay={200}>
              <div className="glass-premium rounded-[28px] p-3 hover-lift">
                <img src={pamphlet} alt="Chess coaching" className="w-full rounded-[22px]" />
              </div>
            </Reveal>
          </Parallax>
        </div>
      </section>

      <div className="mt-12">
        <StatsSection />
      </div>

      <section className="px-3 sm:px-6 mt-16">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="font-display text-4xl sm:text-5xl text-center">Course Levels</h2>
            <p className="mt-2 text-center text-muted-foreground">
              Each program is 16 structured sessions.
            </p>
          </Reveal>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((c, i) => (
              <Reveal key={c.name} delay={i * 80}>
                <div className="glass-strong rounded-3xl p-7 hover-lift">
                  <Trophy className="text-primary" />
                  <h3 className="font-display text-2xl mt-3">{c.name}</h3>
                  <div className="mt-2 text-sm text-muted-foreground">16 sessions</div>
                  <div className="mt-4 font-display text-3xl">{c.price}</div>
                  <Link
                    to="/contact"
                    className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline"
                  >
                    Enroll →
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-20">
        <SuccessStoriesSection title="Student tournament wins" />
      </div>
      <div className="mt-20">
        <TestimonialsSection
          title="Parents & students love it"
          subtitle="Honest words from our chess community."
        />
      </div>

      <section className="px-3 sm:px-6 mt-20">
        <div className="mx-auto max-w-5xl glass-premium rounded-[32px] p-10 text-center">
          <Reveal>
            <Users className="mx-auto text-primary" />
            <h3 className="section-title text-3xl sm:text-4xl mt-3">
              Join 800+ students learning the right way
            </h3>
            <Link
              to="/contact"
              className="mt-6 inline-flex rounded-2xl bg-primary text-primary-foreground px-6 py-3.5 text-sm font-semibold hover-lift"
            >
              Book Demo
            </Link>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
