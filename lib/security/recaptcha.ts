/**
 * Google reCAPTCHA Verification Helper
 * Supports reCAPTCHA v2 / v3 / Enterprise tokens.
 * Automatically gracefully falls back when RECAPTCHA_SECRET_KEY is not configured
 * to ensure local development, CI builds, and unit tests function seamlessly.
 */

export interface RecaptchaVerificationResult {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  bypassed?: boolean;
  error?: string;
}

export async function verifyRecaptchaToken(
  token?: string | null,
  remoteIp?: string
): Promise<RecaptchaVerificationResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  // Development / Unconfigured fallback:
  // If the secret key is not set, allow requests with a warning log so the app doesn't brick.
  if (!secretKey) {
    if (process.env.NODE_ENV === 'development') {
      // Quiet in tests / local dev
    }
    return {
      success: true,
      bypassed: true,
    };
  }

  if (!token || typeof token !== 'string' || !token.trim()) {
    return {
      success: false,
      error: 'reCAPTCHA verification token is missing or invalid.',
    };
  }

  try {
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', token.trim());
    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        success: false,
        error: `reCAPTCHA service verification failed with status: ${response.status}`,
      };
    }

    const data = await response.json();

    if (!data.success) {
      const errorCodes = Array.isArray(data['error-codes']) ? data['error-codes'].join(', ') : 'Verification failed';
      return {
        success: false,
        error: `reCAPTCHA check failed: ${errorCodes}`,
      };
    }

    // For reCAPTCHA v3, score ranges from 0.0 to 1.0 (1.0 = definitely human)
    if (typeof data.score === 'number' && data.score < 0.3) {
      return {
        success: false,
        score: data.score,
        error: 'reCAPTCHA bot score too low. Request blocked as suspicious.',
      };
    }

    return {
      success: true,
      score: data.score,
      action: data.action,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
    };
  } catch (err: any) {
    console.error('[reCAPTCHA] Verification network exception:', err);
    // If Google reCAPTCHA servers are unreachable or timing out, permit requests if in fail-open mode
    return {
      success: false,
      error: 'Unable to communicate with reCAPTCHA service. Please try again.',
    };
  }
}
