# 📑 ÍNDICE DE DOCUMENTACIÓN - MedyLink

**Navega rápidamente a la documentación que necesitas**

---

## 🎯 Encuentra tu Documento

### 👔 Ejecutivos / Stakeholders
**¿Cuál es el estado del proyecto? ¿Cuántas horas quedan?**

1. **[RESUMEN.md](./RESUMEN.md)** ⭐ **EMPIEZA AQUÍ**
   - Qué es MedyLink
   - Estado técnico y checklist de producción
   - Inversión y roadmap
   - **Tiempo:** 5 minutos

2. **[README.md](./README.md)**
   - Descripción general
   - Quick start
   - Glosario de términos
   - **Tiempo:** 10 minutos

---

### 🏗️ Arquitecto / Tech Lead
**¿Cómo está construido? ¿Qué patrones usa?**

1. **[ARQUITECTURA.md](./ARQUITECTURA.md)** ⭐ **LECTURA PRINCIPAL**
   - Stack tecnológico completo
   - Estructura de carpetas
   - Flujo de autenticación
   - Modelos de datos
   - Análisis de código + fortalezas/debilidades
   - **Tiempo:** 30-45 minutos

2. **[SEGURIDAD.md](./SEGURIDAD.md)**
   - Auditoría de seguridad
   - 3 hallazgos críticos (RLS, tokens, validaciones)
   - 4 hallazgos de alto riesgo
   - Plan de remediación
   - **Tiempo:** 30-45 minutos

---

### 🔐 DevOps / Security Engineer
**¿Hay vulnerabilidades? ¿Cómo deployamos?**

1. **[SEGURIDAD.md](./SEGURIDAD.md)** ⭐ **LECTURA PRINCIPAL**
   - Auditoría completa
   - Hallazgos por severidad
   - Código de ataque (exploit scenarios)
   - Checklist de remediación
   - **Tiempo:** 45-60 minutos

2. **[SETUP.md](./SETUP.md)** - Sección "Deploy a Producción"
   - Hosting options (Vercel, VPS)
   - Pre-deploy checklist
   - Variables de entorno en producción
   - **Tiempo:** 15 minutos

---

### 👨‍💻 Backend Developer
**Cómo configurar, cómo desarrollar, cómo deployar?**

1. **[SETUP.md](./SETUP.md)** ⭐ **LECTURA PRINCIPAL**
   - Setup inicial paso a paso
   - Configuración de Supabase
   - Workflow Git (branches, commits)
   - Deploy a producción
   - Troubleshooting común
   - Mejores prácticas
   - **Tiempo:** 60-90 minutos

2. **[ARQUITECTURA.md](./ARQUITECTURA.md)**
   - Para entender modelos de datos
   - Flujos de negocio
   - **Tiempo:** 45 minutos

3. **[COMPONENTES.md](./COMPONENTES.md)**
   - Para entender qué hay en lib/ (citasData, supabase)
   - **Tiempo:** 30 minutos

---

### 🎨 Frontend Developer
**Qué componentes existen? Cómo usarlos? Cómo extenderlos?**

1. **[COMPONENTES.md](./COMPONENTES.md)** ⭐ **LECTURA PRINCIPAL**
   - Documentación de cada componente
   - Props, comportamiento, ejemplos
   - Patrones (Context, useCallback, etc)
   - CSS Modules
   - **Tiempo:** 45-60 minutos

2. **[PAGES.md](./PAGES.md)**
   - Para ver dónde se usan los componentes
   - Flujos principales (QA)
   - **Tiempo:** 45 minutos

3. **[SETUP.md](./SETUP.md)** - Sección "Desarrollo Local"
   - Cómo criar feature
   - Cómo testear
   - **Tiempo:** 20 minutos

---

### 📊 Product Manager / UX Designer
**Cómo funciona cada vista? Cuál es el flujo del usuario?**

1. **[PAGES.md](./PAGES.md)** ⭐ **LECTURA PRINCIPAL**
   - Descripción detallada de cada página
   - Secciones, componentes, botones
   - Flujos de usuario
   - Estados visuales
   - Responsive design
   - **Tiempo:** 45-60 minutos

2. **[README.md](./README.md)**
   - Descripción general
   - Glosario de roles y estados
   - **Tiempo:** 10 minutos

---

### 🆕 Nuevo Developer (Onboarding)
**Necesito aprender el proyecto desde cero**

**Día 1 (2-3 horas):**
1. [README.md](./README.md) - Intro (10 min)
2. [SETUP.md](./SETUP.md) - Setup local (30 min)
3. [PAGES.md](./PAGES.md) - Ver las vistas (60 min)
4. Ejecutar `npm run dev` y explorar (60 min)

**Día 2 (2-3 horas):**
1. [COMPONENTES.md](./COMPONENTES.md) - Conocer componentes (60 min)
2. [ARQUITECTURA.md](./ARQUITECTURA.md) - Entender flujos (60 min)
3. Leer 1-2 páginas del código (60 min)

**Semana 1:**
1. [SEGURIDAD.md](./SEGURIDAD.md) - Conocer riesgos (45 min)
2. Crear primer PR pequeño (4-6 horas)

**Total onboarding:** ~6-8 horas

---

### 🤔 Tengo una Pregunta Específica

#### "¿Cómo se crea una cita?"
→ [PAGES.md#4-enfermeriajsgestión-integral](./PAGES.md) + [COMPONENTES.md#3-citaform](./COMPONENTES.md)

#### "¿Cuáles son las vulnerabilidades?"
→ [SEGURIDAD.md#hallazgos-críticos](./SEGURIDAD.md)

#### "¿Cómo agrego un campo a una tabla?"
→ [SETUP.md#workflow-típico](./SETUP.md)

#### "¿Cómo autenticar usuarios?"
→ [ARQUITECTURA.md#flujo-de-autenticación](./ARQUITECTURA.md)

#### "¿Cómo hago realtime updates?"
→ [ARQUITECTURA.md#flujos-principales](./ARQUITECTURA.md)

#### "¿Cómo deployar?"
→ [SETUP.md#deploy-a-producción](./SETUP.md)

#### "¿Qué roles existen?"
→ [README.md #glosario-rápido](./README.md) + [PAGES.md#7-_appjs---wrapper-global](./PAGES.md)

#### "¿Cómo uso CitaForm?"
→ [COMPONENTES.md#3-citaform](./COMPONENTES.md)

#### "¿Cómo funciona Supabase?"
→ [ARQUITECTURA.md#stack-tecnológico](./ARQUITECTURA.md)

---

## 📚 Tabla de Todos los Documentos

| Documento | Audiencia | Tema Principal | Tamaño | Tiempo |
|-----------|-----------|-----------------|--------|--------|
| **README.md** | Todos | Intro + Quick start | 4 KB | 10 min |
| **RESUMEN.md** | Ejecutivos | Estado general | 3 KB | 5 min |
| **ARQUITECTURA.md** | Tech | Stack + Análisis | 8 KB | 45 min |
| **SEGURIDAD.md** | Security | Vulnerabilidades | 12 KB | 45 min |
| **PAGES.md** | Frontend/PM | Vistas principales | 15 KB | 45 min |
| **COMPONENTES.md** | Frontend | Componentes | 10 KB | 45 min |
| **SETUP.md** | Developers | Dev + Deploy | 12 KB | 90 min |
| **ÍNDICE.md** | Todos | Navegación | 6 KB | 5 min |

---

## 🗺️ Mapa Conceptual

```
                        ┌─── RESUMEN.md (ejecutivos)
                        │
                        ├─── README.md (todos)
                        │
        ┌───────────────┼─── ARQUITECTURA.md (tech)
        │               │
ÍNDICE.md               ├─── SEGURIDAD.md (devops)
        │               │
        └───────────────┼─── PAGES.md (PM/frontend)
                        │
                        ├─── COMPONENTES.md (frontend)
                        │
                        └─── SETUP.md (developers)
```

---

## 🎓 Rutas de Aprendizaje por Rol

### Executive Route (5 min)
```
RESUMEN.md
└─ Done! Ya sabes el estado
```

### PM Route (20 min)
```
README.md
└─ PAGES.md
   └─ Entiendes todas las vistas
```

### Designer Route (45 min)
```
RESUMEN.md
└─ PAGES.md
   └─ Entiendes flujos y UX
```

### Tech Lead Route (2 horas)
```
README.md
├─ ARQUITECTURA.md
├─ SEGURIDAD.md
└─ SETUP.md (Deploy)
└─ Listo para dirigir técnicamente
```

### Backend Dev Route (2.5 horas)
```
README.md
├─ SETUP.md (Setup local)
├─ ARQUITECTURA.md (modelos + flujos)
├─ SEGURIDAD.md (qué está mal)
└─ COMPONENTES.md (lib/citasData.js)
└─ Listo para desarrollar
```

### Frontend Dev Route (2.5 horas)
```
README.md
├─ SETUP.md (Setup local)
├─ COMPONENTES.md (react)
├─ PAGES.md (dónde se usan)
└─ ARQUITECTURA.md (contexto)
└─ Listo para desarrollar
```

### Security Eng Route (1.5 horas)
```
SEGURIDAD.md
└─ SETUP.md (Deploy/env)
   └─ ARQUITECTURA.md (stack)
   └─ Listo para asegurar
```

### Full Onboarding Route (6-8 horas)
```
Day 1:
├─ README.md
├─ SETUP.md (local setup + dev)
└─ PAGES.md (entender vistas)

Day 2:
├─ COMPONENTES.md
└─ ARQUITECTURA.md

Week 1:
├─ SEGURIDAD.md
└─ Crear primer PR
```

---

## 💡 Consejos de Navegación

1. **Usa links internos:** Los documentos tienen `#seccion` para links profundos
   ```markdown
   [Ver en PAGES.md](./PAGES.md#2-pacientejs---portal-del-paciente)
   ```

2. **Busca Ctrl+F:** En cada documento puedes buscar palabras clave
   ```
   Ctrl+F "RLS" en SEGURIDAD.md
   Ctrl+F "CitaForm" en COMPONENTES.md
   ```

3. **Lee en este orden:**
   1. Primero el tuyo (según rol)
   2. Luego transversal (ARQUITECTURA.md)
   3. Luego específico (según necesidad)

4. **Sella de tiempo:** Cada doc muestra última actualización
   ```
   "Última actualización: 2026-03-12"
   ```

---

## 🔄 Cómo Mantener Actualizada esta Documentación

**Si cambias algo en el código:**

1. Actualiza el documento relevante
2. Actualiza la fecha en cada archivo
3. Commit con mensaje: `docs: actualizar ARCHIVO.md`

**Ejemplo:**
```bash
git commit -m "docs: actualizar COMPONENTES.md con nuevo CitaForm prop"
```

---

## 📞 ¿No encuentras lo que buscas?

1. **Usa Ctrl+F** en cada documento (busca palabra clave)
2. **Revisa el índice** en la parte superior de cada .md
3. **Pregunta al equipo:** dev@medylink.local
4. **Report bug:** GitHub Issues

---

## ✅ Checklist: Documentación Completa

- ✅ README.md - Intro y quick start
- ✅ RESUMEN.md - Ejecutivo
- ✅ ARQUITECTURA.md - Análisis técnico
- ✅ SEGURIDAD.md - Auditoría
- ✅ PAGES.md - Vistas principales
- ✅ COMPONENTES.md - Referencia React
- ✅ SETUP.md - Guía de desarrollo
- ✅ ÍNDICE.md - Este archivo (navegación)

**Total:** 8 documentos  
**Cobertura:** ~100% del sistema  
**Última revisión:** 2026-03-12

---

**Documento:** ÍNDICE DE DOCUMENTACIÓN  
**Versión:** 1.0  
**Fecha:** 2026-03-12  
**Status:** Completa ✅

---

### 🚀 Próximo Paso

**¿No sabes por dónde empezar?**

1. Si eres **ejecutivo/stakeholder** → Lee [RESUMEN.md](./RESUMEN.md)
2. Si eres **developer** → Lee [SETUP.md](./SETUP.md)
3. Si eres **security** → Lee [SEGURIDAD.md](./SEGURIDAD.md)
4. Si eres **PM** → Lee [PAGES.md](./PAGES.md)

¡Bienvenido al equipo! 🎉
