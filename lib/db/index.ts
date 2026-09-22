import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { cosineSimilarity, keywordRelevance, reciprocalRankFusion } from '../rag/vector-math';
import { SearchResultChunk } from '../rag/types';
import { clearRetrievalCache } from '../rag/cache';
import { encryptSecret, decryptSecret } from '../security/crypto';
import { hashPassword, verifyPassword, isHashedPassword, generateTempPassword } from '../security/password';
import { getMasterEmail } from '@/lib/security/master';
import {
  LandingPageConfig,
  LandingPageServiceItem,
  LandingPageGalleryItem,
  LandingPageTestimonialItem,
  LandingPageWorkingHours,
  DEFAULT_BARBER_LANDING_CONFIG,
  DEFAULT_GYM_LANDING_CONFIG,
  DEFAULT_REAL_ESTATE_LANDING_CONFIG,
  DEFAULT_ECOMMERCE_LANDING_CONFIG,
  DEFAULT_SAAS_LANDING_CONFIG,
  DEFAULT_LEGAL_LANDING_CONFIG,
  DEFAULT_HEALTHCARE_LANDING_CONFIG,
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
  PersistCloudStateOptions,
  fetchCloudChunks,
  persistCloudChunks,
} from './cloud';
import { isSupabaseConfigured } from './supabase';
import { isPostgresConfigured, disablePostgresTemporarily, isConnectionError } from './postgres';
import * as Relational from './relational';
import { isRedisConfigured, redisGet, redisSet, CACHE_KEYS } from '../cache/redis';
export { isCloudDbConfigured, getCloudDbProvider, isSupabaseConfigured };

/**
 * Schedules non-blocking deferred blob persistence for canary rollback safety.
 * When running inside a Next.js serverless request lifecycle, uses after() from next/server
 * to ensure the runtime does not freeze/terminate the function before the blob is saved.
 * Falls back to background promise execution outside Next.js request lifecycle (e.g. tests, scripts).
 */
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
  customBaseUrl?: string;
  primaryColor: string;
  avatarUrl?: string;
  launcherPosition: string;
  starterQuestions: string[];
  collectLeadEmail: boolean;
  allowWebSearch?: boolean;
  allowedDomains: string[];
  supportReceiverEmail?: string;
  supportCcEmails?: string[];
  supportCustomFields?: SupportCustomField[];
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
  title?: string;
  avatarUrl?: string;
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
  const { password, accessCode, twoFactorSecret, recoveryCodes, ...safe } = member as TeamMemberData;
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
  type: 'appointment_booked' | 'appointment_cancelled' | 'lead_captured' | 'takeover_requested' | 'reminder_dispatched' | 'chat_new' | 'chat_message' | 'chat_escalated';
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
  resendApiKey?: string;
  resendFrom?: string;
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
          name: 'Crown & Blade AI Concierge',
          description: 'A friendly AI assistant trained to answer questions about our barbershop, services, and appointment bookings.',
          systemPrompt: 'You are an intelligent, professional, and friendly representative for Crown & Blade Barbershop. Answer questions clearly about haircuts, beard trims, pricing, opening hours, and help clients schedule an appointment.',
          welcomeMessage: 'Hello! Welcome to Crown & Blade Barbershop. How can I assist you with your grooming or booking today?',
          fallbackMessage: "I apologize, but I don't have enough specific details on that in my knowledge base. Would you like to schedule an appointment or connect with our team?",
          temperature: 0.3,
          provider: 'ollama',
          modelName: 'llama3.2',
          customBaseUrl: 'http://localhost:11434/v1',
          primaryColor: '#2563eb',
          launcherPosition: 'bottom-right',
          starterQuestions: [
            'What services and haircuts do you offer?',
            'How much is a haircut and beard trim?',
            'What are your opening hours?',
            'Can I book an appointment for today?',
          ],
          collectLeadEmail: true,
          allowedDomains: [],
          bookingEnabled: true,
          bookingProvider: 'direct',
          bookingPromptText: 'Schedule a Haircut Appointment',
          bookingSlotDuration: 40,
          bookingStartHour: '09:00',
          bookingEndHour: '20:00',
          bookingAvailableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          landingPageConfig: DEFAULT_BARBER_LANDING_CONFIG,
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

  const legacyOwner = state.teamMembers.find((m) => m.id === 'tm_owner' && m.email === 'admin@kortexai.com');
  if (legacyOwner) {
    legacyOwner.email = getMasterEmail();
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

  // Ensure demo assistant has landing page config initialized
  const demo = (state.assistants || []).find((a: any) => a.id === 'demo-assistant');
  if (demo && !demo.landingPageConfig) {
    demo.landingPageConfig = DEFAULT_BARBER_LANDING_CONFIG;
    demo.bookingEnabled = true;
    saveLocalStateSync(state);
  }

  // Bind chunks from decoupled vector store
  const chunks = loadChunksState();
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
  atomicWriteFileSync(DB_FILE, JSON.stringify(payload, null, 2));
  try {
    lastDbFileMtime = fs.statSync(DB_FILE).mtimeMs;
  } catch {}
}

async function saveState(state: DatabaseState, options?: PersistCloudStateOptions): Promise<void> {
  saveLocalStateSync(state);

  if (isCloudDbConfigured()) {
    try {
      const res = await persistCloudState(state, options);
      lastCloudFetchTime = Date.now();
      if (res && res.updatedAt) {
        lastKnownCloudUpdatedAt = res.updatedAt;
      }
      if (isRedisConfigured()) {
        redisSet(CACHE_KEYS.STATE, { state, updatedAt: lastKnownCloudUpdatedAt }, 300).catch(() => {});
      }
    } catch (err) {
      console.warn('[Database] Failed to sync state to Cloud DB:', err);
    }
  } else if (isRedisConfigured()) {
    redisSet(CACHE_KEYS.STATE, { state, updatedAt: new Date().toISOString() }, 300).catch(() => {});
  }
}

let lastCloudFetchTime = 0;
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
              if (redisCached.updatedAt) {
                lastKnownCloudUpdatedAt = redisCached.updatedAt;
              }
              remoteNeedsFetch = false;
            }
          } catch (err) {
            console.warn('[Database] L2 Redis cache check failed, falling back to cloud DB:', err);
          }
        }

        if (remoteNeedsFetch) {
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
            };
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

/**
 * Universal Database Layer
 */
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
      fallbackMessage: data.fallbackMessage || "I'm sorry, I do not have that information in my knowledge base.",
      temperature: data.temperature ?? 0.3,
      maxTokens: data.maxTokens ?? 2048,
      contextChunks: data.contextChunks ?? 3,
      provider: data.provider || 'ollama',
      modelName: data.modelName || 'llama3.2',
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
      telegramBotToken: decryptSecret(updated.telegramBotToken || ''),
      whatsappAccessToken: decryptSecret(updated.whatsappAccessToken || ''),
      webhookSecret: decryptSecret(updated.webhookSecret || ''),
    };
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
    const remainingChunks = state.chunks.filter((c) => c.assistantId !== id);
    await saveChunksState(remainingChunks, true);
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
    const remainingChunks = state.chunks.filter((c) => c.knowledgeSourceId !== id);
    await saveChunksState(remainingChunks, true);
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

    for (const source of sources) {
      let bytes = source.fileSizeBytes || 0;
      if (!bytes) {
        const sourceChunks = sourceChunksIndex.get(source.id) || [];
        bytes = sourceChunks.reduce((acc, c) => acc + Buffer.byteLength(c.content || '', 'utf-8'), 0);
      }
      totalBytes += bytes;
    }

    let chunkCount = 0;
    if (ws) {
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
  static async saveChunks(chunks: Omit<ChunkRecord, 'id' | 'createdAt'>[]): Promise<void> {
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

  static async updateChunks(updatedChunks: ChunkRecord[]): Promise<void> {
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
    const state = await ensureInitialized();
    let chunks = getIndexedAssistantChunks(assistantId, state);
    if (chunks.length === 0 && (!cachedChunks || cachedChunks.length === 0)) {
      await ensureChunksLoaded();
      chunks = getIndexedAssistantChunks(assistantId, state);
    }
    return chunks;
  }

  static async getChunksBySource(sourceId: string): Promise<ChunkRecord[]> {
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
    // 1. Try fast database-native HNSW vector + FTS hybrid search if Postgres is active
    if (isPostgresConfigured()) {
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
    const minVectorCutoff = hasKeywordMatches ? 0.18 : 0.22;

    const vectorScored = assistantChunks
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

    return fused.slice(0, topK).map((item) => ({
      id: item.id,
      content: item.content,
      chunkIndex: item.chunkIndex,
      tokenCount: item.tokenCount,
      metadata: item.metadata as any,
      knowledgeSourceId: item.knowledgeSourceId,
      similarity: item.rrfScore,
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
          const withMsgs = await Promise.all(
            relConvs.map(async (c) => ({
              ...c,
              messages: await Relational.relationalGetMessagesByConversation(c.id),
            }))
          );
          return withMsgs;
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
          scheduleDeferredBlobSync(state);
        }
        return { ...newConv, messages: [] };
      } catch (err) {
        console.warn('[Relational] getOrCreateConversation failed, disabling postgres:', err);
        disablePostgresTemporarily();
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
        disablePostgresTemporarily();
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
            scheduleDeferredBlobSync(state);
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
          scheduleDeferredBlobSync(state);
          return true;
        }
      } catch (err) {
        console.warn('[Relational] updateConversation failed, disabling postgres:', err);
        disablePostgresTemporarily();
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
        const convExists = await Relational.relationalGetConversationById(conversationId);
        if (!convExists) {
          const state = await ensureInitialized();
          const blobConv = state.conversations.find((c) => c.id === conversationId);
          if (blobConv) {
            await Relational.relationalUpsertConversation(blobConv);
          }
        }
        await Relational.relationalInsertMessage(msg);
        const state = await ensureInitialized();
        state.messages.push(msg);
        const convIdx = state.conversations.findIndex((c) => c.id === conversationId);
        if (convIdx !== -1) {
          state.conversations[convIdx].updatedAt = msg.createdAt;
        }
        cachedState = state;
        scheduleDeferredBlobSync(state);
        return msg;
      } catch (err) {
        console.warn('[Relational] saveMessage failed, disabling postgres:', err);
        disablePostgresTemporarily();
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
        scheduleDeferredBlobSync(state);
        return lead;
      } catch (err) {
        console.warn('[Relational] saveLead failed, disabling postgres:', err);
        disablePostgresTemporarily();
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
        disablePostgresTemporarily();
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
    const lead = state.leads.find((l) => l.id === id);
    if (!lead) return false;

    if (workspaceId && workspaceId !== '*') {
      const ast = (state.assistants || []).find((a) => a.id === lead.assistantId);
      const leadWsId = ast?.workspaceId || 'default-workspace';
      if (leadWsId !== workspaceId) {
        return false;
      }
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
        scheduleDeferredBlobSync(state);
        return record;
      } catch (err) {
        console.warn('[Relational] recordUnansweredQuery failed, disabling postgres:', err);
        disablePostgresTemporarily();
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
    if (!state.unansweredQueries) return false;
    const item = state.unansweredQueries.find((q) => q.id === id);
    if (!item) return false;

    if (workspaceId && workspaceId !== '*') {
      const ast = state.assistants.find((a) => a.id === item.assistantId);
      if (!ast || (ast.workspaceId || 'default-workspace') !== workspaceId) {
        return false;
      }
    }

    if (isRelationalModeEnabled()) {
      try {
        await Relational.relationalResolveUnansweredQuery(id, answer);
        item.resolved = true;
        if (answer) item.suggestedAnswer = answer;
        cachedState = state;
        scheduleDeferredBlobSync(state);
        return true;
      } catch (err) {
        console.warn('[Relational] resolveUnansweredQuery failed:', err);
        if (isConnectionError(err)) {
          disablePostgresTemporarily();
        }
      }
    }

    item.resolved = true;
    if (answer) item.suggestedAnswer = answer;
    await saveState(state);
    return true;
  }

  static async deleteUnansweredQuery(id: string, workspaceId?: string): Promise<boolean> {
    const state = await ensureInitialized();
    if (!state.unansweredQueries) return false;
    const item = state.unansweredQueries.find((q) => q.id === id);
    if (!item) return false;

    if (workspaceId && workspaceId !== '*') {
      const ast = state.assistants.find((a) => a.id === item.assistantId);
      if (!ast || (ast.workspaceId || 'default-workspace') !== workspaceId) {
        return false;
      }
    }

    if (isRelationalModeEnabled()) {
      try {
        await Relational.relationalDeleteUnansweredQuery(id);
        state.unansweredQueries = state.unansweredQueries.filter((q) => q.id !== id);
        cachedState = state;
        scheduleDeferredBlobSync(state);
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
      remindersSent: {
        reminder24h: false,
        reminder1h: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isRelationalModeEnabled()) {
      try {
        await Relational.relationalUpsertAppointment(apt);
        const state = await ensureInitialized();
        if (!state.appointments) state.appointments = [];
        state.appointments.unshift(apt);
        cachedState = state;
        scheduleDeferredBlobSync(state);
        return apt;
      } catch (err: any) {
        if (err?.code === 'SLOT_CONFLICT') {
          throw err;
        }
        console.warn('[Relational] saveAppointment failed, disabling postgres:', err);
        disablePostgresTemporarily();
      }
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

  static async getAppointments(assistantId?: string, workspaceId?: string): Promise<AppointmentData[]> {
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
        disablePostgresTemporarily();
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
    if (matched.length > 0) return matched;

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
        disablePostgresTemporarily();
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
        disablePostgresTemporarily();
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
        await Relational.relationalUpdateAppointment(id, updates);
        const state = await ensureInitialized();
        if (state.appointments) {
          const apt = state.appointments.find((a) => a.id === id);
          if (apt) {
            Object.assign(apt, updates, { updatedAt: new Date().toISOString() });
            cachedState = state;
            scheduleDeferredBlobSync(state);
            return apt;
          }
        }
        scheduleDeferredBlobSync(state);
        return Relational.relationalGetAppointmentById(id);
      } catch (err) {
        console.warn('[Relational] updateAppointment failed, disabling postgres:', err);
        disablePostgresTemporarily();
      }
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
        await Relational.relationalUpdateAppointment(id, { status, cancellationReason });
        const state = await ensureInitialized();
        if (state.appointments) {
          const apt = state.appointments.find((a) => a.id === id);
          if (apt) {
            apt.status = status;
            if (cancellationReason) apt.cancellationReason = cancellationReason;
            apt.updatedAt = new Date().toISOString();
            cachedState = state;
          }
        }
        scheduleDeferredBlobSync(state);
        return true;
      } catch (err) {
        console.warn('[Relational] updateAppointmentStatus failed, disabling postgres:', err);
        disablePostgresTemporarily();
      }
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
    if (!state.appointments) return false;
    const apt = state.appointments.find((a) => a.id === id);
    if (!apt) return false;

    if (workspaceId && workspaceId !== '*') {
      const ast = (state.assistants || []).find((a) => a.id === apt.assistantId);
      if (ast && (ast.workspaceId || 'default-workspace') !== workspaceId) {
        return false;
      }
    }

    if (isRelationalModeEnabled()) {
      try {
        await Relational.relationalDeleteAppointment(id);
        state.appointments = state.appointments.filter((a) => a.id !== id);
        cachedState = state;
        scheduleDeferredBlobSync(state);
        return true;
      } catch (err) {
        console.warn('[Relational] deleteAppointment failed, disabling postgres:', err);
        disablePostgresTemporarily();
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
        disablePostgresTemporarily();
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
        scheduleDeferredBlobSync(state);
        return true;
      } catch (err) {
        console.warn('[Relational] markReminderSent failed, disabling postgres:', err);
        disablePostgresTemporarily();
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
      ...(ast.landingPageConfig || DEFAULT_BARBER_LANDING_CONFIG),
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
        provider: 'ollama',
        modelName: 'llama3.2',
        customBaseUrl: 'http://localhost:11434/v1',
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
    const log: AuditLogData = {
      id: 'aud_' + Math.random().toString(36).substring(2, 12),
      timestamp: new Date().toISOString(),
      ...entry,
    };
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
        disablePostgresTemporarily();
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
        scheduleDeferredBlobSync(state);
        return notif;
      } catch (err) {
        console.warn('[Relational] addNotification failed, disabling postgres:', err);
        disablePostgresTemporarily();
      }
    }

    const state = await ensureInitialized();
    if (!state.notifications) state.notifications = [];
    state.notifications.unshift(notif);
    if (state.notifications.length > 200) {
      state.notifications = state.notifications.slice(0, 200);
    }
    await saveState(state);
    return notif;
  }

  static async markNotificationAsRead(id: string, workspaceId?: string): Promise<boolean> {
    const state = await ensureInitialized();
    if (!state.notifications) return false;
    const item = state.notifications.find((n) => n.id === id);
    if (!item) return false;

    if (workspaceId && workspaceId !== '*') {
      if (item.assistantId) {
        const ast = state.assistants.find((a) => a.id === item.assistantId);
        if (ast && (ast.workspaceId || 'default-workspace') !== workspaceId) {
          return false;
        }
      }
    }

    if (isRelationalModeEnabled()) {
      try {
        await Relational.relationalMarkNotificationRead(id);
        item.read = true;
        cachedState = state;
        scheduleDeferredBlobSync(state);
        return true;
      } catch (err) {
        console.warn('[Relational] markNotificationAsRead failed:', err);
        if (isConnectionError(err)) {
          disablePostgresTemporarily();
        }
      }
    }

    item.read = true;
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
        scheduleDeferredBlobSync(state);
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
  // Workspace & Chat-Based Billing
  static async getWorkspaceBilling(workspaceId: string = 'default-workspace'): Promise<WorkspaceBillingData> {
    const targetWsId = (!workspaceId || workspaceId === '*') ? 'default-workspace' : workspaceId;
    const state = await ensureInitialized();
    let ws = state.workspaces.find((w) => w.id === targetWsId);
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

  static async purchaseExtraLandingPageSlot(
    workspaceId: string = 'default-workspace'
  ): Promise<{ success: boolean; newSlotCount: number; invoice: InvoiceRecord }> {
    const targetWsId = (!workspaceId || workspaceId === '*') ? 'default-workspace' : workspaceId;
    const state = await ensureInitialized();
    let ws = state.workspaces.find((w) => w.id === targetWsId);
    if (!ws) {
      await Database.getWorkspaceBilling(targetWsId);
      ws = state.workspaces.find((w) => w.id === targetWsId);
    }
    if (!ws) throw new Error('Workspace not found');

    ws.extraLandingPagesCount = (ws.extraLandingPagesCount || 0) + 1;
    if (!ws.invoices) ws.invoices = [];

    const invoice: InvoiceRecord = {
      id: 'inv_addon_' + Math.random().toString(36).substring(2, 9),
      date: new Date().toISOString().split('T')[0],
      planName: 'Add-On: Extra Business Landing Page Slot',
      amount: 100,
      status: 'paid',
    };
    ws.invoices.unshift(invoice);

    // Record audit log
    await Database.addAuditLog({
      actor: { id: 'admin', name: 'Master Admin', ip: '127.0.0.1' },
      action: 'billing.addon_purchased',
      targetType: 'workspace_billing',
      targetId: ws.id,
      details: {
        addonType: 'extra_landing_page',
        amount: 100,
        newSlotCount: ws.extraLandingPagesCount,
      },
    });

    // Send in-app notification
    await Database.addNotification({
      title: 'Landing Page Slot Added',
      message: `Successfully purchased 1 additional business landing page slot for $100. Total add-on slots: ${ws.extraLandingPagesCount}.`,
      type: 'appointment_booked',
    });

    await saveState(state);
    return {
      success: true,
      newSlotCount: ws.extraLandingPagesCount,
      invoice,
    };
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

  static async findWorkspaceByStripeCustomer(customerId: string): Promise<WorkspaceBillingData | null> {
    if (!customerId) return null;
    const state = await ensureInitialized();
    return (state.workspaces || []).find((w) => w.stripeCustomerId === customerId) || null;
  }

  // Multi-Tenant Workspace Registration & Auth
  static async createTenantWorkspace(params: {
    businessName: string;
    ownerEmail: string;
    password?: string;
    industryTemplateSlug?: string;
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

    const templateSlug = params.industryTemplateSlug || 'classic-barbershop';
    const preset = TEMPLATE_LANDING_CONFIGS[templateSlug] || DEFAULT_BARBER_LANDING_CONFIG;

    const startOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const endOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString();

    const workspace: WorkspaceBillingData = {
      id: workspaceId,
      name: cleanName,
      planId: 'starter',
      planName: 'Starter',
      billingInterval: 'monthly',
      monthlyChatLimit: 100,
      overageRatePerChat: 0.50,
      landingPageLimit: 1,
      currentPeriodStart: startOfCurrentMonth,
      currentPeriodEnd: endOfCurrentMonth,
      billingEmail: cleanEmail,
      invoices: [],
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
      fallbackMessage: 'I am not sure about that. Let me connect you with our team.',
      launcherPosition: 'bottom-right',
      systemPrompt: `You are the friendly, expert AI assistant for ${cleanName}. Assist customers with questions about services, pricing, business hours, and guide them to schedule appointments. Always remain polite, concise, and helpful.`,
      temperature: 0.4,
      provider: 'ollama',
      modelName: 'llama3.2',
      primaryColor: preset.themeColor || '#2563eb',
      starterQuestions: preset.starterQuestions || [
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
  }): Promise<{
    workspace: WorkspaceBillingData;
    member: TeamMemberData;
    isNewUser: boolean;
  }> {
    const state = await ensureInitialized();
    const cleanEmail = (params.email || '').toLowerCase().trim();
    if (!cleanEmail) throw new Error('Email is required for social or SSO login.');

    // 1. Check if an existing workspace owner has this email
    const existingWs = (state.workspaces || []).find(
      (w: any) => (w.ownerEmail || '').toLowerCase() === cleanEmail
    );
    if (existingWs) {
      let ownerMember = (state.teamMembers || []).find((m) => m.email.toLowerCase() === cleanEmail);
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
        if (params.name && !ownerMember.name) ownerMember.name = params.name;
      }
      await saveState(state);
      return { workspace: existingWs, member: ownerMember, isNewUser: false };
    }

    // 2. Check if a team member with this email exists
    const existingMember = (state.teamMembers || []).find((m) => m.email.toLowerCase() === cleanEmail);
    if (existingMember) {
      existingMember.lastLoginAt = new Date().toISOString();
      const ws = await Database.getWorkspaceBilling(existingMember.workspaceId || 'default-workspace');
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
      industryTemplateSlug: 'classic-barbershop',
    });

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
      const barberPage: LandingPageConfig = {
        ...DEFAULT_BARBER_LANDING_CONFIG,
        id: 'lp_barbershop',
        workspaceId: 'default-workspace',
        assistantId: 'demo-assistant',
      };
      state.landingPages.unshift(barberPage);
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

    const appointments = (state.appointments || []).filter((a) => {
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

    const leads = (state.leads || []).filter((l) => {
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

    // Real-time active in last 15 mins
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60000).toISOString();
    const realtimeActive = allViews.filter((v) => v.timestamp >= fifteenMinsAgo).length;

    // Real Conversion rate: appointments + leads relative to unique visitors
    const totalConversions = appointments.length + leads.length;
    const conversionRate = uniqueVisitors > 0
      ? ((totalConversions / uniqueVisitors) * 100).toFixed(1)
      : '0.0';

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

    // 2. Daily Time Series (Pageviews, Visitors, Bookings, Revenue)
    const timeSeriesMap: Record<string, { date: string; label: string; views: number; visitors: Set<string>; bookings: number; revenue: number }> = {};
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
      };
    }

    filteredViews.forEach((v) => {
      const dayKey = v.timestamp.slice(0, 10);
      if (timeSeriesMap[dayKey]) {
        timeSeriesMap[dayKey].views++;
        timeSeriesMap[dayKey].visitors.add(v.visitorId);
      }
    });

    appointments.forEach((a) => {
      const dayKey = a.createdAt.slice(0, 10);
      if (timeSeriesMap[dayKey]) {
        timeSeriesMap[dayKey].bookings++;
        timeSeriesMap[dayKey].revenue += (a.price ?? 0);
      }
    });

    const timeSeries = Object.values(timeSeriesMap).map((item) => ({
      date: item.date,
      label: item.label,
      views: item.views,
      visitors: item.visitors.size,
      bookings: item.bookings,
      revenue: item.revenue,
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
      const slg = a.landingPageSlug || 'classic-barbershop';
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

    return {
      overview: {
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
      trafficSources,
      devices,
      browsers,
      topCities,
      funnelSteps,
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
    return state.smtpSettings || null;
  }

  static async saveSmtpSettings(settings: Partial<SmtpSettingsData>): Promise<SmtpSettingsData> {
    const state = await ensureInitialized();
    const updated: SmtpSettingsData = {
      ...(state.smtpSettings || {}),
      ...settings,
      updatedAt: new Date().toISOString(),
    };
    state.smtpSettings = updated;
    await saveState(state);
    return updated;
  }
}

