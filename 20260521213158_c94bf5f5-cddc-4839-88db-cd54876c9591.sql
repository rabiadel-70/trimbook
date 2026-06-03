
DROP POLICY "Anyone can create an appointment" ON public.appointments;

CREATE POLICY "Anyone can create a valid appointment" ON public.appointments
  FOR INSERT WITH CHECK (
    length(trim(customer_name)) BETWEEN 1 AND 100
    AND length(trim(customer_phone)) BETWEEN 5 AND 30
    AND (customer_email IS NULL OR length(customer_email) <= 255)
    AND (notes IS NULL OR length(notes) <= 500)
    AND ends_at > starts_at
    AND starts_at > now()
    AND status = 'pending'
  );
