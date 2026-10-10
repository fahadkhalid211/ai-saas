/** Tiny event bus so any hook or component can raise the branded error dialog (mounted once by <ErrorModalHost />). */

export interface ErrorNotice {
  title?: string;
  message: string;
  /** One line on what to do next. */
  hint?: string;
}

export const ERROR_EVENT = 'crescelo:error';

/** Fired when the server refuses a change because the workspace has no active plan; SubscriptionGate listens and shows the plans. */
export const SUBSCRIPTION_REQUIRED_EVENT = 'crescelo:subscription_required';

export function showErrorModal(notice: ErrorNotice | string): void {
  if (typeof window === 'undefined') return;
  const detail: ErrorNotice = typeof notice === 'string' ? { message: notice } : notice;
  if (!detail.message) return;
  window.dispatchEvent(new CustomEvent<ErrorNotice>(ERROR_EVENT, { detail }));
}
