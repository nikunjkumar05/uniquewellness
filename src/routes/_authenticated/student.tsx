import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CalendarClock, Download, GraduationCap, Wallet } from "lucide-react";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";
import {
  EmptyState,
  PageHeader,
  SectionCard,
  StatCard,
  StatusBadge,
} from "@/components/dashboard/ui";

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
    { id: string; amount: number; period: string; status: string; course_id: string | null }[]
  >([]);
  const [invoices, setInvoices] = useState<
    {
      id: string;
      fee_id: string | null;
      invoice_number: string;
      amount: number;
      issued_at: string;
      pdf_url: string | null;
    }[]
  >([]);
  const [attendance, setAttendance] = useState<
    { id: string; class_id: string; present: boolean; marked_at: string }[]
  >([]);
  const [attendanceClasses, setAttendanceClasses] = useState<
    { id: string; title: string; scheduled_at: string; duration_min: number; course_id: string | null }[]
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

      const { data: inv } = await supabase
        .from("invoices")
        .select("id, fee_id, invoice_number, amount, issued_at, pdf_url")
        .eq("student_id", user.id)
        .order("issued_at", { ascending: false });
      setInvoices(inv || []);

      const { data: att } = await supabase
        .from("attendance")
        .select("id, class_id, present, marked_at")
        .eq("student_id", user.id)
        .order("marked_at", { ascending: false });
      setAttendance(att || []);

      const classIds = (att || []).map((record) => record.class_id);
      if (classIds.length) {
        const { data: attClasses } = await supabase
          .from("live_classes")
          .select("id, title, scheduled_at, duration_min, course_id")
          .in("id", classIds);
        setAttendanceClasses(attClasses || []);
      } else {
        setAttendanceClasses([]);
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
  const attendedCount = attendance.filter((record) => record.present).length;
  const attendanceRate = attendance.length
    ? Math.round((attendedCount / attendance.length) * 100)
    : 0;
  const feeById = useMemo(() => new Map(fees.map((fee) => [fee.id, fee])), [fees]);
  const courseById = useMemo(() => new Map(courses.map((course) => [course.id, course])), [courses]);

  function openInvoice(invoiceId: string) {
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice) return;
    const fee = invoice.fee_id ? feeById.get(invoice.fee_id) : undefined;
    const course = fee?.course_id ? courseById.get(fee.course_id) : undefined;
    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${invoice.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 32px; color: #1f2937; }
            .card { max-width: 760px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 24px; padding: 28px; }
            .top { display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
            h1 { margin: 0; font-size: 28px; }
            .muted { color: #6b7280; }
            .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 24px; }
            .item { background: #f9fafb; border-radius: 18px; padding: 16px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="top">
              <div>
                <h1>Unique Wellness Institute</h1>
                <div class="muted">Invoice ${invoice.invoice_number}</div>
              </div>
              <div class="muted">Issued ${new Date(invoice.issued_at).toLocaleString()}</div>
            </div>
            <div class="grid">
              <div class="item"><div class="muted">Student</div><div>${user?.email || ""}</div></div>
              <div class="item"><div class="muted">Course</div><div>${course?.title || "—"}</div></div>
              <div class="item"><div class="muted">Period</div><div>${fee?.period || "—"}</div></div>
              <div class="item"><div class="muted">Amount</div><div>₹${invoice.amount}</div></div>
            </div>
          </div>
        </body>
      </html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function downloadInvoice(invoiceId: string) {
    const invoice = invoices.find((item) => item.id === invoiceId);
    if (!invoice) return;
    const fee = invoice.fee_id ? feeById.get(invoice.fee_id) : undefined;
    const course = fee?.course_id ? courseById.get(fee.course_id) : undefined;

    await downloadInvoicePdf({
      invoiceNumber: invoice.invoice_number,
      issuedAt: invoice.issued_at,
      studentName: user?.email || "Student",
      studentEmail: user?.email || "",
      courseTitle: course?.title || "Course invoice",
      period: fee?.period || "—",
      amount: invoice.amount,
      status: fee?.status || "paid",
    });
  }

  async function copyInvoiceNumber(invoiceNumber: string) {
    try {
      await navigator.clipboard.writeText(invoiceNumber);
      toast.success("Invoice number copied");
    } catch {
      toast.error("Could not copy invoice number");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Welcome back" subtitle="Your classes, attendance, fees and invoices." />

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Courses" value={enrollments.length} icon={<GraduationCap size={18} />} />
        <StatCard label="Upcoming classes" value={upcoming.length} icon={<CalendarClock size={18} />} />
        <StatCard label="Unpaid (₹)" value={unpaidTotal.toLocaleString("en-IN")} icon={<Wallet size={18} />} />
      </div>

      <SectionCard title="Upcoming live classes">
        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming classes"
            hint="Your coach's scheduled classes appear here."
            icon={<CalendarClock size={20} />}
          />
        ) : (
          <div className="space-y-2">
            {upcoming.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background/60 p-4"
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
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
                >
                  Join
                </Link>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="My courses">
        {courses.length === 0 ? (
          <EmptyState
            title="No active enrollments"
            hint="Once an admin enrolls you in a course, it shows up here."
            icon={<GraduationCap size={20} />}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {courses.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-background/60 p-4">
                <div className="text-xs font-bold uppercase text-muted-foreground">{c.category}</div>
                <div className="font-semibold">{c.title}</div>
                {c.description && <p className="mt-1 text-sm">{c.description}</p>}
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Attendance"
        subtitle={
          attendance.length
            ? `${attendedCount} present of ${attendance.length} marked · ${attendanceRate}%`
            : undefined
        }
      >
        {attendance.length === 0 ? (
          <EmptyState title="No attendance marked yet" hint="Your presence in live classes shows up here." />
        ) : (
          <div className="space-y-2">
            {attendance.map((record) => {
              const classInfo = attendanceClasses.find((item) => item.id === record.class_id);
              return (
                <div
                  key={record.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-background/60 p-4"
                >
                  <div>
                    <div className="font-semibold">{classInfo?.title || "Live class"}</div>
                    <div className="text-xs text-muted-foreground">
                      {classInfo
                        ? `${new Date(classInfo.scheduled_at).toLocaleString()} · ${classInfo.duration_min} min`
                        : record.class_id}
                    </div>
                  </div>
                  <StatusBadge status={record.present ? "present" : "absent"} />
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Invoices">
        {invoices.length === 0 ? (
          <EmptyState
            title="No invoices yet"
            hint="Approved payments appear here automatically."
            icon={<Wallet size={20} />}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {invoices.map((invoice) => {
              const fee = invoice.fee_id ? feeById.get(invoice.fee_id) : undefined;
              const course = fee?.course_id ? courseById.get(fee.course_id) : undefined;
              return (
                <div key={invoice.id} className="space-y-3 rounded-2xl border border-border bg-background/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-bold">{invoice.invoice_number}</div>
                      <div className="text-xs text-muted-foreground">
                        {course?.title || "Course invoice"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{invoice.amount}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(invoice.issued_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => openInvoice(invoice.id)} className="font-bold">
                      Open invoice
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void downloadInvoice(invoice.id)}
                      className="font-bold"
                    >
                      <Download size={14} className="mr-2" /> Download PDF
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void copyInvoiceNumber(invoice.invoice_number)}
                    >
                      Copy number
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Fees">
        {fees.length === 0 ? (
          <EmptyState title="No fee items yet" hint="Monthly fees raised by the admin appear here." />
        ) : (
          <div className="overflow-x-auto">
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
                      <StatusBadge status={f.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
