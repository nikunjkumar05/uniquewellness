-- =====================================================================
-- Unique Wellness Institute — Full Database Setup
-- Combined from supabase/migrations (run in chronological order)
-- Paste this ENTIRE file into the Supabase SQL Editor and run it once.
-- Safe to re-run: uses IF NOT EXISTS / OR REPLACE / ON CONFLICT guards.
-- =====================================================================


-- =====================================================================
-- MIGRATION 1: demo_bookings
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.demo_bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  course TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.demo_bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a demo booking" ON public.demo_bookings;
CREATE POLICY "Anyone can submit a demo booking"
  ON public.demo_bookings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);


-- =====================================================================
-- MIGRATION 2: core schema — roles, profiles, courses, classes, fees…
-- =====================================================================

-- ===== Roles enum and user_roles table =====
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'coach', 'student');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS public.app_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
  ORDER BY CASE role WHEN 'admin' THEN 1 WHEN 'coach' THEN 2 ELSE 3 END LIMIT 1;
$$;

DROP POLICY IF EXISTS "Users read own roles" ON public.user_roles;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins read all roles" ON public.user_roles;
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage roles" ON public.user_roles;
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== Profiles =====
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins view all profiles" ON public.profiles;
CREATE POLICY "Admins view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Coaches view all profiles" ON public.profiles;
CREATE POLICY "Coaches view all profiles" ON public.profiles FOR SELECT USING (public.has_role(auth.uid(), 'coach'));
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins update profiles" ON public.profiles;
CREATE POLICY "Admins update profiles" ON public.profiles FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- ===== Updated-at trigger =====
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS profiles_updated ON public.profiles;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ===== Auto-create profile + assign role on signup =====
-- (Final version from Migration 3 — captures phone + username)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _role public.app_role := 'student';
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email, phone, username)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'username'
  )
  ON CONFLICT (user_id) DO NOTHING;

  IF NEW.email = 'admin@uniquewellness.com' THEN _role := 'admin'; END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== Courses =====
CREATE TABLE IF NOT EXISTS public.courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'chess',
  price numeric(10,2) NOT NULL DEFAULT 0,
  coach_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS courses_updated ON public.courses;
CREATE TRIGGER courses_updated BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
DROP POLICY IF EXISTS "Authenticated read courses" ON public.courses;
CREATE POLICY "Authenticated read courses" ON public.courses FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Admins manage courses" ON public.courses;
CREATE POLICY "Admins manage courses" ON public.courses FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== Enrollments =====
CREATE TABLE IF NOT EXISTS public.enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  fee_amount numeric(10,2) NOT NULL DEFAULT 0,
  enrolled_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, course_id)
);
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students view own enrollments" ON public.enrollments;
CREATE POLICY "Students view own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Coaches view their course enrollments" ON public.enrollments;
CREATE POLICY "Coaches view their course enrollments" ON public.enrollments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.courses c WHERE c.id = course_id AND c.coach_id = auth.uid())
);
DROP POLICY IF EXISTS "Admins manage enrollments" ON public.enrollments;
CREATE POLICY "Admins manage enrollments" ON public.enrollments FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== Live classes =====
CREATE TABLE IF NOT EXISTS public.live_classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  coach_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  scheduled_at timestamptz NOT NULL,
  duration_min integer NOT NULL DEFAULT 60,
  enablex_room_id text,
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students view classes for enrolled courses" ON public.live_classes;
CREATE POLICY "Students view classes for enrolled courses" ON public.live_classes FOR SELECT USING (
  course_id IS NULL OR EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = live_classes.course_id AND e.student_id = auth.uid())
);
DROP POLICY IF EXISTS "Coaches view own classes" ON public.live_classes;
CREATE POLICY "Coaches view own classes" ON public.live_classes FOR SELECT USING (coach_id = auth.uid());
DROP POLICY IF EXISTS "Admins manage classes" ON public.live_classes;
CREATE POLICY "Admins manage classes" ON public.live_classes FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Coaches manage own classes" ON public.live_classes;
CREATE POLICY "Coaches manage own classes" ON public.live_classes FOR ALL USING (coach_id = auth.uid()) WITH CHECK (coach_id = auth.uid());

-- ===== Attendance =====
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  present boolean NOT NULL DEFAULT false,
  marked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (class_id, student_id)
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students view own attendance" ON public.attendance;
CREATE POLICY "Students view own attendance" ON public.attendance FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Students mark own attendance" ON public.attendance;
CREATE POLICY "Students mark own attendance" ON public.attendance FOR INSERT WITH CHECK (auth.uid() = student_id);
DROP POLICY IF EXISTS "Students update own attendance" ON public.attendance;
CREATE POLICY "Students update own attendance" ON public.attendance FOR UPDATE USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Coaches view class attendance" ON public.attendance;
CREATE POLICY "Coaches view class attendance" ON public.attendance FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.live_classes lc WHERE lc.id = class_id AND lc.coach_id = auth.uid())
);
DROP POLICY IF EXISTS "Admins manage attendance" ON public.attendance;
CREATE POLICY "Admins manage attendance" ON public.attendance FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== Fees =====
CREATE TABLE IF NOT EXISTS public.fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  period text NOT NULL,
  status text NOT NULL DEFAULT 'unpaid',
  paid_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.fees ENABLE ROW LEVEL SECURITY;
DROP TRIGGER IF EXISTS fees_updated ON public.fees;
CREATE TRIGGER fees_updated BEFORE UPDATE ON public.fees FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
DROP POLICY IF EXISTS "Students view own fees" ON public.fees;
CREATE POLICY "Students view own fees" ON public.fees FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Admins manage fees" ON public.fees;
CREATE POLICY "Admins manage fees" ON public.fees FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== Invoices =====
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_id uuid REFERENCES public.fees(id) ON DELETE SET NULL,
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_number text NOT NULL UNIQUE,
  amount numeric(10,2) NOT NULL DEFAULT 0,
  issued_at timestamptz NOT NULL DEFAULT now(),
  pdf_url text
);
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Students view own invoices" ON public.invoices;
CREATE POLICY "Students view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = student_id);
DROP POLICY IF EXISTS "Admins manage invoices" ON public.invoices;
CREATE POLICY "Admins manage invoices" ON public.invoices FOR ALL USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ===== Class chat messages =====
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Class participants read messages" ON public.messages;
CREATE POLICY "Class participants read messages" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.live_classes lc WHERE lc.id = class_id AND (
    lc.coach_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.enrollments e WHERE e.course_id = lc.course_id AND e.student_id = auth.uid())
  )) OR public.has_role(auth.uid(), 'admin')
);
DROP POLICY IF EXISTS "Authenticated send messages" ON public.messages;
CREATE POLICY "Authenticated send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;


-- =====================================================================
-- MIGRATION 3: schema additions — username, seats, storage, seeds
-- =====================================================================

-- Schema additions
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text UNIQUE;

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS thumbnail_url text;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS seats integer NOT NULL DEFAULT 30;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS schedule text;

ALTER TABLE public.demo_bookings ADD COLUMN IF NOT EXISTS parent_name text;
ALTER TABLE public.demo_bookings ADD COLUMN IF NOT EXISTS student_class text;
ALTER TABLE public.demo_bookings ADD COLUMN IF NOT EXISTS preferred_subject text;
ALTER TABLE public.demo_bookings ADD COLUMN IF NOT EXISTS preferred_timing text;

-- Allow admins to manage demo bookings
DROP POLICY IF EXISTS "Admins manage demo bookings" ON public.demo_bookings;
CREATE POLICY "Admins manage demo bookings" ON public.demo_bookings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('course-thumbnails', 'course-thumbnails', true) ON CONFLICT (id) DO NOTHING;

-- Avatar policies
DROP POLICY IF EXISTS "Avatars public read" ON storage.objects;
CREATE POLICY "Avatars public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
DROP POLICY IF EXISTS "Users upload own avatar" ON storage.objects;
CREATE POLICY "Users upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Users update own avatar" ON storage.objects;
CREATE POLICY "Users update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
DROP POLICY IF EXISTS "Users delete own avatar" ON storage.objects;
CREATE POLICY "Users delete own avatar" ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Course thumbnail policies
DROP POLICY IF EXISTS "Course thumbs public read" ON storage.objects;
CREATE POLICY "Course thumbs public read" ON storage.objects FOR SELECT USING (bucket_id = 'course-thumbnails');
DROP POLICY IF EXISTS "Admins manage course thumbs" ON storage.objects;
CREATE POLICY "Admins manage course thumbs" ON storage.objects FOR ALL
  USING (bucket_id = 'course-thumbnails' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'course-thumbnails' AND public.has_role(auth.uid(), 'admin'));

-- Seed default courses
INSERT INTO public.courses (title, description, category, price, seats, schedule, is_active) VALUES
('Beginner', 'Foundations of chess — pieces, rules, basic strategy. 16 sessions.', 'chess', 5500, 20, 'Mon/Wed 5–6pm', true),
('Advanced Beginner', 'Tactical patterns, openings, simple endgames. 16 sessions.', 'chess', 6000, 20, 'Tue/Thu 5–6pm', true),
('Intermediate', 'Positional play, calculation, opening repertoire. 16 sessions.', 'chess', 7000, 16, 'Mon/Wed 6–7pm', true),
('Advanced Level 1', 'Deep theory, master games, tournament prep. 16 sessions.', 'chess', 8000, 12, 'Tue/Thu 6–7pm', true),
('Advanced Level 2', 'Elite calibration, GM-level patterns, coaching mindset. 16 sessions.', 'chess', 8000, 10, 'Sat 4–6pm', true)
ON CONFLICT DO NOTHING;


-- =====================================================================
-- MIGRATION 4: testimonials, success stories, site stats + seeds
-- =====================================================================

-- TESTIMONIALS
CREATE TABLE IF NOT EXISTS public.testimonials (
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
DROP POLICY IF EXISTS "Public read active testimonials" ON public.testimonials;
CREATE POLICY "Public read active testimonials" ON public.testimonials
  FOR SELECT TO anon, authenticated USING (is_active = true);
DROP POLICY IF EXISTS "Admins manage testimonials" ON public.testimonials;
CREATE POLICY "Admins manage testimonials" ON public.testimonials
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP TRIGGER IF EXISTS tg_testimonials_updated ON public.testimonials;
CREATE TRIGGER tg_testimonials_updated BEFORE UPDATE ON public.testimonials
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- SUCCESS STORIES
CREATE TABLE IF NOT EXISTS public.success_stories (
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
DROP POLICY IF EXISTS "Public read active stories" ON public.success_stories;
CREATE POLICY "Public read active stories" ON public.success_stories
  FOR SELECT TO anon, authenticated USING (is_active = true);
DROP POLICY IF EXISTS "Admins manage stories" ON public.success_stories;
CREATE POLICY "Admins manage stories" ON public.success_stories
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP TRIGGER IF EXISTS tg_stories_updated ON public.success_stories;
CREATE TRIGGER tg_stories_updated BEFORE UPDATE ON public.success_stories
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- SITE STATS
CREATE TABLE IF NOT EXISTS public.site_stats (
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
DROP POLICY IF EXISTS "Public read active stats" ON public.site_stats;
CREATE POLICY "Public read active stats" ON public.site_stats
  FOR SELECT TO anon, authenticated USING (is_active = true);
DROP POLICY IF EXISTS "Admins manage stats" ON public.site_stats;
CREATE POLICY "Admins manage stats" ON public.site_stats
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
DROP TRIGGER IF EXISTS tg_stats_updated ON public.site_stats;
CREATE TRIGGER tg_stats_updated BEFORE UPDATE ON public.site_stats
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- SEED DATA
INSERT INTO public.testimonials (name, role, quote, rating, featured, sort_order) VALUES
  ('Priya Sharma', 'Parent of student, Age 9', 'My son joined the beginners batch and within 6 months he won his first tournament. Mrunal''s coaching is exceptional — patient, structured, and full of warmth.', 5, true, 1),
  ('Rohan Mehta', 'Class 10 student', 'The career guidance session helped me understand which stream actually fits me. I felt heard for the first time. Highly recommend.', 5, true, 2),
  ('Anjali Iyer', 'Parent', 'The wellness plan has been life-changing for our family. Sustainable, easy to follow, and actually delicious.', 5, true, 3),
  ('Karan Patel', 'Student, Age 12', 'I love the live classes — coach makes every position feel like a puzzle. My FIDE rating crossed 1400 this year!', 5, false, 4),
  ('Sneha Rao', 'Working professional', 'Career counselling helped me pivot from a stuck role into product management. Clear, practical, no fluff.', 5, false, 5)
ON CONFLICT DO NOTHING;

INSERT INTO public.success_stories (name, headline, story, achievement, featured, sort_order) VALUES
  ('Aarav Joshi', 'From beginner to state champion in 14 months', 'Aarav joined our beginners batch with no prior chess background. With consistent practice and tailored coaching, he climbed quickly through the ranks and represented his school nationally.', 'Maharashtra U-10 State Champion 2025', true, 1),
  ('Diya Kapoor', 'Cracked her dream career path at 17', 'After two career counselling sessions, Diya discovered her real interest in biotechnology and built a focused application strategy that landed her at a top university.', 'Admission to BITS Pilani — Biotech', true, 2),
  ('Vivaan Shah', 'FIDE Rated within first year', 'Started at age 7. Today he competes in inter-school tournaments and recently received his first FIDE rating.', 'FIDE Rating: 1320', true, 3)
ON CONFLICT DO NOTHING;

INSERT INTO public.site_stats (label, value, suffix, sort_order) VALUES
  ('Students coached', 500, '+', 1),
  ('Tournaments won', 120, '+', 2),
  ('Years of experience', 10, '+', 3),
  ('Average rating', 4.9, '/5', 4)
ON CONFLICT DO NOTHING;


-- =====================================================================
-- MIGRATION 5: password_reset_requests
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.password_reset_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text,
  consent boolean NOT NULL DEFAULT false,
  new_password_hash text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.password_reset_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins manage password reset requests" ON public.password_reset_requests;
CREATE POLICY "Admins manage password reset requests" ON public.password_reset_requests
  FOR ALL USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
DROP TRIGGER IF EXISTS tg_password_reset_requests_updated ON public.password_reset_requests;
CREATE TRIGGER tg_password_reset_requests_updated BEFORE UPDATE ON public.password_reset_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();


-- =====================================================================
-- MIGRATION 6: platform enhancements — invoice trigger, attendance
-- =====================================================================

ALTER TABLE public.demo_bookings
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'demo';

UPDATE public.demo_bookings
SET source = 'demo'
WHERE source IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'demo_bookings'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.demo_bookings;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.generate_invoice_for_paid_fee()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invoice_no text;
BEGIN
  IF NEW.status = 'paid' THEN
    invoice_no := 'INV-' || replace(NEW.period, '-', '') || '-' || substr(NEW.id::text, 1, 8);

    INSERT INTO public.invoices (fee_id, student_id, invoice_number, amount, issued_at)
    VALUES (NEW.id, NEW.student_id, invoice_no, NEW.amount, now())
    ON CONFLICT (invoice_number)
    DO UPDATE SET
      fee_id = EXCLUDED.fee_id,
      student_id = EXCLUDED.student_id,
      amount = EXCLUDED.amount,
      issued_at = now();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tg_generate_invoice_for_paid_fee ON public.fees;

CREATE TRIGGER tg_generate_invoice_for_paid_fee
AFTER INSERT OR UPDATE OF status, amount, period ON public.fees
FOR EACH ROW
EXECUTE FUNCTION public.generate_invoice_for_paid_fee();

DROP POLICY IF EXISTS "Coaches manage class attendance" ON public.attendance;
CREATE POLICY "Coaches manage class attendance" ON public.attendance
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.live_classes lc
    WHERE lc.id = class_id
      AND lc.coach_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.live_classes lc
    WHERE lc.id = class_id
      AND lc.coach_id = auth.uid()
  )
);

-- =====================================================================
-- DONE. All tables, policies, triggers, buckets and seed data created.
-- =====================================================================
