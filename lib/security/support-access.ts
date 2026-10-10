/**
 * Support access: the platform owner (master) opens a customer's workspace to troubleshoot it. The master gets a
 * short-lived session as that workspace's owner, marked as support access, while their own master session waits in a
 * second cookie so they can return. Only /api/master/support-access can create one, and only for the master.
 * Every start and end is written to the customer's audit trail and to the system log.
 */

export const SUPPORT_ACCESS_MINUTES = 60;
export const MASTER_RETURN_COOKIE = 'kortex_master_return';

const secure = () => (process.env.NODE_ENV === 'production' ? '; Secure' : '');

export function supportSessionCookie(token: string): string {
  return `kortex_admin_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SUPPORT_ACCESS_MINUTES * 60}${secure()}`;
}

export function masterReturnCookie(token: string): string {
  return `${MASTER_RETURN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${SUPPORT_ACCESS_MINUTES * 60}${secure()}`;
}

export function clearMasterReturnCookie(): string {
  return `${MASTER_RETURN_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure()}`;
}

export function readCookie(req: Request, name: string): string | null {
  const header = req.headers.get('cookie');
  if (!header) return null;
  for (const pair of header.split(';')) {
    const i = pair.indexOf('=');
    if (i > 0 && pair.slice(0, i).trim() === name) {
      try {
        return decodeURIComponent(pair.slice(i + 1).trim());
      } catch {
        return pair.slice(i + 1).trim();
      }
    }
  }
  return null;
}
