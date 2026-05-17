import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { createStudentAccount } from "@/lib/admin.functions";
import { getPasswordResetRedirectUrl } from "@/lib/auth-redirects";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — UWI" }] }),
  component: AdminDashboard,
});

type Profile = {
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  username: string | null;
};
type Course = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price: number;
  coach_id: string | null;
  is_active: boolean;
  thumbnail_url: string | null;
  seats: number;
  schedule: string | null;
};
type Enrollment = {
  id: string;
  student_id: string;
  course_id: string;
  status: string;
  fee_amount: number;
};
type LiveClass = {
  id: string;
  title: string;
  course_id: string | null;
  coach_id: string | null;
  scheduled_at: string;
  duration_min: number;
  enablex_room_id: string | null;
  status: string;
};
type DemoBooking = {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  message: string | null;
  status: string;
  created_at: string;
  parent_name: string | null;
  student_class: string | null;
  preferred_subject: string | null;
  preferred_timing: string | null;
};
type Fee = {
  id: string;
  student_id: string;
  course_id: string | null;
  amount: number;
  period: string;
  status: string;
  paid_at: string | null;
};

type PasswordRequest = {
  id: string;
  email: string;
  full_name: string | null;
  consent: boolean;
  new_password_hash: string;
  status: string;
  created_at: string;
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass-premium rounded-2xl p-5 hover-lift">
      <div className="text-xs uppercase text-muted-foreground tracking-wider font-bold">
        {label}
      </div>
      <div className="text-4xl stat-value mt-1 text-foreground">{value}</div>
    </div>
  );
}

function AdminDashboard() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [roles, setRoles] = useState<{ user_id: string; role: string }[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [demos, setDemos] = useState<DemoBooking[]>([]);
  const [fees, setFees] = useState<Fee[]>([]);
  const [passwordRequests, setPasswordRequests] = useState<PasswordRequest[]>([]);

  async function reload() {
    const [p, r, c, e, l, d, f] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("courses").select("*").order("created_at", { ascending: false }),
      supabase.from("enrollments").select("*"),
      supabase.from("live_classes").select("*").order("scheduled_at", { ascending: false }),
      supabase.from("demo_bookings").select("*").order("created_at", { ascending: false }),
      supabase.from("fees").select("*").order("created_at", { ascending: false }),
    ]);
    
    // fetch password reset requests
    const pr = await supabase.from("password_reset_requests").select("*").order("created_at", { ascending: false });
    if (p.data) setProfiles(p.data as Profile[]);
    if (r.data) setRoles(r.data as { user_id: string; role: string }[]);
    if (c.data) setCourses(c.data as Course[]);
    if (e.data) setEnrollments(e.data as Enrollment[]);
    if (l.data) setClasses(l.data as LiveClass[]);
    if (d.data) setDemos(d.data as DemoBooking[]);
    if (f.data) setFees(f.data as Fee[]);
    if (pr.data) setPasswordRequests(pr.data as PasswordRequest[]);
  }

  useEffect(() => {
    reload();
  }, []);

  const studentCount = roles.filter((r) => r.role === "student").length;
  const coachCount = roles.filter((r) => r.role === "coach").length;
  const unpaidCount = fees.filter((f) => f.status === "unpaid").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl sm:text-5xl section-title">Admin Dashboard</h1>
        <p className="text-muted-foreground">Run the academy end-to-end.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Students" value={studentCount} />
        <StatCard label="Coaches" value={coachCount} />
        <StatCard label="Courses" value={courses.length} />
        <StatCard label="Unpaid fees" value={unpaidCount} />
      </div>

      <Tabs defaultValue="users">
        <TabsList className="glass rounded-2xl flex-wrap h-auto">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="students">Add Student</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="classes">Live Classes</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="demos">Demo Bookings</TabsTrigger>
          <TabsTrigger value="password-requests">Password Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UsersPanel profiles={profiles} roles={roles} onChange={reload} />
        </TabsContent>
        <TabsContent value="students">
          <QuickAddStudent courses={courses} onChange={reload} />
        </TabsContent>
        <TabsContent value="courses">
          <CoursesPanel courses={courses} profiles={profiles} roles={roles} onChange={reload} />
        </TabsContent>
        <TabsContent value="classes">
          <ClassesPanel
            classes={classes}
            courses={courses}
            profiles={profiles}
            roles={roles}
            onChange={reload}
          />
        </TabsContent>
        <TabsContent value="account">
          <AdminAccountPanel userEmail={user?.email ?? null} />
        </TabsContent>
        <TabsContent value="enrollments">
          <EnrollmentsPanel
            enrollments={enrollments}
            courses={courses}
            profiles={profiles}
            roles={roles}
            onChange={reload}
          />
        </TabsContent>
        <TabsContent value="fees">
          <FeesPanel fees={fees} profiles={profiles} courses={courses} onChange={reload} />
        </TabsContent>
        <TabsContent value="demos">
          <DemoPanel demos={demos} onChange={reload} />
        </TabsContent>
        <TabsContent value="password-requests">
          <Card className="glass-premium rounded-2xl p-5 mt-4">
            <h2 className="text-2xl mb-4 card-title">Password reset requests</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2">Requested At</th>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Consent</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {passwordRequests.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="py-3">{new Date(r.created_at).toLocaleString()}</td>
                      <td>{r.email}</td>
                      <td>{r.full_name || "—"}</td>
                      <td>{r.consent ? "Yes" : "No"}</td>
                      <td>{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AdminAccountPanel({ userEmail }: { userEmail: string | null }) {
  const [newEmail, setNewEmail] = useState("");
  const [busy, setBusy] = useState(false);

  async function changeEmail() {
    if (!newEmail) return toast.error("New email is required");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Verification email sent to the new address");
    setNewEmail("");
  }

  async function sendPasswordReset() {
    if (!userEmail) return toast.error("No signed-in admin email found");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: getPasswordResetRedirectUrl(),
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password reset email sent");
  }

  return (
    <Card className="glass-premium rounded-2xl p-6 mt-4 max-w-2xl space-y-5">
      <div>
        <h2 className="text-2xl card-title">Account & security</h2>
        <p className="text-sm text-muted-foreground">
          Use Supabase Auth emails for verification. This works with free-tier email delivery once
          your project email settings are configured.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-background/60 p-4">
        <div>
          <Label>Current email</Label>
          <Input value={userEmail || ""} disabled />
        </div>
        <div>
          <Label>New email</Label>
          <Input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="admin@example.com"
          />
        </div>
        <Button onClick={changeEmail} disabled={busy} className="font-bold">
          Send email verification
        </Button>
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-background/60 p-4">
        <div>
          <Label>Password reset</Label>
          <p className="text-sm text-muted-foreground">
            Send a reset link to the current admin email. After verifying the link, finish the
            password change on the reset page.
          </p>
        </div>
        <Button onClick={sendPasswordReset} disabled={busy} variant="outline" className="font-bold">
          Email password reset link
        </Button>
      </div>
    </Card>
  );
}

function UsersPanel({
  profiles,
  roles,
  onChange,
}: {
  profiles: Profile[];
  roles: { user_id: string; role: string }[];
  onChange: () => void;
}) {
  async function setRole(userId: string, role: "admin" | "coach" | "student") {
    await supabase.from("user_roles").delete().eq("user_id", userId);
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
    if (error) toast.error(error.message);
    else {
      toast.success("Role updated");
      onChange();
    }
  }
  return (
    <Card className="glass-premium rounded-2xl p-5 mt-4">
      <h2 className="text-2xl mb-4 card-title">All users</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((p) => {
              const role = roles.find((r) => r.user_id === p.user_id)?.role || "student";
              return (
                <tr key={p.user_id} className="border-t border-border">
                  <td className="py-3 font-semibold">{p.full_name || "—"}</td>
                  <td>{p.email}</td>
                  <td>{p.phone || "—"}</td>
                  <td>
                    <Select
                      value={role}
                      onValueChange={(v) => setRole(p.user_id, v as "admin" | "coach" | "student")}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="coach">Coach</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function QuickAddStudent({ courses, onChange }: { courses: Course[]; onChange: () => void }) {
  const create = useServerFn(createStudentAccount);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    username: "",
    course_id: "",
    fee_amount: 0,
  });
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!form.email || !form.password || !form.full_name)
      return toast.error("Email, password, name required");
    setBusy(true);
    try {
      await create({
        data: {
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          username: form.username || undefined,
          course_id: form.course_id || undefined,
          fee_amount: form.fee_amount || 0,
        },
      });
      toast.success("Student account created");
      setForm({
        email: "",
        password: "",
        full_name: "",
        username: "",
        course_id: "",
        fee_amount: 0,
      });
      onChange();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="glass-premium rounded-2xl p-6 mt-4 max-w-2xl space-y-4">
      <h2 className="text-2xl card-title">Quick-add student</h2>
      <p className="text-sm text-muted-foreground">
        Creates an instantly-active account. Student can log in and customize profile later.
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <Label>Full name *</Label>
          <Input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </div>
        <div>
          <Label>Username</Label>
          <Input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="optional"
          />
        </div>
        <div>
          <Label>Email *</Label>
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <Label>Password *</Label>
          <Input
            type="text"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="min 8 chars"
          />
        </div>
        <div>
          <Label>Course</Label>
          <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Optional course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Fee (₹)</Label>
          <Input
            type="number"
            value={form.fee_amount}
            onChange={(e) => setForm({ ...form, fee_amount: Number(e.target.value) })}
          />
        </div>
      </div>
      <Button onClick={submit} disabled={busy} className="font-bold">
        {busy ? "Creating…" : "Create student account"}
      </Button>
    </Card>
  );
}

function CourseFormDialog({
  open,
  onOpenChange,
  course,
  profiles,
  roles,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  course: Course | null;
  profiles: Profile[];
  roles: { user_id: string; role: string }[];
  onSaved: () => void;
}) {
  const empty = {
    title: "",
    description: "",
    category: "chess",
    price: 0,
    coach_id: "",
    thumbnail_url: "",
    seats: 30,
    schedule: "",
    is_active: true,
  };
  const [form, setForm] = useState(empty);
  const [uploading, setUploading] = useState(false);
  const coaches = profiles.filter(
    (p) => roles.find((r) => r.user_id === p.user_id)?.role === "coach",
  );

  useEffect(() => {
    if (course)
      setForm({
        title: course.title,
        description: course.description || "",
        category: course.category,
        price: course.price,
        coach_id: course.coach_id || "",
        thumbnail_url: course.thumbnail_url || "",
        seats: course.seats,
        schedule: course.schedule || "",
        is_active: course.is_active,
      });
    else setForm(empty);
  }, [course, open]);

  async function uploadThumb(file: File) {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `courses/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("course-thumbnails")
      .upload(path, file, { upsert: true });
    if (error) {
      setUploading(false);
      return toast.error(error.message);
    }
    const { data } = supabase.storage.from("course-thumbnails").getPublicUrl(path);
    setForm((f) => ({ ...f, thumbnail_url: data.publicUrl }));
    setUploading(false);
    toast.success("Thumbnail uploaded");
  }

  async function save() {
    if (!form.title) return toast.error("Title required");
    const payload = {
      title: form.title,
      description: form.description || null,
      category: form.category,
      price: Number(form.price),
      coach_id: form.coach_id || null,
      thumbnail_url: form.thumbnail_url || null,
      seats: Number(form.seats),
      schedule: form.schedule || null,
      is_active: form.is_active,
    };
    const { error } = course
      ? await supabase.from("courses").update(payload).eq("id", course.id)
      : await supabase.from("courses").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(course ? "Course updated" : "Course created");
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-premium max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{course ? "Edit course" : "New course"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chess">Chess</SelectItem>
                  <SelectItem value="career">Career</SelectItem>
                  <SelectItem value="wellness">Wellness</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Price (₹)</Label>
              <Input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label>Seats</Label>
              <Input
                type="number"
                value={form.seats}
                onChange={(e) => setForm({ ...form, seats: Number(e.target.value) })}
              />
            </div>
          </div>
          <div>
            <Label>Schedule</Label>
            <Input
              placeholder="e.g. Mon/Wed 5–6pm"
              value={form.schedule}
              onChange={(e) => setForm({ ...form, schedule: e.target.value })}
            />
          </div>
          <div>
            <Label>Coach</Label>
            <Select value={form.coach_id} onValueChange={(v) => setForm({ ...form, coach_id: v })}>
              <SelectTrigger>
                <SelectValue placeholder="Assign a coach" />
              </SelectTrigger>
              <SelectContent>
                {coaches.map((c) => (
                  <SelectItem key={c.user_id} value={c.user_id}>
                    {c.full_name || c.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Thumbnail</Label>
            <div className="flex items-center gap-3">
              {form.thumbnail_url && (
                <img
                  src={form.thumbnail_url}
                  alt="thumb"
                  className="h-16 w-24 object-cover rounded-xl"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && uploadThumb(e.target.files[0])}
                className="text-sm"
              />
              {uploading && <span className="text-xs text-muted-foreground">Uploading…</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            <Label htmlFor="active">Active</Label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={save} className="font-bold">
            {course ? "Save changes" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CoursesPanel({
  courses,
  profiles,
  roles,
  onChange,
}: {
  courses: Course[];
  profiles: Profile[];
  roles: { user_id: string; role: string }[];
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  async function remove(id: string) {
    if (!confirm("Delete this course? Enrollments may be affected.")) return;
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      onChange();
    }
  }

  return (
    <Card className="glass-premium rounded-2xl p-5 mt-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-2xl card-title">Courses</h2>
        <Button
          className="font-bold"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          Add course
        </Button>
      </div>
      <CourseFormDialog
        open={open}
        onOpenChange={setOpen}
        course={editing}
        profiles={profiles}
        roles={roles}
        onSaved={onChange}
      />
      <div className="grid md:grid-cols-2 gap-3">
        {courses.map((c) => (
          <div key={c.id} className="glass rounded-2xl overflow-hidden hover-lift">
            {c.thumbnail_url && (
              <img src={c.thumbnail_url} alt={c.title} className="w-full h-32 object-cover" />
            )}
            <div className="p-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="text-lg card-title truncate">{c.title}</div>
                <div className="text-xs text-muted-foreground uppercase font-bold">
                  {c.category} · ₹{c.price} · {c.seats} seats {!c.is_active && "· INACTIVE"}
                </div>
                {c.schedule && (
                  <div className="text-xs text-muted-foreground mt-1">⏱ {c.schedule}</div>
                )}
                {c.description && <p className="text-sm mt-2 line-clamp-2">{c.description}</p>}
                <div className="text-xs text-muted-foreground mt-2">
                  Coach: {profiles.find((p) => p.user_id === c.coach_id)?.full_name || "Unassigned"}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(c);
                    setOpen(true);
                  }}
                >
                  <Pencil size={14} />
                </Button>
                <Button size="sm" variant="outline" onClick={() => remove(c.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && <p className="text-muted-foreground">No courses yet.</p>}
      </div>
    </Card>
  );
}

function ClassesPanel({
  classes,
  courses,
  profiles,
  roles,
  onChange,
}: {
  classes: LiveClass[];
  courses: Course[];
  profiles: Profile[];
  roles: { user_id: string; role: string }[];
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    course_id: "",
    coach_id: "",
    scheduled_at: "",
    duration_min: 60,
  });
  const coaches = profiles.filter(
    (p) => roles.find((r) => r.user_id === p.user_id)?.role === "coach",
  );

  async function create() {
    const title = form.title.trim();
    if (!title) return toast.error("Title is required");
    if (!form.scheduled_at) return toast.error("Pick a date & time");
    const dt = new Date(form.scheduled_at);
    if (isNaN(dt.getTime())) return toast.error("Invalid date/time");
    const { error } = await supabase.from("live_classes").insert({
      title,
      course_id: form.course_id || null,
      coach_id: form.coach_id || null,
      scheduled_at: dt.toISOString(),
      duration_min: Number(form.duration_min) || 60,
    });
    if (error) return toast.error(error.message);
    toast.success("Class scheduled");
    setOpen(false);
    onChange();
    setForm({ title: "", course_id: "", coach_id: "", scheduled_at: "", duration_min: 60 });
  }
  async function remove(id: string) {
    if (!confirm("Delete this class?")) return;
    const { error } = await supabase.from("live_classes").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      onChange();
    }
  }

  return (
    <Card className="glass-premium rounded-2xl p-5 mt-4">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-2xl card-title">Live Classes</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="font-bold">Schedule class</Button>
          </DialogTrigger>
          <DialogContent className="glass-premium">
            <DialogHeader>
              <DialogTitle>New live class</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Title *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Course</Label>
                <Select
                  value={form.course_id}
                  onValueChange={(v) => setForm({ ...form, course_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Coach</Label>
                <Select
                  value={form.coach_id}
                  onValueChange={(v) => setForm({ ...form, coach_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pick a coach" />
                  </SelectTrigger>
                  <SelectContent>
                    {coaches.map((c) => (
                      <SelectItem key={c.user_id} value={c.user_id}>
                        {c.full_name || c.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <Label>Schedule *</Label>
                  <Input
                    type="datetime-local"
                    value={form.scheduled_at}
                    onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Duration (min)</Label>
                  <Input
                    type="number"
                    value={form.duration_min}
                    onChange={(e) => setForm({ ...form, duration_min: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={create} className="font-bold">
                Schedule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-2">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="glass rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="font-bold">{cls.title}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(cls.scheduled_at).toLocaleString()} · {cls.duration_min} min
              </div>
              <div className="text-xs text-muted-foreground">
                Course: {courses.find((c) => c.id === cls.course_id)?.title || "—"} · Coach:{" "}
                {profiles.find((p) => p.user_id === cls.coach_id)?.full_name || "—"}
              </div>
              <div className="text-xs text-muted-foreground">
                Room: {cls.enablex_room_id ? "✅ ready" : "⏳ not created"}
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                to="/live-room"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover-lift"
              >
                Open
              </Link>
              <Button size="sm" variant="outline" onClick={() => remove(cls.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
        {classes.length === 0 && <p className="text-muted-foreground">No classes scheduled.</p>}
      </div>
    </Card>
  );
}

function EnrollmentsPanel({
  enrollments,
  courses,
  profiles,
  roles,
  onChange,
}: {
  enrollments: Enrollment[];
  courses: Course[];
  profiles: Profile[];
  roles: { user_id: string; role: string }[];
  onChange: () => void;
}) {
  const students = profiles.filter(
    (p) => roles.find((r) => r.user_id === p.user_id)?.role === "student",
  );
  const [form, setForm] = useState({ student_id: "", course_id: "", fee_amount: 0 });

  async function add() {
    if (!form.student_id || !form.course_id) return toast.error("Pick student & course");
    const { error } = await supabase.from("enrollments").insert({
      student_id: form.student_id,
      course_id: form.course_id,
      fee_amount: Number(form.fee_amount),
    });
    if (error) return toast.error(error.message);
    toast.success("Enrolled");
    onChange();
    setForm({ student_id: "", course_id: "", fee_amount: 0 });
  }
  async function remove(id: string) {
    const { error } = await supabase.from("enrollments").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Removed");
      onChange();
    }
  }

  return (
    <Card className="glass-premium rounded-2xl p-5 mt-4 space-y-4">
      <h2 className="text-2xl card-title">Enrollments</h2>
      <div className="grid md:grid-cols-4 gap-3">
        <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Student" />
          </SelectTrigger>
          <SelectContent>
            {students.map((s) => (
              <SelectItem key={s.user_id} value={s.user_id}>
                {s.full_name || s.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Course" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Fee ₹"
          value={form.fee_amount}
          onChange={(e) => setForm({ ...form, fee_amount: Number(e.target.value) })}
        />
        <Button onClick={add} className="font-bold">
          Enroll
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="py-2">Student</th>
              <th>Course</th>
              <th>Fee</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((e) => (
              <tr key={e.id} className="border-t border-border">
                <td className="py-2 font-semibold">
                  {profiles.find((p) => p.user_id === e.student_id)?.full_name ||
                    e.student_id.slice(0, 8)}
                </td>
                <td>{courses.find((c) => c.id === e.course_id)?.title || "—"}</td>
                <td>₹{e.fee_amount}</td>
                <td>{e.status}</td>
                <td>
                  <Button size="sm" variant="outline" onClick={() => remove(e.id)}>
                    <Trash2 size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function FeesPanel({
  fees,
  profiles,
  courses,
  onChange,
}: {
  fees: Fee[];
  profiles: Profile[];
  courses: Course[];
  onChange: () => void;
}) {
  const [form, setForm] = useState({
    student_id: "",
    course_id: "",
    amount: 0,
    period: new Date().toISOString().slice(0, 7),
  });

  async function add() {
    if (!form.student_id) return toast.error("Pick student");
    const { error } = await supabase.from("fees").insert({
      student_id: form.student_id,
      course_id: form.course_id || null,
      amount: Number(form.amount),
      period: form.period,
    });
    if (error) return toast.error(error.message);
    toast.success("Fee added");
    onChange();
  }
  async function bulkApply() {
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("student_id, course_id, fee_amount");
    if (!enrollments?.length) return toast.error("No enrollments to apply");
    const period = form.period;
    const rows = enrollments.map((e) => ({
      student_id: e.student_id,
      course_id: e.course_id,
      amount: e.fee_amount,
      period,
    }));
    const { error } = await supabase.from("fees").insert(rows);
    if (error) toast.error(error.message);
    else {
      toast.success(`Applied ${rows.length} fees for ${period}`);
      onChange();
    }
  }
  async function toggleStatus(f: Fee) {
    const next = f.status === "paid" ? "unpaid" : "paid";
    const { error } = await supabase
      .from("fees")
      .update({ status: next, paid_at: next === "paid" ? new Date().toISOString() : null })
      .eq("id", f.id);
    if (error) toast.error(error.message);
    else onChange();
  }
  async function remove(id: string) {
    if (!confirm("Delete this fee record?")) return;
    const { error } = await supabase.from("fees").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      onChange();
    }
  }
  function exportCsv() {
    const rows = [["Student", "Email", "Course", "Period", "Amount", "Status", "Paid at"]];
    fees.forEach((f) => {
      const p = profiles.find((x) => x.user_id === f.student_id);
      rows.push([
        p?.full_name || "",
        p?.email || "",
        courses.find((c) => c.id === f.course_id)?.title || "",
        f.period,
        String(f.amount),
        f.status,
        f.paid_at || "",
      ]);
    });
    const csv = rows
      .map((r) => r.map((c) => `"${(c || "").toString().replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fees_${form.period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="glass-premium rounded-2xl p-5 mt-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl card-title">Fees</h2>
        <div className="flex gap-2 flex-wrap">
          <Input
            type="month"
            value={form.period}
            onChange={(e) => setForm({ ...form, period: e.target.value })}
            className="w-40"
          />
          <Button onClick={bulkApply} className="font-bold">
            Bulk apply month
          </Button>
          <Button variant="outline" onClick={exportCsv}>
            Export CSV
          </Button>
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-3">
        <Select value={form.student_id} onValueChange={(v) => setForm({ ...form, student_id: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Student" />
          </SelectTrigger>
          <SelectContent>
            {profiles.map((s) => (
              <SelectItem key={s.user_id} value={s.user_id}>
                {s.full_name || s.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={form.course_id} onValueChange={(v) => setForm({ ...form, course_id: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Course (optional)" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Amount ₹"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
        />
        <Button onClick={add} className="font-bold">
          Add fee
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-muted-foreground">
            <tr>
              <th className="py-2">Student</th>
              <th>Course</th>
              <th>Period</th>
              <th>Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {fees.map((f) => (
              <tr key={f.id} className="border-t border-border">
                <td className="py-2 font-semibold">
                  {profiles.find((p) => p.user_id === f.student_id)?.full_name || "—"}
                </td>
                <td>{courses.find((c) => c.id === f.course_id)?.title || "—"}</td>
                <td>{f.period}</td>
                <td>₹{f.amount}</td>
                <td>
                  <button
                    onClick={() => toggleStatus(f)}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${f.status === "paid" ? "bg-primary text-primary-foreground" : "bg-destructive/10 text-destructive"}`}
                  >
                    {f.status}
                  </button>
                </td>
                <td>
                  <Button size="sm" variant="outline" onClick={() => remove(f.id)}>
                    <Trash2 size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function DemoPanel({ demos, onChange }: { demos: DemoBooking[]; onChange: () => void }) {
  async function setStatus(id: string, status: "approved" | "rejected" | "pending") {
    const { error } = await supabase.from("demo_bookings").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Updated");
      onChange();
    }
  }
  async function remove(id: string) {
    if (!confirm("Delete this booking?")) return;
    const { error } = await supabase.from("demo_bookings").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Deleted");
      onChange();
    }
  }
  return (
    <Card className="glass-premium rounded-2xl p-5 mt-4">
      <h2 className="text-2xl mb-4 card-title">Demo bookings</h2>
      <div className="space-y-2">
        {demos.map((d) => (
          <div
            key={d.id}
            className="glass rounded-2xl p-4 flex items-start justify-between flex-wrap gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="font-bold">
                {d.name}{" "}
                <span className="text-xs text-muted-foreground font-normal">
                  · {d.preferred_subject || d.course}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {d.email} · {d.phone}
              </div>
              {d.parent_name && (
                <div className="text-xs text-muted-foreground">Parent: {d.parent_name}</div>
              )}
              {(d.student_class || d.preferred_timing) && (
                <div className="text-xs text-muted-foreground">
                  {d.student_class && <>Class: {d.student_class} · </>}
                  {d.preferred_timing && <>Timing: {d.preferred_timing}</>}
                </div>
              )}
              {d.message && <p className="text-sm mt-1">{d.message}</p>}
            </div>
            <div className="flex gap-2 flex-wrap">
              <span
                className={`px-3 py-1 text-xs rounded-full font-bold ${d.status === "approved" ? "bg-primary text-primary-foreground" : d.status === "rejected" ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"}`}
              >
                {d.status}
              </span>
              <Button size="sm" variant="outline" onClick={() => setStatus(d.id, "approved")}>
                Approve
              </Button>
              <Button size="sm" variant="outline" onClick={() => setStatus(d.id, "rejected")}>
                Reject
              </Button>
              <Button size="sm" variant="outline" onClick={() => remove(d.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        ))}
        {demos.length === 0 && <p className="text-muted-foreground">No bookings yet.</p>}
      </div>
    </Card>
  );
}
