import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/wellness")({
  // Wellness content now lives in the merged Career & Wellness page.
  beforeLoad: () => {
    throw redirect({ to: "/programs", hash: "wellness" });
  },
});
