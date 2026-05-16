
-- TESTIMONIALS
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text,
  quote text NOT NULL,
  rating int NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  avatar_url text,
  featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active testimonials" ON public.testimonials
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins manage testimonials" ON public.testimonials
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER tg_testimonials_updated BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- SUCCESS STORIES
CREATE TABLE public.success_stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  headline text NOT NULL,
  story text NOT NULL,
  achievement text,
  image_url text,
  featured boolean NOT NULL DEFAULT false,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.success_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active stories" ON public.success_stories
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins manage stories" ON public.success_stories
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER tg_stories_updated BEFORE UPDATE ON public.success_stories
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- SITE STATS
CREATE TABLE public.site_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  suffix text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.site_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read active stats" ON public.site_stats
  FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins manage stats" ON public.site_stats
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE TRIGGER tg_stats_updated BEFORE UPDATE ON public.site_stats
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- SEED DATA
INSERT INTO public.testimonials (name, role, quote, rating, featured, sort_order) VALUES
  ('Priya Sharma', 'Parent of student, Age 9', 'My son joined the beginners batch and within 6 months he won his first tournament. Mrunal''s coaching is exceptional — patient, structured, and full of warmth.', 5, true, 1),
  ('Rohan Mehta', 'Class 10 student', 'The career guidance session helped me understand which stream actually fits me. I felt heard for the first time. Highly recommend.', 5, true, 2),
  ('Anjali Iyer', 'Parent', 'The wellness plan has been life-changing for our family. Sustainable, easy to follow, and actually delicious.', 5, true, 3),
  ('Karan Patel', 'Student, Age 12', 'I love the live classes — coach makes every position feel like a puzzle. My FIDE rating crossed 1400 this year!', 5, false, 4),
  ('Sneha Rao', 'Working professional', 'Career counselling helped me pivot from a stuck role into product management. Clear, practical, no fluff.', 5, false, 5);

INSERT INTO public.success_stories (name, headline, story, achievement, featured, sort_order) VALUES
  ('Aarav Joshi', 'From beginner to state champion in 14 months', 'Aarav joined our beginners batch with no prior chess background. With consistent practice and tailored coaching, he climbed quickly through the ranks and represented his school nationally.', 'Maharashtra U-10 State Champion 2025', true, 1),
  ('Diya Kapoor', 'Cracked her dream career path at 17', 'After two career counselling sessions, Diya discovered her real interest in biotechnology and built a focused application strategy that landed her at a top university.', 'Admission to BITS Pilani — Biotech', true, 2),
  ('Vivaan Shah', 'FIDE Rated within first year', 'Started at age 7. Today he competes in inter-school tournaments and recently received his first FIDE rating.', 'FIDE Rating: 1320', true, 3);

INSERT INTO public.site_stats (label, value, suffix, sort_order) VALUES
  ('Students coached', 500, '+', 1),
  ('Tournaments won', 120, '+', 2),
  ('Years of experience', 10, '+', 3),
  ('Average rating', 4.9, '/5', 4);
