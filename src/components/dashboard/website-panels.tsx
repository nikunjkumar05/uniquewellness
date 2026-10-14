import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Pencil, Plus, Star } from "lucide-react";
import { ConfirmAction, EmptyState, SectionCard, StatusBadge } from "./ui";

type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  rating: number;
  avatar_url: string | null;
  featured: boolean;
  sort_order: number;
  is_active: boolean;
};
type Story = {
  id: string;
  name: string;
  headline: string;
  story: string;
  achievement: string | null;
  image_url: string | null;
  featured: boolean;
  sort_order: number;
  is_active: boolean;
};
type Stat = {
  id: string;
  label: string;
  value: number;
  suffix: string | null;
  sort_order: number;
  is_active: boolean;
};

function RatingStars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={12} fill={i < value ? "currentColor" : "none"} />
      ))}
    </span>
  );
}

/* ─────────── Testimonials ─────────── */
export function TestimonialsAdmin() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Partial<Testimonial> | null>(null);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from("testimonials").select("*").order("sort_order");
    if (error) toast.error(error.message);
    setItems((data as Testimonial[]) || []);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!edit?.name || !edit?.quote) return toast.error("Name and quote are required");
    const payload = {
      name: edit.name,
      role: edit.role || null,
      quote: edit.quote,
      rating: edit.rating ?? 5,
      avatar_url: edit.avatar_url || null,
      featured: edit.featured ?? false,
      sort_order: edit.sort_order ?? 0,
      is_active: edit.is_active ?? true,
    };
    const { error } = edit.id
      ? await supabase.from("testimonials").update(payload).eq("id", edit.id)
      : await supabase.from("testimonials").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false);
    setEdit(null);
    load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  async function toggleActive(t: Testimonial) {
    await supabase.from("testimonials").update({ is_active: !t.is_active }).eq("id", t.id);
    load();
  }

  return (
    <SectionCard
      title={`Testimonials (${items.length})`}
      actions={
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setEdit(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEdit({ rating: 5, is_active: true, sort_order: items.length })}>
              <Plus size={16} className="mr-1" /> Add testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{edit?.id ? "Edit testimonial" : "New testimonial"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input
                  value={edit?.name || ""}
                  onChange={(e) => setEdit({ ...edit!, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Role / context</Label>
                <Input
                  value={edit?.role || ""}
                  onChange={(e) => setEdit({ ...edit!, role: e.target.value })}
                  placeholder="e.g. Parent of student, Age 9"
                />
              </div>
              <div>
                <Label>Quote</Label>
                <Textarea
                  rows={4}
                  value={edit?.quote || ""}
                  onChange={(e) => setEdit({ ...edit!, quote: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Rating (1–5)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={edit?.rating ?? 5}
                    onChange={(e) => setEdit({ ...edit!, rating: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    value={edit?.sort_order ?? 0}
                    onChange={(e) => setEdit({ ...edit!, sort_order: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label>Avatar URL (optional)</Label>
                <Input
                  value={edit?.avatar_url || ""}
                  onChange={(e) => setEdit({ ...edit!, avatar_url: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={edit?.is_active ?? true}
                  onCheckedChange={(v) => setEdit({ ...edit!, is_active: v })}
                />
                <Label>Active (visible on site)</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={edit?.featured ?? false}
                  onCheckedChange={(v) => setEdit({ ...edit!, featured: v })}
                />
                <Label>Featured</Label>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState title="No testimonials yet" hint="Add the first one — it appears on the home page." />
      ) : (
        <div className="space-y-3">
          {items.map((t) => (
            <div key={t.id} className="flex items-start gap-4 rounded-2xl border border-border bg-background/60 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold">{t.name}</span>
                  {t.role && <span className="text-xs text-muted-foreground">· {t.role}</span>}
                  <RatingStars value={t.rating} />
                  {t.featured && <StatusBadge status="featured" />}
                  <StatusBadge status={t.is_active ? "active" : "inactive"} />
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.quote}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Switch checked={t.is_active} onCheckedChange={() => toggleActive(t)} />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEdit(t);
                    setOpen(true);
                  }}
                >
                  <Pencil size={14} />
                </Button>
                <ConfirmAction
                  title="Delete testimonial?"
                  description={`"${t.quote.slice(0, 80)}…" will be removed from the site.`}
                  onConfirm={() => remove(t.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* ─────────── Success Stories ─────────── */
export function StoriesAdmin() {
  const [items, setItems] = useState<Story[]>([]);
  const [edit, setEdit] = useState<Partial<Story> | null>(null);
  const [open, setOpen] = useState(false);

  async function load() {
    const { data } = await supabase.from("success_stories").select("*").order("sort_order");
    setItems((data as Story[]) || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!edit?.name || !edit?.headline || !edit?.story)
      return toast.error("Name, headline and story are required");
    const payload = {
      name: edit.name,
      headline: edit.headline,
      story: edit.story,
      achievement: edit.achievement || null,
      image_url: edit.image_url || null,
      featured: edit.featured ?? false,
      sort_order: edit.sort_order ?? 0,
      is_active: edit.is_active ?? true,
    };
    const { error } = edit.id
      ? await supabase.from("success_stories").update(payload).eq("id", edit.id)
      : await supabase.from("success_stories").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false);
    setEdit(null);
    load();
  }
  async function remove(id: string) {
    const { error } = await supabase.from("success_stories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  return (
    <SectionCard
      title={`Success Stories (${items.length})`}
      actions={
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setEdit(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEdit({ is_active: true, sort_order: items.length })}>
              <Plus size={16} className="mr-1" /> Add story
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{edit?.id ? "Edit story" : "New story"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Student name</Label>
                <Input
                  value={edit?.name || ""}
                  onChange={(e) => setEdit({ ...edit!, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Headline</Label>
                <Input
                  value={edit?.headline || ""}
                  onChange={(e) => setEdit({ ...edit!, headline: e.target.value })}
                />
              </div>
              <div>
                <Label>Story</Label>
                <Textarea
                  rows={5}
                  value={edit?.story || ""}
                  onChange={(e) => setEdit({ ...edit!, story: e.target.value })}
                />
              </div>
              <div>
                <Label>Achievement (badge)</Label>
                <Input
                  value={edit?.achievement || ""}
                  onChange={(e) => setEdit({ ...edit!, achievement: e.target.value })}
                  placeholder="e.g. State Champion 2025"
                />
              </div>
              <div>
                <Label>Image URL (optional)</Label>
                <Input
                  value={edit?.image_url || ""}
                  onChange={(e) => setEdit({ ...edit!, image_url: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    value={edit?.sort_order ?? 0}
                    onChange={(e) => setEdit({ ...edit!, sort_order: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-end gap-3">
                  <Switch
                    checked={edit?.is_active ?? true}
                    onCheckedChange={(v) => setEdit({ ...edit!, is_active: v })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {items.length === 0 ? (
        <EmptyState title="No stories yet" hint="Success stories appear on the home page." />
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <div key={s.id} className="flex items-start gap-4 rounded-2xl border border-border bg-background/60 p-4">
              <div className="min-w-0 flex-1">
                <div className="font-bold">{s.headline}</div>
                <div className="text-xs text-muted-foreground">
                  {s.name} {s.achievement && `· ${s.achievement}`}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{s.story}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEdit(s);
                    setOpen(true);
                  }}
                >
                  <Pencil size={14} />
                </Button>
                <ConfirmAction
                  title="Delete story?"
                  description={`"${s.headline}" will be removed from the site.`}
                  onConfirm={() => remove(s.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

/* ─────────── Stats ─────────── */
export function StatsAdmin() {
  const [items, setItems] = useState<Stat[]>([]);
  const [edit, setEdit] = useState<Partial<Stat> | null>(null);
  const [open, setOpen] = useState(false);

  async function load() {
    const { data } = await supabase.from("site_stats").select("*").order("sort_order");
    setItems((data as Stat[]) || []);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!edit?.label) return toast.error("Label required");
    const payload = {
      label: edit.label,
      value: edit.value ?? 0,
      suffix: edit.suffix || null,
      sort_order: edit.sort_order ?? 0,
      is_active: edit.is_active ?? true,
    };
    const { error } = edit.id
      ? await supabase.from("site_stats").update(payload).eq("id", edit.id)
      : await supabase.from("site_stats").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved");
    setOpen(false);
    setEdit(null);
    load();
  }
  async function remove(id: string) {
    const { error } = await supabase.from("site_stats").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    load();
  }

  return (
    <SectionCard
      title={`Statistics (${items.length})`}
      actions={
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) setEdit(null);
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setEdit({ is_active: true, sort_order: items.length })}>
              <Plus size={16} className="mr-1" /> Add stat
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{edit?.id ? "Edit stat" : "New stat"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Label</Label>
                <Input
                  value={edit?.label || ""}
                  onChange={(e) => setEdit({ ...edit!, label: e.target.value })}
                  placeholder="Students coached"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Value</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={edit?.value ?? 0}
                    onChange={(e) => setEdit({ ...edit!, value: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Suffix</Label>
                  <Input
                    value={edit?.suffix || ""}
                    onChange={(e) => setEdit({ ...edit!, suffix: e.target.value })}
                    placeholder="+"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Sort order</Label>
                  <Input
                    type="number"
                    value={edit?.sort_order ?? 0}
                    onChange={(e) => setEdit({ ...edit!, sort_order: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-end gap-3">
                  <Switch
                    checked={edit?.is_active ?? true}
                    onCheckedChange={(v) => setEdit({ ...edit!, is_active: v })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={save}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {items.length === 0 ? (
        <EmptyState title="No stats yet" hint="Stats appear in the home page counters." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((s) => (
            <div key={s.id} className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                {s.label}
              </div>
              <div className="mt-1 font-display text-3xl text-foreground">
                {s.value}
                {s.suffix}
              </div>
              <div className="mt-3 flex gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setEdit(s);
                    setOpen(true);
                  }}
                >
                  <Pencil size={14} />
                </Button>
                <ConfirmAction
                  title="Delete stat?"
                  description={`"${s.label}" will be removed from the site.`}
                  onConfirm={() => remove(s.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}
