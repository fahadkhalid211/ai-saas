import { MonitoringConfig } from './types';

function envNumber(key: string, fallback: number): number {
  const val = process.env[key];
  if (!val) return fallback;
  const num = Number(val);
  return Number.isFinite(num) && num >= 0 ? num : fallback;
}

export function getMonitoringConfig(): MonitoringConfig {
  return {
    errorRateWarning: envNumber('MONITOR_ERROR_RATE_WARN', 0.05), // 5%
    errorRateCritical: envNumber('MONITOR_ERROR_RATE_CRIT', 0.20), // 20%
    latencyWarningMs: envNumber('MONITOR_LATENCY_WARN_MS', 1500),
    latencyCriticalMs: envNumber('MONITOR_LATENCY_CRIT_MS', 4000),
    consecutiveFailuresWarning: envNumber('MONITOR_FAILURES_WARN', 3),
    consecutiveFailuresCritical: envNumber('MONITOR_FAILURES_CRIT', 5),
    alertCooldownMinutes: envNumber('MONITOR_ALERT_COOLDOWN_MIN', 30),
    rawEventsRetentionDays: envNumber('MONITOR_RAW_RETENTION_DAYS', 30),
    errorsRetentionDays: envNumber('MONITOR_ERRORS_RETENTION_DAYS', 90),
    incidentsRetentionDays: envNumber('MONITOR_INCIDENTS_RETENTION_DAYS', 365),
    publicStatusRefreshSec: envNumber('MONITOR_STATUS_REFRESH_SEC', 30),
    webhookUrl: process.env.MONITOR_WEBHOOK_URL?.trim() || undefined,
  };
}

export const MONITORED_SERVICES_DEF = [
  {
    id: 'api',
    name: 'API Gateway & Core Endpoints',
    category: 'core' as const,
    description: 'Public and authenticated REST endpoints, JSON routing, and middleware.',
  },
  {
    id: 'database',
    name: 'Database (PostgreSQL / Supabase)',
    category: 'data' as const,
    description: 'Relational database pool, state persistence, embeddings and chunks.',
  },
  {
    id: 'auth',
    name: 'Authentication & Session Engine',
    category: 'core' as const,
    description: 'User login, 2FA, session tokens, master auth, and security gates.',
  },
  {
    id: 'chatbot',
    name: 'Chatbot & Streaming Engine',
    category: 'ai' as const,
    description: 'AI chat widget, conversation streaming, session history, and prompt synthesis.',
  },
  {
    id: 'ai',
    name: 'AI / LLM Provider Gateways',
    category: 'ai' as const,
    description: 'Connectivity to OpenAI, Anthropic, Gemini, Groq, and custom provider keys.',
  },
  {
    id: 'booking',
    name: 'Appointment & Booking System',
    category: 'core' as const,
    description: 'Calendar slot locking mutex, double-booking prevention, and appointment records.',
  },
  {
    id: 'knowledge',
    name: 'Knowledge Base & Vector Search',
    category: 'data' as const,
    description: 'Document extraction, text chunking, semantic retrieval, and cosine similarity.',
  },
  {
    id: 'scraper',
    name: 'Web Scraping & URL Crawler',
    category: 'data' as const,
    description: 'Cheerio content extraction, sitemap crawl, and YouTube transcript ingestion.',
  },
  {
    id: 'workers',
    name: 'Background Workers & Cron',
    category: 'infra' as const,
    description: 'Scheduled reminders, ticket lifecycle, recrawl jobs, and log retention.',
  },
  {
    id: 'notifications',
    name: 'Email & Notification Dispatcher',
    category: 'channels' as const,
    description: 'SMTP / Resend delivery, push tokens, and in-app notification center.',
  },
  {
    id: 'channels',
    name: 'Omnichannel Webhooks & Voice',
    category: 'channels' as const,
    description: 'Stripe webhooks, WhatsApp, Telegram, Google Sheets, and telephony worker.',
  },
] as const;
