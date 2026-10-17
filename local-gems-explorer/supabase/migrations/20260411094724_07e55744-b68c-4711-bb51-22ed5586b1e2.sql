-- Drop overly permissive policies
DROP POLICY "Authenticated users can add amenities" ON public.amenities;
DROP POLICY "Authenticated users can add mentions" ON public.mentions;

-- Recreate with proper checks - user must be the place submitter
CREATE POLICY "Place submitters can add amenities" ON public.amenities
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.places WHERE id = place_id AND submitted_by = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Place submitters can add mentions" ON public.mentions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.places WHERE id = place_id AND submitted_by = auth.uid())
    OR public.has_role(auth.uid(), 'admin')
  );