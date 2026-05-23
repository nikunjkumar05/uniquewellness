import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { Reveal, Parallax } from "@/components/site/reveal";
import { StatsSection } from "@/components/site/stats-section";
import { SuccessStoriesSection } from "@/components/site/success-stories";
import { TestimonialsSection } from "@/components/site/testimonials-section";
import founder from "@/assets/founder-mrunal.jpeg";

export const Route = createFileRoute("/founder")({
  head: () => ({
    meta: [
      { title: "About the Founder — Mrunal Kore | Unique Wellness Institute" },
      {
        name: "description",
        content:
          "Mrunal Kore — founder of Unique Wellness Institute. Multi-disciplinary professional with experience across hospitality, F&B, sales, marketing, and training.",
      },
      { property: "og:title", content: "Founder — Mrunal Kore" },
      {
        property: "og:description",
        content: "From JP Morgan Chase to Play Chess — Mrunal Kore's story.",
      },
    ],
  }),
  component: FounderPage,
});

const paragraphs = [
  "My name is Mrunal Kore. Gained knowledge in multiple fields. Worked in promotions, F&B, Sales, Marketing, Customer Service, Training etc.",
  "To complete my hospitality education I joined JP Morgan Chase as a CSA. Fortunately, I turned out to be the highest seller in sales & providing an excellent customer service.",
  "Been a part of F&B service in Saudi's king palace thrice. Entire countries' presidents & kings are invited for the annual meeting.",
  "In the 3rd event I was a part of serving honourable Donald Trump. He was the prime minister of USA at that time.",
  "Started with a small training center and kept expanding gradually.",
  "Now there are multiple services provided from my end. Prime focus is on Play Chess for kids & Career support.",
];

function FounderPage() {
  return (
    <PageShell>
      <section className="px-3 sm:px-6">
        <div className="mx-auto max-w-6xl grid lg:grid-cols-5 gap-12 items-start py-12 lg:py-16">
          <div className="lg:col-span-2">
            <Parallax speed={0.08}>
              <Reveal>
                <div className="glass-strong rounded-[28px] p-3 hover-lift sticky top-28">
                  <img
                    src={founder}
                    alt="Mrunal Kore"
                    className="w-full rounded-[22px] object-cover"
                  />
                </div>
              </Reveal>
            </Parallax>
          </div>

          <div className="lg:col-span-3">
            <Reveal>
              <span className="text-xs font-semibold tracking-widest text-primary uppercase">
                About Me
              </span>
              <h1 className="font-display text-5xl sm:text-6xl mt-3 leading-tight">Mrunal Kore</h1>
            </Reveal>
            <div className="mt-7 space-y-6 max-w-3xl">
              {paragraphs.map((p, i) => (
                <Reveal key={i} delay={i * 120}>
                  <p className="text-muted-foreground leading-8 text-[1.04rem] font-medium">{p}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
