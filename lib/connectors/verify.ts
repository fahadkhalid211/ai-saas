import { validateSafeExternalUrl } from '@/lib/security/ssrf';
/**
 * Upstream Connection Verification Engine
 * Validates external API credentials and network endpoints before saving configurations.
 */

export interface VerificationResult {
  success: boolean;
  message: string;
  details?: Record<string, any>;
}

const DEFAULT_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Verifies an AI model provider's API key and connectivity.
 */
export async function verifyAiProviderConnection(
  provider: string,
  apiKey: string,
  options?: { customBaseUrl?: string; modelName?: string }
): Promise<VerificationResult> {
  const prov = (provider || 'ollama').toLowerCase().trim();

  // The server makes these requests, so a customer-supplied address must not point at a private or internal network.
  if (options?.customBaseUrl && process.env.NODE_ENV === 'production') {
    const safe = await validateSafeExternalUrl(options.customBaseUrl.trim());
    if (!safe.safe) return { success: false, message: safe.error || 'That address is blocked by the security policy.' };
  }

  // 1. auto_free tier
  if (prov === 'auto_free') {
    // If user provided a key, verify it for the first configured service
    if (apiKey) {
      if (apiKey.startsWith('gsk_')) {
        return verifyAiProviderConnection('groq', apiKey);
      }
      if (apiKey.startsWith('AIza')) {
        return verifyAiProviderConnection('gemini', apiKey);
      }
    }
    // Auto-free without custom key relies on environment fallback
    return {
      success: true,
      message: 'Zero-Cost Free Engine selected. Will use active environment providers with automatic failover.',
    };
  }

  // 2. Ollama local instance
  if (prov === 'ollama') {
    const baseUrl = (options?.customBaseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/+$/, '');
    // Try both /api/tags (native Ollama) and /v1/models (OpenAI compatibility layer)
    const testUrls = [
      `${baseUrl}/api/tags`,
      baseUrl.endsWith('/v1') ? `${baseUrl}/models` : `${baseUrl}/v1/models`,
    ];

    let lastError = '';
    for (const testUrl of testUrls) {
      try {
        const res = await fetchWithTimeout(testUrl, { method: 'GET' }, 4000);
        if (res.ok) {
          const data = await res.json().catch(() => ({}));
          const modelsCount = Array.isArray(data?.models) ? data.models.length : Array.isArray(data?.data) ? data.data.length : 0;
          return {
            success: true,
            message: `Successfully connected to Ollama at ${baseUrl} (${modelsCount} local model${modelsCount === 1 ? '' : 's'} available).`,
            details: { modelsCount, url: baseUrl },
          };
        }
        lastError = `Ollama server returned HTTP ${res.status}`;
      } catch (err: any) {
        lastError = err?.message || 'Connection refused';
      }
    }

    return {
      success: false,
      message: `Could not connect to local Ollama at ${baseUrl}. Ensure Ollama is running (\`ollama run llama3.2\`) and accessible. (${lastError})`,
    };
  }

  // For all cloud providers, an API key is strictly required
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) {
    return {
      success: false,
      message: `An API key is required to connect ${provider.toUpperCase()}. Please paste your key.`,
    };
  }

  const cleanKey = apiKey.trim();

  // 3. Google Gemini
  if (prov === 'gemini') {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(cleanKey)}`;
      const res = await fetchWithTimeout(url, { method: 'GET' });
      if (res.ok) {
        return {
          success: true,
          message: 'Google Gemini API key verified successfully! Models are accessible.',
        };
      }
      const errJson = await res.json().catch(() => ({}));
      const reason = errJson?.error?.message || `HTTP ${res.status}`;
      return {
        success: false,
        message: `Google Gemini authentication failed: ${reason}. Please verify your key at aistudio.google.com.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to reach Google Gemini API: ${err?.message || 'Network timeout'}. Please check your internet connection.`,
      };
    }
  }

  // 4. OpenAI
  if (prov === 'openai') {
    try {
      const res = await fetchWithTimeout('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${cleanKey}`,
        },
      });
      if (res.ok) {
        return {
          success: true,
          message: 'OpenAI API key verified successfully! Connection established.',
        };
      }
      const errJson = await res.json().catch(() => ({}));
      const reason = errJson?.error?.message || `HTTP ${res.status}`;
      return {
        success: false,
        message: `OpenAI authentication failed: ${reason}. Please verify your key at platform.openai.com.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to reach OpenAI API: ${err?.message || 'Network timeout'}.`,
      };
    }
  }

  // 5. Groq Cloud
  if (prov === 'groq') {
    try {
      const res = await fetchWithTimeout('https://api.groq.com/openai/v1/models', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${cleanKey}`,
        },
      });
      if (res.ok) {
        return {
          success: true,
          message: 'Groq Cloud API key verified successfully! High-speed inference is ready.',
        };
      }
      const errJson = await res.json().catch(() => ({}));
      const reason = errJson?.error?.message || `HTTP ${res.status}`;
      return {
        success: false,
        message: `Groq authentication failed: ${reason}. Please verify your key at console.groq.com/keys.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to reach Groq Cloud API: ${err?.message || 'Network timeout'}.`,
      };
    }
  }

  // 6. Anthropic Claude
  if (prov === 'anthropic') {
    try {
      const res = await fetchWithTimeout('https://api.anthropic.com/v1/models', {
        method: 'GET',
        headers: {
          'x-api-key': cleanKey,
          'anthropic-version': '2023-06-01',
        },
      });
      if (res.ok) {
        return {
          success: true,
          message: 'Anthropic Claude API key verified successfully!',
        };
      }
      const errJson = await res.json().catch(() => ({}));
      const reason = errJson?.error?.message || `HTTP ${res.status}`;
      return {
        success: false,
        message: `Anthropic Claude authentication failed: ${reason}. Please verify your key at console.anthropic.com.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to reach Anthropic API: ${err?.message || 'Network timeout'}.`,
      };
    }
  }

  // 7. DeepSeek
  if (prov === 'deepseek') {
    try {
      const res = await fetchWithTimeout('https://api.deepseek.com/models', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${cleanKey}`,
        },
      });
      if (res.ok) {
        return {
          success: true,
          message: 'DeepSeek API key verified successfully!',
        };
      }
      const errJson = await res.json().catch(() => ({}));
      const reason = errJson?.error?.message || `HTTP ${res.status}`;
      return {
        success: false,
        message: `DeepSeek authentication failed: ${reason}. Please verify your key at platform.deepseek.com.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Failed to reach DeepSeek API: ${err?.message || 'Network timeout'}.`,
      };
    }
  }

  // 8. Custom OpenAI-compatible endpoint
  if (prov === 'custom') {
    const rawUrl = options?.customBaseUrl || 'http://localhost:11434/v1';
    const baseUrl = rawUrl.replace(/\/+$/, '');
    const testUrl = baseUrl.endsWith('/models') ? baseUrl : `${baseUrl}/models`;

    try {
      const res = await fetchWithTimeout(testUrl, {
        method: 'GET',
        headers: cleanKey ? { Authorization: `Bearer ${cleanKey}` } : {},
      });
      if (res.ok) {
        return {
          success: true,
          message: `Custom endpoint verified successfully at ${baseUrl}!`,
        };
      }
      return {
        success: false,
        message: `Custom endpoint returned HTTP ${res.status} when querying models at ${testUrl}.`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Could not connect to custom endpoint at ${baseUrl}: ${err?.message || 'Connection refused'}.`,
      };
    }
  }

  return {
    success: false,
    message: `Unknown or unsupported AI provider: "${provider}".`,
  };
}

/**
 * Verifies a Telegram Bot Token by pinging Telegram's getMe method.
 */
export async function verifyTelegramBotConnection(botToken: string): Promise<VerificationResult> {
  const token = (botToken || '').trim();
  if (!token) {
    return { success: false, message: 'Telegram Bot Token cannot be empty.' };
  }

  try {
    const res = await fetchWithTimeout(`https://api.telegram.org/bot${encodeURIComponent(token)}/getMe`, {
      method: 'GET',
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.ok && data.result) {
      const botName = data.result.first_name || data.result.username || 'Bot';
      const botUser = data.result.username ? `@${data.result.username}` : '';
      return {
        success: true,
        message: `Telegram Bot verified successfully! Connected as "${botName}" (${botUser}).`,
        details: data.result,
      };
    }

    const description = data.description || `HTTP ${res.status}`;
    return {
      success: false,
      message: `Telegram token verification failed: ${description}. Please check the token provided by @BotFather.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to contact Telegram API: ${err?.message || 'Network timeout'}.`,
    };
  }
}

/**
 * Verifies a WhatsApp Cloud Access Token by querying Meta Graph API.
 */
export async function verifyWhatsAppConnection(
  accessToken: string,
  phoneNumberId?: string
): Promise<VerificationResult> {
  const token = (accessToken || '').trim();
  if (!token) {
    return { success: false, message: 'WhatsApp Access Token cannot be empty.' };
  }

  try {
    // If phone number ID is provided, query it directly; otherwise query /me
    const target = phoneNumberId?.trim() ? phoneNumberId.trim() : 'me';
    const res = await fetchWithTimeout(`https://graph.facebook.com/v19.0/${target}?access_token=${encodeURIComponent(token)}`, {
      method: 'GET',
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data && (data.id || data.name)) {
      const name = data.name || data.display_phone_number || data.id;
      return {
        success: true,
        message: `WhatsApp Business API verified successfully! Connected account: ${name}.`,
        details: data,
      };
    }

    const reason = data?.error?.message || `HTTP ${res.status}`;
    return {
      success: false,
      message: `WhatsApp token verification failed: ${reason}. Please ensure the token has 'whatsapp_business_messaging' permissions.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to contact Meta Graph API: ${err?.message || 'Network timeout'}.`,
    };
  }
}

/**
 * Validates a Webhook URL.
 */
export async function verifyWebhookConnection(webhookUrl: string): Promise<VerificationResult> {
  const url = (webhookUrl || '').trim();
  if (!url) {
    return { success: false, message: 'Webhook URL cannot be empty.' };
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { success: false, message: 'Webhook URL must use http:// or https:// protocol.' };
    }
  } catch {
    return { success: false, message: 'Invalid Webhook URL format. Please provide a valid URL (e.g. https://api.yourdomain.com/webhook).' };
  }

  return {
    success: true,
    message: 'Webhook URL format is valid.',
  };
}
