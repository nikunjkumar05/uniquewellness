import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Public: a user asks an admin to reset their password.
 * Only identity + consent are stored — the replacement password is chosen by
 * the admin at approval time (see resolvePasswordRequest), never by the
 * requester, and no password material is kept in the table.
 */
export const requestPasswordChange = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        email: z.string().email().max(255),
        full_name: z.string().max(120).optional(),
        consent: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { email, full_name, consent } = data;
    if (!consent) throw new Error("Consent required");

    const { error } = await supabaseAdmin.from("password_reset_requests").insert([
      {
        email,
        full_name: full_name ?? null,
        consent,
        new_password_hash: null,
        status: "pending",
      },
    ]);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/**
 * Admin-only: approve (sets a temporary password via the service-role Admin
 * API — the user then changes it in Profile settings) or reject a reset
 * request.
 */
export const resolvePasswordRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        action: z.enum(["approved", "rejected"]),
        tempPassword: z.string().min(8).max(72).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    if (!isAdmin) throw new Error("Not authorized");

    const { data: req, error: reqErr } = await supabaseAdmin
      .from("password_reset_requests")
      .select("id, email, status")
      .eq("id", data.id)
      .maybeSingle();
    if (reqErr || !req) throw new Error("Request not found");
    if (req.status !== "pending") throw new Error(`Request is already ${req.status}`);

    if (data.action === "approved") {
      if (!data.tempPassword) throw new Error("A temporary password is required to approve");

      // Locate the auth user by email (paginated; academy-scale user base).
      let targetId: string | null = null;
      for (let page = 1; page <= 20; page++) {
        const { data: list, error } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage: 100,
        });
        if (error) throw new Error(error.message);
        const found = list.users.find(
          (u) => u.email?.toLowerCase() === req.email.toLowerCase(),
        );
        if (found) {
          targetId = found.id;
          break;
        }
        if (list.users.length < 100) break;
      }
      if (!targetId) throw new Error("No account exists for this email");

      const { error: upErr } = await supabaseAdmin.auth.admin.updateUserById(targetId, {
        password: data.tempPassword,
      });
      if (upErr) throw new Error(upErr.message);
    }

    const { error: stErr } = await supabaseAdmin
      .from("password_reset_requests")
      .update({ status: data.action })
      .eq("id", data.id);
    if (stErr) throw new Error(stErr.message);
    return { ok: true };
  });
