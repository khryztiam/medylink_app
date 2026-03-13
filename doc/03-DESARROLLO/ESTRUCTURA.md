# 📂 ESTRUCTURA DEL CÓDIGO - Guía Visual

**Para:** Desarrolladores nuevos que quieren entender dónde está cada cosa  
**Última actualización:** 2026-03-12

---

## 🌳 Árbol Completo Comentado

```
control_medico/
│
├── 📄 DOCUMENTACIÓN (Lee primero)
│   ├── README.md              ← Punto de entrada (10 min)
│   ├── ÍNDICE.md              ← Mapa de documentos (5 min)
│   ├── RESUMEN.md             ← Resumen ejecutivo (5 min)
│   ├── ARQUITECTURA.md         ← Análisis técnico (45 min)
│   ├── SEGURIDAD.md            ← Auditoría de seguridad (45 min)
│   ├── PAGES.md                ← Guía de vistas (45 min)
│   ├── COMPONENTES.md          ← Referencia componentes (45 min)
│   └── SETUP.md                ← Guía de desarrollo (90 min)
│
├── 🔧 CONFIGURACIÓN
│   ├── package.json            ← Dependencias y scripts
│   ├── next.config.mjs         ← Configuración Next.js
│   ├── jsconfig.json           ← Alias de imports (@/)
│   ├── eslint.config.mjs       ← Linting rules
│   ├── .env.local              ← Variables (NO commitear)
│   ├── .env.example            ← Template de .env
│   ├── .gitignore              ← Archivos ignorados en git
│   └── .gitattributes          ← Atributos git
│
├── 📄 src/ (CÓDIGO PRINCIPAL)
│   │
│   ├── 📄 pages/ (RUTAS Y VISTAS)
│   │   ├── index.js            ← LOGIN/REGISTRO (public)
│   │   │                        Flujo: SAP + password → crear cuenta o login
│   │   │
│   │   ├── paciente.js         ← PORTAL PACIENTE (role: paciente)
│   │   │                        Flujo: Ver citas, crear nuevas, historial
│   │   │                        Componentes: CitaForm, ConsultaCita, EstadoConsulta
│   │   │
│   │   ├── medico.js           ← PANEL MÉDICO (role: medico)
│   │   │                        Flujo: Atender citas, finalizar consulta
│   │   │                        Audio: Doorbell cuando cita en espera
│   │   │
│   │   ├── enfermeria.js       ← GESTIÓN ENFERMERÍA (role: enfermeria)
│   │   │                        Flujo: Registrar entrada, programar, asignar
│   │   │                        Tabs: Pendientes, En Espera, Programadas, Médico Activo
│   │   │                        Audio: Nueva cita notification
│   │   │
│   │   ├── supervisor.js       ← DASHBOARD SUPERVISOR (role: supervisor)
│   │   │                        Flujo: Ver estadísticas (tiempos, cupos, eficiencia)
│   │   │                        No tiene actions, solo display
│   │   │
│   │   ├── turno.js            ← PANTALLA PÚBLICA (TV Display)
│   │   │                        Flujo: Mostrar próximos pacientes (grande, legible)
│   │   │                        Sidebar: Fila de espera
│   │   │                        Main: Ahora atendiendo
│   │   │
│   │   ├── _app.js             ← WRAPPER GLOBAL
│   │   │                        Estructura: <AuthProvider><AuthGate><Layout><Page/></Layout></AuthGate></AuthProvider>
│   │   │                        Aquí se configura: Head, meta tags, provider global
│   │   │
│   │   ├── _document.js        ← HTML base (Next.js)
│   │   │                        Si existe, define <html><body> structure
│   │   │
│   │   ├── 404.js              ← Página no encontrada
│   │   ├── 500.js              ← Error server
│   │   │
│   │   └── api/ (ENDPOINTS BACKEND)
│   │       ├── telegram-webhook.js    ← Webhook de Telegram (recibirNotificaciones)
│   │       │                          Format: POST /api/telegram-webhook
│   │       │                          Body: { message, user_id }
│   │       │
│   │       └── admin/
│   │           ├── importarAllowed.js ← Importar usuarios desde CSV
│   │           │                       Format: POST /api/admin/importarAllowed
│   │           │                       Body: FormData con file CSV
│   │           │
│   │           └── users/
│   │               ├── index.js       ← GET/POST /api/admin/users
│   │               │                  GET: lista usuarios
│   │               │                  POST: crear usuario
│   │               │
│   │               ├── [id].js        ← GET/PUT/DELETE /api/admin/users/[id]
│   │               │                  GET: obtener usuario
│   │               │                  PUT: actualizar usuario
│   │               │                  DELETE: eliminar usuario
│   │               │
│   │               └── recent.js      ← GET /api/admin/users/recent
│   │                                  Últimas creaciones
│   │
│   ├── 🧩 components/ (COMPONENTES REUTILIZABLES)
│   │   ├── Layout.jsx           ← Layout principal (nav sidebar)
│   │   │                         Props: children
│   │   │                         Usa: useAuth(), useRouter()
│   │   │
│   │   ├── AuthGate.js          ← Control de acceso (HOC)
│   │   │                         Props: children
│   │   │                         Verifica: user + role + ruta permitida
│   │   │
│   │   ├── NoAuth.js            ← Alert de "Acceso Denegado"
│   │   │
│   │   ├── CitaForm.js          ← FORMA CREAR CITA
│   │   │                         Props: onSubmit, onClose
│   │   │                         Validaciones: SAP, nombre, motivo
│   │   │                         Búsqueda SAP: async con debounce 500ms
│   │   │
│   │   ├── ConsultaCita.js      ← Detalle de cita (display)
│   │   │                         Props: cita, onClose
│   │   │                         Muestra: Timeline, médico, estado
│   │   │
│   │   ├── EstadoConsulta.js    ← Badge de estado (pending/programado/atendido/etc)
│   │   │                         Props: estado
│   │   │                         Retorna: <span> coloreado
│   │   │
│   │   ├── DoctorPanel.js       ← Card de cita para médico
│   │   │                         Props: cita, onAtender, onFinalizar, isLoading
│   │   │                         Muestra: Nombre, turno, motivo, botones
│   │   │                         Timer de espera calculado
│   │   │
│   │   ├── TurnoDisplay.js      ← Card grande para pantalla TV
│   │   │                         Props: cita, esConsulta
│   │   │                         Font: Grande (28+ px)
│   │   │
│   │   ├── MedicoActivo.js      ← Monitor de médico en consulta
│   │   │                         Props: medico, cita
│   │   │                         Muestra: Dr. [nombre], paciente, tiempo
│   │   │
│   │   ├── FechaHoraInput.js    ← Input fecha + hora (datetime-local)
│   │   │                         Props: value, onChange, minDate, disabled
│   │   │                         Output: ISO string "2026-03-12T14:30"
│   │   │
│   │   ├── HoraInput.js         ← Input solo hora (time)
│   │   │                         Props: value, onChange, disabled
│   │   │                         Output: "14:30"
│   │   │
│   │   └── admin/
│   │       ├── UsersPanel.js    ← Tabla de usuarios (CRUD)
│   │       │                    Props: users, onUpdate, onDelete
│   │       │
│   │       ├── CSVImportPanel.js ← Subir CSV de usuarios
│   │       │                      Props: onImport
│   │       │                      Parser: PapaParse
│   │       │
│   │       ├── ResumenUsuarios.js ← Resumen de usuarios
│   │       │
│   │       └── UserRecents.js    ← Últimos usuarios creados
│   │
│   ├── 🌍 context/ (ESTADO GLOBAL)
│   │   └── AuthContext.js       ← CONTEXTO AUTENTICACIÓN
│   │                             Provee: user, userName, idsap, role, status, loading
│   │                             Métodos: login(email, password), logout()
│   │                             Hooks: useAuth()
│   │                             Listener en: onAuthStateChange
│   │
│   ├── 📚 lib/ (LÓGICA REUTILIZABLE)
│   │   ├── supabase.js          ← CLIENT SUPABASE (público)
│   │   │                         createClient con clave anon
│   │                         Autorefresh token, persistSession
│   │                         Storage: localStorage
│   │                         Uso: import { supabase } from '@/lib/supabase'
│   │
│   │   ├── supabaseAdmin.js     ← CLIENT SUPABASE ADMIN (secreto)
│   │                         ⚠️ NUNCA usar en componentes
│   │                         ⚠️ SOLO en API routes
│   │                         Usa service role key (admin)
│   │
│   │   ├── citasData.js         ← CRUD DE CITAS (funciones)
│   │   │                         Exporta:
│   │   │                         - getCitasHoy()
│   │   │                         - getCitasPorPaciente(idSAP, limit=15)
│   │   │                         - agregarCita({nombre, motivo, idSAP, emergency, isss})
│   │   │                         - actualizarCita(id, cambios)
│   │   │                         - registrarCheckIn(id)
│   │   │                         - registrarCheckOut(id)
│   │   │                         - finalizarCita(id)
│   │   │                         - cancelarCita(id)
│   │   │                         - subscribeToCitas(callback)
│   │   │
│   │   ├── notify.js            ← NOTIFICACIONES (Telegram)
│   │   │                         Envía mensajes a usuarios vía Telegram
│   │   │
│   │   └── helpers.js           ← FUNCIONES UTILITARIAS (si existe)
│   │
│   └── 🎨 styles/ (CSS MODULES)
│       ├── globals.css          ← Estilos globales
│       │                         Colors, fonts, resets
│       │
│       ├── Login.module.css     ← Estilos para index.js
│       ├── Layout.module.css    ← Estilos para Layout
│       ├── Paciente.module.css  ← Estilos para paciente.js
│       ├── Doctor.module.css    ← Estilos para medico.js
│       ├── Enfermeria.module.css ← Estilos para enfermeria.js
│       ├── Supervisor.module.css ← Estilos para supervisor.js
│       ├── Turno.module.css     ← Estilos para turno.js
│       ├── Admin.module.css     ← Estilos para admin
│       ├── EstadoConsulta.module.css
│       ├── MedicoActivo.module.css
│       ├── NoAuth.module.css
│       └── Sidebar.module.css
│
├── 📦 public/ (ASSETS ESTÁTICOS)
│   ├── favicon.ico              ← Icono del browser
│   ├── robots.txt               ← Para SEO
│   ├── sitemap.xml              ← Mapa del sitio
│   ├── login-illustration.png   ← Imagen en página login
│   │
│   ├── icons/                   ← Iconos PWA
│   │   ├── icon-192.png         ← Apple touch icon
│   │   ├── icon-512.png
│   │   └── ...
│   │
│   ├── doorbell.mp3             ← Audio: Nueva cita para médico
│   │                             Se reproduce cuando: cita → "en espera"
│   │
│   └── nueva_cita.mp3           ← Audio: Nueva cita para enfermería
│                                 Se reproduce cuando: cita creada
│
├── 🔧 NODE MODULES/ (IGNORAR)
│   └── @supabase/
│       └── supabase-js/         ← Cliente Supabase (no editar)
│
└── 📝 PUBLIC DOCS (Raíz)
    ├── README.md
    ├── ÍNDICE.md
    ├── RESUMEN.md
    ├── ARQUITECTURA.md
    ├── SEGURIDAD.md
    ├── PAGES.md
    ├── COMPONENTES.md
    └── SETUP.md

```

---

## 🎯 Flujos por Archivo

### Flujo: Crear Cita (Paciente)

```
1. paciente.js
   ├─ handleNuevaCita() recibe datos
   └─ llama agregarCita(data)
      └─ 2. lib/citasData.js
         └─ agregarCita() hace INSERT
            └─ 3. Supabase
               └─ INSERT en tabla citas
                  └─ Realtime notifica
                     └─ 4. components/CitaForm.js
                        └─ Modal se cierra
                        └─ Mensje "Cita creada"
                           └─ 5. paciente.js
                              └─ cargarHistorial()
```

### Flujo: Atender Cita (Médico)

```
1. medico.js
   ├─ <DoctorPanel onAtender={atender} />
   └─ atender() 
      └─ 2. lib/citasData.js
         └─ actualizarCita(id, { estado: "en consulta", doctor_name })
            └─ 3. Supabase
               └─ UPDATE citas
                  └─ Realtime notifica
                     └─ 4. medico.js + turno.js
                        └─ Card cambia estado visually
```

### Flujo: Realtime Subscription

```
1. pages/medico.js
   ├─ useEffect(() => {
   │  ├─ supabase.channel("realtime-citas")
   │  ├─ .on("postgres_changes", ..., handler)
   │  ├─ .subscribe()
   │  └─ cleanup: removeChannel()
   │  })
   └─ handler actualiza state localmente
      └─ Componentes re-render automáticamente
```

---

## 🔀 Qué Importar de Dónde

### En un Componente

```javascript
// Autenticación
import { useAuth } from '@/context/AuthContext'
const { user, role, userName } = useAuth()

// Supabase
import { supabase } from '@/lib/supabase'
const { data, error } = await supabase.from('citas').select('*')

// Funciones CRUD
import { agregarCita, actualizarCita } from '@/lib/citasData'
await agregarCita({ nombre, motivo, idSAP })

// Router
import { useRouter } from 'next/router'
const router = useRouter()
router.push('/paciente')

// Estilos
import styles from '@/styles/Paciente.module.css'
<div className={styles.container}>

// Componentes propios
import CitaForm from '@/components/CitaForm'
```

### En una Página

```javascript
// IGUAL que en componentes +

// Head para meta tags
import Head from 'next/head'
<Head>
  <title>Paciente - MedyLink</title>
</Head>

// Componentes que usan esa página
import CitaForm from '@/components/CitaForm'
import ConsultaCita from '@/components/ConsultaCita'
```

### En una API Route

```javascript
// NUNCA client-side supabase
import { supabaseAdmin } from '@/lib/supabaseAdmin'  // Aquí SÍ se permite
const { data } = await supabaseAdmin.from('app_users').select('*')

// Req/Res de Next.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Lógica
    res.status(200).json({ message: 'Ok' })
  }
}
```

---

## 📊 Dependencias Principales

```json
{
  "@supabase/supabase-js": "^2.49.4",    // Client BD
  "next": "^16.1.6",                      // Framework
  "react": "^19.2.4",                     // UI
  "react-dom": "^19.2.4",                 // DOM
  "react-icons": "^5.5.0",                // Iconografía
  "react-modal": "^3.16.3",               // Modales
  "react-tabs": "^6.1.0",                 // Tabs
  "papaparse": "^5.5.2",                  // CSV parser
  "uuid": "^11.1.0"                       // IDs únicos
}
```

---

## 🚀 Scripts

```bash
npm run dev      # Iniciar servidor dev (http://localhost:3000)
npm run build    # Build para producción (Next.js)
npm run start    # Ejecutar build (requiere npm run build primero)
npm run lint     # Ejecutar ESLint
```

---

## 📦 Estructura de una Cita en BD

```javascript
{
  id: "uuid",              // PK
  idsap: 12345678,         // SAP del paciente
  nombre: "Juan García",
  motivo: "Revisión general",
  estado: "pendiente",     // pendiente, programado, en espera, en consulta, atendido, cancelado
  check_in: "2026-03-12T10:30:00",     // Cuando entró a esperar
  check_out: "2026-03-12T10:42:00",    // Cuando finalizó
  cita_programada: "2026-03-12T14:00:00",  // Cuándo se programó
  programmer_at: "2026-03-12T09:00:00",    // Cuándo se creó la programación
  emergency: false,        // ¿Es urgente?
  isss: false,            // ¿Es consulta ISSS?
  doctor_name: "Dr. Juan", // Médico asignado
  orden_llegada: 3,        // Número de turno
  created_at: "2026-03-12T10:00:00",
  updated_at: "2026-03-12T10:42:00"
}
```

---

## ✅ Checklist de Estructura

- ✅ pages/ - Todos los archivos (.js)
- ✅ components/ - Componentes reutilizables
- ✅ context/ - AuthContext.js
- ✅ lib/ - supabase.js, citasData.js, etc
- ✅ styles/ - Módulos CSS por página
- ✅ public/ - Assets + audio

---

## 🎓 Resumen Rápido

| Necesito... | Archivo |
|-------------|---------|
| Crear cita | lib/citasData.js + components/CitaForm.js |
| Autenticar | context/AuthContext.js |
| Supabase | lib/supabase.js (client) o lib/supabaseAdmin.js (admin) |
| Mostrar cita | components/ConsultaCita.js |
| Estilos | src/styles/\*.module.css |
| Nueva página | src/pages/nombre.js |
| Nuevo componente | src/components/Nombre.js |
| Audio | public/*.mp3 + reproducir en páginas |
| API endpoint | src/pages/api/endpoint.js |

---

**Última actualización:** 2026-03-12  
**Status:** Completa ✅
