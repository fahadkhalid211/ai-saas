/**
 * Client-side referral attribution & tracking helper.
 * Captures ?ref=CODE from query parameters, stores in localStorage and cookies,
 * and notifies the referral click tracking endpoint.
 */

const REF_KEY = 'crescelo_ref';

export function captureReferralFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('referral');

    if (ref && typeof ref === 'string') {
      const clean = ref.toLowerCase().trim();
      localStorage.setItem(REF_KEY, clean);

      // Set 30-day attribution cookie
      const isProd = window.location.protocol === 'https:';
      document.cookie = `${REF_KEY}=${encodeURIComponent(clean)}; path=/; max-age=2592000; SameSite=Lax${isProd ? '; secure' : ''}`;

      // Asynchronously log the click
      fetch('/api/referral/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: clean,
          referrer: document.referrer || '',
          landingPath: window.location.pathname,
        }),
      }).catch(() => {});

      return clean;
    }
  } catch {}

  return null;
}

export function getStoredReferralCode(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(REF_KEY);
    if (stored) return stored;

    const match = document.cookie
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${REF_KEY}=`));

    if (match) {
      return decodeURIComponent(match.slice(REF_KEY.length + 1));
    }
  } catch {}

  return null;
}
