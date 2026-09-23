#!/usr/bin/env node
/**
 * Checks the environment this app will run with for weak or missing security settings.
 *
 *   node scripts/security-check.mjs            reads .env (if present) plus the real environment
 *   node scripts/security-check.mjs --strict   exits 1 if anything is a FAIL (use it in CI)
 *
 * It never prints a secret, only its length and whether it looks like a placeholder.
 */
import fs from 'node:fs';

const env = {};
if (fs.existsSync('.env')) {
  for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
Object.assign(env, Object.fromEntries(Object.entries(process.env).filter(([, v]) => typeof v === 'string')));

const results = [];
const add = (level, name, detail) => results.push({ level, name, detail });
const PLACEHOLDER = /change_me|changeme|default|example|your[-_]|kortex_|secret_key|password|^test/i;

function secret(name, { min = 32, required = true, why }) {
  const v = env[name];
  if (!v) return add(required ? 'FAIL' : 'WARN', name, `not set. ${why}`);
  if (PLACEHOLDER.test(v)) return add('FAIL', name, `looks like a placeholder. ${why}`);
  if (v.length < min) return add('FAIL', name, `only ${v.length} characters; use at least ${min}. ${why}`);
  add('OK', name, `${v.length} characters`);
}

secret('ADMIN_API_KEY', {
  why: 'It is the master password AND the key that signs every login session, so a short one can be cracked offline from any session cookie. Generate one: openssl rand -hex 32',
});
secret('ENCRYPTION_SECRET', {
  why: 'Encrypts customers\' stored AI provider keys. Without it the app falls back to ADMIN_API_KEY, so changing that key would make stored keys unreadable.',
});
if (env.ENCRYPTION_SECRET && env.ADMIN_API_KEY && env.ENCRYPTION_SECRET === env.ADMIN_API_KEY) {
  add('WARN', 'ENCRYPTION_SECRET', 'is identical to ADMIN_API_KEY; use a separate value.');
}
secret('CRON_SECRET', { why: 'Protects /api/cron/reminders. Without it the admin key is used.', required: false });

const app = env.NEXT_PUBLIC_APP_URL;
if (!app) add('WARN', 'NEXT_PUBLIC_APP_URL', 'not set; OAuth redirects and links fall back to the request host.');
else if (!/^https:\/\//i.test(app) && !/localhost/.test(app)) add('WARN', 'NEXT_PUBLIC_APP_URL', 'should start with https://');
else add('OK', 'NEXT_PUBLIC_APP_URL', app);

const db = env.DATABASE_URL || env.POSTGRES_URL;
if (!db) {
  add('WARN', 'DATABASE_URL', 'not set: data is kept in a local file and is lost on serverless hosts.');
} else {
  try {
    const u = new URL(db);
    const host = u.hostname;
    const isPrivate = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)|^[^.]+$/.test(host);
    const mode = (u.searchParams.get('sslmode') || '').toLowerCase();
    if (!isPrivate && mode === 'disable') {
      add('FAIL', 'DATABASE_URL', `talks to ${host} without TLS (sslmode=disable): the password and all customer data cross the internet in clear text.`);
    } else if (!isPrivate && !env.DATABASE_SSL_CA && mode !== 'verify-full') {
      add('WARN', 'DATABASE_URL', 'TLS is on but the server certificate is not verified. Set DATABASE_SSL_CA (or sslmode=verify-full with a public certificate).');
    } else add('OK', 'DATABASE_URL', isPrivate ? 'private network' : 'TLS with certificate verification');
    if (decodeURIComponent(u.username) === 'postgres') {
      add('FAIL', 'DATABASE_URL', 'connects as the "postgres" superuser. Create a limited role for the app (see ops/postgres-harden.md).');
    }
    if (decodeURIComponent(u.password).length < 20) add('WARN', 'DATABASE_URL', 'database password is shorter than 20 characters.');
    if (!isPrivate && env.DATABASE_REQUIRE_TLS !== 'true') add('WARN', 'DATABASE_REQUIRE_TLS', 'set to true once TLS works so the app refuses to fall back to plain text.');
  } catch {
    add('FAIL', 'DATABASE_URL', 'is not a valid URL.');
  }
}

if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
  add('WARN', 'UPSTASH_REDIS_REST_*', 'not set: rate limits count per server instance, so an attacker spread across instances gets a multiple of every limit.');
} else add('OK', 'UPSTASH_REDIS_REST_*', 'set (rate limits are shared across instances)');

if (env.STRIPE_SECRET_KEY && !env.STRIPE_WEBHOOK_SECRET) add('FAIL', 'STRIPE_WEBHOOK_SECRET', 'Stripe is configured but webhooks are not verified.');
if (env.VOICE_WORKER_SECRET) secret('VOICE_WORKER_SECRET', { why: 'Signs requests from the phone worker.' });
if (env.VOICE_WEBHOOK_SECRET) secret('VOICE_WEBHOOK_SECRET', { why: 'Authenticates the carrier webhook.', min: 24 });

const order = { FAIL: 0, WARN: 1, OK: 2 };
results.sort((a, b) => order[a.level] - order[b.level]);
const color = { FAIL: '\x1b[31m', WARN: '\x1b[33m', OK: '\x1b[32m' };
for (const r of results) console.log(`${color[r.level]}${r.level.padEnd(4)}\x1b[0m ${r.name.padEnd(24)} ${r.detail}`);
const fails = results.filter((r) => r.level === 'FAIL').length;
const warns = results.filter((r) => r.level === 'WARN').length;
console.log(`\n${fails} failing, ${warns} warnings, ${results.length - fails - warns} ok`);
if (fails && process.argv.includes('--strict')) process.exit(1);
