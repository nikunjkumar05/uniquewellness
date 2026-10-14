import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  LayoutDashboard,
  Plus,
  Users,
  Video,
} from "lucide-react";
import { clearClassAttendance, upsertClassAttendance } from "@/lib/attendance.functions";
import {
  ConfirmAction,
  EmptyState,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/ui";

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

type MonthlyAttendanceCounts = {
  present: number;
  absent: number;
};

type StudentRow = {
  student_id: string;
  name: string;
  phone: string;
  email: string;
  course_id: string;
  course_title: string;
};

const TAB_TRIGGER_CLASS =
  "flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm";
const TAB_LIST_CLASS =
  "flex h-auto w-fit flex-wrap gap-1 rounded-2xl border border-white/60 bg-white/70 p-1.5 shadow-sm backdrop-blur";

function CoachDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const upsertAttendance = useServerFn(upsertClassAttendance);
  const clearAttendance = useServerFn(clearClassAttendance);
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [attendanceByClass, setAttendanceByClass] = useState<Record<string, boolean | undefined>>({});
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [students, setStudents] = useState<number>(0);
  const [startingClassId, setStartingClassId] = useState<string | null>(null);
  const [attendanceMonth, setAttendanceMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [monthlyTotalsByCourse, setMonthlyTotalsByCourse] = useState<Record<string, number>>({});
  const [monthlyAttendanceByStudentCourse, setMonthlyAttendanceByStudentCourse] = useState<
    Record<string, MonthlyAttendanceCounts>
  >({});
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlyError, setMonthlyError] = useState<string | null>(null);
  const [showAllClasses, setShowAllClasses] = useState(false);
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
      await loadAttendance(selectedClassId);
    })();
  }, [selectedClassId, user]);

  useEffect(() => {
    if (!user) return;
    if (!attendanceMonth) return;

    const monthStart = new Date(`${attendanceMonth}-01T00:00:00`);
    if (Number.isNaN(monthStart.getTime())) return;
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const monthClasses = classes.filter((cls) => {
      const startsAt = new Date(cls.scheduled_at).getTime();
      return startsAt >= monthStart.getTime() && startsAt < monthEnd.getTime() && startsAt <= Date.now();
    });

    const totals: Record<string, number> = {};
    monthClasses.forEach((cls) => {
      if (!cls.course_id) return;
      totals[cls.course_id] = (totals[cls.course_id] ?? 0) + 1;
    });
    setMonthlyTotalsByCourse(totals);

    const classIds = monthClasses.map((cls) => cls.id);
    if (classIds.length === 0) {
      setMonthlyAttendanceByStudentCourse({});
      setMonthlyError(null);
      return;
    }

    const classToCourse = new Map(monthClasses.map((cls) => [cls.id, cls.course_id] as const));
    setMonthlyLoading(true);
    setMonthlyError(null);

    (async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("class_id, student_id, present")
        .in("class_id", classIds);

      if (error) {
        setMonthlyError(error.message);
        setMonthlyAttendanceByStudentCourse({});
        return;
      }

      const records = (data || []) as { class_id: string; student_id: string; present: boolean }[];
      const counts: Record<string, MonthlyAttendanceCounts> = {};
      records.forEach((row) => {
        const courseId = classToCourse.get(row.class_id);
        if (!courseId) return;
        const key = `${row.student_id}:${courseId}`;
        const current = counts[key] ?? { present: 0, absent: 0 };
        if (row.present) current.present += 1;
        else current.absent += 1;
        counts[key] = current;
      });
      setMonthlyAttendanceByStudentCourse(counts);
    })()
      .catch((e: unknown) => {
        setMonthlyError(e instanceof Error ? e.message : "Failed to load monthly attendance");
        setMonthlyAttendanceByStudentCourse({});
      })
      .finally(() => setMonthlyLoading(false));
  }, [attendanceMonth, classes, user]);

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
          email: profile?.email || "—",
          course_id: enrollment.course_id,
          course_title: course?.title || "—",
        } satisfies StudentRow;
      });
  }, [courses, enrollments, profiles, selectedClass]);

  const presentCount = roster.filter((student) => attendanceByClass[student.student_id] === true).length;
  const upcoming = useMemo(
    () =>
      classes
        .filter((c) => new Date(c.scheduled_at) > new Date() && c.status !== "ended")
        .sort((a, b) => +new Date(a.scheduled_at) - +new Date(b.scheduled_at)),
    [classes],
  );

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

  async function enterRoom(cls: LiveClass) {
    if (cls.status === "ended") {
      toast.error("This class has ended");
      return;
    }
    setStartingClassId(cls.id);
    try {
      if (cls.status !== "live") {
        const { error } = await supabase.from("live_classes").update({ status: "live" }).eq("id", cls.id);
        if (error) {
          toast.error(error.message);
          return;
        }
        await reload();
      }
      navigate({ to: "/live-room" });
    } finally {
      setStartingClassId(null);
    }
  }

  async function endClassNow(cls: LiveClass) {
    if (cls.status === "ended") return;
    const { error } = await supabase.from("live_classes").update({ status: "ended" }).eq("id", cls.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Class ended");
    await reload();
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

  async function loadAttendance(classId: string) {
    const { data: attendance } = await supabase
      .from("attendance")
      .select("id, class_id, student_id, present, marked_at")
      .eq("class_id", classId);

    const map: Record<string, boolean | undefined> = {};
    (attendance || []).forEach((row) => {
      map[row.student_id] = row.present;
    });
    setAttendanceByClass(map);
  }

  async function markAttendance(studentId: string, present: boolean) {
    if (!selectedClassId) return;
    setAttendanceByClass((current) => ({ ...current, [studentId]: present }));

    const { error } = await supabase.from("attendance").upsert(
      {
        class_id: selectedClassId,
        student_id: studentId,
        present,
      },
      { onConflict: "class_id,student_id" },
    );

    if (!error) {
      return;
    }

    try {
      await upsertAttendance({ data: { classId: selectedClassId, studentId, present } });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : error.message);
      await loadAttendance(selectedClassId);
    }
  }

  async function unmarkAttendance(studentId: string) {
    if (!selectedClassId) return;

    setAttendanceByClass((current) => {
      const next = { ...current };
      delete next[studentId];
      return next;
    });

    const { error } = await supabase
      .from("attendance")
      .delete()
      .eq("class_id", selectedClassId)
      .eq("student_id", studentId);

    if (!error) {
      return;
    }

    try {
      await clearAttendance({ data: { classId: selectedClassId, studentId } });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : error.message);
      await loadAttendance(selectedClassId);
    }
  }

  function classCard(c: LiveClass, compact = false) {
    return (
      <div
        key={c.id}
        className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-background/60 p-4 ${selectedClassId === c.id ? "border-primary ring-1 ring-primary" : "border-border"}`}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{c.title}</span>
            <StatusBadge status={c.status} />
          </div>
          <div className="text-xs text-muted-foreground">
            {new Date(c.scheduled_at).toLocaleString()} · {c.duration_min} min
          </div>
          {!compact && (
            <div className="text-xs text-muted-foreground">
              Course: {courses.find((cc) => cc.id === c.course_id)?.title || "—"}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!compact && (
            <Button variant="outline" size="sm" onClick={() => setSelectedClassId(c.id)}>
              Attendance
            </Button>
          )}
          <ConfirmAction
            title={`End "${c.title}"?`}
            description="Students will no longer be able to join this class."
            confirmLabel="End class"
            onConfirm={() => endClassNow(c)}
          >
            <Button variant="destructive" size="sm" disabled={c.status === "ended"}>
              End class
            </Button>
          </ConfirmAction>
          <Button
            size="sm"
            disabled={startingClassId === c.id || c.status === "ended"}
            onClick={() => void enterRoom(c)}
            className="font-bold"
          >
            {c.status === "ended" ? "Ended" : startingClassId === c.id ? "Starting…" : "Enter room"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Coach Dashboard"
        subtitle="Schedule classes, run live rooms, and track attendance."
      />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Courses" value={courses.length} icon={<BookOpen size={18} />} />
        <StatCard label="Students" value={students} icon={<Users size={18} />} />
        <StatCard label="Upcoming" value={upcoming.length} icon={<CalendarClock size={18} />} />
      </div>

      <Tabs defaultValue="overview">
        <TabsList className={TAB_LIST_CLASS}>
          <TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
            <LayoutDashboard size={15} /> Overview
          </TabsTrigger>
          <TabsTrigger value="classes" className={TAB_TRIGGER_CLASS}>
            <Video size={15} /> Classes
          </TabsTrigger>
          <TabsTrigger value="attendance" className={TAB_TRIGGER_CLASS}>
            <ClipboardCheck size={15} /> Attendance
          </TabsTrigger>
          <TabsTrigger value="students" className={TAB_TRIGGER_CLASS}>
            <Users size={15} /> Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <SectionCard
            title="Up next"
            subtitle={upcoming.length ? `${upcoming.length} upcoming class${upcoming.length === 1 ? "" : "es"}` : undefined}
          >
            {upcoming.length === 0 ? (
              <EmptyState
                title="Nothing scheduled"
                hint="Schedule your next class from the Classes tab."
                icon={<Video size={20} />}
              />
            ) : (
              <div className="space-y-2">{upcoming.slice(0, 3).map((c) => classCard(c, true))}</div>
            )}
          </SectionCard>

          <SectionCard title="My courses">
            {courses.length === 0 ? (
              <EmptyState title="No courses assigned" hint="Ask an admin to assign you a course." />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {courses.map((c) => {
                  const count = enrollments.filter((e) => e.course_id === c.id).length;
                  return (
                    <div key={c.id} className="rounded-2xl border border-border bg-background/60 p-4">
                      <div className="font-semibold">{c.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {count} student{count === 1 ? "" : "s"} enrolled
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="classes" className="mt-4 space-y-4">
          <SectionCard title="Schedule a class">
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
            <Button onClick={scheduleClass} className="mt-4 font-bold">
              <Plus size={15} className="mr-1" /> Schedule class
            </Button>
          </SectionCard>

          <SectionCard title={`All classes (${classes.length})`}>
            {classes.length === 0 ? (
              <EmptyState title="No classes yet" hint="Your scheduled classes appear here." icon={<Video size={20} />} />
            ) : (
              <div className="space-y-2">
                {(showAllClasses ? classes : classes.slice(0, 5)).map((c) => classCard(c))}
                {classes.length > 5 && (
                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowAllClasses((current) => !current)}
                      className="font-bold"
                    >
                      {showAllClasses ? "Show less" : `Show more (${classes.length - 5})`}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="attendance" className="mt-4">
          <SectionCard
            title="Mark attendance"
            subtitle={selectedClass ? `${selectedClass.title} · ${roster.length} students · ${presentCount} present` : "Pick a class to begin"}
            actions={
              classes.length > 0 ? (
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : undefined
            }
          >
            {roster.length ? (
              <div className="space-y-2">
                {roster.map((student) => {
                  const status = attendanceByClass[student.student_id];
                  return (
                    <div
                      key={`${selectedClassId}-${student.student_id}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background/60 p-4"
                    >
                      <div>
                        <div className="font-semibold">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.phone}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={status === undefined ? "secondary" : "outline"}
                          onClick={() => void unmarkAttendance(student.student_id)}
                        >
                          Unmarked
                        </Button>
                        <Button
                          size="sm"
                          variant={status === true ? "default" : "outline"}
                          onClick={() => void markAttendance(student.student_id, true)}
                        >
                          Present
                        </Button>
                        <Button
                          size="sm"
                          variant={status === false ? "destructive" : "outline"}
                          onClick={() => void markAttendance(student.student_id, false)}
                        >
                          Absent
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="No students for this class" hint="Students appear once enrolled in the class course." />
            )}
          </SectionCard>
        </TabsContent>

        <TabsContent value="students" className="mt-4 space-y-4">
          <SectionCard
            title={`Student roster (${roster.length})`}
            subtitle="Everyone enrolled in your courses."
          >
            {roster.length === 0 ? (
              <EmptyState title="No students yet" hint="Enrolled students appear here." />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2">Student</th>
                      <th>Phone</th>
                      <th>Course</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((student) => (
                      <tr key={`${student.student_id}-${student.course_id}`} className="border-t border-border">
                        <td className="py-3 font-semibold">{student.name}</td>
                        <td>{student.phone}</td>
                        <td>{student.course_title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Monthly attendance"
            actions={
              <div className="flex items-center gap-3">
                <Label className="text-sm text-muted-foreground">Month</Label>
                <Input
                  type="month"
                  value={attendanceMonth}
                  onChange={(event) => setAttendanceMonth(event.target.value)}
                  className="w-40"
                />
              </div>
            }
          >
            {monthlyError && <p className="mt-3 text-sm text-destructive">{monthlyError}</p>}
            {monthlyLoading && <p className="mt-3 text-sm text-muted-foreground">Loading…</p>}
            {roster.length === 0 ? (
              <EmptyState title="No students assigned" hint="Monthly totals appear once students enroll." />
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-muted-foreground">
                    <tr>
                      <th className="py-2">Student</th>
                      <th>Course</th>
                      <th>Present</th>
                      <th>Absent</th>
                      <th>Unmarked</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roster.map((student) => {
                      const total = monthlyTotalsByCourse[student.course_id] ?? 0;
                      const key = `${student.student_id}:${student.course_id}`;
                      const counts = monthlyAttendanceByStudentCourse[key] ?? { present: 0, absent: 0 };
                      const marked = counts.present + counts.absent;
                      const unmarked = Math.max(0, total - marked);

                      return (
                        <tr key={`month-${student.student_id}-${student.course_id}`} className="border-t border-border">
                          <td className="py-3 font-semibold">{student.name}</td>
                          <td>{student.course_title}</td>
                          <td>{counts.present}</td>
                          <td>{counts.absent}</td>
                          <td>{unmarked}</td>
                          <td>{total}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
