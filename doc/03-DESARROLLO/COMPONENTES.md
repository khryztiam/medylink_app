# ðŸ§© DocumentaciÃ³n de Componentes

**Stack:** React 19.2.4 + CSS Modules  
**Ãšltima actualizaciÃ³n:** 2026-03-12

---

## ðŸ“‹ Ãndice de Componentes

### Componentes Principales
1. [AuthGate](#1-authgate)
2. [Layout](#2-layout)
3. [CitaForm](#3-citaform)
4. [DoctorPanel](#4-doctorpanel)
5. [ConsultaCita](#5-consultacita)
6. [EstadoConsulta](#6-estadoconsulta)
7. [TurnoDisplay](#7-turnodisplay)
8. [MedicoActivo](#8-medicoactivo)

### Componentes de Entrada
9. [FechaHoraInput](#9-fechahorainput)
10. [HoraInput](#10-horainput)

### Componentes Admin
11. [UsersPanel](#11-userspanel)
12. [CSVImportPanel](#12-csvimportpanel)

---

## 1. AuthGate

**UbicaciÃ³n:** `src/components/AuthGate.js`  
**Tipo:** HOC (Higher Order Component)  
**PropÃ³sito:** Control de acceso por rol

### Props

```javascript
{
  children: ReactNode  // Contenido a proteger
}
```

### Comportamiento

```javascript
// Si loading â†’ renderiza null (espera)
// Si NO user + ruta pÃºblica (/, /register) â†’ renderiza children
// Si NO user + otra ruta â†’ redirige a /
// Si user + ruta pÃºblica â†’ redirige a home del role
// Si user + ruta no autorizada â†’ muestra <NoAuth />
// Si user + ruta autorizada â†’ renderiza children
```

### Mapa de Rutas por Rol

```javascript
const roleRoutes = {
  paciente: ['/', '/paciente'],
  enfermeria: ['/', '/enfermeria', '/turno'],
  medico: ['/', '/medico'],
  supervisor: ['/', '/supervisor'],
  admin: ['/', '/admin/control', '/paciente', '/enfermeria', '/medico', '/turno', '/supervisor'],
}
```

### Ejemplo de uso

```jsx
// En _app.js:
<AuthGate>
  <Layout>
    <Component {...pageProps} />
  </Layout>
</AuthGate>
```

### âš ï¸ Consideraciones

- Verifica `router.pathname` exactamente (no fuzzy match)
- `loading` state es crÃ­tico para evitar flickering
- Uso de `shallow: true` en redirect es innecesario (Next.js 12+)

---

## 2. Layout

**UbicaciÃ³n:** `src/components/Layout.jsx`  
**Tipo:** Componente de composiciÃ³n  
**PropÃ³sito:** NavegaciÃ³n lateral + estructura global

### Props

```javascript
{
  children: ReactNode  // Contenido principal
}
```

### Estructura

```
<div className="layout">
  <Sidebar>
    Logo
    [Nav segÃºn role]
    [User info]
    [Logout]
  </Sidebar>
  
  <main>
    <Header>
      TÃ­tulo pÃ¡gina
      [Notificaciones]
    </Header>
    {children}
  </main>
</div>
```

### NavegaciÃ³n por Role

```javascript
import { useAuth } from '@/context/AuthContext';

// Cada role tiene menÃº diferente
const menuItems = {
  paciente: [
    { label: 'Mis citas', href: '/paciente', icon: 'ðŸ“‹' },
    { label: 'Historial', href: '/paciente#historial', icon: 'ðŸ“Š' },
  ],
  medico: [
    { label: 'Atender citas', href: '/medico', icon: 'ðŸ‘¨â€âš•ï¸' },
    { label: 'Programadas', href: '/medico#programadas', icon: 'ðŸ“…' },
  ],
  // ... etc
}
```

### Responsive

- Desktop: Sidebar 250px fixed, main full width
- Mobile: Sidebar hamburger collapsible
- Tablets: Sidebar narrower

### âš ï¸ Consideraciones

- `<Sidebar>` es componente externo (verificar import)
- `useRouter()` para detectar ruta activa
- Animaciones CSS para toggle sidebar

---

## 3. CitaForm

**UbicaciÃ³n:** `src/components/CitaForm.js`  
**Tipo:** Form component con modal  
**PropÃ³sito:** Crear o editar citas

### Props

```javascript
{
  onSubmit: async (data) => void,  // Callback con datos
  onClose: () => void               // Cierra modal
}
```

### Props esperadas en `onSubmit`

```javascript
{
  nombre: string,        // Nombre del paciente
  motivo: string,        // RazÃ³n de visita
  idSAP: number,        // Identificador laboral
  emergency: boolean,    // Â¿Es urgente?
  isss: boolean         // Â¿Es consulta ISSS?
}
```

### Comportamiento por Role

#### Paciente
```javascript
// Estado al cargar:
setNombre(userName)    // Auto completado
setIdSAP(authSap)      // No editable
setRole('paciente')

// En form:
- Campo SAP: disabled
- Campo nombre: readonly
- Acciones: [Crear] [Cancelar]
```

#### EnfermerÃ­a/Admin/Supervisor
```javascript
// Estado al cargar:
setNombre('')  // VacÃ­o
setIdSAP('')   // Editable
setRole('enfermeria')

// En form:
- Campo SAP: editable (con busqueda)
- Campo nombre: readonly (se rellena al escribir SAP)
- Acciones: [Crear] [Cancelar]

// Lo bÃºsqueda:
- Busca en allowed_users por SAP
- Debounce 500ms
- Muestra error si no existe
```

### Validaciones

```javascript
if (!idsap.trim())
  throw new Error("Ingresa tu nÃºmero SAP.")

if (password.length < 6)
  throw new Error("La contraseÃ±a debe tener al menos 6 caracteres.")

if (password !== confirmPassword)
  throw new Error("Las contraseÃ±as no coinciden.")

if (!nombre.trim() || !motivo.trim() || isNaN(sapNumerico))
  return
```

### Estados Visuales

```javascript
const [buscando, setBuscando] = useState(false)
// Mientras busca: label muestra "Validando usuario..."
// Campo nombre en estado "loading" (gris/deshabilitado)

const [errorSAP, setErrorSAP] = useState(null)
// Si SAP no existe: muestra "Usuario no encontrado"
// Form en estado "has-error"
```

### Ejemplo de uso

```jsx
// En paciente.js:
<CitaForm
  onSubmit={handleNuevaCita}
  onClose={() => setIsModalOpen(false)}
/>

// Con async/await:
const handleNuevaCita = async (data) => {
  try {
    await agregarCita(data)
    setMensaje({ texto: 'âœ… Cita creada', tipo: 'exito' })
    setIsModalOpen(false)
  } catch (err) {
    setMensaje({ texto: 'âŒ Error: ' + err.message, tipo: 'error' })
  }
}
```

### âš ï¸ Consideraciones

- Debounce en bÃºsqueda evita spam a BD
- SAP debe tener 8+ dÃ­gitos para buscar
- Email construcciÃ³n: `SAP@yazaki.com` es hardcoded
- Toggle ISSS: verificar que se usa (nuevo campo)

---

## 4. DoctorPanel

**UbicaciÃ³n:** `src/components/DoctorPanel.js`  
**Tipo:** Display component  
**PropÃ³sito:** Card de cita para mÃ©dico

### Props

```javascript
{
  cita: {
    id: string,
    nombre: string,
    idsap: number,
    motivo: string,
    estado: string,
    check_in: string (ISO),
    orden_llegada: number,
    emergency: boolean
  },
  onAtender: () => void,      // BotÃ³n "Atender"
  onFinalizar: () => void,    // BotÃ³n "Finalizar"
  isLoading?: boolean         // Estado de carga
}
```

### Estructura

```jsx
<div className={styles.doctorCard}>
  <div className={styles.header}>
    <span className={styles.numero}># {cita.orden_llegada}</span>
    <span className={styles.nombre}>{cita.nombre}</span>
    {cita.emergency && <span className={styles.emergencia}>ðŸš¨</span>}
  </div>
  
  <div className={styles.body}>
    <p>SAP: {cita.idsap}</p>
    <p>Motivo: {cita.motivo}</p>
    <p>Tiempo en espera: {calcularTiempo()}</p>
  </div>
  
  <div className={styles.actions}>
    <button onClick={onAtender}>Atender</button>
    <button onClick={onFinalizar}>Finalizar</button>
  </div>
</div>
```

### Estados Visuales

```javascript
if (cita.emergency) {
  card.classList.add('--emergencia')  // Fondo rojo
}

if (cita.estado === 'en consulta') {
  card.classList.add('--activa')  // Fondo naranja
}

if (isLoading) {
  buttons.disabled = true
  buttons.innerHTML = 'â³ Procesando...'
}
```

### CÃ¡lculo de Tiempo

```javascript
function calcularTiempo() {
  const ahora = new Date()
  const checkIn = new Date(cita.check_in)
  const minutos = Math.floor((ahora - checkIn) / 60000)
  return `${minutos} min`
}
```

### Ejemplo de uso

```jsx
// En medico.js:
{citasActivas.map(cita => (
  <DoctorPanel
    key={cita.id}
    cita={cita}
    onAtender={() => atender(cita.id, userName)}
    onFinalizar={() => finalizar(cita.id)}
    isLoading={loadingCitaId === cita.id}
  />
))}
```

### âš ï¸ Consideraciones

- Tiempo se actualiza cada render (puede ser ineficiente)
- Mejor: usar `setInterval` si render es constante
- `emergency` es visual, no funcional

---

## 5. ConsultaCita

**UbicaciÃ³n:** `src/components/ConsultaCita.js`  
**Tipo:** Display component  
**PropÃ³sito:** Detalle completo de una cita

### Props

```javascript
{
  cita: {
    id: string,
    nombre: string,
    idsap: number,
    motivo: string,
    estado: string,
    created_at: string (ISO),
    cita_programada: string (ISO),
    check_in: string (ISO),
    check_out: string (ISO),
    doctor_name: string,
    emergency: boolean,
    isss: boolean
  },
  onClose?: () => void        // Si estÃ¡ en modal
}
```

### Estructura

```jsx
<div className={styles.consultaContainer}>
  <h2>Detalles de la Cita</h2>
  
  <section>
    <h3>Paciente</h3>
    <p>{cita.nombre} (SAP: {cita.idsap})</p>
  </section>
  
  <section>
    <h3>Cita</h3>
    <p>Motivo: {cita.motivo}</p>
    <p>Estado: <Badge estado={cita.estado} /></p>
    {cita.emergency && <p>âš ï¸ EMERGENCIA</p>}
    {cita.isss && <p>ðŸ¥ Consulta ISSS</p>}
  </section>
  
  <section>
    <h3>Timeline</h3>
    <p>Solicitud: {formatFecha(cita.created_at)}</p>
    <p>Programada: {formatFecha(cita.cita_programada)}</p>
    <p>Check-in: {formatFecha(cita.check_in)}</p>
    <p>Check-out: {formatFecha(cita.check_out)}</p>
  </section>
  
  <section>
    <h3>MÃ©dico</h3>
    <p>{cita.doctor_name || 'Pendiente de asignaciÃ³n'}</p>
  </section>
</div>
```

### Formateo de Fechas

```javascript
function formatFecha(fechaStr) {
  if (!fechaStr) return "â€”";
  return new Date(fechaStr).toLocaleString("es-SV", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  })
}
```

### Ejemplo de uso

```jsx
// En paciente.js (modal):
<Modal isOpen={showDetalle} onRequestClose={() => setShowDetalle(false)}>
  <ConsultaCita cita={citaSeleccionada} />
</Modal>

// En enfermeria.js (inline):
<ConsultaCita cita={selectedCita} />
```

### âš ï¸ Consideraciones

- No es interactivo (display only)
- Campos vacÃ­os â†’ "â€”"
- Formato de fecha locale-aware (es-SV = El Salvador)

---

## 6. EstadoConsulta

**UbicaciÃ³n:** `src/components/EstadoConsulta.js`  
**Tipo:** Badge/label component  
**PropÃ³sito:** Mostrar estado visual de cita

### Props

```javascript
{
  estado: string  // "pendiente" | "programado" | "en espera" | "en consulta" | "atendido" | "cancelado"
}
```

### Mapeo de Estados

```javascript
const estadoMap = {
  "atendido": { color: "verde", icono: "âœ“", label: "Atendido" },
  "pendiente": { color: "amarillo", icono: "â³", label: "Pendiente" },
  "programado": { color: "azul", icono: "ðŸ“…", label: "Programado" },
  "en espera": { color: "naranja", icono: "â¸ï¸", label: "En espera" },
  "en consulta": { color: "rojo", icono: "ðŸ‘¨â€âš•ï¸", label: "En consulta" },
  "cancelado": { color: "gris", icono: "âœ—", label: "Cancelado" }
}
```

### Estructura

```jsx
<span className={`${styles.badge} ${styles[`badge-${estado}`]}`}>
  <span className={styles.badgeDot} />
  {label}
</span>
```

### Estilos

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.badgeAtendido {
  background-color: #10b981;
  color: white;
}

.badgePendiente {
  background-color: #f59e0b;
  color: white;
}

/* ... etc */
```

### Ejemplo de uso

```jsx
// En paciente.js (tabla):
<EstadoConsulta estado={cita.estado} />

// En card:
<div>
  <p>Estado:</p>
  <EstadoConsulta estado="en espera" />
</div>
```

### âš ï¸ Consideraciones

- Componente "tonto" (no tiene estado)
- Super reutilizable
- Considerar internacionalizaciÃ³n (i18n) para labels

---

## 7. TurnoDisplay

**UbicaciÃ³n:** `src/components/TurnoDisplay.js`  
**Tipo:** Display component  
**PropÃ³sito:** Card de cita en pantalla de turnos

### Props

```javascript
{
  cita: {
    id: string,
    nombre: string,
    idsap: number,
    motivo: string,
    estado: string,
    orden_llegada: number,
    emergency: boolean
  },
  esConsulta?: boolean  // Si estÃ¡ en consulta (vs en espera)
}
```

### Estructura (Grande para TV)

```jsx
<div className={`${styles.card} ${esConsulta ? styles.consulta : styles.espera}`}>
  <div className={styles.numero}>#{cita.orden_llegada}</div>
  <div className={styles.nombre}>{cita.nombre}</div>
  {cita.emergency && <div className={styles.emergencia}>ðŸš¨</div>}
  <div className={styles.motivo}>{cita.motivo}</div>
  <div className={styles.sap}>SAP: {cita.idsap}</div>
</div>
```

### Estilos (TV-friendly)

```css
.card {
  font-size: 28px;  /* Grande */
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.numero {
  font-size: 48px;
  font-weight: bold;
  color: #2563eb;
}

.nombre {
  font-size: 36px;
  font-weight: bold;
}

.espera {
  background-color: #f3f4f6;  /* Gris claro */
  border-left: 8px solid #3b82f6;
}

.consulta {
  background-color: #fed7aa;  /* Naranja luz */
  border-left: 8px solid #f97316;
}

.emergencia {
  font-size: 32px;
  animation: pulse 1s infinite;  /* Parpadea */
}
```

### âš ï¸ Consideraciones

- DiseÃ±o optimizado para lectura a distancia
- NÃºmeros grandes y contrastantes
- AnimaciÃ³n de emergencia llamativa

---

## 8. MedicoActivo

**UbicaciÃ³n:** `src/components/MedicoActivo.js`  
**Tipo:** Display component  
**PropÃ³sito:** Monitor de mÃ©dico actual en consulta

### Props

```javascript
{
  medico?: string,  // Nombre del mÃ©dico
  cita?: {
    nombre: string,
    motivo: string,
    check_in: string (ISO)
  }
}
```

### Estructura

```jsx
<div className={styles.medicoActive}>
  {medico ? (
    <>
      <h3>AHORA ATENDIENDO</h3>
      <p>Dr. {medico}</p>
      <div className={styles.paciente}>
        <p>{cita.nombre}</p>
        <p>{cita.motivo}</p>
        <p>Desde: {tiempoTranscurrido} min</p>
      </div>
    </>
  ) : (
    <p>Sin consultas activas</p>
  )}
</div>
```

### âš ï¸ Consideraciones

- Se actualiza via Realtime
- Timer puede actualizarse cada segundo (considerar performance)

---

## 9. FechaHoraInput

**UbicaciÃ³n:** `src/components/FechaHoraInput.js`  
**Tipo:** Input component  
**PropÃ³sito:** Selector de fecha + hora

### Props

```javascript
{
  value: string (ISO datetime),
  onChange: (value: string) => void,
  minDate?: Date,
  maxDate?: Date,
  disabled?: boolean
}
```

### Comportamiento

```javascript
// Input nativo HTML5:
<input type="datetime-local" />

// Valor: "2026-03-12T14:30"
// Output: ISO string
```

### Ejemplo de uso

```jsx
// En enfermeria.js (programar cita):
<FechaHoraInput
  value={nuevaFechaHora}
  onChange={setNuevaFechaHora}
  minDate={new Date()}
  placeholder="Selecciona fecha y hora"
/>
```

---

## 10. HoraInput

**UbicaciÃ³n:** `src/components/HoraInput.js`  
**Tipo:** Input component  
**PropÃ³sito:** Selector de solo hora

### Props

```javascript
{
  value: string (HH:MM),
  onChange: (value: string) => void,
  disabled?: boolean
}
```

### Comportamiento

```javascript
// Input nativo HTML5:
<input type="time" />

// Valor: "14:30"
```

---

## 11. UsersPanel

**UbicaciÃ³n:** `src/components/admin/UsersPanel.js`  
**Tipo:** Management component  
**PropÃ³sito:** CRUD de usuarios admin

### Props

```javascript
{
  users: User[],
  onUpdate: (id, data) => void,
  onDelete: (id) => void
}
```

### Estructura

```
Tabla de usuarios:
â”Œâ”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”
â”‚ SAP â”‚ Nombre       â”‚ Role  â”‚ Status   â”‚ Acciones â”‚
â”œâ”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¼â”€â”€â”€â”€â”€â”€â”¤
â”‚ 123 â”‚ Juan GarcÃ­a  â”‚ MÃ©dicoâ”‚ Activo   â”‚ Edit â”‚
â”‚     â”‚              â”‚       â”‚          â”‚ Del  â”‚
â””â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”˜

[+ Nuevo usuario]
```

---

## 12. CSVImportPanel

**UbicaciÃ³n:** `src/components/admin/CSVImportPanel.js`  
**Tipo:** File upload component  
**PropÃ³sito:** Importar usuarios desde CSV

### Props

```javascript
{
  onImport: (data: any[]) => Promise<void>
}
```

### Estructura

```
[Seleccione archivo CSV] [Subir]
Formato esperado:
  idsap,nombre,email

Ejemplo:
  12345678,Juan GarcÃ­a,juan@gmail.com
  87654321,MarÃ­a LÃ³pez,maria@gmail.com
```

### Parsing

```javascript
// Usa PapaParse para CSV
Papa.parse(file, {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: (results) => {
    // results.data = array de objetos
  }
})
```

---

## ðŸŽ¨ Patrones de Estilos

### CSS Modules

```javascript
// Importar:
import styles from '@/styles/Paciente.module.css'

// Usar:
<div className={styles.badge}>Contenido</div>

// MÃºltiples clases:
<div className={`${styles.badge} ${styles.badgeAtendido}`}>
```

### Colores EstÃ¡ndar

```css
--color-primary: #3f91e8;        /* Azul MedyLink */
--color-success: #10b981;        /* Verde */
--color-danger: #ef4444;         /* Rojo */
--color-warning: #f59e0b;        /* Amarillo */
--color-muted: #6b7280;          /* Gris */
```

### Breakpoints Responsive

```css
@media (max-width: 768px) {
  /* Mobile */
}

@media (min-width: 768px) and (max-width: 1024px) {
  /* Tablet */
}

@media (min-width: 1024px) {
  /* Desktop */
}
```

---

## ðŸ”„ Estado y Props Patterns

### Props Drilling

```javascript
// âŒ MALO: Pasar datos muchos niveles
<Page datos={datos}>
  <Section datos={datos}>
    <Component datos={datos} />
  </Section>
</Page>

// âœ… BUENO: Usar Context
<AuthProvider>
  <Component /> // Accede directamente con useAuth()
</AuthProvider>
```

### useCallback para Callbacks

```javascript
// âœ… BUENO: evita re-renders innecesarios
const handleClick = useCallback(() => {
  // acciÃ³n
}, [dependencies])

<Component onClick={handleClick} />
```

---

## ðŸ“š Recursos de Terceros

### Para usar estos componentes:

1. **Importar correctamente:**
   ```javascript
   import CitaForm from "@/components/CitaForm"
   import { supabase } from "@/lib/supabase"
   import { useAuth } from "@/context/AuthContext"
   ```

2. **Manejar loading states:**
   ```javascript
   {isLoading && <LoadingSpinner />}
   {error && <ErrorAlert message={error} />}
   {data && <DataDisplay data={data} />}
   ```

3. **Validar props:**
   ```javascript
   // PropTypes o TypeScript (no implementado)
   // Verificar que props requeridas existan
   ```

---

**Ãšltima actualizaciÃ³n:** 2026-03-12  
**VersiÃ³n de componentes:** 1.0

