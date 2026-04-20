-- Automatización confirmada en la BD productiva mediante captura del dashboard.
-- Marca consultation_at cuando una cita cambia a estado "en consulta".

CREATE OR REPLACE FUNCTION public.actualizar_consultation_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.estado = 'en consulta' AND (OLD.estado IS DISTINCT FROM NEW.estado) THEN
    NEW.consultation_at = NOW();
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_actualizar_consultation_at ON public.citas;

CREATE TRIGGER trigger_actualizar_consultation_at
BEFORE UPDATE ON public.citas
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_consultation_at();
