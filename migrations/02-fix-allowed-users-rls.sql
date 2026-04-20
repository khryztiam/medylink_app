-- Fix reproducible para la relación app_users -> allowed_users.
-- Permite lecturas públicas de allowed_users como tabla de referencia.

CREATE POLICY "allow_read_allowed_users"
  ON allowed_users
  FOR SELECT
  USING (true);
