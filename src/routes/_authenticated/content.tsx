import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/content")({
  head: () => ({ meta: [{ title: "Content Management — UWI" }] }),
  // Website content is now managed inside the admin dashboard (Website tab).
  // Keep the old URL working for bookmarks.
  beforeLoad: () => {
    throw redirect({ to: "/admin", search: { tab: "website" } });
  },
});
