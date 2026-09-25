import { ImageResponse } from 'next/og';
import { BLOG_POSTS, getPost } from '@/lib/blog/posts';

export const alt = 'Crescelo article';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

/** A branded share image for each article: its own title and topic, so shared links and search show something specific. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = (post?.seoTitle || post?.title || 'Crescelo Knowledge Hub').replace(/\s*\|\s*Crescelo$/, '');
  const topic = post?.clusterName || 'Knowledge Hub';
  const size2 = title.length > 60 ? 60 : title.length > 40 ? 68 : 78;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 76px',
          background: 'linear-gradient(135deg, #08251a 0%, #04140d 100%)',
          color: '#fffeeb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <svg width="72" height="72" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f1ffc9" />
                  <stop offset="45%" stopColor="#abff44" />
                  <stop offset="100%" stopColor="#74d321" />
                </linearGradient>
              </defs>
              <rect width="100" height="100" rx="26" fill="#0c3526" />
              <path d="M69.9 33.3 A26 26 0 1 0 69.9 66.7" fill="none" stroke="url(#c)" strokeWidth="15" strokeLinecap="round" />
              <circle cx="63" cy="50" r="6" fill="url(#c)" />
            </svg>
            <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>Crescelo</div>
          </div>
          <div style={{ display: 'flex', fontSize: 26, color: '#abff44', border: '2px solid #abff44', borderRadius: 999, padding: '8px 22px' }}>{topic}</div>
        </div>

        <div style={{ display: 'flex', fontSize: size2, fontWeight: 700, lineHeight: 1.08, letterSpacing: -2, maxWidth: 1040 }}>{title}</div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 28, color: '#cfe3d6' }}>
          <span>Knowledge Hub</span>
          <span>{post ? `${post.readMinutes} min read` : 'crescelo.com'}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
