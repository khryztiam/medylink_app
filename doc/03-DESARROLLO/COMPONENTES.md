# 🧩 Documentación de Componentes

**Stack:** React 19.2.4 + CSS Modules  
**Última actualización:** 2026-03-12

---

## 📋 Índice de Componentes

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

**Ubicación:** `src/components/AuthGate.js`  
**Tipo:** HOC (Higher Order Component)  
**Propósito:** Control de acceso por rol

### Props

```javascript
{
  children: ReactNode  // Contenido a proteger
}
```

### Comportamiento

```javascript
// Si loading → renderiza null (espera)
// Si NO user + ruta pública (/, /register) → renderiza children
// Si NO user + otra ruta → redirige a /
// Si user + ruta pública → redirige a home del role
// Si user + ruta no autorizada → muestra <NoAuth />
// Si user + ruta autorizada → renderiza children
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

### ⚠️ Consideraciones

- Verifica `router.pathname` exactamente (no fuzzy match)
- `loading` state es crítico para evitar flickering
- Uso de `shallow: true` en redirect es innecesario (Next.js 12+)

---

## 2. Layout

**Ubicación:** `src/components/Layout.jsx`  
**Tipo:** Componente de composición  
**Propósito:** Navegación lateral + estructura global

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
    [Nav según role]
    [User info]
    [Logout]
  </Sidebar>
  
  <main>
    <Header>
      Título página
      [Notificaciones]
    </Header>
    {children}
  </main>
</div>
```

### Navegación por Role

```javascript
import { useAuth } from '@/context/AuthContext';

// Cada role tiene menú diferente
const menuItems = {
  paciente: [
    { label: 'Mis citas', href: '/paciente', icon: '📋' },
    { label: 'Historial', href: '/paciente#historial', icon: '📊' },
  ],
  medico: [
    { label: 'Atender citas', href: '/medico', icon: '👨‍⚕️' },
    { label: 'Programadas', href: '/medico#programadas', icon: '📅' },
  ],
  // ... etc
}
```

### Responsive

- Desktop: Sidebar 250px fixed, main full width
- Mobile: Sidebar hamburger collapsible
- Tablets: Sidebar narrower

### ⚠️ Consideraciones

- `<Sidebar>` es componente externo (verificar import)
- `useRouter()` para detectar ruta activa
- Animaciones CSS para toggle sidebar

---

## 3. CitaForm

**Ubicación:** `src/components/CitaForm.js`  
**Tipo:** Form component con modal  
**Propósito:** Crear o editar citas

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
  motivo: string,        // Razón de visita
  idSAP: number,        // Identificador laboral
  emergency: boolean,    // ¿Es urgente?
  isss: boolean         // ¿Es consulta ISSS?
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

#### Enfermería/Admin/Supervisor
```javascript
// Estado al cargar:
setNombre('')  // Vacío
setIdSAP('')   // Editable
setRole('enfermeria')

// En form:
- Campo SAP: editable (con busqueda)
- Campo nombre: readonly (se rellena al escribir SAP)
- Acciones: [Crear] [Cancelar]

// Lo búsqueda:
- Busca en allowed_users por SAP
- Debounce 500ms
- Muestra error si no existe
```

### Validaciones

```javascript
if (!idsap.trim())
  throw new Error("Ingresa tu número SAP.")

if (password.length < 6)
  throw new Error("La contraseña debe tener al menos 6 caracteres.")

if (password !== confirmPassword)
  throw new Error("Las contraseñas no coinciden.")

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
    setMensaje({ texto: '✅ Cita creada', tipo: 'exito' })
    setIsModalOpen(false)
  } catch (err) {
    setMensaje({ texto: '❌ Error: ' + err.message, tipo: 'error' })
  }
}
```

### ⚠️ Consideraciones

- Debounce en búsqueda evita spam a BD
- SAP debe tener 8+ dígitos para buscar
- Email construcción: `SAP@yazaki.com` es hardcoded
- Toggle ISSS: verificar que se usa (nuevo campo)

---

## 4. DoctorPanel

**Ubicación:** `src/components/DoctorPanel.js`  
**Tipo:** Display component  
**Propósito:** Card de cita para médico

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
  onAtender: () => void,      // Botón "Atender"
  onFinalizar: () => void,    // Botón "Finalizar"
  isLoading?: boolean         // Estado de carga
}
```

### Estructura

```jsx
<div className={styles.doctorCard}>
  <div className={styles.header}>
    <span className={styles.numero}># {cita.orden_llegada}</span>
    <span className={styles.nombre}>{cita.nombre}</span>
    {cita.emergency && <span className={styles.emergencia}>🚨</span>}
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
  buttons.innerHTML = '⏳ Procesando...'
}
```

### Cálculo de Tiempo

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

### ⚠️ Consideraciones

- Tiempo se actualiza cada render (puede ser ineficiente)
- Mejor: usar `setInterval` si render es constante
- `emergency` es visual, no funcional

---

## 5. ConsultaCita

**Ubicación:** `src/components/ConsultaCita.js`  
**Tipo:** Display component  
**Propósito:** Detalle completo de una cita

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
  onClose?: () => void        // Si está en modal
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
    {cita.emergency && <p>⚠️ EMERGENCIA</p>}
    {cita.isss && <p>🏥 Consulta ISSS</p>}
  </section>
  
  <section>
    <h3>Timeline</h3>
    <p>Solicitud: {formatFecha(cita.created_at)}</p>
    <p>Programada: {formatFecha(cita.cita_programada)}</p>
    <p>Check-in: {formatFecha(cita.check_in)}</p>
    <p>Check-out: {formatFecha(cita.check_out)}</p>
  </section>
  
  <section>
    <h3>Médico</h3>
    <p>{cita.doctor_name || 'Pendiente de asignación'}</p>
  </section>
</div>
```

### Formateo de Fechas

```javascript
function formatFecha(fechaStr) {
  if (!fechaStr) return "—";
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

### ⚠️ Consideraciones

- No es interactivo (display only)
- Campos vacíos → "—"
- Formato de fecha locale-aware (es-SV = El Salvador)

---

## 6. EstadoConsulta

**Ubicación:** `src/components/EstadoConsulta.js`  
**Tipo:** Badge/label component  
**Propósito:** Mostrar estado visual de cita

### Props

```javascript
{
  estado: string  // "pendiente" | "programado" | "en espera" | "en consulta" | "atendido" | "cancelado"
}
```

### Mapeo de Estados

```javascript
const estadoMap = {
  "atendido": { color: "verde", icono: "✓", label: "Atendido" },
  "pendiente": { color: "amarillo", icono: "⏳", label: "Pendiente" },
  "programado": { color: "azul", icono: "📅", label: "Programado" },
  "en espera": { color: "naranja", icono: "⏸️", label: "En espera" },
  "en consulta": { color: "rojo", icono: "👨‍⚕️", label: "En consulta" },
  "cancelado": { color: "gris", icono: "✗", label: "Cancelado" }
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

### ⚠️ Consideraciones

- Componente "tonto" (no tiene estado)
- Super reutilizable
- Considerar internacionalización (i18n) para labels

---

## 7. TurnoDisplay

**Ubicación:** `src/components/TurnoDisplay.js`  
**Tipo:** Display component  
**Propósito:** Card de cita en pantalla de turnos

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
  esConsulta?: boolean  // Si está en consulta (vs en espera)
}
```

### Estructura (Grande para TV)

```jsx
<div className={`${styles.card} ${esConsulta ? styles.consulta : styles.espera}`}>
  <div className={styles.numero}>#{cita.orden_llegada}</div>
  <div className={styles.nombre}>{cita.nombre}</div>
  {cita.emergency && <div className={styles.emergencia}>🚨</div>}
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

### ⚠️ Consideraciones

- Diseño optimizado para lectura a distancia
- Números grandes y contrastantes
- Animación de emergencia llamativa

---

## 8. MedicoActivo

**Ubicación:** `src/components/MedicoActivo.js`  
**Tipo:** Display component  
**Propósito:** Monitor de médico actual en consulta

### Props

```javascript
{
  medico?: string,  // Nombre del médico
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

### ⚠️ Consideraciones

- Se actualiza via Realtime
- Timer puede actualizarse cada segundo (considerar performance)

---

## 9. FechaHoraInput

**Ubicación:** `src/components/FechaHoraInput.js`  
**Tipo:** Input component  
**Propósito:** Selector de fecha + hora

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

**Ubicación:** `src/components/HoraInput.js`  
**Tipo:** Input component  
**Propósito:** Selector de solo hora

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

**Ubicación:** `src/components/admin/UsersPanel.js`  
**Tipo:** Management component  
**Propósito:** CRUD de usuarios admin

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
┌─────┬──────────────┬───────┬──────────┬──────┐
│ SAP │ Nombre       │ Role  │ Status   │ Acciones │
├─────┼──────────────┼───────┼──────────┼──────┤
│ 123 │ Juan García  │ Médico│ Activo   │ Edit │
│     │              │       │          │ Del  │
└─────┴──────────────┴───────┴──────────┴──────┘

[+ Nuevo usuario]
```

---

## 12. CSVImportPanel

**Ubicación:** `src/components/admin/CSVImportPanel.js`  
**Tipo:** File upload component  
**Propósito:** Importar usuarios desde CSV

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
  12345678,Juan García,juan@gmail.com
  87654321,María López,maria@gmail.com
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

## 🎨 Patrones de Estilos

### CSS Modules

```javascript
// Importar:
import styles from '@/styles/Paciente.module.css'

// Usar:
<div className={styles.badge}>Contenido</div>

// Múltiples clases:
<div className={`${styles.badge} ${styles.badgeAtendido}`}>
```

### Colores Estándar

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

## 🔄 Estado y Props Patterns

### Props Drilling

```javascript
// ❌ MALO: Pasar datos muchos niveles
<Page datos={datos}>
  <Section datos={datos}>
    <Component datos={datos} />
  </Section>
</Page>

// ✅ BUENO: Usar Context
<AuthProvider>
  <Component /> // Accede directamente con useAuth()
</AuthProvider>
```

### useCallback para Callbacks

```javascript
// ✅ BUENO: evita re-renders innecesarios
const handleClick = useCallback(() => {
  // acción
}, [dependencies])

<Component onClick={handleClick} />
```

---

## 📚 Recursos de Terceros

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

**Última actualización:** 2026-03-12  
**Versión de componentes:** 1.0
