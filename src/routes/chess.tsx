import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { Reveal } from "@/components/site/reveal";
import {
  ArrowRight,
  Brain,
  CalendarCheck,
  CheckCircle2,
  Crown,
  GraduationCap,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import pamphlet from "@/assets/vivek-rane-pamphlet.jpeg";

export const Route = createFileRoute("/chess")({
  head: () => ({
    meta: [
      { title: "Chess Coaching - Unique Wellness Institute" },
      {
        name: "description",
        content:
          "Chess coaching for kids age 5-16 with structured beginner to advanced programs, tournament preparation, and practice tools.",
      },
      { property: "og:title", content: "Chess Coaching - Unique Wellness Institute" },
      {
        property: "og:description",
        content: "Beginner to advanced chess coaching with international guidance.",
      },
    ],
  }),
  component: ChessPage,
});

const programs = [
  {
    name: "Beginner",
    price: "Rs. 5,500",
    focus: "Rules, board vision, checkmates, and confident first games.",
  },
  {
    name: "Advanced Beginner",
    price: "Rs. 6,000",
    focus: "Tactics, opening habits, notation, and simple endgames.",
  },
  {
    name: "Intermediate",
    price: "Rs. 7,000",
    focus: "Calculation, positional ideas, game review, and tournament readiness.",
  },
  {
    name: "Advanced Level 1",
    price: "Rs. 8,000",
    focus: "Opening repertoire, deeper endgames, master games, and competitive prep.",
  },
  {
    name: "Advanced Level 2",
    price: "Rs. 8,000",
    focus: "High-level pattern recognition, practical decision making, and analysis.",
  },
];

const outcomes = [
  "Build disciplined thinking and patience",
  "Learn structured tactics and strategy",
  "Practice with regular game analysis",
  "Prepare for school and open tournaments",
];

const steps = [
  {
    icon: Users,
    title: "Small batch coaching",
    text: "Classes are designed for focused attention, clear correction, and steady progress.",
  },
  {
    icon: Brain,
    title: "Skill-based progression",
    text: "Students move from fundamentals to advanced concepts through a planned curriculum.",
  },
  {
    icon: Target,
    title: "Game review",
    text: "Mistakes are turned into practical lessons through replay, PGN review, and guided analysis.",
  },
  {
    icon: Trophy,
    title: "Tournament preparation",
    text: "Students learn time management, opening discipline, notation, and competitive habits.",
  },
];

function ChessPage() {
  return (
    <PageShell>
      <section className="px-3 sm:px-6 pb-12">
        <div className="mx-auto grid max-w-6xl items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_440px] lg:py-16">
          <div>
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary shadow-sm backdrop-blur">
                <Crown size={14} /> Chess coaching
              </div>
            </Reveal>
            <Reveal delay={120}>
              <h1 className="mt-5 font-display text-5xl leading-[0.95] sm:text-6xl lg:text-7xl">
                Structured chess coaching for young players
              </h1>
            </Reveal>
            <Reveal delay={220}>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                Beginner to advanced chess programs for kids age 5-16, guided by international
                coaching experience and built around disciplined thinking, tactics, strategy, and
                tournament preparation.
              </p>
            </Reveal>
            <Reveal delay={320}>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5"
                >
                  Book Demo Class <ArrowRight size={16} />
                </Link>
                <a
                  href="#programs"
                  className="rounded-2xl border border-border/70 bg-white/70 px-6 py-3.5 text-sm font-semibold shadow-sm backdrop-blur transition hover:-translate-y-0.5"
                >
                  View Programs
                </a>
              </div>
            </Reveal>
            <Reveal delay={420}>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {outcomes.map((outcome) => (
                  <div key={outcome} className="flex items-center gap-2 text-sm text-foreground/78">
                    <CheckCircle2 size={17} className="shrink-0 text-primary" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={180}>
            <div className="relative rounded-[28px] border border-white/60 bg-white/75 p-3 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.45)] backdrop-blur-xl">
              <img
                src={pamphlet}
                alt="Mr. Vivek Rane, international chess coach"
                className="aspect-[4/5] w-full rounded-[22px] object-cover"
              />
              <div className="absolute -bottom-4 left-5 right-5 rounded-2xl border border-white/65 bg-white/88 px-5 py-4 shadow-soft backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <GraduationCap size={21} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      Coach-led learning
                    </div>
                    <div className="font-display text-2xl leading-none">16 sessions per course</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="px-3 sm:px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="max-w-2xl">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                Coaching method
              </span>
              <h2 className="mt-2 font-display text-4xl sm:text-5xl">
                Clear lessons, real games, measurable progress
              </h2>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 100}>
                <div className="h-full rounded-3xl border border-white/60 bg-white/72 p-6 shadow-[0_16px_44px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <step.icon size={21} />
                  </div>
                  <h3 className="mt-5 font-display text-2xl">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="programs" className="px-3 sm:px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Programs
                </span>
                <h2 className="mt-2 font-display text-4xl sm:text-5xl">Courses and pricing</h2>
                <p className="mt-2 text-muted-foreground">
                  Every level includes 16 structured sessions.
                </p>
              </div>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5"
              >
                Enquire now <CalendarCheck size={16} />
              </Link>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {programs.map((program, index) => (
              <Reveal key={program.name} delay={index * 90}>
                <div className="flex h-full flex-col rounded-3xl border border-white/60 bg-white/75 p-7 shadow-[0_16px_44px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl">
                  <div className="text-xs font-semibold uppercase tracking-widest text-primary">
                    16 sessions
                  </div>
                  <h3 className="mt-2 font-display text-3xl">{program.name}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {program.focus}
                  </p>
                  <div className="mt-6 flex items-end justify-between gap-4">
                    <div className="font-display text-3xl">{program.price}</div>
                    <Link to="/contact" className="text-sm font-semibold text-primary hover:underline">
                      Book demo
                    </Link>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-3 sm:px-6 py-12">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-primary/15 bg-primary/7 p-7 sm:p-10">
          <Reveal>
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest text-primary">
                  Practice lab
                </span>
                <h2 className="mt-2 font-display text-4xl sm:text-5xl">
                  Keep training between classes
                </h2>
                <p className="mt-3 max-w-2xl text-muted-foreground">
                  Use the separate practice lab to play against AI, upload PGN files, replay games,
                  and review move history between coaching sessions.
                </p>
              </div>
              <Link
                to="/practice-lab"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5"
              >
                Open Practice Lab <ArrowRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
