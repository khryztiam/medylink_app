# 📑 Mapa de Documentación - MedyLink

**Estructura visual para navegar rápidamente la documentación en GitHub**

---

## 🗂️ Estructura de Carpetas

```
control_medico/
├── README.md                          ← PUNTO DE ENTRADA DEL REPO
│
├── doc/                               ← 📚 DOCUMENTACIÓN ORGANIZADA
│   │
│   ├── README.md                      ← 🏠 INICIO: Índice y navegación
│   ├── INDICE-ORIGINAL.md             ← Mapa detallado (referencia)
│   │
│   ├── 00-INICIO-RAPIDO/
│   │   └── RESUMEN.md                 ← Para ejecutivos (5 min) 👔
│   │
│   ├── 01-ONBOARDING/
│   │   └── SETUP.md                   ← Guía setup + workflow (90 min) 👨‍💻
│   │
│   ├── 02-GUIA-VISTAS/
│   │   └── PAGES.md                   ← Cada view del sistema (45 min) 📊
│   │
│   ├── 03-DESARROLLO/
│   │   ├── ESTRUCTURA.md              ← Mapa del código (30 min) 🗺️
│   │   └── COMPONENTES.md             ← Componentes React (45 min) 🧩
│   │
│   ├── 04-ARQUITECTURA/
│   │   └── ARQUITECTURA.md            ← Stack + flujos (45 min) 🏗️
│   │
│   └── 05-SEGURIDAD/
│       └── SEGURIDAD.md               ← Auditoría + vulnerabilidades (45 min) 🔒
│
├── src/                               ← 💻 CÓDIGO FUENTE
├── public/                            ← 📦 ASSETS
└── ... (otros archivos de config)
```

---

## 🎯 Navegación Rápida

### 🏠 Comienzo: Lee esto primero

```
1. README.md (este archivo)
2. doc/README.md
```

### 👔 Ejecutivos / Stakeholders (5 min)
```
doc/00-INICIO-RAPIDO/RESUMEN.md
```

### 🆕 Nuevo Developer (1 día)
```
1. doc/README.md § Ruta "Para Nuevo Developer"
2. doc/01-ONBOARDING/SETUP.md
3. doc/02-GUIA-VISTAS/PAGES.md
4. doc/03-DESARROLLO/ESTRUCTURA.md
```

### 👨‍💻 Backend Developer
```
1. doc/01-ONBOARDING/SETUP.md
2. doc/04-ARQUITECTURA/ARQUITECTURA.md
3. doc/05-SEGURIDAD/SEGURIDAD.md
4. doc/03-DESARROLLO/ESTRUCTURA.md
```

### 🎨 Frontend Developer
```
1. doc/01-ONBOARDING/SETUP.md
2. doc/03-DESARROLLO/COMPONENTES.md
3. doc/02-GUIA-VISTAS/PAGES.md
4. doc/03-DESARROLLO/ESTRUCTURA.md
```

### 🏗️ Tech Lead / Arquitecto
```
1. doc/04-ARQUITECTURA/ARQUITECTURA.md
2. doc/05-SEGURIDAD/SEGURIDAD.md
3. doc/03-DESARROLLO/ESTRUCTURA.md
```

### 🔐 Security / DevOps
```
1. doc/05-SEGURIDAD/SEGURIDAD.md
2. doc/04-ARQUITECTURA/ARQUITECTURA.md
3. doc/01-ONBOARDING/SETUP.md § Deploy
```

### 📊 Product Manager
```
1. doc/00-INICIO-RAPIDO/RESUMEN.md
2. doc/02-GUIA-VISTAS/PAGES.md
```

---

## 📋 Descripción de Carpetas

### 📂 00-INICIO-RAPIDO/
**Para:** Ejecutivos, stakeholders  
**Contenido:**
- RESUMEN.md (5 min read)
  - Qué es MedyLink
  - Estado técnico
  - Inversión y roadmap
  - Checklist de producción

---

### 📂 01-ONBOARDING/
**Para:** Nuevos developers  
**Contenido:**
- SETUP.md (90 min read)
  - Requisitos y setup paso a paso
  - Configuración de Supabase
  - Desarrollo local
  - Workflow Git (branches, commits)
  - Deploy a producción (Vercel, VPS)
  - Troubleshooting común
  - Mejores prácticas

---

### 📂 02-GUIA-VISTAS/
**Para:** Product managers, diseñadores, frontend  
**Contenido:**
- PAGES.md (45 min read)
  - Login/Registro
  - Portal Paciente
  - Panel Médico
  - Gestión Enfermería
  - Dashboard Supervisor
  - Pantalla de Turnos (TV)
  - Flujos de usuario por página

---

### 📂 03-DESARROLLO/
**Para:** Developers (front/backend)  
**Contenido:**
- ESTRUCTURA.md (30 min read)
  - Árbol de carpetas comentado
  - Qué importar de dónde
  - Flujos por archivo
  - Estructura de datos

- COMPONENTES.md (45 min read)
  - 12 componentes documentados
  - Props requeridas
  - Ejemplos de uso
  - Estados visuales
  - Considraciones para terceros

---

### 📂 04-ARQUITECTURA/
**Para:** Tech leads, arquitectos, developers experimentados  
**Contenido:**
- ARQUITECTURA.md (45 min read)
  - Stack: Next.js 16 + React 19 + Supabase
  - Estructura del proyecto
  - Flujo de autenticación
  - Modelos de datos (app_users, citas, allowed_users)
  - Flujos principales (crear cita, atender, supervición)
  - Análisis de código (patrones, fortalezas, debilidades)

---

### 📂 05-SEGURIDAD/
**Para:** DevOps, security engineers, tech leads  
**Contenido:**
- SEGURIDAD.md (45 min read)
  - Auditoría completa
  - 3 vulnerabilidades CRÍTICAS
  - 4 vulnerabilidades ALTO riesgo
  - 5 vulnerabilidades MEDIO riesgo
  - Código de ataque (escenarios)
  - Soluciones detalladas
  - Checklist de remediación
  - Plan de implementación

---

## 🔗 Links Directos

### Por Documento

| Documento | Ubicación | Lectura |
|-----------|-----------|---------|
| RESUMEN | [doc/00-INICIO-RAPIDO/RESUMEN.md](./doc/00-INICIO-RAPIDO/RESUMEN.md) | 5 min |
| SETUP | [doc/01-ONBOARDING/SETUP.md](./doc/01-ONBOARDING/SETUP.md) | 90 min |
| PAGES | [doc/02-GUIA-VISTAS/PAGES.md](./doc/02-GUIA-VISTAS/PAGES.md) | 45 min |
| ESTRUCTURA | [doc/03-DESARROLLO/ESTRUCTURA.md](./doc/03-DESARROLLO/ESTRUCTURA.md) | 30 min |
| COMPONENTES | [doc/03-DESARROLLO/COMPONENTES.md](./doc/03-DESARROLLO/COMPONENTES.md) | 45 min |
| ARQUITECTURA | [doc/04-ARQUITECTURA/ARQUITECTURA.md](./doc/04-ARQUITECTURA/ARQUITECTURA.md) | 45 min |
| SEGURIDAD | [doc/05-SEGURIDAD/SEGURIDAD.md](./doc/05-SEGURIDAD/SEGURIDAD.md) | 45 min |
| ÍNDICE DETALLADO | [doc/INDICE-ORIGINAL.md](./doc/INDICE-ORIGINAL.md) | 10 min |

---

## ⭐ Documentos "Imprescindibles"

### Por Criticidad

🔴 **LEER PRIMERO** (Bloqueante)
```
1. doc/05-SEGURIDAD/SEGURIDAD.md § Hallazgos Críticos
2. doc/00-INICIO-RAPIDO/RESUMEN.md
```

🟠 **IMPORTANTE** (Antes de empezar a desarrollar)
```
3. doc/01-ONBOARDING/SETUP.md § Setup Inicial
4. doc/04-ARQUITECTURA/ARQUITECTURA.md § Flujo de Autenticación
```

🟡 **RECOMENDADO** (Para productividad)
```
5. doc/03-DESARROLLO/ESTRUCTURA.md (si gusta navegar código)
6. doc/03-DESARROLLO/COMPONENTES.md (si haces front)
7. doc/02-GUIA-VISTAS/PAGES.md (si haces PM)
```

---

## 📊 Estadísticas

| Métrica | Valor |
|---------|-------|
| Documentos | 8 |
| Líneas totales | ~3,500 |
| Carpetas | 6 |
| Cobertura | 100% del sistema |
| Tiempo de lectura completa | 4-6 horas |
| Última actualización | 2026-03-12 |

---

## 🎓 Tiempo de Lectura por Rol

| Rol | Tiempo | Documentos |
|-----|--------|-----------|
| Ejecutivo | 5 min | 1 |
| PM | 15-20 min | 2 |
| Nuevo Dev | 6-8 horas | Todos |
| Frontend Dev | 2-3 horas | 4 |
| Backend Dev | 2-3 horas | 4 |
| Tech Lead | 2-3 horas | 4 |
| Security Eng | 1.5 horas | 2 |

---

## 💡 Consejos de Navegación

### En GitHub

1. **Abre `doc/README.md` primero**
   - Tiene navegación interactiva
   - Rutas personalizadas por rol
   - Links a cada documento

2. **Usa Ctrl+F para buscar**
   - Busca palabra clave en documento actual
   - "RLS" en SEGURIDAD.md
   - "CitaForm" en COMPONENTES.md

3. **Sigue los índices internos**
   - Cada documento tiene `## 📋 Índice` arriba
   - Click en sección te lleva directamente

### En tu IDE

```bash
# Abrir documentación en VS Code
code doc/

# Buscar en todos los documentos
ctrl+shift+f "vulnerable"

# Abrir documento específico
ctrl+p SEGURIDAD.md
```

---

## 🔄 Flujo Recomendado

```
START
  ↓
¿Eres ejecutivo?
  ├─ SÍ  → doc/00-INICIO-RAPIDO/RESUMEN.md → FIN
  └─ NO  ↓
¿Es tu primer día?
  ├─ SÍ  → doc/README.md (Ruta Nuevo Dev) → Sigue instrucciones
  └─ NO  ↓
¿Qué necesitas?
  ├─ Setup/ambiente  → doc/01-ONBOARDING/SETUP.md
  ├─ Entender vistas  → doc/02-GUIA-VISTAS/PAGES.md
  ├─ Componentes  → doc/03-DESARROLLO/COMPONENTES.md
  ├─ Mapa código  → doc/03-DESARROLLO/ESTRUCTURA.md
  ├─ Architecture  → doc/04-ARQUITECTURA/ARQUITECTURA.md
  └─ Seguridad  → doc/05-SEGURIDAD/SEGURIDAD.md
```

---

## 📞 Soporte

- 📖 **Documentación:** Este archivo + carpeta `doc/`
- 🐛 **Issues:** GitHub Issues con labels
- 🔒 **Seguridad:** security@medylink.local (NO público)
- 💬 **Chat:** Slack #medylink-dev

---

## ✅ Última Validación

- ✅ Documentos migrados a `doc/`
- ✅ Organización lógica por carpetas
- ✅ README.md actualizado
- ✅ Índices y navegación funcionales
- ✅ Links internos actualizados
- ✅ Estructura lista para GitHub

---

**Estado:** ✨ Documentación completamente reorganizada  
**Última revisión:** 2026-03-12  
**Próximo paso:** Compartir con el equipo + crear issues para seguridad

---

### 🎯 Resumen Ejecutivo

**Esta documentación está lista para:**
- ✅ Compartir en GitHub
- ✅ Onboarding de nuevos developers
- ✅ Auditoría de seguridad
- ✅ Decisiones técnicas
- ✅ Terceros y partners

**No olvides leer:** [doc/05-SEGURIDAD/SEGURIDAD.md](./doc/05-SEGURIDAD/SEGURIDAD.md) 🔒
