/** Shown to a person whose account the platform owner has disabled, at sign-in (only once the right password was given). */
export const ACCOUNT_DISABLED_MESSAGE = 'This account has been disabled. If you think this is a mistake, please contact Crescelo support.';

/** Thrown by a sign-in that must stop because the account is disabled; routes turn it into ACCOUNT_DISABLED_MESSAGE. */
export const ACCOUNT_DISABLED_ERROR = 'ACCOUNT_DISABLED';
