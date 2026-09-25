/** Puts every bullet on its own line (a continued answer can glue them together) and drops repeated bullets. */
export function tidy(text: string): string {
  const plain = stripMarkdown(text);
  const spaced = plain.replace(/([^\n\s])[ \t]*- (?=[A-Z0-9])/g, '$1\n- ').replace(/[ \t]+\n/g, '\n');
  const seen = new Set<string>();
  return spaced
    .split('\n')
    .filter((line) => {
      const key = line.trim().toLowerCase();
      if (!key.startsWith('- ')) return true;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join('\n')
    .trim();
}

/** Plain-text surfaces show markdown symbols literally, so headings, bold, italics and code marks are removed and bullets normalised. */
export function stripMarkdown(text: string): string {
  return text
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/\*\*([\s\S]+?)\*\*/g, '$1')
    .replace(/__([\s\S]+?)__/g, '$1')
    .replace(/(^|[^*\w])\*(?!\s)([^*\n]+?)\*(?!\w)/g, '$1$2')
    .replace(/`{1,3}([^`]*)`{1,3}/g, '$1')
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '$1 ($2)')
    .replace(/^\s*[*•]\s+/gm, '- ')
    .replace(/\*\*|##+/g, '');
}
