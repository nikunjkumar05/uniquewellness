import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const upsertClassAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        classId: z.string().uuid(),
        studentId: z.string().uuid(),
        present: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: cls, error: classError } = await supabase
      .from("live_classes")
      .select("id, coach_id")
      .eq("id", data.classId)
      .maybeSingle();

    if (classError) throw new Error(classError.message);
    if (!cls) throw new Error("Class not found");

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (rolesError) throw new Error(rolesError.message);

    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    const isCoachForClass = cls.coach_id === userId;

    if (!isAdmin && !isCoachForClass) throw new Error("Not authorized");

    const { error } = await supabaseAdmin.from("attendance").upsert(
      {
        class_id: data.classId,
        student_id: data.studentId,
        present: data.present,
        marked_at: new Date().toISOString(),
      },
      { onConflict: "class_id,student_id" },
    );

    if (error) throw new Error(error.message);

    return { ok: true };
  });

export const clearClassAttendance = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        classId: z.string().uuid(),
        studentId: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: cls, error: classError } = await supabase
      .from("live_classes")
      .select("id, coach_id")
      .eq("id", data.classId)
      .maybeSingle();

    if (classError) throw new Error(classError.message);
    if (!cls) throw new Error("Class not found");

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (rolesError) throw new Error(rolesError.message);

    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    const isCoachForClass = cls.coach_id === userId;

    if (!isAdmin && !isCoachForClass) throw new Error("Not authorized");

    const { error } = await supabaseAdmin
      .from("attendance")
      .delete()
      .eq("class_id", data.classId)
      .eq("student_id", data.studentId);

    if (error) throw new Error(error.message);

    return { ok: true };
  });
