/** Text helpers shared by the i18n scripts. */
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…', rarr: '→', larr: '←', copy: '©', reg: '®', trade: '™', ldquo: '“', rdquo: '”', lsquo: '‘', rsquo: '’', middot: '·', bull: '•', times: '×', check: '✓', laquo: '«', raquo: '»', euro: '€', pound: '£', deg: '°', ensp: ' ', emsp: ' ', thinsp: ' ', zwnj: '‌' };

export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') {
      const code = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : m;
    }
    return ENTITIES[e] ?? m;
  });
}

export const normalize = (t) => t.replace(/\s+/g, ' ').trim();
