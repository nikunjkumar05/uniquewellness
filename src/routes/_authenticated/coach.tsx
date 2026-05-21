import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/coach")({
  head: () => ({ meta: [{ title: "Coach Dashboard — UWI" }] }),
  component: CoachDashboard,
});

type Course = {
  id: string;
  title: string;
};

type LiveClass = {
  id: string;
  title: string;
  scheduled_at: string;
  duration_min: number;
  enablex_room_id: string | null;
  course_id: string | null;
  status: string;
};

type Profile = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  username: string | null;
};

type Enrollment = {
  id: string;
  student_id: string;
  course_id: string;
};

type AttendanceRecord = {
  id: string;
  class_id: string;
  student_id: string;
  present: boolean;
  marked_at: string;
};

type StudentRow = {
  student_id: string;
  name: string;
  phone: string;
  username: string;
  email: string;
  course_id: string;
  course_title: string;
};

function CoachDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendanceByClass, setAttendanceByClass] = useState<Record<string, boolean>>({});
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [students, setStudents] = useState<number>(0);
  const [scheduleForm, setScheduleForm] = useState({
    title: "",
    course_id: "",
    scheduled_at: "",
    duration_min: 60,
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: cls } = await supabase
        .from("live_classes")
        .select("id, title, scheduled_at, duration_min, enablex_room_id, course_id, status")
        .eq("coach_id", user.id)
        .order("scheduled_at", { ascending: false });
      const { data: crs } = await supabase
        .from("courses")
        .select("id, title")
        .eq("coach_id", user.id);
      setClasses(cls || []);
      setCourses(crs || []);

      const courseIds = (crs || []).map((course) => course.id);
      if (courseIds.length) {
        const { data: enr } = await supabase
          .from("enrollments")
          .select("id, student_id, course_id")
          .in("course_id", courseIds);
        const studentIds = Array.from(new Set((enr || []).map((row) => row.student_id)));
        setEnrollments((enr || []) as Enrollment[]);

        if (studentIds.length) {
          const { data: profs } = await supabase
            .from("profiles")
            .select("user_id, full_name, email, phone, username")
            .in("user_id", studentIds);
          setProfiles((profs || []) as Profile[]);
          setStudents(studentIds.length);
        } else {
          setProfiles([]);
          setStudents(0);
        }
      } else {
        setEnrollments([]);
        setProfiles([]);
        setStudents(0);
      }

    })();
  }, [user]);

  useEffect(() => {
    if (!selectedClassId && classes.length) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  useEffect(() => {
    if (!user || !selectedClassId) return;
    (async () => {
      const { data: attendance } = await supabase
        .from("attendance")
        .select("id, class_id, student_id, present, marked_at")
        .eq("class_id", selectedClassId);
      const map: Record<string, boolean> = {};
      (attendance || []).forEach((row) => {
        map[row.student_id] = row.present;
      });
      setAttendanceByClass(map);
    })();
  }, [selectedClassId, user]);

  const selectedClass = useMemo(
    () => classes.find((cls) => cls.id === selectedClassId) || null,
    [classes, selectedClassId],
  );

  const roster = useMemo(() => {
    const selectedCourseId = selectedClass?.course_id;
    return enrollments
      .filter((enrollment) => !selectedCourseId || enrollment.course_id === selectedCourseId)
      .map((enrollment) => {
        const profile = profiles.find((item) => item.user_id === enrollment.student_id);
        const course = courses.find((item) => item.id === enrollment.course_id);
        return {
          student_id: enrollment.student_id,
          name: profile?.full_name || profile?.email || enrollment.student_id.slice(0, 8),
          phone: profile?.phone || "—",
          username: profile?.username || "—",
          email: profile?.email || "—",
          course_id: enrollment.course_id,
          course_title: course?.title || "—",
        } satisfies StudentRow;
      });
  }, [courses, enrollments, profiles, selectedClass]);

  const presentCount = roster.filter((student) => attendanceByClass[student.student_id]).length;

  async function reload() {
    if (!user) return;
    const { data: cls } = await supabase
      .from("live_classes")
      .select("id, title, scheduled_at, duration_min, enablex_room_id, course_id, status")
      .eq("coach_id", user.id)
      .order("scheduled_at", { ascending: false });
    setClasses((cls || []) as LiveClass[]);
    if (!selectedClassId && cls?.length) {
      setSelectedClassId(cls[0].id);
    }
  }

  async function scheduleClass() {
    if (!scheduleForm.title.trim()) return toast.error("Title is required");
    if (!scheduleForm.course_id) return toast.error("Pick a course");
    if (!scheduleForm.scheduled_at) return toast.error("Pick a date and time");

    const scheduledAt = new Date(scheduleForm.scheduled_at);
    if (Number.isNaN(scheduledAt.getTime())) return toast.error("Invalid schedule time");

    const { error } = await supabase.from("live_classes").insert({
      title: scheduleForm.title.trim(),
      course_id: scheduleForm.course_id,
      coach_id: user?.id || null,
      scheduled_at: scheduledAt.toISOString(),
      duration_min: Number(scheduleForm.duration_min) || 60,
    });
    if (error) return toast.error(error.message);

    toast.success("Class scheduled");
    setScheduleForm({ title: "", course_id: "", scheduled_at: "", duration_min: 60 });
    await reload();
  }

  async function markAttendance(studentId: string, present: boolean) {
    if (!selectedClassId) return;
    const { error } = await supabase.from("attendance").upsert(
      {
        class_id: selectedClassId,
        student_id: studentId,
        present,
      },
      { onConflict: "class_id,student_id" },
    );
    if (error) {
      toast.error(error.message);
      return;
    }
    setAttendanceByClass((current) => ({ ...current, [studentId]: present }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl sm:text-5xl section-title">Coach Dashboard</h1>
        <p className="text-muted-foreground">Schedule classes, track students, and mark attendance.</p>
      </div>

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

      <Card className="glass-strong rounded-2xl p-5 space-y-4">
        <h2 className="text-2xl">Schedule a class</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Class title</Label>
            <Input
              value={scheduleForm.title}
              onChange={(event) => setScheduleForm({ ...scheduleForm, title: event.target.value })}
              placeholder="e.g. Tactical patterns"
            />
          </div>
          <div>
            <Label>Course</Label>
            <Select
              value={scheduleForm.course_id}
              onValueChange={(value) => setScheduleForm({ ...scheduleForm, course_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Date & time</Label>
            <Input
              type="datetime-local"
              value={scheduleForm.scheduled_at}
              onChange={(event) =>
                setScheduleForm({ ...scheduleForm, scheduled_at: event.target.value })
              }
            />
          </div>
          <div>
            <Label>Duration (minutes)</Label>
            <Input
              type="number"
              value={scheduleForm.duration_min}
              onChange={(event) =>
                setScheduleForm({ ...scheduleForm, duration_min: Number(event.target.value) })
              }
            />
          </div>
        </div>
        <Button onClick={scheduleClass} className="font-bold">
          Schedule class
        </Button>
      </Card>

      <Card className="glass-strong rounded-2xl p-5">
        <h2 className="text-2xl mb-4">My classes</h2>
        <div className="space-y-2">
          {classes.map((c) => (
            <div
              key={c.id}
              className={`glass rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3 ${selectedClassId === c.id ? "ring-2 ring-primary" : ""}`}
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
              <div className="flex items-center gap-2 flex-wrap">
                <Button variant="outline" size="sm" onClick={() => setSelectedClassId(c.id)}>
                  Manage attendance
                </Button>
                <Link
                  to="/live-room"
                  className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
                >
                  Enter room
                </Link>
              </div>
            </div>
          ))}
          {classes.length === 0 && (
            <p className="text-muted-foreground">No classes scheduled yet.</p>
          )}
        </div>
      </Card>

      <Card className="glass-strong rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-2xl">Student roster</h2>
          <div className="text-sm text-muted-foreground">
            {roster.length} students · {presentCount} marked present
          </div>
        </div>
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2">Student</th>
                <th>Phone</th>
                <th>Username</th>
                <th>Course</th>
              </tr>
            </thead>
            <tbody>
              {roster.map((student) => (
                <tr key={`${student.student_id}-${student.course_id}`} className="border-t border-border">
                  <td className="py-3 font-semibold">{student.name}</td>
                  <td>{student.phone}</td>
                  <td>{student.username}</td>
                  <td>{student.course_title}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="glass-strong rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-2xl">Attendance</h2>
          <div className="text-sm text-muted-foreground">
            {selectedClass?.title || "Pick a class"}
          </div>
        </div>
        <div className="space-y-2 mt-4">
          {roster.length ? (
            roster.map((student) => {
              const present = Boolean(attendanceByClass[student.student_id]);
              return (
                <div
                  key={`${selectedClassId}-${student.student_id}`}
                  className="glass rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3"
                >
                  <div>
                    <div className="font-semibold">{student.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {student.phone} · {student.username}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={present ? "default" : "outline"}
                      onClick={() => void markAttendance(student.student_id, true)}
                      className="font-bold"
                    >
                      Present
                    </Button>
                    <Button
                      size="sm"
                      variant={!present ? "default" : "outline"}
                      onClick={() => void markAttendance(student.student_id, false)}
                      className="font-bold"
                    >
                      Absent
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground">No students assigned to this class yet.</p>
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
