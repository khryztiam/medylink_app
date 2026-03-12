# ðŸ”’ Audit de Seguridad - MedyLink

**Fecha de revisiÃ³n:** 2026-03-12  
**Nivel de criticidad:** âš ï¸ ALTO (Personal mÃ©dico + Datos de salud)  
**Status:** ðŸ”´ Requiere mejoras

---

## ðŸ“‹ Ãndice
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Hallazgos CrÃ­ticos](#hallazgos-crÃ­ticos)
3. [Hallazgos de Alto Riesgo](#hallazgos-de-alto-riesgo)
4. [Hallazgos de Riesgo Medio](#hallazgos-de-riesgo-medio)
5. [Hallazgos de Riesgo Bajo](#hallazgos-de-riesgo-bajo)
6. [Checklist de Seguridad](#checklist-de-seguridad)
7. [Plan de RemediaciÃ³n](#plan-de-remediaciÃ³n)

---

## ðŸŽ¯ Resumen Ejecutivo

El sistema **MedyLink** maneja datos sensibles de salud en un contexto mÃ©dico corporativo. El anÃ¡lisis identifica **3 hallazgos crÃ­ticos, 4 altos, 5 medios** que deben resolverse antes de uso en producciÃ³n.

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| ðŸ”´ CRÃTICA | 3 | âš ï¸ Bloqueante |
| ðŸŸ  ALTO | 4 | âš ï¸ Urgente |
| ðŸŸ¡ MEDIO | 5 | âš ï¸ Importante |
| ðŸŸ¢ BAJO | 3 | â³ Considerar |

---

## ðŸ”´ Hallazgos CrÃ­ticos

### âŒ 1. Falta de RLS (Row Level Security)
**Archivo:** Supabase (tablas)  
**Riesgo:** Usuario autenticado puede leer/modificar citas de otros usuarios

**CÃ³digo actual - SIN PROTECCIÃ“N:**
```javascript
// citasData.js - lÃ­nea ~20
const { data, error } = await supabase
  .from('citas')
  .select('*')
  .eq('idsap', idSAP)
  // âŒ Client confÃ­a en client-side filter
  // âŒ SIN polÃ­tica RLS = cualquier usuario autenticado puede cambiar idSAP en request
```

**Escenario de ataque:**
```javascript
// Hacker modifica el request:
supabase.from('citas').select('*') // obtiene TODAS las citas
supabase.from('citas').update({doctor_name: 'Juan'}).eq('id', id) // modifica sin validar idsap
```

**SoluciÃ³n (URGENTE):**
```sql
-- En Supabase dashboard, ir a SQL Editor y ejecutar:

-- PolÃ­tica para SELECT
CREATE POLICY "Users can read own citas" ON citas
  FOR SELECT
  USING (
    auth.uid()::text = (SELECT id FROM app_users WHERE idsap = citas.idsap)
  );

-- PolÃ­tica para INSERT
CREATE POLICY "Only admin and enfermeria can insert" ON citas
  FOR INSERT
  WITH CHECK (
    (SELECT role FROM app_users WHERE id = auth.uid()) IN ('admin', 'enfermeria')
  );

-- PolÃ­tica para UPDATE
CREATE POLICY "Only own doctor or enfermeria can update" ON citas
  FOR UPDATE
  USING (
    (SELECT role FROM app_users WHERE id = auth.uid()) IN ('admin', 'enfermeria', 'medico')
  );
```

**Impacto:** âš ï¸ BLOQUEANTE - Implementar ANTES de producciÃ³n

---

### âŒ 2. Tokens PÃºblicos Expuestos
**Archivo:** `src/lib/supabase.js`  
**Riesgo:** Clave pÃºblica de Supabase visible en cliente (esperado en Supabase, pero mal configurada)

**Problema:**
```javascript
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY;
// âœ… Esta DEBE ser pÃºblica (anon key)
// âŒ PERO estÃ¡ mal: deberÃ­a estar en .env.local, NO en .env
```

**Verificar environment:**
```bash
# âŒ MAL - Expone credenciales:
echo "NEXT_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIs..." > .env

# âœ… BIEN - En .env.local (gitignored):
echo "NEXT_PUBLIC_SUPABASE_KEY=..." >> .env.local
```

**Verificar commits:**
```bash
# Revisar si keys estÃ¡n en git history:
git log --all -S "NEXT_PUBLIC_SUPABASE_KEY" --oneline
# Si aparecen con valores reales = riesgo crÃ­tico
```

**SoluciÃ³n:**
1. âœ… Regenerar Supabase Key en dashboard (invalidar actual)
2. âœ… Crear `.env.local` con valores reales
3. âœ… Agregar a `.gitignore`
4. âœ… Usar `NEXT_PUBLIC_*` SOLO para valores pÃºblicos

**Impacto:** âš ï¸ CRÃTICA - Regenerar keys inmediatamente

---

### âŒ 3. ValidaciÃ³n Server-Side Ausente
**Archivo:** MÃºltiples (enfermeria.js, paciente.js, etc.)  
**Riesgo:** Validaciones solo client-side, usuario malicioso puede bypassear

**Ejemplos problemÃ¡ticos:**

```javascript
// 1ï¸âƒ£ CitaForm.js lÃ­nea ~35
const handleSubmit = async (e) => {
  // âŒ ValidaciÃ³n SOLO aquÃ­ (client)
  if (!nombre.trim() || !motivo.trim() || isNaN(sapNumerico)) return;

  // âŒ Supabase recibe sin validaciÃ³n server
  await onSubmit({ nombre, motivo, idSAP: sapNumerico, ... });
}
```

**Ataque posible:**
```javascript
// Hacker abre DevTools y ejecuta:
supabase.from('citas').insert([{
  idsap: 999999,           // âŒ Sin verificar que existe
  nombre: "Juan",          // âŒ Sin verificar contra BD
  motivo: "Malware",
  // omite check_in, estado, etc.
}])
```

**SoluciÃ³n - Agregar RPC/FunciÃ³n en Supabase:**
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

**Impacto:** âš ï¸ CRÃTICA - Implementar validaciÃ³n server-side

---

## ðŸŸ  Hallazgos de Alto Riesgo

### âš ï¸ 1. InformaciÃ³n de Usuario en LocalStorage
**Archivo:** `src/context/AuthContext.js`  
**Riesgo:** Datos de sesiÃ³n en localStorage accesible a XSS

**CÃ³digo:**
```javascript
// contexts/AuthContext.js - lÃ­nea ~50
persistSession: true,
storage: {
  getItem: (key) => (typeof window !== "undefined" ? localStorage.getItem(key) : null),
  setItem: (key, value) => localStorage.setItem(key) value),
  // âŒ userData, roles guardados aquÃ­ sin encriptaciÃ³n
}
```

**Ataque XSS posible:**
```javascript
// Inyectado en pÃ¡gina via CDN comprometido
localStorage.getItem('sb-auth-token')  // Obtiene token
localStorage.getItem('sb-session')     // Obtiene sesiÃ³n
// EnvÃ­a a servidor atacante
```

**MitigaciÃ³n:**
```javascript
// OpciÃ³n 1: Usar sessionStorage en lugar de localStorage
sessionStorage.setItem(key, value)  // Se borra al cerrar tab

// OpciÃ³n 2: Supabase Auth handles esto internamente
// No almacenar userData sensible, solo solicitar al servidor
```

**Impacto:** ðŸŸ  ALTO - Implementar CSP headers + HTTPS obligatorio

---

### âš ï¸ 2. Funciones Admin Sin RLS Propias
**Archivo:** `src/lib/supabaseAdmin.js`

**Riesgo:** Cliente puede acceder a funciones admin si descubre el endpoint

```javascript
// supabaseAdmin.js
const supabaseAdmin = createClient(supabaseUrl, supabaseKey);
// âŒ NUNCA enviar esto al cliente
// âŒ NUNCA usar en pages/
```

**Verificar uso:**
```bash
grep -r "supabaseAdmin" src/pages/
# Si aparece algo = CRÃTICA
```

**CorrecciÃ³n esperada:**
```
âœ… supabaseAdmin.js â†’ API ROUTES ONLY
âŒ NUNCA en components/ o contexto
```

**Impacto:** ðŸŸ  ALTO - Auditar dÃ³nde se usa supabaseAdmin

---

### âš ï¸ 3. Error Messages Revelan InformaciÃ³n
**Archivo:** MÃºltiples  
**Riesgo:** Mensajes de error revelan estructura de BD

**Ejemplos:**
```javascript
// AuthContext.js lÃ­nea ~45
try {
  await supabase.auth.signInWithPassword({ email, password });
} catch (err) {
  setError(err.message) // âŒ Muestra error Supabase crudo
  // Error: "Invalid login credentials" â† OK
  // Pero otros errores podrÃ­an revelar BD schema
}
```

**Mejor prÃ¡ctica:**
```javascript
catch (err) {
  // Log error real servidor-side
  console.error('Auth error:', err);
  
  // Mostrar al user mensaje genÃ©rico
  setError(
    err.message?.includes('invalid') 
      ? 'Credenciales incorrectas'
      : 'Error en el sistema. Intenta de nuevo.'
  );
}
```

**Impacto:** ðŸŸ  ALTO - Sanitizar messages pÃºblicos

---

### âš ï¸ 4. No Hay Rate Limiting
**Archivo:** API routes (api/telegram-webhook.js, api/admin/*)  
**Riesgo:** Brute force, DDoS posible

**Endpoint vulnerable:**
```javascript
// pages/api/admin/importarAllowed.js
export default async function handler(req, res) {
  // âŒ SIN rate limiting
  // âŒ Usuario puede hacer 1000 requests/segundo
  // âŒ Bloquear BD
}
```

**SoluciÃ³n recomendada:**
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100 // 100 requests/ventana
});

export default limiter(handler);
```

**O usar Supabase Edge Functions** (mejor, outsourced)

**Impacto:** ðŸŸ  ALTO - Implementar rate limiting en APIs

---

## ðŸŸ¡ Hallazgos de Riesgo Medio

### âš¡ 1. Falta de HTTPS en Desarrollo
**Archivo:** ConfiguraciÃ³n  
**Riesgo:** Credenciales viajan en HTTP

```bash
# En desarrollo:
npm run dev  # http://localhost:3000
# âŒ LocalStorage + credenciales en plaintext

# RecomendaciÃ³n:
# Usar HTTPS incluso en dev con mkcert
npm install -D mkcert
mkcert -install
mkcert localhost
```

---

### âš¡ 2. Falta CORS ExplÃ­cito
**Archivo:** next.config.mjs  
**Riesgo:** Supabase requiere CORS para producciÃ³n

```javascript
// next.config.mjs estÃ¡ vacÃ­o
// DeberÃ­a tener:
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

### âš¡ 3. Datos Sensibles en Console.log
**Archivos:** medico.js, paciente.js, etc.  
**Riesgo:** DevTools abierto = exposiciÃ³n

```javascript
// medico.js lÃ­nea ~85
const load = useCallback(async () => {
  const todas = await getTodasLasCitas();
  // âŒ Si error, no hay logging
  // âœ… Pero revisar todos los console.error()
}, []);
```

**Auditar:**
```bash
grep -r "console\." src/ | grep -v "console.warn\|console.error"
# Revisar cada linea
```

---

### âš¡ 4. Session Hijacking Posible
**Archivo:** AuthContext.js  
**Riesgo:** Sin validaciÃ³n de CSRF

**El problema:**
```javascript
// Si un atacante conoce session token, puede:
// 1. Cambiar citas de otros usuarios
// 2. Ver historial ajeno
// 3. Actuar como mÃ©dico
```

**MitigaciÃ³n:**
- âœ… Supabase maneja CSRF automÃ¡ticamente (JWT expira)
- âœ… Tokens se rotan cada 60min
- âš ï¸ PERO: agregar refresh token rotation

---

### âš¡ 5. Falta ValidaciÃ³n de Entrada (XSS)
**Archivo:** CitaForm.js  
**Riesgo:** InyecciÃ³n XSS en campo "motivo"

```javascript
// CitaForm.js lÃ­nea ~100
<textarea
  value={motivo}
  onChange={(e) => setMotivo(e.target.value)}
  // âŒ Si motivo contiene: <script>alert('xss')</script>
  // React escapa automÃ¡ticamente âœ…
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

## ðŸŸ¢ Hallazgos de Riesgo Bajo

### â„¹ï¸ 1. Dependencias Outdated
```bash
npm outdated
# Revisar que no haya vulns criticas
npm audit
```

---

### â„¹ï¸ 2. Archivo .env Expuesto
```bash
# Verificar que .env NO estÃ¡ en git:
git ls-files | grep .env
# DeberÃ­a estar vacÃ­o
```

---

### â„¹ï¸ 3. Comentarios en CÃ³digo con Datos Sensibles
```bash
grep -r "TODO\|FIXME\|HACK\|XXX" src/
# Revisar si hay secretos mencionados
```

---

## âœ… Checklist de Seguridad

- [ ] **CrÃ­tica 1:** Implementar RLS en todas las tablas
- [ ] **CrÃ­tica 2:** Regenerar Supabase keys (ambiente limpio)
- [ ] **CrÃ­tica 3:** ValidaciÃ³n server-side en RPC Supabase
- [ ] **Alto 1:** Configurar CSP headers + HTTPS obligatorio
- [ ] **Alto 2:** Auditar dÃ³nde se usa supabaseAdmin
- [ ] **Alto 3:** Sanitizar error messages pÃºblicos
- [ ] **Alto 4:** Implementar rate limiting en APIs
- [ ] **Medio 1:** HTTPS + mkcert en desarrollo
- [ ] **Medio 2:** Agregar CORS headers en next.config.mjs
- [ ] **Medio 3:** Auditar console.log en producciÃ³n
- [ ] **Medio 4:** ValidaciÃ³n de entrada (XSS)
- [ ] **Bajo 1:** npm audit fix (solo si no breaking changes)
- [ ] **Bajo 2:** Verificar .env en .gitignore
- [ ] **Bajo 3:** Revisar comentarios sensibles

---

## ðŸ”§ Plan de RemediaciÃ³n (Prioridad)

### Fase 1: INMEDIATO (Semana 1)
**Bloqueante:** No ir a producciÃ³n sin esto
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

## ðŸ“ž Contacto y EscalaciÃ³n

Si encuentras una **vulnerabilidad de seguridad:**

ðŸš¨ **NO** abrir issue pÃºblica  
âœ… **SÃ** enviar a: security@medylink.local

---

**Ãšltima revisiÃ³n:** 2026-03-12  
**PrÃ³xima auditorÃ­a:** 2026-06-12  
**Status:** ðŸ”´ Requiere acciÃ³n inmediata

