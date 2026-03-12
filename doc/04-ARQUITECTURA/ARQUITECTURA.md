# ðŸ—ï¸ Arquitectura del Sistema - Control MÃ©dico MedyLink

**VersiÃ³n:** 0.2.0  
**Stack:** Next.js 16.1.6 + React 19.2.4 + Supabase (PostgreSQL)  
**Ãšltima actualizaciÃ³n:** 2026-03-12

---

## ðŸ“‹ Ãndice
1. [DescripciÃ³n General](#descripciÃ³n-general)
2. [Stack TecnolÃ³gico](#stack-tecnolÃ³gico)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Flujo de AutenticaciÃ³n](#flujo-de-autenticaciÃ³n)
5. [Modelos de Datos](#modelos-de-datos)
6. [Flujos Principales](#flujos-principales)
7. [AnÃ¡lisis de CÃ³digo](#anÃ¡lisis-de-cÃ³digo)

---

## ðŸŽ¯ DescripciÃ³n General

**MedyLink** es un sistema integral de gestiÃ³n mÃ©dica diseÃ±ado para facilitar:
- **GestiÃ³n de citas mÃ©dicas** en tiempo real
- **Control de turnos** y asignaciÃ³n de pacientes
- **Interfaz diferenciada** por rol de usuario (Paciente, MÃ©dico, EnfermerÃ­a, Supervisor, Admin)
- **ComunicaciÃ³n en tiempo real** mediante WebSockets (Supabase Realtime)
- **IntegraciÃ³n con bases de datos de empleados** (tabla `allowed_users`)

**PÃºblicos objetivo:**
- Pacientes: Solicitar y consultar citas
- EnfermerÃ­a: Registrar entrada de pacientes y crear citas
- MÃ©dicos: Atender pacientes en consulta
- Supervisores: Monitorear flujo y estadÃ­sticas
- Administradores: GestiÃ³n global y importaciÃ³n de datos

---

## ðŸ”§ Stack TecnolÃ³gico

### Frontend
- **Next.js 16.1.6**: Framework React con SSR/SSG
- **React 19.2.4**: LibrerÃ­a UI con hooks
- **React Icons 5.5.0**: IconografÃ­a Material Design
- **React Modal 3.16.3**: Modales accesibles
- **React Tabs 6.1.0**: Componentes tabulares
- **CSS Modules**: Estilos con scope local

### Backend / Infraestructura
- **Supabase**: Backend as a Service (PostgreSQL + Auth)
  - PostgreSQL para persistencia
  - Supabase Auth para autenticaciÃ³n
  - Realtime (WebSockets) para actualizaciones en vivo
  - API REST JSON automÃ¡tica

### Build & Dev
- **ESLint 9**: Linting de cÃ³digo
- **Node.js**: Runtime
- **npm**: Gestor de paquetes

### LibrerÃ­as auxiliares
- **PapaParse 5.5.2**: Parseo de CSV (import de datos)
- **UUID 11.1.0**: GeneraciÃ³n de IDs Ãºnicos
- **Next.js Image**: OptimizaciÃ³n de imÃ¡genes

---

## ðŸ“ Estructura del Proyecto

```
control_medico/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ pages/              # Rutas/vistas principales del app
â”‚   â”‚   â”œâ”€â”€ _app.js         # Wrapper global (Auth + Layout)
â”‚   â”‚   â”œâ”€â”€ index.js        # PÃ¡gina de login/registro
â”‚   â”‚   â”œâ”€â”€ paciente.js     # Vista del paciente
â”‚   â”‚   â”œâ”€â”€ medico.js       # Panel del mÃ©dico
â”‚   â”‚   â”œâ”€â”€ enfermeria.js   # GestiÃ³n de entrada/citas
â”‚   â”‚   â”œâ”€â”€ supervisor.js   # Monitor de estadÃ­sticas
â”‚   â”‚   â”œâ”€â”€ turno.js        # Pantalla pÃºblica de turnos
â”‚   â”‚   â”œâ”€â”€ admin/
â”‚   â”‚   â”‚   â””â”€â”€ control.js  # Panel administrativo
â”‚   â”‚   â””â”€â”€ api/            # Endpoints backend
â”‚   â”‚
â”‚   â”œâ”€â”€ components/         # Componentes React reutilizables
â”‚   â”‚   â”œâ”€â”€ Layout.jsx      # NavegaciÃ³n + estructura principal
â”‚   â”‚   â”œâ”€â”€ AuthGate.js     # Control de acceso por rol
â”‚   â”‚   â”œâ”€â”€ CitaForm.js     # Formulario crear/editar citas
â”‚   â”‚   â”œâ”€â”€ DoctorPanel.js  # Panel de atenciÃ³n mÃ©dica
â”‚   â”‚   â”œâ”€â”€ ConsultaCita.js # Detalle de cita
â”‚   â”‚   â””â”€â”€ admin/          # Componentes admin
â”‚   â”‚
â”‚   â”œâ”€â”€ context/            # React Context API
â”‚   â”‚   â””â”€â”€ AuthContext.js  # Estado global de autenticaciÃ³n
â”‚   â”‚
â”‚   â”œâ”€â”€ lib/                # Utilidades y APIs
â”‚   â”‚   â”œâ”€â”€ supabase.js     # Cliente Supabase (pÃºblico)
â”‚   â”‚   â”œâ”€â”€ supabaseAdmin.js# Cliente Supabase (admin)
â”‚   â”‚   â”œâ”€â”€ citasData.js    # CRUD de citas
â”‚   â”‚   â””â”€â”€ notify.js       # Notificaciones
â”‚   â”‚
â”‚   â””â”€â”€ styles/             # CSS Modules por pÃ¡gina
â”‚       â”œâ”€â”€ globals.css     # Estilos globales
â”‚       â”œâ”€â”€ Paciente.module.css
â”‚       â”œâ”€â”€ Doctor.module.css
â”‚       â””â”€â”€ ...
â”‚
â”œâ”€â”€ public/                 # Assets estÃ¡ticos
â”‚   â”œâ”€â”€ icons/
â”‚   â””â”€â”€ *.mp3              # Archivos de audio (estÃ­mulos)
â”‚
â”œâ”€â”€ package.json
â”œâ”€â”€ next.config.mjs
â”œâ”€â”€ eslint.config.mjs
â””â”€â”€ jsconfig.json

```

---

## ðŸ” Flujo de AutenticaciÃ³n

### 1ï¸âƒ£ Signup (Registro)
```
Usuario intenta registrarse
    â†“
Valida SAP (debe ser 8+ dÃ­gitos)
    â†“
Valida que no existe usuario con ese SAP
    â†“
Crea auth.user en Supabase Auth (email: SAP@yazaki.com)
    â†“
Inserta en tabla app_users con role="paciente", status=false
    â†“
Verifica si SAP estÃ¡ en allowed_users
    â”œâ”€ SÃ­ â†’ Actualiza status=true (usuario activo)
    â””â”€ No â†’ status=false (requiere aprobaciÃ³n)
```

### 2ï¸âƒ£ Login
```
Usuario ingresa SAP + contraseÃ±a
    â†“
Supabase Auth valida y retorna session
    â†“
AuthContext.login() fetchea datos de tabla app_users
    â†“
Verifica status = true
    â”œâ”€ SÃ­ â†’ Autentica y redirecciona segÃºn role
    â””â”€ No â†’ Logout y lanza error "Usuario inactivo"
        â†“
    Retorna { role, userName } para routing
```

### 3ï¸âƒ£ Session Persistence
- **Storage:** `localStorage` (lado cliente)
- **Auto-refresh:** Token se renueva automÃ¡ticamente
- **SSR-safe:** Detecta window antes de acceder a localStorage
- **Listener:** `onAuthStateChange` sincroniza logout en tabs

---

## ðŸ“Š Modelos de Datos (Tablas Supabase)

### Tabla: `app_users`
```sql
id          uuid PRIMARY KEY (auth.users.id)
idsap       text UNIQUE NOT NULL
role        text (paciente|enfermeria|medico|supervisor|admin)
status      boolean (activo/inactivo)
telegram_id integer (opcional, para notificaciones)
created_at  timestamp
```

### Tabla: `citas`
```sql
id                  uuid PRIMARY KEY
idsap              integer NOT NULL
nombre             text
motivo             text
estado             text (pendiente|programado|en espera|en consulta|atendido|cancelado)
check_in           timestamp (cuando entrÃ³ a esperar)
check_out          timestamp (cuando finalizÃ³)
cita_programada    timestamp (datetime de programaciÃ³n)
programmer_at      timestamp
emergency          boolean (urgencia)
isss               boolean (consulta ISSS)
doctor_name        text (mÃ©dico asignado)
orden_llegada      integer (nÃºmero de turno)
created_at         timestamp
updated_at         timestamp
```

### Tabla: `allowed_users`
```sql
idsap   text PRIMARY KEY
nombre  text
email   text (opcional)
role    text (opcional)
```

---

## ðŸ”„ Flujos Principales

### A) CreaciÃ³n de Cita (Paciente/EnfermerÃ­a)

**Participantes:** Paciente, EnfermerÃ­a, Sistema

**Flujo:**
```
1. Paciente abre modal en /paciente o EnfermerÃ­a en /enfermeria
2. Completa: Nombre (auto), Motivo, Â¿Emergencia?, Â¿ISSS?
3. Valida que SAP existe en allowed_users
4. INSERT en tabla citas â†’ estado="pendiente"
5. Supabase Realtime notifica a enfermerÃ­a
6. Supabase Realtime notifica al paciente (modal se cierra)
```

**DuraciÃ³n esperada:** 2-3 segundos

---

### B) Flujo de AtenciÃ³n (EnfermerÃ­a â†’ MÃ©dico â†’ Fin)

**Participantes:** Paciente, EnfermerÃ­a, MÃ©dico

**Estados y transiciones:**
```
PENDIENTE (cita nueva)
    â†“ [EnfermerÃ­a presiona "Check-in"]
EN ESPERA (paciente espera, aparece en turno.js)
    â†“ [MÃ©dico presiona "Atender"]
EN CONSULTA (en la sala, tiempo se mide)
    â†“ [MÃ©dico presiona "Finalizar"]
ATENDIDO (cita completada)
    â””â”€ Timestamps: check_in + check_out = duraciÃ³n consulta
```

**Triggers de audio:**
- Cuando cita pasa a "en espera" â†’ doorbell.mp3 (mÃ©dico)
- Cuando cita creada â†’ nueva_cita.mp3 (enfermerÃ­a)

---

### C) Flujo de SupervisiÃ³n (Supervisor)

**Datos que ve:**
- Citas **programadas** (futuro)
- Citas **en consulta** (hoy)
- Citas **atendidas** (hoy)
- EstadÃ­sticas: tiempo promedio, cupos disponibles

**CÃ¡lculos:**
- DuraciÃ³n = check_out - check_in
- Promedio = suma(duraciones) / total_atendidas
- Cupos = COUNT(estado=['programado','en espera'])

---

## ðŸ” AnÃ¡lisis de CÃ³digo

### Patrones Utilizados

#### 1. **Context API para Estado Global**
```javascript
// AuthContext.js
// Centraliza: user, userName, role, idsap, status
// MÃ©todos: login(), logout(), fetchUserData()
```
âœ… **Ventaja:** Evita prop drilling  
âš ï¸ **ConsideraciÃ³n:** No escala bien si hay muchos contextos

#### 2. **Custom Hooks con useCallback + useRef**
```javascript
// En medico.js: citasConocidasRef.current
// Detecta citas genuinamente nuevas sin stale closure
```
âœ… **Ventaja:** Evita mÃºltiples notificaciones de audio  
âš ï¸ **Riesgo:** useRef NO causa re-render (puede ser confuso)

#### 3. **Supabase Realtime Subscriptions**
```javascript
supabase.channel("realtime-citas-*")
  .on("postgres_changes", { ... }, handler)
  .subscribe()
```
âœ… **Ventaja:** Actualizaciones en tiempo real  
âš ï¸ **Riesgo:** Canales sin cleanup = memory leaks

#### 4. **Debounce en bÃºsquedas**
```javascript
// CitaForm.js: setTimeout(buscarNombre, 500)
```
âœ… **Ventaja:** Reduce queries a BD  
âš ï¸ **Mejora:** Usar una librerÃ­a como lodash debounce

#### 5. **CSS Modules para encapsulaciÃ³n**
```javascript
import styles from '@/styles/Paciente.module.css'
// Evita conflictos de clases globales
```
âœ… **Ventaja:** Scope local, sin colisiones  
âœ… **Ventaja:** DevTools muestran nombres Ãºnicos

---

### Fortalezas del CÃ³digo

1. **SeparaciÃ³n de responsabilidades**
   - PÃ¡ginas manejan lÃ³gica de negocio
   - Componentes reutilizables (CitaForm, ConsultaCita)
   - LibrerÃ­a `citasData.js` centraliza CRUD

2. **Manejo de realtime**
   - Listeners en useEffect con cleanup
   - Evita loops infinitos con validaciones

3. **UX responsiva**
   - Indicadores de carga (buscando, loading)
   - Mensajes de error/Ã©xito
   - Audio feedback

4. **Control de acceso**
   - AuthGate valida rutas por rol
   - CitaForm comportamiento diferente segÃºn role

---

### Ãreas de Mejora

1. **ðŸ” Validaciones Server-side**
   - Actualmente: mayorÃ­a client-side
   - Riesgo: usuario malicioso puede manipular requests

2. **âš¡ Performance**
   - No hay lazy loading de componentes
   - Sessions pueden crecer sin lÃ­mite

3. **ðŸ§ª Testing**
   - Sin tests unitarios
   - Sin tests de integraciÃ³n

4. **ðŸ“ DocumentaciÃ³n inline**
   - Algunos componentes carecen de JSDoc
   - Estructura de datos no documentada

5. **ðŸ›¡ï¸ Error handling**
   - Muchos `.catch()` genÃ©ricos
   - Algunos errores no se propagan

6. **â™¿ Accesibilidad**
   - Falta ARIA labels en algunos inputs
   - Colores contrastantes OK pero podrÃ­a mejorarse

---

## ðŸ“ˆ Escalabilidad

**Actual:**
- ~50-100 usuarios simultÃ¡neos (estimado)
- Single Next.js instance
- Supabase Free/Pro tier

**Cuello de botella:**
- Realtime subscriptions (lÃ­mite Supabase)
- Query N+1 en historial de citas
- Sem cachÃ© de usuarios permitidos

**Mejoras sugeridas:**
1. Agregar pagination a historial
2. Cachear `allowed_users` en memoria
3. Ãndices en `citas.idsap`, `citas.estado`
4. SWR/TanStack Query para manejo de estado

---

## ðŸš€ PrÃ³ximos Pasos Recomendados

1. **Seguridad:** Implementar RLS (Row Level Security) en Supabase
2. **Testing:** Agregar Jest + Testing Library
3. **Monitoring:** Setup Sentry para errores
4. **Docs:** Generar OpenAPI de endpoints
5. **Performance:** Analizar Lighthouse (Next.js Analytics)

---

**Ãšltima revisiÃ³n:** Marzo 2026  
**Estado:** En desarrollo activo

