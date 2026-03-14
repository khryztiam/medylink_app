-- FIX: Agregar política RLS en allowed_users para permitir lectura
-- El problema: allowed_users tiene RLS activo pero SIN política de SELECT
-- Resultado: Las relaciones foreign key solo traen NULL

-- Opción 1: Permitir lectura a todos (recomendado para tabla de referencia)
CREATE POLICY "allow_read_allowed_users" ON allowed_users
  FOR SELECT
  USING (true);

-- Opción 2: Si prefieres más restrictivo, solo usuarios autenticados
-- CREATE POLICY "allow_read_allowed_users" ON allowed_users
--   FOR SELECT
--   USING (auth.role() = 'authenticated');

-- Verificar que la política se creó
SELECT tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies
WHERE tablename = 'allowed_users'
ORDER BY policyname;
