import React, { useEffect, useRef, type ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  pop = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
  pop?: boolean;
}) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setTimeout(() => el.classList.add("in"), delay);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  const Component = Tag as React.ElementType<{
    ref?: React.Ref<HTMLElement>;
    className?: string;
    children?: ReactNode;
  }>;

  return (
    <Component ref={ref} className={`reveal ${pop ? "pop-in" : ""} ${className}`}>
      {children}
    </Component>
  );
}

export function Parallax({
  children,
  speed = 0.25,
  className = "",
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);
  const lastRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onScroll = () => {
      // Skip frames for better performance on mobile (every 2nd frame)
      frameCountRef.current++;
      if (frameCountRef.current % 2 !== 0) return;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const target = (rect.top + rect.height / 2 - window.innerHeight / 2) * -speed;
        lastRef.current = lastRef.current + (target - lastRef.current) * 0.12;
        el.style.transform = `translate3d(0, ${lastRef.current.toFixed(1)}px, 0)`;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [speed]);

  return (
    <div ref={ref} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
