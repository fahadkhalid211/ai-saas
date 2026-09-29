import { beforeEach, describe, expect, it } from 'vitest';
import { ADVANCED_ONLY_TABS, loadSimpleMode, saveSimpleMode } from './simple-mode';

// The default vitest environment here is 'node', which has no localStorage, so this stubs the tiny bit the module
// uses. Kept local to this file rather than switching the whole suite to jsdom for one small preference.
class MemoryStorage implements Pick<Storage, 'getItem' | 'setItem' | 'removeItem' | 'clear'> {
  private store = new Map<string, string>();
  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }
  setItem(key: string, value: string) {
    this.store.set(key, value);
  }
  removeItem(key: string) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

beforeEach(() => {
  (globalThis as any).localStorage = new MemoryStorage();
});

describe('simple view preference', () => {
  it('defaults to on for a browser that has never chosen', () => {
    expect(loadSimpleMode()).toBe(true);
  });

  it('remembers an explicit choice either way', () => {
    saveSimpleMode(false);
    expect(loadSimpleMode()).toBe(false);
    saveSimpleMode(true);
    expect(loadSimpleMode()).toBe(true);
  });

  it('defaults to on when storage throws (private browsing, storage blocked)', () => {
    (globalThis as any).localStorage = {
      getItem() {
        throw new Error('blocked');
      },
    };
    expect(loadSimpleMode()).toBe(true);
  });

  it('lists exactly the technical tabs simple view hides', () => {
    expect([...ADVANCED_ONLY_TABS].sort()).toEqual(['analytics', 'audit', 'behavior', 'channels']);
  });
});
