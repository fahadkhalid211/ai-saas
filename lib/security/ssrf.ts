import dns from 'dns';
import { promisify } from 'util';

const lookupAsync = promisify(dns.lookup);

/**
 * Validates if an IPv4 or IPv6 address belongs to a private, loopback, or cloud metadata network.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  if (!ip) return true;

  // IPv6 checks
  if (ip.includes(':')) {
    const lower = ip.toLowerCase();
    // Loopback
    if (lower === '::1' || lower === '::') return true;
    // Link-local
    if (lower.startsWith('fe80:') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true;
    // Unique local address (ULA)
    if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
    // IPv4-mapped IPv6 address (::ffff:127.0.0.1)
    if (lower.startsWith('::ffff:')) {
      const v4Part = lower.replace('::ffff:', '');
      return isPrivateOrReservedIp(v4Part);
    }
    return false;
  }

  // IPv4 checks
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(isNaN)) return true;

  const [a, b] = parts;

  // 0.0.0.0/8 (Current network)
  if (a === 0) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 10.0.0.0/8 (Private)
  if (a === 10) return true;

  // 172.16.0.0/12 (Private)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.168.0.0/16 (Private)
  if (a === 192 && b === 168) return true;

  // 169.254.0.0/16 (Link-Local / AWS EC2 IMDS / Azure metadata)
  if (a === 169 && b === 254) return true;

  // 100.64.0.0/10 (Carrier-grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
  if (a >= 224) return true;

  return false;
}

/**
 * Validates that an external URL does not target loopback, RFC1918 private subnets,
 * or cloud metadata endpoints (SSRF prevention).
 */
export async function validateSafeExternalUrl(rawUrl: string): Promise<{ safe: boolean; error?: string; url?: string }> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { safe: false, error: 'URL must be a non-empty string' };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { safe: false, error: 'Invalid URL format' };
  }

  // 1. Enforce strict HTTP/HTTPS protocol
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { safe: false, error: `Protocol "${parsed.protocol}" is not allowed. Only HTTP and HTTPS are permitted.` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // 2. Reject obvious internal hostnames
  if (
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal') ||
    hostname === 'metadata.google.internal' ||
    hostname === 'instance-data'
  ) {
    return { safe: false, error: 'Access to internal and local hostnames is forbidden.' };
  }

  // 3. If hostname is already a direct IP address
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':')) {
    if (isPrivateOrReservedIp(hostname)) {
      return { safe: false, error: `Access to private or reserved IP address (${hostname}) is forbidden.` };
    }
  }

  // 4. Resolve DNS records and verify all destination IPs
  try {
    const results = await lookupAsync(hostname, { all: true });
    if (!results || results.length === 0) {
      return { safe: false, error: 'Hostname could not be resolved' };
    }

    for (const record of results) {
      if (isPrivateOrReservedIp(record.address)) {
        return {
          safe: false,
          error: `Domain "${hostname}" resolves to private/reserved IP (${record.address}). Request blocked.`,
        };
      }
    }
  } catch (dnsErr: any) {
    return { safe: false, error: `DNS lookup failed for "${hostname}": ${dnsErr?.message || 'Host not found'}` };
  }

  return { safe: true, url: parsed.toString() };
}
