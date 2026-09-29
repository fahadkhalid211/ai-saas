/**
 * "Simple view": hides the dashboard's more technical tabs (analytics, channel/webhook wiring, assistant
 * instructions, the audit trail) for owners who just want to add their documents, test the assistant and put it on
 * their website. On by default for exactly that reason — a new owner should see a short, calm sidebar until they
 * choose to see everything, not the other way round. The choice is remembered per browser, the same way the
 * light/dark theme is (see the Cookie Policy's "Preferences" section).
 */

export const SIMPLE_MODE_STORAGE_KEY = 'crescelo_simple_mode';

/** Tab ids hidden from the sidebar while simple view is on. Still reachable by direct navigation if something else
 *  (a link, a saved tab) sends the owner to one, so turning simple view on never truly locks a feature away. */
export const ADVANCED_ONLY_TABS = new Set(['analytics', 'channels', 'behavior', 'audit']);

export function loadSimpleMode(): boolean {
  try {
    const v = localStorage.getItem(SIMPLE_MODE_STORAGE_KEY);
    return v === null ? true : v === '1';
  } catch {
    return true; // private browsing or storage blocked: default to the calmer view anyway
  }
}

export function saveSimpleMode(on: boolean): void {
  try {
    localStorage.setItem(SIMPLE_MODE_STORAGE_KEY, on ? '1' : '0');
  } catch {
    // nothing we can do; the choice just will not be remembered next visit
  }
}
