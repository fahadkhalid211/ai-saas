import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { cosineSimilarity, keywordRelevance, reciprocalRankFusion } from '../rag/vector-math';
import { SearchResultChunk } from '../rag/types';
import { encryptSecret, decryptSecret } from '../security/crypto';
import {
  LandingPageConfig,
  LandingPageServiceItem,
  LandingPageGalleryItem,
  LandingPageTestimonialItem,
  LandingPageWorkingHours,
  DEFAULT_BARBER_LANDING_CONFIG,
} from '../landing/types';
export * from '../landing/types';

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
  role: 'owner' | 'admin' | 'support_agent' | 'billing_manager' | 'viewer';
  status: 'active' | 'invited';
  invitedAt?: string;
  lastLoginAt?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  recoveryCodes?: string[];
  createdAt: string;
}

export interface AuditLogData {
  id: string;
  timestamp: string;
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
  type: 'appointment_booked' | 'appointment_cancelled' | 'lead_captured' | 'takeover_requested' | 'reminder_dispatched';
  read: boolean;
  createdAt: string;
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
  appointments?: AppointmentData[];
  teamMembers?: TeamMemberData[];
  auditLogs?: AuditLogData[];
  notifications?: InAppNotificationData[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadState(): DatabaseState {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
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
      appointments: [],
      teamMembers: [],
      auditLogs: [],
      notifications: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialState, null, 2), 'utf-8');
    return initialState;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed.unansweredQueries) parsed.unansweredQueries = [];
    if (!parsed.leads) parsed.leads = [];
    if (!parsed.conversations) parsed.conversations = [];
    if (!parsed.messages) parsed.messages = [];
    if (!parsed.appointments) parsed.appointments = [];
    if (!parsed.teamMembers) parsed.teamMembers = [];
    if (!parsed.auditLogs) parsed.auditLogs = [];
    if (!parsed.notifications) parsed.notifications = [];

    if (parsed.teamMembers.length === 0) {
      parsed.teamMembers.push({
        id: 'tm_owner',
        workspaceId: 'default-workspace',
        name: 'Master Admin',
        email: 'admin@kortexai.com',
        role: 'owner',
        status: 'active',
        createdAt: new Date().toISOString(),
      });
      saveState(parsed);
    }

    // Ensure demo assistant has landing page config initialized
    const demo = (parsed.assistants || []).find((a: any) => a.id === 'demo-assistant');
    if (demo && !demo.landingPageConfig) {
      demo.landingPageConfig = DEFAULT_BARBER_LANDING_CONFIG;
      demo.bookingEnabled = true;
      saveState(parsed);
    }
    return parsed;
  } catch (err) {
    console.error('Failed to parse database state, creating empty:', err);
    return {
      workspaces: [],
      assistants: [],
      knowledgeSources: [],
      chunks: [],
      conversations: [],
      messages: [],
      leads: [],
      unansweredQueries: [],
      appointments: [],
    };
  }
}

function saveState(state: DatabaseState): void {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

/**
 * Universal Database Layer
 */
export class Database {
  // Assistants
  static async getAssistants(workspaceId: string = 'default-workspace'): Promise<AssistantData[]> {
    const state = loadState();
    return state.assistants.map((a) => ({
      ...a,
      apiKeyEncrypted: decryptSecret(a.apiKeyEncrypted || ''),
      telegramBotToken: decryptSecret(a.telegramBotToken || ''),
      whatsappAccessToken: decryptSecret(a.whatsappAccessToken || ''),
      webhookSecret: decryptSecret(a.webhookSecret || ''),
    }));
  }

  static async getAssistantById(id: string): Promise<AssistantData | null> {
    const state = loadState();
    const a = state.assistants.find((ast) => ast.id === id);
    if (!a) return null;
    return {
      ...a,
      apiKeyEncrypted: decryptSecret(a.apiKeyEncrypted || ''),
      telegramBotToken: decryptSecret(a.telegramBotToken || ''),
      whatsappAccessToken: decryptSecret(a.whatsappAccessToken || ''),
      webhookSecret: decryptSecret(a.webhookSecret || ''),
    };
  }

  static async createAssistant(data: Partial<AssistantData>): Promise<AssistantData> {
    const state = loadState();
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
      whiteLabelEnabled: data.whiteLabelEnabled ?? false,
      customBrandingText: data.customBrandingText || '',
      customBrandingUrl: data.customBrandingUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    state.assistants.push(newAssistant);
    saveState(state);
    return {
      ...newAssistant,
      apiKeyEncrypted: decryptSecret(newAssistant.apiKeyEncrypted || ''),
      telegramBotToken: decryptSecret(newAssistant.telegramBotToken || ''),
      whatsappAccessToken: decryptSecret(newAssistant.whatsappAccessToken || ''),
      webhookSecret: decryptSecret(newAssistant.webhookSecret || ''),
    };
  }

  static async updateAssistant(id: string, data: Partial<AssistantData>): Promise<AssistantData | null> {
    const state = loadState();
    const idx = state.assistants.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    const current = state.assistants[idx];
    const updates = { ...data };

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

    saveState(state);
    const updated = state.assistants[idx];
    return {
      ...updated,
      apiKeyEncrypted: decryptSecret(updated.apiKeyEncrypted || ''),
      telegramBotToken: decryptSecret(updated.telegramBotToken || ''),
      whatsappAccessToken: decryptSecret(updated.whatsappAccessToken || ''),
      webhookSecret: decryptSecret(updated.webhookSecret || ''),
    };
  }

  static async deleteAssistant(id: string): Promise<boolean> {
    const state = loadState();
    state.assistants = state.assistants.filter((a) => a.id !== id);
    state.knowledgeSources = state.knowledgeSources.filter((k) => k.assistantId !== id);
    state.chunks = state.chunks.filter((c) => c.assistantId !== id);
    state.conversations = state.conversations.filter((c) => c.assistantId !== id);
    state.leads = state.leads.filter((l) => l.assistantId !== id);
    state.appointments = (state.appointments || []).filter((a) => a.assistantId !== id);
    saveState(state);
    return true;
  }

  // Knowledge Sources with auto-recovery for stalled processing jobs
  static async getKnowledgeSources(assistantId: string): Promise<KnowledgeSourceData[]> {
    const state = loadState();
    let stateChanged = false;
    const now = Date.now();

    const sources = state.knowledgeSources.filter((k) => k.assistantId === assistantId);

    for (const source of sources) {
      if (source.status === 'processing') {
        const createdMs = new Date(source.createdAt).getTime();
        // If stuck in processing for more than 60 seconds, auto-heal to failed
        if (now - createdMs > 60_000) {
          source.status = 'failed';
          const ext = (source.title.split('.').pop() || source.type || '').toLowerCase();
          const isImg = ['png', 'jpg', 'jpeg', 'webp', 'image'].includes(ext);

          if (isImg) {
            source.errorMessage =
              'This image appears to be a brand logo, icon, or graphic with no readable text body. AI assistants require text documents to learn facts and answer visitor questions.';
            source.errorResolution =
              'Logos do not need to be added to the knowledge base (you can set your assistant logo in Widget Branding). To train your AI, upload files containing text (PDF, DOCX, CSV, TXT) or high-contrast screenshots with legible text.';
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
      saveState(state);
    }

    return sources;
  }

  static async createKnowledgeSource(data: Partial<KnowledgeSourceData>): Promise<KnowledgeSourceData> {
    const state = loadState();
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
    saveState(state);
    return newSource;
  }

  static async updateKnowledgeSource(id: string, data: Partial<KnowledgeSourceData>): Promise<void> {
    const state = loadState();
    const idx = state.knowledgeSources.findIndex((k) => k.id === id);
    if (idx !== -1) {
      state.knowledgeSources[idx] = {
        ...state.knowledgeSources[idx],
        ...data,
        updatedAt: new Date().toISOString(),
      };
      saveState(state);
    }
  }

  static async getKnowledgeSourceById(id: string): Promise<KnowledgeSourceData | null> {
    const state = loadState();
    return state.knowledgeSources.find((k) => k.id === id) || null;
  }

  static async deleteKnowledgeSource(id: string): Promise<boolean> {
    const state = loadState();
    state.knowledgeSources = state.knowledgeSources.filter((k) => k.id !== id);
    state.chunks = state.chunks.filter((c) => c.knowledgeSourceId !== id);
    saveState(state);
    return true;
  }

  // Chunks
  static async saveChunks(chunks: Omit<ChunkRecord, 'id' | 'createdAt'>[]): Promise<void> {
    const state = loadState();
    const newRecords: ChunkRecord[] = chunks.map((c) => ({
      ...c,
      id: 'chk_' + Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
    }));

    state.chunks.push(...newRecords);
    saveState(state);
  }

  static async updateChunks(updatedChunks: ChunkRecord[]): Promise<void> {
    const state = loadState();
    const map = new Map<string, ChunkRecord>(updatedChunks.map((c) => [c.id, c]));
    state.chunks = state.chunks.map((c) => map.get(c.id) || c);
    saveState(state);
  }

  static async deleteChunksBySource(sourceId: string): Promise<void> {
    const state = loadState();
    state.chunks = state.chunks.filter((c) => c.knowledgeSourceId !== sourceId);
    saveState(state);
  }

  static async getChunksByAssistant(assistantId: string): Promise<ChunkRecord[]> {
    const state = loadState();
    return state.chunks.filter((c) => c.assistantId === assistantId);
  }

  static async getChunksBySource(sourceId: string): Promise<ChunkRecord[]> {
    const state = loadState();
    return state.chunks
      .filter((c) => c.knowledgeSourceId === sourceId)
      .sort((a, b) => a.chunkIndex - b.chunkIndex);
  }

  // Hybrid Vector + Full-Text Search
  static async hybridSearch(
    assistantId: string,
    query: string,
    queryEmbedding: number[],
    topK: number = 6
  ): Promise<SearchResultChunk[]> {
    const state = loadState();
    const assistantChunks = state.chunks.filter((c) => c.assistantId === assistantId);
    if (assistantChunks.length === 0) return [];

    // 1. Dense Vector Cosine Similarity (require minimum 0.38 similarity for relevance)
    const vectorScored = assistantChunks
      .map((chunk) => ({
        ...chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
      }))
      .filter((chunk) => chunk.score >= 0.38)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    // 2. Sparse Keyword Matching (BM25 / Multilingual full-text - require at least 1 keyword match)
    const keywordScored = assistantChunks
      .map((chunk) => ({
        ...chunk,
        score: keywordRelevance(query, `${chunk.content} ${chunk.metadata?.sourceTitle || ''}`),
      }))
      .filter((chunk) => chunk.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    // If both vector similarity is low and keyword matching is 0, no relevant chunks exist in knowledge base
    if (vectorScored.length === 0 && keywordScored.length === 0) {
      return [];
    }

    // 3. Reciprocal Rank Fusion
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
  static async getConversations(assistantId?: string): Promise<ConversationData[]> {
    const state = loadState();
    const convs = assistantId
      ? state.conversations.filter((c) => c.assistantId === assistantId)
      : state.conversations;
    return convs.map((c) => ({
      ...c,
      messages: state.messages.filter((m) => m.conversationId === c.id),
    }));
  }

  static async getOrCreateConversation(
    assistantId: string,
    visitorId?: string,
    conversationId?: string
  ): Promise<ConversationData> {
    const state = loadState();
    if (conversationId) {
      const existing = state.conversations.find((c) => c.id === conversationId);
      if (existing) {
        return {
          ...existing,
          messages: state.messages.filter((m) => m.conversationId === existing.id),
        };
      }
    }

    const id = conversationId || 'conv_' + Math.random().toString(36).substring(2, 10);
    const newConv: ConversationData = {
      id,
      assistantId,
      visitorId: visitorId || 'anon_' + Math.random().toString(36).substring(2, 8),
      createdAt: new Date().toISOString(),
    };

    state.conversations.unshift(newConv);
    saveState(state);
    return { ...newConv, messages: [] };
  }

  static async getConversationById(id: string): Promise<ConversationData | null> {
    const state = loadState();
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
    const state = loadState();
    const idx = state.conversations.findIndex((c) => c.id === id);
    if (idx !== -1) {
      state.conversations[idx] = {
        ...state.conversations[idx],
        ...data,
      };
      saveState(state);
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
    const state = loadState();
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

    state.messages.push(msg);
    saveState(state);
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
    const state = loadState();
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

    state.leads.unshift(lead);
    saveState(state);
    return lead;
  }

  static async getLeads(assistantId: string): Promise<LeadData[]> {
    const state = loadState();
    return state.leads.filter((l) => l.assistantId === assistantId);
  }

  // Knowledge Gap & Unanswered Queries Engine
  static async recordUnansweredQuery(
    assistantId: string,
    query: string,
    visitorId?: string
  ): Promise<UnansweredQueryData> {
    const state = loadState();
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

    state.unansweredQueries.unshift(record);
    if (state.unansweredQueries.length > 500) {
      state.unansweredQueries = state.unansweredQueries.slice(0, 500);
    }
    saveState(state);
    return record;
  }

  static async getUnansweredQueries(assistantId: string): Promise<UnansweredQueryData[]> {
    const state = loadState();
    return (state.unansweredQueries || []).filter((q) => q.assistantId === assistantId);
  }

  static async resolveUnansweredQuery(id: string, answer?: string): Promise<boolean> {
    const state = loadState();
    if (!state.unansweredQueries) return false;
    const item = state.unansweredQueries.find((q) => q.id === id);
    if (!item) return false;
    item.resolved = true;
    if (answer) item.suggestedAnswer = answer;
    saveState(state);
    return true;
  }

  static async deleteUnansweredQuery(id: string): Promise<boolean> {
    const state = loadState();
    if (!state.unansweredQueries) return false;
    state.unansweredQueries = state.unansweredQueries.filter((q) => q.id !== id);
    saveState(state);
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
  }): Promise<AppointmentData> {
    const state = loadState();
    if (!state.appointments) state.appointments = [];

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
      remindersSent: {
        reminder24h: false,
        reminder1h: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    state.appointments.unshift(apt);
    saveState(state);
    return apt;
  }

  static async getAppointments(assistantId: string): Promise<AppointmentData[]> {
    const state = loadState();
    return (state.appointments || []).filter((a) => a.assistantId === assistantId);
  }

  static async getAppointmentById(id: string): Promise<AppointmentData | null> {
    const state = loadState();
    const apt = (state.appointments || []).find((a) => a.id === id);
    return apt || null;
  }

  static async getAppointmentByManageToken(token: string): Promise<AppointmentData | null> {
    const state = loadState();
    const apt = (state.appointments || []).find((a) => a.manageToken === token);
    return apt || null;
  }

  static async updateAppointment(
    id: string,
    updates: Partial<AppointmentData>
  ): Promise<AppointmentData | null> {
    const state = loadState();
    if (!state.appointments) return null;
    const apt = state.appointments.find((a) => a.id === id);
    if (!apt) return null;
    Object.assign(apt, updates, { updatedAt: new Date().toISOString() });
    saveState(state);
    return apt;
  }

  static async updateAppointmentStatus(
    id: string,
    status: AppointmentData['status'],
    cancellationReason?: string
  ): Promise<boolean> {
    const state = loadState();
    if (!state.appointments) return false;
    const apt = state.appointments.find((a) => a.id === id);
    if (!apt) return false;
    apt.status = status;
    if (cancellationReason) apt.cancellationReason = cancellationReason;
    apt.updatedAt = new Date().toISOString();
    saveState(state);
    return true;
  }

  static async deleteAppointment(id: string): Promise<boolean> {
    const state = loadState();
    if (!state.appointments) return false;
    state.appointments = state.appointments.filter((a) => a.id !== id);
    saveState(state);
    return true;
  }

  static async getUpcomingAppointmentsForReminders(): Promise<AppointmentData[]> {
    const state = loadState();
    return (state.appointments || []).filter((a) => a.status === 'confirmed');
  }

  static async markReminderSent(id: string, type: '24h' | '1h'): Promise<boolean> {
    const state = loadState();
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
    saveState(state);
    return true;
  }

  // Hosted Landing Page Config
  static async getLandingPageConfig(assistantId: string): Promise<LandingPageConfig | null> {
    const state = loadState();
    const ast = state.assistants.find((a) => a.id === assistantId);
    if (!ast) return null;
    return ast.landingPageConfig || null;
  }

  static async updateLandingPageConfig(
    assistantId: string,
    config: Partial<LandingPageConfig>
  ): Promise<LandingPageConfig | null> {
    const state = loadState();
    const ast = state.assistants.find((a) => a.id === assistantId);
    if (!ast) return null;
    ast.landingPageConfig = {
      ...(ast.landingPageConfig || DEFAULT_BARBER_LANDING_CONFIG),
      ...config,
    };
    ast.updatedAt = new Date().toISOString();
    saveState(state);
    return ast.landingPageConfig;
  }

  static async getAssistantBySlug(slug: string): Promise<AssistantData | null> {
    const state = loadState();
    const normalizedSlug = slug.toLowerCase().trim();
    const ast = state.assistants.find((a) => {
      if (a.id.toLowerCase() === normalizedSlug) return true;
      if (a.landingPageConfig?.slug && a.landingPageConfig.slug.toLowerCase().trim() === normalizedSlug) return true;
      return false;
    });
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
    const state = loadState();
    return (state.teamMembers || []).filter((tm) => tm.workspaceId === workspaceId);
  }

  static async getTeamMemberByEmail(email: string): Promise<TeamMemberData | null> {
    const state = loadState();
    const member = (state.teamMembers || []).find((tm) => tm.email.toLowerCase() === email.toLowerCase().trim());
    return member || null;
  }

  static async addTeamMember(data: Omit<TeamMemberData, 'id' | 'createdAt'>): Promise<TeamMemberData> {
    const state = loadState();
    if (!state.teamMembers) state.teamMembers = [];
    const newMember: TeamMemberData = {
      id: 'tm_' + Math.random().toString(36).substring(2, 10),
      ...data,
      createdAt: new Date().toISOString(),
    };
    state.teamMembers.push(newMember);
    saveState(state);
    return newMember;
  }

  static async updateTeamMember(
    id: string,
    updates: Partial<TeamMemberData>
  ): Promise<TeamMemberData | null> {
    const state = loadState();
    if (!state.teamMembers) return null;
    const member = state.teamMembers.find((m) => m.id === id);
    if (!member) return null;
    Object.assign(member, updates);
    saveState(state);
    return member;
  }

  static async deleteTeamMember(id: string): Promise<boolean> {
    const state = loadState();
    if (!state.teamMembers) return false;
    const prevLen = state.teamMembers.length;
    state.teamMembers = state.teamMembers.filter((m) => m.id !== id);
    saveState(state);
    return state.teamMembers.length < prevLen;
  }

  // Security Audit Trail
  static async addAuditLog(entry: Omit<AuditLogData, 'id' | 'timestamp'>): Promise<AuditLogData> {
    const state = loadState();
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
    saveState(state);
    return log;
  }

  static async getAuditLogs(limit: number = 100): Promise<AuditLogData[]> {
    const state = loadState();
    return (state.auditLogs || []).slice(0, limit);
  }

  // Real-time In-App Notifications
  static async getNotifications(assistantId?: string, limit: number = 50): Promise<InAppNotificationData[]> {
    const state = loadState();
    let notifs = state.notifications || [];
    if (assistantId) {
      notifs = notifs.filter((n) => !n.assistantId || n.assistantId === assistantId);
    }
    return notifs.slice(0, limit);
  }

  static async addNotification(
    data: Omit<InAppNotificationData, 'id' | 'createdAt' | 'read'>
  ): Promise<InAppNotificationData> {
    const state = loadState();
    if (!state.notifications) state.notifications = [];
    const notif: InAppNotificationData = {
      id: 'notif_' + Math.random().toString(36).substring(2, 10),
      createdAt: new Date().toISOString(),
      read: false,
      ...data,
    };
    state.notifications.unshift(notif);
    if (state.notifications.length > 200) {
      state.notifications = state.notifications.slice(0, 200);
    }
    saveState(state);
    return notif;
  }

  static async markNotificationAsRead(id: string): Promise<boolean> {
    const state = loadState();
    if (!state.notifications) return false;
    const item = state.notifications.find((n) => n.id === id);
    if (!item) return false;
    item.read = true;
    saveState(state);
    return true;
  }

  static async markAllNotificationsAsRead(assistantId?: string): Promise<boolean> {
    const state = loadState();
    if (!state.notifications) return false;
    for (const item of state.notifications) {
      if (!assistantId || !item.assistantId || item.assistantId === assistantId) {
        item.read = true;
      }
    }
    saveState(state);
    return true;
  }
  // Workspace & Chat-Based Billing
  static async getWorkspaceBilling(workspaceId: string = 'default-workspace'): Promise<WorkspaceBillingData> {
    const state = loadState();
    let ws = state.workspaces.find((w) => w.id === workspaceId);
    const startOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const endOfCurrentMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1).toISOString();

    if (!ws) {
      ws = {
        id: workspaceId,
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
        billingEmail: 'billing@kortexai.com',
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
      saveState(state);
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
      ws.billingEmail = ws.billingEmail || 'billing@kortexai.com';
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
      saveState(state);
    }
    return ws as WorkspaceBillingData;
  }

  static async updateWorkspaceBilling(
    workspaceId: string = 'default-workspace',
    updates: Partial<WorkspaceBillingData>
  ): Promise<WorkspaceBillingData> {
    const state = loadState();
    let ws = state.workspaces.find((w) => w.id === workspaceId);
    if (!ws) {
      await Database.getWorkspaceBilling(workspaceId);
      ws = state.workspaces.find((w) => w.id === workspaceId);
    }
    if (ws) {
      Object.assign(ws, updates);
      saveState(state);
    }
    return ws as WorkspaceBillingData;
  }
}
