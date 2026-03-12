# ðŸ“‚ ESTRUCTURA DEL CÃ“DIGO - GuÃ­a Visual

**Para:** Desarrolladores nuevos que quieren entender dÃ³nde estÃ¡ cada cosa  
**Ãšltima actualizaciÃ³n:** 2026-03-12

---

## ðŸŒ³ Ãrbol Completo Comentado

```
control_medico/
â”‚
â”œâ”€â”€ ðŸ“„ DOCUMENTACIÃ“N (Lee primero)
â”‚   â”œâ”€â”€ README.md              â† Punto de entrada (10 min)
â”‚   â”œâ”€â”€ ÃNDICE.md              â† Mapa de documentos (5 min)
â”‚   â”œâ”€â”€ RESUMEN.md             â† Resumen ejecutivo (5 min)
â”‚   â”œâ”€â”€ ARQUITECTURA.md         â† AnÃ¡lisis tÃ©cnico (45 min)
â”‚   â”œâ”€â”€ SEGURIDAD.md            â† AuditorÃ­a de seguridad (45 min)
â”‚   â”œâ”€â”€ PAGES.md                â† GuÃ­a de vistas (45 min)
â”‚   â”œâ”€â”€ COMPONENTES.md          â† Referencia componentes (45 min)
â”‚   â””â”€â”€ SETUP.md                â† GuÃ­a de desarrollo (90 min)
â”‚
â”œâ”€â”€ ðŸ”§ CONFIGURACIÃ“N
â”‚   â”œâ”€â”€ package.json            â† Dependencias y scripts
â”‚   â”œâ”€â”€ next.config.mjs         â† ConfiguraciÃ³n Next.js
â”‚   â”œâ”€â”€ jsconfig.json           â† Alias de imports (@/)
â”‚   â”œâ”€â”€ eslint.config.mjs       â† Linting rules
â”‚   â”œâ”€â”€ .env.local              â† Variables (NO commitear)
â”‚   â”œâ”€â”€ .env.example            â† Template de .env
â”‚   â”œâ”€â”€ .gitignore              â† Archivos ignorados en git
â”‚   â””â”€â”€ .gitattributes          â† Atributos git
â”‚
â”œâ”€â”€ ðŸ“„ src/ (CÃ“DIGO PRINCIPAL)
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“„ pages/ (RUTAS Y VISTAS)
â”‚   â”‚   â”œâ”€â”€ index.js            â† LOGIN/REGISTRO (public)
â”‚   â”‚   â”‚                        Flujo: SAP + password â†’ crear cuenta o login
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ paciente.js         â† PORTAL PACIENTE (role: paciente)
â”‚   â”‚   â”‚                        Flujo: Ver citas, crear nuevas, historial
â”‚   â”‚   â”‚                        Componentes: CitaForm, ConsultaCita, EstadoConsulta
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ medico.js           â† PANEL MÃ‰DICO (role: medico)
â”‚   â”‚   â”‚                        Flujo: Atender citas, finalizar consulta
â”‚   â”‚   â”‚                        Audio: Doorbell cuando cita en espera
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ enfermeria.js       â† GESTIÃ“N ENFERMERÃA (role: enfermeria)
â”‚   â”‚   â”‚                        Flujo: Registrar entrada, programar, asignar
â”‚   â”‚   â”‚                        Tabs: Pendientes, En Espera, Programadas, MÃ©dico Activo
â”‚   â”‚   â”‚                        Audio: Nueva cita notification
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ supervisor.js       â† DASHBOARD SUPERVISOR (role: supervisor)
â”‚   â”‚   â”‚                        Flujo: Ver estadÃ­sticas (tiempos, cupos, eficiencia)
â”‚   â”‚   â”‚                        No tiene actions, solo display
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ turno.js            â† PANTALLA PÃšBLICA (TV Display)
â”‚   â”‚   â”‚                        Flujo: Mostrar prÃ³ximos pacientes (grande, legible)
â”‚   â”‚   â”‚                        Sidebar: Fila de espera
â”‚   â”‚   â”‚                        Main: Ahora atendiendo
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ _app.js             â† WRAPPER GLOBAL
â”‚   â”‚   â”‚                        Estructura: <AuthProvider><AuthGate><Layout><Page/></Layout></AuthGate></AuthProvider>
â”‚   â”‚   â”‚                        AquÃ­ se configura: Head, meta tags, provider global
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ _document.js        â† HTML base (Next.js)
â”‚   â”‚   â”‚                        Si existe, define <html><body> structure
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ 404.js              â† PÃ¡gina no encontrada
â”‚   â”‚   â”œâ”€â”€ 500.js              â† Error server
â”‚   â”‚   â”‚
â”‚   â”‚   â””â”€â”€ api/ (ENDPOINTS BACKEND)
â”‚   â”‚       â”œâ”€â”€ telegram-webhook.js    â† Webhook de Telegram (recibirNotificaciones)
â”‚   â”‚       â”‚                          Format: POST /api/telegram-webhook
â”‚   â”‚       â”‚                          Body: { message, user_id }
â”‚   â”‚       â”‚
â”‚   â”‚       â””â”€â”€ admin/
â”‚   â”‚           â”œâ”€â”€ importarAllowed.js â† Importar usuarios desde CSV
â”‚   â”‚           â”‚                       Format: POST /api/admin/importarAllowed
â”‚   â”‚           â”‚                       Body: FormData con file CSV
â”‚   â”‚           â”‚
â”‚   â”‚           â””â”€â”€ users/
â”‚   â”‚               â”œâ”€â”€ index.js       â† GET/POST /api/admin/users
â”‚   â”‚               â”‚                  GET: lista usuarios
â”‚   â”‚               â”‚                  POST: crear usuario
â”‚   â”‚               â”‚
â”‚   â”‚               â”œâ”€â”€ [id].js        â† GET/PUT/DELETE /api/admin/users/[id]
â”‚   â”‚               â”‚                  GET: obtener usuario
â”‚   â”‚               â”‚                  PUT: actualizar usuario
â”‚   â”‚               â”‚                  DELETE: eliminar usuario
â”‚   â”‚               â”‚
â”‚   â”‚               â””â”€â”€ recent.js      â† GET /api/admin/users/recent
â”‚   â”‚                                  Ãšltimas creaciones
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ§© components/ (COMPONENTES REUTILIZABLES)
â”‚   â”‚   â”œâ”€â”€ Layout.jsx           â† Layout principal (nav sidebar)
â”‚   â”‚   â”‚                         Props: children
â”‚   â”‚   â”‚                         Usa: useAuth(), useRouter()
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ AuthGate.js          â† Control de acceso (HOC)
â”‚   â”‚   â”‚                         Props: children
â”‚   â”‚   â”‚                         Verifica: user + role + ruta permitida
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ NoAuth.js            â† Alert de "Acceso Denegado"
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ CitaForm.js          â† FORMA CREAR CITA
â”‚   â”‚   â”‚                         Props: onSubmit, onClose
â”‚   â”‚   â”‚                         Validaciones: SAP, nombre, motivo
â”‚   â”‚   â”‚                         BÃºsqueda SAP: async con debounce 500ms
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ ConsultaCita.js      â† Detalle de cita (display)
â”‚   â”‚   â”‚                         Props: cita, onClose
â”‚   â”‚   â”‚                         Muestra: Timeline, mÃ©dico, estado
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ EstadoConsulta.js    â† Badge de estado (pending/programado/atendido/etc)
â”‚   â”‚   â”‚                         Props: estado
â”‚   â”‚   â”‚                         Retorna: <span> coloreado
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ DoctorPanel.js       â† Card de cita para mÃ©dico
â”‚   â”‚   â”‚                         Props: cita, onAtender, onFinalizar, isLoading
â”‚   â”‚   â”‚                         Muestra: Nombre, turno, motivo, botones
â”‚   â”‚   â”‚                         Timer de espera calculado
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ TurnoDisplay.js      â† Card grande para pantalla TV
â”‚   â”‚   â”‚                         Props: cita, esConsulta
â”‚   â”‚   â”‚                         Font: Grande (28+ px)
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ MedicoActivo.js      â† Monitor de mÃ©dico en consulta
â”‚   â”‚   â”‚                         Props: medico, cita
â”‚   â”‚   â”‚                         Muestra: Dr. [nombre], paciente, tiempo
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ FechaHoraInput.js    â† Input fecha + hora (datetime-local)
â”‚   â”‚   â”‚                         Props: value, onChange, minDate, disabled
â”‚   â”‚   â”‚                         Output: ISO string "2026-03-12T14:30"
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ HoraInput.js         â† Input solo hora (time)
â”‚   â”‚   â”‚                         Props: value, onChange, disabled
â”‚   â”‚   â”‚                         Output: "14:30"
â”‚   â”‚   â”‚
â”‚   â”‚   â””â”€â”€ admin/
â”‚   â”‚       â”œâ”€â”€ UsersPanel.js    â† Tabla de usuarios (CRUD)
â”‚   â”‚       â”‚                    Props: users, onUpdate, onDelete
â”‚   â”‚       â”‚
â”‚   â”‚       â”œâ”€â”€ CSVImportPanel.js â† Subir CSV de usuarios
â”‚   â”‚       â”‚                      Props: onImport
â”‚   â”‚       â”‚                      Parser: PapaParse
â”‚   â”‚       â”‚
â”‚   â”‚       â”œâ”€â”€ ResumenUsuarios.js â† Resumen de usuarios
â”‚   â”‚       â”‚
â”‚   â”‚       â””â”€â”€ UserRecents.js    â† Ãšltimos usuarios creados
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸŒ context/ (ESTADO GLOBAL)
â”‚   â”‚   â””â”€â”€ AuthContext.js       â† CONTEXTO AUTENTICACIÃ“N
â”‚   â”‚                             Provee: user, userName, idsap, role, status, loading
â”‚   â”‚                             MÃ©todos: login(email, password), logout()
â”‚   â”‚                             Hooks: useAuth()
â”‚   â”‚                             Listener en: onAuthStateChange
â”‚   â”‚
â”‚   â”œâ”€â”€ ðŸ“š lib/ (LÃ“GICA REUTILIZABLE)
â”‚   â”‚   â”œâ”€â”€ supabase.js          â† CLIENT SUPABASE (pÃºblico)
â”‚   â”‚   â”‚                         createClient con clave anon
â”‚   â”‚                         Autorefresh token, persistSession
â”‚   â”‚                         Storage: localStorage
â”‚   â”‚                         Uso: import { supabase } from '@/lib/supabase'
â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ supabaseAdmin.js     â† CLIENT SUPABASE ADMIN (secreto)
â”‚   â”‚                         âš ï¸ NUNCA usar en componentes
â”‚   â”‚                         âš ï¸ SOLO en API routes
â”‚   â”‚                         Usa service role key (admin)
â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ citasData.js         â† CRUD DE CITAS (funciones)
â”‚   â”‚   â”‚                         Exporta:
â”‚   â”‚   â”‚                         - getCitasHoy()
â”‚   â”‚   â”‚                         - getCitasPorPaciente(idSAP, limit=15)
â”‚   â”‚   â”‚                         - agregarCita({nombre, motivo, idSAP, emergency, isss})
â”‚   â”‚   â”‚                         - actualizarCita(id, cambios)
â”‚   â”‚   â”‚                         - registrarCheckIn(id)
â”‚   â”‚   â”‚                         - registrarCheckOut(id)
â”‚   â”‚   â”‚                         - finalizarCita(id)
â”‚   â”‚   â”‚                         - cancelarCita(id)
â”‚   â”‚   â”‚                         - subscribeToCitas(callback)
â”‚   â”‚   â”‚
â”‚   â”‚   â”œâ”€â”€ notify.js            â† NOTIFICACIONES (Telegram)
â”‚   â”‚   â”‚                         EnvÃ­a mensajes a usuarios vÃ­a Telegram
â”‚   â”‚   â”‚
â”‚   â”‚   â””â”€â”€ helpers.js           â† FUNCIONES UTILITARIAS (si existe)
â”‚   â”‚
â”‚   â””â”€â”€ ðŸŽ¨ styles/ (CSS MODULES)
â”‚       â”œâ”€â”€ globals.css          â† Estilos globales
â”‚       â”‚                         Colors, fonts, resets
â”‚       â”‚
â”‚       â”œâ”€â”€ Login.module.css     â† Estilos para index.js
â”‚       â”œâ”€â”€ Layout.module.css    â† Estilos para Layout
â”‚       â”œâ”€â”€ Paciente.module.css  â† Estilos para paciente.js
â”‚       â”œâ”€â”€ Doctor.module.css    â† Estilos para medico.js
â”‚       â”œâ”€â”€ Enfermeria.module.css â† Estilos para enfermeria.js
â”‚       â”œâ”€â”€ Supervisor.module.css â† Estilos para supervisor.js
â”‚       â”œâ”€â”€ Turno.module.css     â† Estilos para turno.js
â”‚       â”œâ”€â”€ Admin.module.css     â† Estilos para admin
â”‚       â”œâ”€â”€ EstadoConsulta.module.css
â”‚       â”œâ”€â”€ MedicoActivo.module.css
â”‚       â”œâ”€â”€ NoAuth.module.css
â”‚       â””â”€â”€ Sidebar.module.css
â”‚
â”œâ”€â”€ ðŸ“¦ public/ (ASSETS ESTÃTICOS)
â”‚   â”œâ”€â”€ favicon.ico              â† Icono del browser
â”‚   â”œâ”€â”€ robots.txt               â† Para SEO
â”‚   â”œâ”€â”€ sitemap.xml              â† Mapa del sitio
â”‚   â”œâ”€â”€ login-illustration.png   â† Imagen en pÃ¡gina login
â”‚   â”‚
â”‚   â”œâ”€â”€ icons/                   â† Iconos PWA
â”‚   â”‚   â”œâ”€â”€ icon-192.png         â† Apple touch icon
â”‚   â”‚   â”œâ”€â”€ icon-512.png
â”‚   â”‚   â””â”€â”€ ...
â”‚   â”‚
â”‚   â”œâ”€â”€ doorbell.mp3             â† Audio: Nueva cita para mÃ©dico
â”‚   â”‚                             Se reproduce cuando: cita â†’ "en espera"
â”‚   â”‚
â”‚   â””â”€â”€ nueva_cita.mp3           â† Audio: Nueva cita para enfermerÃ­a
â”‚                                 Se reproduce cuando: cita creada
â”‚
â”œâ”€â”€ ðŸ”§ NODE MODULES/ (IGNORAR)
â”‚   â””â”€â”€ @supabase/
â”‚       â””â”€â”€ supabase-js/         â† Cliente Supabase (no editar)
â”‚
â””â”€â”€ ðŸ“ PUBLIC DOCS (RaÃ­z)
    â”œâ”€â”€ README.md
    â”œâ”€â”€ ÃNDICE.md
    â”œâ”€â”€ RESUMEN.md
    â”œâ”€â”€ ARQUITECTURA.md
    â”œâ”€â”€ SEGURIDAD.md
    â”œâ”€â”€ PAGES.md
    â”œâ”€â”€ COMPONENTES.md
    â””â”€â”€ SETUP.md

```

---

## ðŸŽ¯ Flujos por Archivo

### Flujo: Crear Cita (Paciente)

```
1. paciente.js
   â”œâ”€ handleNuevaCita() recibe datos
   â””â”€ llama agregarCita(data)
      â””â”€ 2. lib/citasData.js
         â””â”€ agregarCita() hace INSERT
            â””â”€ 3. Supabase
               â””â”€ INSERT en tabla citas
                  â””â”€ Realtime notifica
                     â””â”€ 4. components/CitaForm.js
                        â””â”€ Modal se cierra
                        â””â”€ Mensje "Cita creada"
                           â””â”€ 5. paciente.js
                              â””â”€ cargarHistorial()
```

### Flujo: Atender Cita (MÃ©dico)

```
1. medico.js
   â”œâ”€ <DoctorPanel onAtender={atender} />
   â””â”€ atender() 
      â””â”€ 2. lib/citasData.js
         â””â”€ actualizarCita(id, { estado: "en consulta", doctor_name })
            â””â”€ 3. Supabase
               â””â”€ UPDATE citas
                  â””â”€ Realtime notifica
                     â””â”€ 4. medico.js + turno.js
                        â””â”€ Card cambia estado visually
```

### Flujo: Realtime Subscription

```
1. pages/medico.js
   â”œâ”€ useEffect(() => {
   â”‚  â”œâ”€ supabase.channel("realtime-citas")
   â”‚  â”œâ”€ .on("postgres_changes", ..., handler)
   â”‚  â”œâ”€ .subscribe()
   â”‚  â””â”€ cleanup: removeChannel()
   â”‚  })
   â””â”€ handler actualiza state localmente
      â””â”€ Componentes re-render automÃ¡ticamente
```

---

## ðŸ”€ QuÃ© Importar de DÃ³nde

### En un Componente

```javascript
// AutenticaciÃ³n
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

### En una PÃ¡gina

```javascript
// IGUAL que en componentes +

// Head para meta tags
import Head from 'next/head'
<Head>
  <title>Paciente - MedyLink</title>
</Head>

// Componentes que usan esa pÃ¡gina
import CitaForm from '@/components/CitaForm'
import ConsultaCita from '@/components/ConsultaCita'
```

### En una API Route

```javascript
// NUNCA client-side supabase
import { supabaseAdmin } from '@/lib/supabaseAdmin'  // AquÃ­ SÃ se permite
const { data } = await supabaseAdmin.from('app_users').select('*')

// Req/Res de Next.js
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // LÃ³gica
    res.status(200).json({ message: 'Ok' })
  }
}
```

---

## ðŸ“Š Dependencias Principales

```json
{
  "@supabase/supabase-js": "^2.49.4",    // Client BD
  "next": "^16.1.6",                      // Framework
  "react": "^19.2.4",                     // UI
  "react-dom": "^19.2.4",                 // DOM
  "react-icons": "^5.5.0",                // IconografÃ­a
  "react-modal": "^3.16.3",               // Modales
  "react-tabs": "^6.1.0",                 // Tabs
  "papaparse": "^5.5.2",                  // CSV parser
  "uuid": "^11.1.0"                       // IDs Ãºnicos
}
```

---

## ðŸš€ Scripts

```bash
npm run dev      # Iniciar servidor dev (http://localhost:3000)
npm run build    # Build para producciÃ³n (Next.js)
npm run start    # Ejecutar build (requiere npm run build primero)
npm run lint     # Ejecutar ESLint
```

---

## ðŸ“¦ Estructura de una Cita en BD

```javascript
{
  id: "uuid",              // PK
  idsap: 12345678,         // SAP del paciente
  nombre: "Juan GarcÃ­a",
  motivo: "RevisiÃ³n general",
  estado: "pendiente",     // pendiente, programado, en espera, en consulta, atendido, cancelado
  check_in: "2026-03-12T10:30:00",     // Cuando entrÃ³ a esperar
  check_out: "2026-03-12T10:42:00",    // Cuando finalizÃ³
  cita_programada: "2026-03-12T14:00:00",  // CuÃ¡ndo se programÃ³
  programmer_at: "2026-03-12T09:00:00",    // CuÃ¡ndo se creÃ³ la programaciÃ³n
  emergency: false,        // Â¿Es urgente?
  isss: false,            // Â¿Es consulta ISSS?
  doctor_name: "Dr. Juan", // MÃ©dico asignado
  orden_llegada: 3,        // NÃºmero de turno
  created_at: "2026-03-12T10:00:00",
  updated_at: "2026-03-12T10:42:00"
}
```

---

## âœ… Checklist de Estructura

- âœ… pages/ - Todos los archivos (.js)
- âœ… components/ - Componentes reutilizables
- âœ… context/ - AuthContext.js
- âœ… lib/ - supabase.js, citasData.js, etc
- âœ… styles/ - MÃ³dulos CSS por pÃ¡gina
- âœ… public/ - Assets + audio

---

## ðŸŽ“ Resumen RÃ¡pido

| Necesito... | Archivo |
|-------------|---------|
| Crear cita | lib/citasData.js + components/CitaForm.js |
| Autenticar | context/AuthContext.js |
| Supabase | lib/supabase.js (client) o lib/supabaseAdmin.js (admin) |
| Mostrar cita | components/ConsultaCita.js |
| Estilos | src/styles/\*.module.css |
| Nueva pÃ¡gina | src/pages/nombre.js |
| Nuevo componente | src/components/Nombre.js |
| Audio | public/*.mp3 + reproducir en pÃ¡ginas |
| API endpoint | src/pages/api/endpoint.js |

---

**Ãšltima actualizaciÃ³n:** 2026-03-12  
**Status:** Completa âœ…

