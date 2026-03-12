# ðŸš€ GuÃ­a de Setup y Flujo de Trabajo

**Ãšltima actualizaciÃ³n:** 2026-03-12  
**Estado:** Listo para desarrollo

---

## ðŸ“‹ Ãndice

1. [Requisitos Previos](#requisitos-previos)
2. [Setup Inicial](#setup-inicial)
3. [ConfiguraciÃ³n de Supabase](#configuraciÃ³n-de-supabase)
4. [Desarrollo Local](#desarrollo-local)
5. [Flujo de Trabajo Git](#flujo-de-trabajo-git)
6. [Deploy a ProducciÃ³n](#deploy-a-producciÃ³n)
7. [Troubleshooting](#troubleshooting)
8. [Mejores PrÃ¡cticas](#mejores-prÃ¡cticas)

---

## ðŸ“¦ Requisitos Previos

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
- **Prettier:** Formateo cÃ³digo
- **ESLint:** Linting
- **GitKraken:** Cliente Git (opcional)

---

## ðŸ”§ Setup Inicial

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
# En raÃ­z del proyecto:
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
# Confirmar que estÃ¡ en .gitignore:
cat .gitignore | grep "\.env\.local"
# Output: .env.local
```

### Paso 4: Verificar instalaciÃ³n

```bash
npm run build
# Debe completarse sin errores

npm run dev
# Debe iniciar en http://localhost:3000
```

---

## ðŸ”‘ ConfiguraciÃ³n de Supabase

### 1. Obtener Credenciales

1. Ir a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Seleccionar proyecto
3. Settings â†’ API â†’ Copy URLs y Keys
   - `NEXT_PUBLIC_SUPABASE_URL` (pÃºblico)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (pÃºblico)
4. Settings â†’ API â†’ Service Role Key
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

**CRÃTICO:** Sin RLS los datos estÃ¡n expuestos

```sql
-- Habilitar RLS en tablas
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;

-- (Ver detalles en SEGURIDAD.md)
```

### 4. PolÃ­ticas de Acceso

```sql
-- Ejemplo: Usuario puede leer solo SUS citas
CREATE POLICY "Users read own citas"
ON citas FOR SELECT
USING (
  (SELECT idsap FROM app_users WHERE id = auth.uid())::INT = idsap
);

-- (Implementar todas las polÃ­ticas segÃºn SEGURIDAD.md)
```

---

## ðŸ’» Desarrollo Local

### Iniciar servidor

```bash
npm run dev
```

Acceso en `http://localhost:3000`

### Estructura de carpetas

```
src/
â”œâ”€â”€ pages/           â† Rutas principales (editar pÃ¡ginas aquÃ­)
â”œâ”€â”€ components/      â† Componentes reutilizables
â”œâ”€â”€ context/         â† Estado global (AuthContext)
â”œâ”€â”€ lib/             â† LÃ³gica (citasData, supabase client)
â””â”€â”€ styles/          â† CSS Modules (uno por pÃ¡gina)
```

### Workflow tÃ­pico

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
      alergia: alergia || null  // â† Nuevo campo
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
    alergia  // â† Nuevo
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
<td>{cita.alergia || 'â€”'}</td>
```

#### 3. Testing manual

```bash
# En navegador:
- Acceder como paciente, crear cita, verificar que aparece en enfermeria
- Acceder como enfermeria, registrar cita, verificar que aparece en medico
- Acceder como medico, atender cita, finalizar
- Ver en supervisor que aparece en estadÃ­sticas
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

## ðŸŒ³ Flujo de Trabajo Git

### Convenciones de Commits

```bash
# Formato:
git commit -m "type(scope): descripcion"

# Tipos:
feat:   Nueva funcionalidad
fix:    Arreglo de bug
docs:   Cambios en documentaciÃ³n
style:  Formateo de cÃ³digo (sin lÃ³gica)
refactor: ReorganizaciÃ³n del cÃ³digo
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
# main siempre estÃ¡ en estado deployable
# Nunca committear directamente a main

# Solo mergear via PR con review
```

### Rama de desarrollo: `develop` (opcional)

```bash
# Si quieres staging antes de production:
git checkout -b develop
# Mergear PRs aquÃ­ primero
# Luego mergear develop â†’ main
```

### GestiÃ³n de conflictos

```bash
# Si hay conflictos al mergear:
git merge feature/mi-feature

# (VerÃ¡s archivos con conflictos)
# Abre los archivos y resuelve manualmente

# Busca:
<<<<<<< HEAD
cÃ³digo actual
=======
cÃ³digo entrante
>>>>>>> feature/mi-feature

# Resuelve eligiendo uno o combinando

git add .
git commit -m "resolve: merge conflict in citasData.js"
git push
```

---

## ðŸŒ Deploy a ProducciÃ³n

### Pre-deploy checklist

- [ ] Todo en `main` estÃ¡ testeado
- [ ] `npm run build` pasa sin errores
- [ ] `npm run lint` pasa sin warnings crÃ­ticas
- [ ] Variables de env correctas en hosting
- [ ] Base de datos migrada
- [ ] RLS activado y configurado

### Opciones de Hosting

#### OpciÃ³n 1: Vercel (Recomendado para Next.js)

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
- IntegraciÃ³n automÃ¡tica con GitHub
- Deploys automÃ¡ticos en cada push a main
- Preview URLs para PRs
- Analytics incluido

#### OpciÃ³n 2: App Platform de Supabase

```bash
# Supabase puede hospedar directamente
# Ir a: https://supabase.com/dashboard
# â†’ Deployments â†’ Connect GitHub
```

#### OpciÃ³n 3: Servidor propio (VPS)

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
# (ver documentaciÃ³n de Nginx)
```

---

## ðŸ”§ Troubleshooting

### Error: "Module not found"

```
Error: Cannot find module '@/components/...'
```

**SoluciÃ³n:**
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

**SoluciÃ³n:**
```bash
# Verificar que .env.local existe en raÃ­z:
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

**SoluciÃ³n:**
```sql
-- Verificar que tienes RLS policy permitiendo la acciÃ³n:
SELECT * FROM pg_policies 
WHERE tablename = 'citas'

-- Si estÃ¡ vacÃ­o, agregar polÃ­ticas:
CREATE POLICY "Allow own user actions" 
ON citas 
USING (true)  -- Temporal para debug
WITH CHECK (true)

-- âš ï¸ NUNCA dejar asÃ­ en producciÃ³n
-- Ver SEGURIDAD.md para policies correctas
```

### Error: "Session token missing"

```
Error: JWT expired
```

**SoluciÃ³n:**
```bash
# 1. Limpiar localStorage:
# Abre DevTools â†’ Application â†’ localStorage â†’ Delete all

# 2. Refrescar pÃ¡gina
# 3. Login de nuevo

# Si persiste: regenerar Supabase keys
```

### Performance lento

```bash
# 1. Revisar Network tab en DevTools
# - Identificar requests lentos
# - Verificar tamaÃ±o de assets

# 2. Ejecutar Lighthouse
# - DevTools â†’ Lighthouse â†’ Generate report

# 3. Comunes:
# - Queries N+1 en Supabase
# - ImÃ¡genes sin optimizar
# - Components sin useMemo/useCallback
```

### Audio no funciona

```javascript
// En medico.js / enfermeria.js
// Problema: Navegador bloquea audio hasta interacciÃ³n

// SoluciÃ³n ya implementada:
// - desbloquearAudio() en primer click
// - Reproducir silencio para desbloquear contexto

// Debug:
- Abre DevTools â†’ Console
- Verifica que archivo existe: /public/doorbell.mp3
- Prueba: new Audio("/doorbell.mp3").play()
```

---

## âœ… Mejores PrÃ¡cticas

### 1. Nomenclatura de Variables

```javascript
// âœ… BUENO: nombres descriptivos
const citaActiva = citas.find(c => c.estado === 'activo')
const calcularTiempoConsulta = (checkIn, checkOut) => { ... }
const [isLoading, setIsLoading] = useState(false)

// âŒ MALO: nombres cortos o genÃ©ricos
const ca = citas.find(c => c.estado === 'activo')
const calc = (a, b) => { ... }
const [loading, setLoading] = useState(false)
```

### 2. Manejo de Errores

```javascript
// âœ… BUENO: Try/catch especÃ­fico con logging
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

// âŒ MALO: Ignorar errores
const data = await supabase.from('citas').select('*')
setCitas(data)  // Â¿QuÃ© si hay error?
```

### 3. Performance: useMemo y useCallback

```javascript
// âœ… BUENO: Memoizar funciones y cÃ¡lculos costosos
const load = useCallback(async () => {
  const todas = await getTodasLasCitas()
  setCitas(todas)
}, [])

const citasFiltradasOrdenadas = useMemo(() => {
  return citas
    .filter(c => c.estado === 'activo')
    .sort((a, b) => a.orden_llegada - b.orden_llegada)
}, [citas])

// âŒ MALO: Re-crear funciones en cada render
const load = async () => { ... }  // Se crea cada render

const citasOrdenadas = citas.sort((a, b) => ...)  // En cada render
```

### 4. Evitar Prop Drilling

```javascript
// âŒ MALO: Pasar datos muchos niveles
<Page citas={citas}>
  <Section citas={citas}>
    <Table citas={citas} />
  </Section>
</Page>

// âœ… BUENO: Usar Context
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
// âœ… BUENO: Async/await (mÃ¡s legible)
const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    const result = await agregarCita(data)
    setSuccess('Cita creada')
  } catch (err) {
    setError(err.message)
  }
}

// âš ï¸ TambiÃ©n vÃ¡lido pero menos legible:
const handleSubmit = (e) => {
  e.preventDefault()
  agregarCita(data)
    .then(result => setSuccess('Cita creada'))
    .catch(err => setError(err.message))
}
```

### 6. Limpieza de Efectos

```javascript
// âœ… BUENO: Cleanup en useEffect
useEffect(() => {
  const canal = supabase
    .channel('realtime-citas')
    .on('postgres_changes', { ... }, handler)
    .subscribe()

  return () => {
    supabase.removeChannel(canal)  // â† CRÃTICO: cleanup
  }
}, [])

// âŒ MALO: Sin cleanup â†’ memory leaks
useEffect(() => {
  const canal = supabase
    .channel('realtime-citas')
    .on('postgres_changes', { ... }, handler)
    .subscribe()
  // Falta return () => { ... }
}, [])
```

### 7. Comentarios Ãštiles

```javascript
// âœ… BUENO: Comentarios que explican el "por quÃ©"
// Usar citasConocidasRef para detectar citas genuinamente nuevas
// sin stale closure en Realtime subscriptions
const citasConocidasRef = useRef(new Set())

// âŒ MALO: Comentarios obvios
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
# - CÃ³digo limpio sin console.log
# - Sin typos
# - IndentaciÃ³n correcta
```

### 9. DocumentaciÃ³n Inline

```javascript
/**
 * Obtiene todas las citas del dÃ­a actual
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
NEXT_PUBLIC_SUPABASE_URL  â† PÃºblico (variable name)
NEXT_PUBLIC_SUPABASE_ANON_KEY  â† PÃºblico (variable name)
SUPABASE_SERVICE_ROLE_KEY  â† Secreto (NUNCA en .env.local en git)

# Usar .env.local (gitignored) para desarrollo local
# En producciÃ³n: configurar en hosting (Vercel, etc)
```

---

## ðŸ“ž Contacto y Soporte

- **DocumentaciÃ³n:** Ver README.md
- **Issues:** GitHub Issues (con labels)
- **Security:** security@medylink.local
- **General:** slack #medylink-dev

---

**Ãšltima actualizaciÃ³n:** 2026-03-12  
**Siguiente revisiÃ³n:** 2026-04-12

