# 🏗️ Arquitectura del Sistema - Control Médico MedyLink

**Versión:** 0.2.0  
**Stack:** Next.js 16.1.6 + React 19.2.4 + Supabase (PostgreSQL)  
**Última actualización:** 2026-03-12

---

## 📋 Índice
1. [Descripción General](#descripción-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Flujo de Autenticación](#flujo-de-autenticación)
5. [Modelos de Datos](#modelos-de-datos)
6. [Flujos Principales](#flujos-principales)
7. [Análisis de Código](#análisis-de-código)

---

## 🎯 Descripción General

**MedyLink** es un sistema integral de gestión médica diseñado para facilitar:
- **Gestión de citas médicas** en tiempo real
- **Control de turnos** y asignación de pacientes
- **Interfaz diferenciada** por rol de usuario (Paciente, Médico, Enfermería, Supervisor, Admin)
- **Comunicación en tiempo real** mediante WebSockets (Supabase Realtime)
- **Integración con bases de datos de empleados** (tabla `allowed_users`)

**Públicos objetivo:**
- Pacientes: Solicitar y consultar citas
- Enfermería: Registrar entrada de pacientes y crear citas
- Médicos: Atender pacientes en consulta
- Supervisores: Monitorear flujo y estadísticas
- Administradores: Gestión global y importación de datos

---

## 🔧 Stack Tecnológico

### Frontend
- **Next.js 16.1.6**: Framework React con SSR/SSG
- **React 19.2.4**: Librería UI con hooks
- **React Icons 5.5.0**: Iconografía Material Design
- **React Modal 3.16.3**: Modales accesibles
- **React Tabs 6.1.0**: Componentes tabulares
- **CSS Modules**: Estilos con scope local

### Backend / Infraestructura
- **Supabase**: Backend as a Service (PostgreSQL + Auth)
  - PostgreSQL para persistencia
  - Supabase Auth para autenticación
  - Realtime (WebSockets) para actualizaciones en vivo
  - API REST JSON automática

### Build & Dev
- **ESLint 9**: Linting de código
- **Node.js**: Runtime
- **npm**: Gestor de paquetes

### Librerías auxiliares
- **PapaParse 5.5.2**: Parseo de CSV (import de datos)
- **UUID 11.1.0**: Generación de IDs únicos
- **Next.js Image**: Optimización de imágenes

---

## 📁 Estructura del Proyecto

```
control_medico/
├── src/
│   ├── pages/              # Rutas/vistas principales del app
│   │   ├── _app.js         # Wrapper global (Auth + Layout)
│   │   ├── index.js        # Página de login/registro
│   │   ├── paciente.js     # Vista del paciente
│   │   ├── medico.js       # Panel del médico
│   │   ├── enfermeria.js   # Gestión de entrada/citas
│   │   ├── supervisor.js   # Monitor de estadísticas
│   │   ├── turno.js        # Pantalla pública de turnos
│   │   ├── admin/
│   │   │   └── control.js  # Panel administrativo
│   │   └── api/            # Endpoints backend
│   │
│   ├── components/         # Componentes React reutilizables
│   │   ├── Layout.jsx      # Navegación + estructura principal
│   │   ├── AuthGate.js     # Control de acceso por rol
│   │   ├── CitaForm.js     # Formulario crear/editar citas
│   │   ├── DoctorPanel.js  # Panel de atención médica
│   │   ├── ConsultaCita.js # Detalle de cita
│   │   └── admin/          # Componentes admin
│   │
│   ├── context/            # React Context API
│   │   └── AuthContext.js  # Estado global de autenticación
│   │
│   ├── lib/                # Utilidades y APIs
│   │   ├── supabase.js     # Cliente Supabase (público)
│   │   ├── supabaseAdmin.js# Cliente Supabase (admin)
│   │   ├── citasData.js    # CRUD de citas
│   │   └── notify.js       # Notificaciones
│   │
│   └── styles/             # CSS Modules por página
│       ├── globals.css     # Estilos globales
│       ├── Paciente.module.css
│       ├── Doctor.module.css
│       └── ...
│
├── public/                 # Assets estáticos
│   ├── icons/
│   └── *.mp3              # Archivos de audio (estímulos)
│
├── package.json
├── next.config.mjs
├── eslint.config.mjs
└── jsconfig.json

```

---

## 🔐 Flujo de Autenticación

### 1️⃣ Signup (Registro)
```
Usuario intenta registrarse
    ↓
Valida SAP (debe ser 8+ dígitos)
    ↓
Valida que no existe usuario con ese SAP
    ↓
Crea auth.user en Supabase Auth (email: SAP@yazaki.com)
    ↓
Inserta en tabla app_users con role="paciente", status=false
    ↓
Verifica si SAP está en allowed_users
    ├─ Sí → Actualiza status=true (usuario activo)
    └─ No → status=false (requiere aprobación)
```

### 2️⃣ Login
```
Usuario ingresa SAP + contraseña
    ↓
Supabase Auth valida y retorna session
    ↓
AuthContext.login() fetchea datos de tabla app_users
    ↓
Verifica status = true
    ├─ Sí → Autentica y redirecciona según role
    └─ No → Logout y lanza error "Usuario inactivo"
        ↓
    Retorna { role, userName } para routing
```

### 3️⃣ Session Persistence
- **Storage:** `localStorage` (lado cliente)
- **Auto-refresh:** Token se renueva automáticamente
- **SSR-safe:** Detecta window antes de acceder a localStorage
- **Listener:** `onAuthStateChange` sincroniza logout en tabs

---

## 📊 Modelos de Datos (Tablas Supabase)

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
check_in           timestamp (cuando entró a esperar)
check_out          timestamp (cuando finalizó)
cita_programada    timestamp (datetime de programación)
programmer_at      timestamp
emergency          boolean (urgencia)
isss               boolean (consulta ISSS)
doctor_name        text (médico asignado)
orden_llegada      integer (número de turno)
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

## 🔄 Flujos Principales

### A) Creación de Cita (Paciente/Enfermería)

**Participantes:** Paciente, Enfermería, Sistema

**Flujo:**
```
1. Paciente abre modal en /paciente o Enfermería en /enfermeria
2. Completa: Nombre (auto), Motivo, ¿Emergencia?, ¿ISSS?
3. Valida que SAP existe en allowed_users
4. INSERT en tabla citas → estado="pendiente"
5. Supabase Realtime notifica a enfermería
6. Supabase Realtime notifica al paciente (modal se cierra)
```

**Duración esperada:** 2-3 segundos

---

### B) Flujo de Atención (Enfermería → Médico → Fin)

**Participantes:** Paciente, Enfermería, Médico

**Estados y transiciones:**
```
PENDIENTE (cita nueva)
    ↓ [Enfermería presiona "Check-in"]
EN ESPERA (paciente espera, aparece en turno.js)
    ↓ [Médico presiona "Atender"]
EN CONSULTA (en la sala, tiempo se mide)
    ↓ [Médico presiona "Finalizar"]
ATENDIDO (cita completada)
    └─ Timestamps: check_in + check_out = duración consulta
```

**Triggers de audio:**
- Cuando cita pasa a "en espera" → doorbell.mp3 (médico)
- Cuando cita creada → nueva_cita.mp3 (enfermería)

---

### C) Flujo de Supervisión (Supervisor)

**Datos que ve:**
- Citas **programadas** (futuro)
- Citas **en consulta** (hoy)
- Citas **atendidas** (hoy)
- Estadísticas: tiempo promedio, cupos disponibles

**Cálculos:**
- Duración = check_out - check_in
- Promedio = suma(duraciones) / total_atendidas
- Cupos = COUNT(estado=['programado','en espera'])

---

## 🔍 Análisis de Código

### Patrones Utilizados

#### 1. **Context API para Estado Global**
```javascript
// AuthContext.js
// Centraliza: user, userName, role, idsap, status
// Métodos: login(), logout(), fetchUserData()
```
✅ **Ventaja:** Evita prop drilling  
⚠️ **Consideración:** No escala bien si hay muchos contextos

#### 2. **Custom Hooks con useCallback + useRef**
```javascript
// En medico.js: citasConocidasRef.current
// Detecta citas genuinamente nuevas sin stale closure
```
✅ **Ventaja:** Evita múltiples notificaciones de audio  
⚠️ **Riesgo:** useRef NO causa re-render (puede ser confuso)

#### 3. **Supabase Realtime Subscriptions**
```javascript
supabase.channel("realtime-citas-*")
  .on("postgres_changes", { ... }, handler)
  .subscribe()
```
✅ **Ventaja:** Actualizaciones en tiempo real  
⚠️ **Riesgo:** Canales sin cleanup = memory leaks

#### 4. **Debounce en búsquedas**
```javascript
// CitaForm.js: setTimeout(buscarNombre, 500)
```
✅ **Ventaja:** Reduce queries a BD  
⚠️ **Mejora:** Usar una librería como lodash debounce

#### 5. **CSS Modules para encapsulación**
```javascript
import styles from '@/styles/Paciente.module.css'
// Evita conflictos de clases globales
```
✅ **Ventaja:** Scope local, sin colisiones  
✅ **Ventaja:** DevTools muestran nombres únicos

---

### Fortalezas del Código

1. **Separación de responsabilidades**
   - Páginas manejan lógica de negocio
   - Componentes reutilizables (CitaForm, ConsultaCita)
   - Librería `citasData.js` centraliza CRUD

2. **Manejo de realtime**
   - Listeners en useEffect con cleanup
   - Evita loops infinitos con validaciones

3. **UX responsiva**
   - Indicadores de carga (buscando, loading)
   - Mensajes de error/éxito
   - Audio feedback

4. **Control de acceso**
   - AuthGate valida rutas por rol
   - CitaForm comportamiento diferente según role

---

### Áreas de Mejora

1. **🔐 Validaciones Server-side**
   - Actualmente: mayoría client-side
   - Riesgo: usuario malicioso puede manipular requests

2. **⚡ Performance**
   - No hay lazy loading de componentes
   - Sessions pueden crecer sin límite

3. **🧪 Testing**
   - Sin tests unitarios
   - Sin tests de integración

4. **📝 Documentación inline**
   - Algunos componentes carecen de JSDoc
   - Estructura de datos no documentada

5. **🛡️ Error handling**
   - Muchos `.catch()` genéricos
   - Algunos errores no se propagan

6. **♿ Accesibilidad**
   - Falta ARIA labels en algunos inputs
   - Colores contrastantes OK pero podría mejorarse

---

## 📈 Escalabilidad

**Actual:**
- ~50-100 usuarios simultáneos (estimado)
- Single Next.js instance
- Supabase Free/Pro tier

**Cuello de botella:**
- Realtime subscriptions (límite Supabase)
- Query N+1 en historial de citas
- Sem caché de usuarios permitidos

**Mejoras sugeridas:**
1. Agregar pagination a historial
2. Cachear `allowed_users` en memoria
3. Índices en `citas.idsap`, `citas.estado`
4. SWR/TanStack Query para manejo de estado

---

## 🚀 Próximos Pasos Recomendados

1. **Seguridad:** Implementar RLS (Row Level Security) en Supabase
2. **Testing:** Agregar Jest + Testing Library
3. **Monitoring:** Setup Sentry para errores
4. **Docs:** Generar OpenAPI de endpoints
5. **Performance:** Analizar Lighthouse (Next.js Analytics)

---

**Última revisión:** Marzo 2026  
**Estado:** En desarrollo activo
