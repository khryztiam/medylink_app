# ðŸ“„ GuÃ­a de PÃ¡ginas (Vistas Principales)

**Stack:** Next.js Pages Router  
**Ãšltima actualizaciÃ³n:** 2026-03-12

---

## ðŸ“‹ Ãndice de PÃ¡ginas

1. [index.js - Login/Registro](#1-indexjs---loginregistro)
2. [paciente.js - Portal del Paciente](#2-pacientejs---portal-del-paciente)
3. [medico.js - Panel del MÃ©dico](#3-medicojs---panel-del-mÃ©dico)
4. [enfermeria.js - GestiÃ³n Integral](#4-enfermeriajsgestiÃ³n-integral)
5. [supervisor.js - Monitor de EstadÃ­sticas](#5-supervisorjs---monitor-de-estadÃ­sticas)
6. [turno.js - Pantalla PÃºblica de Turnos](#6-turnojspantalla-pÃºblica-de-turnos)
7. [_app.js - Wrapper Global](#7-_appjs---wrapper-global)

---

## 1. index.js - Login/Registro

**Ruta:** `/`  
**Roles autorizados:** âŒ Ninguno (pÃºblica)  
**PropÃ³sito:** AutenticaciÃ³n de usuario (SAP + contraseÃ±a)

### ðŸŽ¯ Funcionalidades

#### A. Modo Login
```
Usuario ingresa SAP (8+ dÃ­gitos)
              â†“
Convierte a email: {SAP}@yazaki.com
              â†“
Intenta supabase.auth.signInWithPassword()
              â†“
Llama context.login() que:
  â€¢ Obtiene userData (role, nombre, status)
  â€¢ Valida que status = true
  â€¢ Redirige segÃºn role
```

**Validaciones:**
- SAP debe ser 8+ dÃ­gitos
- Email construido: `SAP@yazaki.com`
- Password: encriptada por Supabase (bcrypt)

**Errores comunes:**
```javascript
// "Credenciales incorrectas" â†’ SAP o password mal
// "Usuario inactivo" â†’ status = false en BD
// "No se pudieron obtener datos" â†’ error al fetchear app_users
```

#### B. Modo Registro
```
Usuario ingresa SAP + contraseÃ±a (2x)
              â†“
Valida: SAP (8+), contraseÃ±as coinciden, min 6 chars
              â†“
Verifica SAP no existe en app_users
              â†“
Crea user en auth + inserta en app_users (role=paciente, status=false)
              â†“
Verifica si SAP estÃ¡ en allowed_users
  â”œâ”€ SÃ­ â†’ Actualiza status = true (activo)
  â””â”€ No â†’ status = false (requiere aprobaciÃ³n)
```

### ðŸŽ¨ UI/UX

- **AnimaciÃ³n:** Modo login/registro desliza de derecha/izquierda
- **ContraseÃ±a:** BotÃ³n ojo para mostrar/ocultar
- **Feedback visual:** Loading buttons, error highlighting
- **Responsive:** Desktop (2 cols) / Mobile (1 col)

### ðŸ“ Archivos relacionados

```
src/pages/index.js
src/context/AuthContext.js (mÃ©todo login)
src/styles/Login.module.css
public/login-illustration.png
```

### âš ï¸ Puntos crÃ­ticos

```javascript
// âŒ RIESGO: SAP no se valida en servidor
// El email se construye en cliente:
const email = idsap.trim().toLowerCase() + "@yazaki.com"

// âœ… MEJORA: Validar SAP en RPC Supabase
// Verificar que existe en allowed_users ANTES de crear auth.user
```

---

## 2. paciente.js - Portal del Paciente

**Ruta:** `/paciente`  
**Role requerido:** `paciente`  
**PropÃ³sito:** Crear citas y consultar historial

### ðŸŽ¯ Secciones

#### A. Hero Section (Bienvenida)
```
[Nombre paciente]
[Saludo segÃºn hora del dÃ­a] ðŸŒ¤ï¸
Botones: [Nueva cita] [Historial]
```

#### B. Cita Activa (Si existe)
Muestra la prÃ³xima cita pendiente/programada:
```
â”Œâ”€ Cita Activa â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ Estado: PROGRAMADO        â”‚
â”‚ Motivo: RevisiÃ³n general  â”‚
â”‚ Programada: 12/03 14:30   â”‚
â”‚ [Ver detalles] [Cancelar] â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### C. Historial de Citas
**Formatos:**
- Desktop: Tabla (motivo, solicitud, programada, salida)
- Mobile: Cards con fecha+icono

**Estados visuales:**
- ðŸŸ¢ Atendido (verde)
- ðŸŸ¡ Pendiente (amarillo)
- ðŸ”µ Programado (azul)
- ðŸ”´ Cancelado (rojo)

**PaginaciÃ³n:** Ãšltimas 15 citas

#### D. Modal Nueva Cita
```
Campo SAP: [Autocompletado, readonly]
Campo Nombre: [Autocompletado, readonly]
Â¿Emergencia?: [Toggle SI/NO]
Â¿ISSS?: [Toggle SI/NO]
Motivo: [Textarea - principal]
[Crear] [Cancelar]
```

**Flujo:**
1. Valida motivo no vacÃ­o
2. INSERT en tabla citas (estado=pendiente)
3. Cierra modal
4. Notifica "Cita creada"
5. Recarga historial via Realtime

### ðŸ”„ Realtime

```javascript
// SuscripciÃ³n a cambios en citas del paciente
supabase.channel("citas-paciente")
  .on("postgres_changes", { event: "*", table: "citas" }, (payload) => {
    // Si payload.new.idsap === authUser.idsap â†’ actualizar
  })
```

### ðŸ“± Responsive Design

| Breakpoint | Layout |
|-----------|--------|
| < 768px | Cards (mobile-first) |
| â‰¥ 768px | Tabla + componentes lado a lado |

### ðŸ“ Archivos relacionados

```
src/pages/paciente.js
src/components/CitaForm.js (modal)
src/components/ConsultaCita.js (detalle)
src/components/EstadoConsulta.js (status badge)
src/lib/citasData.js (CRUD)
src/styles/Paciente.module.css
```

### âš ï¸ Puntos crÃ­ticos

```javascript
// En paciente.js lÃ­nea ~30
const citaActiva = citas.find(c => 
  c.estado === "pendiente" || c.estado === "programado"
);

// âŒ RIESGO: Si hay 2 citas activas, solo muestra la primera
// âœ… MEJORA: Mostrar TODAS y let paciente choose, or mostrar mÃ¡s reciente
```

---

## 3. medico.js - Panel del MÃ©dico  

**Ruta:** `/medico`  
**Role requerido:** `medico`  
**PropÃ³sito:** Atender pacientes y completar consultas

### ðŸŽ¯ Secciones

#### A. Resumen (Card principal)
```
Buenos dÃ­as, Dr. Juan
Pacientes en espera: 5
Ãšltimas programadas: 3

[ðŸ”‡ Sirena activa] â† Indica audio enabled
```

#### B. Citas Activas (En espera + En consulta)
```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ PACIENTE: MarÃ­a GarcÃ­a    [EMERGENCIA]
â”‚ SAP: 12345678
â”‚ Turno: #3
â”‚ Motivo: Cefalea crÃ³nica
â”‚ Tiempo: 12 min
â”‚ [Atender] [Defer] [Finalizar]
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

**Estados:**
- ðŸ”´ En espera (vistoso)
- ðŸŸ  En consulta (actual)
- Emergencias destacadas color rojo

#### C. Ãšltimas Programadas (PrÃ³ximas 25)
```
Lista scrolleable de citas futuras
Ordenadas por fecha programada (ascendente)
```

### ðŸ”” Audio Feedback

```javascript
// Detecta transiciÃ³n: * â†’ "en espera" â†’ reproduce doorbell
// Archivo: /public/doorbell.mp3
// Volumen: 1.0

// Desbloquea en primer click/tecla (browser autoplay policy)
function desbloquearAudio() {
  const audio = new Audio("/doorbell.mp3");
  audio.volume = 0;
  audio.play().then(() => {
    audio.pause();
    audioDesbloqueado = true;  // âœ… Ahora funciona en Realtime
  });
}
```

### ðŸ”„ Realtime & Estados

**MÃ¡quina de estados:**
```
PENDIENTE
    â†“ (solo enfermerÃ­a)
EN ESPERA
    â†“ (mÃ©dico â†’ "Atender")
EN CONSULTA (timer comienza)
    â†“ (mÃ©dico â†’ "Finalizar")
ATENDIDO (calcula duraciÃ³n)
```

**Campos crÃ­ticos:**
- `estado`: controla visibilidad
- `doctor_name`: validar que no es null
- `check_in` / `check_out`: timestamps de duraciÃ³n
- `orden_llegada`: nÃºmero de turno

### ðŸ”´ Acciones del MÃ©dico

**1. Atender**
```javascript
await actualizarCita(id, {
  estado: "en consulta",
  doctor_name: currentDoctor  // â† Importante: quitar de propuesta si es null
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

### ðŸ“ Archivos relacionados

```
src/pages/medico.js
src/components/DoctorPanel.js (card de cita)
src/lib/citasData.js
src/styles/Doctor.module.css
public/doorbell.mp3
```

### âš ï¸ Puntos crÃ­ticos

```javascript
// En medico.js lÃ­nea ~85 (finalizar)
if (cita.estado !== "en consulta")
  throw new Error('Solo se pueden finalizar citas...')

// âŒ RIESGO: Error message exposed a usuario
// âœ… MEJORA: Log error server, mostrar genÃ©rico al user
```

---

## 4. enfermeria.js - GestiÃ³n Integral

**Ruta:** `/enfermeria`  
**Role requerido:** `enfermeria`  
**PropÃ³sito:** GestiÃ³n completa de flujo de citas

### ðŸŽ¯ Interfaz: Tabs

```
[PENDIENTES] [EN ESPERA] [PROGRAMADAS] [MÃ‰DICO ACTIVO]
```

#### A. Tab: PENDIENTES
Citas creadas pero NO registradas aÃºn
```
para cada cita pendiente:
  â”Œâ”€ Cita â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
  â”‚ Nombre: Juan GarcÃ­a    â”‚
  â”‚ SAP: 12345            â”‚
  â”‚ Motivo: Dolor cabeza  â”‚
  â”‚ Â¿Emergencia?: NO      â”‚
  â”‚ Llegada: 14:23        â”‚
  â”‚ [REGISTRAR] [CANCELAR]â”‚
  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

[+ Nueva cita] (abre modal)
```

**AcciÃ³n REGISTRAR:**
```javascript
await actualizarCita(id, {
  estado: "en espera",
  check_in: NOW(),
  orden_llegada: nextTurnoNumber  // â† Calcula turno
})
// â†’ Reproduces "nueva_cita.mp3"
// â†’ Cita aparece en turno.js
// â†’ MÃ©dico lo ve y escucha sonido
```

#### B. Tab: EN ESPERA
Citas en fila esperando mÃ©dico
```
para cada cita:
  [Paciente] [Motivo] [Min en espera] [MÃ©dico asignado]
  
  Acciones:
  [Programar] â†’ abre DateTimePicker
  [Finalizar] â†’ saltar fila (marca atendido)
  [Cancelar]
```

#### C. Tab: PROGRAMADAS
Citas futuras (calendario)
```
Vista tipo agenda
Click en cita â†’ editar fecha
Buscar por SAP/nombre
```

#### D. Tab: MÃ‰DICO ACTIVO
Monitor de quiÃ©n estÃ¡ atendiendo
```
Dr. Juan GarcÃ­a: EN CONSULTA (desde 12 min)
Paciente: MarÃ­a GarcÃ­a
Motivo: RevisiÃ³n
[Ver detalle] [Finalizar]
```

### ðŸ”” Audio

```javascript
// Nueva cita ingresa â†’ reproduce /nueva_cita.mp3
// Archivo: /public/nueva_cita.mp3
// Volumen: 1.0
```

### ðŸ”„ Realtime

Escucha todos los cambios en tabla `citas`:
```javascript
.on("postgres_changes", { event: "*", table: "citas" }, async (payload) => {
  // Re-cargar todos los tabs
  await load()  // Recalc pendientes, en_espera, programadas
})
```

### ðŸ“ Archivos relacionados

```
src/pages/enfermeria.js
src/components/CitaForm.js (nueva cita modal)
src/components/FechaHoraInput.js (date picker)
src/components/MedicoActivo.js (monitor)
src/lib/citasData.js
src/styles/Enfermeria.module.css
public/nueva_cita.mp3
```

### âš ï¸ Puntos crÃ­ticos

```javascript
// En enfermeria.js: Manual orden_llegada
// âŒ RIESGO: Si 2 requests simultÃ¡neos, same turno number
// âœ… MEJORA: Calcular en BD con sequence o trigger
```

---

## 5. supervisor.js - Monitor de EstadÃ­sticas

**Ruta:** `/supervisor`  
**Role requerido:** `supervisor`  
**PropÃ³sito:** Dashboard de mÃ©tricas y flujo

### ðŸŽ¯ MÃ©tricas Mostradas

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ CITAS PROGRAMADAS    â”‚ 12
â”‚ EN CONSULTA (HOY)    â”‚ 3
â”‚ ATENDIDAS (HOY)      â”‚ 45
â”‚ TIEMPO PROMEDIO      â”‚ 18 min
â”‚ CUPOS DISPONIBLES    â”‚ 8
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

#### CÃ¡lculos

**Tiempo promedio:**
```javascript
const tiempoPromedio = totalDuracion / totalAtendidas
// duracion = check_out - check_in

// âŒ RIESGO: Si no hay check_out, calcula mal
// âœ… MEJORA: WHERE check_out IS NOT NULL
```

**Cupos:**
```javascript
const cupos = COUNT(estado IN ('programado', 'en espera'))
// Rango: HOY (desde 00:00 a 23:59)
```

### ðŸ”„ Realtime

Actualiza cada 5-10 segundos automÃ¡ticamente (no manual refresh)

### ðŸ“ Archivos relacionados

```
src/pages/supervisor.js
src/styles/Supervisor.module.css
src/components/EstadoConsulta.js
```

### âš ï¸ Puntos crÃ­ticos

```javascript
// En supervisor.js lÃ­nea ~120 (antes era bug)
const fetchCupos = useCallback(async () => {
  const { ini, fin } = hoyRango();
  const { data } = await supabase
    .from("citas").select("estado")
    .in("estado", ["programado", "en espera"])
    .gte("programmer_at", ini).lte("programmer_at", fin)
  
  // âœ… CORREGIDO: Ahora usa datos recientes
  // âŒ ANTES: setCuposProgramados(cuposProgramados) [infinite loop]
})
```

---

## 6. turno.js - Pantalla PÃºblica de Turnos

**Ruta:** `/turno`  
**Roles autorizados:** `enfermeria`, `admin` (principalmente)  
**PropÃ³sito:** Pantalla de TV mostrando prÃ³ximos pacientes

### ðŸŽ¯ Layout

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ PACIENTES EN ESPERA                         â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚ â”‚ #2 - JUAN GARCÃA               EN ESPERA â”‚â”‚
â”‚ â”‚ Motivo: RevisiÃ³n / SAP: 12345           â”‚â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â”‚ â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”â”‚
â”‚ â”‚ #4 - MARÃA LÃ“PEZ         [EMERGENCIA]   â”‚â”‚
â”‚ â”‚ Motivo: Dolor / SAP: 54321              â”‚â”‚
â”‚ â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚ AHORA ATENDIENDO:                           â”‚
â”‚ Consultorio A: DR. JUAN GARCÃA              â”‚
â”‚ Paciente: CARLOS SUÃREZ                     â”‚
â”‚ Tiempo: 12 minutos                          â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

### ðŸŽ¨ DiseÃ±o

- **Sidebar izquierdo:** Fila de espera (scrolleable)
- **Panel derecho:** Ahora atendiendo (grande)
- **Colors:**
  - Gris: En espera normal
  - Rojo: Emergencia
  - Naranja: En consulta
- **Font:** Grande y legible (TV screen)

### ðŸ”„ Realtime

```javascript
.on("postgres_changes", { event: "*", table: "citas" }, (payload) => {
  // Filtra solo: estado IN ("en espera", "en consulta")
  // Ordena por orden_llegada (turno)
})
```

### ðŸ“ Archivos relacionados

```
src/pages/turno.js
src/components/TurnoDisplay.js
src/styles/Turno.module.css
```

---

## 7. _app.js - Wrapper Global

**Ruta:** No es ruta (envuelve todas)  
**PropÃ³sito:** Inicializar Auth, Layout, estilos globales

### ðŸŽ¯ Estructura

```javascript
<AuthProvider>           // â† Auth en contexto global
  <Head>                // â† Meta tags, favicon
  <AuthGate>            // â† Control de acceso
    <Layout>            // â† NavegaciÃ³n lateral, headers
      <Component />     // â† PÃ¡gina actual
    </Layout>
  </AuthGate>
</AuthProvider>
```

### ðŸ“‹ ConfiguraciÃ³n

```javascript
// Meta tags set aquÃ­
<title>Medylink</title>
<meta name="theme-color" content="#3f91e8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
```

### ðŸ“ Archivos relacionados

```
src/pages/_app.js
src/context/AuthContext.js
src/components/AuthGate.js
src/components/Layout.jsx
src/styles/globals.css
```

---

## ðŸ—ºï¸ Mapa de NavegaciÃ³n (Rutas)

```
/ (index.js)
  â”œâ”€ Sin auth
  â”‚   â”œâ”€ LOGIN
  â”‚   â””â”€ REGISTER
  â””â”€ Con auth â†’ Redirige segÃºn role

/paciente â†’ role: paciente
/medico â†’ role: medico
/enfermeria â†’ role: enfermeria
/supervisor â†’ role: supervisor
/turno â†’ role: enfermeria|admin
/admin/control â†’ role: admin
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

// Si usuario accede a ruta no permitida â†’ muestra NoAuth alert
```

---

## ðŸš€ Flujo de SesiÃ³n Completo

```
Usuario en navegador
  â†“
Carga index.js (/) â†’ AuthGate verifica session
  â†“
SI session existe â†’ redirige a ruta del role
  SI role=paciente â†“ /paciente
  SI role=medico â†“ /medico
  etc.
  â†“
SI NO session â†’ muestra login/register en index.js
  â†“
Usuario registra (nuevo SAP) o login
  â†“
context.login() obtiene role
  â†“
router.push() redirige automÃ¡ticamente
  â†“
AuthGate permite acceso + renderiza Layout
```

---

## ðŸ“Š Resumen de CaracterÃ­sticas por PÃ¡gina

| PÃ¡gina | Realtime | Audio | CRUD | Forms | Charts |
|--------|----------|-------|------|-------|--------|
| index.js | âŒ | âŒ | Read | âœ… | âŒ |
| paciente.js | âœ… | âŒ | CRUD | âœ… | âŒ |
| medico.js | âœ… | âœ… | Update | âŒ | âŒ |
| enfermeria.js | âœ… | âœ… | CRUD | âœ… | âŒ |
| supervisor.js | âœ… | âŒ | Read | âŒ | âœ… |
| turno.js | âœ… | âŒ | Read | âŒ | âŒ |
| admin/control | âœ… | âŒ | CRUD | âœ… | âœ… |

---

**Ãšltima actualizaciÃ³n:** 2026-03-12  
**Ãšltima revisiÃ³n:** Code review completo

