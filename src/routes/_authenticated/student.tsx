import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/student")({
  head: () => ({ meta: [{ title: "Student Dashboard — UWI" }] }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<
    { id: string; course_id: string; fee_amount: number; status: string }[]
  >([]);
  const [courses, setCourses] = useState<
    { id: string; title: string; description: string | null; category: string }[]
  >([]);
  const [classes, setClasses] = useState<
    {
      id: string;
      title: string;
      scheduled_at: string;
      duration_min: number;
      course_id: string | null;
    }[]
  >([]);
  const [fees, setFees] = useState<
    { id: string; amount: number; period: string; status: string }[]
  >([]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: enr } = await supabase
        .from("enrollments")
        .select("*")
        .eq("student_id", user.id);
      setEnrollments(enr || []);
      const courseIds = (enr || []).map((e) => e.course_id);
      if (courseIds.length) {
        const { data: crs } = await supabase
          .from("courses")
          .select("id, title, description, category")
          .in("id", courseIds);
        setCourses(crs || []);
        const { data: cls } = await supabase
          .from("live_classes")
          .select("*")
          .in("course_id", courseIds)
          .order("scheduled_at", { ascending: true });
        setClasses(cls || []);
      }
      const { data: f } = await supabase
        .from("fees")
        .select("*")
        .eq("student_id", user.id)
        .order("period", { ascending: false });
      setFees(f || []);
    })();
  }, [user]);

  const upcoming = classes.filter((c) => new Date(c.scheduled_at) > new Date());
  const unpaidTotal = fees
    .filter((f) => f.status === "unpaid")
    .reduce((a, b) => a + Number(b.amount), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-4xl">Welcome back</h1>

      <div className="grid grid-cols-3 gap-4">
        <div className="glass-strong rounded-2xl p-5">
          <div className="text-xs uppercase text-muted-foreground">Courses</div>
          <div className="text-3xl font-display">{enrollments.length}</div>
        </div>
        <div className="glass-strong rounded-2xl p-5">
          <div className="text-xs uppercase text-muted-foreground">Upcoming classes</div>
          <div className="text-3xl font-display">{upcoming.length}</div>
        </div>
        <div className="glass-strong rounded-2xl p-5">
          <div className="text-xs uppercase text-muted-foreground">Unpaid (₹)</div>
          <div className="text-3xl font-display">{unpaidTotal}</div>
        </div>
      </div>

      <Card className="glass-strong rounded-2xl p-5">
        <h2 className="text-2xl mb-4">Upcoming Live Classes</h2>
        <div className="space-y-2">
          {upcoming.map((c) => (
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
                  {courses.find((cc) => cc.id === c.course_id)?.title || ""}
                </div>
              </div>
              <Link
                to="/live-room"
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
              >
                Join
              </Link>
            </div>
          ))}
          {upcoming.length === 0 && <p className="text-muted-foreground">No upcoming classes.</p>}
        </div>
      </Card>

      <Card className="glass-strong rounded-2xl p-5">
        <h2 className="text-2xl mb-4">My courses</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {courses.map((c) => (
            <div key={c.id} className="glass rounded-2xl p-4">
              <div className="text-xs uppercase text-muted-foreground">{c.category}</div>
              <div className="font-semibold">{c.title}</div>
              {c.description && <p className="text-sm mt-1">{c.description}</p>}
            </div>
          ))}
          {courses.length === 0 && (
            <p className="text-muted-foreground">No active enrollments yet. Speak to admin.</p>
          )}
        </div>
      </Card>

      <Card className="glass-strong rounded-2xl p-5">
        <h2 className="text-2xl mb-4">Fees & invoices</h2>
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="py-2">Period</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f) => (
              <tr key={f.id} className="border-t border-border">
                <td className="py-2">{f.period}</td>
                <td>₹{f.amount}</td>
                <td>
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${f.status === "paid" ? "bg-primary text-primary-foreground" : "bg-destructive/10 text-destructive"}`}
                  >
                    {f.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {fees.length === 0 && <p className="text-muted-foreground">No fee items yet.</p>}
      </Card>
    </div>
  );
}
