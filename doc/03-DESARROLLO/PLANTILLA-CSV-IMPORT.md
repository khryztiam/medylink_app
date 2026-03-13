# 📋 Plantilla de Importación CSV - Usuarios Autorizados

## 📥 Descarga la Plantilla

**URL:** `/api/admin/template/download`

Descarga el archivo `allowed_users_template.csv` desde el panel de administración usando el botón de descarga.

---

## 📌 Estructura del CSV

La plantilla **DEBE** tener estos campos en este orden:

```
idsap,nombre,grupo,puesto
```

### Campos

| Campo | Tipo | Requerido | Descripción | Ejemplo |
|-------|------|-----------|-------------|---------|
| **idsap** | Número | ✅ SÍ | ID único del empleado/usuario. Debe ser numérico | `99991` |
| **nombre** | Texto | ✅ SÍ | Nombre completo de la persona. No puede estar vacío | `Juan Pérez García` |
| **grupo** | Número | ❌ NO | Código numérico del grupo/departamento | `1` (Médicos), `2` (Enfermería), `3` (Coordinación) |
| **puesto** | Texto | ❌ NO | Descripción del puesto o especialidad | `Médico General`, `Enfermera`, `Coordinador` |

---

## ✅ Validaciones Automáticas

El sistema valida automáticamente:

1. **idsap REQUERIDO y válido:**
   - ❌ No puede estar vacío
   - ❌ Debe ser un número entero
   - ❌ No puede tener decimales
   - ✅ Ejemplo válido: `99991`

2. **nombre REQUERIDO:**
   - ❌ No puede estar vacío
   - ❌ No puede tener solo espacios
   - ✅ Se trimean espacios al inicio/fin automáticamente
   - ✅ Ejemplo válido: `Juan Pérez García`

3. **grupo OPCIONAL:**
   - ✅ Si se omite, se guardará como `NULL` en la BD
   - ❌ Si tiene valor, DEBE ser un número entero
   - ✅ Se pueden dejar celdas vacías

4. **puesto OPCIONAL:**
   - ✅ Si se omite, se guardará como `NULL` en la BD
   - ✅ Puede ser cualquier texto
   - ✅ Se trimean espacios automáticamente

---

## 📝 Ejemplo Completo

```csv
idsap,nombre,grupo,puesto
99991,Juan Pérez García,1,Médico General
99992,María López Hernández,1,Médica Internista
99993,Carlos Rodríguez López,2,Enfermero
99994,Ana Martínez Gómez,2,Enfermera
99995,Roberto Flores Sánchez,3,Coordinador
99996,Sandra Morales Castro,1,Médica Pediatra
99997,Fernando González López,,
```

**Notas:**
- Última fila: campos `grupo` y `puesto` vacíos (válido)
- Primera fila: **SIEMPRE** debe ser el encabezado
- El orden de columnas **ES importante**
- Codificación **DEBE ser UTF-8**

---

## 🛠️ Pasos para Importar

### 1️⃣ Preparar el archivo
- Descargar plantilla desde panel admin
- Editar en Excel, Google Sheets, o editor de texto
- **IMPORTANTE:** Guardar como UTF-8 CSV (no XLSX)

### 2️⃣ Validar antes de subir

**Checklist:**
- ✅ Primera fila tiene encabezados: `idsap,nombre,grupo,puesto`
- ✅ Columna `idsap`: todos son números
- ✅ Columna `nombre`: ninguno está vacío
- ✅ Columna `grupo`: solo números o vacío
- ✅ Archivo codificado en **UTF-8**

### 3️⃣ Subir archivo
```
Admin Panel → Importar Lista Maestro → Seleccionar archivo → Esperar confirmación
```

### 4️⃣ Revisar resultados
El sistema mostrará:
```
✅ Importación completada
Procesados: X
Nuevos: X
Actualizados: X
Eliminados: X
```

---

## 🔄 Comportamiento de Sincronización

Cuando importas un CSV, el sistema realiza:

| Acción | Descripción |
|--------|-------------|
| **Agregar** | Usuarios en CSV pero NO en BD → Se crean |
| **Actualizar** | Usuarios en CSV Y en BD → Se actualizan sus datos |
| **Eliminar** | Usuarios en BD pero NO en CSV → Se eliminan |

**Ejemplo:**
```
CSV actual:                    BD anterior:
99991 Juan               →     99991 Juan
99992 María              →     99992 María
99995 Roberto            →     99993 Carlos (ELIMINADO)
                                99995 Roberto (ACTUALIZADO)
```

**Resultado:**
- ✅ 99991 Juan: sin cambios
- ✅ 99992 María: sin cambios
- 🗑️ 99993 Carlos: eliminado
- 📝 99995 Roberto: actualizado con datos del CSV

---

## ❌ Errores Comunes

### Error: "Filas inválidas"

**Causas posibles:**
1. **idsap faltante o no numérico**
   - ✅ Solución: Verificar que TODOS tengan un número en `idsap`
   - ❌ Evitar: `ABC123`, `null`, espacios en blanco

2. **nombre faltante o vacío**
   - ✅ Solución: Agregar nombre a todas las filas
   - ❌ Evitar: Celdas vacías en columna `nombre`

3. **grupo no es número (si tiene valor)**
   - ✅ Solución: Usar solo números o dejar vacío
   - ❌ Evitar: `1A`, `Grupo A`, `1.5`

### Error: "Error al leer CSV"

**Causas posibles:**
1. **Codificación incorrecta**
   - ✅ Solución: Guardar como UTF-8 CSV
   - ❌ Evitar: XLSX, ANSI, UTF-16

2. **Delimitador incorrecto**
   - ✅ Solución: Usar `,` (coma) como separador
   - ❌ Evitar: `;` (punto y coma), `\t` (tabulación)

3. **Saltos de línea incorrectos**
   - ✅ Solución: Usar `\n` (Unix/Mac) o `\r\n` (Windows)
   - ❌ Evitar: Mezclar tipos de saltos de línea

---

## 💡 Tips Útiles

### Exportar desde Excel

1. Editar en Excel
2. **Guardar Como** → Formato: **CSV UTF-8** (no CSV estándar)
3. Confirmar que quieres guardar solo como CSV
4. Usar el archivo generado

### Exportar desde Google Sheets

1. Abrir hoja en Google Sheets
2. **Archivo** → **Descargar** → **CSV**
3. Google guarda automáticamente en UTF-8

### Verificar UTF-8 en Notepad++

1. Abrir archivo en Notepad++
2. **Encoding** → Verificar que sea **UTF-8 without BOM**
3. Si no, convertir: **Encoding** → **Convert to UTF-8 without BOM**

---

## 🔗 Referencias

- **Tabla BD:** `allowed_users` (tabla de usuarios autorizados para usar el sistema)
- **API Endpoint:** `POST /api/admin/importarAllowed`
- **RPC Database:** `sync_users_complete` (sincroniza add/update/delete)
- **Documentación:** Ver [doc/05-SEGURIDAD/SEGURIDAD.md](../../doc/05-SEGURIDAD/SEGURIDAD.md)

---

## 📞 Soporte

Si encuentras errores:
1. Revisa el mensaje de error en el panel
2. Verifica el checklist de validación arriba
3. Consulta la sección de "Errores Comunes"
4. Intenta descargar la plantilla nueva y edita nuevamente
