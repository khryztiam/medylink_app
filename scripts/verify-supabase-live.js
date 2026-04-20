require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !publishableKey || !serviceRoleKey) {
  console.error('Faltan variables Supabase requeridas en .env/.env.local');
  process.exit(1);
}

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const anon = createClient(supabaseUrl, publishableKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function verifyTable(table, columns) {
  const { data, error, count } = await admin
    .from(table)
    .select(columns, { count: 'exact' })
    .limit(1);

  return {
    table,
    ok: !error,
    count,
    error: error
      ? {
          code: error.code || null,
          message: error.message,
        }
      : null,
    sampleKeys: data?.[0] ? Object.keys(data[0]) : [],
  };
}

async function verifyRpc(name, args) {
  const { error } = await admin.rpc(name, args);

  return {
    rpc: name,
    ok: !error,
    error: error
      ? {
          code: error.code || null,
          message: error.message,
        }
      : null,
  };
}

async function verifyAnon(table, columns = '*') {
  const { data, error } = await anon.from(table).select(columns).limit(1);

  return {
    table,
    ok: !error,
    rows: data?.length ?? 0,
    error: error
      ? {
          code: error.code || null,
          message: error.message,
        }
      : null,
  };
}

async function main() {
  const tableChecks = await Promise.all([
    verifyTable('app_users', 'id,idsap,role,status,created_at,telegram_id'),
    verifyTable('allowed_users', 'idsap,nombre,grupo,puesto'),
    verifyTable(
      'citas',
      'id,idSAP,nombre,motivo,estado,orden_llegada,created_at,doctor_name,programmer_at,check_in,check_out,consultation_at,emergency,isss'
    ),
  ]);

  const rpcChecks = await Promise.all([
    verifyRpc('sync_users_complete', {
      add_users: [],
      update_users: [],
      remove_ids: [],
    }),
  ]);

  const anonChecks = await Promise.all([
    verifyAnon('allowed_users', 'idsap,nombre'),
    verifyAnon('app_users', 'id'),
    verifyAnon('citas', 'id'),
  ]);

  console.log('\nTables');
  for (const result of tableChecks) {
    console.log(JSON.stringify(result));
  }

  console.log('\nRPC');
  for (const result of rpcChecks) {
    console.log(JSON.stringify(result));
  }

  console.log('\nAnon RLS');
  for (const result of anonChecks) {
    console.log(JSON.stringify(result));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
