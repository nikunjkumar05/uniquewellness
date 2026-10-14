import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Inbox, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Page header: consistent title + subtitle + actions across dashboards ── */
export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-4xl sm:text-5xl font-display tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ── Stat card: one style for every dashboard ── */
export function StatCard({
  label,
  value,
  icon,
  hint,
}: {
  label: string;
  value: string | number;
  icon?: ReactNode;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur transition-transform duration-300 hover:-translate-y-0.5">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
        {icon && <span className="text-primary">{icon}</span>}
      </div>
      <div className="mt-1 font-display text-4xl text-foreground">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

/* ── Status badge: single mapping from status text → tone ── */
const POSITIVE = new Set(["paid", "approved", "present", "live", "active", "ready", "yes", "confirmed"]);
const NEGATIVE = new Set(["unpaid", "rejected", "absent", "ended", "inactive", "failed", "no"]);
const WARNING = new Set(["pending", "scheduled"]);

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const key = status.toLowerCase();
  return (
    <Badge
      className={cn(
        "rounded-full px-3 py-1 text-xs font-bold capitalize",
        POSITIVE.has(key) && "bg-primary text-primary-foreground hover:bg-primary",
        NEGATIVE.has(key) && "bg-destructive/10 text-destructive hover:bg-destructive/15",
        WARNING.has(key) && "bg-amber-500/15 text-amber-700 hover:bg-amber-500/20",
        !POSITIVE.has(key) &&
          !NEGATIVE.has(key) &&
          !WARNING.has(key) &&
          "bg-muted text-muted-foreground",
        className,
      )}
    >
      {status}
    </Badge>
  );
}

/* ── Section card: one card style for dashboard sections ── */
export function SectionCard({
  title,
  subtitle,
  actions,
  children,
  className,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("rounded-2xl border border-white/60 bg-white/70 p-5 shadow-sm backdrop-blur", className)}>
      {(title || actions) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            {title && <h2 className="font-display text-2xl text-foreground">{title}</h2>}
            {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </Card>
  );
}

/* ── Empty state for tables and lists ── */
export function EmptyState({
  title,
  hint,
  icon,
}: {
  title: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border px-4 py-10 text-center">
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon ?? <Inbox size={20} />}
      </span>
      <p className="font-semibold text-foreground">{title}</p>
      {hint && <p className="max-w-sm text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ── Destructive confirm action (replaces window.confirm) ── */
export function ConfirmAction({
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
  children,
}: {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  children?: ReactNode;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children ?? (
          <Button size="sm" variant="outline" aria-label={title}>
            <Trash2 size={14} />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => void onConfirm()}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
