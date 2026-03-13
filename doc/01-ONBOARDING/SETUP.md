# 🚀 Guía de Setup y Flujo de Trabajo

**Última actualización:** 2026-03-12  
**Estado:** Listo para desarrollo

---

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Setup Inicial](#setup-inicial)
3. [Configuración de Supabase](#configuración-de-supabase)
4. [Desarrollo Local](#desarrollo-local)
5. [Flujo de Trabajo Git](#flujo-de-trabajo-git)
6. [Deploy a Producción](#deploy-a-producción)
7. [Troubleshooting](#troubleshooting)
8. [Mejores Prácticas](#mejores-prácticas)

---

## 📦 Requisitos Previos

### Sistema
- **Node.js:** 18.17+ (verificar con `node -v`)
- **npm:** 9+ (verificar con `npm -v`)
- **Git:** 2.30+ (verificar con `git --version`)
- **OS:** Windows/Mac/Linux

### Cuentas externas
- **Supabase:** Account + proyecto creado
- **GitHub:** Acceso al repositorio
- **npm:** Opcional (para publishes)

### Herramientas recomendadas
- **VS Code:** Editor principal
- **Prettier:** Formateo código
- **ESLint:** Linting
- **GitKraken:** Cliente Git (opcional)

---

## 🔧 Setup Inicial

### Paso 1: Clonar repositorio

```bash
git clone https://github.com/tu-org/control_medico.git
cd control_medico
```

### Paso 2: Instalar dependencias

```bash
npm install
# O si prefieres yarn:
yarn install
```

**Tiempo esperado:** 2-3 minutos (depende de velocidad internet)

### Paso 3: Crear archivo `.env.local`

```bash
# En raíz del proyecto:
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs... [copiar del dashboard]
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs... [copiar del dashboard  admin]
EOF

# En Windows PowerShell:
@"
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=anonkey...
SUPABASE_SERVICE_ROLE_KEY=servicekey...
"@ | Out-File .env.local -Encoding UTF8
```

**Verificar:** Archivo `.env.local` NO debe estar en git:
```bash
# Confirmar que está en .gitignore:
cat .gitignore | grep "\.env\.local"
# Output: .env.local
```

### Paso 4: Verificar instalación

```bash
npm run build
# Debe completarse sin errores

npm run dev
# Debe iniciar en http://localhost:3000
```

---

## 🔑 Configuración de Supabase

### 1. Obtener Credenciales

1. Ir a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Seleccionar proyecto
3. Settings → API → Copy URLs y Keys
   - `NEXT_PUBLIC_SUPABASE_URL` (público)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (público)
4. Settings → API → Service Role Key
   - `SUPABASE_SERVICE_ROLE_KEY` (secreto, solo backend)

### 2. Verificar Tablas (Schema)

**Necesarias:**

```sql
-- table: app_users
id (uuid, PK)
idsap (text, UNIQUE)
role (text)
status (boolean)
telegram_id (integer, nullable)
created_at (timestamp)

-- table: citas
id (uuid, PK)
idsap (integer)
nombre (text)
motivo (text)
estado (text)
check_in (timestamp, nullable)
check_out (timestamp, nullable)
cita_programada (timestamp, nullable)
programmer_at (timestamp, nullable)
emergency (boolean)
isss (boolean)
doctor_name (text, nullable)
orden_llegada (integer, nullable)
created_at (timestamp)
updated_at (timestamp)

-- table: allowed_users
idsap (text, PK)
nombre (text)
email (text, nullable)
role (text, nullable)
```

**Verificar en SQL editor:**
```bash
# Conectarse y correr:
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public'

# Debe listar: app_users, citas, allowed_users, ...
```

### 3. Implementar RLS (Security)

**CRÍTICO:** Sin RLS los datos están expuestos

```sql
-- Habilitar RLS en tablas
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;

-- (Ver detalles en SEGURIDAD.md)
```

### 4. Políticas de Acceso

```sql
-- Ejemplo: Usuario puede leer solo SUS citas
CREATE POLICY "Users read own citas"
ON citas FOR SELECT
USING (
  (SELECT idsap FROM app_users WHERE id = auth.uid())::INT = idsap
);

-- (Implementar todas las políticas según SEGURIDAD.md)
```

---

## 💻 Desarrollo Local

### Iniciar servidor

```bash
npm run dev
```

Acceso en `http://localhost:3000`

### Estructura de carpetas

```
src/
├── pages/           ← Rutas principales (editar páginas aquí)
├── components/      ← Componentes reutilizables
├── context/         ← Estado global (AuthContext)
├── lib/             ← Lógica (citasData, supabase client)
└── styles/          ← CSS Modules (uno por página)
```

### Workflow típico

#### 1. Crear feature nueva

```bash
git checkout -b feature/mi-feature
# O: git checkout -b feat/cambio-especifico
```

#### 2. Editar archivos

Ejemplo: Agregar campo a cita

```javascript
// 1. lib/citasData.js - agregar campo en insert/update
export async function agregarCita({ nombre, motivo, idSAP, emergency, isss, alergia }) {
  const { data, error } = await supabase
    .from('citas')
    .insert([{ 
      idSAP, 
      nombre, 
      motivo, 
      estado: 'pendiente', 
      emergency: !!emergency, 
      isss: !!isss,
      alergia: alergia || null  // ← Nuevo campo
    }])
}

// 2. components/CitaForm.js - agregar input
const [alergia, setAlergia] = useState('')

const handleSubmit = async (e) => {
  // ...
  await onSubmit({
    nombre,
    motivo,
    idSAP,
    emergency,
    isss,
    alergia  // ← Nuevo
  })
}

// En form:
<div className="pac-form-group">
  <label>Alergias (opcional)</label>
  <textarea
    value={alergia}
    onChange={(e) => setAlergia(e.target.value)}
    placeholder="Describe alergias conocidas..."
  />
</div>

// 3. pages/paciente.js - mostrar en historial
<td>{cita.alergia || '—'}</td>
```

#### 3. Testing manual

```bash
# En navegador:
- Acceder como paciente, crear cita, verificar que aparece en enfermeria
- Acceder como enfermeria, registrar cita, verificar que aparece en medico
- Acceder como medico, atender cita, finalizar
- Ver en supervisor que aparece en estadísticas
```

#### 4. Commit y push

```bash
git add src/
git commit -m "feat: agregar campo de alergias en citas"
# Mensajes de commit: usar conventional commits

git push origin feature/mi-feature
```

#### 5. Pull Request y Merge

- Crear PR en GitHub
- Esperar al menos 1 review
- Resolver conflictos si hay
- Mergear a `main`

---

## 🌳 Flujo de Trabajo Git

### Convenciones de Commits

```bash
# Formato:
git commit -m "type(scope): descripcion"

# Tipos:
feat:   Nueva funcionalidad
fix:    Arreglo de bug
docs:   Cambios en documentación
style:  Formateo de código (sin lógica)
refactor: Reorganización del código
perf:   Mejoras de performance
test:   Agregar/modificar tests
chore:  Actualizaciones de dependencias

# Ejemplos:
git commit -m "feat(paciente): agregar busqueda de citas por fecha"
git commit -m "fix(medico): corregir duracion de consulta"
git commit -m "docs: actualizar guia de setup"
```

### Rama principal: `main`

```bash
# main siempre está en estado deployable
# Nunca committear directamente a main

# Solo mergear via PR con review
```

### Rama de desarrollo: `develop` (opcional)

```bash
# Si quieres staging antes de production:
git checkout -b develop
# Mergear PRs aquí primero
# Luego mergear develop → main
```

### Gestión de conflictos

```bash
# Si hay conflictos al mergear:
git merge feature/mi-feature

# (Verás archivos con conflictos)
# Abre los archivos y resuelve manualmente

# Busca:
<<<<<<< HEAD
código actual
=======
código entrante
>>>>>>> feature/mi-feature

# Resuelve eligiendo uno o combinando

git add .
git commit -m "resolve: merge conflict in citasData.js"
git push
```

---

## 🌐 Deploy a Producción

### Pre-deploy checklist

- [ ] Todo en `main` está testeado
- [ ] `npm run build` pasa sin errores
- [ ] `npm run lint` pasa sin warnings críticas
- [ ] Variables de env correctas en hosting
- [ ] Base de datos migrada
- [ ] RLS activado y configurado

### Opciones de Hosting

#### Opción 1: Vercel (Recomendado para Next.js)

```bash
# 1. Instalar CLI
npm i -g vercel

# 2. Link proyecto
vercel link

# 3. Configurar env vars
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY

# 4. Deploy
vercel deploy --prod
```

**Ventajas:**
- Integración automática con GitHub
- Deploys automáticos en cada push a main
- Preview URLs para PRs
- Analytics incluido

#### Opción 2: App Platform de Supabase

```bash
# Supabase puede hospedar directamente
# Ir a: https://supabase.com/dashboard
# → Deployments → Connect GitHub
```

#### Opción 3: Servidor propio (VPS)

```bash
# 1. SSH al servidor
ssh root@tu-servidor

# 2. Clonar repo
git clone https://github.com/tu-org/control_medico.git

# 3. Instalar dependencias y build
cd control_medico
npm install
npm run build

# 4. Usar PM2 para mantener proceso vivo
npm i -g pm2
pm2 start "npm run start" --name "medylink"
pm2 startup
pm2 save

# 5. Configurar Nginx como reverse proxy
# (ver documentación de Nginx)
```

---

## 🔧 Troubleshooting

### Error: "Module not found"

```
Error: Cannot find module '@/components/...'
```

**Solución:**
```bash
# Verificar que jsconfig.json tiene:
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}

# Reiniciar servidor:
npm run dev (CTRL+C y volver a iniciar)
```

### Error: "NEXT_PUBLIC_SUPABASE_URL is not defined"

**Solución:**
```bash
# Verificar que .env.local existe en raíz:
ls -la .env.local  # Debe existir

# Verificar contenido:
cat .env.local

# Debe tener:
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Reiniciar servidor
```

### Error: "RLS policy violation"

```
Error: new row violates row-level security policy
```

**Solución:**
```sql
-- Verificar que tienes RLS policy permitiendo la acción:
SELECT * FROM pg_policies 
WHERE tablename = 'citas'

-- Si está vacío, agregar políticas:
CREATE POLICY "Allow own user actions" 
ON citas 
USING (true)  -- Temporal para debug
WITH CHECK (true)

-- ⚠️ NUNCA dejar así en producción
-- Ver SEGURIDAD.md para policies correctas
```

### Error: "Session token missing"

```
Error: JWT expired
```

**Solución:**
```bash
# 1. Limpiar localStorage:
# Abre DevTools → Application → localStorage → Delete all

# 2. Refrescar página
# 3. Login de nuevo

# Si persiste: regenerar Supabase keys
```

### Performance lento

```bash
# 1. Revisar Network tab en DevTools
# - Identificar requests lentos
# - Verificar tamaño de assets

# 2. Ejecutar Lighthouse
# - DevTools → Lighthouse → Generate report

# 3. Comunes:
# - Queries N+1 en Supabase
# - Imágenes sin optimizar
# - Components sin useMemo/useCallback
```

### Audio no funciona

```javascript
// En medico.js / enfermeria.js
// Problema: Navegador bloquea audio hasta interacción

// Solución ya implementada:
// - desbloquearAudio() en primer click
// - Reproducir silencio para desbloquear contexto

// Debug:
- Abre DevTools → Console
- Verifica que archivo existe: /public/doorbell.mp3
- Prueba: new Audio("/doorbell.mp3").play()
```

---

## ✅ Mejores Prácticas

### 1. Nomenclatura de Variables

```javascript
// ✅ BUENO: nombres descriptivos
const citaActiva = citas.find(c => c.estado === 'activo')
const calcularTiempoConsulta = (checkIn, checkOut) => { ... }
const [isLoading, setIsLoading] = useState(false)

// ❌ MALO: nombres cortos o genéricos
const ca = citas.find(c => c.estado === 'activo')
const calc = (a, b) => { ... }
const [loading, setLoading] = useState(false)
```

### 2. Manejo de Errores

```javascript
// ✅ BUENO: Try/catch específico con logging
try {
  const { data, error } = await supabase.from('citas').select('*')
  
  if (error) {
    console.error('Failed to fetch citas:', error)
    setError('No se pudieron cargar las citas. Intenta de nuevo.')
    return
  }
  
  setCitas(data)
} catch (err) {
  console.error('Unexpected error:', err)
  setError('Error inesperado. Contacta support.')
}

// ❌ MALO: Ignorar errores
const data = await supabase.from('citas').select('*')
setCitas(data)  // ¿Qué si hay error?
```

### 3. Performance: useMemo y useCallback

```javascript
// ✅ BUENO: Memoizar funciones y cálculos costosos
const load = useCallback(async () => {
  const todas = await getTodasLasCitas()
  setCitas(todas)
}, [])

const citasFiltradasOrdenadas = useMemo(() => {
  return citas
    .filter(c => c.estado === 'activo')
    .sort((a, b) => a.orden_llegada - b.orden_llegada)
}, [citas])

// ❌ MALO: Re-crear funciones en cada render
const load = async () => { ... }  // Se crea cada render

const citasOrdenadas = citas.sort((a, b) => ...)  // En cada render
```

### 4. Evitar Prop Drilling

```javascript
// ❌ MALO: Pasar datos muchos niveles
<Page citas={citas}>
  <Section citas={citas}>
    <Table citas={citas} />
  </Section>
</Page>

// ✅ BUENO: Usar Context
<CitasProvider>
  <Page>
    <Section>
      <Table />  {/* Accede con useCitas() */}
    </Section>
  </Page>
</CitasProvider>
```

### 5. Async/Await vs Promises

```javascript
// ✅ BUENO: Async/await (más legible)
const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    const result = await agregarCita(data)
    setSuccess('Cita creada')
  } catch (err) {
    setError(err.message)
  }
}

// ⚠️ También válido pero menos legible:
const handleSubmit = (e) => {
  e.preventDefault()
  agregarCita(data)
    .then(result => setSuccess('Cita creada'))
    .catch(err => setError(err.message))
}
```

### 6. Limpieza de Efectos

```javascript
// ✅ BUENO: Cleanup en useEffect
useEffect(() => {
  const canal = supabase
    .channel('realtime-citas')
    .on('postgres_changes', { ... }, handler)
    .subscribe()

  return () => {
    supabase.removeChannel(canal)  // ← CRÍTICO: cleanup
  }
}, [])

// ❌ MALO: Sin cleanup → memory leaks
useEffect(() => {
  const canal = supabase
    .channel('realtime-citas')
    .on('postgres_changes', { ... }, handler)
    .subscribe()
  // Falta return () => { ... }
}, [])
```

### 7. Comentarios Útiles

```javascript
// ✅ BUENO: Comentarios que explican el "por qué"
// Usar citasConocidasRef para detectar citas genuinamente nuevas
// sin stale closure en Realtime subscriptions
const citasConocidasRef = useRef(new Set())

// ❌ MALO: Comentarios obvios
const user = null  // Inicializar user como null
const [count, setCount] = useState(0)  // Estado de contador
```

### 8. Testing Manual

Antes de cada commit:

```bash
# 1. Linter
npm run lint

# 2. Build
npm run build

# 3. Test manual en navegador
# - Probar el flujo que modificaste
# - Verificar en todos los roles relevantes
# - Revisar console de DevTools (no errors)

# 4. Revisar archivo
# - Código limpio sin console.log
# - Sin typos
# - Indentación correcta
```

### 9. Documentación Inline

```javascript
/**
 * Obtiene todas las citas del día actual
 * @returns {Promise<Cita[]>} Array de citas
 * @throws {Error} Si hay error en Supabase
 */
export async function getCitasHoy() {
  // ...
}
```

### 10. Env Variables

```bash
# NUNCA commitear valores reales
NEXT_PUBLIC_SUPABASE_URL  ← Público (variable name)
NEXT_PUBLIC_SUPABASE_ANON_KEY  ← Público (variable name)
SUPABASE_SERVICE_ROLE_KEY  ← Secreto (NUNCA en .env.local en git)

# Usar .env.local (gitignored) para desarrollo local
# En producción: configurar en hosting (Vercel, etc)
```

---

## 📞 Contacto y Soporte

- **Documentación:** Ver README.md
- **Issues:** GitHub Issues (con labels)
- **Security:** security@medylink.local
- **General:** slack #medylink-dev

---

**Última actualización:** 2026-03-12  
**Siguiente revisión:** 2026-04-12
