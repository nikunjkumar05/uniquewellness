import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/coach")({
  head: () => ({ meta: [{ title: "Coach Dashboard — UWI" }] }),
  component: CoachDashboard,
});

function CoachDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<
    {
      id: string;
      title: string;
      scheduled_at: string;
      duration_min: number;
      enablex_room_id: string | null;
      course_id: string | null;
    }[]
  >([]);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [students, setStudents] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: cls } = await supabase
        .from("live_classes")
        .select("*")
        .eq("coach_id", user.id)
        .order("scheduled_at", { ascending: false });
      const { data: crs } = await supabase
        .from("courses")
        .select("id, title")
        .eq("coach_id", user.id);
      setClasses(cls || []);
      setCourses(crs || []);
      if (crs?.length) {
        const { data: enr } = await supabase
          .from("enrollments")
          .select("id")
          .in(
            "course_id",
            crs.map((c) => c.id),
          );
        setStudents(enr?.length || 0);
      }
    })();
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl">Coach Dashboard</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-strong rounded-2xl p-5">
          <div className="text-xs uppercase text-muted-foreground">Courses</div>
          <div className="text-3xl font-display">{courses.length}</div>
        </div>
        <div className="glass-strong rounded-2xl p-5">
          <div className="text-xs uppercase text-muted-foreground">Students</div>
          <div className="text-3xl font-display">{students}</div>
        </div>
        <div className="glass-strong rounded-2xl p-5">
          <div className="text-xs uppercase text-muted-foreground">Classes</div>
          <div className="text-3xl font-display">{classes.length}</div>
        </div>
      </div>

      <Card className="glass-strong rounded-2xl p-5">
        <h2 className="text-2xl mb-4">My classes</h2>
        <div className="space-y-2">
          {classes.map((c) => (
            <div
              key={c.id}
              className="glass rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3"
            >
              <div>
                <div className="font-semibold">{c.title}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(c.scheduled_at).toLocaleString()} · {c.duration_min} min
                </div>
                <div className="text-xs text-muted-foreground">
                  Course: {courses.find((cc) => cc.id === c.course_id)?.title || "—"}
                </div>
              </div>
              <Link
                to="/live-room"
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
              >
                Enter room
              </Link>
            </div>
          ))}
          {classes.length === 0 && (
            <p className="text-muted-foreground">No classes scheduled yet.</p>
          )}
        </div>
      </Card>

      <Card className="glass-strong rounded-2xl p-5">
        <h2 className="text-2xl mb-4">My courses</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {courses.map((c) => (
            <div key={c.id} className="glass rounded-2xl p-4 font-semibold">
              {c.title}
            </div>
          ))}
          {courses.length === 0 && <p className="text-muted-foreground">No courses assigned.</p>}
        </div>
      </Card>
    </div>
  );
}
