import { createFileRoute, Link } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { Reveal } from "@/components/site/reveal";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import { Briefcase, FileText, Video, Handshake } from "lucide-react";

export const Route = createFileRoute("/career")({
  head: () => ({
    meta: [
      { title: "Career Counseling & International Employment — Unique Wellness Institute" },
      {
        name: "description",
        content:
          "Personalised career guidance backed by years of experience across airlines catering, hospitality, sales, marketing, training, and recruitment.",
      },
      { property: "og:title", content: "Career Counseling — Unique Wellness Institute" },
      {
        property: "og:description",
        content: "Career mentorship, resume building, interview training, and personal guidance.",
      },
    ],
  }),
  component: CareerPage,
});

const learn = [
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

function CareerPage() {
  return (
    <PageShell>
      <section className="px-3 sm:px-6">
        <div className="mx-auto max-w-5xl text-center py-10">
          <Reveal>
            <span className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-semibold text-primary">
              <Briefcase size={14} /> Career Counseling
            </span>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="font-display text-5xl sm:text-6xl mt-5 leading-tight">
              Career Counseling & <span className="text-gradient">International Employment</span>
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="mt-5 text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Personalised guidance backed by years of experience across Airlines Catering,
              Hospitality, Sales, Marketing, Training, and Recruitment. After communicating with
              each candidate, we analyse their needs and map the best path forward — professional or
              personal. Resumes are built in the latest format and we train you for every stage of
              the interview process.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="px-3 sm:px-6 mt-10">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 className="font-display text-4xl text-center">What you'll learn</h2>
            <p className="text-center text-muted-foreground mt-2">
              Career & personal training guidance.
            </p>
          </Reveal>
          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {learn.map((l, i) => (
              <Reveal key={l.title} delay={i * 100}>
                <div className="glass-strong rounded-3xl p-7 hover-lift h-full">
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                    <l.icon size={20} />
                  </div>
                  <h3 className="font-display text-xl mt-4">{l.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{l.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-20">
        <TestimonialsSection
          title="Outcomes our candidates rave about"
          subtitle="Coaching that actually moves your career."
        />
      </div>

      <section className="px-3 sm:px-6 mt-20">
        <div className="mx-auto max-w-5xl glass-premium rounded-[32px] p-10 text-center">
          <Reveal>
            <h3 className="font-display text-3xl sm:text-4xl">
              Ready to take the next step in your career?
            </h3>
            <Link
              to="/contact"
              className="mt-6 inline-flex rounded-2xl bg-primary text-primary-foreground px-6 py-3.5 text-sm font-semibold hover-lift"
            >
              Get in touch
            </Link>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}
