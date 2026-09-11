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
  allowedDomains: string[];
  createdAt: string;
  updatedAt: string;
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
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialState, null, 2), 'utf-8');
    return initialState;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
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
      allowedDomains: data.allowedDomains || [],
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
    saveState(state);
    return true;
  }

  // Knowledge Sources
  static async getKnowledgeSources(assistantId: string): Promise<KnowledgeSourceData[]> {
    const state = loadState();
    return state.knowledgeSources.filter((k) => k.assistantId === assistantId);
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
  }): Promise<LeadData> {
    const state = loadState();
    const lead: LeadData = {
      id: 'lead_' + Math.random().toString(36).substring(2, 10),
      assistantId: data.assistantId,
      email: data.email,
      name: data.name,
      phone: data.phone,
      notes: data.notes,
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
}
