import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { Reveal, Parallax } from "@/components/site/reveal";
import { Typewriter } from "@/components/site/typewriter";
import { StatsSection } from "@/components/site/stats-section";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { SuccessStoriesSection } from "@/components/site/success-stories";
import { Star, Trophy, Sparkles, ArrowRight, Crown, Heart, Briefcase, Quote } from "lucide-react";
import pamphlet from "@/assets/vivek-rane-pamphlet.jpeg";
import founder from "@/assets/founder-mrunal.jpeg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Unique Wellness Institute — Chess Coaching & Career Guidance" },
      {
        name: "description",
        content:
          "International chess coaching for kids 5–16, career mentorship, and wellness. Learn from Mr. Vivek Rane and book a demo class today.",
      },
      { property: "og:title", content: "Unique Wellness Institute" },
      {
        property: "og:description",
        content: "Chess Coaching & Career Guidance — Kandivali West, Mumbai.",
      },
    ],
  }),
  component: HomePage,
});

const courses = [
  {
    name: "Beginner",
    price: "₹5,500",
    sessions: "16 sessions",
    desc: "Foundations of chess — pieces, rules, basic strategy.",
  },
  {
    name: "Advanced Beginner",
    price: "₹6,000",
    sessions: "16 sessions",
    desc: "Tactical patterns, openings, simple endgames.",
  },
  {
    name: "Intermediate",
    price: "₹7,000",
    sessions: "16 sessions",
    desc: "Positional play, calculation, opening repertoire.",
  },
  {
    name: "Advanced Level 1",
    price: "₹8,000",
    sessions: "16 sessions",
    desc: "Deep theory, master games, tournament prep.",
  },
  {
    name: "Advanced Level 2",
    price: "₹8,000",
    sessions: "16 sessions",
    desc: "Elite calibration, GM-level patterns, coaching mindset.",
  },
];

const services = [
  {
    icon: Crown,
    title: "Chess Mastery",
    desc: "International coaching for kids 5–16 — beginner to advanced, with full tournament preparation.",
    href: "/chess",
  },
  {
    icon: Briefcase,
    title: "Career Guidance",
    desc: "Decades of cross-industry experience translated into practical mentorship for students and professionals.",
    href: "/career",
  },
  {
    icon: Heart,
    title: "Wellness",
    desc: "Personalised diet and exercise plans grounded in sustainable, lifestyle-friendly habits.",
    href: "/wellness",
  },
];

function HomePage() {
  return (
    <PageShell>
      {/* HERO */}
      <section className="relative px-3 sm:px-6">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-2 gap-10 lg:gap-12 items-center py-10 lg:py-16">
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
                <Sparkles size={14} /> Admission open for kids · Age 5–16
              </div>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="mt-5 font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.95]">
                Learn{" "}
                <Typewriter
                  words={["Chess", "Strategy", "Discipline", "Confidence"]}
                  className="text-gradient"
                />
                <br />
                with International Coaches
              </h1>
            </Reveal>
            <Reveal delay={220}>
              <p className="mt-5 text-lg text-muted-foreground max-w-xl leading-relaxed">
                Premium chess coaching, career mentorship, and wellness — guided by experienced
                international coaches. Built for students who want depth, not noise.
              </p>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="group rounded-2xl bg-primary text-primary-foreground px-6 py-3.5 text-sm font-semibold inline-flex items-center gap-2 hover-lift shadow-soft"
                >
                  Book Demo Class{" "}
                  <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/chess"
                  className="rounded-2xl glass-strong px-6 py-3.5 text-sm font-semibold hover-lift"
                >
                  Explore Courses
                </Link>
              </div>
            </Reveal>
            <Reveal delay={420}>
              <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-primary text-primary" />
                  ))}
                </div>
                <span>4.9 · 100+ Google Reviews</span>
              </div>
            </Reveal>
          </div>

          <div className="relative">
            <Parallax speed={0.12}>
              <Reveal delay={200}>
                <div className="relative glass-strong rounded-[28px] p-3 hover-lift">
                  <img
                    src={pamphlet}
                    alt="Mr. Vivek Rane — International Chess Coach"
                    className="w-full h-auto rounded-[22px] object-cover"
                  />
                  <div className="absolute -bottom-5 -left-5 glass-tint rounded-2xl px-4 py-3 hidden sm:flex items-center gap-3">
                    <Trophy className="text-primary" size={22} />
                    <div>
                      <div className="text-xs text-muted-foreground">Trained by</div>
                      <div className="text-sm font-semibold leading-tight">Mr. Vivek Rane</div>
                    </div>
                  </div>
                  <div className="absolute -top-5 -right-5 glass-tint rounded-2xl px-4 py-3 hidden sm:flex items-center gap-3">
                    <Sparkles className="text-warm" size={22} />
                    <div>
                      <div className="text-xs text-muted-foreground">Live + Online</div>
                      <div className="text-sm font-semibold leading-tight">Small batches</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            </Parallax>
          </div>
        </div>
      </section>

      {/* STATS (dynamic from Supabase) */}
      <div className="mt-6">
        <StatsSection />
      </div>

      {/* SERVICES */}
      <section className="px-3 sm:px-6 mt-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-xs font-semibold tracking-widest text-primary uppercase">
                About Us
              </span>
              <h2 className="font-display text-4xl sm:text-5xl mt-3">
                Built on experience, driven by passion
              </h2>
              <p className="mt-4 text-muted-foreground">
                Unique Wellness Institute combines world-class chess coaching, career mentorship,
                and wellness — all under one roof.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <Reveal key={s.title} delay={i * 140}>
                <Link to={s.href} className="block glass-strong rounded-3xl p-7 hover-lift h-full">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-5">
                    <s.icon size={22} />
                  </div>
                  <h3 className="font-display text-2xl">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                    Learn more <ArrowRight size={14} />
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* COURSES */}
      <section className="px-3 sm:px-6 mt-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-xs font-semibold tracking-widest text-primary uppercase">
                  Chess Programs
                </span>
                <h2 className="font-display text-4xl sm:text-5xl mt-2">Courses & Pricing</h2>
                <p className="mt-2 text-muted-foreground">
                  Each course contains 16 structured sessions.
                </p>
              </div>
              <Link
                to="/contact"
                className="rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover-lift"
              >
                Book Demo
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((c, i) => (
              <Reveal key={c.name} delay={i * 100}>
                <div className="glass-strong rounded-3xl p-7 hover-lift h-full flex flex-col">
                  <div className="text-xs font-semibold text-primary uppercase tracking-widest">
                    {c.sessions}
                  </div>
                  <h3 className="font-display text-3xl mt-2">{c.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">
                    {c.desc}
                  </p>
                  <div className="mt-6 flex items-end justify-between">
                    <div className="font-display text-3xl text-foreground">{c.price}</div>
                    <Link
                      to="/contact"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Enroll →
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FOUNDER PREVIEW */}
      <section className="px-3 sm:px-6 mt-24">
        <div className="mx-auto max-w-6xl glass-strong rounded-[32px] overflow-hidden grid lg:grid-cols-5 gap-0">
          <div className="lg:col-span-2 relative">
            <Parallax speed={0.08}>
              <img
                src={founder}
                alt="Mrunal Kore — Founder"
                className="h-full w-full object-cover min-h-[320px]"
              />
            </Parallax>
          </div>
          <div className="lg:col-span-3 p-8 sm:p-12">
            <Reveal>
              <Quote className="text-primary" size={28} />
              <h2 className="font-display text-4xl sm:text-5xl mt-3">Meet the Founder</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Mrunal Kore — multi-disciplinary professional with experience across hospitality,
                F&B, sales, marketing, and training. From serving heads of state at Saudi's king
                palace to leading a top-performing CSA team at JP Morgan Chase, his journey now
                centers on chess coaching for kids and career support for students.
              </p>
              <Link
                to="/founder"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-3 text-sm font-semibold hover-lift"
              >
                Read full story <ArrowRight size={16} />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES (dynamic) */}
      <div className="mt-24">
        <SuccessStoriesSection />
      </div>

      {/* TESTIMONIALS (dynamic) */}
      <div className="mt-24">
        <TestimonialsSection />
      </div>

      <section className="px-3 sm:px-6 mt-24">
        <div className="mx-auto max-w-5xl glass-tint rounded-[32px] p-10 sm:p-14 text-center">
          <Reveal>
            <h2 className="font-display text-4xl sm:text-5xl">Start with a free demo class</h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              See how our coaching works — no commitment, just one focused session.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link
                to="/contact"
                className="rounded-2xl bg-primary text-primary-foreground px-6 py-3.5 text-sm font-semibold hover-lift shadow-soft"
              >
                Book Demo Class
              </Link>
              <a
                href="tel:+919594373644"
                className="rounded-2xl glass-strong px-6 py-3.5 text-sm font-semibold hover-lift"
              >
                Call +91 9594373644
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
