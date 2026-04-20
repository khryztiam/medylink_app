-- Bootstrap reproducible del schema validado en la instancia Supabase.
-- Orden sugerido:
--   1. Ejecutar este archivo
--   2. Ejecutar migrations/01-implement-rls.sql
--   3. Ejecutar migrations/02-fix-allowed-users-rls.sql
--   4. Ejecutar migrations/03-sync-users-complete.sql

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

CREATE INDEX IF NOT EXISTS idx_allowed_users_nombre ON public.allowed_users(nombre);
CREATE INDEX IF NOT EXISTS idx_app_users_idsap ON public.app_users(idsap);
CREATE INDEX IF NOT EXISTS idx_app_users_role ON public.app_users(role);
CREATE INDEX IF NOT EXISTS idx_citas_idsap ON public.citas("idSAP");
CREATE INDEX IF NOT EXISTS idx_citas_estado ON public.citas(estado);
CREATE INDEX IF NOT EXISTS idx_citas_doctor_name ON public.citas(doctor_name);
CREATE INDEX IF NOT EXISTS idx_citas_created_at ON public.citas(created_at DESC);
