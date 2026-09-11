import fs from 'fs';
import path from 'path';
import { cosineSimilarity, keywordRelevance, reciprocalRankFusion } from '../rag/vector-math';
import { SearchResultChunk } from '../rag/types';

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
  createdAt: string;
  messages?: MessageData[];
}

export interface MessageData {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations: any[];
  tokensUsed: number;
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
          name: 'Business Sales & Support AI',
          description: 'A friendly AI assistant trained to answer questions about our business, products, and services.',
          systemPrompt: 'You are an intelligent, professional, and helpful business representative. Answer questions clearly and accurately based on the provided knowledge. Always be polite and direct.',
          welcomeMessage: 'Hello! Welcome to our store. How can I assist you today?',
          fallbackMessage: "I apologize, but I don't have enough specific details on that in my current knowledge base. Would you like me to connect you with our support team?",
          temperature: 0.3,
          provider: 'ollama',
          modelName: 'llama3.2',
          customBaseUrl: 'http://localhost:11434/v1',
          primaryColor: '#2563eb',
          launcherPosition: 'bottom-right',
          starterQuestions: [
            'What are your popular products?',
            'What is your return policy?',
            'How can I get support?',
          ],
          collectLeadEmail: false,
          allowedDomains: [],
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
    return state.assistants;
  }

  static async getAssistantById(id: string): Promise<AssistantData | null> {
    const state = loadState();
    return state.assistants.find((a) => a.id === id) || null;
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
      apiKeyEncrypted: data.apiKeyEncrypted || '',
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
      telegramBotToken: data.telegramBotToken || '',
      telegramBotEnabled: data.telegramBotEnabled ?? false,
      whatsappPhoneNumberId: data.whatsappPhoneNumberId || '',
      whatsappAccessToken: data.whatsappAccessToken || '',
      whatsappVerifyToken: data.whatsappVerifyToken || '',
      whatsappEnabled: data.whatsappEnabled ?? false,
      webhookUrl: data.webhookUrl || '',
      webhookSecret: data.webhookSecret || '',
      webhookEvents: data.webhookEvents || ['lead.created', 'chat.escalated'],
      whiteLabelEnabled: data.whiteLabelEnabled ?? false,
      customBrandingText: data.customBrandingText || '',
      customBrandingUrl: data.customBrandingUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    state.assistants.push(newAssistant);
    saveState(state);
    return newAssistant;
  }

  static async updateAssistant(id: string, data: Partial<AssistantData>): Promise<AssistantData | null> {
    const state = loadState();
    const idx = state.assistants.findIndex((a) => a.id === id);
    if (idx === -1) return null;

    state.assistants[idx] = {
      ...state.assistants[idx],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    saveState(state);
    return state.assistants[idx];
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

    // 1. Dense Vector Cosine Similarity
    const vectorScored = assistantChunks
      .map((chunk) => ({
        ...chunk,
        score: cosineSimilarity(queryEmbedding, chunk.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

    // 2. Sparse Keyword Matching (BM25 / Multilingual full-text)
    const keywordScored = assistantChunks
      .map((chunk) => ({
        ...chunk,
        score: keywordRelevance(query, `${chunk.content} ${chunk.metadata?.sourceTitle || ''}`),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);

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
  static async getConversations(assistantId: string): Promise<ConversationData[]> {
    const state = loadState();
    const convs = state.conversations.filter((c) => c.assistantId === assistantId);
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

  static async saveMessage(
    conversationId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    citations: any[] = [],
    tokensUsed: number = 0
  ): Promise<MessageData> {
    const state = loadState();
    const msg: MessageData = {
      id: 'msg_' + Math.random().toString(36).substring(2, 10),
      conversationId,
      role,
      content,
      citations,
      tokensUsed,
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
  }): Promise<AppointmentData> {
    const state = loadState();
    if (!state.appointments) state.appointments = [];

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
      createdAt: new Date().toISOString(),
    };

    state.appointments.unshift(apt);
    saveState(state);
    return apt;
  }

  static async getAppointments(assistantId: string): Promise<AppointmentData[]> {
    const state = loadState();
    return (state.appointments || []).filter((a) => a.assistantId === assistantId);
  }

  static async updateAppointmentStatus(
    id: string,
    status: AppointmentData['status']
  ): Promise<boolean> {
    const state = loadState();
    if (!state.appointments) return false;
    const apt = state.appointments.find((a) => a.id === id);
    if (!apt) return false;
    apt.status = status;
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
}
