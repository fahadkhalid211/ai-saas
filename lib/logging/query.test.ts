import { describe, it, expect } from 'vitest';
import { buildWhere, likePattern, parseFilters, MAX_PAGE } from './query';
import { csvCell } from './csv';

const qs = (s: string) => new URLSearchParams(s);

describe('log filters', () => {
  it('keeps valid filters and drops malformed ones instead of passing them on', () => {
    const f = parseFilters(
      qs('levels=error,warn,evil;DROP&categories=auth,db,../../x&statusMin=500&statusMax=99999&from=not-a-date&limit=99999&before=2026-01-01T00:00:00Z|abc')
    );
    expect(f.levels).toEqual(['error', 'warn']);
    expect(f.categories).toEqual(['auth', 'db']);
    expect(f.statusMin).toBe(500);
    expect(f.statusMax).toBeUndefined();
    expect(f.from).toBeUndefined();
    expect(f.limit).toBe(MAX_PAGE);
    expect(f.before).toBeUndefined(); // id is not numeric
  });

  it('accepts a well-formed keyset cursor and ascending order', () => {
    const f = parseFilters(qs('before=2026-09-24T10:00:00.000Z|123&order=asc&requestId=abc-123'));
    expect(f.before).toEqual({ ts: '2026-09-24T10:00:00.000Z', id: '123' });
    expect(f.order).toBe('asc');
    expect(f.requestId).toBe('abc-123');
  });

  it('never puts user text into the SQL, only into parameters', () => {
    const hostile = `x'; DROP TABLE kortex_logs; --`;
    const f = parseFilters(qs(`q=${encodeURIComponent(hostile)}&userId=${encodeURIComponent(hostile)}&route=${encodeURIComponent(hostile)}`));
    const { sql, params } = buildWhere(f);
    expect(sql).not.toContain('DROP');
    expect(sql).not.toContain('kortex_logs');
    expect(sql).toMatch(/\$\d/);
    expect(params.some((p) => typeof p === 'string' && p.includes('DROP TABLE'))).toBe(true);
  });

  it('matches free text literally (wildcards are escaped)', () => {
    expect(likePattern('50%_off\\')).toBe('%50\\%\\_off\\\\%');
    const { sql, params } = buildWhere({ q: '100%' });
    expect(sql).toContain("ESCAPE '\\'");
    expect(params).toEqual(['%100\\%%']);
  });

  it('numbers parameters consecutively and supports the keyset cursor in both directions', () => {
    const { sql, params } = buildWhere({ levels: ['error'], userId: 'u1', before: { ts: '2026-01-01T00:00:00Z', id: '5' }, order: 'desc' });
    expect(params).toHaveLength(4);
    expect(sql).toContain('level = ANY($1)');
    expect(sql).toContain('user_id = $2');
    expect(sql).toContain('(ts, id) < ($3::timestamptz, $4::bigint)');
    expect(buildWhere({ before: { ts: '2026-01-01T00:00:00Z', id: '5' }, order: 'asc' }).sql).toContain('(ts, id) > ');
  });
});

describe('csv export', () => {
  it('quotes cells and neutralises spreadsheet formulas', () => {
    expect(csvCell('plain')).toBe('plain');
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell('=HYPERLINK("http://evil","x")')).toMatch(/^"'=/);
    expect(csvCell('+1+1')).toBe("'+1+1");
    expect(csvCell(null)).toBe('');
    expect(csvCell(42)).toBe('42');
  });
});
