
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

-- Update handle_new_user trigger to capture phone + username
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

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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
