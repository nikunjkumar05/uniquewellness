import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { Reveal } from "@/components/site/reveal";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import {
  Activity,
  Apple,
  Briefcase,
  ClipboardCheck,
  FileText,
  Handshake,
  Heart,
  LineChart,
  Sparkles,
  Video,
} from "lucide-react";

export const Route = createFileRoute("/programs")({
  head: () => ({
    meta: [
      { title: "Career & Wellness Programs — Unique Wellness Institute" },
      {
        name: "description",
        content:
          "Personalised career counseling, interview training, diet plans and exercise coaching — guidance for work and wellbeing.",
      },
      { property: "og:title", content: "Career & Wellness — Unique Wellness Institute" },
      {
        property: "og:description",
        content: "Career mentorship plus personalised diet and exercise plans.",
      },
    ],
  }),
  component: ProgramsPage,
});

const careerItems = [
  {
    icon: Handshake,
    title: "Self Presentation",
    desc: "Learn what to do before you have an interview scheduled.",
  },
  { icon: FileText, title: "Follow-up", desc: "Learn how to follow-up after an interview." },
  {
    icon: Video,
    title: "Video Lessons",
    desc: "Learn how to answer the 50 most important interview questions.",
  },
  {
    icon: Briefcase,
    title: "Resume Presentation",
    desc: "Build a resume in the latest, recruiter-ready format.",
  },
];

const wellnessItems = [
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

function ProgramCards({ items }: { items: typeof careerItems }) {
  return (
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item, i) => (
        <Reveal key={item.title} delay={i * 100}>
          <div className="glass-strong h-full rounded-3xl p-7 hover-lift">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <item.icon size={20} />
            </div>
            <h3 className="font-display mt-4 text-xl">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

function ProgramsPage() {
  return (
    <PageShell>
      {/* HERO */}
      <section className="px-3 sm:px-6">
        <div className="mx-auto max-w-5xl py-10 text-center">
          <Reveal>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
              <Sparkles size={14} /> Career & Wellness
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="font-display mt-5 text-5xl leading-tight sm:text-6xl">
              Guidance for work <span className="text-gradient">& wellbeing</span>
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Personalised career counseling backed by cross-industry experience — plus
              sustainable diet and exercise plans built around your lifestyle. Two programs,
              one goal: a stronger you.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <a
                href="#career"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover-lift"
              >
                <Briefcase size={16} /> Career counseling
              </a>
              <a
                href="#wellness"
                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/60 px-6 py-3 text-sm font-semibold hover-lift"
              >
                <Heart size={16} /> Wellness plans
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CAREER */}
      <section id="career" className="scroll-mt-28 px-3 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
              <Briefcase size={14} /> Career Counseling
            </span>
            <h2 className="font-display mt-4 text-4xl sm:text-5xl">
              Career Counseling & <span className="text-gradient">International Employment</span>
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Personalised guidance backed by years of experience across Airlines Catering,
              Hospitality, Sales, Marketing, Training, and Recruitment. After communicating with
              each candidate, we analyse their needs and map the best path forward — professional
              or personal. Resumes are built in the latest format and we train you for every stage
              of the interview process.
            </p>
          </Reveal>
          <ProgramCards items={careerItems} />
        </div>
      </section>

      {/* WELLNESS */}
      <section id="wellness" className="mt-20 scroll-mt-28 px-3 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
              <Heart size={14} /> Wellness
            </span>
            <h2 className="font-display mt-4 text-4xl sm:text-5xl">
              Diet & Exercise <span className="text-gradient">Plans</span>
            </h2>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted-foreground">
              Personalised, sustainable plans designed around your goals and lifestyle.
            </p>
          </Reveal>
          <ProgramCards items={wellnessItems} />
        </div>
      </section>

      <div className="mt-20">
        <TestimonialsSection
          title="Outcomes our members rave about"
          subtitle="Careers moved forward, lifestyles transformed."
        />
      </div>

      <section className="mt-20 px-3 sm:px-6">
        <div className="glass-premium mx-auto max-w-5xl rounded-[32px] p-10 text-center">
          <Reveal>
            <h3 className="font-display text-3xl sm:text-4xl">
              Ready to invest in yourself?
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Book a free consultation and we will map the right career or wellness path for you.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-flex rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground hover-lift"
            >
              Get in touch
            </Link>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
