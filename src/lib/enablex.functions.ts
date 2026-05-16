import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ENABLEX_BASE = "https://api.enablex.io/video/v1";

function readEnv(name: string): string | undefined {
  // Prefer process.env for server/runtime values
  const fromProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } })
    .process?.env?.[name];
  if (fromProcess) return fromProcess;

  // Vite exposes client-side variables under import.meta.env but keys must be
  // referenced statically. Check common Vite-prefixed names explicitly.
  // NOTE: These are fallbacks for dev environments where ENABLEX values may be
  // exposed as VITE_ENABLEX_APP_ID / VITE_ENABLEX_APP_KEY.
  try {
    const ime = import.meta.env as Record<string, string | undefined>;
    if (name === "ENABLEX_APP_ID") return ime.VITE_ENABLEX_APP_ID ?? ime.ENABLEX_APP_ID;
    if (name === "ENABLEX_APP_KEY") return ime.VITE_ENABLEX_APP_KEY ?? ime.ENABLEX_APP_KEY;
  } catch {
    // import.meta may not be available in some server runtimes; ignore
  }

  return undefined;
}

function toBasicAuth(appId: string, key: string): string {
  if (typeof Buffer !== "undefined") {
    return `Basic ${Buffer.from(`${appId}:${key}`).toString("base64")}`;
  }
  if (typeof btoa !== "undefined") {
    return `Basic ${btoa(`${appId}:${key}`)}`;
  }
  throw new Error("Cannot create Basic auth header in this runtime");
}

async function parseEnablexResponse(res: Response): Promise<unknown> {
  const bodyText = await res.text();
  if (!bodyText) return {};
  try {
    return JSON.parse(bodyText);
  } catch {
    return { raw: bodyText };
  }
}

function authHeader() {
  const appId = readEnv("ENABLEX_APP_ID") || readEnv("ENABLEX_APPID");
  const key = readEnv("ENABLEX_APP_KEY") || readEnv("ENABLEX_APPKEY");
  if (!appId) throw new Error("ENABLEX_APP_ID missing");
  if (!key) throw new Error("ENABLEX_APP_KEY missing");
  return toBasicAuth(appId, key);
}

/** Create an EnableX room (admin/coach). Returns { room_id }. */
export const createEnablexRoom = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        title: z.string().min(1).max(120),
        classId: z.string().uuid(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Verify user is admin or coach for this class
    const { data: cls } = await supabase
      .from("live_classes")
      .select("id, coach_id")
      .eq("id", data.classId)
      .maybeSingle();
    if (!cls) throw new Error("Class not found");

    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    if (!isAdmin && cls.coach_id !== userId) throw new Error("Not authorized");

    const body = {
      name: data.title.slice(0, 60),
      owner_ref: userId,
      settings: {
        description: data.title,
        mode: "group",
        scheduled: false,
        adhoc: true,
        duration: 180,
        participants: 25,
        moderators: 2,
        billing_code: "uwi",
        auto_recording: false,
        quality: "SD",
      },
      sip: { enabled: false },
    };

    const res = await fetch(`${ENABLEX_BASE}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader() },
      body: JSON.stringify(body),
    });
    const json = (await parseEnablexResponse(res)) as {
      room?: { room_id?: string };
      result?: number;
      error?: { reason?: string };
      raw?: string;
    };
    if (!res.ok || !json.room?.room_id) {
      throw new Error(json?.error?.reason || json?.raw || `EnableX error (${res.status})`);
    }
    const roomId = json.room.room_id;

    await supabase
      .from("live_classes")
      .update({ enablex_room_id: roomId, status: "live" })
      .eq("id", data.classId);
    return { room_id: roomId };
  });

/** Get a join token for the current user for a given class. */
export const getEnablexJoinToken = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ classId: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: cls } = await supabase
      .from("live_classes")
      .select("id, title, enablex_room_id, coach_id, course_id, status")
      .eq("id", data.classId)
      .maybeSingle();
    if (!cls) throw new Error("Class not found");
    if (cls.status === "ended") throw new Error("This class has ended");
    if (!cls.enablex_room_id) throw new Error("Class room is not yet created");

    // Determine role for this class
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    const isCoach = cls.coach_id === userId;
    let role: "moderator" | "participant" = "participant";
    if (isAdmin || isCoach) role = "moderator";

    // If student: must be enrolled in the course
    if (!isAdmin && !isCoach) {
      if (!cls.course_id) throw new Error("Class is not open to students");
      const { data: enr } = await supabase
        .from("enrollments")
        .select("id")
        .eq("course_id", cls.course_id)
        .eq("student_id", userId)
        .maybeSingle();
      if (!enr) throw new Error("You are not enrolled in this course");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("user_id", userId)
      .maybeSingle();
    const userName = profile?.full_name || profile?.email || "Participant";

    const body = {
      name: userName,
      user_ref: userId,
      role,
      permissions: {
        publish: true,
        subscribe: true,
        record: false,
        hardmute: role === "moderator",
      },
    };
    const res = await fetch(`${ENABLEX_BASE}/rooms/${cls.enablex_room_id}/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: authHeader() },
      body: JSON.stringify(body),
    });
    const json = (await parseEnablexResponse(res)) as {
      token?: string;
      error?: { reason?: string };
      raw?: string;
    };
    if (!res.ok || !json.token) {
      throw new Error(json?.error?.reason || json?.raw || `EnableX token error (${res.status})`);
    }
    return {
      token: json.token,
      room_id: cls.enablex_room_id,
      role,
      name: userName,
      classTitle: cls.title,
    };
  });
