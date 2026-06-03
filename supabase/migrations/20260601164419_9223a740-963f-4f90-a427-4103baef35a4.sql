
-- Extend barbers
ALTER TABLE public.barbers
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS shop_address text,
  ADD COLUMN IF NOT EXISTS specialties text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS years_experience int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS accepting_bookings boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS onboarded boolean NOT NULL DEFAULT false;

-- Per-barber services
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS barber_id uuid;

-- Drop old public read policy, add per-barber rules
DROP POLICY IF EXISTS "Services publicly viewable" ON public.services;

CREATE POLICY "Services publicly viewable"
  ON public.services FOR SELECT
  USING (
    barber_id IS NULL
    OR EXISTS (SELECT 1 FROM public.barbers b WHERE b.id = services.barber_id AND b.active = true)
  );

CREATE POLICY "Barbers manage own services insert"
  ON public.services FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = barber_id);

CREATE POLICY "Barbers manage own services update"
  ON public.services FOR UPDATE TO authenticated
  USING (auth.uid() = barber_id);

CREATE POLICY "Barbers manage own services delete"
  ON public.services FOR DELETE TO authenticated
  USING (auth.uid() = barber_id);

GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;

-- Working hours
CREATE TABLE IF NOT EXISTS public.working_hours (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id uuid NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL DEFAULT '09:00',
  end_time time NOT NULL DEFAULT '19:00',
  is_closed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(barber_id, day_of_week)
);

GRANT SELECT ON public.working_hours TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.working_hours TO authenticated;
GRANT ALL ON public.working_hours TO service_role;

ALTER TABLE public.working_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Working hours public read"
  ON public.working_hours FOR SELECT USING (true);

CREATE POLICY "Barbers insert own hours"
  ON public.working_hours FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = barber_id);

CREATE POLICY "Barbers update own hours"
  ON public.working_hours FOR UPDATE TO authenticated
  USING (auth.uid() = barber_id);

CREATE POLICY "Barbers delete own hours"
  ON public.working_hours FOR DELETE TO authenticated
  USING (auth.uid() = barber_id);

-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('barber-avatars', 'barber-avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar images publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'barber-avatars');

CREATE POLICY "Barbers upload own avatar"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'barber-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Barbers update own avatar"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'barber-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Barbers delete own avatar"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'barber-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Seed default working hours + services for existing barbers
INSERT INTO public.working_hours (barber_id, day_of_week, start_time, end_time, is_closed)
SELECT b.id, d, '09:00'::time, '19:00'::time, (d IN (0, 1))
FROM public.barbers b
CROSS JOIN generate_series(0, 6) d
ON CONFLICT (barber_id, day_of_week) DO NOTHING;

-- Seed per-barber default services for existing barbers (only if they have none)
INSERT INTO public.services (barber_id, name, duration_minutes, price_cents)
SELECT b.id, s.name, s.duration, s.price
FROM public.barbers b
CROSS JOIN (VALUES
  ('Classic Haircut', 30, 3500),
  ('Beard Trim', 20, 2000),
  ('Haircut + Beard', 50, 5000),
  ('Hot Towel Shave', 40, 4000)
) AS s(name, duration, price)
WHERE NOT EXISTS (SELECT 1 FROM public.services s2 WHERE s2.barber_id = b.id);

UPDATE public.barbers SET onboarded = true WHERE bio IS NOT NULL OR specialties <> '{}';
