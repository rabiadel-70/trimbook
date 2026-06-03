
-- Status enum
CREATE TYPE public.appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Barbers profile table (id == auth.users.id)
CREATE TABLE public.barbers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  duration_minutes INT NOT NULL,
  price_cents INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barber_id UUID NOT NULL REFERENCES public.barbers(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status public.appointment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX appointments_barber_starts_idx ON public.appointments(barber_id, starts_at);

-- Enable RLS
ALTER TABLE public.barbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Barbers policies
CREATE POLICY "Active barbers are publicly viewable" ON public.barbers
  FOR SELECT USING (active = true);
CREATE POLICY "Barbers can view own row" ON public.barbers
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Barbers can update own row" ON public.barbers
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Services policies
CREATE POLICY "Services publicly viewable" ON public.services
  FOR SELECT USING (true);

-- Appointments policies
CREATE POLICY "Anyone can create an appointment" ON public.appointments
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Barbers can view their appointments" ON public.appointments
  FOR SELECT TO authenticated USING (auth.uid() = barber_id);
CREATE POLICY "Barbers can update their appointments" ON public.appointments
  FOR UPDATE TO authenticated USING (auth.uid() = barber_id);

-- Trigger: auto-create barber profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_barber()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.barbers (id, name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_barber
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_barber();

-- Seed services
INSERT INTO public.services (name, duration_minutes, price_cents) VALUES
  ('Classic Haircut', 30, 3500),
  ('Beard Trim', 20, 2000),
  ('Haircut + Beard', 50, 5000),
  ('Hot Towel Shave', 40, 4000);
