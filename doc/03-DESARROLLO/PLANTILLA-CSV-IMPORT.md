# 📋 Plantilla de Importación CSV - Usuarios Autorizados

## 🎯 Propósito

La tabla `allowed_users` es la **nómina autorizada** del sistema. Cuando alguien intenta registrarse:

1. **Sistema verifica** si su SAP (`idsap`) está en `allowed_users`
2. **Si SÍ existe** → Usuario activado automáticamente → Puede hacer login
3. **Si NO existe** → Usuario desactivado → No puede login hasta que admin lo agregue

---

## 📥 Descarga la Plantilla

**URL:** `/api/admin/template/download`

Descarga desde el panel de administración: **Botón "Plantilla"** en "Importar Lista Maestro"

---

## 📌 Estructura del CSV

**El CSV DEBE tener estos campos en este orden:**

```
idsap,nombre
```

### Campos

| Campo | Tipo | Requerido | Descripción | Ejemplo |
|-------|------|-----------|-------------|---------|
| **idsap** | Número | ✅ SÍ | SAP único del empleado. Debe ser numérico entero | `99991` |
| **nombre** | Texto | ✅ SÍ | Nombre completo (se muestra en el login del usuario) | `Juan Pérez García` |

---

## ✅ Validaciones Automáticas

### Cliente (en el navegador):
```javascript
//  Valida ANTES de enviar al servidor
if (!row.idsap || !row.nombre || isNaN(Number(row.idsap))) {
  Error: "Fila X: idsap inválido o nombre faltante"
}
```

### Servidor (seguridad):
```javascript
// Revalida NUEVAMENTE (nunca confiar en cliente)
if (!row.idsap || isNaN(Number(row.idsap))) → Error
if (!row.nombre || row.nombre.trim() === '') → Error
```

**Reglas:**

1. **idsap REQUERIDO:**
   - ❌ No puede estar vacío
   - ❌ Debe ser número entero (sin decimales)
   - ✅ Ejemplo válido: `99991`

2. **nombre REQUERIDO:**
   - ❌ No puede estar vacío
   - ❌ No puede ser solo espacios
   - ✅ Se trimean espacios automáticamente
   - ✅ Ejemplo válido: `Juan Pérez García`

---

## 📝 Ejemplo Correcto

```csv
idsap,nombre
99991,Juan Pérez García
99992,María López Hernández
99993,Carlos Rodríguez López
99994,Ana Martínez Gómez
99995,Roberto Flores Sánchez
99996,Sandra Morales Castro
99997,Fernando González López
```

**Checklist:**
- ✅ Primera fila con encabezados exactos: `idsap,nombre`
- ✅ Todos los idsap son números
- ✅ Todos los nombres están completos
- ✅ Codificación UTF-8
- ✅ Separador: coma (,)

---

## 🛠️ Pasos para Importar

### 1️⃣ Preparar el archivo
- Descargar plantilla desde panel admin
- Editar en Excel, Google Sheets, o Notepad
- **Guardar como UTF-8 CSV** (no XLSX)

### 2️⃣ Validar estructura
- ✅ Primera fila: `idsap,nombre`
- ✅ Columna idsap: todos números
- ✅ Columna nombre: ninguno vacío
- ✅ Codificación: UTF-8

### 3️⃣ Subir archivo
```
Panel Admin → Importar Lista Maestro → Botón [Plantilla] → Seleccionar archivo CSV
```

### 4️⃣ Revisar resultados
```
✅ Importación completada
───────────────────────
Procesados: X
Nuevos:     X  (agregados a la tabla)
Actualizados: X (sus datos se actualizaron)
Eliminados: X  (removidos de la tabla)
```

---

## 🔄 Comportamiento de Sincronización

Cuando importas CSV, el sistema sincroniza:

| Acción | Significa | Resultado |
|--------|-----------|-----------|
| **Nuevos** | En CSV pero NO en BD | Se crean registros |
| **Actualizados** | En CSV Y en BD | Se actualiza nombre (y otros campos si cambiaron) |
| **Eliminados** | En BD pero NO en CSV | Se eliminan registros |

**Ejemplo:**
```
CSV ACTUAL:           BD ANTERIOR:
99991 Juan      →     99991 Juan (sin cambios)
99992 María     →     99992 María (sin cambios)
99995 Roberto   →     99993 Carlos (ELIMINADO ❌)
                      99995 Roberto (sin cambios)
```

**Resultado mostraría:**
- Procesados: 3
- Nuevos: 0  
- Actualizados: 0
- Eliminados: 1

---

## ⚠️ Flujo de Validación de Registro

Cuando un **nuevo usuario intenta registrarse:**

```
Usuario entra SAP: 99991
    ↓
Sistema crea en BD:
  app_users { idsap: 99991, status: false, role: 'paciente' }
    ↓
¿Existe 99991 en allowed_users?
    ├─ SÍ → status: true ✅ Usuario ACTIVADO  → Puede hacer login
    └─ NO → status: false ❌ Usuario RECHAZADO → No puede hacer login
```

---

## ❌ Errores Comunes y Soluciones

### Error: "X filas inválidas. IDs: 99991, 99992, ..."

**Causas:**
1. **idsap faltante o no numérico**
   - ❌ Evitar: Vacío, `ABC123`, `null`
   - ✅ Solución: Asegurar todos tengan número

2. **nombre faltante o vacío**
   - ❌ Evitar: Celdas en blanco en columna nombre
   - ✅ Solución: Agregar nombre a todas las filas

### Error: "Error al leer CSV"

1. **Codificación incorrecta**
   - ✅ Solución: Guardar como **UTF-8 CSV**
   - ❌ Evitar: XLSX, ANSI, UTF-16

2. **Delimitador incorrecto**
   - ✅ Solución: Usar `,` (coma)
   - ❌ Evitar: `;` (punto y coma), `\t` (tabulación)

3. **Saltos de línea**
   - ✅ Solución: Usar `\n` o `\r\n`
   - ❌ Evitar: Mezclar tipos

### Error: "RPC sync_users_complete not found"

- ⚠️ Significa que la función de sincronización NO existe en Supabase
- 🔧 Contactar al dev para crear la RPC
- Ver: [audit-admin-components.md]

---

## 💡 Tips por Programa

### Excel
1. Editar datos
2. **Guardar Como** → Formato: **CSV UTF-8** (no CSV estándar)
3. Usar ese archivo

### Google Sheets
1. Editar datos
2. **Archivo** → **Descargar** → **CSV**
3. Google guarda automáticamente en UTF-8

### Notepad++ (Verificar UTF-8)
1. Abrir archivo
2. **Encoding** → Verificar **UTF-8 without BOM**
3. Si no: **Encoding** → **Convert to UTF-8 without BOM**

---

## 🔗 Referencias Técnicas

**Tabla:** `allowed_users`
- Campo clave: `idsap` (BIGINT, UNIQUE)
- Campo usado: `nombre` (TEXT)

**Endpoints:**
- `GET /api/admin/template/download` — Descarga plantilla
- `POST /api/admin/importarAllowed` — Importa CSV

**Función RPC** (en Supabase):
- `sync_users_complete(add_users, update_users, remove_ids)` — Sincroniza BD

**Integración:**
- Login: Verifica `idsap` en `allowed_users` para activar usuario
- Registro: Crea usuario, luego valida contra `allowed_users`

---

## � Campos Adicionales (Opcionales)

Si necesitas agregar información referencial, el sistema ACEPTA pero NO REQUIERE:

| Campo | Tipo | Notas |
|-------|------|-------|
| **grupo** | Número | Código de grupo/departamento (almacenado pero no usado en autenticación) |
| **puesto** | Texto | Descripción de puesto (almacenado pero no usado en autenticación) |

**Si quieres agregar estos campos:**
```csv
idsap,nombre,grupo,puesto
99991,Juan Pérez García,1,Médico General
99992,María López Hernández,1,Médica Internista
```

**Validaciones para campos opcionales:**
- `grupo`: Debe ser número si existe
- `puesto`: Puede ser cualquier texto

---

1. Revisa "Errores Comunes" arriba
2. Verifica "Checklist" en Pasos
3. Descarga plantilla nueva y reintenta
4. Si persiste: Contacta al admin

