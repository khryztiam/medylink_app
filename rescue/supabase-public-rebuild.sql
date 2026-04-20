-- RESCATE: blueprint SQL para recrear el schema publico del proyecto en otro Supabase/Postgres.
-- Este archivo busca ser portable aunque cambien:
--   - el project ref
--   - el owner del proyecto
--   - las llaves publicas/privadas
--
-- Uso sugerido:
--   1. Crear un proyecto nuevo en Supabase.
--   2. Abrir SQL Editor.
--   3. Ejecutar este archivo.
--   4. Cargar datos maestros en allowed_users.
--   5. Reconfigurar variables de entorno del frontend/backend.
--   6. Revisar la seccion "pendientes no versionados" al final.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.allowed_users (
  idsap bigint PRIMARY KEY,
  nombre text NOT NULL,
  grupo integer,
  puesto text
);

CREATE TABLE IF NOT EXISTS public.app_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  idsap bigint UNIQUE REFERENCES public.allowed_users(idsap),
  role text NOT NULL CHECK (role IN ('paciente', 'medico', 'enfermeria', 'supervisor', 'admin')),
  status boolean NOT NULL DEFAULT false,
  telegram_id bigint,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE TABLE IF NOT EXISTS public.citas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "idSAP" bigint NOT NULL,
  nombre text NOT NULL,
  motivo text NOT NULL,
  estado text NOT NULL DEFAULT 'pendiente',
  orden_llegada integer,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  doctor_name text,
  programmer_at timestamptz,
  check_in timestamptz,
  check_out timestamptz,
  consultation_at timestamptz,
  emergency boolean NOT NULL DEFAULT false,
  isss boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.citas_audit (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  cita_id uuid,
  user_id uuid,
  action_type text NOT NULL CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE')),
  new_data jsonb,
  old_data jsonb,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_allowed_users_nombre ON public.allowed_users(nombre);
CREATE INDEX IF NOT EXISTS idx_app_users_idsap ON public.app_users(idsap);
CREATE INDEX IF NOT EXISTS idx_app_users_role ON public.app_users(role);
CREATE INDEX IF NOT EXISTS idx_citas_idsap ON public.citas("idSAP");
CREATE INDEX IF NOT EXISTS idx_citas_estado ON public.citas(estado);
CREATE INDEX IF NOT EXISTS idx_citas_doctor_name ON public.citas(doctor_name);
CREATE INDEX IF NOT EXISTS idx_citas_created_at ON public.citas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_citas_audit_cita_id ON public.citas_audit(cita_id);
CREATE INDEX IF NOT EXISTS idx_citas_audit_user_id ON public.citas_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_citas_audit_created_at ON public.citas_audit(created_at DESC);

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.allowed_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_can_view_all_users" ON public.app_users;
CREATE POLICY "admin_can_view_all_users"
  ON public.app_users FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM public.app_users WHERE role = 'admin'
    )
  );

DROP POLICY IF EXISTS "users_can_view_own_profile" ON public.app_users;
CREATE POLICY "users_can_view_own_profile"
  ON public.app_users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "only_admin_can_update_users" ON public.app_users;
CREATE POLICY "only_admin_can_update_users"
  ON public.app_users FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM public.app_users WHERE role = 'admin'
    )
  );

DROP POLICY IF EXISTS "users_can_insert_themselves" ON public.app_users;
CREATE POLICY "users_can_insert_themselves"
  ON public.app_users FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "pacientes_ver_propias_citas" ON public.citas;
CREATE POLICY "pacientes_ver_propias_citas"
  ON public.citas FOR SELECT
  USING (
    (SELECT public.app_users.role FROM public.app_users WHERE id = auth.uid()) = 'paciente'
    AND "idSAP" = (SELECT public.app_users.idsap FROM public.app_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "medicos_ver_citas_correcta" ON public.citas;
CREATE POLICY "medicos_ver_citas_correcta"
  ON public.citas FOR SELECT
  USING (
    (SELECT public.app_users.role FROM public.app_users WHERE id = auth.uid()) = 'medico'
    AND (
      doctor_name IS NOT NULL
      OR estado = 'en espera'
    )
  );

DROP POLICY IF EXISTS "enfermeria_ver_todas_citas" ON public.citas;
CREATE POLICY "enfermeria_ver_todas_citas"
  ON public.citas FOR SELECT
  USING (
    (SELECT public.app_users.role FROM public.app_users WHERE id = auth.uid()) IN ('enfermeria', 'supervisor', 'admin')
  );

DROP POLICY IF EXISTS "pacientes_crear_cita" ON public.citas;
CREATE POLICY "pacientes_crear_cita"
  ON public.citas FOR INSERT
  WITH CHECK (
    (SELECT public.app_users.role FROM public.app_users WHERE id = auth.uid()) = 'paciente'
    AND "idSAP" = (SELECT public.app_users.idsap FROM public.app_users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "medicos_actualizar_citas_correcta" ON public.citas;
CREATE POLICY "medicos_actualizar_citas_correcta"
  ON public.citas FOR UPDATE
  USING (
    (SELECT public.app_users.role FROM public.app_users WHERE id = auth.uid()) = 'medico'
    AND (
      doctor_name IS NOT NULL
      OR estado = 'en espera'
    )
  );

DROP POLICY IF EXISTS "enfermeria_gestionar_citas" ON public.citas;
CREATE POLICY "enfermeria_gestionar_citas"
  ON public.citas FOR UPDATE
  USING (
    (SELECT public.app_users.role FROM public.app_users WHERE id = auth.uid()) IN ('enfermeria', 'admin')
  );

DROP POLICY IF EXISTS "admin_full_access_citas" ON public.citas;
CREATE POLICY "admin_full_access_citas"
  ON public.citas FOR ALL
  USING (
    (SELECT public.app_users.role FROM public.app_users WHERE id = auth.uid()) = 'admin'
  );

DROP POLICY IF EXISTS "admin_access_allowed_users" ON public.allowed_users;
CREATE POLICY "admin_access_allowed_users"
  ON public.allowed_users FOR ALL
  USING (
    (SELECT public.app_users.role FROM public.app_users WHERE id = auth.uid()) IN ('admin', 'enfermeria')
  );

DROP POLICY IF EXISTS "allow_read_allowed_users" ON public.allowed_users;
CREATE POLICY "allow_read_allowed_users"
  ON public.allowed_users FOR SELECT
  USING (true);

CREATE OR REPLACE FUNCTION public.sync_users_complete(
  add_users jsonb DEFAULT '[]'::jsonb,
  update_users jsonb DEFAULT '[]'::jsonb,
  remove_ids jsonb DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
AS $$
DECLARE
  v_added integer := 0;
  v_updated integer := 0;
  v_removed integer := 0;
BEGIN
  IF jsonb_typeof(add_users) = 'array' AND jsonb_array_length(add_users) > 0 THEN
    INSERT INTO public.allowed_users (idsap, nombre, grupo, puesto)
    SELECT idsap, nombre, grupo, puesto
    FROM jsonb_to_recordset(add_users) AS x(
      idsap bigint,
      nombre text,
      grupo integer,
      puesto text
    );

    GET DIAGNOSTICS v_added = ROW_COUNT;
  END IF;

  IF jsonb_typeof(update_users) = 'array' AND jsonb_array_length(update_users) > 0 THEN
    UPDATE public.allowed_users AS au
    SET
      nombre = src.nombre,
      grupo = src.grupo,
      puesto = src.puesto
    FROM (
      SELECT idsap, nombre, grupo, puesto
      FROM jsonb_to_recordset(update_users) AS x(
        idsap bigint,
        nombre text,
        grupo integer,
        puesto text
      )
    ) AS src
    WHERE au.idsap = src.idsap;

    GET DIAGNOSTICS v_updated = ROW_COUNT;
  END IF;

  IF jsonb_typeof(remove_ids) = 'array' AND jsonb_array_length(remove_ids) > 0 THEN
    DELETE FROM public.allowed_users
    WHERE idsap IN (
      SELECT value::text::bigint
      FROM jsonb_array_elements(remove_ids)
    );

    GET DIAGNOSTICS v_removed = ROW_COUNT;
  END IF;

  RETURN jsonb_build_object(
    'added', v_added,
    'updated', v_updated,
    'removed', v_removed
  );
END;
$$;

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

COMMIT;

-- PENDIENTES NO VERSIONADOS CON DEFINICION COMPLETA
-- 1. Se observo un trigger AFTER UPDATE sobre public.citas llamado enviar_notificacion_telegram.
-- 2. Ese trigger invoca http_request, lo que sugiere extension/configuracion adicional no confirmada.
-- 3. Segun contexto del proyecto, Telegram fue experimental y no forma parte del nucleo minimo a conservar.
