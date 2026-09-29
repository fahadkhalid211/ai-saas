import { describe, expect, it } from 'vitest';
import { findProviderNotice, isProviderNotice } from './error-notice';

describe('findProviderNotice', () => {
  it('recognises each notice the provider layer emits, by its label', () => {
    expect(findProviderNotice('\n\n*(Authentication Error: bad key)*')).toMatchObject({ kind: 'auth', detail: 'bad key', leading: '' });
    expect(findProviderNotice('\n\n*(Notice: Could not connect to an active free provider.\n\n• Option 1...)*')).toMatchObject({ kind: 'missing_provider' });
    expect(findProviderNotice('\n\n*(Connection Error: unreachable)*')).toMatchObject({ kind: 'connection', detail: 'unreachable' });
    expect(findProviderNotice('\n\n*(AI Generation Error: busy)*')).toMatchObject({ kind: 'generation', detail: 'busy' });
  });

  it('keeps any real answer that streamed before the notice', () => {
    const r = findProviderNotice('Here is what I found so far.\n\n*(AI Generation Error: connection dropped)*');
    expect(r?.leading).toBe('Here is what I found so far.');
    expect(r?.detail).toBe('connection dropped');
  });

  it('returns null for an ordinary answer, including one that merely mentions an error in passing', () => {
    expect(findProviderNotice('Sure, here is how to fix a 401 error in your own app.')).toBeNull();
    expect(findProviderNotice('')).toBeNull();
  });

  it('isProviderNotice mirrors findProviderNotice', () => {
    expect(isProviderNotice('\n\n*(AI Generation Error: busy)*')).toBe(true);
    expect(isProviderNotice('All good, thanks!')).toBe(false);
  });
});
