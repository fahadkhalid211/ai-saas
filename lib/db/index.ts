import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { cosineSimilarity, keywordRelevance, reciprocalRankFusion } from '../rag/vector-math';
import { chunkProfileId, embeddingProfile, vectorTag } from '../rag/embedding-profile';
import { SearchResultChunk } from '../rag/types';
import { clearRetrievalCache } from '../rag/cache';
import { encryptSecret, decryptSecret } from '../security/crypto';
import { hashPassword, verifyPassword, isHashedPassword, generateTempPassword, timingSafeStringEqual } from '../security/password';
import { getMasterEmail } from '@/lib/security/master';
import { logEvent } from '../logging/logger';
import { guideChunks } from '../platform/knowledge';
import { BookingUnavailableError } from '../appointments/errors';
import type { CalendarLink, ExternalBlock } from '../calendar/sync/types';
import {
  LandingPageConfig,
  LandingPageServiceItem,
  LandingPageGalleryItem,
  LandingPageTestimonialItem,
  LandingPageWorkingHours,
  DEFAULT_BUSINESS_LANDING_CONFIG,
  DEFAULT_BARBER_LANDING_CONFIG,
  DEFAULT_GYM_LANDING_CONFIG,
  DEFAULT_REAL_ESTATE_LANDING_CONFIG,
  DEFAULT_ECOMMERCE_LANDING_CONFIG,
  DEFAULT_SAAS_LANDING_CONFIG,
  DEFAULT_LEGAL_LANDING_CONFIG,
  DEFAULT_HEALTHCARE_LANDING_CONFIG,
  DEFAULT_CRESCELO_CONFIG,
  TEMPLATE_LANDING_CONFIGS,
  getLandingConfigForSlugOrTemplate,
} from '../landing/types';
export * from '../landing/types';
import { resolveDataDir, ensureDirectory, safeAtomicWrite, safeReadFile } from './storage';
export { resolveDataDir, ensureDirectory, safeAtomicWrite, safeReadFile } from './storage';
import {
  isCloudDbConfigured,
  getCloudDbProvider,
  fetchCloudState,
  fetchCloudStateUpdatedAt,
  persistCloudState,
  toCloudPayload,
  PersistCloudStateOptions,
  fetchCloudChunks,
  persistCloudChunks,
} from './cloud';
import { isSupabaseConfigured } from './supabase';
import { isPostgresConfigured, disablePostgresTemporarily, isConnectionError, getPostgresPool } from './postgres';
import * as Relational from './relational';
import * as ChunkStore from './chunk-store';
import * as CalendarFile from './calendar-file-store';
import { BILLING_PLANS } from '../billing/plans';
import { describeLog } from '../logging/describe';
import { applyMerged, mergeState } from './state-merge';
import { TRIAL_PLAN_ID, type SubscriptionStatus } from '../billing/trial';
import { pgVectorStoreEnabled } from './chunk-store';
import { isRedisConfigured, redisGet, redisSet, CACHE_KEYS } from '../cache/redis';
import type { McpTokenRecord, McpAuditLogRecord } from '../mcp/types';
export type { McpTokenRecord, McpAuditLogRecord } from '../mcp/types';
export { isCloudDbConfigured, getCloudDbProvider, isSupabaseConfigured };

/**
 * Schedules non-blocking deferred blob persistence for canary rollback safety.
 * When running inside a Next.js serverless request lifecycle, uses after() from next/server
 * to ensure the runtime does not freeze/terminate the function before the blob is saved.
 * Falls back to background promise execution outside Next.js request lifecycle (e.g. tests, scripts).
 */
/**
 * Relational mode: the item was already written to its own table, so the in-memory copy is updated and the big state row is left
 * alone. (This used to rewrite the whole ~1.3 MB row after every single lead, message or booking.)
 */
function afterHotWrite(state: DatabaseState): void {
  cachedState = state;
}

function scheduleDeferredBlobSync(state: DatabaseState): void {
  try {
    const { after } = require('next/server');
    if (typeof after === 'function') {
      after(async () => {
        try {
          await saveState(state);
        } catch (err) {
          console.warn('[BlobSync] Deferred sync failed:', err);
        }
      });
      return;
    }
  } catch {
    // Outside Next.js request context
  }

  saveState(state).catch((err) => {
    console.warn('[BlobSync] Background sync failed:', err);
  });
}

/**
 * Relational mode: when true, the 6 high-frequency transactional collections
 * (messages, conversations, leads, appointments, notifications, unansweredQueries)
 * write to dedicated Postgres tables instead of the monolithic JSON blob.
 *
 * DEFAULT: false (blob remains authoritative until you validate in production).
 *
 * Sunset plan:
 *   Phase A (now): dual-write, blob stays authoritative, flag OFF.
 *   Phase B: set DB_RELATIONAL_MODE=true in production env after running
 *             supabase/schema-relational-v2.sql and verifying reads match.
 *   Phase C: remove all blob-write paths for the 6 collections in a follow-up
 *             PR and delete this function (strangler-fig cleanup).
 */
function isRelationalModeEnabled(): boolean {
  return process.env.DB_RELATIONAL_MODE === 'true' && isPostgresConfigured();
}

/**
 * True when this deployment is configured for relational mode (DB_RELATIONAL_MODE=true), whether or not Postgres
 * is reachable right now. Unlike isRelationalModeEnabled it ignores the temporary outage flag, so booking writes can
 * tell "Postgres is down" apart from "this deployment never used Postgres" and refuse instead of writing to the
 * JSON state, which has no unique index or exclusion constraint to stop two bookings taking the same slot.
 */
export function isRelationalModeRequired(): boolean {
  return process.env.DB_RELATIONAL_MODE === 'true';
}

// Types matching the Prisma model
export interface AssistantData {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  systemPrompt: string;
  welcomeMessage: string;
  fallbackMessage: string;
  temperature: number;
  maxTokens?: number;
  contextChunks?: number;
  provider: string; // ollama, groq, openai, anthropic, gemini, deepseek, custom
  modelName: string;
  apiKeyEncrypted?: string;
  /** The provider the saved key was pasted for. Server-controlled: a key is never used with another provider. */
  apiKeyProvider?: string;
  /** What the last check of the AI key found (lib/ai/key-health.ts). Written only by the server, never accepted from a client. */
  aiKeyStatus?: {
    state: 'valid' | 'invalid' | 'unreachable';
    message: string;
    checkedAt: string;
    /** Which key and provider the check was about, so a changed key is never judged by an old result. */
    fingerprint: string;
    provider: string;
  };
  /** Computed for the screens (see lib/ai/key-health.ts); never stored. */
  hasConnectedKey?: boolean;
  keyHealth?: unknown;
  customBaseUrl?: string;
  /** Monthly spending limit on the customer's own AI key (see lib/ai/spend/guard.ts). */
  costCap?: CostCapSettings;
  primaryColor: string;
  /** Short name shown at the top of the chat widget instead of the assistant's own name (lib/widget/title.ts). */
  widgetTitle?: string;
  avatarUrl?: string;
  launcherPosition: string;
  starterQuestions: string[];
  collectLeadEmail: boolean;
  allowWebSearch?: boolean;
  allowedDomains: string[];
  supportReceiverEmail?: string;
  supportCcEmails?: string[];
  supportCustomFields?: SupportCustomField[];
  /** Secret in the address of the owner's read-only feed of Crescelo bookings (lib/calendar/sync). Server-generated; at least 20 characters. */
  calendarFeedToken?: string;
  telegramBotToken?: string;
  telegramBotEnabled?: boolean;
  whatsappPhoneNumberId?: string;
  whatsappAccessToken?: string;
  whatsappVerifyToken?: string;
  whatsappEnabled?: boolean;
  webhookUrl?: string;
  webhookSecret?: string;
  webhookEvents?: string[];
  slackWebhookUrl?: string;
  slackEnabled?: boolean;
  slackEvents?: string[];
  googleSheetsWebhookUrl?: string;
  googleSheetsEnabled?: boolean;
  googleSheetsEvents?: string[];
  whiteLabelEnabled?: boolean;
  customBrandingText?: string;
  customBrandingUrl?: string;
  proactiveMessageEnabled?: boolean;
  proactiveMessageText?: string;
  proactiveMessageDelay?: number;
  bookingEnabled?: boolean;
  bookingProvider?: 'direct' | 'calendly' | 'cal_com';
  bookingUrl?: string;
  bookingPromptText?: string;
  bookingSlotDuration?: number;
  bookingStartHour?: string;
  bookingEndHour?: string;
  bookingAvailableDays?: string[];
  /** IANA timezone of the business, used for "today", opening hours and reminders. Defaults to UTC. */
  timezone?: string;
  // Phone channel (inbound AI calls)
  phoneEnabled?: boolean;
  /** E.164 number callers dial. Unique across assistants; assigned by the platform admin. */
  phoneNumber?: string;
  phoneGreeting?: string;
  /** BCP-47 language for speech recognition and the voice, e.g. "en". */
  phoneLanguage?: string;
  phoneVoice?: string;
  /** E.164 number to ring when the caller asks for a person, or when the AI service is unavailable. */
  phoneTransferNumber?: string;
  phoneAfterHours?: 'ai' | 'voicemail' | 'forward';
  phoneMaxCallMinutes?: number;
  landingPageConfig?: LandingPageConfig;
  createdAt: string;
  updatedAt: string;
}

export interface CostCapSettings {
  enabled: boolean;
  /** US dollars per calendar month (UTC). */
  monthlyUsd: number;
  /** What happens once the month's estimated spend reaches the cap. */
  onLimit: 'fallback_groq' | 'stop';
}

export interface SupportCustomField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'tel' | 'select';
  required: boolean;
  options?: string[];
}

export interface KnowledgeSourceData {
  id: string;
  assistantId: string;
  title: string;
  type: string; // pdf, csv, json, docx, txt, description
  fileUrl?: string;
  fileSizeBytes?: number;
  status: string; // pending, processing, ready, failed
  errorMessage?: string;
  errorResolution?: string;
  chunkCount: number;
  corrections?: Array<{
    id: string;
    type: 'replace' | 'note' | 'edit';
    findText?: string;
    replaceText?: string;
    note?: string;
    appliedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface ChunkRecord {
  id: string;
  assistantId: string;
  knowledgeSourceId: string;
  content: string;
  chunkIndex: number;
  tokenCount: number;
  metadata: Record<string, any>;
  embedding: number[];
  createdAt: string;
}

export interface ConversationData {
  id: string;
  assistantId: string;
  visitorId?: string;
  visitorEmail?: string;
  visitorName?: string;
  sentiment?: 'urgent' | 'positive' | 'neutral';
  escalated?: boolean;
  resolved?: boolean;
  isLiveTakeover?: boolean;
  assignedAgentName?: string;
  status?: 'bot' | 'waiting_for_agent' | 'live_agent' | 'resolved';
  createdAt: string;
  updatedAt?: string;
  messages?: MessageData[];
}

export interface MessageData {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system' | 'agent';
  content: string;
  citations: any[];
  tokensUsed: number;
  senderName?: string;
  attachment?: {
    name: string;
    type: string;
    size?: number;
    url?: string;
    preview?: string;
  };
  createdAt: string;
}

export interface LeadData {
  id: string;
  assistantId: string;
  email: string;
  name?: string;
  phone?: string;
  notes?: string;
  customData?: Record<string, any>;
  createdAt: string;
}

export interface UnansweredQueryData {
  id: string;
  assistantId: string;
  query: string;
  visitorId?: string;
  createdAt: string;
  resolved?: boolean;
  suggestedAnswer?: string;
}

export interface InvoiceRecord {
  id: string;
  date: string;
  planName: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  pdfUrl?: string;
}

export interface WorkspaceBillingData {
  id: string;
  name: string;
  planId: 'starter' | 'growth' | 'scale';
  planName: string;
  billingInterval: 'monthly' | 'annual';
  monthlyChatLimit: number;
  overageRatePerChat: number;
  landingPageLimit?: number;
  extraLandingPagesCount?: number;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  paymentMethod?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  billingEmail?: string;
  invoices?: InvoiceRecord[];
  /** Free trial (see lib/billing/trial.ts). Absent on workspaces created before the trial existed. */
  /** New workspaces must start a card-backed trial (or subscribe) before assistants serve visitors. */
  requiresSubscription?: boolean;
  trialStartedAt?: string;
  trialEndsAt?: string;
  /** The payment provider's (Lemon Squeezy) customer and subscription ids. */
  billingCustomerId?: string;
  billingSubscriptionId?: string;
  subscriptionStatus?: SubscriptionStatus;
  cancelAtPeriodEnd?: boolean;
  /** Started the free trial without a card during the launch (early-bird) offer. */
  earlyBird?: boolean;
  /** The access code (lib/billing/access-codes.ts) that gave this workspace free access. */
  complimentaryCode?: string;
  /** Set when a payment was disputed or refunded as fraud; the workspace cannot start another trial. */
  billingRisk?: 'fraud_warning' | 'dispute';
}

export interface AppointmentData {
  id: string;
  assistantId: string;
  name: string;
  email: string;
  phone?: string;
  date: string;
  timeSlot: string;
  durationMinutes: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  serviceId?: string;
  serviceName?: string;
  price?: number;
  manageToken?: string;
  cancellationReason?: string;
  landingPageName?: string;
  landingPageSlug?: string;
  remindersSent?: {
    reminder24h?: boolean;
    reminder24hSentAt?: string;
    reminder1h?: boolean;
    reminder1hSentAt?: string;
  };
  /** The booking as UTC instants (ISO); set when the date and time could be read. Half-open: [slotStart, slotEnd). */
  slotStart?: string;
  slotEnd?: string;
  /** When a calendar sync found this booking overlapping a busy block on the owner's calendar; null clears it. */
  externalClashAt?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface TeamMemberData {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  password?: string;
  accessCode?: string;
  role: 'owner' | 'admin' | 'support_agent' | 'billing_manager' | 'viewer';
  status: 'active' | 'invited';
  invitedAt?: string;
  lastLoginAt?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  recoveryCodes?: string[];
  /** Last authenticator time step accepted at sign-in (a code cannot be used twice). */
  twoFactorLastStep?: number;
  /** Raised to end every existing session of this member (password change, 2FA change, sign out everywhere). */
  sessionVersion?: number;
  title?: string;
  avatarUrl?: string;
  /** When the product tour was shown to this member; absent until their first sign-in to the dashboard. */
  tourSeenAt?: string;
  /**
   * Whether this person has shown they own the e-mail address. `false` only for an account created by a password sign-up that
   * has not been confirmed yet; absent means confirmed (accounts that existed before e-mail confirmation, Google sign-ins and
   * invited team members), so no existing account is locked out. See lib/security/email-verification.ts.
   */
  emailVerified?: boolean;
  emailVerifiedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * Strips credential/secret fields (password hash, access code hash, TOTP
 * secret, recovery codes) from a team member record before it is ever sent
 * to a client. Every API route that returns a TeamMemberData object to the
 * browser must pass it through this first.
 */
export function sanitizeTeamMember<T extends Partial<TeamMemberData> | null | undefined>(member: T): T {
  if (!member) return member;
  const { password, accessCode, twoFactorSecret, recoveryCodes, twoFactorLastStep, sessionVersion, ...safe } = member as TeamMemberData;
  return safe as T;
}


export interface PageViewEventData {
  id: string;
  slug: string;
  landingPageName?: string;
  visitorId: string;
  referrer?: string;
  source?: 'direct' | 'google' | 'instagram' | 'facebook' | 'twitter' | 'tiktok' | 'referral' | 'email';
  device?: 'mobile' | 'desktop' | 'tablet';
  browser?: string;
  city?: string;
  country?: string;
  timestamp: string;
}

export interface AuditLogData {
  id: string;
  timestamp: string;
  workspaceId?: string;
  actor: {
    id: string;
    name: string;
    email?: string;
    username?: string;
    ip: string;
  };
  action: string;
  targetType: string;
  targetId?: string;
  details: Record<string, any>;
}

export interface InAppNotificationData {
  id: string;
  assistantId?: string;
  title: string;
  message: string;
  type: 'appointment_booked' | 'appointment_cancelled' | 'lead_captured' | 'takeover_requested' | 'reminder_dispatched' | 'chat_new' | 'chat_message' | 'chat_escalated' | 'cost_cap_warning' | 'cost_cap_reached' | 'calendar_clash' | 'calendar_sync_failed';
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export interface SmtpSettingsData {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  from?: string;
  fromName?: string;
  fromEmail?: string;
  resendApiKey?: string;
  resendFrom?: string;
  provider?: 'smtp' | 'resend';
  updatedAt?: string;
}

export interface CallRecordData {
  id: string;
  assistantId: string;
  conversationId?: string;
  from: string;
  to: string;
  startedAt: string;
  endedAt?: string;
  durationSeconds?: number;
  outcome?: 'answered' | 'booked' | 'transferred' | 'callback' | 'abandoned' | 'failed';
  appointmentId?: string;
  summary?: string;
}

export interface DevicePushTokenRecord {
  id: string;
  token: string;
  memberId?: string;
  workspaceId: string;
  assistantId?: string;
  platform: 'android' | 'ios' | 'web';
  deviceInfo?: string;
  createdAt: string;
  updatedAt: string;
}

interface DatabaseState {
  workspaces: any[];
  assistants: AssistantData[];
  knowledgeSources: KnowledgeSourceData[];
  chunks: ChunkRecord[];
  conversations: ConversationData[];
  messages: MessageData[];
  leads: LeadData[];
  unansweredQueries?: UnansweredQueryData[];
  calls?: CallRecordData[];
  appointments?: AppointmentData[];
  teamMembers?: TeamMemberData[];
  auditLogs?: AuditLogData[];
  notifications?: InAppNotificationData[];
  landingPages?: LandingPageConfig[];
  landingPagesInitialized?: boolean;
  smtpSettings?: SmtpSettingsData;
  pageViews?: PageViewEventData[];
  processedWebhookEvents?: string[];
  pushTokens?: DevicePushTokenRecord[];
  mcpTokens?: McpTokenRecord[];
  mcpAuditLogs?: McpAuditLogRecord[];
}

const DATA_DIR = resolveDataDir();
const DB_FILE = path.join(DATA_DIR, 'db.json');
const VECTORS_FILE = path.join(DATA_DIR, 'vectors.json');

function ensureDataDir(): void {
  ensureDirectory(DATA_DIR);
}

function atomicWriteFileSync(filePath: string, data: string): void {
  safeAtomicWrite(filePath, data);
}

// In-Memory Singleton Caches
let cachedState: DatabaseState | null = null;
let cachedChunks: ChunkRecord[] | null = null;
let assistantChunksIndex: Map<string, ChunkRecord[]> = new Map();
let sourceChunksIndex: Map<string, ChunkRecord[]> = new Map();

function rebuildChunkIndex(chunks: ChunkRecord[]): void {
  const astMap = new Map<string, ChunkRecord[]>();
  const srcMap = new Map<string, ChunkRecord[]>();
  for (const c of chunks) {
    if (c.assistantId) {
      let astList = astMap.get(c.assistantId);
      if (!astList) {
        astList = [];
        astMap.set(c.assistantId, astList);
      }
      astList.push(c);
    }
    if (c.knowledgeSourceId) {
      let srcList = srcMap.get(c.knowledgeSourceId);
      if (!srcList) {
        srcList = [];
        srcMap.set(c.knowledgeSourceId, srcList);
      }
      srcList.push(c);
    }
  }
  assistantChunksIndex = astMap;
  sourceChunksIndex = srcMap;
}

function loadChunksState(): ChunkRecord[] {
  if (cachedChunks !== null) {
    return cachedChunks;
  }
  ensureDataDir();
  const raw = safeReadFile(VECTORS_FILE);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        cachedChunks = parsed;
        rebuildChunkIndex(cachedChunks);
        return cachedChunks;
      }
    } catch (err) {
      console.error('[Database] Failed to read vectors.json:', err);
    }
  }

  // Check bundled vectors file if DATA_DIR was redirected to /tmp
  const bundledVectors = path.join(process.cwd(), '.data', 'vectors.json');
  if (bundledVectors !== VECTORS_FILE) {
    const bundledRaw = safeReadFile(bundledVectors);
    if (bundledRaw) {
      try {
        const parsed = JSON.parse(bundledRaw);
        if (Array.isArray(parsed)) {
          cachedChunks = parsed;
          rebuildChunkIndex(cachedChunks);
          return cachedChunks;
        }
      } catch (err) {
        console.error('[Database] Failed to read bundled vectors.json:', err);
      }
    }
  }

  cachedChunks = [];
  rebuildChunkIndex(cachedChunks);
  return cachedChunks;
}

async function saveChunksState(chunks: ChunkRecord[], overwrite: boolean = false): Promise<void> {
  ensureDataDir();
  cachedChunks = chunks;
  if (cachedState) {
    cachedState.chunks = chunks;
  }
  rebuildChunkIndex(chunks);
  atomicWriteFileSync(VECTORS_FILE, JSON.stringify(chunks, null, 2));

  // Invalidate in-memory retrieval cache for all assistants whose knowledge was modified
  const affectedAssistantIds = new Set(chunks.map((c) => c.assistantId).filter(Boolean));
  affectedAssistantIds.forEach((astId) => clearRetrievalCache(astId));
  if (affectedAssistantIds.size === 0) {
    clearRetrievalCache();
  }

  if (isCloudDbConfigured()) {
    try {
      await persistCloudChunks(chunks, overwrite);
    } catch (err) {
      console.warn('[Database] Failed to sync chunks to Cloud DB:', err);
    }
  }
}

let lastDbFileMtime = 0;

function loadState(): DatabaseState {
  ensureDataDir();
  try {
    const stats = fs.statSync(DB_FILE);
    if (cachedState !== null && stats.mtimeMs <= lastDbFileMtime) {
      return cachedState;
    }
    lastDbFileMtime = stats.mtimeMs;
  } catch {
    if (cachedState !== null) return cachedState;
  }

  let state: DatabaseState | null = null;

  // 1. Try reading DB_FILE from DATA_DIR
  const existingRaw = safeReadFile(DB_FILE);
  if (existingRaw) {
    try {
      state = JSON.parse(existingRaw);
    } catch (err) {
      console.error('[Database] Failed to parse db.json:', err);
    }
  }

  // 2. If DB_FILE did not exist, check bundled db.json (e.g. initial serverless spin-up)
  if (!state) {
    const bundledDb = path.join(process.cwd(), '.data', 'db.json');
    if (bundledDb !== DB_FILE) {
      const bundledRaw = safeReadFile(bundledDb);
      if (bundledRaw) {
        try {
          const parsed = JSON.parse(bundledRaw);
          if (parsed && typeof parsed === 'object') {
            state = parsed;
            saveLocalStateSync(parsed);
          }
        } catch (err) {
          console.error('[Database] Failed to parse bundled db.json:', err);
        }
      }
    }
  }

  // 3. If still not loaded, construct clean initialState
  if (!state) {
    const initialState: DatabaseState = {
      workspaces: [
        {
          id: 'default-workspace',
          name: 'My Workspace',
          plan: 'starter',
          monthlyMessageLimit: 1000,
          messagesUsedThisMonth: 0,
        },
      ],
      assistants: [
        {
          id: 'demo-assistant',
          workspaceId: 'default-workspace',
          name: 'Crescelo AI Concierge',
          description: 'Official Crescelo platform assistant trained to answer questions about platform features, BYOK AI connectors, zero token markup pricing, and dashboard usage.',
          systemPrompt: 'You are the official AI Concierge for Crescelo (crescelo.com). You help visitors and users understand how Crescelo works: connecting AI providers (Google Gemini, OpenAI, Claude, Groq, DeepSeek, Ollama), setting up website assistants, sovereign zero-token markup pricing, knowledge base document & URL ingestion (RAG), and dashboard features. Provide clear, concise, and helpful answers about Crescelo.',
          welcomeMessage: 'Hello! I am the Crescelo Platform Concierge. How can I help you explore our AI assistants, integrations, zero-markup pricing, or dashboard features today?',
          fallbackMessage: "I would be glad to help with any details regarding Crescelo, connecting your AI models, or embedding assistants on your website. Feel free to ask or open a support ticket at crescelo.com/support/contact.",
          temperature: 0.3,
          provider: 'gemini',
          modelName: 'gemini-3.6-flash',
          primaryColor: '#2563eb',
          launcherPosition: 'bottom-right',
          starterQuestions: [
            'How does Zero Token Markup work?',
            'How do I connect Google Gemini or OpenAI?',
            'How do I add a knowledge base to my assistant?',
            'How do I embed the chat widget on my website?',
          ],
          collectLeadEmail: true,
          allowedDomains: [],
          bookingEnabled: false,
          bookingProvider: 'direct',
          bookingPromptText: 'Schedule a Consultation',
          bookingSlotDuration: 30,
          bookingStartHour: '09:00',
          bookingEndHour: '18:00',
          bookingAvailableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      knowledgeSources: [],
      chunks: [],
      conversations: [],
      messages: [],
      leads: [],
      unansweredQueries: [],
      calls: [],
      appointments: [],
      teamMembers: [
        {
          id: 'tm_owner',
          workspaceId: 'default-workspace',
          name: 'Master Admin',
          email: getMasterEmail(),
          role: 'owner',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
      ],
      auditLogs: [],
      notifications: [],
      landingPages: [],
      landingPagesInitialized: true,
      pageViews: [],
    };
    saveLocalStateSync(initialState);
    state = initialState;
  }

  if (!state.unansweredQueries) state.unansweredQueries = [];
  if (!state.calls) state.calls = [];
  if (!state.leads) state.leads = [];
  if (!state.conversations) state.conversations = [];
  if (!state.messages) state.messages = [];
  if (!state.appointments) state.appointments = [];
  if (!state.teamMembers) state.teamMembers = [];
  if (!state.auditLogs) state.auditLogs = [];
  if (!state.notifications) state.notifications = [];
  if (!state.landingPages) state.landingPages = [];
  if (!state.pageViews) state.pageViews = [];
  if (!state.mcpTokens) state.mcpTokens = [];
  if (!state.mcpAuditLogs) state.mcpAuditLogs = [];

  // AUTOMATED ZERO-DOWNTIME MIGRATION:
  // If db.json contains vector chunks, migrate them to vectors.json and strip from db.json
  if (Array.isArray(state.chunks) && state.chunks.length > 0) {
    if (!fs.existsSync(VECTORS_FILE)) {
      console.log(`[Database Migration] Migrating ${state.chunks.length} chunks from db.json to vectors.json...`);
      void saveChunksState(state.chunks);
    }
    state.chunks = [];
    saveLocalStateSync(state);
  }

  const masterOwner = state.teamMembers.find((m) => m.id === 'tm_owner');
  if (masterOwner && masterOwner.email !== getMasterEmail()) {
    masterOwner.email = getMasterEmail();
    saveLocalStateSync(state);
  }

  if (state.teamMembers.length === 0) {
    state.teamMembers.push({
      id: 'tm_owner',
      workspaceId: 'default-workspace',
      name: 'Master Admin',
      email: getMasterEmail(),
      role: 'owner',
      status: 'active',
      createdAt: new Date().toISOString(),
    });
    saveLocalStateSync(state);
  }

  // Ensure demo assistant is clean Crescelo AI Concierge (remove legacy barbershop)
  const demo = (state.assistants || []).find((a: any) => a.id === 'demo-assistant');
  if (demo) {
    if (
      !demo.name ||
      demo.name.includes('Crown & Blade') ||
      demo.systemPrompt?.includes('Barbershop') ||
      demo.systemPrompt?.includes('haircut')
    ) {
      demo.name = 'Crescelo AI Concierge';
      demo.description = 'Official Crescelo platform assistant trained to answer questions about platform features, BYOK AI connectors, zero token markup pricing, and dashboard usage.';
      demo.systemPrompt = 'You are the official AI Concierge for Crescelo (crescelo.com). You help visitors and users understand how Crescelo works: connecting AI providers (Google Gemini, OpenAI, Claude, Groq, DeepSeek, Ollama), setting up website assistants, sovereign zero-token markup pricing, knowledge base document & URL ingestion (RAG), and dashboard features. Provide clear, concise, and helpful answers about Crescelo.';
      demo.welcomeMessage = 'Hello! I am the Crescelo Platform Concierge. How can I help you explore our AI assistants, integrations, zero-markup pricing, or dashboard features today?';
      demo.fallbackMessage = "I would be glad to help with any details regarding Crescelo, connecting your AI models, or embedding assistants on your website. Feel free to ask or open a support ticket at crescelo.com/support/contact.";
      demo.starterQuestions = [
        'How does Zero Token Markup work?',
        'How do I connect Google Gemini or OpenAI?',
        'How do I add a knowledge base to my assistant?',
        'How do I embed the chat widget on my website?',
      ];
      demo.bookingEnabled = false;
      delete demo.landingPageConfig;
      saveLocalStateSync(state);
    }
  }

  // Bind chunks from decoupled vector store
  const chunks = pgVectorStoreEnabled() ? [] : loadChunksState();
  state.chunks = chunks;
  cachedState = state;
  return cachedState;
}

function saveLocalStateSync(state: DatabaseState): void {
  ensureDataDir();
  cachedState = state;
  // Strip heavy vector embeddings before writing transactional db.json
  const { chunks: _chunks, ...transactional } = state;
  const payload = { ...transactional, chunks: [] };
  // compact: indentation made every save about a third bigger, and the whole file is rewritten on each change
  atomicWriteFileSync(DB_FILE, JSON.stringify(payload));
  try {
    lastDbFileMtime = fs.statSync(DB_FILE).mtimeMs;
  } catch {}
}

/**
 * For each loaded state object, the payload it was last in step with the database on (after a load or a save). A save sends
 * only what changed since then, so it cannot undo what other server instances saved meanwhile (lib/db/state-merge.ts).
 * Keyed by the object, because a request may still be holding (and saving) an object this instance has since reloaded.
 */
const syncedPayloads = new WeakMap<object, Record<string, any>>();

/**
 * Workspaces saved while payments ran through Stripe carry stripeCustomerId / stripeSubscriptionId. They are moved to the
 * provider-neutral names the first time the workspace is read, so nothing that was stored is lost or locked out.
 */
function adoptLegacyBillingFields(ws: any): any {
  if (ws && (ws.stripeSubscriptionId !== undefined || ws.stripeCustomerId !== undefined || ws.cardFingerprint !== undefined)) {
    if (ws.stripeSubscriptionId !== undefined && ws.billingSubscriptionId === undefined) ws.billingSubscriptionId = ws.stripeSubscriptionId;
    if (ws.stripeCustomerId !== undefined && ws.billingCustomerId === undefined) ws.billingCustomerId = ws.stripeCustomerId;
    delete ws.stripeSubscriptionId;
    delete ws.stripeCustomerId;
    delete ws.cardFingerprint;
  }
  return ws;
}

const cloneJson = <T>(value: T): T => JSON.parse(JSON.stringify(value));

/** Call right after a state object was loaded from (or first written to) the cloud database. */
function markInSync(state: DatabaseState | null): void {
  if (!state) return;
  try {
    syncedPayloads.set(state, cloneJson(toCloudPayload(state)));
  } catch {
    // without a record of what was loaded, saves fall back to add-and-update only (nothing stored is removed)
  }
}

/** Saves of one instance run one after another, so each starts from the result of the previous one. */
let saveQueue: Promise<void> = Promise.resolve();

/**
 * Every change rewrites the whole state, and one request makes several changes, so under load the same megabytes were being
 * serialised and written over and over (about 160 ms each at 15 MB, which capped the server near 2 writes a second). Saves that
 * arrive while a write is pending now share it: the file is written once for all of them, and every caller still waits for that
 * write before it carries on, so an answer is never sent before its data is stored.
 */
let localWriteBatch: Promise<void> | null = null;
let localWriteState: DatabaseState | null = null;
let lastLocalWriteMs = 0;

function writeLocalStateBatched(state: DatabaseState): Promise<void> {
  cachedState = state;
  localWriteState = state;
  if (!localWriteBatch) {
    // wait about as long as the last write took, so writing never uses more than about half of the server's time
    const wait = Math.min(200, Math.round(lastLocalWriteMs));
    localWriteBatch = new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        const toWrite = localWriteState;
        localWriteBatch = null;
        localWriteState = null;
        const started = Date.now();
        try {
          if (toWrite) saveLocalStateSync(toWrite);
          resolve();
        } catch (err) {
          reject(err);
        } finally {
          lastLocalWriteMs = Date.now() - started;
        }
      }, wait);
    });
  }
  return localWriteBatch;
}

/** A cloud save that is waiting its turn and has not read the state yet: a later save of the same state can ride on it. */
let queuedCloudSave: { state: DatabaseState; promise: Promise<void> } | null = null;

async function saveState(state: DatabaseState, options?: PersistCloudStateOptions): Promise<void> {
  await writeLocalStateBatched(state);

  if (isCloudDbConfigured()) {
    // The queued save takes its snapshot only when it starts, which is after this change was made, so joining it loses nothing.
    if (!options && queuedCloudSave && queuedCloudSave.state === state) {
      await queuedCloudSave.promise;
      return;
    }
    const run = async () => {
      if (queuedCloudSave && queuedCloudSave.promise === mine) queuedCloudSave = null;
      try {
        // what this save is about, fixed now: anything the app changes while the save is in flight belongs to the next save
        const snapshot = cloneJson(toCloudPayload(state));
        const res = await persistCloudState(snapshot, { ...options, base: syncedPayloads.get(state) ?? null });
        lastCloudFetchTime = Date.now();
        if (res && res.updatedAt) {
          lastKnownCloudUpdatedAt = res.updatedAt;
        }
        if (res && res.ok && res.merged) {
          if (res.changedByOthers) {
            // other instances had saved something: bring it into this copy, keeping anything changed here since the snapshot
            const { merged: next } = mergeState(snapshot, toCloudPayload(state), res.merged);
            applyMerged(state as unknown as Record<string, any>, next);
          }
          syncedPayloads.set(state, cloneJson(res.merged));
        }
        if (isRedisConfigured()) {
          redisSet(CACHE_KEYS.STATE, { state, updatedAt: lastKnownCloudUpdatedAt }, 300).catch(() => {});
        }
      } catch (err) {
        console.warn('[Database] Failed to sync state to Cloud DB:', err);
      }
    };
    const mine: Promise<void> = saveQueue.then(run, run);
    saveQueue = mine;
    if (!options) queuedCloudSave = { state, promise: mine };
    await mine;
  } else if (isRedisConfigured()) {
    redisSet(CACHE_KEYS.STATE, { state, updatedAt: new Date().toISOString() }, 300).catch(() => {});
  }
}

/**
 * Which assistant a lead / notification / unanswered question / appointment belongs to. In relational mode the table is the
 * source of truth (the in-memory arrays only hold rows written since the last load), so it is asked first.
 */
async function ownerOfRow(
  kind: 'lead' | 'notification' | 'unanswered' | 'appointment',
  id: string,
  memoryRows: Array<{ id: string; assistantId?: string | null }> | undefined
): Promise<{ assistantId: string | null } | null> {
  if (isRelationalModeEnabled()) {
    try {
      const owner = await Relational.relationalGetOwner(kind, id);
      if (owner) return owner;
    } catch (err) {
      console.warn('[Relational] owner lookup failed:', err);
      if (isConnectionError(err)) disablePostgresTemporarily();
    }
  }
  const row = (memoryRows || []).find((r) => r.id === id);
  return row ? { assistantId: row.assistantId ?? null } : null;
}

/** True when the assistant exists and belongs to the workspace. An unknown assistant is NOT treated as a match. */
function assistantInWorkspace(state: DatabaseState, assistantId: string | null, workspaceId: string): boolean {
  if (!assistantId) return false;
  const ast = (state.assistants || []).find((a) => a.id === assistantId);
  return Boolean(ast) && (ast!.workspaceId || 'default-workspace') === workspaceId;
}

let lastCloudFetchTime = 0;
let lastForcedRefresh = 0;
let lastKnownCloudUpdatedAt: string | null = null;
const CLOUD_CACHE_TTL_MS = 60_000;
let cloudSyncPromise: Promise<void> | null = null;

async function ensureInitialized(forceFresh = false): Promise<DatabaseState> {
  if (!isCloudDbConfigured()) {
    return loadState();
  }

  const now = Date.now();
  if (cachedState !== null && !forceFresh && (now - lastCloudFetchTime < CLOUD_CACHE_TTL_MS)) {
    if ((!cachedState.chunks || cachedState.chunks.length === 0) && cachedChunks && cachedChunks.length > 0) {
      cachedState.chunks = cachedChunks;
    }
    return cachedState;
  }

  if (!cloudSyncPromise) {
    cloudSyncPromise = (async () => {
      const loadStarted = performance.now();
      let loadSource: 'redis' | 'postgres' | 'check' = 'check';
      try {
        let remoteNeedsFetch = true;
        if (cachedState !== null && !forceFresh) {
          // Lightweight ~30 byte query instead of downloading the multi-megabyte data column
          const remoteUpdatedAt = await fetchCloudStateUpdatedAt();
          if (remoteUpdatedAt && lastKnownCloudUpdatedAt && remoteUpdatedAt === lastKnownCloudUpdatedAt) {
            remoteNeedsFetch = false;
          } else if (remoteUpdatedAt) {
            lastKnownCloudUpdatedAt = remoteUpdatedAt;
          }
        }

        // L2 Cache (Upstash Redis) - Bypasses Supabase on serverless cold starts
        if (remoteNeedsFetch && !forceFresh && isRedisConfigured()) {
          try {
            const redisCached = await redisGet<{ state: DatabaseState; updatedAt?: string }>(CACHE_KEYS.STATE);
            if (redisCached && redisCached.state && Array.isArray(redisCached.state.workspaces)) {
              cachedState = redisCached.state;
              markInSync(cachedState);
              if (redisCached.updatedAt) {
                lastKnownCloudUpdatedAt = redisCached.updatedAt;
              }
              remoteNeedsFetch = false;
              loadSource = 'redis';
            }
          } catch (err) {
            console.warn('[Database] L2 Redis cache check failed, falling back to cloud DB:', err);
          }
        }

        if (remoteNeedsFetch) {
          loadSource = 'postgres';
          const remoteRes = await fetchCloudState();
          if (remoteRes.status === 'found' && remoteRes.data && typeof remoteRes.data === 'object' && Array.isArray(remoteRes.data.workspaces)) {
            const remoteState = remoteRes.data;
            cachedState = {
              workspaces: Array.isArray(remoteState.workspaces) ? remoteState.workspaces : [],
              assistants: Array.isArray(remoteState.assistants) ? remoteState.assistants : [],
              knowledgeSources: Array.isArray(remoteState.knowledgeSources) ? remoteState.knowledgeSources : [],
              chunks: Array.isArray(remoteState.chunks) ? remoteState.chunks : [],
              conversations: Array.isArray(remoteState.conversations) ? remoteState.conversations : [],
              messages: Array.isArray(remoteState.messages) ? remoteState.messages : [],
              leads: Array.isArray(remoteState.leads) ? remoteState.leads : [],
              unansweredQueries: Array.isArray(remoteState.unansweredQueries) ? remoteState.unansweredQueries : [],
              calls: Array.isArray(remoteState.calls) ? remoteState.calls : (cachedState?.calls || []),
              appointments: Array.isArray(remoteState.appointments) ? remoteState.appointments : [],
              teamMembers: Array.isArray(remoteState.teamMembers) ? remoteState.teamMembers : [],
              auditLogs: Array.isArray(remoteState.auditLogs) ? remoteState.auditLogs : [],
              notifications: Array.isArray(remoteState.notifications) ? remoteState.notifications : [],
              landingPages: Array.isArray(remoteState.landingPages) ? remoteState.landingPages : [],
              landingPagesInitialized: remoteState.landingPagesInitialized !== undefined ? remoteState.landingPagesInitialized : true,
              smtpSettings: remoteState.smtpSettings,
              pageViews: Array.isArray(remoteState.pageViews) ? remoteState.pageViews : (cachedState?.pageViews || []),
              mcpTokens: Array.isArray(remoteState.mcpTokens) ? remoteState.mcpTokens : [],
              mcpAuditLogs: Array.isArray(remoteState.mcpAuditLogs) ? remoteState.mcpAuditLogs : [],
            };
            if (isRelationalModeEnabled()) {
              // these live in their own tables now; the copies inside the state row are stale leftovers from before the migration
              cachedState.conversations = [];
              cachedState.messages = [];
              cachedState.leads = [];
              cachedState.appointments = [];
              cachedState.notifications = [];
              cachedState.unansweredQueries = [];
            }
            markInSync(cachedState);
            const remoteMaster = (cachedState.teamMembers || []).find((m) => m.id === 'tm_owner');
            if (remoteMaster && remoteMaster.email !== getMasterEmail()) {
              remoteMaster.email = getMasterEmail();
            }
            if (isRedisConfigured() && cachedState) {
              redisSet(CACHE_KEYS.STATE, { state: cachedState, updatedAt: lastKnownCloudUpdatedAt }, 300).catch(() => {});
            }
          } else if (remoteRes.status === 'not_found') {
            const localState = loadState();
            const persistRes = await persistCloudState(localState);
            if (persistRes && persistRes.updatedAt) {
              lastKnownCloudUpdatedAt = persistRes.updatedAt;
            }
            cachedState = localState;
            if (persistRes && persistRes.ok) markInSync(cachedState);
            if (isRedisConfigured() && cachedState) {
              redisSet(CACHE_KEYS.STATE, { state: cachedState, updatedAt: lastKnownCloudUpdatedAt }, 300).catch(() => {});
            }
          } else {
            const errDetail = remoteRes.status === 'error' ? remoteRes.error : 'Invalid remote state structure';
            console.warn('[Database] Cloud DB fetch encountered an error; refusing to overwrite cloud with local state:', errDetail);
            if (!cachedState) {
              cachedState = loadState();
            }
          }
        }

        // Load chunks from local disk if memory is empty; do NOT download remote chunks eagerly on cold starts
        if (!cachedChunks || cachedChunks.length === 0) {
          const localChunks = loadChunksState();
          if (localChunks && localChunks.length > 0) {
            cachedChunks = localChunks;
            if (cachedState) {
              cachedState.chunks = localChunks;
            }
            rebuildChunkIndex(localChunks);
          }
        } else if (cachedState && (!cachedState.chunks || cachedState.chunks.length === 0)) {
          cachedState.chunks = cachedChunks;
        }
        lastCloudFetchTime = Date.now();
      } catch (err) {
        console.warn('[Database] Failed to sync with Cloud DB, using local fallback:', err);
        if (cachedState === null) {
          cachedState = loadState();
        }
      } finally {
        cloudSyncPromise = null;
        // a slow (re)load of the shared state is what makes the first request on a cold instance slow, so record where the time went
        const ms = performance.now() - loadStarted;
        if (ms > 250) {
          logEvent({ category: 'db', level: 'warn', event: 'db.slow_state_load', message: `state load via ${loadSource} took ${Math.round(ms)} ms`, durationMs: ms });
        }
      }
    })();
  }

  await cloudSyncPromise;
  return cachedState || loadState();
}

/**
 * Lazily loads chunks into memory only when an in-memory vector/keyword operation
 * specifically requires them and PostgreSQL relational chunks are not being used.
 */
async function ensureChunksLoaded(): Promise<ChunkRecord[]> {
  if (cachedChunks && cachedChunks.length > 0) {
    return cachedChunks;
  }
  const localChunks = loadChunksState();
  if (localChunks && localChunks.length > 0) {
    cachedChunks = localChunks;
    if (cachedState) {
      cachedState.chunks = localChunks;
    }
    rebuildChunkIndex(localChunks);
    return cachedChunks;
  }
  if (isCloudDbConfigured()) {
    try {
      const remoteChunks = await fetchCloudChunks();
      if (remoteChunks && Array.isArray(remoteChunks) && remoteChunks.length > 0) {
        cachedChunks = remoteChunks;
        if (cachedState) {
          cachedState.chunks = remoteChunks;
        }
        rebuildChunkIndex(remoteChunks);
        return cachedChunks;
      }
    } catch (err) {
      console.warn('[Database] Lazy fetch of remote chunks failed:', err);
    }
  }
  cachedChunks = [];
  return cachedChunks;
}

function matchesAssistant(
  recordAssistantId: string | undefined,
  targetAssistantId: string,
  state: DatabaseState
): boolean {
  if (!recordAssistantId) return targetAssistantId === 'demo-assistant';
  if (recordAssistantId === targetAssistantId) return true;

  const resolveCanonical = (idOrSlug: string): string => {
    const ast = (state.assistants || []).find(
      (a) => a.id === idOrSlug || a.landingPageConfig?.slug === idOrSlug
    );
    if (ast) return ast.id;
    const lp = (state.landingPages || []).find(
      (p) => p.slug === idOrSlug || p.id === idOrSlug
    );
    if (lp?.assistantId) return lp.assistantId;
    if (idOrSlug === 'barbershop' || idOrSlug === 'classic-barbershop') return 'demo-assistant';
    return idOrSlug;
  };

  const canonicalRecord = resolveCanonical(recordAssistantId);
  const canonicalTarget = resolveCanonical(targetAssistantId);
  if (canonicalRecord === canonicalTarget) return true;

  const targetAst = (state.assistants || []).find((a) => a.id === targetAssistantId);
  const targetSlug = targetAst?.landingPageConfig?.slug;

  // 1. Direct slug or landing page match
  if (targetSlug && recordAssistantId === targetSlug) return true;

  // 2. Check if recordAssistantId matches any landing page for this assistant
  const landingPage = (state.landingPages || []).find(
    (p) => p.slug === recordAssistantId || p.id === recordAssistantId
  );
  if (landingPage && landingPage.assistantId === targetAssistantId) return true;

  // 3. For legacy demo assistant, match legacy barbershop template slug ONLY if no other assistant owns that slug
  if (canonicalTarget === 'demo-assistant') {
    if (recordAssistantId === 'barbershop' || recordAssistantId === 'classic-barbershop') {
      const existsAsOther = (state.assistants || []).some(
        (a) => a.id !== 'demo-assistant' && (a.id === recordAssistantId || a.landingPageConfig?.slug === recordAssistantId)
      );
      if (!existsAsOther) {
        return true;
      }
    }
  }

  // Strictly NO workspace-wide fallback across different bots.
  // Each bot owns its own knowledge base, chunks, leads, and landing pages.
  return false;
}

function getIndexedAssistantChunks(assistantId: string, state: DatabaseState): ChunkRecord[] {
  if (assistantChunksIndex.size === 0 && (state.chunks || []).length > 0) {
    rebuildChunkIndex(state.chunks);
  }

  const direct = assistantChunksIndex.get(assistantId);
  const matchingChunks: ChunkRecord[] = direct && direct.length > 0 ? [...direct] : [];

  // Check if any alias keys in assistantChunksIndex match this assistant
  for (const [indexedId, chunks] of assistantChunksIndex.entries()) {
    if (indexedId !== assistantId && matchesAssistant(indexedId, assistantId, state)) {
      matchingChunks.push(...chunks);
    }
  }

  return matchingChunks;
}

/** What the assistant on crescelo.com itself knows: the hand-written product guides (lib/platform/guides.ts). */
export const DEFAULT_CRESCELO_KNOWLEDGE_CHUNKS: ChunkRecord[] = guideChunks();

/**
 * Universal Database Layer
 */
/**
 * Marks fresh vectors with the embedding profile that made them, so search never compares vectors from different models.
 * While the model is not working the vectors are stand-ins and get the placeholder tag, which queues them for a rebuild.
 */
function tagEmbeddings<T extends { embedding?: number[]; metadata: Record<string, any> }>(chunks: T[]): T[] {
  const id = vectorTag();
  return chunks.map((c) => (c.embedding && c.embedding.length > 0 ? { ...c, metadata: { ...c.metadata, embModel: id } } : c));
}

/**
 * Runs an operation on the calendar tables (kortex_calendar_links, kortex_external_blocks).
 * Returns null when this deployment does not use relational mode: the caller then uses the JSON file (calendar-file-store.ts).
 * In required mode (DB_RELATIONAL_MODE=true) the tables are the only home of this data, so Postgres being down, disabled or
 * without a pool throws BookingUnavailableError, never a silent fallback to a file that other instances cannot see.
 */
async function onCalendarTables<T>(op: () => Promise<T | null>): Promise<{ value: T } | null> {
  if (!isRelationalModeRequired()) return null;
  if (!isRelationalModeEnabled()) throw new BookingUnavailableError();
  try {
    const value = await op();
    if (value === null) throw new BookingUnavailableError();
    return { value };
  } catch (err) {
    if (err instanceof BookingUnavailableError || err instanceof Relational.CalendarLinkRuleError) throw err;
    console.warn('[Relational] calendar tables failed:', err);
    if (isConnectionError(err)) disablePostgresTemporarily();
    throw new BookingUnavailableError(undefined, { cause: err });
  }
}

/** The blocks to keep for one link: those not yet over first (soonest first), then the most recently ended, up to the cap. */
function nearestBlocks(blocks: ExternalBlock[], max: number, now = Date.now()): { kept: ExternalBlock[]; dropped: number } {
  const valid = blocks.filter((b) => Number.isFinite(b.startAt.getTime()) && Number.isFinite(b.endAt.getTime()) && b.endAt.getTime() > b.startAt.getTime());
  if (valid.length <= max) return { kept: valid, dropped: blocks.length - valid.length };
  const upcoming = valid.filter((b) => b.endAt.getTime() > now).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const past = valid.filter((b) => b.endAt.getTime() <= now).sort((a, b) => b.endAt.getTime() - a.endAt.getTime());
  const kept = [...upcoming, ...past].slice(0, max);
  return { kept, dropped: blocks.length - kept.length };
}

export class Database {
  static async getState(): Promise<DatabaseState> {
    return ensureInitialized();
  }

  // Assistants
  static async getAssistants(workspaceId?: string): Promise<AssistantData[]> {
    const state = await ensureInitialized();
    const list = workspaceId && workspaceId !== '*'
      ? state.assistants.filter((a) => (a.workspaceId || 'default-workspace') === workspaceId)
      : state.assistants;
    return list.map((a) => ({
      ...a,
      apiKeyEncrypted: decryptSecret(a.apiKeyEncrypted || ''),
      hasConnectedKey: undefined, // computed for the screens, never a stored fact (older saves wrote it into the record)
      keyHealth: undefined,
      telegramBotToken: decryptSecret(a.telegramBotToken || ''),
      whatsappAccessToken: decryptSecret(a.whatsappAccessToken || ''),
      webhookSecret: decryptSecret(a.webhookSecret || ''),
    }));
  }

  /** Finds the assistant that owns a dialled phone number (E.164). Only enabled assistants match. */
  static async getAssistantByPhoneNumber(e164: string): Promise<AssistantData | null> {
    const state = await ensureInitialized();
    const a = state.assistants.find((ast) => ast.phoneEnabled && ast.phoneNumber === e164);
    return a ? Database.getAssistantById(a.id) : null;
  }

  /** True when another assistant already holds this number (enabled or not), so numbers cannot be claimed twice. */
  static async isPhoneNumberTaken(e164: string, exceptAssistantId?: string): Promise<boolean> {
    const state = await ensureInitialized();
    return state.assistants.some((ast) => ast.phoneNumber === e164 && ast.id !== exceptAssistantId);
  }

  static async saveCall(call: CallRecordData): Promise<CallRecordData> {
    const state = await ensureInitialized();
    if (!state.calls) state.calls = [];
    const idx = state.calls.findIndex((c) => c.id === call.id);
    if (idx >= 0) state.calls[idx] = { ...state.calls[idx], ...call };
    else state.calls.unshift(call);
    if (state.calls.length > 2000) state.calls = state.calls.slice(0, 2000);
    await saveState(state);
    return idx >= 0 ? state.calls[idx] : call;
  }

  static async getCalls(assistantId?: string, workspaceId?: string): Promise<CallRecordData[]> {
    const state = await ensureInitialized();
    let allowed: Set<string> | undefined;
    if (workspaceId && workspaceId !== '*') {
      allowed = new Set((state.assistants || []).filter((a) => (a.workspaceId || 'default-workspace') === workspaceId).map((a) => a.id));
    }
    return (state.calls || []).filter((c) => (!assistantId || c.assistantId === assistantId) && (!allowed || allowed.has(c.assistantId)));
  }

  static async getCallById(id: string): Promise<CallRecordData | null> {
    const state = await ensureInitialized();
    return (state.calls || []).find((c) => c.id === id) || null;
  }

  static async getAssistantById(id: string, workspaceId?: string): Promise<AssistantData | null> {
    const state = await ensureInitialized();
    const a = state.assistants.find((ast) => ast.id === id);
    if (!a) return null;
    if (workspaceId && workspaceId !== '*' && (a.workspaceId || 'default-workspace') !== workspaceId) {
      return null;
    }
    return {
      ...a,
      apiKeyEncrypted: decryptSecret(a.apiKeyEncrypted || ''),
      hasConnectedKey: undefined, // computed for the screens, never a stored fact (older saves wrote it into the record)
      keyHealth: undefined,
      telegramBotToken: decryptSecret(a.telegramBotToken || ''),
      whatsappAccessToken: decryptSecret(a.whatsappAccessToken || ''),
      webhookSecret: decryptSecret(a.webhookSecret || ''),
    };
  }

  static async createAssistant(data: Partial<AssistantData>): Promise<AssistantData> {
    const state = await ensureInitialized();
    const id = data.id || 'ast_' + Math.random().toString(36).substring(2, 10);
    const newAssistant: AssistantData = {
      id,
      workspaceId: data.workspaceId || 'default-workspace',
      name: data.name || 'New Assistant',
      description: data.description || '',
      systemPrompt: data.systemPrompt || 'You are a helpful business assistant.',
      welcomeMessage: data.welcomeMessage || 'Hello! How can I help you today?',
      fallbackMessage: data.fallbackMessage || "I do not have that specific information in my knowledge base. I can connect you with a live agent or assist you with booking a meeting.",
      temperature: data.temperature ?? 0.3,
      maxTokens: data.maxTokens ?? 2048,
      contextChunks: data.contextChunks ?? 3,
      provider: data.provider || 'groq',
      modelName: data.modelName || 'openai/gpt-oss-120b',
      apiKeyEncrypted: data.apiKeyEncrypted ? encryptSecret(data.apiKeyEncrypted) : '',
      customBaseUrl: data.customBaseUrl || '',
      primaryColor: data.primaryColor || '#2563eb',
      avatarUrl: data.avatarUrl || '',
      launcherPosition: data.launcherPosition || 'bottom-right',
      starterQuestions: data.starterQuestions || ['How can you help me?'],
      collectLeadEmail: data.collectLeadEmail ?? false,
      allowWebSearch: data.allowWebSearch ?? true,
      allowedDomains: data.allowedDomains || [],
      supportReceiverEmail: data.supportReceiverEmail || '',
      supportCcEmails: data.supportCcEmails || [],
      supportCustomFields: data.supportCustomFields || [],
      telegramBotToken: data.telegramBotToken ? encryptSecret(data.telegramBotToken) : '',
      telegramBotEnabled: data.telegramBotEnabled ?? false,
      whatsappPhoneNumberId: data.whatsappPhoneNumberId || '',
      whatsappAccessToken: data.whatsappAccessToken ? encryptSecret(data.whatsappAccessToken) : '',
      whatsappVerifyToken: data.whatsappVerifyToken || '',
      whatsappEnabled: data.whatsappEnabled ?? false,
      webhookUrl: data.webhookUrl || '',
      webhookSecret: data.webhookSecret ? encryptSecret(data.webhookSecret) : '',
      webhookEvents: data.webhookEvents || ['lead.created', 'chat.escalated'],
      slackWebhookUrl: data.slackWebhookUrl || '',
      slackEnabled: data.slackEnabled ?? false,
      slackEvents: data.slackEvents || ['lead.created', 'appointment.created'],
      googleSheetsWebhookUrl: data.googleSheetsWebhookUrl || '',
      googleSheetsEnabled: data.googleSheetsEnabled ?? false,
      googleSheetsEvents: data.googleSheetsEvents || ['lead.created', 'appointment.created'],
      whiteLabelEnabled: data.whiteLabelEnabled ?? false,
      customBrandingText: data.customBrandingText || '',
      customBrandingUrl: data.customBrandingUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    state.assistants.push(newAssistant);
    await saveState(state);
    return {
      ...newAssistant,
      apiKeyEncrypted: decryptSecret(newAssistant.apiKeyEncrypted || ''),
      hasConnectedKey: undefined, // computed for the screens, never a stored fact (older saves wrote it into the record)
      keyHealth: undefined,
      telegramBotToken: decryptSecret(newAssistant.telegramBotToken || ''),
      whatsappAccessToken: decryptSecret(newAssistant.whatsappAccessToken || ''),
      webhookSecret: decryptSecret(newAssistant.webhookSecret || ''),
    };
  }

  static async updateAssistant(id: string, data: Partial<AssistantData>, workspaceId?: string): Promise<AssistantData | null> {
    const state = await ensureInitialized();
    const idx = state.assistants.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    const current = state.assistants[idx];
    if (workspaceId && workspaceId !== '*' && (current.workspaceId || 'default-workspace') !== workspaceId) {
      return null;
    }

    const updates = { ...data };
    if (workspaceId && workspaceId !== '*') {
      delete updates.workspaceId;
    }
    // the result of a key check is the server's finding (setAiKeyStatus), not something a request can set
    delete updates.aiKeyStatus;
    delete updates.apiKeyProvider; // set by the assistant route together with the key, never by a client
    // computed fields the dashboard sends back with every save: stored, they made a removed key look connected for ever
    delete (updates as Record<string, unknown>).hasConnectedKey;
    delete (updates as Record<string, unknown>).keyHealth;

    // Handle encrypted fields: Only update if a new unmasked value was provided
    if (updates.apiKeyEncrypted !== undefined) {
      if (updates.apiKeyEncrypted.includes('****')) {
        delete updates.apiKeyEncrypted; // Preserve existing secret
      } else if (updates.apiKeyEncrypted) {
        updates.apiKeyEncrypted = encryptSecret(updates.apiKeyEncrypted);
      }
    }
    if (updates.telegramBotToken !== undefined) {
      if (updates.telegramBotToken.includes('****')) {
        delete updates.telegramBotToken;
      } else if (updates.telegramBotToken) {
        updates.telegramBotToken = encryptSecret(updates.telegramBotToken);
      }
    }
    if (updates.whatsappAccessToken !== undefined) {
      if (updates.whatsappAccessToken.includes('****')) {
        delete updates.whatsappAccessToken;
      } else if (updates.whatsappAccessToken) {
        updates.whatsappAccessToken = encryptSecret(updates.whatsappAccessToken);
      }
    }
    if (updates.webhookSecret !== undefined) {
      if (updates.webhookSecret.includes('****')) {
        delete updates.webhookSecret;
      } else if (updates.webhookSecret) {
        updates.webhookSecret = encryptSecret(updates.webhookSecret);
      }
    }

    state.assistants[idx] = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await saveState(state);
    const updated = state.assistants[idx];
    return {
      ...updated,
      apiKeyEncrypted: decryptSecret(updated.apiKeyEncrypted || ''),
      hasConnectedKey: undefined, // computed for the screens, never a stored fact (older saves wrote it into the record)
      keyHealth: undefined,
      telegramBotToken: decryptSecret(updated.telegramBotToken || ''),
      whatsappAccessToken: decryptSecret(updated.whatsappAccessToken || ''),
      webhookSecret: decryptSecret(updated.webhookSecret || ''),
    };
  }

  /** Records which provider the assistant's saved key was pasted for. Only the assistant route calls this, together with saving a key. */
  static async setApiKeyProvider(id: string, provider: string): Promise<void> {
    const state = await ensureInitialized();
    const idx = state.assistants.findIndex((x) => x.id === id);
    if (idx === -1 || state.assistants[idx].apiKeyProvider === provider) return;
    state.assistants[idx].apiKeyProvider = provider;
    await saveState(state);
  }

  /** Stores the result of an AI key check on the assistant. Does nothing if the assistant is gone or the result is unchanged. */
  static async setAiKeyStatus(id: string, status: AssistantData['aiKeyStatus'] | null): Promise<void> {
    const state = await ensureInitialized();
    const idx = state.assistants.findIndex((a) => a.id === id);
    if (idx === -1) return;
    const current = state.assistants[idx].aiKeyStatus;
    if (!status && !current) return;
    // an identical verdict only moves the check time; it is written to disk when something real changed, or about once a minute
    if (
      status && current &&
      current.state === status.state && current.fingerprint === status.fingerprint && current.message === status.message &&
      Date.parse(status.checkedAt) - Date.parse(current.checkedAt) < 60_000
    ) {
      return;
    }
    if (status) state.assistants[idx].aiKeyStatus = status;
    else delete state.assistants[idx].aiKeyStatus;
    await saveState(state);
  }

  static async deleteAssistant(id: string, workspaceId?: string): Promise<boolean> {
    const state = await ensureInitialized();
    const existing = state.assistants.find((a) => a.id === id);
    if (!existing) return false;
    if (workspaceId && workspaceId !== '*' && (existing.workspaceId || 'default-workspace') !== workspaceId) {
      return false;
    }

    const deletedConvIds = new Set(
      state.conversations.filter((c) => c.assistantId === id).map((c) => c.id)
    );

    state.assistants = state.assistants.filter((a) => a.id !== id);
    state.knowledgeSources = state.knowledgeSources.filter((k) => k.assistantId !== id);
    try {
      CalendarFile.filePurgeAssistant(id);
    } catch (err) {
      console.warn('[CalendarStore] could not remove the deleted assistant\'s calendar links:', err);
    }
    if (pgVectorStoreEnabled()) {
      await ChunkStore.deleteChunksByAssistant(id);
      clearRetrievalCache(id);
    } else {
      const remainingChunks = state.chunks.filter((c) => c.assistantId !== id);
      await saveChunksState(remainingChunks, true);
    }
    if (isRelationalModeEnabled()) {
      try {
        await Relational.relationalDeleteAssistantData(id);
      } catch (err) {
        console.warn('[Relational] deleteAssistant cleanup failed:', err);
      }
    }
    state.conversations = state.conversations.filter((c) => c.assistantId !== id);
    state.messages = (state.messages || []).filter((m) => !deletedConvIds.has(m.conversationId));
    state.leads = state.leads.filter((l) => l.assistantId !== id);
    state.appointments = (state.appointments || []).filter((a) => a.assistantId !== id);
    state.notifications = (state.notifications || []).filter((n) => n.assistantId !== id);
    state.unansweredQueries = (state.unansweredQueries || []).filter((q) => q.assistantId !== id);
    state.calls = (state.calls || []).filter((c) => c.assistantId !== id);
    const deletedLandingSlugs = new Set(
      (state.landingPages || []).filter((lp) => lp.assistantId === id).map((lp) => lp.slug)
    );
    if (existing.landingPageConfig?.slug) {
      deletedLandingSlugs.add(existing.landingPageConfig.slug);
    }

    state.landingPages = (state.landingPages || []).filter((lp) => lp.assistantId !== id);
    state.pageViews = (state.pageViews || []).filter((pv) => !deletedLandingSlugs.has(pv.slug));

    await saveState(state, { deletedAssistantId: id });

    if (isPostgresConfigured()) {
      try {
        await Relational.relationalDeleteAssistantData(id);
      } catch (err) {
        if (isConnectionError(err)) {
          disablePostgresTemporarily();
        }
        console.warn('[Relational] Failed to cascade delete assistant data in Postgres:', err);
      }
    }

    return true;
  }

  // Knowledge Sources with auto-recovery for stalled processing jobs
  static async getKnowledgeSources(assistantId: string, forceFresh: boolean = false): Promise<KnowledgeSourceData[]> {
    let state = await ensureInitialized(forceFresh);
    let sources = (state.knowledgeSources || []).filter((k) => matchesAssistant(k.assistantId, assistantId, state));
    
    // If forceFresh requested, no sources, or any source is in 'processing' state, do a fresh fetch from Cloud DB
    const hasProcessing = sources.some((s) => s.status === 'processing');
    if ((forceFresh || sources.length === 0 || hasProcessing) && isCloudDbConfigured()) {
      state = await ensureInitialized(true);
      sources = (state.knowledgeSources || []).filter((k) => matchesAssistant(k.assistantId, assistantId, state));
    }

    let stateChanged = false;
    const now = Date.now();

    for (const source of sources) {
      if (source.status === 'processing') {
        const createdMs = new Date(source.updatedAt || source.createdAt || 0).getTime();
        // If stuck in processing for more than 45 seconds or date invalid, auto-heal to failed
        if (isNaN(createdMs) || createdMs === 0 || now - createdMs > 45_000) {
          source.status = 'failed';
          const ext = (source.title.split('.').pop() || source.type || '').toLowerCase();
          const isImg = ['png', 'jpg', 'jpeg', 'webp', 'image'].includes(ext);
          const isVid = ['mp4', 'webm', 'mov', 'mkv', 'avi', 'm4v', '3gp'].includes(ext) || source.type === 'video';
          const isAudio = ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'aac'].includes(ext) || source.type === 'audio';

          if (isImg) {
            source.errorMessage =
              'This image appears to be a brand logo, icon, or graphic with no readable text body. AI assistants require text documents to learn facts and answer visitor questions.';
            source.errorResolution =
              'Logos do not need to be added to the knowledge base (you can set your assistant logo in Widget Branding). To train your AI, upload files containing text (PDF, DOCX, CSV, TXT) or high-contrast screenshots with legible text.';
          } else if (isVid || isAudio) {
            source.errorMessage =
              source.errorMessage ||
              'Processing timed out. Speech transcription took longer than the serverless execution limit or encountered a provider timeout.';
            source.errorResolution =
              source.errorResolution ||
              'Please delete this entry and re-upload. For large video files, export an MP3 or M4A audio copy (2-5 MB) to index speech quickly.';
          } else {
            source.errorMessage =
              source.errorMessage || 'Processing timed out. The file could not be parsed or contains no readable text.';
            source.errorResolution =
              source.errorResolution ||
              'Please check the file format and size, or convert the document and try again.';
          }

          source.updatedAt = new Date().toISOString();
          stateChanged = true;
        }
      }
    }

    if (stateChanged) {
      await saveState(state);
    }

    return sources;
  }

  static async createKnowledgeSource(data: Partial<KnowledgeSourceData>): Promise<KnowledgeSourceData> {
    const state = await ensureInitialized();
    const id = data.id || 'src_' + Math.random().toString(36).substring(2, 10);
    const newSource: KnowledgeSourceData = {
      id,
      assistantId: data.assistantId!,
      title: data.title || 'Untitled Source',
      type: data.type || 'txt',
      fileUrl: data.fileUrl || '',
      fileSizeBytes: data.fileSizeBytes || 0,
      status: data.status || 'pending',
      errorMessage: data.errorMessage || '',
      chunkCount: data.chunkCount || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    state.knowledgeSources.push(newSource);
    await saveState(state);
    if (newSource.assistantId) {
      clearRetrievalCache(newSource.assistantId);
    }
    return newSource;
  }

  static async updateKnowledgeSource(id: string, data: Partial<KnowledgeSourceData>): Promise<void> {
    let state = await ensureInitialized();
    let idx = state.knowledgeSources.findIndex((k) => k.id === id);
    if (idx === -1 && isCloudDbConfigured()) {
      state = await ensureInitialized(true);
      idx = state.knowledgeSources.findIndex((k) => k.id === id);
    }
    if (idx !== -1) {
      const astId = state.knowledgeSources[idx].assistantId;
      state.knowledgeSources[idx] = {
        ...state.knowledgeSources[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await saveState(state);
      if (astId) {
        clearRetrievalCache(astId);
      }
    }
  }

  /** Web page sources not refreshed for `olderThanMs`, oldest first. Sources with manual corrections are left alone: a re-read would erase them. */
  static async getDueWebSources(olderThanMs: number, limit: number): Promise<KnowledgeSourceData[]> {
    const state = await ensureInitialized();
    const cutoff = Date.now() - olderThanMs;
    return (state.knowledgeSources || [])
      .filter((k) => k.type === 'web' && k.fileUrl && k.status === 'ready' && !(k.corrections && k.corrections.length) && new Date(k.updatedAt || k.createdAt).getTime() < cutoff)
      .sort((a, b) => new Date(a.updatedAt || a.createdAt).getTime() - new Date(b.updatedAt || b.createdAt).getTime())
      .slice(0, limit);
  }

  static async getKnowledgeSourceById(id: string): Promise<KnowledgeSourceData | null> {
    let state = await ensureInitialized();
    let source = (state.knowledgeSources || []).find((k) => k.id === id) || null;
    if (!source && isCloudDbConfigured()) {
      state = await ensureInitialized(true);
      source = (state.knowledgeSources || []).find((k) => k.id === id) || null;
    }
    return source;
  }

  static async deleteKnowledgeSource(id: string, workspaceId?: string): Promise<boolean> {
    let state = await ensureInitialized();
    let source = (state.knowledgeSources || []).find((k) => k.id === id);
    if (!source) {
      state = await ensureInitialized(true);
      source = (state.knowledgeSources || []).find((k) => k.id === id);
    }
    if (!source) return false;

    if (workspaceId && workspaceId !== '*') {
      const ast = (state.assistants || []).find((a) => a.id === source.assistantId);
      const sourceWs = ast ? (ast.workspaceId || 'default-workspace') : null;
      if (!sourceWs || sourceWs !== workspaceId) {
        return false;
      }
    }

    state.knowledgeSources = state.knowledgeSources.filter((k) => k.id !== id);
    if (pgVectorStoreEnabled()) {
      await ChunkStore.deleteChunksBySource(id);
      clearRetrievalCache();
    } else {
      const remainingChunks = state.chunks.filter((c) => c.knowledgeSourceId !== id);
      await saveChunksState(remainingChunks, true);
    }
    await saveState(state, { deletedSourceId: id });

    if (isPostgresConfigured()) {
      try {
        await Relational.relationalDeleteChunksBySource(id);
      } catch (err) {
        console.warn('[Relational] deleteKnowledgeSource relational chunk cleanup failed:', err);
      }
    }
    return true;
  }

  static async getWorkspaceKnowledgeStorage(workspaceId: string = 'default-workspace'): Promise<{
    totalBytes: number;
    totalMb: number;
    sourceCount: number;
    chunkCount: number;
  }> {
    const state = await ensureInitialized();
    if (sourceChunksIndex.size === 0 && (state.chunks || []).length > 0) {
      rebuildChunkIndex(state.chunks);
    }
    const ws = (!workspaceId || workspaceId === '*') ? null : workspaceId;
    const wsAssistants = ws ? (state.assistants || []).filter((a) => (a.workspaceId || 'default-workspace') === ws) : (state.assistants || []);
    const assistantIds = new Set(wsAssistants.map((a) => a.id));

    let totalBytes = 0;
    const sources = (state.knowledgeSources || []).filter((k) =>
      ws ? assistantIds.has(k.assistantId) : true
    );

    const pgStore = pgVectorStoreEnabled();
    const textBytes = pgStore ? await ChunkStore.textBytesBySource(sources.filter((k) => !k.fileSizeBytes).map((k) => k.id)) : null;
    for (const source of sources) {
      let bytes = source.fileSizeBytes || 0;
      if (!bytes) {
        if (textBytes) {
          bytes = textBytes.get(source.id) || 0;
        } else {
          const sourceChunks = sourceChunksIndex.get(source.id) || [];
          bytes = sourceChunks.reduce((acc, c) => acc + Buffer.byteLength(c.content || '', 'utf-8'), 0);
        }
      }
      totalBytes += bytes;
    }

    let chunkCount = 0;
    if (pgStore) {
      chunkCount = await ChunkStore.countChunksByAssistants(ws ? wsAssistants.map((a) => a.id) : (state.assistants || []).map((a) => a.id));
    } else if (ws) {
      for (const ast of wsAssistants) {
        const chunks = getIndexedAssistantChunks(ast.id, state);
        chunkCount += chunks.length;
      }
    } else {
      chunkCount = state.chunks ? state.chunks.length : 0;
    }

    return {
      totalBytes,
      totalMb: Number((totalBytes / (1024 * 1024)).toFixed(2)),
      sourceCount: sources.length,
      chunkCount,
    };
  }

  // Chunks
  static async saveChunks(input: Omit<ChunkRecord, 'id' | 'createdAt'>[]): Promise<void> {
    const chunks = tagEmbeddings(input);
    if (pgVectorStoreEnabled()) {
      const records: ChunkRecord[] = chunks.map((c) => ({
        ...c,
        id: 'chk_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36).slice(-4),
        createdAt: new Date().toISOString(),
      }));
      await ChunkStore.upsertChunks(records);
      new Set(records.map((r) => r.assistantId)).forEach((a) => clearRetrievalCache(a));
      return;
    }
    const state = await ensureInitialized();
    const newRecords: ChunkRecord[] = chunks.map((c) => ({
      ...c,
      id: 'chk_' + Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
    }));

    const updated = [...state.chunks, ...newRecords];
    await saveChunksState(updated);

    if (isPostgresConfigured()) {
      try {
        await Relational.relationalUpsertChunks(newRecords);
      } catch (err) {
        console.warn('[Relational] saveChunks upsert failed:', err);
      }
    }
  }

  /** Passages embedded by a different model than the current one (see lib/rag/embedding-profile.ts), up to `limit`. */
  static async getStaleEmbeddingChunks(limit: number): Promise<ChunkRecord[]> {
    const profileId = embeddingProfile().id;
    if (pgVectorStoreEnabled()) return ChunkStore.staleEmbeddingChunks(profileId, limit);
    const state = await ensureInitialized();
    const all = (state.chunks && state.chunks.length ? state.chunks : await ensureChunksLoaded()) as ChunkRecord[];
    return all.filter((c) => chunkProfileId(c.metadata) !== profileId).slice(0, limit);
  }

  /**
   * Finds stored vectors that are stand-ins (made while the model could not load) but are tagged as real, and tags them
   * as placeholders so they are rebuilt. Returns how many were re-tagged. Only the pgvector store needs this.
   */
  static async markPlaceholderVectors(): Promise<number> {
    if (!pgVectorStoreEnabled()) return 0;
    return ChunkStore.markPlaceholderVectors();
  }

  static async countStaleEmbeddingChunks(): Promise<number> {
    const profileId = embeddingProfile().id;
    if (pgVectorStoreEnabled()) return ChunkStore.countStaleEmbeddingChunks(profileId);
    const state = await ensureInitialized();
    const all = (state.chunks && state.chunks.length ? state.chunks : await ensureChunksLoaded()) as ChunkRecord[];
    return all.filter((c) => chunkProfileId(c.metadata) !== profileId).length;
  }

  static async updateChunks(updatedChunks: ChunkRecord[]): Promise<void> {
    if (pgVectorStoreEnabled()) {
      await ChunkStore.upsertChunks(updatedChunks);
      new Set(updatedChunks.map((r) => r.assistantId)).forEach((a) => clearRetrievalCache(a));
      return;
    }
    const state = await ensureInitialized();
    const map = new Map<string, ChunkRecord>(updatedChunks.map((c) => [c.id, c]));
    const updated = state.chunks.map((c) => map.get(c.id) || c);
    await saveChunksState(updated);

    if (isPostgresConfigured()) {
      try {
        await Relational.relationalUpsertChunks(updatedChunks);
      } catch (err) {
        console.warn('[Relational] updateChunks upsert failed:', err);
      }
    }
  }

  static async deleteChunksBySource(sourceId: string): Promise<void> {
    if (pgVectorStoreEnabled()) {
      await ChunkStore.deleteChunksBySource(sourceId);
      clearRetrievalCache();
      return;
    }
    const state = await ensureInitialized();
    const remaining = state.chunks.filter((c) => c.knowledgeSourceId !== sourceId);
    await saveChunksState(remaining, true);

    if (isPostgresConfigured()) {
      try {
        await Relational.relationalDeleteChunksBySource(sourceId);
      } catch (err) {
        console.warn('[Relational] deleteChunksBySource failed:', err);
      }
    }
  }

  static async getChunksByAssistant(assistantId: string): Promise<ChunkRecord[]> {
    if (pgVectorStoreEnabled()) {
      const rows = await ChunkStore.getChunksByAssistant(assistantId);
      if (rows.length === 0 && assistantId === 'demo-assistant') return DEFAULT_CRESCELO_KNOWLEDGE_CHUNKS;
      return rows;
    }
    const state = await ensureInitialized();
    let chunks = getIndexedAssistantChunks(assistantId, state);
    if (chunks.length === 0 && (!cachedChunks || cachedChunks.length === 0)) {
      await ensureChunksLoaded();
      chunks = getIndexedAssistantChunks(assistantId, state);
    }
    if (chunks.length === 0 && assistantId === 'demo-assistant') {
      return DEFAULT_CRESCELO_KNOWLEDGE_CHUNKS;
    }
    return chunks;
  }

  static async getChunksBySource(sourceId: string): Promise<ChunkRecord[]> {
    if (pgVectorStoreEnabled()) return ChunkStore.getChunksBySource(sourceId);
    const state = await ensureInitialized();
    if (sourceChunksIndex.size === 0 && (state.chunks || []).length > 0) {
      rebuildChunkIndex(state.chunks);
    }
    let chunks = sourceChunksIndex.get(sourceId) || [];
    if (chunks.length === 0 && (!cachedChunks || cachedChunks.length === 0)) {
      await ensureChunksLoaded();
      chunks = sourceChunksIndex.get(sourceId) || [];
    }
    return [...chunks].sort((a, b) => a.chunkIndex - b.chunkIndex);
  }

  static async getPricingChunks(assistantId: string, limit: number = 12): Promise<SearchResultChunk[]> {
    if (pgVectorStoreEnabled()) {
      try {
        return await ChunkStore.getPricingChunks(assistantId, limit);
      } catch (err) {
        console.warn('[ChunkStore] getPricingChunks failed:', (err as Error)?.message);
        return [];
      }
    }
    if (isPostgresConfigured()) {
      try {
        const relPricing = await Relational.relationalGetPricingChunks(assistantId, limit);
        if (relPricing.length > 0) {
          return relPricing;
        }
      } catch (err) {
        console.warn('[Relational] getPricingChunks failed, falling back to in-memory:', err);
      }
    }

    const assistantChunks = await Database.getChunksByAssistant(assistantId);
    return assistantChunks
      .filter((c) =>
        /\b(budget|budgets|price|prices|pricing|cost|costs|rate|rates|fee|fees|\$|usd|eur|haircut|service|project)\b/i.test(
          `${c.content} ${c.metadata?.sourceTitle || ''}`
        )
      )
      .slice(0, limit)
      .map((c) => ({
        id: c.id,
        content: c.content,
        chunkIndex: c.chunkIndex,
        tokenCount: c.tokenCount,
        metadata: c.metadata as any,
        knowledgeSourceId: c.knowledgeSourceId,
        similarity: 0.85,
      }));
  }

  // Hybrid Vector + Full-Text Search
  static async hybridSearch(
    assistantId: string,
    query: string,
    queryEmbedding: number[],
    topK: number = 6
  ): Promise<SearchResultChunk[]> {
    // 0. pgvector store (RAG_VECTOR_STORE=pgvector): meaning + words searched and fused inside Postgres
    if (pgVectorStoreEnabled()) {
      try {
        return await ChunkStore.hybridSearch(assistantId, query, queryEmbedding, topK);
      } catch (err) {
        console.warn('[ChunkStore] hybridSearch failed, falling back to in-memory:', (err as Error)?.message);
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    } else if (isPostgresConfigured() && process.env.RAG_VECTOR_STORE !== 'legacy') {
      // 1. Try fast database-native HNSW vector + FTS hybrid search if Postgres is active
      try {
        const relResults = await Relational.relationalHybridSearch(
          assistantId,
          query,
          queryEmbedding,
          topK
        );
        if (relResults.length > 0) {
          return relResults;
        }
      } catch (err) {
        console.warn('[Relational] hybridSearch failed, falling back to in-memory:', err);
      }
    }

    // 2. In-memory fallback path (for test environments, local files, or unmigrated chunks)
    const state = await ensureInitialized();
    let assistantChunks = getIndexedAssistantChunks(assistantId, state);
    if (assistantChunks.length === 0 && (!cachedChunks || cachedChunks.length === 0)) {
      await ensureChunksLoaded();
      assistantChunks = getIndexedAssistantChunks(assistantId, state);
    }
    // Strict isolation: if assistant has no chunks, never pull other assistants' chunks.
    if (assistantChunks.length === 0) return [];

    // Sparse Keyword Matching (BM25 / Multilingual full-text - checks content and source title)
    const keywordScored = assistantChunks
      .map((chunk) => ({
        ...chunk,
        score: keywordRelevance(query, `${chunk.content} ${chunk.metadata?.sourceTitle || ''}`),
      }))
      .filter((chunk) => chunk.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    // Dense Vector Cosine Similarity (adaptive cutoff: 0.18 if keyword match exists, 0.22 otherwise)
    const hasKeywordMatches = keywordScored.length > 0;
    const profile = embeddingProfile();
    const minVectorCutoff = hasKeywordMatches ? profile.vectorCutoffWithKeyword : profile.vectorCutoffAlone;

    // only vectors made by the current model are comparable with the question's vector; older ones are rebuilt by /api/cron/reembed
    const vectorScored = assistantChunks
      .filter((chunk) => chunkProfileId(chunk.metadata) === vectorTag())
      .map((chunk) => ({
        ...chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
      }))
      .filter((chunk) => chunk.score >= minVectorCutoff)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    // If both vector similarity is low and keyword matching is 0, no relevant chunks exist in knowledge base
    if (vectorScored.length === 0 && keywordScored.length === 0) {
      return [];
    }

    // Reciprocal Rank Fusion
    const fused = reciprocalRankFusion(vectorScored, keywordScored);

    const vectorById = new Map(vectorScored.map((c) => [c.id, c.score]));
    const keywordIds = new Set(keywordScored.map((c) => c.id));
    return fused.slice(0, topK).map((item) => ({
      id: item.id,
      content: item.content,
      chunkIndex: item.chunkIndex,
      tokenCount: item.tokenCount,
      metadata: item.metadata as any,
      knowledgeSourceId: item.knowledgeSourceId,
      similarity: item.rrfScore,
      vectorScore: vectorById.get(item.id) ?? 0,
      keywordMatch: keywordIds.has(item.id),
    }));
  }

  // Conversations & Messages
  static async getConversations(assistantId?: string, workspaceId?: string): Promise<ConversationData[]> {
    let wsAssistantIds: string[] | undefined;
    if (workspaceId && workspaceId !== '*') {
      const state = await ensureInitialized();
      wsAssistantIds = (state.assistants || [])
        .filter((a) => (a.workspaceId || 'default-workspace') === workspaceId)
        .map((a) => a.id);
    }

    if (isRelationalModeEnabled()) {
      try {
        const relConvs = await Relational.relationalGetConversations(assistantId, 500, wsAssistantIds);
        if (relConvs.length > 0 || wsAssistantIds !== undefined) {
          const byConv = await Relational.relationalGetMessagesForConversations(relConvs.map((c) => c.id));
          return relConvs.map((c) => ({ ...c, messages: byConv.get(c.id) || [] }));
        }
      } catch (err) {
        console.warn('[Relational] getConversations failed:', err);
        if (isConnectionError(err)) {
          disablePostgresTemporarily();
        }
      }
    }

    const state = await ensureInitialized();
    const allConvs = state.conversations || [];
    let matched: ConversationData[] = [];

    if (workspaceId && workspaceId !== '*') {
      const wsAssistantIds = new Set(
        (state.assistants || [])
          .filter((a) => (a.workspaceId || 'default-workspace') === workspaceId)
          .map((a) => a.id)
      );

      if (!assistantId) {
        matched = allConvs.filter((c) => wsAssistantIds.has(c.assistantId));
      } else {
        const targetAst = (state.assistants || []).find((a) => a.id === assistantId);
        if (targetAst && (targetAst.workspaceId || 'default-workspace') !== workspaceId) {
          matched = [];
        } else {
          matched = allConvs.filter((c) => matchesAssistant(c.assistantId, assistantId, state) && wsAssistantIds.has(c.assistantId));
        }
      }
    } else {
      if (!assistantId) {
        matched = allConvs;
      } else {
        matched = allConvs.filter((c) => matchesAssistant(c.assistantId, assistantId, state));
        if (matched.length === 0) {
          const targetAst = (state.assistants || []).find((a) => a.id === assistantId);
          const targetWs = targetAst?.workspaceId || 'default-workspace';
          const workspaceConvs = allConvs.filter((c) => {
            const cAst = (state.assistants || []).find((ast) => ast.id === c.assistantId);
            const cWs = cAst?.workspaceId || 'default-workspace';
            return cWs === targetWs;
          });
          if (workspaceConvs.length > 0) {
            matched = workspaceConvs;
          }
        }
      }
    }

    const conversationsWithMessages = matched.map((c) => ({
      ...c,
      messages: (state.messages || []).filter((m) => m.conversationId === c.id),
    }));

    // Sort descending by latest activity (last message time, updatedAt, or createdAt)
    conversationsWithMessages.sort((a, b) => {
      const aLastMsg = a.messages && a.messages.length > 0
        ? new Date(a.messages[a.messages.length - 1].createdAt).getTime()
        : 0;
      const bLastMsg = b.messages && b.messages.length > 0
        ? new Date(b.messages[b.messages.length - 1].createdAt).getTime()
        : 0;
      const aTime = Math.max(
        aLastMsg,
        a.updatedAt ? new Date(a.updatedAt).getTime() : 0,
        a.createdAt ? new Date(a.createdAt).getTime() : 0
      );
      const bTime = Math.max(
        bLastMsg,
        b.updatedAt ? new Date(b.updatedAt).getTime() : 0,
        b.createdAt ? new Date(b.createdAt).getTime() : 0
      );
      return bTime - aTime;
    });

    return conversationsWithMessages;
  }

  /** Conversations a workspace started in a period (for the monthly chat limit). A COUNT in relational mode, not a download. */
  static async countConversationsInPeriod(workspaceId: string, sinceIso: string, untilIso: string): Promise<number> {
    const state = await ensureInitialized();
    const ids = workspaceId && workspaceId !== '*'
      ? (state.assistants || []).filter((a) => (a.workspaceId || 'default-workspace') === workspaceId).map((a) => a.id)
      : undefined;
    if (isRelationalModeEnabled()) {
      try {
        return await Relational.relationalCountConversations(ids, sinceIso, untilIso);
      } catch (err) {
        console.warn('[Relational] countConversationsInPeriod failed:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    }
    const set = ids ? new Set(ids) : null;
    return (state.conversations || []).filter((c) => (!set || set.has(c.assistantId)) && c.createdAt >= sinceIso && c.createdAt <= untilIso).length;
  }

  static async conversationExists(id: string): Promise<boolean> {
    if (!id) return false;
    if (isRelationalModeEnabled()) {
      try {
        if (await Relational.relationalConversationExists(id)) return true;
      } catch (err) {
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    }
    const state = await ensureInitialized();
    return (state.conversations || []).some((c) => c.id === id);
  }

  static async getOrCreateConversation(
    assistantId: string,
    visitorId?: string,
    conversationId?: string
  ): Promise<ConversationData> {
    if (isRelationalModeEnabled()) {
      try {
        if (conversationId) {
          let existing = await Relational.relationalGetConversationById(conversationId);
          if (!existing) {
            // Lazy hydration: check if blob state already has this conversation and messages
            const state = await ensureInitialized();
            const blobConv = state.conversations.find((c) => c.id === conversationId);
            if (blobConv) {
              await Relational.relationalUpsertConversation(blobConv);
              const blobMsgs = (state.messages || []).filter((m) => m.conversationId === conversationId);
              for (const m of blobMsgs) {
                await Relational.relationalInsertMessage(m);
              }
              existing = { ...blobConv };
            }
          }
          if (existing) {
            // Security fix: never rebind an existing conversation to a different assistant
            if (existing.assistantId && existing.assistantId !== assistantId) {
              existing = null;
            } else {
              existing.messages = await Relational.relationalGetMessagesByConversation(existing.id);
              return existing;
            }
          }
        }
        const id = 'conv_' + crypto.randomUUID();
        const newConv: ConversationData = {
          id,
          assistantId,
          visitorId: visitorId || 'anon_' + crypto.randomUUID().substring(0, 12),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'bot',
        };
        await Relational.relationalUpsertConversation(newConv);
        // Mirror to in-memory cache and schedule non-blocking deferred blob persistence
        const state = await ensureInitialized();
        if (!state.conversations.find((c) => c.id === id)) {
          state.conversations.unshift(newConv);
          cachedState = state;
          afterHotWrite(state);
        }
        return { ...newConv, messages: [] };
      } catch (err) {
        console.warn('[Relational] getOrCreateConversation failed, disabling postgres:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    }

    // Blob fallback path
    const state = await ensureInitialized(true);
    if (conversationId) {
      const existing = state.conversations.find((c) => c.id === conversationId);
      if (existing) {
        // Security fix: never rebind an existing conversation to a different assistant
        if (!existing.assistantId || existing.assistantId === assistantId) {
          return {
            ...existing,
            messages: state.messages.filter((m) => m.conversationId === existing.id),
          };
        }
      }
    }

    const id = 'conv_' + crypto.randomUUID();
    const newConv: ConversationData = {
      id,
      assistantId,
      visitorId: visitorId || 'anon_' + crypto.randomUUID().substring(0, 12),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'bot',
    };

    state.conversations.unshift(newConv);
    await saveState(state);
    return { ...newConv, messages: [] };
  }

  static async getConversationById(id: string): Promise<ConversationData | null> {
    if (isRelationalModeEnabled()) {
      try {
        let relConv = await Relational.relationalGetConversationById(id);
        if (!relConv) {
          // Lazy hydration: check if blob state has this conversation
          const state = await ensureInitialized();
          const blobConv = state.conversations.find((c) => c.id === id);
          if (blobConv) {
            await Relational.relationalUpsertConversation(blobConv);
            const blobMsgs = (state.messages || []).filter((m) => m.conversationId === id);
            for (const m of blobMsgs) {
              await Relational.relationalInsertMessage(m);
            }
            relConv = { ...blobConv };
          }
        }
        if (relConv) {
          relConv.messages = await Relational.relationalGetMessagesByConversation(id);
          return relConv;
        }
      } catch (err) {
        console.warn('[Relational] getConversationById failed, disabling postgres:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    }
    const state = await ensureInitialized();
    const conv = state.conversations.find((c) => c.id === id);
    if (!conv) return null;
    return {
      ...conv,
      messages: state.messages.filter((m) => m.conversationId === conv.id),
    };
  }

  static async updateConversation(
    id: string,
    data: Partial<ConversationData>
  ): Promise<boolean> {
    if (isRelationalModeEnabled()) {
      try {
        const updated = await Relational.relationalUpdateConversation(id, data);
        if (!updated) {
          // Not found in relational: lazy hydrate from blob if exists
          const state = await ensureInitialized();
          const blobConv = state.conversations.find((c) => c.id === id);
          if (blobConv) {
            const updatedConv = {
              ...blobConv,
              ...data,
              updatedAt: new Date().toISOString(),
            };
            await Relational.relationalUpsertConversation(updatedConv);
            const blobMsgs = (state.messages || []).filter((m) => m.conversationId === id);
            for (const m of blobMsgs) {
              await Relational.relationalInsertMessage(m);
            }
            const idx = state.conversations.findIndex((c) => c.id === id);
            if (idx !== -1) {
              state.conversations[idx] = updatedConv;
              cachedState = state;
            }
            afterHotWrite(state);
            return true;
          }
        } else {
          const state = await ensureInitialized();
          const idx = state.conversations.findIndex((c) => c.id === id);
          if (idx !== -1) {
            state.conversations[idx] = {
              ...state.conversations[idx],
              ...data,
              updatedAt: new Date().toISOString(),
            };
            cachedState = state;
          }
          afterHotWrite(state);
          return true;
        }
      } catch (err) {
        console.warn('[Relational] updateConversation failed, disabling postgres:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    }

    const state = await ensureInitialized(true);
    const idx = state.conversations.findIndex((c) => c.id === id);
    if (idx !== -1) {
      state.conversations[idx] = {
        ...state.conversations[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      await saveState(state);
      return true;
    }
    return false;
  }

  static async saveMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system' | 'agent',
    content: string,
    citations: any[] = [],
    tokensUsed: number = 0,
    attachment?: {
      name: string;
      type: string;
      size?: number;
      url?: string;
      preview?: string;
    },
    senderName?: string
  ): Promise<MessageData> {
    const msg: MessageData = {
      id: 'msg_' + Math.random().toString(36).substring(2, 10),
      conversationId,
      role,
      content,
      citations,
      tokensUsed,
      ...(senderName ? { senderName } : {}),
      ...(attachment ? { attachment } : {}),
      createdAt: new Date().toISOString(),
    };

    if (isRelationalModeEnabled()) {
      try {
        try {
          await Relational.relationalInsertMessage(msg);
        } catch (insertErr: any) {
          // 23503 = the conversation is not in its table yet (it only exists in the older state row): copy it over, then retry once
          if (insertErr?.code !== '23503') throw insertErr;
          const early = await ensureInitialized();
          const blobConv = early.conversations.find((c) => c.id === conversationId);
          if (!blobConv) throw insertErr;
          await Relational.relationalUpsertConversation(blobConv);
          await Relational.relationalInsertMessage(msg);
        }
        const state = await ensureInitialized();
        state.messages.push(msg);
        const convIdx = state.conversations.findIndex((c) => c.id === conversationId);
        if (convIdx !== -1) {
          state.conversations[convIdx].updatedAt = msg.createdAt;
        }
        cachedState = state;
        afterHotWrite(state);
        return msg;
      } catch (err) {
        console.warn('[Relational] saveMessage failed, disabling postgres:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    }

    const state = await ensureInitialized(true);
    state.messages.push(msg);
    const convIdx = state.conversations.findIndex((c) => c.id === conversationId);
    if (convIdx !== -1) {
      state.conversations[convIdx].updatedAt = msg.createdAt;
    }
    await saveState(state);
    return msg;
  }

  // Leads
  static async saveLead(data: {
    assistantId: string;
    email: string;
    name?: string;
    phone?: string;
    notes?: string;
    customData?: Record<string, any>;
  }): Promise<LeadData> {
    const lead: LeadData = {
      id: 'lead_' + Math.random().toString(36).substring(2, 10),
      assistantId: data.assistantId,
      email: data.email,
      name: data.name,
      phone: data.phone,
      notes: data.notes,
      customData: data.customData,
      createdAt: new Date().toISOString(),
    };

    if (isRelationalModeEnabled()) {
      try {
        await Relational.relationalInsertLead(lead);
        const state = await ensureInitialized();
        state.leads.unshift(lead);
        cachedState = state;
        afterHotWrite(state);
        return lead;
      } catch (err) {
        console.warn('[Relational] saveLead failed, disabling postgres:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    }

    const state = await ensureInitialized(true);
    state.leads.unshift(lead);
    await saveState(state);
    return lead;
  }

  static async getLeads(assistantId?: string, workspaceId?: string): Promise<LeadData[]> {
    let wsAssistantIds: string[] | undefined;
    if (workspaceId && workspaceId !== '*') {
      const state = await ensureInitialized();
      wsAssistantIds = (state.assistants || [])
        .filter((a) => (a.workspaceId || 'default-workspace') === workspaceId)
        .map((a) => a.id);
    }

    if (isRelationalModeEnabled()) {
      try {
        const relLeads = await Relational.relationalGetLeads(assistantId, wsAssistantIds);
        if (relLeads.length > 0 || wsAssistantIds !== undefined) {
          return relLeads;
        }
      } catch (err) {
        console.warn('[Relational] getLeads failed, disabling postgres:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    }

    const state = await ensureInitialized();
    let allLeads = state.leads || [];

    if (wsAssistantIds !== undefined) {
      const wsSet = new Set(wsAssistantIds);
      allLeads = allLeads.filter((l) => wsSet.has(l.assistantId));
    }

    if (!assistantId) return allLeads;

    let matched = allLeads.filter((l) => matchesAssistant(l.assistantId, assistantId, state));
    return matched;
  }

  static async deleteLead(id: string, workspaceId?: string): Promise<boolean> {
    const state = await ensureInitialized(true);
    const lead = await ownerOfRow('lead', id, state.leads);
    if (!lead) return false;

    if (workspaceId && workspaceId !== '*' && !assistantInWorkspace(state, lead.assistantId, workspaceId)) {
      return false;
    }

    state.leads = state.leads.filter((l) => l.id !== id);
    await saveState(state);

    if (isPostgresConfigured()) {
      try {
        await Relational.relationalDeleteLead(id);
      } catch (err) {
        if (isConnectionError(err)) {
          disablePostgresTemporarily();
        }
        console.warn('[Relational] Failed to delete lead in Postgres:', err);
      }
    }

    return true;
  }

  // Knowledge Gap & Unanswered Queries Engine
  static async recordUnansweredQuery(
    assistantId: string,
    query: string,
    visitorId?: string
  ): Promise<UnansweredQueryData> {
    const state = await ensureInitialized();
    if (!state.unansweredQueries) state.unansweredQueries = [];

    // Avoid duplicate logging within 10 minutes for identical query
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const cleanQuery = query.trim();
    const existing = state.unansweredQueries.find(
      (q) =>
        q.assistantId === assistantId &&
        q.query.toLowerCase() === cleanQuery.toLowerCase() &&
        q.createdAt > tenMinsAgo
    );
    if (existing) return existing;

    const record: UnansweredQueryData = {
      id: 'uq_' + Math.random().toString(36).substring(2, 10),
      assistantId,
      query: cleanQuery,
      visitorId,
      createdAt: new Date().toISOString(),
      resolved: false,
    };

    if (isRelationalModeEnabled()) {
      try {
        await Relational.relationalInsertUnansweredQuery(record);
        state.unansweredQueries.unshift(record);
        if (state.unansweredQueries.length > 500) {
          state.unansweredQueries = state.unansweredQueries.slice(0, 500);
        }
        cachedState = state;
        afterHotWrite(state);
        return record;
      } catch (err) {
        console.warn('[Relational] recordUnansweredQuery failed, disabling postgres:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    }

    state.unansweredQueries.unshift(record);
    if (state.unansweredQueries.length > 500) {
      state.unansweredQueries = state.unansweredQueries.slice(0, 500);
    }
    await saveState(state);
    return record;
  }

  static async getUnansweredQueries(assistantId: string): Promise<UnansweredQueryData[]> {
    if (isRelationalModeEnabled()) {
      try {
        const relQueries = await Relational.relationalGetUnansweredQueries(assistantId);
        if (relQueries.length > 0) return relQueries;
      } catch (err) {
        console.warn('[Relational] getUnansweredQueries failed:', err);
        if (isConnectionError(err)) {
          disablePostgresTemporarily();
        }
      }
    }
    const state = await ensureInitialized();
    return (state.unansweredQueries || []).filter((q) => q.assistantId === assistantId);
  }

  static async getUnansweredQueryById(id: string): Promise<UnansweredQueryData | null> {
    const state = await ensureInitialized();
    return (state.unansweredQueries || []).find((q) => q.id === id) || null;
  }

  static async resolveUnansweredQuery(id: string, answer?: string, workspaceId?: string): Promise<boolean> {
    const state = await ensureInitialized();
    if (!state.unansweredQueries) state.unansweredQueries = [];
    const owner = await ownerOfRow('unanswered', id, state.unansweredQueries);
    if (!owner) return false;
    const item = state.unansweredQueries.find((q) => q.id === id);

    if (workspaceId && workspaceId !== '*' && !assistantInWorkspace(state, owner.assistantId, workspaceId)) {
      return false;
    }

    if (isRelationalModeEnabled()) {
      try {
        await Relational.relationalResolveUnansweredQuery(id, answer);
        if (item) {
          item.resolved = true;
          if (answer) item.suggestedAnswer = answer;
        }
        cachedState = state;
        afterHotWrite(state);
        return true;
      } catch (err) {
        console.warn('[Relational] resolveUnansweredQuery failed:', err);
        if (isConnectionError(err)) {
          disablePostgresTemporarily();
        }
      }
    }

    if (!item) return false;
    item.resolved = true;
    if (answer) item.suggestedAnswer = answer;
    await saveState(state);
    return true;
  }

  static async deleteUnansweredQuery(id: string, workspaceId?: string): Promise<boolean> {
    const state = await ensureInitialized();
    if (!state.unansweredQueries) state.unansweredQueries = [];
    const owner = await ownerOfRow('unanswered', id, state.unansweredQueries);
    if (!owner) return false;

    if (workspaceId && workspaceId !== '*' && !assistantInWorkspace(state, owner.assistantId, workspaceId)) {
      return false;
    }

    if (isRelationalModeEnabled()) {
      try {
        await Relational.relationalDeleteUnansweredQuery(id);
        state.unansweredQueries = state.unansweredQueries.filter((q) => q.id !== id);
        cachedState = state;
        afterHotWrite(state);
        return true;
      } catch (err) {
        console.warn('[Relational] deleteUnansweredQuery failed:', err);
        if (isConnectionError(err)) {
          disablePostgresTemporarily();
        }
      }
    }

    state.unansweredQueries = state.unansweredQueries.filter((q) => q.id !== id);
    await saveState(state);
    return true;
  }

  // Appointment & Calendar Booking
  static async saveAppointment(data: {
    assistantId: string;
    name: string;
    email: string;
    phone?: string;
    date: string;
    timeSlot: string;
    durationMinutes?: number;
    notes?: string;
    serviceId?: string;
    serviceName?: string;
    price?: number;
    landingPageName?: string;
    landingPageSlug?: string;
    slotStart?: string;
    slotEnd?: string;
  }): Promise<AppointmentData> {
    const manageToken = crypto.randomBytes(16).toString('hex');

    const apt: AppointmentData = {
      id: 'apt_' + Math.random().toString(36).substring(2, 10),
      assistantId: data.assistantId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      date: data.date,
      timeSlot: data.timeSlot,
      durationMinutes: data.durationMinutes || 30,
      status: 'confirmed',
      notes: data.notes,
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      price: data.price,
      manageToken,
      landingPageName: data.landingPageName,
      landingPageSlug: data.landingPageSlug,
      slotStart: data.slotStart,
      slotEnd: data.slotEnd,
      remindersSent: {
        reminder24h: false,
        reminder1h: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isRelationalModeEnabled()) {
      try {
        const written = await Relational.relationalUpsertAppointment(apt);
        // No pool (e.g. it refused an insecure connection): nothing was written, so never report a booking that does not exist.
        if (!written && isRelationalModeRequired()) throw new BookingUnavailableError();
        // The row is stored. Refreshing the in-memory copy is best effort: its failure must not report the booking as lost.
        try {
          const state = await ensureInitialized();
          if (!state.appointments) state.appointments = [];
          state.appointments.unshift(apt);
          cachedState = state;
          afterHotWrite(state);
        } catch (refreshErr) {
          console.warn('[Relational] saveAppointment stored the booking; the cache refresh failed:', refreshErr);
        }
        return apt;
      } catch (err: any) {
        if (err?.code === 'SLOT_CONFLICT' || err instanceof BookingUnavailableError) {
          throw err;
        }
        console.warn('[Relational] saveAppointment failed, disabling postgres:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
        if (isRelationalModeRequired()) throw new BookingUnavailableError(undefined, { cause: err });
      }
    } else if (isRelationalModeRequired()) {
      throw new BookingUnavailableError();
    }

    const state = await ensureInitialized();
    if (!state.appointments) state.appointments = [];
    state.appointments.unshift(apt);
    await saveState(state);
    return apt;
  }

  static async createAppointment(data: Parameters<typeof Database.saveAppointment>[0]): Promise<AppointmentData> {
    return Database.saveAppointment(data);
  }

  /**
   * Busy periods from all of the assistant's linked external calendars, sorted by start, used by every booking path's conflict check.
   * With `from`, blocks that ended at or before it are left out. In required mode a database failure throws BookingUnavailableError:
   * code that only narrows what is offered catches it and uses none (lib/calendar/sync/safe-blocks.ts), code that confirms a booking refuses.
   */
  static async getExternalBlocks(assistantId: string, from?: Date): Promise<ExternalBlock[]> {
    const rel = await onCalendarTables(() => Relational.relationalGetExternalBlocks(assistantId, from));
    if (rel) return rel.value;
    return CalendarFile.fileGetBlocks(assistantId, from);
  }

  /** The calendar links of one assistant, oldest first. */
  static async getCalendarLinks(assistantId: string): Promise<CalendarLink[]> {
    const rel = await onCalendarTables(() => Relational.relationalGetCalendarLinks(assistantId));
    if (rel) return rel.value;
    return CalendarFile.fileGetLinks(assistantId);
  }

  /** Every assistant's calendar links (the sync job's work list). */
  static async getAllCalendarLinks(): Promise<CalendarLink[]> {
    const rel = await onCalendarTables(() => Relational.relationalGetAllCalendarLinks());
    if (rel) return rel.value;
    return CalendarFile.fileGetAllLinks();
  }

  /** Adds or updates a link (by id). Rejects a 6th link for an assistant, and a link id that belongs to another assistant. */
  static async saveCalendarLink(link: CalendarLink): Promise<CalendarLink> {
    const rel = await onCalendarTables(() => Relational.relationalSaveCalendarLink(link));
    if (rel) return rel.value;
    return CalendarFile.fileSaveLink(link, Relational.MAX_CALENDAR_LINKS_PER_ASSISTANT);
  }

  /** Removes a link and its blocks. Only the owning assistant can remove it; false when there is no such link for this assistant. */
  static async deleteCalendarLink(assistantId: string, linkId: string): Promise<boolean> {
    const rel = await onCalendarTables(() => Relational.relationalDeleteCalendarLink(assistantId, linkId));
    if (rel) return rel.value;
    return CalendarFile.fileDeleteLink(assistantId, linkId);
  }

  /**
   * Replaces all blocks of one link (never appends). One transaction in Postgres, so readers see the old set or the new one.
   * Keeps at most 20,000 blocks per link, the nearest in time, and logs when it had to drop some.
   */
  static async replaceExternalBlocks(linkId: string, assistantId: string, blocks: ExternalBlock[]): Promise<void> {
    const { kept, dropped } = nearestBlocks(blocks, Relational.MAX_BLOCKS_PER_LINK);
    if (dropped > 0) {
      logEvent({ level: 'warn', category: 'booking', event: 'calendar.blocks_truncated', meta: { assistantId, linkId, kept: kept.length, dropped } });
    }
    const rel = await onCalendarTables(async () => ((await Relational.relationalReplaceExternalBlocks(linkId, assistantId, kept)) ? true : null));
    if (rel) return;
    CalendarFile.fileReplaceBlocks(linkId, assistantId, kept);
  }

  /**
   * The assistant that owns a calendar feed token, for the read-only feed route. Tokens shorter than 20 characters are refused
   * without looking at any assistant, and every stored token is compared in constant time, so the answer time does not reveal how much matched.
   */
  static async getAssistantByCalendarFeedToken(token: string): Promise<AssistantData | null> {
    if (typeof token !== 'string' || token.length < 20) return null;
    const state = await ensureInitialized();
    let matchId: string | null = null;
    for (const a of state.assistants) {
      const stored = a.calendarFeedToken;
      if (typeof stored === 'string' && stored.length >= 20 && timingSafeStringEqual(token, stored) && matchId === null) matchId = a.id;
    }
    return matchId ? Database.getAssistantById(matchId) : null;
  }

  /**
   * Appointments of one assistant (matched by id, slug or landing page), of a workspace, or all.
   * When the assistant has none, the list falls back to the other assistants of its workspace (a dashboard view);
   * booking checks pass `{ ownOnly: true }` so another assistant's bookings never block or show as taken.
   */
  static async getAppointments(assistantId?: string, workspaceId?: string, opts: { ownOnly?: boolean } = {}): Promise<AppointmentData[]> {
    let wsAssistantIds: string[] | undefined;
    if (workspaceId && workspaceId !== '*') {
      const state = await ensureInitialized();
      wsAssistantIds = (state.assistants || [])
        .filter((a) => (a.workspaceId || 'default-workspace') === workspaceId)
        .map((a) => a.id);
    }

    if (isRelationalModeEnabled()) {
      try {
        const relApts = await Relational.relationalGetAppointments(assistantId, wsAssistantIds);
        if (relApts.length > 0 || wsAssistantIds !== undefined) return relApts;
      } catch (err) {
        console.warn('[Relational] getAppointments failed, disabling postgres:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    }

    const state = await ensureInitialized();
    let all = state.appointments || [];

    if (wsAssistantIds !== undefined) {
      const wsSet = new Set(wsAssistantIds);
      all = all.filter((a) => wsSet.has(a.assistantId));
    }

    if (!assistantId) return all;

    const matched = all.filter(
      (a) =>
        matchesAssistant(a.assistantId, assistantId, state) ||
        (a.landingPageSlug ? matchesAssistant(a.landingPageSlug, assistantId, state) : false)
    );
    if (matched.length > 0 || opts.ownOnly) return matched;

    // Fallback: Check if there are appointments in the same workspace
    const targetAst = (state.assistants || []).find((a) => a.id === assistantId);
    const targetWs = targetAst?.workspaceId || 'default-workspace';
    if (workspaceId && workspaceId !== '*' && targetWs !== workspaceId) {
      return [];
    }
    const workspaceAppointments = all.filter((a) => {
      const aAst = (state.assistants || []).find((ast) => ast.id === a.assistantId);
      const aWs = aAst?.workspaceId || 'default-workspace';
      return aWs === targetWs;
    });

    if (workspaceAppointments.length > 0) {
      return workspaceAppointments;
    }

    return matched;
  }

  static async getAppointmentById(id: string): Promise<AppointmentData | null> {
    if (isRelationalModeEnabled()) {
      try {
        const relApt = await Relational.relationalGetAppointmentById(id);
        if (relApt) return relApt;
      } catch (err) {
        console.warn('[Relational] getAppointmentById failed, disabling postgres:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    }
    const state = await ensureInitialized();
    const apt = (state.appointments || []).find((a) => a.id === id);
    return apt || null;
  }

  static async getAppointmentByManageToken(token: string): Promise<AppointmentData | null> {
    if (isRelationalModeEnabled()) {
      try {
        const relApt = await Relational.relationalGetAppointmentByToken(token);
        if (relApt) return relApt;
      } catch (err) {
        console.warn('[Relational] getAppointmentByManageToken failed, disabling postgres:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    }
    const state = await ensureInitialized();
    const apt = (state.appointments || []).find((a) => a.manageToken === token);
    return apt || null;
  }

  static async updateAppointment(
    id: string,
    updates: Partial<AppointmentData>
  ): Promise<AppointmentData | null> {
    if (isRelationalModeEnabled()) {
      try {
        const written = await Relational.relationalUpdateAppointment(id, updates);
        // false is also "no row matched", so only a missing pool means the change was not stored anywhere.
        if (!written && isRelationalModeRequired() && !getPostgresPool()) throw new BookingUnavailableError();
        // The change is stored. Refreshing the in-memory copy is best effort: its failure must not report the change as lost.
        let cached: AppointmentData | undefined;
        try {
          const state = await ensureInitialized();
          cached = state.appointments?.find((a) => a.id === id);
          if (cached) {
            Object.assign(cached, updates, { updatedAt: new Date().toISOString() });
            cachedState = state;
          }
          afterHotWrite(state);
        } catch (refreshErr) {
          cached = undefined;
          console.warn('[Relational] updateAppointment stored the change; the cache refresh failed:', refreshErr);
        }
        if (cached) return cached;
        // awaited here so a failed read is handled by this branch's catch like any other relational error
        return await Relational.relationalGetAppointmentById(id);
      } catch (err: any) {
        // The new slot is taken (reschedule): report it, never fall back to writing the change elsewhere.
        if (err?.code === 'SLOT_CONFLICT' || err instanceof BookingUnavailableError) {
          throw err;
        }
        console.warn('[Relational] updateAppointment failed, disabling postgres:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
        if (isRelationalModeRequired()) throw new BookingUnavailableError(undefined, { cause: err });
      }
    } else if (isRelationalModeRequired()) {
      throw new BookingUnavailableError();
    }

    const state = await ensureInitialized(true);
    if (!state.appointments) return null;
    const apt = state.appointments.find((a) => a.id === id);
    if (!apt) return null;
    Object.assign(apt, updates, { updatedAt: new Date().toISOString() });
    await saveState(state);
    return apt;
  }

  static async updateAppointmentStatus(
    id: string,
    status: AppointmentData['status'],
    cancellationReason?: string,
    workspaceId?: string
  ): Promise<boolean> {
    if (workspaceId && workspaceId !== '*') {
      const state = await ensureInitialized();
      const existingApt = isRelationalModeEnabled()
        ? await Relational.relationalGetAppointmentById(id)
        : (state.appointments || []).find((a) => a.id === id);
      if (!existingApt) return false;
      const ast = (state.assistants || []).find((a) => a.id === existingApt.assistantId);
      const aptWs = ast?.workspaceId || 'default-workspace';
      if (aptWs !== workspaceId) {
        return false;
      }
    }

    if (isRelationalModeEnabled()) {
      try {
        const written = await Relational.relationalUpdateAppointment(id, { status, cancellationReason });
        // false is also "no row matched", so only a missing pool means the change was not stored anywhere.
        if (!written && isRelationalModeRequired() && !getPostgresPool()) throw new BookingUnavailableError();
        // The change is stored. Refreshing the in-memory copy is best effort: its failure must not report the change as lost.
        try {
          const state = await ensureInitialized();
          const apt = state.appointments?.find((a) => a.id === id);
          if (apt) {
            apt.status = status;
            if (cancellationReason) apt.cancellationReason = cancellationReason;
            apt.updatedAt = new Date().toISOString();
            cachedState = state;
          }
          afterHotWrite(state);
        } catch (refreshErr) {
          console.warn('[Relational] updateAppointmentStatus stored the change; the cache refresh failed:', refreshErr);
        }
        return true;
      } catch (err: any) {
        // The slot was rebooked meanwhile (un-cancel): report it, never fall back to writing the status elsewhere.
        if (err?.code === 'SLOT_CONFLICT' || err instanceof BookingUnavailableError) {
          throw err;
        }
        console.warn('[Relational] updateAppointmentStatus failed, disabling postgres:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
        if (isRelationalModeRequired()) throw new BookingUnavailableError(undefined, { cause: err });
      }
    } else if (isRelationalModeRequired()) {
      throw new BookingUnavailableError();
    }

    const state = await ensureInitialized(true);
    if (!state.appointments) return false;
    const apt = state.appointments.find((a) => a.id === id);
    if (!apt) return false;
    apt.status = status;
    if (cancellationReason) apt.cancellationReason = cancellationReason;
    apt.updatedAt = new Date().toISOString();
    await saveState(state);
    return true;
  }

  static async deleteAppointment(id: string, workspaceId?: string): Promise<boolean> {
    const state = await ensureInitialized();
    if (!state.appointments) state.appointments = [];
    const apt = await ownerOfRow('appointment', id, state.appointments);
    if (!apt) return false;

    if (workspaceId && workspaceId !== '*' && !assistantInWorkspace(state, apt.assistantId, workspaceId)) {
      return false;
    }

    if (isRelationalModeEnabled()) {
      try {
        await Relational.relationalDeleteAppointment(id);
        state.appointments = state.appointments.filter((a) => a.id !== id);
        cachedState = state;
        afterHotWrite(state);
        return true;
      } catch (err) {
        console.warn('[Relational] deleteAppointment failed, disabling postgres:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    }

    state.appointments = state.appointments.filter((a) => a.id !== id);
    await saveState(state);
    return true;
  }

  static async getUpcomingAppointmentsForReminders(): Promise<AppointmentData[]> {
    if (isRelationalModeEnabled()) {
      try {
        const relApts = await Relational.relationalGetUpcomingConfirmedAppointments();
        if (relApts.length > 0) return relApts;
      } catch (err) {
        console.warn('[Relational] getUpcomingAppointmentsForReminders failed, disabling postgres:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    }
    const state = await ensureInitialized();
    return (state.appointments || []).filter((a) => a.status === 'confirmed');
  }

  static async markReminderSent(id: string, type: '24h' | '1h'): Promise<boolean> {
    const state = await ensureInitialized();
    if (!state.appointments) return false;
    const apt = state.appointments.find((a) => a.id === id);
    if (!apt) return false;
    if (!apt.remindersSent) {
      apt.remindersSent = {};
    }
    if (type === '24h') {
      apt.remindersSent.reminder24h = true;
      apt.remindersSent.reminder24hSentAt = new Date().toISOString();
    } else if (type === '1h') {
      apt.remindersSent.reminder1h = true;
      apt.remindersSent.reminder1hSentAt = new Date().toISOString();
    }
    apt.updatedAt = new Date().toISOString();

    if (isRelationalModeEnabled()) {
      try {
        await Relational.relationalUpdateAppointment(id, { remindersSent: apt.remindersSent });
        cachedState = state;
        afterHotWrite(state);
        return true;
      } catch (err) {
        console.warn('[Relational] markReminderSent failed, disabling postgres:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    }

    await saveState(state);
    return true;
  }

  // Hosted Landing Page Config
  static async getLandingPageConfig(assistantId: string): Promise<LandingPageConfig | null> {
    const state = await ensureInitialized();
    const normalized = assistantId.toLowerCase().trim();
    const ast = state.assistants.find((a) => a.id === assistantId || a.id.toLowerCase() === normalized);
    if (ast && ast.landingPageConfig) {
      return ast.landingPageConfig;
    }
    if (TEMPLATE_LANDING_CONFIGS[normalized]) {
      return TEMPLATE_LANDING_CONFIGS[normalized];
    }
    return null;
  }

  static async updateLandingPageConfig(
    assistantId: string,
    config: Partial<LandingPageConfig>
  ): Promise<LandingPageConfig | null> {
    const state = await ensureInitialized();
    const ast = state.assistants.find((a) => a.id === assistantId);
    if (!ast) return null;
    ast.landingPageConfig = {
      ...(ast.landingPageConfig || DEFAULT_BUSINESS_LANDING_CONFIG),
      ...config,
    };
    ast.updatedAt = new Date().toISOString();
    await saveState(state);
    return ast.landingPageConfig;
  }

  static async getAssistantBySlug(slug: string): Promise<AssistantData | null> {
    const state = await ensureInitialized();
    const normalizedSlug = slug.toLowerCase().trim();
    let ast = state.assistants.find((a) => {
      if (a.id.toLowerCase() === normalizedSlug) return true;
      if (a.landingPageConfig?.slug && a.landingPageConfig.slug.toLowerCase().trim() === normalizedSlug) return true;
      return false;
    });

    if (!ast && TEMPLATE_LANDING_CONFIGS[normalizedSlug]) {
      const presetConfig = TEMPLATE_LANDING_CONFIGS[normalizedSlug];
      const newAst: AssistantData = {
        id: `ast_${presetConfig.slug.replace(/[^a-zA-Z0-9_-]/g, '_')}`,
        workspaceId: 'default-workspace',
        name: presetConfig.businessName,
        description: presetConfig.tagline,
        systemPrompt: `You are the friendly, professional, and knowledgeable AI assistant for ${presetConfig.businessName}. Your primary mission is to answer visitor questions clearly and accurately about our services, pricing, business hours, and help clients schedule an appointment or inquiry. Always use the official business services and pricing catalog provided.`,
        welcomeMessage: `Hello! Welcome to ${presetConfig.businessName}. How can I assist you today?`,
        fallbackMessage: `I want to make sure you get the exact details you need! Would you like to schedule an appointment or speak with our team?`,
        temperature: 0.3,
        provider: 'groq',
        modelName: 'openai/gpt-oss-120b',
        customBaseUrl: '',
        primaryColor: presetConfig.themeColor || '#2563eb',
        launcherPosition: 'bottom-right',
        starterQuestions: presetConfig.starterQuestions || [
          'What services do you offer?',
          'What are your prices?',
          'What are your opening hours?',
          'Can I schedule an appointment?',
        ],
        collectLeadEmail: true,
        allowedDomains: [],
        bookingEnabled: true,
        bookingProvider: 'direct',
        bookingPromptText: presetConfig.heroCtaText,
        bookingSlotDuration: 45,
        bookingStartHour: '09:00',
        bookingEndHour: '18:00',
        bookingAvailableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        landingPageConfig: presetConfig,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      state.assistants.push(newAst);
      await saveState(state);
      ast = newAst;
    }

    if (!ast) return null;
    return {
      ...ast,
      apiKeyEncrypted: decryptSecret(ast.apiKeyEncrypted || ''),
      hasConnectedKey: undefined, // computed for the screens, never a stored fact (older saves wrote it into the record)
      keyHealth: undefined,
      telegramBotToken: decryptSecret(ast.telegramBotToken || ''),
      whatsappAccessToken: decryptSecret(ast.whatsappAccessToken || ''),
      webhookSecret: decryptSecret(ast.webhookSecret || ''),
    };
  }

  // Team Management & Role-Based Access Control
  static async getTeamMembers(workspaceId: string = 'default-workspace'): Promise<TeamMemberData[]> {
    const state = await ensureInitialized();
    return (state.teamMembers || []).filter((tm) => tm.workspaceId === workspaceId);
  }

  static async getTeamMemberByEmail(email: string): Promise<TeamMemberData | null> {
    const state = await ensureInitialized();
    const member = (state.teamMembers || []).find((tm) => tm.email.toLowerCase() === email.toLowerCase().trim());
    return member || null;
  }

  static async addTeamMember(
    data: Omit<TeamMemberData, 'id' | 'createdAt'>
  ): Promise<TeamMemberData & { temporaryPassword?: string }> {
    const state = await ensureInitialized();
    if (!state.teamMembers) state.teamMembers = [];

    // Newly invited members always get a unique, randomly generated
    // temporary password (returned once to the inviter) instead of relying
    // on a shared, predictable default credential.
    let temporaryPassword: string | undefined;
    let storedPassword = data.password;
    if (!storedPassword) {
      temporaryPassword = generateTempPassword();
      storedPassword = hashPassword(temporaryPassword);
    } else if (!isHashedPassword(storedPassword)) {
      storedPassword = hashPassword(storedPassword);
    }

    const newMember: TeamMemberData = {
      ...data,
      id: 'tm_' + Math.random().toString(36).substring(2, 10),
      password: storedPassword,
      createdAt: new Date().toISOString(),
    };
    state.teamMembers.push(newMember);
    await saveState(state);
    return { ...newMember, temporaryPassword };
  }

  static async updateTeamMember(
    id: string,
    updates: Partial<TeamMemberData>
  ): Promise<TeamMemberData | null> {
    const state = await ensureInitialized();
    if (!state.teamMembers) return null;
    const member = state.teamMembers.find((m) => m.id === id);
    if (!member) return null;
    Object.assign(member, updates);
    await saveState(state);
    return member;
  }

  /**
   * Whether a CONFIRMED account already owns this e-mail address (a workspace owner or a team member). An account that is still
   * waiting for its confirmation e-mail does not count: whoever typed an address into a sign-up form has not shown they own it,
   * so it must not stop the real owner from signing up, nor let anyone else claim it.
   */
  static async emailBelongsToConfirmedAccount(email: string): Promise<boolean> {
    const state = await ensureInitialized();
    const clean = (email || '').toLowerCase().trim();
    if (!clean) return false;
    const members = (state.teamMembers || []).filter((m) => (m.email || '').toLowerCase().trim() === clean);
    if (members.some((m) => m.emailVerified !== false)) return true;
    // an older workspace whose owner has no member record yet
    return (state.workspaces || []).some(
      (w: any) =>
        (w.ownerEmail || '').toLowerCase().trim() === clean &&
        !(state.teamMembers || []).some((m) => m.workspaceId === w.id && (m.email || '').toLowerCase().trim() === clean),
    );
  }

  /**
   * Marks the address as confirmed. With `newPassword` it also replaces the password and ends every other session, and with
   * `revokeSessions` it ends them without a new password. Two-factor settings are left alone here.
   */
  static async confirmEmail(
    memberId: string,
    opts: { newPassword?: string; revokeSessions?: boolean } = {},
  ): Promise<TeamMemberData | null> {
    const state = await ensureInitialized();
    const member = (state.teamMembers || []).find((m) => m.id === memberId);
    if (!member) return null;
    member.emailVerified = true;
    member.emailVerifiedAt = new Date().toISOString();
    if (opts.newPassword) {
      const hashed = hashPassword(opts.newPassword);
      member.password = hashed;
      const ws: any = (state.workspaces || []).find((w) => w.id === member.workspaceId);
      if (ws && (ws.ownerEmail || '').toLowerCase() === (member.email || '').toLowerCase()) ws.ownerPassword = hashed;
    }
    if (opts.newPassword || opts.revokeSessions) member.sessionVersion = (member.sessionVersion || 0) + 1;
    member.updatedAt = new Date().toISOString();
    await saveState(state);
    return member;
  }

  /** Plain lookup: unlike getTeamMemberById it never invents a member. Used to check a session against the account it names. */
  /**
   * Loads the shared state from the database now, instead of trusting this server's copy (which can be up to a minute old).
   * Used when a signed session names an account this server does not know: another server may have just created it.
   * At most one forced load every few seconds, so a deleted account's old session cannot make every request hit the database.
   * Returns false when nothing was reloaded.
   */
  static async refreshState(minIntervalMs: number = 3000): Promise<boolean> {
    if (!isCloudDbConfigured()) return false;
    const now = Date.now();
    if (now - lastForcedRefresh < minIntervalMs) return false;
    lastForcedRefresh = now;
    try {
      await ensureInitialized(true);
      return true;
    } catch {
      return false;
    }
  }

  static async findTeamMember(id: string): Promise<TeamMemberData | null> {
    const state = await ensureInitialized();
    return (state.teamMembers || []).find((m) => m.id === id) || null;
  }

  /** Ends every existing session of a member and returns the version a fresh session must carry. */
  static async bumpSessionVersion(id: string): Promise<number> {
    const state = await ensureInitialized();
    const member = (state.teamMembers || []).find((m) => m.id === id);
    if (!member) return 0;
    member.sessionVersion = (member.sessionVersion || 0) + 1;
    await saveState(state);
    return member.sessionVersion;
  }

  static async deleteTeamMember(id: string): Promise<boolean> {
    const state = await ensureInitialized();
    if (!state.teamMembers) return false;
    const prevLen = state.teamMembers.length;
    state.teamMembers = state.teamMembers.filter((m) => m.id !== id);
    await saveState(state);
    return state.teamMembers.length < prevLen;
  }

  static async verifyStaffLogin(
    email: string,
    passwordOrCode: string,
    workspaceId?: string
  ): Promise<TeamMemberData | null> {
    const state = await ensureInitialized();
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanSecret = (passwordOrCode || '').trim();
    if (!cleanEmail || !cleanSecret) return null;

    for (const tm of state.teamMembers || []) {
      if (workspaceId && tm.workspaceId && tm.workspaceId !== workspaceId) continue;
      if (tm.email.toLowerCase().trim() !== cleanEmail) continue;
      if (tm.status && tm.status !== 'active') continue;

      const passMatch = Boolean(tm.password) && verifyPassword(cleanSecret, tm.password);
      const codeMatch = !passMatch && Boolean(tm.accessCode) && verifyPassword(cleanSecret.toLowerCase(), tm.accessCode);
      if (!passMatch && !codeMatch) continue;

      // Lazily migrate any legacy plaintext credential to hashed storage.
      if (passMatch && tm.password && !isHashedPassword(tm.password)) {
        tm.password = hashPassword(cleanSecret);
      }
      if (codeMatch && tm.accessCode && !isHashedPassword(tm.accessCode)) {
        tm.accessCode = hashPassword(cleanSecret.toLowerCase());
      }

      tm.lastLoginAt = new Date().toISOString();
      await saveState(state);
      return tm;
    }
    return null;
  }

  static async setTeamMemberCredentials(
    memberId: string,
    credentials: { password?: string; accessCode?: string }
  ): Promise<TeamMemberData | null> {
    const state = await ensureInitialized();
    if (!state.teamMembers) return null;
    const member = state.teamMembers.find((m) => m.id === memberId);
    if (!member) return null;
    if (credentials.password) member.password = hashPassword(credentials.password.trim());
    if (credentials.accessCode) member.accessCode = hashPassword(credentials.accessCode.trim().toLowerCase());
    await saveState(state);
    return member;
  }

  static async getTeamMemberById(id: string, workspaceId?: string): Promise<TeamMemberData | null> {
    const state = await ensureInitialized();
    if (!state.teamMembers) state.teamMembers = [];
    let member = state.teamMembers.find((m) => m.id === id);
    if (!member && (id === 'admin' || id === 'master-admin' || id === 'tm_owner')) {
      member = state.teamMembers.find((m) => m.role === 'owner' && (!workspaceId || m.workspaceId === workspaceId))
        || state.teamMembers.find((m) => m.role === 'owner');
      if (!member) {
        member = {
          id: 'tm_owner',
          workspaceId: workspaceId || 'default-workspace',
          name: 'Master Admin',
          email: getMasterEmail(),
          role: 'owner',
          status: 'active',
          title: 'Master Administrator',
          createdAt: new Date().toISOString(),
        };
        state.teamMembers.push(member);
        await saveState(state);
      }
    }
    if (!member && workspaceId) {
      member = state.teamMembers.find((m) => m.workspaceId === workspaceId && m.role === 'owner');
      if (!member) {
        const ws = state.workspaces.find((w) => w.id === workspaceId);
        if (ws) {
          const ownerEmail = (ws as any).ownerEmail || ws.billingEmail || 'owner@crescelo.com';
          member = {
            id: `owner_${ws.id}`,
            workspaceId: ws.id,
            name: ws.name || 'Owner',
            email: ownerEmail,
            role: 'owner',
            status: 'active',
            title: 'Workspace Owner',
            createdAt: ws.createdAt || new Date().toISOString(),
          };
          state.teamMembers.push(member);
          await saveState(state);
        }
      }
    }
    return member || null;
  }

  static async updateTeamMemberProfile(
    id: string,
    updates: {
      name?: string;
      title?: string;
      avatarUrl?: string;
      password?: string;
    },
    workspaceId?: string
  ): Promise<TeamMemberData | null> {
    const state = await ensureInitialized();
    if (!state.teamMembers) state.teamMembers = [];
    let member = state.teamMembers.find((m) => m.id === id);

    // If not found by exact id, attempt fallback resolution
    if (!member && (id === 'admin' || id === 'master-admin' || id === 'tm_owner')) {
      member = state.teamMembers.find((m) => m.role === 'owner' && (!workspaceId || m.workspaceId === workspaceId))
        || state.teamMembers.find((m) => m.role === 'owner');
      if (!member) {
        member = {
          id: 'tm_owner',
          workspaceId: workspaceId || 'default-workspace',
          name: updates.name?.trim() || 'Master Admin',
          email: getMasterEmail(),
          role: 'owner',
          status: 'active',
          title: updates.title?.trim() || 'Master Administrator',
          createdAt: new Date().toISOString(),
        };
        state.teamMembers.push(member);
      }
    }

    // If still not found, check if this is an owner or member for the specified workspace
    if (!member && workspaceId) {
      member = state.teamMembers.find((m) => m.workspaceId === workspaceId && m.role === 'owner');
    }

    // Auto-upsert if member still does not exist so profile edits never get lost
    if (!member) {
      const targetWs = workspaceId ? state.workspaces.find((w) => w.id === workspaceId) : null;
      member = {
        id,
        workspaceId: targetWs?.id || workspaceId || 'default-workspace',
        name: updates.name?.trim() || targetWs?.name || 'User',
        email: (targetWs as any)?.ownerEmail || (targetWs as any)?.billingEmail || 'user@crescelo.com',
        role: 'owner',
        status: 'active',
        title: updates.title?.trim() || '',
        avatarUrl: updates.avatarUrl || '',
        createdAt: new Date().toISOString(),
      };
      state.teamMembers.push(member);
    }

    if (updates.name !== undefined && updates.name.trim()) {
      member.name = updates.name.trim();
    }
    if (updates.title !== undefined) {
      member.title = updates.title.trim();
    }
    if (updates.avatarUrl !== undefined) {
      member.avatarUrl = updates.avatarUrl;
    }
    if (updates.password !== undefined && updates.password.trim()) {
      const hashed = hashPassword(updates.password.trim());
      member.password = hashed;
      member.sessionVersion = (member.sessionVersion || 0) + 1;
      const ws = state.workspaces.find((w) => w.id === member!.workspaceId);
      if (ws && (ws as any).ownerEmail && (ws as any).ownerEmail.toLowerCase() === member.email.toLowerCase()) {
        (ws as any).ownerPassword = hashed;
      }
    }
    member.updatedAt = new Date().toISOString();
    await saveState(state);
    return member;
  }


  // Security Audit Trail
  static async addAuditLog(entry: Omit<AuditLogData, 'id' | 'timestamp'>): Promise<AuditLogData> {
    const state = await ensureInitialized();
    if (!state.auditLogs) state.auditLogs = [];

    const actor = { ...entry.actor };
    if (!actor.email) {
      if (entry.details?.email && typeof entry.details.email === 'string') {
        actor.email = entry.details.email;
      } else if (entry.details?.attemptedEmail && typeof entry.details.attemptedEmail === 'string') {
        actor.email = entry.details.attemptedEmail;
      } else if (entry.details?.ownerEmail && typeof entry.details.ownerEmail === 'string') {
        actor.email = entry.details.ownerEmail;
      } else if (actor.id === 'admin' || actor.id === 'master-admin' || actor.name === 'Master Admin') {
        actor.email = getMasterEmail();
      }
    }
    if (!actor.username) {
      if (actor.email) {
        actor.username = actor.email.split('@')[0];
      } else if (actor.name && actor.name !== 'Unknown') {
        actor.username = actor.name;
      }
    }

    const log: AuditLogData = {
      id: 'aud_' + Math.random().toString(36).substring(2, 12),
      timestamp: new Date().toISOString(),
      ...entry,
      actor,
    };
    // Mirror into the system log (master-only), which keeps far more history than the blob-backed audit trail.
    logEvent({
      level: /fail|denied|blocked|invalid|lockout/i.test(entry.action) ? 'warn' : 'info',
      category: entry.action.startsWith('auth.') ? 'auth' : 'audit',
      event: entry.action,
      // a plain sentence, so the log can be read (and searched) without knowing the event codes
      message: describeLog({ event: entry.action, userId: actor.id, meta: { actorName: actor.name, email: actor.email, details: entry.details } }),
      userId: actor.id,
      workspaceId: entry.workspaceId || entry.details?.workspaceId,
      ip: actor.ip,
      meta: {
        actorName: actor.name,
        // e-mail addresses are recorded for sign-in events only
        ...(entry.action.startsWith('auth.') && actor.email ? { email: actor.email } : {}),
        targetType: entry.targetType,
        targetId: entry.targetId,
        details: entry.details,
      },
    });
    state.auditLogs.unshift(log);
    // Keep last 1000 logs
    if (state.auditLogs.length > 1000) {
      state.auditLogs = state.auditLogs.slice(0, 1000);
    }
    await saveState(state);
    return log;
  }

  static async getAuditLogs(limit: number = 100, workspaceId?: string): Promise<AuditLogData[]> {
    const state = await ensureInitialized();
    let logs = state.auditLogs || [];
    if (workspaceId && workspaceId !== '*') {
      logs = logs.filter(
        (l) =>
          l.workspaceId === workspaceId ||
          l.details?.workspaceId === workspaceId ||
          (l.targetType === 'workspace' && l.targetId === workspaceId)
      );
    }
    return logs.slice(0, limit);
  }

  // Real-time In-App Notifications
  static async getNotifications(
    assistantId?: string,
    limit: number = 50,
    workspaceId?: string
  ): Promise<InAppNotificationData[]> {
    let wsAssistantIds: string[] | undefined;
    if (workspaceId && workspaceId !== '*') {
      const state = await ensureInitialized();
      wsAssistantIds = (state.assistants || [])
        .filter((a) => (a.workspaceId || 'default-workspace') === workspaceId)
        .map((a) => a.id);
    }

    if (isRelationalModeEnabled()) {
      try {
        const relNotifs = await Relational.relationalGetNotifications(assistantId, limit, wsAssistantIds);
        if (relNotifs.length > 0 || wsAssistantIds !== undefined) return relNotifs;
      } catch (err) {
        console.warn('[Relational] getNotifications failed, disabling postgres:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    }
    const state = await ensureInitialized();
    let notifs = state.notifications || [];
    if (wsAssistantIds !== undefined) {
      const wsSet = new Set(wsAssistantIds);
      notifs = notifs.filter((n) => !n.assistantId || wsSet.has(n.assistantId));
    }
    if (assistantId) {
      notifs = notifs.filter((n) => !n.assistantId || n.assistantId === assistantId);
    }
    return notifs.slice(0, limit);
  }

  static async addNotification(
    data: Omit<InAppNotificationData, 'id' | 'createdAt' | 'read'>
  ): Promise<InAppNotificationData> {
    const notif: InAppNotificationData = {
      id: 'notif_' + Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
      read: false,
      ...data,
    };

    if (isRelationalModeEnabled()) {
      try {
        await Relational.relationalInsertNotification(notif);
        const state = await ensureInitialized();
        if (!state.notifications) state.notifications = [];
        state.notifications.unshift(notif);
        if (state.notifications.length > 200) {
          state.notifications = state.notifications.slice(0, 200);
        }
        cachedState = state;
        afterHotWrite(state);

        // Non-blocking background push notification dispatch
        import('@/lib/notifications/push')
          .then(({ sendPushNotification }) => {
            sendPushNotification({
              title: notif.title,
              body: notif.message,
              assistantId: notif.assistantId,
              data: notif.metadata,
            }).catch(() => {});
          })
          .catch(() => {});

        return notif;
      } catch (err) {
        console.warn('[Relational] addNotification failed, disabling postgres:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    }

    const state = await ensureInitialized();
    if (!state.notifications) state.notifications = [];
    state.notifications.unshift(notif);
    if (state.notifications.length > 200) {
      state.notifications = state.notifications.slice(0, 200);
    }
    await saveState(state);

    // Non-blocking background push notification dispatch
    import('@/lib/notifications/push')
      .then(({ sendPushNotification }) => {
        sendPushNotification({
          title: notif.title,
          body: notif.message,
          assistantId: notif.assistantId,
          data: notif.metadata,
        }).catch(() => {});
      })
      .catch(() => {});

    return notif;
  }

  static async markNotificationAsRead(id: string, workspaceId?: string): Promise<boolean> {
    const state = await ensureInitialized();
    if (!state.notifications) state.notifications = [];
    const owner = await ownerOfRow('notification', id, state.notifications);
    if (!owner) return false;
    const item = state.notifications.find((n) => n.id === id);

    // a notification with no assistant is workspace-agnostic (system) and may be marked by anyone signed in
    if (workspaceId && workspaceId !== '*' && owner.assistantId && !assistantInWorkspace(state, owner.assistantId, workspaceId)) {
      return false;
    }

    if (isRelationalModeEnabled()) {
      try {
        await Relational.relationalMarkNotificationRead(id);
        if (item) item.read = true;
        cachedState = state;
        afterHotWrite(state);
        return true;
      } catch (err) {
        console.warn('[Relational] markNotificationAsRead failed:', err);
        if (isConnectionError(err)) {
          disablePostgresTemporarily();
        }
      }
    }

    if (item) item.read = true;
    await saveState(state);
    return true;
  }

  static async markAllNotificationsAsRead(assistantId?: string, workspaceId?: string): Promise<boolean> {
    const state = await ensureInitialized();
    if (!state.notifications) return false;

    let allowedAssistantIds: Set<string> | null = null;
    if (workspaceId && workspaceId !== '*') {
      if (assistantId) {
        const ast = state.assistants.find((a) => a.id === assistantId);
        if (!ast || (ast.workspaceId || 'default-workspace') !== workspaceId) {
          return false;
        }
        allowedAssistantIds = new Set([assistantId]);
      } else {
        const wsBots = state.assistants
          .filter((a) => (a.workspaceId || 'default-workspace') === workspaceId)
          .map((a) => a.id);
        allowedAssistantIds = new Set(wsBots);
      }
    } else if (assistantId) {
      allowedAssistantIds = new Set([assistantId]);
    }

    if (isRelationalModeEnabled()) {
      try {
        if (!allowedAssistantIds) {
          await Relational.relationalMarkAllNotificationsRead();
        } else {
          for (const botId of allowedAssistantIds) {
            await Relational.relationalMarkAllNotificationsRead(botId);
          }
        }
        for (const item of state.notifications) {
          if (!allowedAssistantIds || (item.assistantId && allowedAssistantIds.has(item.assistantId))) {
            item.read = true;
          }
        }
        cachedState = state;
        afterHotWrite(state);
        return true;
      } catch (err) {
        console.warn('[Relational] markAllNotificationsAsRead failed:', err);
        if (isConnectionError(err)) {
          disablePostgresTemporarily();
        }
      }
    }

    for (const item of state.notifications) {
      if (!allowedAssistantIds || (item.assistantId && allowedAssistantIds.has(item.assistantId))) {
        item.read = true;
      }
    }
    await saveState(state);
    return true;
  }

  // Device Push Tokens (Mobile Companions)
  static async registerPushToken(
    token: string,
    workspaceId: string,
    memberId?: string,
    assistantId?: string,
    platform: 'android' | 'ios' | 'web' = 'android',
    deviceInfo?: string
  ): Promise<DevicePushTokenRecord> {
    const state = await ensureInitialized();
    if (!state.pushTokens) state.pushTokens = [];

    const existingIndex = state.pushTokens.findIndex((t) => t.token === token);
    const now = new Date().toISOString();

    if (existingIndex >= 0) {
      state.pushTokens[existingIndex] = {
        ...state.pushTokens[existingIndex],
        workspaceId,
        memberId: memberId || state.pushTokens[existingIndex].memberId,
        assistantId: assistantId || state.pushTokens[existingIndex].assistantId,
        platform,
        deviceInfo: deviceInfo || state.pushTokens[existingIndex].deviceInfo,
        updatedAt: now,
      };
      await saveState(state);
      return state.pushTokens[existingIndex];
    }

    const record: DevicePushTokenRecord = {
      id: 'ptk_' + Math.random().toString(36).substring(2, 10),
      token,
      memberId,
      workspaceId,
      assistantId,
      platform,
      deviceInfo,
      createdAt: now,
      updatedAt: now,
    };

    state.pushTokens.push(record);
    if (state.pushTokens.length > 500) {
      state.pushTokens = state.pushTokens.slice(-500);
    }
    await saveState(state);
    return record;
  }

  static async getPushTokens(workspaceId: string, assistantId?: string): Promise<DevicePushTokenRecord[]> {
    const state = await ensureInitialized();
    if (!state.pushTokens) return [];
    return state.pushTokens.filter((t) => {
      if (workspaceId !== '*' && t.workspaceId !== workspaceId) return false;
      if (assistantId && t.assistantId && t.assistantId !== assistantId) return false;
      return true;
    });
  }

  static async removePushToken(token: string): Promise<boolean> {
    const state = await ensureInitialized();
    if (!state.pushTokens) return false;
    const initialLen = state.pushTokens.length;
    state.pushTokens = state.pushTokens.filter((t) => t.token !== token);
    if (state.pushTokens.length !== initialLen) {
      await saveState(state);
      return true;
    }
    return false;
  }
  // Workspace & Chat-Based Billing
  static async getWorkspaceBilling(workspaceId: string = 'default-workspace'): Promise<WorkspaceBillingData> {
    const targetWsId = (!workspaceId || workspaceId === '*') ? 'default-workspace' : workspaceId;
    const state = await ensureInitialized();
    let ws = state.workspaces.find((w) => w.id === targetWsId);
    if (ws) adoptLegacyBillingFields(ws);
    const startOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const endOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString();

    if (!ws) {
      ws = {
        id: targetWsId,
        name: 'My Workspace',
        planId: 'starter',
        planName: 'Starter',
        billingInterval: 'monthly',
        monthlyChatLimit: 100,
        overageRatePerChat: 0.50,
        currentPeriodStart: startOfCurrentMonth,
        currentPeriodEnd: endOfCurrentMonth,
        paymentMethod: {
          brand: 'Visa',
          last4: '4242',
          expMonth: 12,
          expYear: 2028,
        },
        billingEmail: 'billing@crescelo.com',
        invoices: [
          {
            id: 'inv_10928',
            date: startOfCurrentMonth.split('T')[0],
            planName: 'Starter (100 Chats / mo)',
            amount: 49,
            status: 'paid',
          },
          {
            id: 'inv_10814',
            date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
            planName: 'Starter (100 Chats / mo)',
            amount: 49,
            status: 'paid',
          },
        ],
      };
      state.workspaces.push(ws);
      await saveState(state);
    } else if (!ws.planId) {
      ws.planId = 'starter';
      ws.planName = 'Starter';
      ws.billingInterval = 'monthly';
      ws.monthlyChatLimit = 100;
      ws.overageRatePerChat = 0.50;
      ws.currentPeriodStart = startOfCurrentMonth;
      ws.currentPeriodEnd = endOfCurrentMonth;
      ws.paymentMethod = ws.paymentMethod || {
        brand: 'Visa',
        last4: '4242',
        expMonth: 12,
        expYear: 2028,
      };
      ws.billingEmail = ws.billingEmail || 'billing@crescelo.com';
      ws.invoices = ws.invoices || [
        {
          id: 'inv_10928',
          date: startOfCurrentMonth.split('T')[0],
          planName: 'Starter (100 Chats / mo)',
          amount: 49,
          status: 'paid',
        },
        {
          id: 'inv_10814',
          date: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0],
          planName: 'Starter (100 Chats / mo)',
          amount: 49,
          status: 'paid',
        },
      ];
      await saveState(state);
    }
    return ws as WorkspaceBillingData;
  }

  static async updateWorkspaceBilling(
    workspaceId: string = 'default-workspace',
    updates: Partial<WorkspaceBillingData>
  ): Promise<WorkspaceBillingData> {
    const targetWsId = (!workspaceId || workspaceId === '*') ? 'default-workspace' : workspaceId;
    const state = await ensureInitialized();
    let ws = state.workspaces.find((w) => w.id === targetWsId);
    if (!ws) {
      await Database.getWorkspaceBilling(targetWsId);
      ws = state.workspaces.find((w) => w.id === targetWsId);
    }
    if (ws) {
      Object.assign(ws, updates);
      await saveState(state);
    }
    return ws as WorkspaceBillingData;
  }

  static async isWebhookProcessed(eventId: string): Promise<boolean> {
    if (!eventId || typeof eventId !== 'string') return false;
    const state = await ensureInitialized();
    return (state.processedWebhookEvents || []).includes(eventId.trim());
  }

  static async recordProcessedWebhook(eventId: string): Promise<void> {
    if (!eventId || typeof eventId !== 'string') return;
    const state = await ensureInitialized();
    if (!state.processedWebhookEvents) state.processedWebhookEvents = [];
    const cleanId = eventId.trim();
    if (!state.processedWebhookEvents.includes(cleanId)) {
      state.processedWebhookEvents.push(cleanId);
      if (state.processedWebhookEvents.length > 1000) {
        state.processedWebhookEvents = state.processedWebhookEvents.slice(-1000);
      }
      await saveState(state);
    }
  }

  static async clearProcessedWebhooksForTesting(): Promise<void> {
    const state = await ensureInitialized();
    state.processedWebhookEvents = [];
    await saveState(state);
  }

  static async seedProcessedWebhooksForTesting(eventIds: string[]): Promise<void> {
    const state = await ensureInitialized();
    state.processedWebhookEvents = [...eventIds];
    await saveState(state);
  }

  static async getProcessedWebhookCount(): Promise<number> {
    const state = await ensureInitialized();
    return (state.processedWebhookEvents || []).length;
  }

  /** The workspace a payment-provider customer belongs to. */
  static async findWorkspaceByBillingCustomer(customerId: string): Promise<WorkspaceBillingData | null> {
    if (!customerId) return null;
    const state = await ensureInitialized();
    return (state.workspaces || []).find((w) => adoptLegacyBillingFields(w).billingCustomerId === customerId) || null;
  }

  /** The workspace a payment-provider subscription belongs to. */
  static async findWorkspaceByBillingSubscription(subscriptionId: string): Promise<WorkspaceBillingData | null> {
    if (!subscriptionId) return null;
    const state = await ensureInitialized();
    return (state.workspaces || []).find((w) => adoptLegacyBillingFields(w).billingSubscriptionId === subscriptionId) || null;
  }

  /** True when a workspace with this id exists (getWorkspaceBilling would make up a blank one for an unknown id). */
  static async workspaceExists(workspaceId: string): Promise<boolean> {
    if (!workspaceId) return false;
    const state = await ensureInitialized();
    return (state.workspaces || []).some((w) => w.id === workspaceId);
  }

  // Multi-Tenant Workspace Registration & Auth
  static async createTenantWorkspace(params: {
    businessName: string;
    ownerEmail: string;
    password?: string;
    industryTemplateSlug?: string;
    /** false: the address is not confirmed yet (password sign-up). true: the sign-in provider confirmed it. Omitted: unchanged. */
    emailVerified?: boolean;
  }): Promise<{
    workspace: WorkspaceBillingData;
    assistant: AssistantData;
    landingPage: LandingPageConfig;
    owner: TeamMemberData;
    temporaryPassword?: string;
  }> {
    const state = await ensureInitialized();
    const cleanEmail = params.ownerEmail.toLowerCase().trim();
    const cleanName = params.businessName.trim();
    const providedPass = params.password?.trim();
    // If the caller didn't supply a password, generate a unique random one
    // and surface it once to the caller rather than falling back to a fixed,
    // shared, predictable default credential.
    const temporaryPassword = providedPass ? undefined : generateTempPassword();
    const cleanPass = providedPass || temporaryPassword!;
    const hashedPass = hashPassword(cleanPass);

    const workspaceId = `ws_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const assistantId = `ast_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    const landingPageId = `lp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;

    const templateSlug = params.industryTemplateSlug || 'general';
    const preset = TEMPLATE_LANDING_CONFIGS[templateSlug] || DEFAULT_BUSINESS_LANDING_CONFIG;
    const isExplicitBarber = cleanName.toLowerCase().includes('barber') || templateSlug === 'classic-barbershop';
    const initialServices = isExplicitBarber ? (preset.services || []) : [];

    const startOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const endOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString();

    // Every new workspace must start a card-backed trial through checkout before its assistants serve visitors
    // (lib/billing/trial.ts). The dates and status come from the payment provider once checkout completes.
    const trialPlan = BILLING_PLANS.find((p) => p.id === TRIAL_PLAN_ID) || BILLING_PLANS[0];
    const workspace: WorkspaceBillingData = {
      id: workspaceId,
      name: cleanName,
      planId: trialPlan.id,
      planName: trialPlan.name,
      billingInterval: 'monthly',
      monthlyChatLimit: trialPlan.chatSessionsLimit,
      overageRatePerChat: trialPlan.overageRate,
      landingPageLimit: trialPlan.landingPageLimit,
      currentPeriodStart: startOfCurrentMonth,
      currentPeriodEnd: endOfCurrentMonth,
      billingEmail: cleanEmail,
      invoices: [],
      requiresSubscription: true,
    };
    (workspace as any).ownerEmail = cleanEmail;
    (workspace as any).ownerPassword = hashedPass;
    (workspace as any).createdAt = new Date().toISOString();

    state.workspaces.push(workspace);

    const newAssistant: AssistantData = {
      id: assistantId,
      workspaceId,
      name: `${cleanName} Assistant`,
      description: `AI Concierge and Customer Support Assistant for ${cleanName}.`,
      welcomeMessage: 'Hello! How can I help your business today?',
      fallbackMessage: 'I do not have that specific information in my knowledge base. I can connect you with a live agent or assist you with booking a meeting.',
      launcherPosition: 'bottom-right',
      systemPrompt: `You are the friendly, expert AI assistant for ${cleanName}. Assist customers with questions about services, pricing, business hours, and guide them to schedule appointments. Always remain polite, concise, and helpful.`,
      temperature: 0.4,
      provider: 'groq',
      modelName: 'openai/gpt-oss-120b',
      primaryColor: preset.themeColor || '#2563eb',
      starterQuestions: isExplicitBarber ? (preset.starterQuestions || []) : [
        `What services does ${cleanName} provide?`,
        'What are your pricing and availability?',
        'How do I book an appointment?',
      ],
      collectLeadEmail: true,
      allowedDomains: [],
      bookingEnabled: true,
      bookingProvider: 'direct',
      bookingPromptText: `Schedule an Appointment with ${cleanName}`,
      bookingSlotDuration: 45,
      bookingStartHour: '09:00',
      bookingEndHour: '18:00',
      bookingAvailableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      landingPageConfig: {
        ...preset,
        id: landingPageId,
        workspaceId,
        businessName: cleanName,
        tagline: isExplicitBarber ? preset.tagline : 'Professional AI Concierge & Customer Support',
        aboutText: isExplicitBarber ? preset.aboutText : `Welcome to ${cleanName}. We provide professional services and instant customer support.`,
        address: isExplicitBarber ? preset.address : '',
        phone: isExplicitBarber ? preset.phone : '',
        email: cleanEmail,
        services: initialServices,
        slug: `${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36).slice(-4)}`,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.assistants.push(newAssistant);

    const newLandingPage: LandingPageConfig = {
      ...preset,
      id: landingPageId,
      workspaceId,
      assistantId,
      businessName: cleanName,
      tagline: isExplicitBarber ? preset.tagline : 'Professional AI Concierge & Customer Support',
      aboutText: isExplicitBarber ? preset.aboutText : `Welcome to ${cleanName}. We provide professional services and instant customer support.`,
      address: isExplicitBarber ? preset.address : '',
      phone: isExplicitBarber ? preset.phone : '',
      email: cleanEmail,
      services: initialServices,
      slug: newAssistant.landingPageConfig?.slug || `site-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!state.landingPages) state.landingPages = [];
    state.landingPages.push(newLandingPage);

    const ownerMember: TeamMemberData = {
      id: `tm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      workspaceId,
      name: cleanName,
      email: cleanEmail,
      password: hashedPass,
      role: 'owner',
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      ...(params.emailVerified === false ? { emailVerified: false } : {}),
      ...(params.emailVerified === true ? { emailVerified: true, emailVerifiedAt: new Date().toISOString() } : {}),
    };
    if (!state.teamMembers) state.teamMembers = [];
    state.teamMembers.push(ownerMember);

    await saveState(state);

    return {
      workspace,
      assistant: newAssistant,
      landingPage: newLandingPage,
      owner: ownerMember,
      temporaryPassword,
    };
  }

  static async verifyTenantLogin(
    email: string,
    password?: string
  ): Promise<{
    workspace: WorkspaceBillingData;
    member: TeamMemberData;
  } | null> {
    const state = await ensureInitialized();
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanSecret = (password || '').trim();
    if (!cleanEmail || !cleanSecret) return null;

    const ws = (state.workspaces || []).find((w: any) => (w.ownerEmail || '').toLowerCase() === cleanEmail);
    if (ws) {
      const passMatch = Boolean((ws as any).ownerPassword) && verifyPassword(cleanSecret, (ws as any).ownerPassword);
      if (passMatch) {
        // Lazily migrate a legacy plaintext owner password to hashed storage.
        if (!isHashedPassword((ws as any).ownerPassword)) {
          (ws as any).ownerPassword = hashPassword(cleanSecret);
        }
        let ownerMember = (state.teamMembers || []).find((m) => m.email.toLowerCase() === cleanEmail);
        if (!ownerMember) {
          ownerMember = {
            id: `owner_${ws.id}`,
            workspaceId: ws.id,
            name: ws.name || 'Owner',
            email: cleanEmail,
            role: 'owner' as const,
            status: 'active' as const,
            createdAt: ws.createdAt || new Date().toISOString(),
          };
          if (!state.teamMembers) state.teamMembers = [];
          state.teamMembers.push(ownerMember);
        }
        await saveState(state);
        return { workspace: ws, member: ownerMember };
      }
    }

    const tm = await Database.verifyStaffLogin(cleanEmail, cleanSecret);
    if (tm) {
      const defaultWs = await Database.getWorkspaceBilling('default-workspace');
      return { workspace: defaultWs, member: tm };
    }

    return null;
  }

  /**
   * Locates an existing tenant member by email, or auto-provisions a new workspace for social/SSO logins.
   */
  static async findOrCreateOAuthTenant(params: {
    email: string;
    name?: string;
    provider: 'google' | 'apple' | 'sso';
    providerId?: string;
    domain?: string;
    picture?: string;
  }): Promise<{
    workspace: WorkspaceBillingData;
    member: TeamMemberData;
    isNewUser: boolean;
  }> {
    const state = await ensureInitialized();
    const cleanEmail = (params.email || '').toLowerCase().trim();
    if (!cleanEmail) throw new Error('Email is required for social or SSO login.');

    // An account whose address was never confirmed is not this person's account: anyone can type someone else's address into the
    // password sign-up form and set a password they know. The provider has confirmed this address, so signing in must never
    // land in such an account (it would hand the real owner a workspace the other person can still enter). Unconfirmed accounts
    // are skipped here, and a new workspace is created below if no confirmed one exists.
    const isUnconfirmed = (m?: TeamMemberData | null) => m?.emailVerified === false;
    const ownerOf = (wsId: string) =>
      (state.teamMembers || []).find((m) => m.workspaceId === wsId && (m.email || '').toLowerCase().trim() === cleanEmail);

    // 1. Check if an existing workspace owner has this email
    const existingWs = (state.workspaces || []).find(
      (w: any) => (w.ownerEmail || '').toLowerCase() === cleanEmail && !isUnconfirmed(ownerOf(w.id)),
    );
    // Fill in the person's own name and photo from the provider, without overwriting anything they set themselves.
    const applyProfile = (member: TeamMemberData, workspaceName?: string) => {
      const personName = (params.name || '').trim();
      // Names the app generated itself (the seeded owner is called "Master Admin"), as opposed to ones a person chose.
      const looksAutoNamed =
        !member.name ||
        member.name === workspaceName ||
        /'s Workspace$/.test(member.name) ||
        ['Owner', 'Master Admin', 'Staff Member', 'Admin'].includes(member.name);
      if (personName && looksAutoNamed) member.name = personName;
      if (params.picture && !member.avatarUrl) member.avatarUrl = params.picture;
    };

    if (existingWs) {
      let ownerMember =
        ownerOf(existingWs.id) ||
        (state.teamMembers || []).find((m) => m.email.toLowerCase() === cleanEmail && !isUnconfirmed(m));
      if (!ownerMember) {
        ownerMember = {
          id: `owner_${existingWs.id}`,
          workspaceId: existingWs.id,
          name: params.name || existingWs.name || 'Owner',
          email: cleanEmail,
          role: 'owner' as const,
          status: 'active' as const,
          createdAt: existingWs.createdAt || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        if (!state.teamMembers) state.teamMembers = [];
        state.teamMembers.push(ownerMember);
      } else {
        ownerMember.lastLoginAt = new Date().toISOString();
      }
      applyProfile(ownerMember, existingWs.name);
      await saveState(state);
      return { workspace: existingWs, member: ownerMember, isNewUser: false };
    }

    // 2. Check if a team member with this email exists
    const existingMember = (state.teamMembers || []).find((m) => m.email.toLowerCase() === cleanEmail && !isUnconfirmed(m));
    if (existingMember) {
      existingMember.lastLoginAt = new Date().toISOString();
      const ws = await Database.getWorkspaceBilling(existingMember.workspaceId || 'default-workspace');
      applyProfile(existingMember, ws?.name);
      await saveState(state);
      return { workspace: ws, member: existingMember, isNewUser: false };
    }

    // 3. New user: Auto-provision a workspace
    const businessName = params.name
      ? `${params.name}'s Workspace`
      : params.domain
      ? `${params.domain.split('.')[0].toUpperCase()} Enterprise`
      : 'My AI Workspace';

    const tenantResult = await Database.createTenantWorkspace({
      businessName,
      ownerEmail: cleanEmail,
      industryTemplateSlug: 'general',
      emailVerified: true, // the sign-in provider has confirmed the address
    });

    // The owner record is named after the business by default; use the person's own name and photo instead.
    applyProfile(tenantResult.owner, tenantResult.workspace.name);
    await saveState(state);

    return {
      workspace: tenantResult.workspace,
      member: tenantResult.owner,
      isNewUser: true,
    };
  }

  // Multi-Landing Pages Management
  static async getLandingPages(workspaceId: string = 'default-workspace'): Promise<LandingPageConfig[]> {
    const state = await ensureInitialized();
    if (!state.landingPages) state.landingPages = [];

    // Purge legacy mock template IDs that were previously auto-seeded by mistake
    const legacyTemplateIds = new Set(['lp_gym', 'lp_real_estate', 'lp_ecommerce', 'lp_saas', 'lp_legal', 'lp_dental']);
    const prevCount = state.landingPages.length;
    state.landingPages = state.landingPages.filter((p) => !p.id || !legacyTemplateIds.has(p.id));
    if (state.landingPages.length !== prevCount) {
      await saveState(state);
    }

    // If default workspace has never been initialized with a landing page, initialize once
    const defaultPages = state.landingPages.filter((p) => !p.workspaceId || p.workspaceId === 'default-workspace');
    if (!state.landingPagesInitialized && defaultPages.length === 0 && (workspaceId === 'default-workspace' || workspaceId === '*')) {
      const defaultPage: LandingPageConfig = {
        ...DEFAULT_BUSINESS_LANDING_CONFIG,
        id: 'lp_default_business',
        workspaceId: 'default-workspace',
        assistantId: 'demo-assistant',
      };
      state.landingPages.unshift(defaultPage);
      state.landingPagesInitialized = true;
      await saveState(state);
    }

    if (workspaceId === '*') {
      return state.landingPages;
    }

    return state.landingPages.filter((p) => (p.workspaceId || 'default-workspace') === workspaceId);
  }

  static async getLandingPageById(id: string): Promise<LandingPageConfig | null> {
    const state = await ensureInitialized();
    const page = (state.landingPages || []).find((p) => p.id === id);
    return page || null;
  }

  static async getLandingPageBySlugOrDomain(slugOrDomain: string): Promise<LandingPageConfig | null> {
    const state = await ensureInitialized();
    const clean = (slugOrDomain || '').toLowerCase().trim();

    // 1. Check direct custom domain match
    let page = (state.landingPages || []).find(
      (p) => p.customDomain && p.customDomain.toLowerCase().trim() === clean
    );
    if (page) return page;

    // 2. Check slug in landingPages collection
    page = (state.landingPages || []).find(
      (p) => p.slug && p.slug.toLowerCase().trim() === clean
    );
    if (page) return page;

    // 3. Check assistant landing configs
    const ast = state.assistants.find(
      (a) =>
        (a.landingPageConfig?.slug && a.landingPageConfig.slug.toLowerCase().trim() === clean) ||
        (a.landingPageConfig?.customDomain && a.landingPageConfig.customDomain.toLowerCase().trim() === clean)
    );
    if (ast && ast.landingPageConfig) return ast.landingPageConfig;

    // 4. Check static presets dictionary
    if (TEMPLATE_LANDING_CONFIGS[clean]) {
      return TEMPLATE_LANDING_CONFIGS[clean];
    }

    return null;
  }

  static async saveLandingPage(config: LandingPageConfig): Promise<LandingPageConfig> {
    const state = await ensureInitialized();
    if (!state.landingPages) state.landingPages = [];

    const pageId = config.id || 'lp_' + Math.random().toString(36).substring(2, 10);
    const cleanSlug = (config.slug || 'business-page').toLowerCase().replace(/[^a-z0-9-]/g, '-');

    const cleanConfig: LandingPageConfig = {
      ...config,
      id: pageId,
      slug: cleanSlug,
      customDomain: config.customDomain ? config.customDomain.toLowerCase().trim() : undefined,
      updatedAt: new Date().toISOString(),
      createdAt: config.createdAt || new Date().toISOString(),
    };

    const existingIdx = state.landingPages.findIndex((p) => p.id === pageId || (p.slug && p.slug.toLowerCase() === cleanSlug));
    if (existingIdx !== -1) {
      const existingPage = state.landingPages[existingIdx];
      const existingWs = existingPage.workspaceId || 'default-workspace';
      const targetWs = cleanConfig.workspaceId || 'default-workspace';
      if (existingWs !== targetWs) {
        throw new Error('This URL slug is already registered to another workspace.');
      }
      state.landingPages[existingIdx] = cleanConfig;
    } else {
      state.landingPages.unshift(cleanConfig);
    }

    // Also sync to active assistant if matching assistantId is present
    if (config.assistantId) {
      const ast = state.assistants.find((a) => a.id === config.assistantId);
      if (ast) {
        ast.landingPageConfig = cleanConfig;
      }
    }

    await saveState(state);
    return cleanConfig;
  }


  // ==========================================
  // COMPLETE WEB & CUSTOMER ANALYTICS ENGINE
  // ==========================================
  static async recordPageView(data: {
    slug: string;
    landingPageName?: string;
    visitorId?: string;
    referrer?: string;
    userAgent?: string;
    city?: string;
    country?: string;
    source?: string;
  }): Promise<PageViewEventData> {
    const state = await ensureInitialized();
    if (!state.pageViews) state.pageViews = [];

    const ref = (data.referrer || '').toLowerCase();
    let detectedSource: PageViewEventData['source'] = 'direct';
    if (ref.includes('google')) detectedSource = 'google';
    else if (ref.includes('instagram')) detectedSource = 'instagram';
    else if (ref.includes('facebook') || ref.includes('fbclid')) detectedSource = 'facebook';
    else if (ref.includes('tiktok')) detectedSource = 'tiktok';
    else if (ref.includes('twitter') || ref.includes('t.co')) detectedSource = 'twitter';
    else if (ref.length > 0 && !ref.includes(data.slug)) detectedSource = 'referral';

    const ua = (data.userAgent || '').toLowerCase();
    let detectedDevice: PageViewEventData['device'] = 'desktop';
    if (ua.includes('tablet') || ua.includes('ipad')) detectedDevice = 'tablet';
    else if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) detectedDevice = 'mobile';

    let detectedBrowser = 'Chrome';
    if (ua.includes('safari') && !ua.includes('chrome')) detectedBrowser = 'Safari';
    else if (ua.includes('edg')) detectedBrowser = 'Edge';
    else if (ua.includes('firefox')) detectedBrowser = 'Firefox';

    const record: PageViewEventData = {
      id: 'pv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      slug: data.slug,
      landingPageName: data.landingPageName || 'Hosted Site',
      visitorId: data.visitorId || ('vis_' + Math.random().toString(36).substring(2, 9)),
      referrer: data.referrer,
      source: (data.source as any) || detectedSource,
      device: detectedDevice,
      browser: detectedBrowser,
      city: data.city || 'New York',
      country: data.country || 'US',
      timestamp: new Date().toISOString(),
    };

    state.pageViews.unshift(record);
    // Keep max 5000 events locally
    if (state.pageViews.length > 5000) {
      state.pageViews = state.pageViews.slice(0, 5000);
    }
    // Save to local disk without triggering cloud database sync on every visitor click
    saveLocalStateSync(state);
    return record;
  }

  /**
   * Records a widget funnel event (widget_loaded / widget_opened) for pilot measurement.
   * Stored in its own relational table because page-view style events persisted via the
   * blob are lossy on serverless. No-op unless relational mode is on. Never throws.
   */
  static async recordWidgetEvent(data: {
    assistantId: string;
    sessionId: string;
    eventType: Relational.WidgetEventType;
  }): Promise<boolean> {
    if (!isRelationalModeEnabled()) return false;
    return Relational.relationalInsertWidgetEvent({
      id: 'wev_' + crypto.randomBytes(9).toString('hex'),
      assistantId: data.assistantId,
      sessionId: data.sessionId,
      eventType: data.eventType,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Distinct widget sessions that loaded / opened the widget. `available: false` means
   * events are not being tracked (relational mode off or the table missing), which is
   * different from a real count of zero.
   */
  static async getWidgetFunnel(
    assistantId: string,
    days: number = 30
  ): Promise<{ available: boolean; loadedSessions: number; openedSessions: number }> {
    if (!isRelationalModeEnabled()) {
      return { available: false, loadedSessions: 0, openedSessions: 0 };
    }
    const counts = await Relational.relationalCountWidgetEvents(assistantId, days);
    if (!counts) return { available: false, loadedSessions: 0, openedSessions: 0 };
    return { available: true, ...counts };
  }

  static async getCompleteAnalytics(options: {
    assistantId?: string;
    slug?: string;
    days?: number;
    workspaceId?: string;
  } = {}): Promise<any> {
    const state = await ensureInitialized();
    const days = options.days && options.days > 0 ? options.days : 30;
    const cutoff = new Date(Date.now() - days * 86400000).toISOString();

    let wsAssistantIds: string[] | undefined;
    if (options.workspaceId && options.workspaceId !== '*') {
      wsAssistantIds = (state.assistants || [])
        .filter((a) => (a.workspaceId || 'default-workspace') === options.workspaceId)
        .map((a) => a.id);
    }

    const wsSlugs = (state.landingPages || [])
      .filter((lp) => {
        if (wsAssistantIds !== undefined) {
          return (lp.workspaceId && lp.workspaceId === options.workspaceId) ||
                 (lp.assistantId && wsAssistantIds.includes(lp.assistantId));
        }
        if (options.assistantId) {
          return lp.assistantId === options.assistantId;
        }
        return true;
      })
      .map((lp) => (lp.slug || '').toLowerCase());

    const allViews = (state.pageViews || []).filter((v) => {
      if (wsAssistantIds !== undefined || options.assistantId) {
        if (!wsSlugs.includes((v.slug || '').toLowerCase())) return false;
      }
      return true;
    });

    const filteredViews = allViews.filter((v) => {
      if (options.slug && options.slug !== 'all' && v.slug !== options.slug) return false;
      return v.timestamp >= cutoff;
    });

    let allAppointments: AppointmentData[] = state.appointments || [];
    let allLeads: LeadData[] = state.leads || [];
    let allConversations: ConversationData[] = state.conversations || [];
    if (isRelationalModeEnabled()) {
      try {
        [allAppointments, allLeads, allConversations] = await Promise.all([
          Relational.relationalGetAppointments(options.assistantId, wsAssistantIds),
          Relational.relationalGetLeads(options.assistantId, wsAssistantIds),
          Relational.relationalGetConversations(options.assistantId, 2000, wsAssistantIds),
        ]);
      } catch (err) {
        console.warn('[Relational] analytics read failed:', err);
        if (isConnectionError(err)) disablePostgresTemporarily();
      }
    }

    const conversations = allConversations.filter((c) => {
      if (wsAssistantIds !== undefined) {
        if (c.assistantId && !wsAssistantIds.includes(c.assistantId)) return false;
      }
      if (options.assistantId && c.assistantId && c.assistantId !== options.assistantId) {
        return false;
      }
      return (c.createdAt || '') >= cutoff;
    });

    const appointments = allAppointments.filter((a) => {
      if (wsAssistantIds !== undefined) {
        const matchesWs = (a.assistantId && wsAssistantIds.includes(a.assistantId)) ||
          (a.landingPageSlug && wsSlugs.includes(a.landingPageSlug.toLowerCase()));
        if (!matchesWs) return false;
      }
      if (options.assistantId && a.assistantId && a.assistantId !== options.assistantId) {
        return false;
      }
      if (options.slug && options.slug !== 'all') {
        return (a.landingPageSlug === options.slug || a.notes?.toLowerCase().includes(options.slug.toLowerCase()));
      }
      return a.createdAt >= cutoff;
    });

    const leads = allLeads.filter((l) => {
      if (wsAssistantIds !== undefined) {
        if (l.assistantId && !wsAssistantIds.includes(l.assistantId)) return false;
      }
      if (options.assistantId && l.assistantId && l.assistantId !== options.assistantId) {
        return false;
      }
      return l.createdAt >= cutoff;
    });

    // 1. KPI Aggregates (100% genuine data)
    const totalPageViews = filteredViews.length;
    const uniqueVisitorSet = new Set(filteredViews.map((v) => v.visitorId));
    const uniqueVisitors = uniqueVisitorSet.size;

    // Real-time active in last 15 mins (active chat sessions or web visitors)
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60000).toISOString();
    const recentConversations = conversations.filter((c) => (c.updatedAt || c.createdAt) >= fifteenMinsAgo).length;
    const recentViews = allViews.filter((v) => v.timestamp >= fifteenMinsAgo).length;
    const realtimeActive = Math.max(1, recentConversations + recentViews);

    // Real Conversion rate: appointments + leads relative to unique visitors/chats
    const totalConversions = appointments.length + leads.length;
    const conversionRate = conversations.length > 0
      ? ((appointments.length / conversations.length) * 100).toFixed(1)
      : (uniqueVisitors > 0 ? ((totalConversions / uniqueVisitors) * 100).toFixed(1) : '0.0');

    // Real Bounce Rate: visitors with only 1 page view
    const visitorViewCounts: Record<string, number> = {};
    filteredViews.forEach((v) => {
      visitorViewCounts[v.visitorId] = (visitorViewCounts[v.visitorId] || 0) + 1;
    });
    const singleViewVisitors = Object.values(visitorViewCounts).filter((c) => c === 1).length;
    const bounceRate = uniqueVisitors > 0
      ? ((singleViewVisitors / uniqueVisitors) * 100).toFixed(1)
      : '0.0';

    // Revenue counts only prices that were actually recorded. Appointments with no
    // price contribute 0 (never a made-up default), and the average is taken over
    // priced appointments only so unpriced bookings can't dilute or inflate it.
    const totalPipelineRevenue = appointments.reduce((sum, a) => sum + (a.price ?? 0), 0);
    const pricedAppointments = appointments.filter((a) => (a.price ?? 0) > 0);
    const appointmentsWithPrice = pricedAppointments.length;
    const avgBookingValue = appointmentsWithPrice > 0 ? Math.round(totalPipelineRevenue / appointmentsWithPrice) : 0;

    // 2. Daily Time Series (Conversations, Messages, Bookings, Revenue)
    const timeSeriesMap: Record<string, {
      date: string;
      label: string;
      views: number;
      visitors: Set<string>;
      bookings: number;
      revenue: number;
      conversations: number;
      messages: number;
      leads: number;
    }> = {};
    const chartDays = Math.min(days, 30);
    for (let i = chartDays - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000);
      const dateKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      timeSeriesMap[dateKey] = {
        date: dateKey,
        label,
        views: 0,
        visitors: new Set(),
        bookings: 0,
        revenue: 0,
        conversations: 0,
        messages: 0,
        leads: 0,
      };
    }

    filteredViews.forEach((v) => {
      const dayKey = v.timestamp.slice(0, 10);
      if (timeSeriesMap[dayKey]) {
        timeSeriesMap[dayKey].views++;
        timeSeriesMap[dayKey].visitors.add(v.visitorId);
      }
    });

    conversations.forEach((c) => {
      const dayKey = c.createdAt ? c.createdAt.slice(0, 10) : '';
      if (timeSeriesMap[dayKey]) {
        timeSeriesMap[dayKey].conversations++;
        timeSeriesMap[dayKey].messages += (c.messages?.length || 0);
      }
    });

    leads.forEach((l) => {
      const dayKey = l.createdAt ? l.createdAt.slice(0, 10) : '';
      if (timeSeriesMap[dayKey]) {
        timeSeriesMap[dayKey].leads++;
      }
    });

    appointments.forEach((a) => {
      const dayKey = a.createdAt ? a.createdAt.slice(0, 10) : '';
      if (timeSeriesMap[dayKey]) {
        timeSeriesMap[dayKey].bookings++;
        timeSeriesMap[dayKey].revenue += (a.price ?? 0);
      }
    });

    const timeSeries = Object.values(timeSeriesMap).map((item) => ({
      date: item.date,
      label: item.label,
      conversations: item.conversations,
      messages: item.messages,
      bookings: item.bookings,
      revenue: item.revenue,
      leads: item.leads,
      views: item.views,
      visitors: item.visitors.size,
    }));

    // 3. Traffic Acquisition Sources (Only genuine recorded sources)
    const sourceCounts: Record<string, number> = {};
    filteredViews.forEach((v) => {
      const srcName =
        v.source === 'google' ? 'Google Organic Search' :
        v.source === 'instagram' ? 'Instagram' :
        v.source === 'facebook' ? 'Facebook' :
        v.source === 'tiktok' ? 'TikTok' :
        v.source === 'twitter' ? 'X / Twitter' :
        v.source === 'referral' ? 'Referral Websites' :
        v.source === 'email' ? 'Email Campaign' :
        'Direct / In-Store QR';
      sourceCounts[srcName] = (sourceCounts[srcName] || 0) + 1;
    });

    const trafficSources = Object.entries(sourceCounts).map(([channel, count]) => ({
      channel,
      count,
      percent: totalPageViews > 0 ? Math.round((count / totalPageViews) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    // 4. Real Device & Browser Breakdown
    const deviceCounts: Record<string, number> = {};
    const browserCounts: Record<string, number> = {};

    filteredViews.forEach((v) => {
      if (v.device) deviceCounts[v.device] = (deviceCounts[v.device] || 0) + 1;
      if (v.browser) browserCounts[v.browser] = (browserCounts[v.browser] || 0) + 1;
    });

    const devices = Object.entries(deviceCounts).map(([device, count]) => ({
      device,
      count,
      percent: totalPageViews > 0 ? Math.round((count / totalPageViews) * 100) : 0,
    }));

    const browsers = Object.entries(browserCounts).map(([browser, count]) => ({
      browser,
      count,
      percent: totalPageViews > 0 ? Math.round((count / totalPageViews) * 100) : 0,
    })).sort((a, b) => b.count - a.count);

    // 5. Geographic Demographics (Only genuine visitor locations)
    const cityCounts: Record<string, { city: string; country: string; count: number }> = {};
    filteredViews.forEach((v) => {
      if (v.city) {
        const k = v.city + ', ' + (v.country || 'US');
        if (!cityCounts[k]) {
          cityCounts[k] = { city: v.city, country: v.country || 'US', count: 0 };
        }
        cityCounts[k].count++;
      }
    });

    const topCities = Object.values(cityCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 7)
      .map((c) => ({
        ...c,
        percent: totalPageViews > 0 ? Math.round((c.count / totalPageViews) * 100) : 0,
      }));

    // 6. Real Conversion Funnel Steps
    const funnelSteps = [
      { step: 'Page Views', count: totalPageViews, dropOffPercent: 0 },
      {
        step: 'Unique Visitors',
        count: uniqueVisitors,
        dropOffPercent: totalPageViews > 0 ? Math.max(0, Math.round(((totalPageViews - uniqueVisitors) / totalPageViews) * 100)) : 0,
      },
      {
        step: 'Inquiries & Leads',
        count: leads.length,
        dropOffPercent: uniqueVisitors > 0 ? Math.max(0, Math.round((1 - (leads.length / uniqueVisitors)) * 100)) : 0,
      },
      {
        step: 'Confirmed Bookings',
        count: appointments.length,
        dropOffPercent: uniqueVisitors > 0 ? Math.max(0, Math.round((1 - (appointments.length / uniqueVisitors)) * 100)) : 0,
      },
    ];

    // 7. Real Customer Directory
    const customerMap: Record<string, {
      name: string;
      email: string;
      phone: string;
      sourceLandingPage: string;
      totalBookings: number;
      totalSpend: number;
      firstSeen: string;
      lastBooking: string;
      status: 'VIP' | 'Regular' | 'New';
      preferredServices: Set<string>;
    }> = {};

    appointments.forEach((a) => {
      const email = (a.email || '').toLowerCase().trim();
      if (!email) return;
      if (!customerMap[email]) {
        customerMap[email] = {
          name: a.name || 'Client',
          email,
          phone: a.phone || '',
          sourceLandingPage: a.landingPageName || a.landingPageSlug || 'Landing Page',
          totalBookings: 0,
          totalSpend: 0,
          firstSeen: a.createdAt,
          lastBooking: a.createdAt,
          status: 'New',
          preferredServices: new Set(),
        };
      }
      customerMap[email].totalBookings++;
      customerMap[email].totalSpend += (a.price ?? 0);
      if (a.createdAt < customerMap[email].firstSeen) customerMap[email].firstSeen = a.createdAt;
      if (a.createdAt > customerMap[email].lastBooking) customerMap[email].lastBooking = a.createdAt;
      if (a.serviceName) customerMap[email].preferredServices.add(a.serviceName);
    });

    leads.forEach((l) => {
      const email = (l.email || '').toLowerCase().trim();
      if (!email || customerMap[email]) return;
      customerMap[email] = {
        name: l.name || 'Website Lead',
        email,
        phone: l.phone || '',
        sourceLandingPage: 'Website Chatbot',
        totalBookings: 0,
        totalSpend: 0,
        firstSeen: l.createdAt,
        lastBooking: l.createdAt,
        status: 'New',
        preferredServices: new Set(['Consultation']),
      };
    });

    const customerDirectory = Object.values(customerMap).map((c) => {
      let status: 'VIP' | 'Regular' | 'New' = 'New';
      if (c.totalBookings >= 3) status = 'VIP';
      else if (c.totalBookings === 2) status = 'Regular';
      return {
        ...c,
        status,
        preferredServices: Array.from(c.preferredServices),
      };
    }).sort((a, b) => b.totalSpend - a.totalSpend || b.totalBookings - a.totalBookings);

    const totalUniqueCustomers = customerDirectory.length;
    const repeatCustomers = customerDirectory.filter((c) => c.totalBookings > 1).length;
    const repeatRate = totalUniqueCustomers > 0
      ? Math.round((repeatCustomers / totalUniqueCustomers) * 100)
      : 0;

    // 8. Performance by Landing Page Table
    const existingLandingPages = await Database.getLandingPages();
    const pageBreakdownMap: Record<string, {
      name: string;
      slug: string;
      views: number;
      visitors: Set<string>;
      bookings: number;
      revenue: number;
    }> = {};

    existingLandingPages.forEach((p) => {
      pageBreakdownMap[p.slug] = {
        name: p.businessName,
        slug: p.slug,
        views: 0,
        visitors: new Set(),
        bookings: 0,
        revenue: 0,
      };
    });

    filteredViews.forEach((v) => {
      if (!pageBreakdownMap[v.slug]) {
        pageBreakdownMap[v.slug] = {
          name: v.landingPageName || v.slug,
          slug: v.slug,
          views: 0,
          visitors: new Set(),
          bookings: 0,
          revenue: 0,
        };
      }
      pageBreakdownMap[v.slug].views++;
      pageBreakdownMap[v.slug].visitors.add(v.visitorId);
    });

    appointments.forEach((a) => {
      const slg = a.landingPageSlug || 'general';
      if (pageBreakdownMap[slg]) {
        pageBreakdownMap[slg].bookings++;
        pageBreakdownMap[slg].revenue += (a.price ?? 0);
      }
    });

    const pagePerformance = Object.values(pageBreakdownMap).map((p) => ({
      name: p.name,
      slug: p.slug,
      views: p.views,
      uniqueVisitors: p.visitors.size,
      bookings: p.bookings,
      conversionRate: p.visitors.size > 0 ? ((p.bookings / p.visitors.size) * 100).toFixed(1) : '0.0',
      revenue: p.revenue,
    })).sort((a, b) => b.views - a.views);

    // Service breakdown
    const serviceMap: Record<string, { serviceName: string; bookings: number; revenue: number }> = {};
    appointments.forEach((a) => {
      const name = a.serviceName || (a.notes && a.notes.includes('Service:') ? a.notes.split('Service:')[1].trim() : 'General Consultation');
      if (!serviceMap[name]) {
        serviceMap[name] = { serviceName: name, bookings: 0, revenue: 0 };
      }
      serviceMap[name].bookings++;
      serviceMap[name].revenue += (a.price ?? 0);
    });

    const servicePerformance = Object.values(serviceMap)
      .sort((a, b) => b.bookings - a.bookings)
      .map((s) => ({
        ...s,
        percent: appointments.length > 0 ? Math.round((s.bookings / appointments.length) * 100) : 0,
        avgPrice: s.bookings > 0 ? Math.round(s.revenue / s.bookings) : 0,
      }));

    const bookingStatus = {
      confirmed: appointments.filter((a) => a.status === 'confirmed').length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      pending: appointments.filter((a) => a.status === 'pending').length,
      cancelled: appointments.filter((a) => a.status === 'cancelled').length,
      total: appointments.length,
    };

    const totalConversationsCount = conversations.length;
    const conversationsWithMultipleMsgs = conversations.filter((c) => (c.messages?.length || 0) > 1).length;
    const chatbotFunnelSteps = [
      { step: 'Chat Sessions Started', count: totalConversationsCount, dropOffPercent: 0 },
      {
        step: 'Engaged Inquiries (Multi-Turn)',
        count: conversationsWithMultipleMsgs,
        dropOffPercent: totalConversationsCount > 0 ? Math.max(0, Math.round(((totalConversationsCount - conversationsWithMultipleMsgs) / totalConversationsCount) * 100)) : 0,
      },
      {
        step: 'Lead Details Captured',
        count: leads.length,
        dropOffPercent: conversationsWithMultipleMsgs > 0 ? Math.max(0, Math.round((1 - (leads.length / Math.max(1, conversationsWithMultipleMsgs))) * 100)) : 0,
      },
      {
        step: 'Confirmed Bookings',
        count: appointments.length,
        dropOffPercent: leads.length > 0 ? Math.max(0, Math.round((1 - (appointments.length / Math.max(1, leads.length))) * 100)) : 0,
      },
    ];

    return {
      overview: {
        totalConversations: totalConversationsCount,
        totalMessages: conversations.reduce((sum, c) => sum + (c.messages?.length || 0), 0),
        totalBookings: appointments.length,
        confirmedBookings: bookingStatus.confirmed + bookingStatus.completed,
        pendingBookings: bookingStatus.pending,
        cancelledBookings: bookingStatus.cancelled,
        totalLeads: leads.length,
        totalPageViews,
        uniqueVisitors,
        realtimeActive,
        conversionRate,
        bounceRate,
        avgDurationSeconds: totalPageViews > 0 ? 120 : 0,
        totalPipelineRevenue,
        avgBookingValue,
        appointmentsWithPrice,
        totalCustomers: totalUniqueCustomers,
        repeatRate,
      },
      timeSeries,
      servicePerformance,
      bookingStatus,
      chatbotFunnelSteps,
      trafficSources,
      devices,
      browsers,
      topCities,
      funnelSteps: chatbotFunnelSteps.length > 0 ? chatbotFunnelSteps : funnelSteps,
      customerDirectory,
      pagePerformance,
    };
  }

  static async deleteLandingPage(idOrSlug: string, optionalSlug?: string, workspaceId?: string): Promise<boolean> {
    const state = await ensureInitialized(true);
    state.landingPagesInitialized = true;
    if (!state.landingPages) {
      state.landingPages = [];
    }

    const targetClean = (idOrSlug || '').trim().toLowerCase();
    const slugClean = (optionalSlug || '').trim().toLowerCase();

    if (workspaceId && workspaceId !== '*') {
      const page = (state.landingPages || []).find((p) => {
        const pId = (p.id || '').trim().toLowerCase();
        const pSlug = (p.slug || '').trim().toLowerCase();
        return (targetClean && (pId === targetClean || pSlug === targetClean)) ||
               (slugClean && (pId === slugClean || pSlug === slugClean));
      });

      if (page) {
        let pageWs = page.workspaceId;
        if (!pageWs && page.assistantId) {
          const ast = (state.assistants || []).find((a) => a.id === page.assistantId);
          pageWs = ast?.workspaceId;
        }
        pageWs = pageWs || 'default-workspace';
        if (pageWs !== workspaceId) {
          return false;
        }
      }
    }

    const targets = new Set<string>();
    if (targetClean) targets.add(targetClean);
    if (slugClean) targets.add(slugClean);

    // Collect all associated identifiers from existing records
    (state.landingPages || []).forEach((p) => {
      const pId = (p.id || '').trim().toLowerCase();
      const pSlug = (p.slug || '').trim().toLowerCase();
      const pAst = (p.assistantId || '').trim().toLowerCase();
      if ((pId && targets.has(pId)) || (pSlug && targets.has(pSlug)) || (pAst && targets.has(pAst))) {
        if (pId) targets.add(pId);
        if (pSlug) targets.add(pSlug);
        if (pAst) targets.add(pAst);
      }
    });

    state.landingPages = (state.landingPages || []).filter((p) => {
      const pId = (p.id || '').trim().toLowerCase();
      const pSlug = (p.slug || '').trim().toLowerCase();
      const pAst = (p.assistantId || '').trim().toLowerCase();
      const match = (pId && targets.has(pId)) || (pSlug && targets.has(pSlug)) || (pAst && targets.has(pAst));
      return !match;
    });

    // Also unlink landingPageConfig from any matching assistants
    (state.assistants || []).forEach((ast) => {
      if (ast.landingPageConfig) {
        const lpId = (ast.landingPageConfig.id || '').trim().toLowerCase();
        const lpSlug = (ast.landingPageConfig.slug || '').trim().toLowerCase();
        if ((lpId && targets.has(lpId)) || (lpSlug && targets.has(lpSlug)) || targets.has((ast.id || '').trim().toLowerCase())) {
          delete ast.landingPageConfig;
        }
      }
    });

    await saveState(state, {
      deletedLandingPageId: idOrSlug,
      deletedLandingPageSlug: optionalSlug,
    });
    cachedState = state;
    lastCloudFetchTime = Date.now();
    return true;
  }

  // SMTP & Email Configuration
  static async getSmtpSettings(): Promise<SmtpSettingsData | null> {
    const state = await ensureInitialized();

    const envSmtp: Partial<SmtpSettingsData> = {};
    if (process.env.SMTP_HOST) envSmtp.host = process.env.SMTP_HOST;
    if (process.env.SMTP_PORT) envSmtp.port = parseInt(process.env.SMTP_PORT, 10);
    if (process.env.SMTP_USER) envSmtp.user = process.env.SMTP_USER;
    if (process.env.SMTP_PASS) envSmtp.pass = process.env.SMTP_PASS;
    if (process.env.SMTP_FROM) {
      envSmtp.from = process.env.SMTP_FROM;
      envSmtp.fromEmail = process.env.SMTP_FROM;
    }
    if (process.env.SMTP_SECURE) envSmtp.secure = process.env.SMTP_SECURE === 'true';
    if (process.env.RESEND_API_KEY) envSmtp.resendApiKey = process.env.RESEND_API_KEY;
    if (process.env.RESEND_FROM) envSmtp.resendFrom = process.env.RESEND_FROM;

    const merged: SmtpSettingsData = {
      ...envSmtp,
      ...(state.smtpSettings || {}),
    };

    if (!merged.host && !merged.user && !merged.resendApiKey) {
      return state.smtpSettings || null;
    }
    return merged;
  }

  static async saveSmtpSettings(settings: Partial<SmtpSettingsData>): Promise<SmtpSettingsData> {
    const state = await ensureInitialized();
    const current = state.smtpSettings || {};
    const updated: SmtpSettingsData = {
      ...current,
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    state.smtpSettings = updated;
    await saveState(state);
    cachedState = state;
    lastCloudFetchTime = Date.now();
    return updated;
  }

  // ---------------------------------------------------------------------------
  // MCP (Model Context Protocol) Tokens & Audit Logs
  // ---------------------------------------------------------------------------

  static async getMcpTokens(workspaceId: string): Promise<McpTokenRecord[]> {
    const state = await ensureInitialized();
    const all = state.mcpTokens || [];
    if (workspaceId === '*') return all;
    return all.filter((t) => t.workspaceId === workspaceId);
  }

  static async getMcpTokenByHash(tokenHash: string): Promise<McpTokenRecord | null> {
    const state = await ensureInitialized();
    const token = (state.mcpTokens || []).find((t) => t.tokenHash === tokenHash);
    return token || null;
  }

  static async saveMcpToken(token: McpTokenRecord): Promise<void> {
    const state = await ensureInitialized();
    if (!state.mcpTokens) state.mcpTokens = [];
    const idx = state.mcpTokens.findIndex((t) => t.id === token.id);
    if (idx >= 0) {
      state.mcpTokens[idx] = token;
    } else {
      state.mcpTokens.unshift(token);
    }
    await saveState(state);
    cachedState = state;
    lastCloudFetchTime = Date.now();
  }

  static async revokeMcpToken(id: string, workspaceId: string): Promise<boolean> {
    const state = await ensureInitialized();
    if (!state.mcpTokens) state.mcpTokens = [];
    const token = state.mcpTokens.find((t) => t.id === id && (workspaceId === '*' || t.workspaceId === workspaceId));
    if (!token) return false;
    token.status = 'revoked';
    await saveState(state);
    cachedState = state;
    lastCloudFetchTime = Date.now();
    return true;
  }

  static async touchMcpToken(id: string): Promise<void> {
    const state = await ensureInitialized();
    if (!state.mcpTokens) return;
    const token = state.mcpTokens.find((t) => t.id === id);
    if (!token) return;
    token.lastUsedAt = new Date().toISOString();
    scheduleDeferredBlobSync(state);
  }

  static async saveMcpAuditLog(entry: Omit<McpAuditLogRecord, 'id' | 'timestamp'>): Promise<McpAuditLogRecord> {
    const state = await ensureInitialized();
    if (!state.mcpAuditLogs) state.mcpAuditLogs = [];
    const log: McpAuditLogRecord = {
      id: 'mcp_log_' + crypto.randomBytes(8).toString('hex'),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    state.mcpAuditLogs.unshift(log);
    // Keep most recent 5,000 logs in memory/state
    if (state.mcpAuditLogs.length > 5000) {
      state.mcpAuditLogs = state.mcpAuditLogs.slice(0, 5000);
    }
    scheduleDeferredBlobSync(state);
    return log;
  }

  static async getMcpAuditLogs(workspaceId: string, limit: number = 100): Promise<McpAuditLogRecord[]> {
    const state = await ensureInitialized();
    const all = state.mcpAuditLogs || [];
    const filtered = workspaceId === '*' ? all : all.filter((l) => l.workspaceId === workspaceId);
    return filtered.slice(0, Math.max(1, Math.min(limit, 500)));
  }
}

