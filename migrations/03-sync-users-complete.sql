-- RPC usada por src/pages/api/admin/importarAllowed.js
-- Sincroniza allowed_users a partir de lotes JSON.

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
