import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { api, DEFAULT_SERVER_URL } from '../services/api';
import { registerForPushNotifications, unregisterPushNotifications } from '../services/notifications';
import { TeamMember, WorkspaceSummary, AssistantSummary } from '../types';

WebBrowser.maybeCompleteAuthSession();

const SELECTED_ASSISTANT_KEY = '@crescelo_assistant_id';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  member: TeamMember | null;
  workspace: WorkspaceSummary | null;
  assistants: AssistantSummary[];
  selectedAssistant: AssistantSummary | null;
  serverUrl: string;
  login: (email: string, passwordOrCode: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  quickDemoLogin: () => Promise<void>;
  logout: () => Promise<void>;
  setSelectedAssistant: (assistant: AssistantSummary) => void;
  setServerUrl: (url: string) => void;
  reloadAssistants: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);
  const [member, setMember] = useState<TeamMember | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceSummary | null>(null);
  const [assistants, setAssistants] = useState<AssistantSummary[]>([]);
  const [selectedAssistant, setSelectedAssistantState] = useState<AssistantSummary | null>(null);
  const [serverUrl, setServerUrlState] = useState<string>(DEFAULT_SERVER_URL);

  useEffect(() => {
    bootstrap();

    // Listen for incoming deep links (e.g. crescelo://auth?token=...)
    const handleUrl = (event: { url: string }) => {
      try {
        const parsed = Linking.parse(event.url);
        const incomingToken = parsed.queryParams?.token as string;
        if (incomingToken) {
          loginWithToken(incomingToken).catch(console.error);
        }
      } catch (e) {
        console.warn('Failed to parse incoming deep link url:', e);
      }
    };

    const sub = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });

    return () => {
      sub.remove();
    };
  }, []);

  const bootstrap = async () => {
    try {
      setIsLoading(true);
      const { token: savedToken, serverUrl: savedUrl } = await api.init();
      setServerUrlState(savedUrl);

      if (savedToken) {
        setToken(savedToken);
        const authResult = await api.verifyAuth();
        if (authResult.authenticated && authResult.member) {
          setIsAuthenticated(true);
          setMember(authResult.member);
          if (authResult.workspace) setWorkspace(authResult.workspace);

          // Fetch assistants for this account
          await fetchAssistants();

          // Refresh device push registration
          registerForPushNotifications().catch(() => {});
        } else {
          // Token is expired or invalid
          await api.logout();
          setIsAuthenticated(false);
          setMember(null);
        }
      }
    } catch (err) {
      console.warn('Error during auth bootstrap:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssistants = async () => {
    try {
      const list = await api.getAssistants();
      setAssistants(list);

      const savedAssistantId = await AsyncStorage.getItem(SELECTED_ASSISTANT_KEY);
      if (savedAssistantId && list.length > 0) {
        const match = list.find((a) => a.id === savedAssistantId);
        if (match) {
          setSelectedAssistantState(match);
          return;
        }
      }

      if (list.length > 0) {
        setSelectedAssistantState(list[0]);
        AsyncStorage.setItem(SELECTED_ASSISTANT_KEY, list[0].id).catch(console.error);
      }
    } catch (e) {
      console.warn('Failed to fetch assistants:', e);
    }
  };

  const setSelectedAssistant = (assistant: AssistantSummary) => {
    setSelectedAssistantState(assistant);
    AsyncStorage.setItem(SELECTED_ASSISTANT_KEY, assistant.id).catch(console.error);
  };

  const setServerUrl = (url: string) => {
    api.setServerUrl(url);
    setServerUrlState(url);
  };

  const loginWithToken = async (incomingToken: string) => {
    setIsLoading(true);
    try {
      api.setToken(incomingToken);
      setToken(incomingToken);
      const authResult = await api.verifyAuth();
      if (authResult.authenticated && authResult.member) {
        setIsAuthenticated(true);
        setMember(authResult.member);
        if (authResult.workspace) setWorkspace(authResult.workspace);
        await fetchAssistants();
        registerForPushNotifications().catch(() => {});
      } else {
        throw new Error('Unable to verify login session. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const redirectUrl = Linking.createURL('auth');
      const authUrl = `${api.getServerUrl()}/api/auth/oauth/google?platform=mobile`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);

      if (result.type === 'success' && result.url) {
        const parsed = Linking.parse(result.url);
        const incomingToken = parsed.queryParams?.token as string;
        if (incomingToken) {
          await loginWithToken(incomingToken);
          return;
        }
        if (parsed.queryParams?.error) {
          throw new Error(String(parsed.queryParams.error));
        }
      }
    } catch (err: any) {
      console.warn('Google sign-in exception:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async () => {
    setIsLoading(true);
    try {
      const res = await api.quickDemoLogin();
      setToken(res.token);
      setMember(res.member);
      if (res.workspace) setWorkspace(res.workspace);
      setIsAuthenticated(true);
      await fetchAssistants();
      registerForPushNotifications().catch(() => {});
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, passwordOrCode: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, passwordOrCode);
      setToken(res.token);
      setMember(res.member);
      if (res.workspace) setWorkspace(res.workspace);
      setIsAuthenticated(true);

      // Fetch user's assistants
      await fetchAssistants();

      // Register device for real-time mobile push notifications
      registerForPushNotifications().catch(() => {});
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await unregisterPushNotifications().catch(() => {});
      await api.logout();
      setToken(null);
      setMember(null);
      setWorkspace(null);
      setAssistants([]);
      setSelectedAssistantState(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        token,
        member,
        workspace,
        assistants,
        selectedAssistant,
        serverUrl,
        login,
        loginWithGoogle,
        loginWithToken,
        quickDemoLogin,
        logout,
        setSelectedAssistant,
        setServerUrl,
        reloadAssistants: fetchAssistants,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
