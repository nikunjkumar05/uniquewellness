import { createFileRoute } from "@tanstack/react-router";
import { PageShell } from "@/components/site/page-shell";
import { ChessLab } from "@/components/site/chess-lab";

export const Route = createFileRoute("/chess")({
  head: () => ({
    meta: [
      { title: "Play Chess — Unique Wellness Institute" },
      {
        name: "description",
        content:
          "Play chess with international guidance for kids 5–16 — beginner to advanced, with tournament preparation. 16 sessions per course.",
      },
      { property: "og:title", content: "Play Chess — Unique Wellness Institute" },
      {
        property: "og:description",
        content: "Beginner to advanced chess practice with international coaches.",
      },
    ],
  }),
  component: ChessPage,
});

function ChessPage() {
  return (
    <PageShell showFooter={false}>
      <ChessLab />
    </PageShell>
  );
}
