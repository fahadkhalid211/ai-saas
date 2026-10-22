/**
 * Checks the settings the server is starting with for the mistakes that turn into a break-in: a master key that is a
 * placeholder or too short, an encryption secret that is missing or the same as the master key, a database reached without
 * TLS or as the superuser.
 *
 * It only reports. Whether to refuse to start is the caller's decision (see instrumentation.ts): a hard failure at boot
 * would take a live site down over a setting that has been wrong, and working, for a long time. It never returns or logs a
 * secret, only the setting's name and what is wrong with it.
 */

export interface EnvProblem {
  name: string;
  problem: string;
  severity: 'fail' | 'warn';
}

const PLACEHOLDER = /change_me|changeme|default|example|your[-_]|kortex_|secret_key|password|^test/i;

function weakSecret(name: string, value: string | undefined, min: number, required: boolean): EnvProblem | null {
  if (!value) return required ? { name, problem: 'is not set', severity: 'fail' } : null;
  if (PLACEHOLDER.test(value)) return { name, problem: 'looks like a placeholder value', severity: 'fail' };
  if (value.length < min) return { name, problem: `is only ${value.length} characters (use at least ${min})`, severity: 'fail' };
  return null;
}

export function findWeakSettings(env: Record<string, string | undefined>): EnvProblem[] {
  const problems: EnvProblem[] = [];
  const add = (p: EnvProblem | null) => p && problems.push(p);

  add(weakSecret('ADMIN_API_KEY', env.ADMIN_API_KEY, 32, true));
  add(weakSecret('ENCRYPTION_SECRET', env.ENCRYPTION_SECRET, 32, true));
  if (env.ENCRYPTION_SECRET && env.ADMIN_API_KEY && env.ENCRYPTION_SECRET === env.ADMIN_API_KEY) {
    problems.push({ name: 'ENCRYPTION_SECRET', problem: 'is the same value as ADMIN_API_KEY', severity: 'warn' });
  }
  add(weakSecret('CRON_SECRET', env.CRON_SECRET, 24, false));
  if (!env.CRON_SECRET) {
    problems.push({ name: 'CRON_SECRET', problem: 'is not set, so the scheduled jobs are protected by the master key', severity: 'warn' });
  }

  const db = env.DATABASE_URL || env.POSTGRES_URL;
  if (db) {
    try {
      const url = new URL(db);
      const isPrivate = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)|^[^.]+$/.test(url.hostname);
      const mode = (url.searchParams.get('sslmode') || '').toLowerCase();
      if (!isPrivate && mode === 'disable') {
        problems.push({ name: 'DATABASE_URL', problem: 'reaches a remote database without TLS (sslmode=disable)', severity: 'fail' });
      }
      if (!isPrivate && mode !== 'disable' && !env.DATABASE_SSL_CA && mode !== 'verify-full' && mode !== 'verify-ca') {
        problems.push({ name: 'DATABASE_SSL_CA', problem: 'is not set, so the database connection is encrypted but the certificate of the server is not checked', severity: 'warn' });
      }
      if (decodeURIComponent(url.username) === 'postgres') {
        problems.push({ name: 'DATABASE_URL', problem: 'connects as the "postgres" superuser', severity: 'warn' });
      }
    } catch {
      problems.push({ name: 'DATABASE_URL', problem: 'is not a valid URL', severity: 'fail' });
    }
  }

  if (!env.UPSTASH_REDIS_REST_URL || !env.UPSTASH_REDIS_REST_TOKEN) {
    problems.push({ name: 'UPSTASH_REDIS_REST_*', problem: 'is not set, so rate limits and booking locks are per server instance', severity: 'warn' });
  }
  if (env.LEMONSQUEEZY_API_KEY && !env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    problems.push({ name: 'LEMONSQUEEZY_WEBHOOK_SECRET', problem: 'is not set although Lemon Squeezy is configured, so payments never reach the workspace and webhooks are not verified', severity: 'fail' });
  }
  return problems;
}
