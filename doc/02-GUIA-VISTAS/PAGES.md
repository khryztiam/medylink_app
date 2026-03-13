# 📄 Guía de Páginas (Vistas Principales)

**Stack:** Next.js Pages Router  
**Última actualización:** 2026-03-12

---

## 📋 Índice de Páginas

1. [index.js - Login/Registro](#1-indexjs---loginregistro)
2. [paciente.js - Portal del Paciente](#2-pacientejs---portal-del-paciente)
3. [medico.js - Panel del Médico](#3-medicojs---panel-del-médico)
4. [enfermeria.js - Gestión Integral](#4-enfermeriajsgestión-integral)
5. [supervisor.js - Monitor de Estadísticas](#5-supervisorjs---monitor-de-estadísticas)
6. [turno.js - Pantalla Pública de Turnos](#6-turnojspantalla-pública-de-turnos)
7. [_app.js - Wrapper Global](#7-_appjs---wrapper-global)

---

## 1. index.js - Login/Registro

**Ruta:** `/`  
**Roles autorizados:** ❌ Ninguno (pública)  
**Propósito:** Autenticación de usuario (SAP + contraseña)

### 🎯 Funcionalidades

#### A. Modo Login
```
Usuario ingresa SAP (8+ dígitos)
              ↓
Convierte a email: {SAP}@yazaki.com
              ↓
Intenta supabase.auth.signInWithPassword()
              ↓
Llama context.login() que:
  • Obtiene userData (role, nombre, status)
  • Valida que status = true
  • Redirige según role
```

**Validaciones:**
- SAP debe ser 8+ dígitos
- Email construido: `SAP@yazaki.com`
- Password: encriptada por Supabase (bcrypt)

**Errores comunes:**
```javascript
// "Credenciales incorrectas" → SAP o password mal
// "Usuario inactivo" → status = false en BD
// "No se pudieron obtener datos" → error al fetchear app_users
```

#### B. Modo Registro
```
Usuario ingresa SAP + contraseña (2x)
              ↓
Valida: SAP (8+), contraseñas coinciden, min 6 chars
              ↓
Verifica SAP no existe en app_users
              ↓
Crea user en auth + inserta en app_users (role=paciente, status=false)
              ↓
Verifica si SAP está en allowed_users
  ├─ Sí → Actualiza status = true (activo)
  └─ No → status = false (requiere aprobación)
```

### 🎨 UI/UX

- **Animación:** Modo login/registro desliza de derecha/izquierda
- **Contraseña:** Botón ojo para mostrar/ocultar
- **Feedback visual:** Loading buttons, error highlighting
- **Responsive:** Desktop (2 cols) / Mobile (1 col)

### 📝 Archivos relacionados

```
src/pages/index.js
src/context/AuthContext.js (método login)
src/styles/Login.module.css
public/login-illustration.png
```

### ⚠️ Puntos críticos

```javascript
// ❌ RIESGO: SAP no se valida en servidor
// El email se construye en cliente:
const email = idsap.trim().toLowerCase() + "@yazaki.com"

// ✅ MEJORA: Validar SAP en RPC Supabase
// Verificar que existe en allowed_users ANTES de crear auth.user
```

---

## 2. paciente.js - Portal del Paciente

**Ruta:** `/paciente`  
**Role requerido:** `paciente`  
**Propósito:** Crear citas y consultar historial

### 🎯 Secciones

#### A. Hero Section (Bienvenida)
```
[Nombre paciente]
[Saludo según hora del día] 🌤️
Botones: [Nueva cita] [Historial]
```

#### B. Cita Activa (Si existe)
Muestra la próxima cita pendiente/programada:
```
┌─ Cita Activa ─────────────┐
│ Estado: PROGRAMADO        │
│ Motivo: Revisión general  │
│ Programada: 12/03 14:30   │
│ [Ver detalles] [Cancelar] │
└───────────────────────────┘
```

#### C. Historial de Citas
**Formatos:**
- Desktop: Tabla (motivo, solicitud, programada, salida)
- Mobile: Cards con fecha+icono

**Estados visuales:**
- 🟢 Atendido (verde)
- 🟡 Pendiente (amarillo)
- 🔵 Programado (azul)
- 🔴 Cancelado (rojo)

**Paginación:** Últimas 15 citas

#### D. Modal Nueva Cita
```
Campo SAP: [Autocompletado, readonly]
Campo Nombre: [Autocompletado, readonly]
¿Emergencia?: [Toggle SI/NO]
¿ISSS?: [Toggle SI/NO]
Motivo: [Textarea - principal]
[Crear] [Cancelar]
```

**Flujo:**
1. Valida motivo no vacío
2. INSERT en tabla citas (estado=pendiente)
3. Cierra modal
4. Notifica "Cita creada"
5. Recarga historial via Realtime

### 🔄 Realtime

```javascript
// Suscripción a cambios en citas del paciente
supabase.channel("citas-paciente")
  .on("postgres_changes", { event: "*", table: "citas" }, (payload) => {
    // Si payload.new.idsap === authUser.idsap → actualizar
  })
```

### 📱 Responsive Design

| Breakpoint | Layout |
|-----------|--------|
| < 768px | Cards (mobile-first) |
| ≥ 768px | Tabla + componentes lado a lado |

### 📝 Archivos relacionados

```
src/pages/paciente.js
src/components/CitaForm.js (modal)
src/components/ConsultaCita.js (detalle)
src/components/EstadoConsulta.js (status badge)
src/lib/citasData.js (CRUD)
src/styles/Paciente.module.css
```

### ⚠️ Puntos críticos

```javascript
// En paciente.js línea ~30
const citaActiva = citas.find(c => 
  c.estado === "pendiente" || c.estado === "programado"
);

// ❌ RIESGO: Si hay 2 citas activas, solo muestra la primera
// ✅ MEJORA: Mostrar TODAS y let paciente choose, or mostrar más reciente
```

---

## 3. medico.js - Panel del Médico  

**Ruta:** `/medico`  
**Role requerido:** `medico`  
**Propósito:** Atender pacientes y completar consultas

### 🎯 Secciones

#### A. Resumen (Card principal)
```
Buenos días, Dr. Juan
Pacientes en espera: 5
Últimas programadas: 3

[🔇 Sirena activa] ← Indica audio enabled
```

#### B. Citas Activas (En espera + En consulta)
```
┌─────────────────────────────────┐
│ PACIENTE: María García    [EMERGENCIA]
│ SAP: 12345678
│ Turno: #3
│ Motivo: Cefalea crónica
│ Tiempo: 12 min
│ [Atender] [Defer] [Finalizar]
└─────────────────────────────────┘
```

**Estados:**
- 🔴 En espera (vistoso)
- 🟠 En consulta (actual)
- Emergencias destacadas color rojo

#### C. Últimas Programadas (Próximas 25)
```
Lista scrolleable de citas futuras
Ordenadas por fecha programada (ascendente)
```

### 🔔 Audio Feedback

```javascript
// Detecta transición: * → "en espera" → reproduce doorbell
// Archivo: /public/doorbell.mp3
// Volumen: 1.0

// Desbloquea en primer click/tecla (browser autoplay policy)
function desbloquearAudio() {
  const audio = new Audio("/doorbell.mp3");
  audio.volume = 0;
  audio.play().then(() => {
    audio.pause();
    audioDesbloqueado = true;  // ✅ Ahora funciona en Realtime
  });
}
```

### 🔄 Realtime & Estados

**Máquina de estados:**
```
PENDIENTE
    ↓ (solo enfermería)
EN ESPERA
    ↓ (médico → "Atender")
EN CONSULTA (timer comienza)
    ↓ (médico → "Finalizar")
ATENDIDO (calcula duración)
```

**Campos críticos:**
- `estado`: controla visibilidad
- `doctor_name`: validar que no es null
- `check_in` / `check_out`: timestamps de duración
- `orden_llegada`: número de turno

### 🔴 Acciones del Médico

**1. Atender**
```javascript
await actualizarCita(id, {
  estado: "en consulta",
  doctor_name: currentDoctor  // ← Importante: quitar de propuesta si es null
})
```

**2. Finalizar**
```javascript
// Valida que estado === "en consulta"
// Agrega check_out: NOW()
// Cambia a "atendido"
await actualizarCita(id, {
  estado: "atendido",
  check_out: new Date().toISOString()
})
```

### 📝 Archivos relacionados

```
src/pages/medico.js
src/components/DoctorPanel.js (card de cita)
src/lib/citasData.js
src/styles/Doctor.module.css
public/doorbell.mp3
```

### ⚠️ Puntos críticos

```javascript
// En medico.js línea ~85 (finalizar)
if (cita.estado !== "en consulta")
  throw new Error('Solo se pueden finalizar citas...')

// ❌ RIESGO: Error message exposed a usuario
// ✅ MEJORA: Log error server, mostrar genérico al user
```

---

## 4. enfermeria.js - Gestión Integral

**Ruta:** `/enfermeria`  
**Role requerido:** `enfermeria`  
**Propósito:** Gestión completa de flujo de citas

### 🎯 Interfaz: Tabs

```
[PENDIENTES] [EN ESPERA] [PROGRAMADAS] [MÉDICO ACTIVO]
```

#### A. Tab: PENDIENTES
Citas creadas pero NO registradas aún
```
para cada cita pendiente:
  ┌─ Cita ─────────────────┐
  │ Nombre: Juan García    │
  │ SAP: 12345            │
  │ Motivo: Dolor cabeza  │
  │ ¿Emergencia?: NO      │
  │ Llegada: 14:23        │
  │ [REGISTRAR] [CANCELAR]│
  └────────────────────────┘

[+ Nueva cita] (abre modal)
```

**Acción REGISTRAR:**
```javascript
await actualizarCita(id, {
  estado: "en espera",
  check_in: NOW(),
  orden_llegada: nextTurnoNumber  // ← Calcula turno
})
// → Reproduces "nueva_cita.mp3"
// → Cita aparece en turno.js
// → Médico lo ve y escucha sonido
```

#### B. Tab: EN ESPERA
Citas en fila esperando médico
```
para cada cita:
  [Paciente] [Motivo] [Min en espera] [Médico asignado]
  
  Acciones:
  [Programar] → abre DateTimePicker
  [Finalizar] → saltar fila (marca atendido)
  [Cancelar]
```

#### C. Tab: PROGRAMADAS
Citas futuras (calendario)
```
Vista tipo agenda
Click en cita → editar fecha
Buscar por SAP/nombre
```

#### D. Tab: MÉDICO ACTIVO
Monitor de quién está atendiendo
```
Dr. Juan García: EN CONSULTA (desde 12 min)
Paciente: María García
Motivo: Revisión
[Ver detalle] [Finalizar]
```

### 🔔 Audio

```javascript
// Nueva cita ingresa → reproduce /nueva_cita.mp3
// Archivo: /public/nueva_cita.mp3
// Volumen: 1.0
```

### 🔄 Realtime

Escucha todos los cambios en tabla `citas`:
```javascript
.on("postgres_changes", { event: "*", table: "citas" }, async (payload) => {
  // Re-cargar todos los tabs
  await load()  // Recalc pendientes, en_espera, programadas
})
```

### 📝 Archivos relacionados

```
src/pages/enfermeria.js
src/components/CitaForm.js (nueva cita modal)
src/components/FechaHoraInput.js (date picker)
src/components/MedicoActivo.js (monitor)
src/lib/citasData.js
src/styles/Enfermeria.module.css
public/nueva_cita.mp3
```

### ⚠️ Puntos críticos

```javascript
// En enfermeria.js: Manual orden_llegada
// ❌ RIESGO: Si 2 requests simultáneos, same turno number
// ✅ MEJORA: Calcular en BD con sequence o trigger
```

---

## 5. supervisor.js - Monitor de Estadísticas

**Ruta:** `/supervisor`  
**Role requerido:** `supervisor`  
**Propósito:** Dashboard de métricas y flujo

### 🎯 Métricas Mostradas

```
┌─────────────────────────────┐
│ CITAS PROGRAMADAS    │ 12
│ EN CONSULTA (HOY)    │ 3
│ ATENDIDAS (HOY)      │ 45
│ TIEMPO PROMEDIO      │ 18 min
│ CUPOS DISPONIBLES    │ 8
└─────────────────────────────┘
```

#### Cálculos

**Tiempo promedio:**
```javascript
const tiempoPromedio = totalDuracion / totalAtendidas
// duracion = check_out - check_in

// ❌ RIESGO: Si no hay check_out, calcula mal
// ✅ MEJORA: WHERE check_out IS NOT NULL
```

**Cupos:**
```javascript
const cupos = COUNT(estado IN ('programado', 'en espera'))
// Rango: HOY (desde 00:00 a 23:59)
```

### 🔄 Realtime

Actualiza cada 5-10 segundos automáticamente (no manual refresh)

### 📝 Archivos relacionados

```
src/pages/supervisor.js
src/styles/Supervisor.module.css
src/components/EstadoConsulta.js
```

### ⚠️ Puntos críticos

```javascript
// En supervisor.js línea ~120 (antes era bug)
const fetchCupos = useCallback(async () => {
  const { ini, fin } = hoyRango();
  const { data } = await supabase
    .from("citas").select("estado")
    .in("estado", ["programado", "en espera"])
    .gte("programmer_at", ini).lte("programmer_at", fin)
  
  // ✅ CORREGIDO: Ahora usa datos recientes
  // ❌ ANTES: setCuposProgramados(cuposProgramados) [infinite loop]
})
```

---

## 6. turno.js - Pantalla Pública de Turnos

**Ruta:** `/turno`  
**Roles autorizados:** `enfermeria`, `admin` (principalmente)  
**Propósito:** Pantalla de TV mostrando próximos pacientes

### 🎯 Layout

```
┌─────────────────────────────────────────────┐
│ PACIENTES EN ESPERA                         │
│ ┌──────────────────────────────────────────┐│
│ │ #2 - JUAN GARCÍA               EN ESPERA ││
│ │ Motivo: Revisión / SAP: 12345           ││
│ └──────────────────────────────────────────┘│
│ ┌──────────────────────────────────────────┐│
│ │ #4 - MARÍA LÓPEZ         [EMERGENCIA]   ││
│ │ Motivo: Dolor / SAP: 54321              ││
│ └──────────────────────────────────────────┘│
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ AHORA ATENDIENDO:                           │
│ Consultorio A: DR. JUAN GARCÍA              │
│ Paciente: CARLOS SUÁREZ                     │
│ Tiempo: 12 minutos                          │
└─────────────────────────────────────────────┘
```

### 🎨 Diseño

- **Sidebar izquierdo:** Fila de espera (scrolleable)
- **Panel derecho:** Ahora atendiendo (grande)
- **Colors:**
  - Gris: En espera normal
  - Rojo: Emergencia
  - Naranja: En consulta
- **Font:** Grande y legible (TV screen)

### 🔄 Realtime

```javascript
.on("postgres_changes", { event: "*", table: "citas" }, (payload) => {
  // Filtra solo: estado IN ("en espera", "en consulta")
  // Ordena por orden_llegada (turno)
})
```

### 📝 Archivos relacionados

```
src/pages/turno.js
src/components/TurnoDisplay.js
src/styles/Turno.module.css
```

---

## 7. _app.js - Wrapper Global

**Ruta:** No es ruta (envuelve todas)  
**Propósito:** Inicializar Auth, Layout, estilos globales

### 🎯 Estructura

```javascript
<AuthProvider>           // ← Auth en contexto global
  <Head>                // ← Meta tags, favicon
  <AuthGate>            // ← Control de acceso
    <Layout>            // ← Navegación lateral, headers
      <Component />     // ← Página actual
    </Layout>
  </AuthGate>
</AuthProvider>
```

### 📋 Configuración

```javascript
// Meta tags set aquí
<title>Medylink</title>
<meta name="theme-color" content="#3f91e8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

### 📝 Archivos relacionados

```
src/pages/_app.js
src/context/AuthContext.js
src/components/AuthGate.js
src/components/Layout.jsx
src/styles/globals.css
```

---

## 🗺️ Mapa de Navegación (Rutas)

```
/ (index.js)
  ├─ Sin auth
  │   ├─ LOGIN
  │   └─ REGISTER
  └─ Con auth → Redirige según role

/paciente → role: paciente
/medico → role: medico
/enfermeria → role: enfermeria
/supervisor → role: supervisor
/turno → role: enfermeria|admin
/admin/control → role: admin
```

**Control de rutas:**
```javascript
// En AuthGate.js
const roleRoutes = {
  paciente: ['/', '/paciente'],
  medico: ['/', '/medico'],
  enfermeria: ['/', '/enfermeria', '/turno'],
  supervisor: ['/', '/supervisor'],
  admin: ['/', '/admin/control', '/paciente', '/enfermeria', '/medico', '/turno', '/supervisor'],
}

// Si usuario accede a ruta no permitida → muestra NoAuth alert
```

---

## 🚀 Flujo de Sesión Completo

```
Usuario en navegador
  ↓
Carga index.js (/) → AuthGate verifica session
  ↓
SI session existe → redirige a ruta del role
  SI role=paciente ↓ /paciente
  SI role=medico ↓ /medico
  etc.
  ↓
SI NO session → muestra login/register en index.js
  ↓
Usuario registra (nuevo SAP) o login
  ↓
context.login() obtiene role
  ↓
router.push() redirige automáticamente
  ↓
AuthGate permite acceso + renderiza Layout
```

---

## 📊 Resumen de Características por Página

| Página | Realtime | Audio | CRUD | Forms | Charts |
|--------|----------|-------|------|-------|--------|
| index.js | ❌ | ❌ | Read | ✅ | ❌ |
| paciente.js | ✅ | ❌ | CRUD | ✅ | ❌ |
| medico.js | ✅ | ✅ | Update | ❌ | ❌ |
| enfermeria.js | ✅ | ✅ | CRUD | ✅ | ❌ |
| supervisor.js | ✅ | ❌ | Read | ❌ | ✅ |
| turno.js | ✅ | ❌ | Read | ❌ | ❌ |
| admin/control | ✅ | ❌ | CRUD | ✅ | ✅ |

---

**Última actualización:** 2026-03-12  
**Última revisión:** Code review completo
