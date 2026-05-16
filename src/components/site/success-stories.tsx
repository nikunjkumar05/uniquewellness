import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "./reveal";
import { Trophy } from "lucide-react";

type Story = {
  id: string;
  name: string;
  headline: string;
  story: string;
  achievement: string | null;
  image_url: string | null;
};

export function SuccessStoriesSection({ title = "Success stories" }: { title?: string }) {
  const [items, setItems] = useState<Story[] | null>(null);

  useEffect(() => {
    supabase
      .from("success_stories")
      .select("id,name,headline,story,achievement,image_url")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setItems((data as Story[]) || []));
  }, []);

  if (!items) {
    return (
      <section className="px-3 sm:px-6">
        <div className="mx-auto max-w-6xl grid md:grid-cols-3 gap-5">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-72 rounded-3xl glass-premium animate-pulse" />
          ))}
        </div>
      </section>
    );
  }
  if (items.length === 0) return null;

  return (
    <section className="px-3 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold tracking-widest text-primary uppercase">
              Real results
            </span>
            <h2 className="section-title text-4xl sm:text-5xl mt-3">{title}</h2>
          </div>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((s, i) => (
            <Reveal key={s.id} delay={i * 120}>
              <article className="glass-premium rounded-3xl p-7 hover-lift h-full flex flex-col">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground mb-5">
                  <Trophy size={20} />
                </div>
                <h3 className="card-title text-2xl leading-tight">{s.headline}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed flex-1">
                  {s.story}
                </p>
                <div className="mt-5 pt-5 border-t border-border">
                  <div className="font-bold">{s.name}</div>
                  {s.achievement && (
                    <div className="mt-1 text-xs text-primary font-bold uppercase tracking-wider">
                      {s.achievement}
                    </div>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
