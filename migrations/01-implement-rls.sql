-- MIGRACIÓN: Implementar Row Level Security (RLS)
-- Objetivo: Proteger acceso a datos según rol y propiedad

-- ========================================
-- PASO 1: HABILITAR RLS EN TABLAS
-- ========================================

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;

-- ========================================
-- PASO 2: POLÍTICAS PARA app_users
-- ========================================

-- Política 1: Admin puede ver todos los usuarios
CREATE POLICY "admin_can_view_all_users"
  ON app_users FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM app_users WHERE role = 'admin'
    )
  );

-- Política 2: Cada usuario ve su propio perfil
CREATE POLICY "users_can_view_own_profile"
  ON app_users FOR SELECT
  USING (auth.uid() = id);

-- Política 3: Solo admin puede modificar usuarios
CREATE POLICY "only_admin_can_update_users"
  ON app_users FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT id FROM app_users WHERE role = 'admin'
    )
  );

-- Política 4: Insertar usuario (para signup)
CREATE POLICY "users_can_insert_themselves"
  ON app_users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ========================================
-- PASO 3: POLÍTICAS PARA citas
-- ========================================

-- Política 1: Paciente ve SOLO sus propias citas
CREATE POLICY "pacientes_ver_propias_citas"
  ON citas FOR SELECT
  USING (
    (SELECT app_users.role FROM app_users WHERE id = auth.uid()) = 'paciente'
    AND "idSAP" = (SELECT app_users.idsap FROM app_users WHERE id = auth.uid())
  );

-- Política 2: Médico ve citas donde es responsable + suyas (si paciente)
CREATE POLICY "medicos_ver_citas_asignadas"
  ON citas FOR SELECT
  USING (
    (SELECT app_users.role FROM app_users WHERE id = auth.uid()) = 'medico'
    AND (
      doctor_name IS NOT NULL 
      OR "idSAP" = (SELECT app_users.idsap FROM app_users WHERE id = auth.uid())
    )
  );

-- Política 3: Enfermería ve todas (para gestionar flujo)
CREATE POLICY "enfermeria_ver_todas_citas"
  ON citas FOR SELECT
  USING (
    (SELECT app_users.role FROM app_users WHERE id = auth.uid()) IN ('enfermeria', 'supervisor', 'admin')
  );

-- Política 4: Paciente crea cita (solo la suya)
CREATE POLICY "pacientes_crear_cita"
  ON citas FOR INSERT
  WITH CHECK (
    (SELECT app_users.role FROM app_users WHERE id = auth.uid()) = 'paciente'
    AND "idSAP" = (SELECT app_users.idsap FROM app_users WHERE id = auth.uid())
  );

-- Política 5: Médico actualiza estado de su cita
CREATE POLICY "medicos_actualizar_citas_asignadas"
  ON citas FOR UPDATE
  USING (
    (SELECT app_users.role FROM app_users WHERE id = auth.uid()) = 'medico'
    AND (
      doctor_name IS NOT NULL
      OR "idSAP" = (SELECT app_users.idsap FROM app_users WHERE id = auth.uid())
    )
  );

-- Política 6: Enfermería gestiona todas las citas
CREATE POLICY "enfermeria_gestionar_citas"
  ON citas FOR UPDATE
  USING (
    (SELECT app_users.role FROM app_users WHERE id = auth.uid()) IN ('enfermeria', 'admin')
  );

-- Política 7: Admin puede hacer cualquier cosa
CREATE POLICY "admin_full_access_citas"
  ON citas FOR ALL
  USING (
    (SELECT app_users.role FROM app_users WHERE id = auth.uid()) = 'admin'
  );

-- ========================================
-- PASO 4: POLÍTICAS PARA allowed_users (nómina)
-- ========================================

-- Solo admin y enfermería pueden acceder (para validar SAP)
CREATE POLICY "admin_access_allowed_users"
  ON allowed_users FOR ALL
  USING (
    (SELECT app_users.role FROM app_users WHERE id = auth.uid()) IN ('admin', 'enfermeria')
  );

-- ========================================
-- PASO 5: CREAR ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_app_users_id ON app_users(id);
CREATE INDEX IF NOT EXISTS idx_app_users_role ON app_users(role);
CREATE INDEX IF NOT EXISTS idx_citas_idsap ON citas("idSAP");
CREATE INDEX IF NOT EXISTS idx_citas_doctor ON citas(doctor_name);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);

-- ========================================
-- VERIFICACIÓN
-- ========================================

-- Ver todas las políticas creadas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  qual AS condition,
  with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('app_users', 'citas', 'allowed_users')
ORDER BY tablename, policyname;

-- Ver RLS habilitado
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename IN ('app_users', 'citas', 'allowed_users');
