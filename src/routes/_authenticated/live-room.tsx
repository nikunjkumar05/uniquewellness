import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/live-room")({
  head: () => ({ meta: [{ title: "Live Classes — UWI" }] }),
  component: LiveRoomPage,
});

type LiveClass = {
  id: string;
  title: string;
  scheduled_at: string;
  duration_min: number;
  enablex_room_id: string | null;
  course_id: string | null;
  status: string;
};

type Course = {
  id: string;
  title: string;
};

function LiveRoomPage() {
  const { role } = useAuth();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const MODERATOR_URL =
    "https://uniquewellness.yourvideo.live/host/NmEwODYyNDlhZDJhNDcyYjU5MjE3ODY0LTZhMDg2MjE5YzIyYzRmNzMzNzA3NDNhZg==";
  const PARTICIPANT_URL = "https://uniquewellness.yourvideo.live/6a086249ad2a472b59217864";

  useEffect(() => {
    (async () => {
      const [classesResult, coursesResult] = await Promise.all([
        supabase
          .from("live_classes")
          .select("id, title, scheduled_at, duration_min, enablex_room_id, course_id, status")
          .order("scheduled_at", { ascending: true }),
        supabase.from("courses").select("id, title"),
      ]);

      setClasses((classesResult.data || []) as LiveClass[]);
      setCourses((coursesResult.data || []) as Course[]);
    })();
  }, [role]);

  const runningClasses = useMemo(() => {
    const now = Date.now();
    return classes.filter((cls) => {
      if (cls.status === "ended") return false;
      const startsAt = new Date(cls.scheduled_at).getTime();
      const endsAt = startsAt + cls.duration_min * 60_000;
      return cls.status === "live" || (startsAt <= now && now < endsAt);
    });
  }, [classes]);

  const courseById = useMemo(
    () => new Map(courses.map((course) => [course.id, course])),
    [courses],
  );

  const iframeUrl = role === "coach" || role === "admin" ? MODERATOR_URL : PARTICIPANT_URL;
  const roleLabel = role === "coach" || role === "admin" ? "Moderator" : "Participant";
  const currentClass = runningClasses[0] || null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold">Live Classes</h1>
        <div className="text-sm text-muted-foreground rounded-lg bg-secondary px-3 py-1">
          {roleLabel} View · {runningClasses.length} running now
        </div>
      </div>

      <Card className="glass-strong rounded-2xl p-5 space-y-4">
        <h2 className="text-2xl">Running classes</h2>
        <div className="space-y-2">
          {runningClasses.map((cls) => {
            const courseTitle = cls.course_id ? courseById.get(cls.course_id)?.title : null;
            const endsAt = new Date(new Date(cls.scheduled_at).getTime() + cls.duration_min * 60_000);
            const remainingMin = Math.max(0, Math.ceil((endsAt.getTime() - Date.now()) / 60_000));

            return (
              <div key={cls.id} className="glass rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-semibold">{cls.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {courseTitle || "Open class"} · Ends in {remainingMin} min
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground">
                  Live now
                </span>
              </div>
            );
          })}
          {runningClasses.length === 0 && (
            <p className="text-muted-foreground">No classes are running right now.</p>
          )}
        </div>
      </Card>

      {currentClass && (
        <Card className="glass-strong rounded-2xl overflow-hidden p-0">
          <iframe
            allow="camera; microphone; fullscreen; speaker; display-capture"
            src={iframeUrl}
            className="w-full min-h-[600px] border-0 rounded-2xl"
            title={`Live Classes - ${roleLabel} View`}
          />
        </Card>
      )}

      <div className="text-xs text-muted-foreground">
        <p>
          {currentClass
            ? role === "coach" || role === "admin"
              ? "You are viewing the moderator interface for the active class."
              : "You are viewing the participant interface for the active class."
            : "Live room access appears only when a class is currently running."}
        </p>
      </div>
    </div>
  );
}
