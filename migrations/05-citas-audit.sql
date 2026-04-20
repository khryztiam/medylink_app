-- Auditoria observada en el proyecto mediante codigo recuperado por el usuario.
-- Registra INSERT / UPDATE / DELETE sobre public.citas.

CREATE TABLE IF NOT EXISTS public.citas_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cita_id uuid,
  user_id uuid,
  action_type text NOT NULL CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE')),
  new_data jsonb,
  old_data jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_citas_audit_cita_id ON public.citas_audit(cita_id);
CREATE INDEX IF NOT EXISTS idx_citas_audit_user_id ON public.citas_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_citas_audit_created_at ON public.citas_audit(created_at DESC);

CREATE OR REPLACE FUNCTION public.log_citas_changes()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.citas_audit (
      cita_id,
      user_id,
      action_type,
      new_data,
      old_data
    ) VALUES (
      NEW.id,
      auth.uid(),
      'INSERT',
      to_jsonb(NEW),
      NULL
    );
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.citas_audit (
      cita_id,
      user_id,
      action_type,
      new_data,
      old_data
    ) VALUES (
      NEW.id,
      auth.uid(),
      'UPDATE',
      to_jsonb(NEW),
      to_jsonb(OLD)
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.citas_audit (
      cita_id,
      user_id,
      action_type,
      new_data,
      old_data
    ) VALUES (
      OLD.id,
      auth.uid(),
      'DELETE',
      NULL,
      to_jsonb(OLD)
    );

    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_log_citas_changes ON public.citas;

CREATE TRIGGER trigger_log_citas_changes
AFTER INSERT OR UPDATE OR DELETE ON public.citas
FOR EACH ROW
EXECUTE FUNCTION public.log_citas_changes();
