# 📖 Documentación de MedyLink

**Bienvenido a la documentación técnica completa del sistema de gestión médica MedyLink.**

> 💡 **Tip:** Usa el menú a continuación para encontrar rápidamente lo que necesitas según tu rol.

---

## 🎯 Encuentra tu Ruta de Documentación

### ⚡ 5 Minutos (Ejecutivos / Stakeholders)
🎯 **¿Cuál es el estado del proyecto?**

→ **[RESUMEN.md](./00-INICIO-RAPIDO/RESUMEN.md)**
- Estado actual
- Inversión (200h completadas, 75h pendientes)
- Checklist de producción
- Roadmap

---

### 🚀 30 Minutos (Nuevo Developer)
📖 **Quiero empezar a desarrollar hoy**

→ **[SETUP.md](./01-ONBOARDING/SETUP.md)** (paso a paso)
1. Setup inicial (5 min)
2. Configuración Supabase (10 min)
3. Desarrollo local (5 min)
4. Workflow Git (10 min)

---

### 🏗️ 45 Minutos (Tech Lead)
📊 **Necesito entender la arquitectura**

→ **[ARQUITECTURA.md](./04-ARQUITECTURA/ARQUITECTURA.md)**
- Stack completo (Next.js 16 + Supabase)
- Flujo de autenticación
- Modelos de datos
- Patrones y análisis

---

### 🔐 45 Minutos (DevOps / Security)
🔒 **¿Hay vulnerabilidades?**

→ **[SEGURIDAD.md](./05-SEGURIDAD/SEGURIDAD.md)** ⚠️ **CRÍTICO**
- 3 hallazgos críticos (RLS, tokens, validación)
- 4 hallazgos alto riesgo
- Plan de remediación
- Código de ataque + soluciones

---

### 👨‍💻 60 Minutos (Frontend Developer)
🎨 **¿Qué componentes existen y cómo usarlos?**

→ **[COMPONENTES.md](./03-DESARROLLO/COMPONENTES.md)**
- 12 componentes documentados
- Props, ejemplos, comportamiento
- Patrones React
- Consideraciones de terceros

---

### 📋 45 Minutos (Product Manager)
📱 **¿Cómo funciona cada vista?**

→ **[PAGES.md](./02-GUIA-VISTAS/PAGES.md)**
- Cada página documentada
- Flujos de usuario
- Estados visuales
- Responsive design

---

### 📁 30 Minutos (Quiero el "Big Picture")
🗺️ **¿Dónde está cada cosa en el código?**

→ **[ESTRUCTURA.md](./03-DESARROLLO/ESTRUCTURA.md)**
- Árbol visual comentado
- Qué importar de dónde
- Flujos por archivo
- Estructura de datos

---

## 📚 Todos los Documentos

| Carpeta | Documento | Audiencia | Tiempo | Tema |
|---------|-----------|-----------|--------|------|
| [00-INICIO-RAPIDO](./00-INICIO-RAPIDO/) | **RESUMEN.md** | Ejecutivos | 5 min | Estado y inversión |
| [01-ONBOARDING](./01-ONBOARDING/) | **SETUP.md** | Developers | 90 min | Setup + flujo de trabajo |
| [02-GUIA-VISTAS](./02-GUIA-VISTAS/) | **PAGES.md** | PM / Designers | 45 min | Cada vista del sistema |
| [03-DESARROLLO](./03-DESARROLLO/) | **ESTRUCTURA.md** | todos | 30 min | Mapa del código |
| [03-DESARROLLO](./03-DESARROLLO/) | **COMPONENTES.md** | Frontend | 45 min | Componentes React |
| [04-ARQUITECTURA](./04-ARQUITECTURA/) | **ARQUITECTURA.md** | Tech | 45 min | Stack + análisis |
| [05-SEGURIDAD](./05-SEGURIDAD/) | **SEGURIDAD.md** | Security | 45 min | Vulnerabilidades |

---

## 🎓 Rutas de Aprendizaje por Rol

### Para Ejecutivos (5 min)
```
doc/00-INICIO-RAPIDO/RESUMEN.md
└─ Done! Ya sabes el estado del proyecto
```

### Para Nuevo Developer (6-8 horas total)

**Día 1 (2-3 horas):**
```
1. Este README (5 min)
2. doc/01-ONBOARDING/SETUP.md § Setup local (20 min)
3. doc/02-GUIA-VISTAS/PAGES.md (45 min)
4. npm run dev + explorar (60 min)
```

**Día 2 (2-3 horas):**
```
1. doc/03-DESARROLLO/COMPONENTES.md (45 min)
2. doc/04-ARQUITECTURA/ARQUITECTURA.md (45 min)
3. Leer código en src/ (60 min)
```

**Semana 1:**
```
1. doc/05-SEGURIDAD/SEGURIDAD.md (30 min)
2. Crear primer PR pequeño (4-6 horas)
```

### Para Tech Lead (2 horas)
```
1. doc/04-ARQUITECTURA/ARQUITECTURA.md (45 min)
2. doc/05-SEGURIDAD/SEGURIDAD.md (45 min)
3. doc/03-DESARROLLO/ESTRUCTURA.md (30 min)
└─ Listo para dirigir técnicamente
```

### Para Frontend Dev (2.5 horas)
```
1. doc/01-ONBOARDING/SETUP.md (20 min)
2. doc/03-DESARROLLO/COMPONENTES.md (45 min)
3. doc/02-GUIA-VISTAS/PAGES.md (45 min)
4. doc/03-DESARROLLO/ESTRUCTURA.md (30 min)
└─ Listo para desarrollar
```

### Para Backend Dev (2.5 horas)
```
1. doc/01-ONBOARDING/SETUP.md (20 min)
2. doc/04-ARQUITECTURA/ARQUITECTURA.md (45 min)
3. doc/05-SEGURIDAD/SEGURIDAD.md (30 min)
4. doc/03-DESARROLLO/ESTRUCTURA.md (30 min)
└─ Listo para desarrollar
```

### Para Security Eng (1.5 horas)
```
1. doc/05-SEGURIDAD/SEGURIDAD.md (45 min)
2. doc/04-ARQUITECTURA/ARQUITECTURA.md (45 min)
└─ Listo para asegurar
```

---

## 🔍 Búsqueda Rápida por Pregunta

**¿Cómo creo una cita?**
→ [PAGES.md → Enfermería](./02-GUIA-VISTAS/PAGES.md#4-enfermeriajsgestión-integral) + [COMPONENTES.md → CitaForm](./03-DESARROLLO/COMPONENTES.md#3-citaform)

**¿Cuáles son las vulnerabilidades?**
→ [SEGURIDAD.md → Hallazgos Críticos](./05-SEGURIDAD/SEGURIDAD.md#-hallazgos-críticos)

**¿Cómo agrego un campo nuevo?**
→ [SETUP.md → Workflow Típico](./01-ONBOARDING/SETUP.md#workflow-típico)

**¿Cómo autentico usuarios?**
→ [ARQUITECTURA.md → Flujo de Autenticación](./04-ARQUITECTURA/ARQUITECTURA.md#-flujo-de-autenticación)

**¿Cómo hago realtime updates?**
→ [ARQUITECTURA.md → Flujos Principales](./04-ARQUITECTURA/ARQUITECTURA.md#-flujos-principales)

**¿Cómo deployar a producción?**
→ [SETUP.md → Deploy a Producción](./01-ONBOARDING/SETUP.md#-deploy-a-producción)

**¿Dónde está cada componente?**
→ [ESTRUCTURA.md → Árbol Completo](./03-DESARROLLO/ESTRUCTURA.md#-árbol-completo-comentado)

**¿Cómo uso CitaForm?**
→ [COMPONENTES.md → CitaForm](./03-DESARROLLO/COMPONENTES.md#3-citaform)

---

## 📊 Estadísticas de Documentación

| Métrica | Valor |
|---------|-------|
| **Total de documentos** | 7 |
| **Total de líneas** | ~3,500 |
| **Documentación de cobertura** | 100% |
| **Tiempo de lectura completa** | 4-6 horas |
| **Última actualización** | 2026-03-12 |

---

## ⚠️ Hallazgos Críticos (Lectura Obligatoria)

🔴 **El sistema tiene 3 vulnerabilidades críticas antes de producción:**

1. **RLS no implementado** → Usuarios pueden ver datos ajenos
2. **Validación server-side ausente** → Fácil de bypassear
3. **Tokens públicos mal configurados** → Regenerar inmediatamente

**Impacto:** Bloqueante para producción  
**Documentado en:** [SEGURIDAD.md](./05-SEGURIDAD/SEGURIDAD.md)  
**Tiempo estimado de fixes:** 3-5 días

---

## 🚀 Checklist de Onboarding

- [ ] Leer [RESUMEN.md](./00-INICIO-RAPIDO/RESUMEN.md) (5 min)
- [ ] Ejecutar [SETUP.md](./01-ONBOARDING/SETUP.md) setup local (20 min)
- [ ] npm run dev + explorar (30 min)
- [ ] Leer [PAGES.md](./02-GUIA-VISTAS/PAGES.md) (45 min)
- [ ] Leer [COMPONENTES.md](./03-DESARROLLO/COMPONENTES.md) (45 min)
- [ ] Leer [ARQUITECTURA.md](./04-ARQUITECTURA/ARQUITECTURA.md) (45 min)
- [ ] Leer [SEGURIDAD.md](./05-SEGURIDAD/SEGURIDAD.md) (30 min)
- [ ] Crear primer PR (4-6h)

**Tiempo total:** 6-8 horas

---

## 💡 Navegación en GitHub

```
control_medico/
├── README.md (Punto de entrada del repo)
├── doc/ (← ESTÁS AQUÍ)
│   ├── README.md (este archivo)
│   ├── 00-INICIO-RAPIDO/
│   │   └── RESUMEN.md
│   ├── 01-ONBOARDING/
│   │   └── SETUP.md
│   ├── 02-GUIA-VISTAS/
│   │   └── PAGES.md
│   ├── 03-DESARROLLO/
│   │   ├── ESTRUCTURA.md
│   │   └── COMPONENTES.md
│   ├── 04-ARQUITECTURA/
│   │   └── ARQUITECTURA.md
│   └── 05-SEGURIDAD/
│       └── SEGURIDAD.md
└── src/ (Código fuente)
```

---

## 🔗 Links Útiles

- 🏠 [README.md](../README.md) - Punto de entrada principal del repo
- 🔧 [ÍNDICE.md antiguo](./INDICE-ORIGINAL.md) - Mapa detallado (para referencia)
- 📘 [Next.js Docs](https://nextjs.org/docs)
- 🔐 [Supabase Docs](https://supabase.com/docs)
- ⚛️ [React Docs](https://react.dev)

---

## 📞 Soporte

- **Desarrollo:** dev@medylink.local
- **Seguridad:** security@medylink.local (confidencial)
- **Producto:** product@medylink.local
- **General:** Crear issue en GitHub

---

## ✨ Última Actualización

- **Fecha:** 2026-03-12
- **Documentos:** 7 + README
- **Estado:** ✅ Completa
- **Cobertura:** 100% del sistema

---

**¿Nuevo en el equipo?** → Sigue el flujo de [Nuevo Developer](#para-nuevo-developer-6-8-horas-total) arriba 👆

**¿Buscas algo específico?** → Usa [Búsqueda Rápida por Pregunta](#-búsqueda-rápida-por-pregunta) ☝️

**¿Eres ejecutivo?** → Ve directo a [RESUMEN.md](./00-INICIO-RAPIDO/RESUMEN.md) ⏱️
