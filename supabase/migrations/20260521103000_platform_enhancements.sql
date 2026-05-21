ALTER TABLE public.demo_bookings
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'demo';

UPDATE public.demo_bookings
SET source = 'demo'
WHERE source IS NULL;

ALTER PUBLICATION supabase_realtime
  ADD TABLE IF NOT EXISTS public.demo_bookings;

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