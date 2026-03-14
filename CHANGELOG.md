# 📝 Changelog - MedyLink v0.2.2

**Fecha:** 2026-03-14  
**Versión:** 0.2.2  
**Estado:** ✅ Estable - Todos los hallazgos críticos resueltos

---

## 🎯 Resumen de Cambios v0.2.2

**Todas las vulnerabilidades críticas de seguridad han sido resueltas y testeadas en producción.**

---

## ✅ Hallazgos Críticos RESUELTOS

### 1. 🔐 RLS Policy en `allowed_users` - CORREGIDO
**Fecha:** 2026-03-14  
**Problema:** Foreign key relationship `allowed_users(nombre)` retornaba NULL bloqueando carga de nombre en AuthContext  
**Causa raíz:** RLS habilitado sin política de SELECT para la tabla de referencia  
**Solución:** 
```sql
CREATE POLICY "allow_read_allowed_users" ON allowed_users
  FOR SELECT
  USING (true);
```
**Impacto:** ✅ Nombres de usuarios ahora cargan correctamente en todas las vistas  
**Archivos afectados:** 
- Supabase: Políticas RLS
- `doc/RLS_ALLOWED_USERS_FIX.md`: Documentación detallada

**Testing:** ✅ Verificado en localhost y Vercel

---

### 2. ✔️ Validación Server-side para Citas - IMPLEMENTADO
**Fecha:** 2026-03-14  
**Hallazgo crítico:** Inserciones de citas solo validaban en client-side (bypasseable)  
**Solución:** Nuevo endpoint POST `/api/citas/crear` con validaciones:
- ✅ JWT token requerido (401)
- ✅ Usuario existe en BD (403)
- ✅ SAP destino existe en allowed_users (400)
- ✅ Paciente solo para sí mismo (403)
- ✅ Rol válido (403)
- ✅ Entrada validada (400)

**Archivos nuevos:**
- `src/pages/api/citas/crear.js`: Endpoint con validación server-side

**Archivos modificados:**
- `src/lib/citasData.js`: `agregarCita()` ahora usa endpoint validador

**Testing:** ✅ 9/9 tests aprobados en localhost

---

### 3. 🛡️ Políticas RLS en Tabla `citas` - COMPLETADAS
**Fecha:** 2026-03-14  
**Problema:** Faltaban políticas INSERT para enfermería/admin crear citas  
**Solución:** Agregadas 2 políticas:
```sql
-- Pacientes: solo para sí mismos
CREATE POLICY "pacientes_crear_cita" ON citas
  FOR INSERT
  WITH CHECK (
    role = 'paciente' AND 
    "idSAP" = usuario_idsap_actual
  );

-- Enfermería/Admin: para cualquiera
CREATE POLICY "enfermeria_crear_citas" ON citas
  FOR INSERT
  WITH CHECK (
    role = ANY (ARRAY['enfermeria', 'admin'])
  );
```

**Testing:** ✅ Verificado que ambos roles pueden crear citas correctamente

---

## 🔧 Correcciones Técnicas

### Inconsistencia de Nombres de Columna: `idSAP` vs `idsap`
**Problema:** Endpoint intentaba insertar con `idsap` pero tabla tiene `"idSAP"` (camelCase)  
**Fix:** Actualizado en `src/pages/api/citas/crear.js` línea 124  
**Error:** "Could not find the 'idsap' column of 'citas'"  
**Solución:** ✅ Cambiado a `"idSAP"`  

---

## 📊 Rate Limiting - YA ACTIVO (v0.2.1)
**Status:** ✅ Implementado y testeado  
**Endpoints protegidos:**
- `GET /api/admin/summary`: 60 req/15min por IP
- `POST /api/admin/importarAllowed`: 10 req/15min por usuario
- Respuestas incluyen headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

**Archivo:** `src/lib/rateLimit.js`

---

## 🧪 Testing Realizado

### En Localhost (2026-03-14)
✅ Login paciente - OK  
✅ Crear cita paciente - OK  
✅ Login admin - OK  
✅ Crear cita admin para otro SAP - OK  
✅ Programación de citas - OK  
✅ Check-in de pacientes - OK  
✅ Cards de espera - OK  
✅ Vista médico (selección + cambio estado) - OK  
✅ Vista turno (alerta + cambio) - OK  

### Validaciones Server-side
✅ JWT requerido (401 sin token)  
✅ Validación de entrada (400 datos inválidos)  
✅ Bloqueo de paciente creando para otro SAP (403)  
✅ Permiso admin/enfermería para cualquier SAP (200)  

### Rate Limiting
✅ Headers X-RateLimit presentes  
✅ Contador decremental funcionando  
✅ Límite de 60 req/15min en /api/admin/summary  

---

## 🚀 Deploy

**Última versión desplegada:** b9c08e2  
**Fecha:** 2026-03-14  
**Estado:** ✅ En producción Vercel

**Commits incluidos:**
- `b9c08e2`: RLS fix en allowed_users + documentación
- `769a87c`: Rate limiting middleware
- `735f2f5`: AuthContext null-safety operators

---

## 📋 Próximos Pasos (v0.2.3)

Hallazgos de **ALTO RIESGO** pendientes:
- [ ] Configurar CSP headers + HTTPS obligatorio
- [ ] Auditar dónde se usa supabaseAdmin
- [ ] Sanitizar error messages públicos
- [ ] Implementar logging seguro

---

## 📞 Soporte

Para reportar vulnerabilidades de seguridad:
- ⚠️ NO usar issues públicos de GitHub
- 📧 Contactar a security@medylink.io
- 🔐 PGP key: [disponible en doc/]

---

**Revisado por:** Sistema de auditoría automatizado  
**Validado en:** Localhost + Vercel staging + Producción  
**Status de producción:** ✅ ESTABLE
