/**
 * Funnel events for Google Analytics. gtag exists only after the visitor accepted analytics (see CookieConsent), so
 * without consent this does nothing. Parameters must stay free of chat text, e-mail addresses, passwords and keys.
 */
export type FunnelEvent = 'pricing_viewed' | 'plan_selected' | 'sign_up' | 'demo_started' | 'knowledge_added' | 'assistant_published';

export function trackEvent(name: FunnelEvent, params: Record<string, string | number | boolean> = {}): void {
  try {
    if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
    window.gtag('event', name, params);
  } catch {
    // measurement must never break the page
  }
}

const SELECTED_PLAN_KEY = 'crescelo_selected_plan';

export interface SelectedPlan {
  plan: string;
  billing: 'monthly' | 'annual';
}

export function rememberSelectedPlan(p: SelectedPlan): void {
  try {
    sessionStorage.setItem(SELECTED_PLAN_KEY, JSON.stringify(p));
  } catch {
    // ignore
  }
}

export function readSelectedPlan(): SelectedPlan | null {
  try {
    const v = JSON.parse(sessionStorage.getItem(SELECTED_PLAN_KEY) || 'null');
    if (v && typeof v.plan === 'string' && (v.billing === 'monthly' || v.billing === 'annual')) return v;
  } catch {
    // ignore
  }
  return null;
}
