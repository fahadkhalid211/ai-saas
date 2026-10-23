export interface AppointmentData {
  id: string;
  assistantId: string;
  name: string;
  email: string;
  phone?: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g. "10:00 AM"
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

export interface InAppNotificationData {
  id: string;
  assistantId?: string;
  title: string;
  message: string;
  type:
    | 'appointment_booked'
    | 'appointment_cancelled'
    | 'lead_captured'
    | 'takeover_requested'
    | 'reminder_dispatched'
    | 'chat_new'
    | 'chat_message'
    | 'chat_escalated'
    | 'calendar_clash'
    | 'calendar_sync_failed';
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: string;
}

export interface MessageData {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system' | 'agent';
  content: string;
  citations?: any[];
  tokensUsed?: number;
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

export interface AssistantSummary {
  id: string;
  name: string;
  description?: string;
  workspaceId?: string;
  model?: string;
  createdAt?: string;
}

export interface TeamMember {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'support_agent' | 'billing_manager' | 'viewer';
  title?: string;
  avatarUrl?: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  planId?: string;
  planName?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  member: TeamMember | null;
  workspace: WorkspaceSummary | null;
  assistants: AssistantSummary[];
  selectedAssistant: AssistantSummary | null;
  serverUrl: string;
}
