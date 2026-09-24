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
    | 'chat_escalated';
  metadata?: Record<string, any>;
  read: boolean;
  createdAt: string;
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
