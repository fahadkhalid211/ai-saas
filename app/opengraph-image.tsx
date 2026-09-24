import { ImageResponse } from 'next/og';

export const alt = 'Crescelo: AI website assistant for service businesses';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #08251a 0%, #04140d 100%)',
          color: '#fffeeb',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <svg width="96" height="96" viewBox="0 0 100 100">
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
          <div style={{ fontSize: 56, fontWeight: 700, letterSpacing: -1 }}>Crescelo</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>
            <span>Answer every visitor.</span>
            <span style={{ color: '#abff44' }}>Book the ones who are ready.</span>
          </div>
          <div style={{ fontSize: 30, color: '#cfe3d6' }}>An AI website assistant for service businesses</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
