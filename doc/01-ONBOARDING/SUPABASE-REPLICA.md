# Replica de Supabase

Documento generado a partir de una validación contra la instancia configurada del proyecto el `2026-04-20`.

## Objetivo

Dejar una ruta reproducible para reconstruir la base usada por este proyecto sin depender solo del dashboard de Supabase ni de documentación dispersa.

## Hallazgos validados

### Tablas reales accesibles

`app_users`
- Columnas validadas: `id`, `idsap`, `role`, `status`, `created_at`, `telegram_id`

`allowed_users`
- Columnas validadas: `idsap`, `nombre`, `grupo`, `puesto`
- No se validó la existencia de `email`

`citas`
- Columnas validadas: `id`, `idSAP`, `nombre`, `motivo`, `estado`, `orden_llegada`, `created_at`, `doctor_name`, `programmer_at`, `check_in`, `check_out`, `consultation_at`, `emergency`, `isss`
- No se validó la existencia de `cita_programada`
- No se validó la existencia de `updated_at`

### Funciones RPC reales

- `sync_users_complete`: existe y responde correctamente
- `insert_cita_seguro`: no existe en la instancia validada
- `validate_cita_data`: no existe en la instancia validada

### Funciones y triggers observados en dashboard

- `actualizar_consultation_at()`: confirmada por captura del dashboard
- `trigger_actualizar_consultation_at` sobre `citas`: confirmado por captura del dashboard
- `log_citas_changes()`: SQL recuperado y versionado
- `enviar_notificacion_telegram` sobre `citas`: observado en dashboard como `AFTER UPDATE`
- `http_request`: observado como función objetivo del trigger de Telegram

### Comportamiento RLS validado

- `allowed_users` permite lecturas con llave pública
- `app_users` no expone filas a cliente anónimo
- `citas` no expone filas a cliente anónimo

## Brechas detectadas en el repo

- El repo no traía una migración bootstrap del schema base
- El fix `allow_read_allowed_users` existía como SQL suelto, pero no como migración ordenada
- La RPC `sync_users_complete` se usa desde el código pero no estaba versionada en `migrations/`
- La documentación mezcla `NEXT_PUBLIC_SUPABASE_KEY` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Parte de la documentación describe columnas o funciones que no fueron validadas en la base real

## Archivos creados para replicación

- `migrations/00-bootstrap-schema.sql`
- `migrations/02-fix-allowed-users-rls.sql`
- `migrations/03-sync-users-complete.sql`
- `migrations/04-consultation-automation.sql`
- `migrations/05-citas-audit.sql`
- `rescue/supabase-public-rebuild.sql`
- `scripts/verify-supabase-live.js`

## Orden recomendado

1. Ejecutar `migrations/00-bootstrap-schema.sql`
2. Ejecutar `migrations/01-implement-rls.sql`
3. Ejecutar `migrations/02-fix-allowed-users-rls.sql`
4. Ejecutar `migrations/03-sync-users-complete.sql`
5. Ejecutar `migrations/04-consultation-automation.sql`
6. Ejecutar `migrations/05-citas-audit.sql`
7. Ejecutar `npm run verify:supabase`

## Archivo de rescate recomendado

Si el objetivo es conservar una version portable del proyecto para recrearlo despues en otro proyecto de Supabase o incluso en otro Postgres compatible, el archivo principal es:

- `rescue/supabase-public-rebuild.sql`

Ese archivo consolida lo confirmado del schema `public` sin depender del `project ref` original.

## Limitaciones actuales del rescate

- El rescate del schema `public` es alto, pero no total
- Aun no se ha versionado el trigger `enviar_notificacion_telegram`
- La parte de Telegram podria depender de extensiones o configuracion adicional del proyecto original
- Segun el historial funcional del proyecto, Telegram no es parte del nucleo minimo necesario para recrear la base

## Variables de entorno

El código ahora acepta cualquiera de estas dos variables para la llave pública:

- `NEXT_PUBLIC_SUPABASE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Se mantiene obligatorio:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
