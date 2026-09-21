/** The one identity allowed to sign in at /master. Override with MASTER_ADMIN_EMAIL. */
export const DEFAULT_MASTER_EMAIL = 'itsfahad9@gmail.com';

export function getMasterEmail(): string {
  return (process.env.MASTER_ADMIN_EMAIL || DEFAULT_MASTER_EMAIL).trim().toLowerCase();
}
