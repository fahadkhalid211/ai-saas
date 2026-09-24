import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AppointmentData,
  InAppNotificationData,
  AssistantSummary,
  TeamMember,
  WorkspaceSummary,
} from '../types';

const TOKEN_KEY = '@crescelo_token';
const SERVER_URL_KEY = '@crescelo_server_url';
const SELECTED_ASSISTANT_KEY = '@crescelo_assistant_id';

// Default server URL. For Android emulator: http://10.0.2.2:3000
// For physical devices on local network: http://<YOUR_LAN_IP>:3000
// For production: https://crescelo.com
export const DEFAULT_SERVER_URL = 'http://10.0.2.2:3000';

class ApiService {
  private serverUrl: string = DEFAULT_SERVER_URL;
  private token: string | null = null;

  async init(): Promise<{ token: string | null; serverUrl: string }> {
    try {
      const [storedToken, storedUrl] = await Promise.all([
        AsyncStorage.getItem(TOKEN_KEY),
        AsyncStorage.getItem(SERVER_URL_KEY),
      ]);
      if (storedToken) this.token = storedToken;
      if (storedUrl) this.serverUrl = storedUrl;
      return { token: this.token, serverUrl: this.serverUrl };
    } catch (e) {
      console.warn('Failed to load stored auth state:', e);
      return { token: null, serverUrl: this.serverUrl };
    }
  }

  setServerUrl(url: string) {
    let clean = url.trim();
    if (clean.endsWith('/')) clean = clean.slice(0, -1);
    this.serverUrl = clean;
    AsyncStorage.setItem(SERVER_URL_KEY, clean).catch(console.error);
  }

  getServerUrl(): string {
    return this.serverUrl;
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      AsyncStorage.setItem(TOKEN_KEY, token).catch(console.error);
    } else {
      AsyncStorage.removeItem(TOKEN_KEY).catch(console.error);
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.serverUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      headers['X-Api-Key'] = this.token;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data: any = await res.json().catch(() => null);

      if (!res.ok) {
        const errorMsg = data?.error || data?.message || `Request failed with status ${res.status}`;
        throw new Error(errorMsg);
      }

      return data as T;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error(`Connection timed out to ${this.serverUrl}. Please check your network or server URL.`);
      }
      throw err;
    }
  }

  // --- Auth Endpoints ---

  async login(email: string, passwordOrCode: string): Promise<{
    member: TeamMember;
    workspace?: WorkspaceSummary;
    token: string;
  }> {
    const data = await this.request<any>('/api/auth', {
      method: 'POST',
      body: JSON.stringify({
        email: email.trim(),
        password: passwordOrCode.trim(),
        mode: 'staff',
      }),
    });

    if (data.token) {
      this.setToken(data.token);
    }

    return {
      member: data.member,
      workspace: data.workspace,
      token: data.token,
    };
  }

  async verifyAuth(): Promise<{
    authenticated: boolean;
    member?: TeamMember;
    workspace?: WorkspaceSummary;
  }> {
    if (!this.token) return { authenticated: false };
    try {
      const data = await this.request<any>('/api/auth', { method: 'GET' });
      return {
        authenticated: !!data.authenticated,
        member: data.member,
        workspace: data.workspace,
      };
    } catch (e) {
      return { authenticated: false };
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await this.request('/api/auth', { method: 'DELETE' }).catch(() => {});
      }
    } finally {
      this.setToken(null);
      await AsyncStorage.multiRemove([TOKEN_KEY, SELECTED_ASSISTANT_KEY]).catch(console.error);
    }
  }

  // --- Assistants ---

  async getAssistants(): Promise<AssistantSummary[]> {
    const data = await this.request<{ assistants: AssistantSummary[] }>('/api/assistants', {
      method: 'GET',
    });
    return data.assistants || [];
  }

  // --- Appointments ---

  async getAppointments(assistantId: string): Promise<AppointmentData[]> {
    const data = await this.request<{ appointments: AppointmentData[] }>(
      `/api/appointments?assistantId=${encodeURIComponent(assistantId)}`,
      { method: 'GET' }
    );
    return data.appointments || [];
  }

  async updateAppointmentStatus(
    id: string,
    status: 'confirmed' | 'cancelled' | 'completed',
    cancellationReason?: string
  ): Promise<{ success: boolean; appointment?: AppointmentData }> {
    return this.request('/api/appointments', {
      method: 'POST',
      body: JSON.stringify({
        action: 'update_status',
        id,
        status,
        cancellationReason,
      }),
    });
  }

  // --- Notifications ---

  async getNotifications(
    assistantId?: string,
    limit: number = 60
  ): Promise<{ notifications: InAppNotificationData[]; unreadCount: number }> {
    let url = `/api/notifications?limit=${limit}`;
    if (assistantId) {
      url += `&assistantId=${encodeURIComponent(assistantId)}`;
    }
    const data = await this.request<{
      notifications: InAppNotificationData[];
      unreadCount: number;
    }>(url, { method: 'GET' });
    return {
      notifications: data.notifications || [],
      unreadCount: data.unreadCount || 0,
    };
  }

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return this.request('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({ action: 'mark_read', id }),
    });
  }

  async markAllNotificationsRead(assistantId?: string): Promise<{ success: boolean }> {
    return this.request('/api/notifications', {
      method: 'POST',
      body: JSON.stringify({ action: 'mark_all_read', assistantId }),
    });
  }
}

export const api = new ApiService();
