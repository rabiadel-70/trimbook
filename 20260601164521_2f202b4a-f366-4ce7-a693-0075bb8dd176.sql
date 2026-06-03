
CREATE OR REPLACE FUNCTION public.prevent_appointment_overlap()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'cancelled' THEN
    RETURN NEW;
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.appointments a
    WHERE a.barber_id = NEW.barber_id
      AND a.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND a.status <> 'cancelled'
      AND tstzrange(a.starts_at, a.ends_at, '[)') && tstzrange(NEW.starts_at, NEW.ends_at, '[)')
  ) THEN
    RAISE EXCEPTION 'This time slot is no longer available. Please pick another time.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS appointments_no_overlap ON public.appointments;
CREATE TRIGGER appointments_no_overlap
  BEFORE INSERT OR UPDATE OF starts_at, ends_at, status, barber_id
  ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.prevent_appointment_overlap();

-- Restrict file listing on avatars bucket (keep public read on individual files via signed URLs)
DROP POLICY IF EXISTS "Avatar images publicly readable" ON storage.objects;
CREATE POLICY "Avatar images publicly readable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'barber-avatars' AND (storage.foldername(name))[1] IS NOT NULL);
