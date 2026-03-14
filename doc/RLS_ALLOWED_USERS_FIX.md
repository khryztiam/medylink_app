# FIX: RLS Policy en allowed_users

**Fecha:** 14 Marzo 2026  
**Problema:** AuthContext no traía el nombre del usuario (mostraba fallback)  
**Causa Raíz:** RLS bloqueaba lectura en relación foreign key `allowed_users ( nombre )`  

## Solución Aplicada

```sql
CREATE POLICY "allow_read_allowed_users" ON allowed_users
  FOR SELECT
  USING (true);
```

Esta política permite que cualquier usuario (autenticado o no) pueda leer registros de `allowed_users`, lo cual es apropiado porque es una tabla de referencia (datos maestros de usuarios permitidos en el sistema).

## Verificación

Políticas RLS ahora en `allowed_users`:
- ✅ `allow_read_allowed_users` - SELECT PERMISIVO para todos
- ✅ `admin_access_allowed_users` - Admin/Enfermería con acceso especial

## Impacto

- AuthContext ahora puede traer `allowed_users.nombre` via relación foreign key
- El saludo mostrará nombre completo del usuario, no el fallback
- Sin cambios en el código de AuthContext requeridos (ya tiene ?.nombre como fallback)

## Testing

```
Login con SAP 10699992 → Debe mostrar "CHRISTIAN ALEXANDER MELENDEZ DIAZ"
```

## Migración (para rollback/redo)

Este cambio está documentado en [SEGURIDAD.md](./SEGURIDAD.md) Sección 6.
