import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { randomBytes, scryptSync } from "crypto";

export const requestPasswordChange = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        email: z.string().email().max(255),
        full_name: z.string().max(120).optional(),
        consent: z.boolean(),
        new_password: z.string().min(6).max(72),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { email, full_name, consent, new_password } = data;
    if (!consent) throw new Error("Consent required");

    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(new_password, salt, 64).toString("hex");
    const stored = `${salt}:${hash}`;

    const { error } = await supabaseAdmin.from("password_reset_requests").insert([
      {
        email,
        full_name: full_name ?? null,
        consent,
        new_password_hash: stored,
        status: "pending",
      },
    ]);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
