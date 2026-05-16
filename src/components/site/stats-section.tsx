import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "./reveal";
import { Counter } from "./counter";

type Stat = { id: string; label: string; value: number; suffix: string | null };

export function StatsSection({ title }: { title?: string }) {
  const [stats, setStats] = useState<Stat[] | null>(null);

  useEffect(() => {
    supabase
      .from("site_stats")
      .select("id,label,value,suffix")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setStats((data as Stat[]) || []));
  }, []);

  if (!stats) {
    return (
      <div className="mx-auto max-w-6xl glass-premium rounded-3xl p-6 sm:p-8 grid grid-cols-2 md:grid-cols-4 gap-5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-2xl bg-muted/40 animate-pulse" />
        ))}
      </div>
    );
  }
  if (stats.length === 0) return null;

  return (
    <section className="px-3 sm:px-6">
      <div className="mx-auto max-w-6xl glass-premium rounded-3xl p-6 sm:p-10">
        {title && (
          <Reveal>
            <h2 className="section-title text-3xl sm:text-4xl text-center mb-8 text-gradient">
              {title}
            </h2>
          </Reveal>
        )}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <Reveal key={s.id} delay={i * 100}>
              <div className="text-center hover-lift">
                <div className="stat-value text-4xl sm:text-5xl text-gradient">
                  <Counter to={Number(s.value)} suffix={s.suffix || ""} />
                </div>
                <div className="mt-2 text-sm text-muted-foreground font-medium">{s.label}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
