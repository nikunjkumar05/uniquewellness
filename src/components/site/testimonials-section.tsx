import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "./reveal";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";

type Testimonial = {
  id: string;
  name: string;
  role: string | null;
  quote: string;
  rating: number;
  avatar_url: string | null;
};

export function TestimonialsSection({
  title = "What our community says",
  subtitle = "Real stories from students, parents and professionals.",
}: {
  title?: string;
  subtitle?: string;
}) {
  const [items, setItems] = useState<Testimonial[] | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    supabase
      .from("testimonials")
      .select("id,name,role,quote,rating,avatar_url")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setItems((data as Testimonial[]) || []));
  }, []);

  useEffect(() => {
    if (!items || items.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), 6000);
    return () => clearInterval(t);
  }, [items]);

  if (!items) {
    return (
      <section className="px-3 sm:px-6">
        <div className="mx-auto max-w-5xl h-64 glass-premium rounded-3xl animate-pulse" />
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
              Testimonials
            </span>
            <h2 className="section-title text-4xl sm:text-5xl mt-3">{title}</h2>
            <p className="mt-3 text-muted-foreground">{subtitle}</p>
          </div>
        </Reveal>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${idx * 100}%)` }}
            >
              {items.map((t) => (
                <div key={t.id} className="w-full flex-shrink-0 px-1 sm:px-3">
                  <div className="glass-premium rounded-[28px] p-8 sm:p-12 mx-auto max-w-3xl text-center hover-lift">
                    <Quote className="mx-auto text-primary mb-4" size={32} />
                    <div className="flex justify-center gap-0.5 mb-5">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} size={16} className="fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-lg sm:text-xl leading-relaxed text-foreground/90 font-medium text-center">
                      "{t.quote}"
                    </p>
                    <div className="mt-6 flex flex-col items-center justify-center gap-3 text-center sm:flex-row">
                      {t.avatar_url ? (
                        <img
                          src={t.avatar_url}
                          alt={t.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {t.name.charAt(0)}
                        </div>
                      )}
                      <div className="text-center sm:text-left">
                        <div className="font-bold">{t.name}</div>
                        {t.role && <div className="text-xs text-muted-foreground">{t.role}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {items.length > 1 && (
            <>
              <button
                aria-label="Previous"
                onClick={() => setIdx((i) => (i - 1 + items.length) % items.length)}
                className="absolute top-1/2 -translate-y-1/2 left-0 sm:-left-4 glass-strong rounded-full p-3 hover-lift"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                aria-label="Next"
                onClick={() => setIdx((i) => (i + 1) % items.length)}
                className="absolute top-1/2 -translate-y-1/2 right-0 sm:-right-4 glass-strong rounded-full p-3 hover-lift"
              >
                <ChevronRight size={18} />
              </button>
              <div className="flex justify-center gap-2 mt-6">
                {items.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Go to testimonial ${i + 1}`}
                    onClick={() => setIdx(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === idx ? "w-8 bg-primary" : "w-2 bg-border"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
