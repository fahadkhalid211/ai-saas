/** Puts every bullet on its own line (a continued answer can glue them together) and drops repeated bullets. */
export function tidy(text: string): string {
  const spaced = text.replace(/([^\n\s])[ \t]*- (?=[A-Z0-9])/g, '$1\n- ').replace(/[ \t]+\n/g, '\n');
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
