import { validateSafeExternalUrl } from '@/lib/security/ssrf';

/**
 * A customer-supplied model URL (custom / self-hosted provider) is fetched by OUR server, so it must not be able to reach
 * private or internal addresses. Checked on every request, redirects are refused, and it applies in production only:
 * a self-hosted install may legitimately point at a local Ollama.
 */
export function guardedFetchFor(userSuppliedBaseUrl: string | undefined): typeof fetch | undefined {
  if (!userSuppliedBaseUrl || process.env.NODE_ENV !== 'production') return undefined;
  return (async (input: any, init?: any) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
    const check = await validateSafeExternalUrl(url);
    if (!check.safe) throw new Error(check.error || 'That model address is blocked by the security policy.');
    return fetch(input, { ...init, redirect: 'error' });
  }) as typeof fetch;
}
