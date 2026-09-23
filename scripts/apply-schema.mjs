#!/usr/bin/env node
/**
 * Applies the relational schema (supabase/*.sql) to the database in DATABASE_URL.
 * Every file is idempotent (IF NOT EXISTS / DROP POLICY IF EXISTS), so running it twice is safe.
 * Each file runs in its own transaction: a failure leaves that file entirely unapplied.
 *
 *   npm run db:schema            apply
 *   npm run db:schema -- --dry   list what would run, change nothing
 *
 * Run it as the same role the app uses (so that role owns the tables and is not blocked by row-level security),
 * or afterwards transfer ownership as described in ops/postgres-harden.md.
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
const dry = process.argv.includes('--dry');
const FILES = ['supabase/schema-relational-v2.sql', 'supabase/schema-relational-v3-widget-events.sql', 'supabase/schema-chunks-v2.sql'];

const u = new URL(raw);
const sslmode = (u.searchParams.get('sslmode') || '').toLowerCase();
for (const k of ['sslmode', 'ssl', 'sslcert', 'sslkey', 'sslrootcert', 'uselibpqcompat']) u.searchParams.delete(k);
const privateHost = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)|^[^.]+$/.test(u.hostname);
const ca = (env.DATABASE_SSL_CA || '').replace(/\\n/g, '\n').trim();
let ssl = { rejectUnauthorized: false };
if (sslmode === 'disable' || (!sslmode && privateHost && !ca)) ssl = false;
else if (ca) ssl = { rejectUnauthorized: true, ca };
else if (sslmode === 'verify-full' || sslmode === 'verify-ca') ssl = { rejectUnauthorized: true };

const pool = new pg.Pool({ connectionString: u.toString(), ssl, max: 1, connectionTimeoutMillis: 8000 });
let failed = false;
try {
  const [me] = (await pool.query('select current_user u, (select rolsuper from pg_roles where rolname = current_user) su')).rows;
  console.log(`Connected as ${me.u}${me.su ? ' (superuser)' : ''}${dry ? ' [dry run]' : ''}`);
  for (const file of FILES) {
    const sql = fs.readFileSync(file, 'utf8');
    if (dry) {
      console.log(`  would apply ${file} (${sql.split('\n').length} lines)`);
      continue;
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('COMMIT');
      console.log(`  applied ${file}`);
    } catch (err) {
      await client.query('ROLLBACK').catch(() => {});
      failed = true;
      console.error(`  FAILED ${file}: ${err.message}`);
    } finally {
      client.release();
    }
  }
} catch (err) {
  failed = true;
  console.error('Could not connect:', err.message.replace(/(:\/\/[^:]+:)[^@]+@/, '$1***@'));
} finally {
  await pool.end().catch(() => {});
}
process.exit(failed ? 1 : 0);
