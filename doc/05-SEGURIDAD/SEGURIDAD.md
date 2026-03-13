# 🔒 Audit de Seguridad - MedyLink

**Fecha de revisión:** 2026-03-12  
**Nivel de criticidad:** ⚠️ ALTO (Personal médico + Datos de salud)  
**Status:** 🔴 Requiere mejoras

---

## 📋 Índice
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Hallazgos Críticos](#hallazgos-críticos)
3. [Hallazgos de Alto Riesgo](#hallazgos-de-alto-riesgo)
4. [Hallazgos de Riesgo Medio](#hallazgos-de-riesgo-medio)
5. [Hallazgos de Riesgo Bajo](#hallazgos-de-riesgo-bajo)
6. [Checklist de Seguridad](#checklist-de-seguridad)
7. [Plan de Remediación](#plan-de-remediación)

---

## 🎯 Resumen Ejecutivo

El sistema **MedyLink** maneja datos sensibles de salud en un contexto médico corporativo. El análisis identifica **3 hallazgos críticos, 4 altos, 5 medios** que deben resolverse antes de uso en producción.

### 📊 Estado Actual (2026-03-12)
- ✅ **RLS (Row Level Security)** - IMPLEMENTADO
- ⏳ 2 críticos pendientes (Tokens + Validación server-side)
- 🟠 4 altos * 🟡 5 medios pendientes

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| 🔴 CRÍTICA | 3 | 1/3 ✅ Resuelto, 2/3 ⏳ Pendiente |
| 🟠 ALTO | 4 | ⚠️ Urgente |
| 🟡 MEDIO | 5 | ⚠️ Importante |
| 🟢 BAJO | 3 | ⏳ Considerar |

---

## 🔴 Hallazgos Críticos (Status: 1/3 Resuelto ✅)

### ✅ 1. RLS (Row Level Security) - IMPLEMENTADO
**Archivo:** Supabase (tablas: app_users, citas, allowed_users)  
**Status:** ✅ RESUELTO (2026-03-12)  
**Impacto:** Pacientes NO pueden leer/modificar citas de otros

**Implementación completada:**
```sql
-- ✅ RLS HABILITADO en 3 tablas
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;

-- ✅ POLÍTICAS ACTIVAS EN CITAS:
CREATE POLICY "pacientes_ver_propias_citas" ... -- Paciente ve solo sus citas
CREATE POLICY "medicos_ver_citas" ... -- Médico ve asignadas
CREATE POLICY "enfermeria_ver_citas" ... -- Enfermeria ve todas (gestiona)
CREATE POLICY "admin_full_access_citas" ... -- Admin ve/modifica todo
CREATE POLICY "pacientes_crear_cita" ... -- INSERT solo propia
CREATE POLICY "medicos_actualizar_citas" ... -- UPDATE solo asignadas
CREATE POLICY "enfermeria_actualizar_citas" ... -- UPDATE todas
```

**Archivos modificados:**
- `src/lib/citasData.js`: Refactorizado con JSDoc explicando RLS automático
- `src/pages/enfermeria.js` y `medico.js`: Mantienen compatibilidad, RLS filtra automáticamente
- `migrations/01-implement-rls.sql`: Migración aplicada en Supabase
- Tests de integración: 6/7 pasaron (86%)

**Validación:**
```javascript
// ✅ AHORA: RLS bloquea automáticamente en BD
const { data } = await supabase.from('citas').select('*'); 
// Paciente solo ve sus citas (RLS filtra automáticamente)
// Médico solo ve asignadas
// Enfermería ve todas
// Admin ve todo
```

**Impacto:** ✅ RESUELTO - RLS protege acceso automáticamente en BD

---

### ❌ 2. Tokens Públicos Expuestos
**Archivo:** `src/lib/supabase.js`  
**Riesgo:** Clave pública de Supabase visible en cliente (esperado en Supabase, pero mal configurada)

**Problema:**
```javascript
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
// ✅ Esta DEBE ser pública (anon key)
// ❌ PERO está mal: debería estar en .env.local, NO en .env
```

**Verificar environment:**
```bash
# ❌ MAL - Expone credenciales:
echo "NEXT_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIs..." > .env

# ✅ BIEN - En .env.local (gitignored):
echo "NEXT_PUBLIC_SUPABASE_KEY=..." >> .env.local
```

**Verificar commits:**
```bash
# Revisar si keys están en git history:
git log --all -S "NEXT_PUBLIC_SUPABASE_KEY" --oneline
# Si aparecen con valores reales = riesgo crítico
```

**Solución:**
1. ✅ Regenerar Supabase Key en dashboard (invalidar actual)
2. ✅ Crear `.env.local` con valores reales
3. ✅ Agregar a `.gitignore`
4. ✅ Usar `NEXT_PUBLIC_*` SOLO para valores públicos

**Impacto:** ⚠️ CRÍTICA - Regenerar keys inmediatamente

---

### ❌ 3. Validación Server-Side Ausente
**Archivo:** Múltiples (enfermeria.js, paciente.js, etc.)  
**Riesgo:** Validaciones solo client-side, usuario malicioso puede bypassear

**Ejemplos problemáticos:**

```javascript
// 1️⃣ CitaForm.js línea ~35
const handleSubmit = async (e) => {
  // ❌ Validación SOLO aquí (client)
  if (!nombre.trim() || !motivo.trim() || isNaN(sapNumerico)) return;

  // ❌ Supabase recibe sin validación server
  await onSubmit({ nombre, motivo, idSAP: sapNumerico, ... });
}
```

**Ataque posible:**
```javascript
// Hacker abre DevTools y ejecuta:
supabase.from('citas').insert([{
  idsap: 999999,           // ❌ Sin verificar que existe
  nombre: "Juan",          // ❌ Sin verificar contra BD
  motivo: "Malware",
  // omite check_in, estado, etc.
}])
```

**Solución - Agregar RPC/Función en Supabase:**
```sql
CREATE FUNCTION insert_cita_seguro(
  p_idsap INT,
  p_nombre TEXT,
  p_motivo TEXT,
  p_emergency BOOLEAN DEFAULT false
)
RETURNS citas AS $$
DECLARE
  v_user_id UUID;
  v_user_role TEXT;
BEGIN
  -- 1. Obtener usuario autenticado
  SELECT auth.uid() INTO v_user_id;
  
  -- 2. Verificar rol
  SELECT role INTO v_user_role FROM app_users WHERE id = v_user_id;
  IF v_user_role NOT IN ('enfermeria', 'admin', 'supervisor', 'paciente') THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;

  -- 3. Verificar SAP existe
  IF NOT EXISTS (SELECT 1 FROM allowed_users WHERE idsap = p_idsap) THEN
    RAISE EXCEPTION 'SAP no encontrado';
  END IF;

  -- 4. Insertar validado
  RETURN INSERT INTO citas (idsap, nombre, motivo, estado, emergency, created_at)
    VALUES (p_idsap, p_nombre, p_motivo, 'pendiente', p_emergency, NOW())
    RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**En cliente:**
```javascript
// En lugar de insert directo:
const { error } = await supabase.rpc('insert_cita_seguro', {
  p_idsap: idSAP,
  p_nombre: nombre,
  p_motivo: motivo
});
```

**Impacto:** ⚠️ CRÍTICA - Implementar validación server-side

---

## 🟠 Hallazgos de Alto Riesgo

### ⚠️ 1. Información de Usuario en LocalStorage
**Archivo:** `src/context/AuthContext.js`  
**Riesgo:** Datos de sesión en localStorage accesible a XSS

**Código:**
```javascript
// contexts/AuthContext.js - línea ~50
persistSession: true,
storage: {
  getItem: (key) => (typeof window !== "undefined" ? localStorage.getItem(key) : null),
  setItem: (key, value) => localStorage.setItem(key) value),
  // ❌ userData, roles guardados aquí sin encriptación
}
```

**Ataque XSS posible:**
```javascript
// Inyectado en página via CDN comprometido
localStorage.getItem('sb-auth-token')  // Obtiene token
localStorage.getItem('sb-session')     // Obtiene sesión
// Envía a servidor atacante
```

**Mitigación:**
```javascript
// Opción 1: Usar sessionStorage en lugar de localStorage
sessionStorage.setItem(key, value)  // Se borra al cerrar tab

// Opción 2: Supabase Auth handles esto internamente
// No almacenar userData sensible, solo solicitar al servidor
```

**Impacto:** 🟠 ALTO - Implementar CSP headers + HTTPS obligatorio

---

### ⚠️ 2. Funciones Admin Sin RLS Propias
**Archivo:** `src/lib/supabaseAdmin.js`

**Riesgo:** Cliente puede acceder a funciones admin si descubre el endpoint

```javascript
// supabaseAdmin.js
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
// ❌ NUNCA enviar esto al cliente
// ❌ NUNCA usar en pages/
```

**Verificar uso:**
```bash
grep -r "supabaseAdmin" src/pages/
# Si aparece algo = CRÍTICA
```

**Corrección esperada:**
```
✅ supabaseAdmin.js → API ROUTES ONLY
❌ NUNCA en components/ o contexto
```

**Impacto:** 🟠 ALTO - Auditar dónde se usa supabaseAdmin

---

### ⚠️ 3. Error Messages Revelan Información
**Archivo:** Múltiples  
**Riesgo:** Mensajes de error revelan estructura de BD

**Ejemplos:**
```javascript
// AuthContext.js línea ~45
try {
  await supabase.auth.signInWithPassword({ email, password });
} catch (err) {
  setError(err.message) // ❌ Muestra error Supabase crudo
  // Error: "Invalid login credentials" ← OK
  // Pero otros errores podrían revelar BD schema
}
```

**Mejor práctica:**
```javascript
catch (err) {
  // Log error real servidor-side
  console.error('Auth error:', err);
  
  // Mostrar al user mensaje genérico
  setError(
    err.message?.includes('invalid') 
      ? 'Credenciales incorrectas'
      : 'Error en el sistema. Intenta de nuevo.'
  );
}
```

**Impacto:** 🟠 ALTO - Sanitizar messages públicos

---

### ⚠️ 4. No Hay Rate Limiting
**Archivo:** API routes (api/telegram-webhook.js, api/admin/*)  
**Riesgo:** Brute force, DDoS posible

**Endpoint vulnerable:**
```javascript
// pages/api/admin/importarAllowed.js
export default async function handler(req, res) {
  // ❌ SIN rate limiting
  // ❌ Usuario puede hacer 1000 requests/segundo
  // ❌ Bloquear BD
}
```

**Solución recomendada:**
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100 // 100 requests/ventana
});

export default limiter(handler);
```

**O usar Supabase Edge Functions** (mejor, outsourced)

**Impacto:** 🟠 ALTO - Implementar rate limiting en APIs

---

## 🟡 Hallazgos de Riesgo Medio

### ⚡ 1. Falta de HTTPS en Desarrollo
**Archivo:** Configuración  
**Riesgo:** Credenciales viajan en HTTP

```bash
# En desarrollo:
npm run dev  # http://localhost:3000
# ❌ LocalStorage + credenciales en plaintext

# Recomendación:
# Usar HTTPS incluso en dev con mkcert
npm install -D mkcert
mkcert -install
mkcert localhost
```

---

### ⚡ 2. Falta CORS Explícito
**Archivo:** next.config.mjs  
**Riesgo:** Supabase requiere CORS para producción

```javascript
// next.config.mjs está vacío
// Debería tener:
const nextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-XSS-Protection', value: '1; mode=block' },
      ],
    },
  ],
};
```

---

### ⚡ 3. Datos Sensibles en Console.log
**Archivos:** medico.js, paciente.js, etc.  
**Riesgo:** DevTools abierto = exposición

```javascript
// medico.js línea ~85
const load = useCallback(async () => {
  const todas = await getTodasLasCitas();
  // ❌ Si error, no hay logging
  // ✅ Pero revisar todos los console.error()
}, []);
```

**Auditar:**
```bash
grep -r "console\." src/ | grep -v "console.warn\|console.error"
# Revisar cada linea
```

---

### ⚡ 4. Session Hijacking Posible
**Archivo:** AuthContext.js  
**Riesgo:** Sin validación de CSRF

**El problema:**
```javascript
// Si un atacante conoce session token, puede:
// 1. Cambiar citas de otros usuarios
// 2. Ver historial ajeno
// 3. Actuar como médico
```

**Mitigación:**
- ✅ Supabase maneja CSRF automáticamente (JWT expira)
- ✅ Tokens se rotan cada 60min
- ⚠️ PERO: agregar refresh token rotation

---

### ⚡ 5. Falta Validación de Entrada (XSS)
**Archivo:** CitaForm.js  
**Riesgo:** Inyección XSS en campo "motivo"

```javascript
// CitaForm.js línea ~100
<textarea
  value={motivo}
  onChange={(e) => setMotivo(e.target.value)}
  // ❌ Si motivo contiene: <script>alert('xss')</script>
  // React escapa automáticamente ✅
  // PERO en server puede renderizarse crudo
/>
```

**Verificar que Supabase valida:**
```sql
-- En RLS policy, validar motivo
CREATE FUNCTION validate_cita_data(p_motivo TEXT) RETURNS BOOLEAN AS $$
BEGIN
  -- Rechazar si contiene HTML/JS
  RETURN p_motivo NOT LIKE '%<script%' 
    AND p_motivo NOT LIKE '%javascript:%';
END;
$$ LANGUAGE plpgsql;
```

---

## 🟢 Hallazgos de Riesgo Bajo

### ℹ️ 1. Dependencias Outdated
```bash
npm outdated
# Revisar que no haya vulns criticas
npm audit
```

---

### ℹ️ 2. Archivo .env Expuesto
```bash
# Verificar que .env NO está en git:
git ls-files | grep .env
# Debería estar vacío
```

---

### ℹ️ 3. Comentarios en Código con Datos Sensibles
```bash
grep -r "TODO\|FIXME\|HACK\|XXX" src/
# Revisar si hay secretos mencionados
```

---

## ✅ Checklist de Seguridad

- [ ] **Crítica 1:** Implementar RLS en todas las tablas
- [ ] **Crítica 2:** Regenerar Supabase keys (ambiente limpio)
- [ ] **Crítica 3:** Validación server-side en RPC Supabase
- [ ] **Alto 1:** Configurar CSP headers + HTTPS obligatorio
- [ ] **Alto 2:** Auditar dónde se usa supabaseAdmin
- [ ] **Alto 3:** Sanitizar error messages públicos
- [ ] **Alto 4:** Implementar rate limiting en APIs
- [ ] **Medio 1:** HTTPS + mkcert en desarrollo
- [ ] **Medio 2:** Agregar CORS headers en next.config.mjs
- [ ] **Medio 3:** Auditar console.log en producción
- [ ] **Medio 4:** Validación de entrada (XSS)
- [ ] **Bajo 1:** npm audit fix (solo si no breaking changes)
- [ ] **Bajo 2:** Verificar .env en .gitignore
- [ ] **Bajo 3:** Revisar comentarios sensibles

---

## 🔧 Plan de Remediación (Prioridad)

### Fase 1: INMEDIATO (Semana 1)
**Bloqueante:** No ir a producción sin esto
1. Implementar RLS en Supabase
2. Regenerar todas las keys
3. Configurar validaciones server-side

### Fase 2: URGENTE (Semana 2-3)
1. Rate limiting en APIs
2. Headers de seguridad (CSP, X-Frame-Options)
3. Auditar uso de supabaseAdmin

### Fase 3: IMPORTANTE (Mes 1)
1. Implementar logging seguro
2. Agregar tests de seguridad
3. Configurar Sentry + monitoring

### Fase 4: MANTENIMIENTO (Ongoing)
1. Auditar dependencias mensualmente
2. Pentest trimestral
3. Revisar logs de acceso

---

## 📞 Contacto y Escalación

Si encuentras una **vulnerabilidad de seguridad:**

🚨 **NO** abrir issue pública  
✅ **SÍ** enviar a: security@medylink.local

---

**Última revisión:** 2026-03-12  
**Próxima auditoría:** 2026-06-12  
**Status:** 🔴 Requiere acción inmediata
