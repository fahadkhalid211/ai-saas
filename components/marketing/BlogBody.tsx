import Link from 'next/link';
import type { ReactNode } from 'react';
import type { BlogBlock } from '@/lib/blog/posts';

const LINK = /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g;

/** Turns "[label](/path)" or "[label](https://site)" into links. Internal links use Next's Link; external links open safely. Nothing else is interpreted. */
export function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  LINK.lastIndex = 0;
  while ((m = LINK.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const [, label, href] = m;
    out.push(
      href.startsWith('/') ? (
        <Link key={m.index} href={href} style={{ textDecoration: 'underline', textUnderlineOffset: 3, fontWeight: 600 }}>
          {label}
        </Link>
      ) : (
        <a key={m.index} href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', textUnderlineOffset: 3, fontWeight: 600 }}>
          {label}
        </a>
      )
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function BlogBody({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: 1.75, fontSize: '1.02rem' }}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'h2':
            return (
              <h2 key={i} id={b.id} style={{ fontSize: '1.6rem', marginTop: '1.25rem', scrollMarginTop: '6rem', color: 'var(--mk-ink)' }}>
                {b.text}
              </h2>
            );
          case 'ul':
            return (
              <ul key={i} style={{ paddingLeft: '1.4rem', listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it)}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={i} style={{ paddingLeft: '1.4rem', listStyle: 'decimal', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {b.items.map((it, j) => (
                  <li key={j}>{inline(it)}</li>
                ))}
              </ol>
            );
          case 'note':
            return (
              <p key={i} className="mk-card" style={{ padding: '1rem 1.25rem', fontSize: '0.95rem' }}>
                {inline(b.text)}
              </p>
            );
          case 'table':
            return (
              <div key={i} style={{ overflowX: 'auto', margin: '1.25rem 0', borderRadius: '8px', border: '1px solid var(--mk-border, #e2e8f0)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.92rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--mk-surface-muted, #f8fafc)', borderBottom: '2px solid var(--mk-border, #cbd5e1)' }}>
                      {b.headers.map((h, k) => (
                        <th key={k} style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--mk-ink, #0f172a)' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, r) => (
                      <tr key={r} style={{ borderBottom: '1px solid var(--mk-border, #e2e8f0)', background: r % 2 === 1 ? 'var(--mk-surface-muted, #f8fafc)' : 'transparent' }}>
                        {row.map((cell, c) => (
                          <td key={c} style={{ padding: '0.7rem 1rem', verticalAlign: 'top' }}>
                            {inline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case 'p':
            return <p key={i}>{inline(b.text)}</p>;
          default:
            return null;
        }
      })}
    </div>
  );
}
