/**
 * Google reCAPTCHA Verification Helper
 * Supports reCAPTCHA v2 / v3 / Enterprise tokens.
 * Automatically gracefully falls back when RECAPTCHA_SECRET_KEY is not configured
 * or when client ad-blockers / network dropouts prevent token generation,
 * protecting user sign-ups while keeping bot scoring active when tokens are provided.
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
  const rawSecret = process.env.RECAPTCHA_SECRET_KEY || '';
  const secretKey = rawSecret.replace(/^["']|["']$/g, '').trim();

  // 1. Development / Unconfigured fallback:
  // If the secret key is not set or empty, allow requests so registration is never bricked.
  if (!secretKey) {
    return {
      success: true,
      bypassed: true,
    };
  }

  const isStrict = process.env.RECAPTCHA_ENFORCE_STRICT === 'true';

  // 2. Token missing check:
  // When no token is supplied by the client (due to adblockers, privacy browsers, or CDN outages)
  if (!token || typeof token !== 'string' || !token.trim()) {
    if (isStrict) {
      return {
        success: false,
        error: 'reCAPTCHA verification token is missing or invalid.',
      };
    }

    // Fail-open for legitimate users using ad-blockers (Brave, uBlock)
    console.warn(
      '[reCAPTCHA] Token missing from client (ad-blocker or script block). Permitting request in resilient fail-open mode protected by Redis rate limiting.'
    );
    return {
      success: true,
      bypassed: true,
    };
  }

  // 3. A token was provided: verify it against Google's verification API
  try {
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', token.trim());
    if (remoteIp) {
      params.append('remoteip', remoteIp);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
      cache: 'no-store',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[reCAPTCHA] Google siteverify returned HTTP ${response.status}. Permitting in fail-open mode.`);
      return {
        success: true,
        bypassed: true,
      };
    }

    const data = await response.json();

    if (!data.success) {
      const errorCodes: string[] = Array.isArray(data['error-codes']) ? data['error-codes'] : [];

      // If server secret key is misconfigured in Vercel:
      if (errorCodes.includes('invalid-input-secret')) {
        console.error(
          '[reCAPTCHA] Configured RECAPTCHA_SECRET_KEY is invalid on Google servers! Bypassing to avoid blocking legitimate users.'
        );
        return {
          success: true,
          bypassed: true,
        };
      }

      // If token expired or domain mismatch and strict mode is disabled:
      if (!isStrict) {
        console.warn(`[reCAPTCHA] Google verification failed (${errorCodes.join(', ')}). Permitting request in resilient mode.`);
        return {
          success: true,
          bypassed: true,
        };
      }

      return {
        success: false,
        error: `Security verification failed: ${errorCodes.join(', ') || 'Invalid reCAPTCHA token'}`,
      };
    }

    // For reCAPTCHA v3, score ranges from 0.0 to 1.0 (1.0 = definitely human)
    // Low score indicates definite automated bot activity
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
    console.error('[reCAPTCHA] Verification network exception or timeout:', err);
    // Network failure reaching Google -> fail open so real users can still register
    return {
      success: true,
      bypassed: true,
    };
  }
}
