import { SupportCustomField } from '@/components/crm/WidgetTab';

export interface Assistant {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  welcomeMessage: string;
  fallbackMessage: string;
  temperature: number;
  maxTokens?: number;
  contextChunks?: number;
  provider: string;
  modelName: string;
  apiKeyEncrypted?: string;
  customBaseUrl?: string;
  primaryColor: string;
  widgetTitle?: string;
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
  instagramAccountId?: string;
  instagramAccessToken?: string;
  instagramVerifyToken?: string;
  instagramEnabled?: boolean;
  tiktokBusinessId?: string;
  tiktokAccessToken?: string;
  tiktokVerifyToken?: string;
  tiktokEnabled?: boolean;
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
}

export interface Lead {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  notes?: string;
  customData?: Record<string, any>;
  createdAt: string;
}

export interface KnowledgeSource {
  id: string;
  title: string;
  type: string;
  chunkCount: number;
  fileSizeBytes?: number;
  status: string;
  errorMessage?: string;
  errorResolution?: string;
  corrections?: Array<{
    id: string;
    type: 'replace' | 'note' | 'edit';
    findText?: string;
    replaceText?: string;
    note?: string;
    appliedAt: string;
  }>;
  createdAt: string;
}

export type { ConversationData, MessageData } from '@/lib/db';
export type { MessageToolCall } from '@/lib/chat/conversation-enrichment';
