#!/usr/bin/env node
/**
 * Read-only health and security check of the Postgres database the app is configured to use.
 *
 *   npm run db:verify              uses DATABASE_URL from .env / the environment
 *   npm run db:verify -- --strict  exit code 1 when anything FAILs
 *
 * It only runs SELECTs and never prints the password.
 */
import fs from 'node:fs';
import pg from 'pg';

const env = {};
if (fs.existsSync('.env')) {
  for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
Object.assign(env, Object.fromEntries(Object.entries(process.env).filter(([, v]) => typeof v === 'string')));

const raw = env.DATABASE_URL || env.POSTGRES_URL;
if (!raw) {
  console.error('DATABASE_URL is not set.');
  process.exit(2);
}

// Same TLS rules as lib/db/postgres.ts (resolvePostgresConnection).
const u = new URL(raw);
const sslmode = (u.searchParams.get('sslmode') || '').toLowerCase();
for (const k of ['sslmode', 'ssl', 'sslcert', 'sslkey', 'sslrootcert', 'uselibpqcompat']) u.searchParams.delete(k);
const privateHost = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)|^[^.]+$/.test(u.hostname);
const ca = (env.DATABASE_SSL_CA || '').replace(/\\n/g, '\n').trim();
let ssl = { rejectUnauthorized: false };
if (sslmode === 'disable' || (!sslmode && privateHost && !ca)) ssl = false;
else if (ca) ssl = { rejectUnauthorized: true, ca };
else if (sslmode === 'verify-full' || sslmode === 'verify-ca') ssl = { rejectUnauthorized: true };

const results = [];
const add = (level, name, detail) => results.push({ level, name, detail });

const pool = new pg.Pool({ connectionString: u.toString(), ssl, max: 1, connectionTimeoutMillis: 8000 });
const q = async (sql, params) => (await pool.query(sql, params)).rows;

try {
  // 1. Reachable + latency
  const times = [];
  for (let i = 0; i < 5; i++) {
    const t = performance.now();
    await q('select 1');
    times.push(performance.now() - t);
  }
  times.sort((a, b) => a - b);
  const median = Math.round(times[2]);
  add(median > 150 ? 'WARN' : 'OK', 'latency', `${median} ms per query (median of 5). ${median > 150 ? 'Host the app in the same region as the database (vercel.json "regions").' : ''}`.trim());

  const [info] = await q(`select version() v, current_user u,
    (select rolsuper from pg_roles where rolname = current_user) su,
    (select setting from pg_settings where name = 'ssl') ssl_on,
    (select setting from pg_settings where name = 'max_connections')::int maxc,
    (select count(*) from pg_stat_activity)::int conns`);
  add('OK', 'server', info.v.split(' on ')[0]);

  // 2. Encryption in transit
  const [tls] = await q('select ssl, version, cipher from pg_stat_ssl where pid = pg_backend_pid()');
  if (tls?.ssl) add('OK', 'connection TLS', `${tls.version} ${tls.cipher}`);
  else add(privateHost ? 'WARN' : 'FAIL', 'connection TLS', 'this connection is NOT encrypted; the password and all data cross the network in clear text.');
  add(info.ssl_on === 'on' ? 'OK' : 'FAIL', 'server ssl', `ssl = ${info.ssl_on}`);
  if (tls?.ssl && ssl && ssl.rejectUnauthorized === false) add('WARN', 'certificate', 'encrypted but the server certificate is not verified (set DATABASE_SSL_CA).');

  // 3. Least privilege
  add(info.su ? 'FAIL' : 'OK', 'app login', info.su ? `"${info.u}" is a superuser: any bug becomes full control of the server. Use a limited role.` : `"${info.u}" is not a superuser`);

  // 4. Tables
  const want = ['kortex_app_state', 'kortex_conversations', 'kortex_messages', 'kortex_leads', 'kortex_appointments', 'kortex_notifications', 'kortex_unanswered_queries', 'kortex_widget_events', 'kortex_chunks'];
  const have = await q(`select c.relname t, c.relrowsecurity rls, pg_get_userbyid(c.relowner) owner, pg_total_relation_size(c.oid)::bigint bytes
    from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' and c.relname like 'kortex_%'`);
  const names = new Set(have.map((r) => r.t));
  const missing = want.filter((t) => !names.has(t));
  if (!names.has('kortex_app_state')) add('FAIL', 'tables', 'kortex_app_state is missing.');
  const relational = env.DB_RELATIONAL_MODE === 'true';
  if (missing.length && missing.some((t) => t !== 'kortex_app_state')) {
    add(relational ? 'FAIL' : 'WARN', 'relational schema', `missing: ${missing.filter((t) => t !== 'kortex_app_state').join(', ')}. Run: npm run db:schema`);
  } else add('OK', 'relational schema', 'all tables present');
  add(relational ? 'OK' : 'WARN', 'DB_RELATIONAL_MODE', relational ? 'on' : 'off: chats, leads and bookings are stored inside one JSON row that every write replaces, so two servers writing at once can silently drop each other\'s changes and double-book a slot.');
  const notOwned = have.filter((r) => r.owner !== info.u && !info.su);
  if (notOwned.length) add('FAIL', 'table ownership', `${notOwned.map((r) => r.t).join(', ')} are owned by another role; with row-level security on, this login will see no rows. Transfer ownership (ops/postgres-harden.md).`);
  const noRls = have.filter((r) => !r.rls);
  if (noRls.length) add('WARN', 'row-level security', `off for: ${noRls.map((r) => r.t).join(', ')}`);

  // 5. Double-booking guard
  if (names.has('kortex_appointments')) {
    const [idx] = await q("select count(*)::int n from pg_indexes where indexname = 'idx_kortex_appointments_slot_unique'");
    add(idx.n ? 'OK' : 'FAIL', 'slot unique index', idx.n ? 'present (the database refuses two bookings for one slot)' : 'missing: two servers can book the same slot.');
  }

  // 6. Extensions, capacity, blob growth
  const ext = (await q('select extname from pg_extension')).map((r) => r.extname);
  add(ext.includes('vector') ? 'OK' : 'WARN', 'pgvector', ext.includes('vector') ? 'installed' : 'not installed');
  add(info.conns > info.maxc * 0.7 ? 'WARN' : 'OK', 'connections', `${info.conns} of ${info.maxc} in use`);
  if (names.has('kortex_app_state')) {
    const [row] = await q("select pg_column_size(data)::bigint bytes, updated_at from kortex_app_state where id = 'default'");
    if (row) {
      const mb = Number(row.bytes) / 1048576;
      add(mb > 8 ? 'WARN' : 'OK', 'app state row', `${mb.toFixed(1)} MB, every write rewrites all of it${mb > 8 ? ' (move to relational mode)' : ''}`);
    } else add('WARN', 'app state row', "no 'default' row yet");
  }

  // 7. Who can log in from where (superuser only)
  try {
    const rules = await q('select type, database, user_name, address, auth_method from pg_hba_file_rules');
    const open = rules.filter((r) => (r.type === 'host' || r.type === 'hostnossl') && r.address === 'all');
    add(open.length ? 'FAIL' : 'OK', 'pg_hba', open.length ? 'a rule lets clients connect over the internet WITHOUT TLS (use hostssl).' : 'remote access is TLS-only');
    const rootOpen = rules.filter((r) => r.type === 'hostssl' && r.address === 'all' && [].concat(r.user_name).some((n) => n === 'all' || n === 'postgres'));
    if (rootOpen.length) add('WARN', 'pg_hba', 'the superuser (or all users) can log in remotely; restrict remote access to the app role.');
  } catch {
    add('OK', 'pg_hba', 'not readable by this login (expected for a limited role)');
  }
} catch (err) {
  add('FAIL', 'connect', err.message.replace(/(:\/\/[^:]+:)[^@]+@/, '$1***@'));
} finally {
  await pool.end().catch(() => {});
}

const order = { FAIL: 0, WARN: 1, OK: 2 };
results.sort((a, b) => order[a.level] - order[b.level]);
const color = { FAIL: '\x1b[31m', WARN: '\x1b[33m', OK: '\x1b[32m' };
for (const r of results) console.log(`${color[r.level]}${r.level.padEnd(4)}\x1b[0m ${r.name.padEnd(20)} ${r.detail}`);
const fails = results.filter((r) => r.level === 'FAIL').length;
console.log(`\n${fails} failing, ${results.filter((r) => r.level === 'WARN').length} warnings`);
if (fails && process.argv.includes('--strict')) process.exit(1);
