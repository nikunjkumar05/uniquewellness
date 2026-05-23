import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { ChessLab } from "@/components/site/chess-lab";
import { Reveal } from "@/components/site/reveal";
import { Brain, Gamepad2 } from "lucide-react";

export const Route = createFileRoute("/practice-lab")({
  head: () => ({
    meta: [
      { title: "Practice Lab - Unique Wellness Institute" },
      {
        name: "description",
        content:
          "Practice chess against AI, upload PGN files, replay games, and review move history.",
      },
      { property: "og:title", content: "Practice Lab - Unique Wellness Institute" },
      {
        property: "og:description",
        content: "Interactive chess practice and PGN review tools.",
      },
    ],
  }),
  component: PracticeLabPage,
});

function PracticeLabPage() {
  return (
    <PageShell>
      <section className="px-3 pb-4 sm:px-6">
        <div className="mx-auto max-w-6xl pt-8">
          <Reveal>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary shadow-sm backdrop-blur">
              <Gamepad2 size={14} /> Practice lab
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
              <div>
                <h1 className="font-display text-5xl leading-[0.95] sm:text-6xl">
                  Play, save, and review chess games
                </h1>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
                  Train against AI, upload PGN files, replay games, and inspect move history in one
                  focused workspace.
                </p>
              </div>
              <div className="rounded-3xl border border-white/60 bg-white/72 p-5 shadow-[0_16px_44px_-32px_rgba(15,23,42,0.35)] backdrop-blur-xl">
                <div className="flex items-start gap-3">
                  <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Brain size={20} />
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Use this lab between coaching sessions to turn practice games into reviewable
                    learning material.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <ChessLab />
    </PageShell>
  );
}
