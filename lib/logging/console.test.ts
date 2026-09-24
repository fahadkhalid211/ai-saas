import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('./store', async () => {
  const actual = await vi.importActual<typeof import('./store')>('./store');
  return { ...actual, persistLogRows: vi.fn(async (rows: any[]) => ({ stored: rows.length, where: 'postgres' as const })) };
});

import { installConsoleCapture, _resetConsoleCaptureForTesting } from './console';
import { _peekLogBufferForTesting, _resetLoggerForTesting } from './logger';

const originalError = console.error;
const originalWarn = console.warn;

beforeEach(() => {
  console.error = originalError;
  console.warn = originalWarn;
  _resetConsoleCaptureForTesting();
  _resetLoggerForTesting();
});

describe('console capture', () => {
  it('records console.error and console.warn in the log and still prints them', () => {
    const printed: unknown[][] = [];
    console.error = (...a: unknown[]) => void printed.push(a);
    console.warn = (...a: unknown[]) => void printed.push(a);
    installConsoleCapture();
    console.error('[Postgres] Exception persisting state:', 'connection refused');
    console.warn('[Cache] slow');
    const rows = _peekLogBufferForTesting();
    expect(printed).toHaveLength(2);
    expect(rows.map((r) => [r.level, r.event])).toEqual([['error', 'console.error'], ['warn', 'console.warn']]);
    expect(rows[0].message).toContain('connection refused');
  });

  it('keeps the stack and groups by error when an Error is passed', () => {
    console.error = () => undefined;
    installConsoleCapture();
    console.error('Chat endpoint error:', new TypeError('x is not a function'));
    const [row] = _peekLogBufferForTesting();
    expect(row.errorName).toBe('TypeError');
    expect(row.fingerprint).toHaveLength(16);
  });

  it('redacts secrets that were printed', () => {
    console.error = () => undefined;
    installConsoleCapture();
    console.error('connect failed postgresql://postgres:hunter2@10.0.0.1/db with key sk-live-abcdefghijklmnopqrstuv');
    const [row] = _peekLogBufferForTesting();
    expect(row.message).not.toMatch(/hunter2|abcdefghijklmnopqrstuv/);
  });

  it('ignores the logger\'s own fallback lines and cannot recurse', () => {
    console.warn = () => undefined;
    installConsoleCapture();
    console.warn('[Log] not persisted (database error); falling back to console for error rows');
    expect(_peekLogBufferForTesting()).toHaveLength(0);
  });

  it('caps a runaway loop at 60 lines a minute', () => {
    console.error = () => undefined;
    installConsoleCapture();
    for (let i = 0; i < 500; i++) console.error(`loop ${i}`);
    expect(_peekLogBufferForTesting().length).toBe(60);
  });

  it('can be disabled', () => {
    process.env.LOG_CAPTURE_CONSOLE = 'false';
    console.error = () => undefined;
    installConsoleCapture();
    console.error('nothing');
    expect(_peekLogBufferForTesting()).toHaveLength(0);
    delete process.env.LOG_CAPTURE_CONSOLE;
  });
});
