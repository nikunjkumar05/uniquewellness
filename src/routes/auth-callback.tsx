import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { dashboardPathForRole } from "@/hooks/use-auth";

export const Route = createFileRoute("/auth-callback")({
  component: CallbackPage,
});

function CallbackPage() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = setInterval(async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        clearInterval(t);
        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", data.session.user.id);
        const roles = (rolesData ?? []).map((r) => r.role as "admin" | "coach" | "student");
        const role = roles.includes("admin")
          ? "admin"
          : roles.includes("coach")
            ? "coach"
            : "student";
        navigate({ to: dashboardPathForRole(role) });
      }
    }, 200);
    return () => clearInterval(t);
  }, [navigate]);
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground">Completing sign-in...</p>
    </div>
  );
}
