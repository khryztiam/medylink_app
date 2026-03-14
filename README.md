# 🏥 MedyLink - Sistema de Gestión Médica

**Estado:** v0.2.2 - En desarrollo  
**Última actualización:** 2026-03-14  
**Seguridad:** ✅ 3/3 críticos resueltos (RLS ✅ | Tokens ✅ | Validación Server-side ✅)  
**Auditoría:** ✅ Código revisado y analizado - Flujos testeados en producción

---

## 📝 Descripción

**MedyLink** es un sistema integral de gestión de citas médicas y control de turnos diseñado para facilitar la coordinación entre pacientes, personal médico y administrativo. 

### Características principales

✅ **Gestión de citas en tiempo real** con Supabase Realtime  
✅ **Interfaz diferenciada por rol** (Paciente, Médico, Enfermería, Supervisor, Admin)  
✅ **Control de turnos** con números de espera  
✅ **Dashboard de supervición** con métricas y estadísticas  
✅ **Autenticación segura** con Supabase Auth  
✅ **Pantalla pública** de turnos (TV)  

---

## 🚀 Inicio Rápido

### 1. Requisitos
- Node.js 18.17+
- npm 9+
- Cuenta Supabase con proyecto configurado

### 2. Instalación

```bash
git clone https://github.com/tu-org/control_medico.git
cd control_medico
npm install
```

### 3. Configurar variables de entorno

Crear archivo `.env.local` en la raíz (NUNCA committear):
```bash
# .env.local - Archivo local, protegido por .gitignore
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIs...
```

⚠️ **Importante:**
- ✅ `.env.local` está protegido en `.gitignore` (no se sube a Git)
- ❌ NUNCA commit variables en `.env` 
- 🔑 **Regenerar keys** si se expusieron accidentalmente
- 📋 Ver [doc/05-SEGURIDAD/SEGURIDAD.md](./doc/05-SEGURIDAD/SEGURIDAD.md) para más detalles

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Acceder a [http://localhost:3000](http://localhost:3000)

---

## 📚 Documentación

**Documentación completa en carpeta [doc/](./doc/)**

### Para diferentes perfiles:

| Rol | Documento | Contenido | Tiempo |
|-----|-----------|----------|--------|
| 👔 **Ejecutivos** | [doc/00-INICIO-RAPIDO/RESUMEN.md](./doc/00-INICIO-RAPIDO/RESUMEN.md) | Estado, inversión, roadmap | 5 min |
| 👨‍💼 **Arquitecto/Tech Lead** | [doc/04-ARQUITECTURA/ARQUITECTURA.md](./doc/04-ARQUITECTURA/ARQUITECTURA.md) | Stack, estructura, patrones, análisis | 45 min |
| 🔐 **DevOps/Security** | [doc/05-SEGURIDAD/SEGURIDAD.md](./doc/05-SEGURIDAD/SEGURIDAD.md) | Vulnerabilidades, RLS, validaciones, remedios | 45 min |
| 👨‍💻 **Developer Backend** | [doc/01-ONBOARDING/SETUP.md](./doc/01-ONBOARDING/SETUP.md) | Setup, configuración, workflow Git, deploy | 90 min |
| 🎨 **Developer Frontend** | [doc/03-DESARROLLO/COMPONENTES.md](./doc/03-DESARROLLO/COMPONENTES.md) | Props, comportamiento, ejemplos de cada componente | 45 min |
| 📊 **Product Manager** | [doc/02-GUIA-VISTAS/PAGES.md](./doc/02-GUIA-VISTAS/PAGES.md) | Vistas principales, flujos, UX por rol | 45 min |
| 🗺️️ **Mapa del Código** | [doc/03-DESARROLLO/ESTRUCTURA.md](./doc/03-DESARROLLO/ESTRUCTURA.md) | Árbol visual, qué importar, flujos por archivo | 30 min |
| 🆕 **Nuevo en el equipo** | [doc/README.md](./doc/README.md) | Rutas personalizadas de aprendizaje | 5 min |

---

## 🗂️ Estructura del Proyecto

```
control_medico/
├── 📄 ARQUITECTURA.md       ← Análisis general del sistema
├── 🔒 SEGURIDAD.md          ← Auditoría de seguridad
├── 📊 PAGES.md              ← Documentación de vistas
├── 🧩 COMPONENTES.md        ← Referencia de componentes
├── 🚀 SETUP.md              ← Guía de desarrollo
│
├── src/
│   ├── pages/               ← Rutas principales
│   │   ├── index.js         (Login)
│   │   ├── paciente.js      (Portal paciente)
│   │   ├── medico.js        (Panel médico)
│   │   ├── enfermeria.js    (Gestión integral)
│   │   ├── supervisor.js    (Estadísticas)
│   │   ├── turno.js         (Pantalla pública)
│   │   └── admin/           (Panel administrativo)
│   │
│   ├── components/          ← Componentes reutilizables
│   │   ├── AuthGate.js      (Control de acceso)
│   │   ├── Layout.jsx       (Navegación)
│   │   ├── CitaForm.js      (Formulario de citas)
│   │   └── ...
│   │
│   ├── context/             ← Estado global
│   │   └── AuthContext.js   (Autenticación)
│   │
│   ├── lib/                 ← Lógica reutilizable
│   │   ├── supabase.js      (Cliente Supabase)
│   │   ├── citasData.js     (CRUD de citas)
│   │   └── ...
│   │
│   └── styles/              ← CSS Modules
│
├── public/                  ← Assets estáticos
│   ├── icons/
│   └── *.mp3               (Audio feedback)
│
├── package.json
├── next.config.mjs
└── .env.local              (No committear)
```

---

## 🎯 Glosario Rápido

### Usuarios y Roles

| Rol | Acceso | Propósito |
|-----|--------|----------|
| **Paciente** | /paciente | Crear y consultar citas |
| **Médico** | /medico | Atender pacientes y completar consultas |
| **Enfermería** | /enfermeria | Registrar entrada de pacientes, crear citas |
| **Supervisor** | /supervisor | Ver estadísticas y monitorear flujo |
| **Admin** | /admin/control | Gestión global y importación de datos |

### Estados de Cita

```
pendiente → en_espera → en_consulta → atendido
                ↓
          (saltar fila) → cancelado
```

### Tecnologías Clave

- **Next.js 16.1.6**: Framework React con SSR
- **Supabase**: PostgreSQL + Auth + Realtime
- **React 19.2.4**: UI con hooks
- **CSS Modules**: Estilos encapsulados

---

## ⚡ Scripts Disponibles

```bash
npm run dev      # Iniciar servidor de desarrollo
npm run build    # Build para producción
npm run start    # Ejecutar build de producción
npm run lint     # Ejecutar ESLint
```

---

## 🔐 Seguridad

**Estado Actual:** ✅ 3/3 hallazgos críticos RESUELTOS

### ✅ Hallazgos Críticos (RESUELTOS)

**CRÍTICO #1: RLS (Row Level Security)** - ✅ IMPLEMENTADO
- Pacientes: ven solo sus citas
- Médicos: ven citas asignadas + en espera
- Enfermería: ven todas
- Admin: acceso total
- **Corrección v0.2.2:** Política `allow_read_allowed_users` para `allowed_users`
- **Status:** ✅ IMPLEMENTADO + AUDITADO + TESTEADO

**CRÍTICO #2: Validación Server-side** - ✅ IMPLEMENTADO  
- Nuevo endpoint POST `/api/citas/crear` con validaciones
- JWT token requerido, usuario existe, SAP válido
- Paciente solo para sí mismo, enfermería para cualquiera
- **Status:** ✅ IMPLEMENTADO + 9/9 TESTS APROBADOS
- **Documentación:** [doc/05-SEGURIDAD/VALIDACION-SERVER-SIDE.md](./doc/05-SEGURIDAD/VALIDACION-SERVER-SIDE.md)

**CRÍTICO #3: Tokens JWT** - ✅ ASEGURADOS
- Usar `.env.local` (gitignored) para credenciales
- NUNCA committear `.env` con variables sensibles
- Regenerar keys si se exponen accidentalmente
- **Status:** ✅ DOCUMENTADO + IMPLEMENTADO

### ✅ Implementaciones Adicionales (v0.2.1+)
- **Rate Limiting:** Activo en `/api/admin/summary` y `/api/admin/importarAllowed`
- **RLS Policies:** INSERT bloqueado para roles no autorizados
- **null-safety operators:** AuthContext con fallbacks

**Auditoría Completa:** [doc/05-SEGURIDAD/SEGURIDAD.md](./doc/05-SEGURIDAD/SEGURIDAD.md)

### Checklist de Seguridad

```
[✅] RLS (Row Level Security) - IMPLEMENTADO
[✅] Validación server-side - ENDPOINT /api/citas/crear
[✅] Tokens JWT - Protegidos en .env.local
[✅] Policy allow_read_allowed_users - AGREGADA
[✅] INSERT policies en citas - COMPLETAS
[✅] Rate limiting en APIs - ACTIVO
[✅] null-safety operators - RESTAURADOS
[ ] CSP headers (v0.2.3)
[ ] CORS configuración completa (v0.2.3)
[ ] Audit logging (v0.2.3)
[ ] XSS input sanitization (v0.2.3)
```

### Próximas Mejoras (No Bloqueantes)
- [ ] CSP headers para XSS protection
- [ ] CORS policy refinada
- [ ] Audit logging de acciones
- [ ] Input sanitization en forms

### Reportar Vulnerabilidades

⚠️ **NO** crear issues públicos para vulnerabilidades. Contactar directamente al maintainer.

---

## 🐛 Troubleshooting Rápido

### "Module not found: @/..."
```bash
# Verificar jsconfig.json tiene baseUrl y paths
# Reiniciar servidor: npm run dev
```

### "NEXT_PUBLIC_SUPABASE_URL is not defined"
```bash
# Crear .env.local en raíz del proyecto
# Agregar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_KEY
# Reiniciar servidor: npm run dev
# NO committear .env.local (está en .gitignore)
```

### "RLS policy violation"
```bash
# ✅ RLS está implementado (v0.2.0+)
# Verificar que rol del usuario está correcto
# Ver política en Supabase Dashboard > Authentication > Policies
# Usar test-rls.js para debuggear
```

### "Paciente/Médico no ve sus citas"
```bash
# Verificar jwt_token tiene claims: role, idsap
# RLS filtra por role + rol específico
# Ver log en: supabase.from('citas').select()
# Revisar jwt_has_role() en SEGURIDAD.md
```

### "Audio no funciona en medico.js"
```javascript
// ✅ Ya solucionado: desbloquearAudio() en primer click
// Si persiste: verificar archivos en /public/*.mp3
```

---

## 📈 Roadmap

### v0.2.2 (Actual - ✅ COMPLETADO)
- [✅] RLS implementado y auditado (incluido fix allowed_users)
- [✅] Validación server-side (endpoint `/api/citas/crear`)
- [✅] Rate limiting en APIs críticas
- [✅] Código revisado (seguridad + arquitectura)
- [✅] Documentación completa (CHANGELOG.md, VALIDACION-SERVER-SIDE.md)
- [✅] Testing en producción (todos los flujos validados)

### v0.2.3 (Próxima - Seguridad Alto Riesgo)
- [ ] CSP headers + HTTPS obligatorio
- [ ] Auditar supabaseAdmin usage
- [ ] Sanitizar error messages públicos
- [ ] Implementar logging seguro

### v0.3.0 (Siguiente)
- [ ] Tests unitarios (Jest)
- [ ] Integración con Telegram notifications
- [ ] Exportar reportes (PDF)
- [ ] Two-factor authentication (2FA)

### v1.0.0 (Producción)
- [ ] Mobile app (React Native)
- [ ] Integración con calendarios (Google, Outlook)
- [ ] BI/Analytics dashboard
- [ ] Certificados digitales

---

## 🤝 Contribuir

1. **Crear rama**: `git checkout -b feature/mi-feature`
2. **Hacer cambios**: Editar archivos según SETUP.md
3. **Testar**: `npm run lint && npm run build`
4. **Commit**: Usar conventional commits
5. **Push**: `git push origin feature/mi-feature`
6. **PR**: Crear pull request en GitHub

**Convenciones de commits:**
```bash
git commit -m "feat(paciente): agregar búsqueda por fecha"
git commit -m "fix(medico): corregir cálculo de duración"
git commit -m "docs: actualizar README"
```

---

## 📞 Soporte

- 📖 **Documentación**: Archivos `.md` en raíz del proyecto
- 🐛 **Issues**: GitHub Issues (etiquetas por tipo)
- 🔒 **Seguridad**: security@medylink.local (NO público)
- 💬 **Chat**: Slack #medylink-dev

---

## 📋 Recursos Útiles

### Links Externos
- 📘 [Next.js Docs](https://nextjs.org/docs)
- 🔐 [Supabase Docs](https://supabase.com/docs)
- ⚛️ [React Docs](https://react.dev)
- 🎨 [CSS Modules](https://github.com/css-modules/css-modules)

### Herramientas Recomendadas
- VS Code + ESLint + Prettier extensions
- Supabase Studio (dashboard)
- Chrome DevTools for debugging
- Postman/Insomnia for API testing

---

## 📄 Licencia

Privado - Uso interno únicamente

---

## ✨ Créditos

Desarrollado por el equipo de MedyLink.  
**Última actualización:** Marzo 2026

---

## 🎓 Para los nuevos desarrolladores

**Primer día:**
1. ✅ Clonar repo e instalar (5 min)
2. ✅ Leer este README (10 min)
3. ✅ Configurar .env.local (5 min)
4. ✅ Ejecutar `npm run dev` y ver login (5 min)
5. ✅ Leer [PAGES.md](./PAGES.md) - entender vistas (30 min)
6. ✅ Leer [COMPONENTES.md](./COMPONENTES.md) - conocer componentes (30 min)

**Segunda semana:**
1. ✅ Leer [ARQUITECTURA.md](./ARQUITECTURA.md) para entender flujos (1 hora)
2. ✅ Revisar [SEGURIDAD.md](./SEGURIDAD.md) para conocer riesgos (30 min)
3. ✅ Leer [SETUP.md](./SETUP.md) para workflow (30 min)
4. ✅ Crear primer PR pequeño (1-2 horas)

**Time Budget:**
- Onboarding completo: ~6-8 horas
- Productivo: Desde la primera semana
- Experto: Dentro de 2-3 semanas
