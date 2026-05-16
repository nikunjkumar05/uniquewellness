import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/** Admin-only: instantly create a student account + optional course enrollment. */
export const createStudentAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        email: z.string().email().max(255),
        password: z.string().min(8).max(72),
        full_name: z.string().min(1).max(120),
        username: z
          .string()
          .min(2)
          .max(40)
          .regex(/^[a-zA-Z0-9_-]+$/)
          .optional(),
        course_id: z.string().uuid().optional(),
        fee_amount: z.number().min(0).max(999999).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Authorize: only admins
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    if (!isAdmin) throw new Error("Not authorized");

    // Create user (auto-confirmed) via admin client
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name, username: data.username ?? null },
    });
    if (createErr || !created.user) throw new Error(createErr?.message || "Could not create user");
    const newUserId = created.user.id;

    // Update profile with username if trigger missed
    await supabaseAdmin
      .from("profiles")
      .update({
        full_name: data.full_name,
        username: data.username ?? null,
      })
      .eq("user_id", newUserId);

    // Optional enrollment
    if (data.course_id) {
      await supabaseAdmin.from("enrollments").insert({
        student_id: newUserId,
        course_id: data.course_id,
        fee_amount: data.fee_amount ?? 0,
      });
    }

    return { user_id: newUserId, email: data.email };
  });
