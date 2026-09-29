import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir3 = path.resolve('public/instagram/banner-3split');
const outDir6 = path.resolve('public/instagram/banner-6split');
const artifactDir = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\7557de85-1f77-4787-bb49-5bfd907d5e43';

[outDir3, outDir6].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Scalable brand icon
function getBrandMark(x, y, size = 28) {
  const scale = size / 100;
  return `
  <g transform="translate(${x}, ${y}) scale(${scale})">
    <defs>
      <linearGradient id="bm_grad_${x}_${y}_${size}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#12432f"/>
        <stop offset="100%" stop-color="#04140d"/>
      </linearGradient>
      <linearGradient id="bm_c_${x}_${y}_${size}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f1ffc9"/>
        <stop offset="45%" stop-color="#abff44"/>
        <stop offset="100%" stop-color="#74d321"/>
      </linearGradient>
      <clipPath id="bm_clip_${x}_${y}_${size}">
        <rect x="0" y="0" width="100" height="100" rx="26" />
      </clipPath>
    </defs>
    <rect x="3" y="3" width="100" height="100" rx="26" fill="#1a1a1a"/>
    <rect width="100" height="100" rx="26" fill="url(#bm_grad_${x}_${y}_${size})" stroke="#1a1a1a" stroke-width="2.5"/>
    <g clip-path="url(#bm_clip_${x}_${y}_${size})">
      <circle cx="50" cy="50" r="38" fill="#abff44" opacity="0.16" />
      <path d="M69.9 33.3 A26 26 0 1 0 69.9 66.7" fill="none" stroke="url(#bm_c_${x}_${y}_${size})" stroke-width="14" stroke-linecap="round"/>
      <circle cx="63" cy="50" r="5.6" fill="url(#bm_c_${x}_${y}_${size})"/>
    </g>
    <rect x="1" y="1" width="98" height="98" rx="25" fill="none" stroke="#abff44" stroke-opacity="0.38" stroke-width="2"/>
  </g>`;
}

// Playful OS / Figma Vector Cursor with Nametag
function getCursor({ x, y, label = 'crescelo_ai', color = '#abff44', rotation = -15, scale = 1 }) {
  const textWidth = label.length * 8.5 + 24;
  return `
  <g transform="translate(${x}, ${y}) scale(${scale})">
    <g transform="rotate(${rotation})">
      <path d="M 4 4 L 4 30 L 11 23 L 18 36 L 23 34 L 16 21 L 24 21 Z" fill="#1a1a1a" opacity="0.25"/>
      <path d="M 0 0 L 0 28 L 7 21 L 14 34 L 19 32 L 12 19 L 21 19 Z" fill="#1a1a1a" stroke="#fffdf6" stroke-width="2.2" stroke-linejoin="round"/>
    </g>
    <g transform="translate(18, 14)">
      <rect x="2.5" y="2.5" width="${textWidth}" height="28" rx="14" fill="#1a1a1a"/>
      <rect width="${textWidth}" height="28" rx="14" fill="${color}" stroke="#1a1a1a" stroke-width="2"/>
      <circle cx="12" cy="14" r="3.5" fill="#1a1a1a"/>
      <text x="22" y="18.5" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="12" font-weight="800" fill="#08251a">${label}</text>
    </g>
  </g>`;
}

// Click Ripple / Ping effect with sticker burst
function getClickRipple(x, y, label = 'CLICK!') {
  return `
  <g transform="translate(${x}, ${y})">
    <circle cx="0" cy="0" r="32" fill="none" stroke="#abff44" stroke-width="3" stroke-dasharray="4 3" opacity="0.8"/>
    <circle cx="0" cy="0" r="22" fill="none" stroke="#1c9c81" stroke-width="2.5" opacity="0.6"/>
    <circle cx="0" cy="0" r="12" fill="#abff44" opacity="0.4"/>
    <circle cx="0" cy="0" r="5" fill="#1a1a1a"/>
    <g transform="translate(24, -28) rotate(-10)">
      <rect x="2" y="2" width="68" height="24" rx="6" fill="#1a1a1a"/>
      <rect width="68" height="24" rx="6" fill="#ffe044" stroke="#1a1a1a" stroke-width="1.8"/>
      <text x="34" y="16" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="900" fill="#1a1a1a" text-anchor="middle" letter-spacing="0.5">${label}</text>
    </g>
  </g>`;
}

// Playful Starburst Die-Cut Sticker
function getStickerStarburst({ x, y, textTop = '★ 24/7 ★', textBottom = 'AUTONOMOUS', bg = '#ffa946', size = 130, rotation = -8 }) {
  const points = [];
  const cx = size / 2;
  const cy = size / 2;
  const numPoints = 16;
  const outerR = size * 0.48;
  const innerR = size * 0.38;
  for (let i = 0; i < numPoints * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / numPoints;
    points.push(`${cx + r * Math.sin(angle)},${cy - r * Math.cos(angle)}`);
  }
  const pointsStr = points.join(' ');

  return `
  <g transform="translate(${x}, ${y}) rotate(${rotation})">
    <polygon points="${pointsStr}" fill="#1a1a1a" transform="translate(4, 5)"/>
    <polygon points="${pointsStr}" fill="${bg}" stroke="#1a1a1a" stroke-width="2.5"/>
    <circle cx="${cx}" cy="${cy}" r="${innerR * 0.85}" fill="none" stroke="#1a1a1a" stroke-width="1.5" stroke-dasharray="3 2"/>
    <text x="${cx}" y="${cy - 6}" font-family="Georgia, serif" font-size="14" font-weight="bold" fill="#1a1a1a" text-anchor="middle" letter-spacing="0.5">${textTop}</text>
    <text x="${cx}" y="${cy + 13}" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="900" fill="#1a1a1a" text-anchor="middle" letter-spacing="1">${textBottom}</text>
  </g>`;
}

// Playful Wavy / Flower Badge Sticker
function getStickerWavy({ x, y, text1 = '⚡ 0% MARKUP', text2 = 'BYOK FREEDOM', bg = '#abff44', rotation = 6, size = 120 }) {
  const cx = size / 2;
  return `
  <g transform="translate(${x}, ${y}) rotate(${rotation})">
    <rect x="4" y="4" width="${size}" height="${size * 0.58}" rx="${size * 0.29}" fill="#1a1a1a"/>
    <rect width="${size}" height="${size * 0.58}" rx="${size * 0.29}" fill="${bg}" stroke="#1a1a1a" stroke-width="2.5"/>
    <path d="M 18 10 Q ${cx} 6 ${size - 18} 10" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.6"/>
    <text x="${cx}" y="${size * 0.28}" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="900" fill="#08251a" text-anchor="middle">${text1}</text>
    <text x="${cx}" y="${size * 0.46}" font-family="'Segoe UI', Arial, sans-serif" font-size="10" font-weight="800" fill="#0f6e58" text-anchor="middle" letter-spacing="0.5">${text2}</text>
  </g>`;
}

// Playful Smiley Sticker with Star Eyes
function getStickerSmiley({ x, y, label = '100% GROUNDED', bg = '#ffd6f6', rotation = -6, size = 96 }) {
  const cx = size / 2;
  const cy = size / 2;
  return `
  <g transform="translate(${x}, ${y}) rotate(${rotation})">
    <circle cx="${cx + 4}" cy="${cy + 4}" r="${size * 0.44}" fill="#1a1a1a"/>
    <circle cx="${cx}" cy="${cy}" r="${size * 0.44}" fill="${bg}" stroke="#1a1a1a" stroke-width="2.5"/>
    
    <!-- Star Eyes ✦ ✦ -->
    <path d="M ${cx - 16} ${cy - 12} Q ${cx - 16} ${cy - 7} ${cx - 11} ${cy - 7} Q ${cx - 16} ${cy - 7} ${cx - 16} ${cy - 2} Q ${cx - 16} ${cy - 7} ${cx - 21} ${cy - 7} Q ${cx - 16} ${cy - 7} ${cx - 16} ${cy - 12} Z" fill="#1a1a1a"/>
    <path d="M ${cx + 16} ${cy - 12} Q ${cx + 16} ${cy - 7} ${cx + 21} ${cy - 7} Q ${cx + 16} ${cy - 7} ${cx + 16} ${cy - 2} Q ${cx + 16} ${cy - 7} ${cx + 11} ${cy - 7} Q ${cx + 16} ${cy - 7} ${cx + 16} ${cy - 12} Z" fill="#1a1a1a"/>
    
    <!-- Big Happy Smile -->
    <path d="M ${cx - 18} ${cy + 4} Q ${cx} ${cy + 22} ${cx + 18} ${cy + 4}" fill="none" stroke="#1a1a1a" stroke-width="3" stroke-linecap="round"/>
    
    <circle cx="${cx - 22}" cy="${cy + 4}" r="5" fill="#ff6c4c" opacity="0.6"/>
    <circle cx="${cx + 22}" cy="${cy + 4}" r="5" fill="#ff6c4c" opacity="0.6"/>

    <g transform="translate(${cx - 56}, ${size - 18})">
      <rect x="2" y="2" width="112" height="22" rx="6" fill="#1a1a1a"/>
      <rect width="112" height="22" rx="6" fill="#fffdf6" stroke="#1a1a1a" stroke-width="1.8"/>
      <text x="56" y="15" font-family="'Segoe UI', Arial, sans-serif" font-size="10" font-weight="900" fill="#08251a" text-anchor="middle" letter-spacing="0.5">${label}</text>
    </g>
  </g>`;
}

// Peel Sticker Badge
function getStickerPeel({ x, y, text = '🚀 60s TO LIVE', bg = '#cdeee4', rotation = 8 }) {
  return `
  <g transform="translate(${x}, ${y}) rotate(${rotation})">
    <rect x="3" y="3" width="144" height="42" rx="10" fill="#1a1a1a"/>
    <rect width="144" height="42" rx="10" fill="${bg}" stroke="#1a1a1a" stroke-width="2"/>
    <polygon points="126,0 144,18 126,18" fill="#fffdf6" stroke="#1a1a1a" stroke-width="1.5"/>
    <text x="64" y="26" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="900" fill="#08251a" text-anchor="middle" letter-spacing="0.5">${text}</text>
  </g>`;
}

// Doodle Hand-Drawn Arrow
function getDoodleArrow({ x1, y1, x2, y2, label = '' }) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 - 25;
  return `
  <g>
    <path d="M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}" fill="none" stroke="#1a1a1a" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="6 4"/>
    <polygon points="${x2},${y2} ${x2 - 12},${y2 - 8} ${x2 - 12},${y2 + 8}" fill="#1a1a1a"/>
    ${label ? `<text x="${mx}" y="${my - 12}" font-family="Georgia, serif" font-style="italic" font-size="16" font-weight="bold" fill="#0f6e58" text-anchor="middle">${label}</text>` : ''}
  </g>`;
}

// -------------------------------------------------------------
// 1. PERFECTED 3-SPLIT PANORAMIC BANNER (3240 × 1080)
// Every tile (1080x1080) is beautifully self-contained while seamlessly connecting
// -------------------------------------------------------------
function buildBanner3SplitSvg({ showGridGuides = false } = {}) {
  const W = 3240;
  const H = 1080;

  return `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="b3_rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff6c4c"/>
      <stop offset="18%" stop-color="#ffa946"/>
      <stop offset="38%" stop-color="#abff44"/>
      <stop offset="58%" stop-color="#1c9c81"/>
      <stop offset="78%" stop-color="#91dbda"/>
      <stop offset="100%" stop-color="#f0d7ff"/>
    </linearGradient>

    <pattern id="b3_dots" width="36" height="36" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="1.8" fill="#1a1a1a" fill-opacity="0.04" />
    </pattern>
  </defs>

  <!-- Warm Cream Base Canvas -->
  <rect width="${W}" height="${H}" fill="#fffeeb"/>
  <rect width="${W}" height="${H}" fill="url(#b3_dots)"/>

  <!-- Playful Decorative Giant Blobs in background -->
  <circle cx="160" cy="80" r="160" fill="#f0d7ff" fill-opacity="0.5"/>
  <circle cx="3120" cy="120" r="200" fill="#cdeee4" fill-opacity="0.5"/>
  <circle cx="1620" cy="1040" r="240" fill="#ffe0b0" fill-opacity="0.35"/>
  <circle cx="200" cy="1000" r="140" fill="#ffd6f6" fill-opacity="0.4"/>

  <!-- Outer frame on each tile so individual posts look sharp -->
  <!-- Tile 1 Frame -->
  <rect x="36" y="36" width="1008" height="1008" rx="34" fill="#1a1a1a"/>
  <rect x="30" y="30" width="1008" height="1008" rx="34" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2.5"/>

  <!-- Tile 2 Frame (Rainbow Conic Border Centerpiece) -->
  <rect x="1116" y="36" width="1008" height="1008" rx="34" fill="#1a1a1a"/>
  <rect x="1110" y="30" width="1008" height="1008" rx="34" fill="url(#b3_rainbow)"/>
  <rect x="1114" y="34" width="1000" height="1000" rx="32" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2"/>

  <!-- Tile 3 Frame -->
  <rect x="2196" y="36" width="1008" height="1008" rx="34" fill="#1a1a1a"/>
  <rect x="2190" y="30" width="1008" height="1008" rx="34" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2.5"/>

  <!-- ============================================================== -->
  <!-- TILE 1: THE BRAND HOOK & 3 PILLARS (x: 0 to 1080)               -->
  <!-- ============================================================== -->
  <g transform="translate(70, 64)">
    
    <!-- Top Bar: Logo + Eyebrow capsule -->
    <g transform="translate(0, 0)">
      ${getBrandMark(0, 0, 26)}
      <text x="38" y="23" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#08251a">crescelo</text>
      
      <g transform="translate(540, -4)">
        <rect x="2.5" y="2.5" width="220" height="34" rx="17" fill="#1a1a1a"/>
        <rect width="220" height="34" rx="17" fill="#f0d7ff" stroke="#1a1a1a" stroke-width="1.8"/>
        <circle cx="18" cy="17" r="4.5" fill="#1a1a1a"/>
        <text x="32" y="22" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#1a1a1a" letter-spacing="1">01/03 • THE HOOK</text>
      </g>
    </g>

    <!-- Main Editorial Headline -->
    <g transform="translate(0, 100)">
      <text font-family="Georgia, serif" font-size="54" font-weight="bold" fill="#08251a" letter-spacing="-1.5">
        Turn website traffic
      </text>
      <text y="66" font-family="Georgia, serif" font-size="54" font-weight="bold" font-style="italic" fill="#0f6e58" letter-spacing="-1.5">
        into booked clients.
      </text>
      <text y="122" font-family="'Segoe UI', Arial, sans-serif" font-size="19" font-weight="400" fill="#55554c">
        Zero hallucinations. Real calendar booking right inside the chat stream.
      </text>
    </g>

    <!-- 3 Value Cards Stacked -->
    <g transform="translate(0, 310)">
      
      <!-- Card 1: Mint Booking -->
      <g transform="translate(0, 0)">
        <rect x="4" y="4" width="760" height="110" rx="18" fill="#1a1a1a"/>
        <rect width="760" height="110" rx="18" fill="#cdeee4" stroke="#1a1a1a" stroke-width="2.2"/>
        <text x="24" y="40" font-family="Georgia, serif" font-size="21" font-weight="bold" fill="#08251a">📅 In-Chat Live Calendar Booking</text>
        <text x="24" y="70" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#2f3a33">Presents open slots and confirms reservations in real-time.</text>
        <text x="24" y="94" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#0f6e58">→ Converts 3.4x higher than static contact forms</text>
      </g>

      <!-- Card 2: Lavender BYOK -->
      <g transform="translate(0, 134)">
        <rect x="4" y="4" width="760" height="110" rx="18" fill="#1a1a1a"/>
        <rect width="760" height="110" rx="18" fill="#f0d7ff" stroke="#1a1a1a" stroke-width="2.2"/>
        <text x="24" y="40" font-family="Georgia, serif" font-size="21" font-weight="bold" fill="#1a1a1a">⚡ Zero Token Markup (BYOK)</text>
        <text x="24" y="70" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#2f3a33">Bring Your Own Key (Gemini, Groq, OpenAI). Pay wholesale rates.</text>
        <text x="24" y="94" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#1a1a1a">→ Eliminates 800% reseller SaaS markup tax</text>
      </g>

      <!-- Card 3: Lime Guarantee -->
      <g transform="translate(0, 268)">
        <rect x="4" y="4" width="760" height="110" rx="18" fill="#1a1a1a"/>
        <rect width="760" height="110" rx="18" fill="#d9f7ab" stroke="#1a1a1a" stroke-width="2.2"/>
        <text x="24" y="40" font-family="Georgia, serif" font-size="21" font-weight="bold" fill="#08251a">🛡️ 100% Policy Grounded Guarantee</text>
        <text x="24" y="70" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#2f3a33">Answers only from your verified files. Meaning search + BM25 keywords.</text>
        <text x="24" y="94" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#0f6e58">→ Zero hallucinations. Safe corporate responses</text>
      </g>
    </g>

    <!-- Sticker: Starburst on Tile 1 -->
    ${getStickerStarburst({ x: 740, y: 70, textTop: '★ 24/7 ★', textBottom: 'AUTONOMOUS', bg: '#ffa946', size: 140, rotation: -8 })}

    <!-- Animated Sticker: Smiley Badge -->
    ${getStickerSmiley({ x: 770, y: 460, label: '100% GROUNDED', bg: '#ffd6f6', rotation: 8, size: 110 })}

    <!-- Playful Cursor on Tile 1 -->
    ${getCursor({ x: 580, y: 690, label: '⚡ crescelo_bot', color: '#abff44', rotation: -16, scale: 1.15 })}

    <!-- Tile 1 Footer -->
    <g transform="translate(0, 890)">
      <line x1="0" y1="0" x2="880" y2="0" stroke="#1a1a1a" stroke-width="1.8"/>
      <text x="0" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="900" fill="#1a1a1a">www.crescelo.com</text>
      <text x="180" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="15" fill="#55554c">• AI Assistant for Service Businesses</text>
      <text x="880" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#0f6e58" text-anchor="end">Part 1 of 3 →</text>
    </g>
  </g>

  <!-- ============================================================== -->
  <!-- TILE 2: THE FLAGSHIP INTERACTIVE CHAT UI (x: 1080 to 2160)     -->
  <!-- ============================================================== -->
  <g transform="translate(1150, 64)">

    <!-- Top Bar -->
    <g transform="translate(0, 0)">
      <!-- 3 macOS-style dots -->
      <circle cx="12" cy="14" r="7" fill="#ff6c4c" stroke="#1a1a1a" stroke-width="1.8"/>
      <circle cx="34" cy="14" r="7" fill="#ffa946" stroke="#1a1a1a" stroke-width="1.8"/>
      <circle cx="56" cy="14" r="7" fill="#abff44" stroke="#1a1a1a" stroke-width="1.8"/>
      
      <!-- Center Title Capsule -->
      <g transform="translate(160, -4)">
        <rect x="2" y="2" width="460" height="36" rx="12" fill="#1a1a1a"/>
        <rect width="460" height="36" rx="12" fill="#fffdf6" stroke="#1a1a1a" stroke-width="1.8"/>
        <circle cx="20" cy="18" r="5" fill="#abff44" stroke="#1a1a1a" stroke-width="1.5"/>
        <text x="36" y="23" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#1a1a1a">apex-consulting.com • Crescelo Live Widget</text>
      </g>

      <g transform="translate(680, -4)">
        <rect x="2.5" y="2.5" width="220" height="34" rx="17" fill="#1a1a1a"/>
        <rect width="220" height="34" rx="17" fill="#ffd6f6" stroke="#1a1a1a" stroke-width="1.8"/>
        <circle cx="18" cy="17" r="4.5" fill="#1a1a1a"/>
        <text x="32" y="22" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#1a1a1a" letter-spacing="1">02/03 • LIVE DEMO</text>
      </g>
    </g>

    <line x1="-20" y1="56" x2="920" y2="56" stroke="#1a1a1a" stroke-width="1.8"/>

    <!-- Inside the Chat Simulation -->
    <g transform="translate(0, 80)">
      
      <!-- Visitor Inquiry -->
      <g transform="translate(180, 0)">
        <rect x="3" y="3" width="700" height="76" rx="20" fill="#1a1a1a"/>
        <rect width="700" height="76" rx="20" fill="#08251a" stroke="#1a1a1a" stroke-width="2"/>
        <text x="28" y="45" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="600" fill="#fffdf6">
          "Can we book a 45-min growth audit with your lead strategist?"
        </text>
        <text x="635" y="22" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="700" fill="#abff44">2:14 AM</text>
      </g>

      <!-- Assistant Reply -->
      <g transform="translate(0, 104)">
        <g transform="translate(0, 6)">
          ${getBrandMark(0, 0, 34)}
        </g>
        <g transform="translate(56, 0)">
          <rect x="3" y="3" width="740" height="82" rx="20" fill="#1a1a1a"/>
          <rect width="740" height="82" rx="20" fill="#e8fbf3" stroke="#1a1a1a" stroke-width="2"/>
          <text x="24" y="36" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="600" fill="#08251a">
            "I'd love to help! I have direct access to our strategist's calendar."
          </text>
          <text x="24" y="62" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" fill="#0f6e58">
            Please pick a slot that fits your schedule:
          </text>
        </g>
      </g>

      <!-- In-Chat Slot Cards -->
      <g transform="translate(56, 216)">
        
        <!-- Slot A (Lavender card) -->
        <g transform="translate(0, 0)">
          <rect x="3" y="3" width="340" height="84" rx="16" fill="#1a1a1a"/>
          <rect width="340" height="84" rx="16" fill="#f0d7ff" stroke="#1a1a1a" stroke-width="2"/>
          <text x="22" y="36" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#1a1a1a">Thursday, Oct 1</text>
          <text x="22" y="62" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="800" fill="#0f6e58">10:00 AM – 10:45 AM</text>
        </g>

        <!-- Slot B (Selected Slot with Lime Highlight & Click!) -->
        <g transform="translate(370, 0)">
          <rect x="4" y="4" width="370" height="84" rx="16" fill="#1a1a1a"/>
          <rect width="370" height="84" rx="16" fill="#abff44" stroke="#1a1a1a" stroke-width="2.5"/>
          <text x="22" y="36" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#08251a">Thursday, Oct 1</text>
          <text x="22" y="62" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="900" fill="#08251a">2:30 PM – 3:15 PM  ✓</text>
          
          ${getClickRipple(320, 42, 'SELECTED!')}
        </g>
      </g>

      <!-- Confirmed Booking Stamp Card -->
      <g transform="translate(56, 332)">
        <rect x="4" y="4" width="820" height="190" rx="20" fill="#1a1a1a"/>
        <rect width="820" height="190" rx="20" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2.2"/>
        
        <g transform="translate(28, 28)">
          <rect x="0" y="0" width="140" height="26" rx="13" fill="#d9f7ab" stroke="#1a1a1a" stroke-width="1.5"/>
          <text x="70" y="17" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="900" fill="#08251a" text-anchor="middle">SLOT CONFIRMED</text>

          <text x="0" y="62" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#08251a">Senior Growth Strategy Consultation</text>
          <text x="0" y="92" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="600" fill="#55554c">
            📅 Thursday, Oct 1 at 2:30 PM EST • In-Memory Lock Held
          </text>
          <text x="0" y="118" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#0f6e58">
            ✓ Calendar invites sent to both parties • Full context logged to CRM
          </text>
        </g>

        <!-- Right: Stamp -->
        <g transform="translate(640, 28)">
          <rect x="3" y="3" width="150" height="134" rx="16" fill="#1a1a1a"/>
          <rect width="150" height="134" rx="16" fill="#abff44" stroke="#1a1a1a" stroke-width="2.5"/>
          <text x="75" y="54" font-family="'Segoe UI', Arial, sans-serif" font-size="36" font-weight="bold" fill="#08251a" text-anchor="middle">✓</text>
          <text x="75" y="88" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="900" fill="#08251a" text-anchor="middle" letter-spacing="1">CONFIRMED</text>
          <text x="75" y="108" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="700" fill="#1a5944" text-anchor="middle">Synced in 12ms</text>
        </g>
      </g>

      <!-- User Cursors (Positioned cleanly without overlapping slot text) -->
      ${getCursor({ x: 440, y: 156, label: 'Visitor #4829', color: '#ffa946', rotation: -12, scale: 1.15 })}
      ${getCursor({ x: 620, y: 470, label: '⚡ crescelo_ai', color: '#abff44', rotation: -18, scale: 1.2 })}
    </g>

    <!-- Tile 2 Footer -->
    <g transform="translate(0, 890)">
      <line x1="0" y1="0" x2="880" y2="0" stroke="#1a1a1a" stroke-width="1.8"/>
      <text x="0" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="900" fill="#1a1a1a">www.crescelo.com</text>
      <text x="180" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="15" fill="#55554c">• Concurrency Mutex Technology</text>
      <text x="880" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#0f6e58" text-anchor="end">Part 2 of 3 →</text>
    </g>
  </g>

  <!-- ============================================================== -->
  <!-- TILE 3: CONVERSION, SPEED & BIG CTA (x: 2160 to 3240)           -->
  <!-- ============================================================== -->
  <g transform="translate(2230, 64)">

    <!-- Top Bar -->
    <g transform="translate(0, 0)">
      ${getStickerWavy({ x: 0, y: -6, text1: '⚡ 0% TOKEN MARKUP', text2: 'BYOK AT COST', bg: '#abff44', rotation: 4, size: 200 })}
      ${getStickerPeel({ x: 380, y: 0, text: '🚀 60s TO LIVE', bg: '#ffd6f6', rotation: -5 })}

      <g transform="translate(680, -4)">
        <rect x="2.5" y="2.5" width="220" height="34" rx="17" fill="#1a1a1a"/>
        <rect width="220" height="34" rx="17" fill="#cdeee4" stroke="#1a1a1a" stroke-width="1.8"/>
        <circle cx="18" cy="17" r="4.5" fill="#1a1a1a"/>
        <text x="32" y="22" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#1a1a1a" letter-spacing="1">03/03 • GET STARTED</text>
      </g>
    </g>

    <!-- 2 Bold Metric Bento Boxes -->
    <g transform="translate(0, 110)">
      
      <!-- Bento 1: 3.4x Conversion (Sunny Amber) -->
      <g transform="translate(0, 0)">
        <rect x="4" y="4" width="430" height="170" rx="22" fill="#1a1a1a"/>
        <rect width="430" height="170" rx="22" fill="#ffe0b0" stroke="#1a1a1a" stroke-width="2.5"/>
        <text x="30" y="62" font-family="Georgia, serif" font-size="52" font-weight="bold" fill="#08251a">3.4x</text>
        <text x="30" y="104" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#08251a">Higher Booking Rate</text>
        <text x="30" y="132" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#55554c">vs. traditional contact forms &amp; FAQ bots</text>
      </g>

      <!-- Bento 2: Handover Speed (Sky Blue) -->
      <g transform="translate(460, 0)">
        <rect x="4" y="4" width="440" height="170" rx="22" fill="#1a1a1a"/>
        <rect width="440" height="170" rx="22" fill="#d3f1f0" stroke="#1a1a1a" stroke-width="2.5"/>
        <text x="30" y="62" font-family="Georgia, serif" font-size="52" font-weight="bold" fill="#08251a">&lt; 15s</text>
        <text x="30" y="104" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#08251a">VIP Live Team Takeover</text>
        <text x="30" y="132" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#55554c">Sound chime alerts &amp; full transcript sync</text>
      </g>
    </g>

    <!-- 1-Line Code Box -->
    <g transform="translate(0, 310)">
      <rect x="4" y="4" width="900" height="180" rx="22" fill="#1a1a1a"/>
      <rect width="900" height="180" rx="22" fill="#08251a" stroke="#1a1a1a" stroke-width="2.5"/>
      
      <g transform="translate(24, 20)">
        <circle cx="8" cy="8" r="5" fill="#ff6c4c"/>
        <circle cx="24" cy="8" r="5" fill="#ffa946"/>
        <circle cx="40" cy="8" r="5" fill="#abff44"/>
        <text x="64" y="12" font-family="'Segoe UI', monospace" font-size="12" font-weight="bold" fill="#91dbda">embed-crescelo.html • 1-line script</text>
      </g>
      
      <g transform="translate(24, 68)">
        <text font-family="'Courier New', Courier, monospace" font-size="14" fill="#9a9a8a">&lt;!-- Paste before closing &lt;/body&gt; tag --&gt;</text>
        <text y="32" font-family="'Courier New', Courier, monospace" font-size="17" font-weight="bold" fill="#fffdf6">
          &lt;script <tspan fill="#abff44">src=</tspan><tspan fill="#ffa946">"https://www.crescelo.com/widget.js"</tspan> <tspan fill="#91dbda">defer</tspan>&gt;&lt;/script&gt;
        </text>
        <text y="68" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#abff44">
          ✓ Works on WordPress • Shopify • Webflow • Framer • Squarespace • Next.js
        </text>
      </g>
    </g>

    <!-- Massive Playful CTA Button -->
    <g transform="translate(0, 520)">
      <rect x="5" y="6" width="900" height="140" rx="24" fill="#1a1a1a"/>
      <rect width="900" height="140" rx="24" fill="#abff44" stroke="#1a1a1a" stroke-width="3"/>
      
      <text x="44" y="60" font-family="Georgia, serif" font-size="34" font-weight="bold" fill="#08251a">
        Build Your AI Assistant in 60 Seconds →
      </text>
      <text x="44" y="102" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="800" fill="#08251a">
        www.crescelo.com  <tspan font-weight="400" fill="#12432f">• Free Tier Available • Zero Credit Card Required</tspan>
      </text>

      <g transform="translate(820, 42)">
        <circle cx="20" cy="20" r="18" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2"/>
        <text x="20" y="27" font-size="18" text-anchor="middle">✨</text>
      </g>
    </g>

    <!-- Hand-drawn arrow pointing to the CTA -->
    ${getDoodleArrow({ x1: 720, y1: 500, x2: 740, y2: 524, label: 'Deploy now' })}
    ${getCursor({ x: 540, y: 620, label: 'Click to start', color: '#ffd6f6', rotation: -8, scale: 1.15 })}

    <!-- Tile 3 Footer -->
    <g transform="translate(0, 890)">
      <line x1="0" y1="0" x2="900" y2="0" stroke="#1a1a1a" stroke-width="1.8"/>
      <text x="0" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="900" fill="#1a1a1a">www.crescelo.com</text>
      <text x="180" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="15" fill="#55554c">• 1 Line of Code Setup</text>
      <text x="900" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#0f6e58" text-anchor="end">Part 3 of 3 ✓</text>
    </g>
  </g>

  <!-- ============================================================== -->
  <!-- OPTIONAL GRID SLICE GUIDELINES (FOR PREVIEW / CUT VISUALIZER)    -->
  <!-- ============================================================== -->
  ${showGridGuides ? `
    <line x1="1080" y1="0" x2="1080" y2="${H}" stroke="#6b21a8" stroke-width="6" stroke-dasharray="14 10" opacity="0.9"/>
    <line x1="2160" y1="0" x2="2160" y2="${H}" stroke="#6b21a8" stroke-width="6" stroke-dasharray="14 10" opacity="0.9"/>

    <g transform="translate(540, 48)">
      <rect x="-130" y="-22" width="260" height="44" rx="22" fill="#6b21a8"/>
      <text x="0" y="7" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="900" fill="#fff" text-anchor="middle">TILE 01 • UPLOAD LAST (#3)</text>
    </g>
    <g transform="translate(1620, 48)">
      <rect x="-130" y="-22" width="260" height="44" rx="22" fill="#6b21a8"/>
      <text x="0" y="7" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="900" fill="#fff" text-anchor="middle">TILE 02 • UPLOAD #2</text>
    </g>
    <g transform="translate(2700, 48)">
      <rect x="-130" y="-22" width="260" height="44" rx="22" fill="#6b21a8"/>
      <text x="0" y="7" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="900" fill="#fff" text-anchor="middle">TILE 03 • UPLOAD FIRST (#1)</text>
    </g>
  ` : ''}

</svg>`;
}

// -------------------------------------------------------------
// 2. PERFECTED 6-SPLIT MEGA GRID BANNER (3240 × 2160)
// 6 tiles (3x2), each tile (1080x1080) self-contained & connecting seamlessly
// -------------------------------------------------------------
function buildBanner6SplitSvg({ showGridGuides = false } = {}) {
  const W = 3240;
  const H = 2160;

  return `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="b6_rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff6c4c"/>
      <stop offset="18%" stop-color="#ffa946"/>
      <stop offset="38%" stop-color="#abff44"/>
      <stop offset="58%" stop-color="#1c9c81"/>
      <stop offset="78%" stop-color="#91dbda"/>
      <stop offset="100%" stop-color="#f0d7ff"/>
    </linearGradient>

    <pattern id="b6_dots" width="40" height="40" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="2" fill="#1a1a1a" fill-opacity="0.04" />
    </pattern>
  </defs>

  <!-- Cream Canvas -->
  <rect width="${W}" height="${H}" fill="#fffeeb"/>
  <rect width="${W}" height="${H}" fill="url(#b6_dots)"/>

  <!-- Playful Decorative Giant Blobs in background -->
  <circle cx="200" cy="180" r="240" fill="#f0d7ff" fill-opacity="0.5"/>
  <circle cx="3100" cy="240" r="300" fill="#cdeee4" fill-opacity="0.5"/>
  <circle cx="200" cy="1980" r="260" fill="#ffe0b0" fill-opacity="0.4"/>
  <circle cx="3100" cy="1980" r="280" fill="#ffd6f6" fill-opacity="0.4"/>

  <!-- 6 Tiles: Each tile gets a clean neo-brutalist container -->
  
  <!-- TILE 1: Top-Left (x: 0, y: 0) -->
  <rect x="36" y="36" width="1008" height="1008" rx="34" fill="#1a1a1a"/>
  <rect x="30" y="30" width="1008" height="1008" rx="34" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2.5"/>

  <!-- TILE 2: Top-Center (x: 1080, y: 0) with Rainbow Conic Border -->
  <rect x="1116" y="36" width="1008" height="1008" rx="34" fill="#1a1a1a"/>
  <rect x="1110" y="30" width="1008" height="1008" rx="34" fill="url(#b6_rainbow)"/>
  <rect x="1114" y="34" width="1000" height="1000" rx="32" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2"/>

  <!-- TILE 3: Top-Right (x: 2160, y: 0) -->
  <rect x="2196" y="36" width="1008" height="1008" rx="34" fill="#1a1a1a"/>
  <rect x="2190" y="30" width="1008" height="1008" rx="34" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2.5"/>

  <!-- TILE 4: Bottom-Left (x: 0, y: 1080) -->
  <rect x="36" y="1116" width="1008" height="1008" rx="34" fill="#1a1a1a"/>
  <rect x="30" y="1110" width="1008" height="1008" rx="34" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2.5"/>

  <!-- TILE 5: Bottom-Center (x: 1080, y: 1080) -->
  <rect x="1116" y="1116" width="1008" height="1008" rx="34" fill="#1a1a1a"/>
  <rect x="1110" y="1110" width="1008" height="1008" rx="34" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2.5"/>

  <!-- TILE 6: Bottom-Right (x: 2160, y: 1080) -->
  <rect x="2196" y="1116" width="1008" height="1008" rx="34" fill="#1a1a1a"/>
  <rect x="2190" y="1110" width="1008" height="1008" rx="34" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2.5"/>


  <!-- ============================================================== -->
  <!-- TILE 1 CONTENT: THE FLAGSHIP HOOK (Top-Left)                    -->
  <!-- ============================================================== -->
  <g transform="translate(70, 64)">
    <g transform="translate(0, 0)">
      ${getBrandMark(0, 0, 26)}
      <text x="38" y="23" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#08251a">crescelo</text>
      
      <g transform="translate(540, -4)">
        <rect x="2.5" y="2.5" width="220" height="34" rx="17" fill="#1a1a1a"/>
        <rect width="220" height="34" rx="17" fill="#f0d7ff" stroke="#1a1a1a" stroke-width="1.8"/>
        <circle cx="18" cy="17" r="4.5" fill="#1a1a1a"/>
        <text x="32" y="22" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#1a1a1a" letter-spacing="1">01/06 • REVENUE AI</text>
      </g>
    </g>

    <g transform="translate(0, 100)">
      <text font-family="Georgia, serif" font-size="54" font-weight="bold" fill="#08251a" letter-spacing="-1.5">
        The AI assistant built
      </text>
      <text y="66" font-family="Georgia, serif" font-size="54" font-weight="bold" font-style="italic" fill="#0f6e58" letter-spacing="-1.5">
        for revenue, not talk.
      </text>
      <text y="122" font-family="'Segoe UI', Arial, sans-serif" font-size="19" font-weight="400" fill="#55554c">
        Engineered specifically for modern service businesses. Turns traffic into clients 24/7.
      </text>
    </g>

    <g transform="translate(0, 310)">
      <g transform="translate(0, 0)">
        <rect x="4" y="4" width="760" height="110" rx="18" fill="#1a1a1a"/>
        <rect width="760" height="110" rx="18" fill="#cdeee4" stroke="#1a1a1a" stroke-width="2.2"/>
        <text x="24" y="40" font-family="Georgia, serif" font-size="21" font-weight="bold" fill="#08251a">📅 Action-Driven In-Chat Booking</text>
        <text x="24" y="70" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#2f3a33">Presents open calendar slots and confirms reservations in real-time.</text>
        <text x="24" y="94" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#0f6e58">→ Converts 3.4x higher than standard FAQ widgets</text>
      </g>

      <g transform="translate(0, 134)">
        <rect x="4" y="4" width="760" height="110" rx="18" fill="#1a1a1a"/>
        <rect width="760" height="110" rx="18" fill="#f0d7ff" stroke="#1a1a1a" stroke-width="2.2"/>
        <text x="24" y="40" font-family="Georgia, serif" font-size="21" font-weight="bold" fill="#1a1a1a">⚡ 0% Token Markup (BYOK)</text>
        <text x="24" y="70" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#2f3a33">Bring Your Own Key (Gemini, Groq, OpenAI). Pay wholesale rates.</text>
        <text x="24" y="94" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#1a1a1a">→ Eliminates 800% reseller SaaS tax</text>
      </g>

      <g transform="translate(0, 268)">
        <rect x="4" y="4" width="760" height="110" rx="18" fill="#1a1a1a"/>
        <rect width="760" height="110" rx="18" fill="#d9f7ab" stroke="#1a1a1a" stroke-width="2.2"/>
        <text x="24" y="40" font-family="Georgia, serif" font-size="21" font-weight="bold" fill="#08251a">🛡️ 100% Policy Grounded Guarantee</text>
        <text x="24" y="70" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#2f3a33">Zero hallucinations. Meaning search (vectors) + exact keyword match.</text>
        <text x="24" y="94" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#0f6e58">→ Reliable answers straight from your uploaded documents</text>
      </g>
    </g>

    ${getStickerStarburst({ x: 740, y: 70, textTop: '★ 24/7 ★', textBottom: 'AUTONOMOUS', bg: '#ffa946', size: 140, rotation: -8 })}
    ${getStickerSmiley({ x: 770, y: 460, label: '100% GROUNDED', bg: '#ffd6f6', rotation: 8, size: 110 })}
    ${getCursor({ x: 580, y: 690, label: '⚡ crescelo_bot', color: '#abff44', rotation: -16, scale: 1.15 })}

    <g transform="translate(0, 890)">
      <line x1="0" y1="0" x2="880" y2="0" stroke="#1a1a1a" stroke-width="1.8"/>
      <text x="0" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="900" fill="#1a1a1a">www.crescelo.com</text>
      <text x="180" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="15" fill="#55554c">• AI Assistant for Service Businesses</text>
      <text x="880" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#0f6e58" text-anchor="end">Part 1 of 6</text>
    </g>
  </g>

  <!-- ============================================================== -->
  <!-- TILE 2 CONTENT: LIVE CONVERSATION SIMULATION (Top-Center)       -->
  <!-- ============================================================== -->
  <g transform="translate(1150, 64)">
    <g transform="translate(0, 0)">
      <circle cx="12" cy="14" r="7" fill="#ff6c4c" stroke="#1a1a1a" stroke-width="1.8"/>
      <circle cx="34" cy="14" r="7" fill="#ffa946" stroke="#1a1a1a" stroke-width="1.8"/>
      <circle cx="56" cy="14" r="7" fill="#abff44" stroke="#1a1a1a" stroke-width="1.8"/>
      
      <g transform="translate(160, -4)">
        <rect x="2" y="2" width="460" height="36" rx="12" fill="#1a1a1a"/>
        <rect width="460" height="36" rx="12" fill="#fffdf6" stroke="#1a1a1a" stroke-width="1.8"/>
        <circle cx="20" cy="18" r="5" fill="#abff44" stroke="#1a1a1a" stroke-width="1.5"/>
        <text x="36" y="23" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#1a1a1a">apex-consulting.com • Live Assistant</text>
      </g>

      <g transform="translate(680, -4)">
        <rect x="2.5" y="2.5" width="220" height="34" rx="17" fill="#1a1a1a"/>
        <rect width="220" height="34" rx="17" fill="#ffd6f6" stroke="#1a1a1a" stroke-width="1.8"/>
        <circle cx="18" cy="17" r="4.5" fill="#1a1a1a"/>
        <text x="32" y="22" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#1a1a1a" letter-spacing="1">02/06 • OMNICHANNEL</text>
      </g>
    </g>

    <line x1="-20" y1="56" x2="920" y2="56" stroke="#1a1a1a" stroke-width="1.8"/>

    <g transform="translate(0, 80)">
      <g transform="translate(180, 0)">
        <rect x="3" y="3" width="700" height="76" rx="20" fill="#1a1a1a"/>
        <rect width="700" height="76" rx="20" fill="#08251a" stroke="#1a1a1a" stroke-width="2"/>
        <text x="28" y="45" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="600" fill="#fffdf6">
          "Can your AI answer questions from our price list &amp; book meetings?"
        </text>
        <text x="635" y="22" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="700" fill="#abff44">2:14 AM</text>
      </g>

      <g transform="translate(0, 104)">
        <g transform="translate(0, 6)">
          ${getBrandMark(0, 0, 34)}
        </g>
        <g transform="translate(56, 0)">
          <rect x="3" y="3" width="740" height="96" rx="20" fill="#1a1a1a"/>
          <rect width="740" height="96" rx="20" fill="#e8fbf3" stroke="#1a1a1a" stroke-width="2"/>
          <text x="24" y="36" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="600" fill="#08251a">
            "Yes! I ingest your PDFs, CSV spreadsheets, and website docs."
          </text>
          <text x="24" y="62" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" fill="#0f6e58">
            I answer pricing questions accurately and book qualified clients live:
          </text>
        </g>
      </g>

      <!-- 3 Channels Banner Row -->
      <g transform="translate(56, 230)">
        <g transform="translate(0, 0)">
          <rect x="3" y="3" width="230" height="100" rx="16" fill="#1a1a1a"/>
          <rect width="230" height="100" rx="16" fill="#cdeee4" stroke="#1a1a1a" stroke-width="2"/>
          <text x="20" y="38" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#08251a">🌐 Website</text>
          <text x="20" y="66" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#2f3a33">Shadow DOM widget</text>
          <text x="20" y="86" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#0f6e58">✓ Real-time SSE</text>
        </g>

        <g transform="translate(250, 0)">
          <rect x="3" y="3" width="230" height="100" rx="16" fill="#1a1a1a"/>
          <rect width="230" height="100" rx="16" fill="#d9f7ab" stroke="#1a1a1a" stroke-width="2"/>
          <text x="20" y="38" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#08251a">📱 WhatsApp</text>
          <text x="20" y="66" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#2f3a33">Official Meta Cloud</text>
          <text x="20" y="86" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#0f6e58">✓ 24/7 lead reply</text>
        </g>

        <g transform="translate(500, 0)">
          <rect x="3" y="3" width="230" height="100" rx="16" fill="#1a1a1a"/>
          <rect width="230" height="100" rx="16" fill="#ffd6f6" stroke="#1a1a1a" stroke-width="2"/>
          <text x="20" y="38" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#08251a">✈️ Telegram</text>
          <text x="20" y="66" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#2f3a33">1-Click gateway</text>
          <text x="20" y="86" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#0f6e58">✓ Community sync</text>
        </g>
      </g>

      <!-- Subcard: Central Brain Sync -->
      <g transform="translate(56, 360)">
        <rect x="4" y="4" width="730" height="150" rx="20" fill="#1a1a1a"/>
        <rect width="730" height="150" rx="20" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2.2"/>
        <g transform="translate(28, 28)">
          <text font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#08251a">One Centralized Operator Console</text>
          <text y="38" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="600" fill="#55554c">
            All conversations from Web, WhatsApp, and Telegram feed into one live inbox.
          </text>
          <text y="68" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#0f6e58">
            ✓ Your staff can step in and take over any thread in 1 click with sound alerts.
          </text>
        </g>
      </g>

      <!-- User Cursors (Cleanly positioned without covering reply text) -->
      ${getCursor({ x: 560, y: 38, label: 'Visitor #4829', color: '#ffa946', rotation: -12, scale: 1.15 })}
      ${getCursor({ x: 620, y: 460, label: '⚡ crescelo_ai', color: '#abff44', rotation: -18, scale: 1.2 })}
    </g>

    <g transform="translate(0, 890)">
      <line x1="0" y1="0" x2="880" y2="0" stroke="#1a1a1a" stroke-width="1.8"/>
      <text x="0" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="900" fill="#1a1a1a">www.crescelo.com</text>
      <text x="180" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="15" fill="#55554c">• Omnichannel AI Core</text>
      <text x="880" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#0f6e58" text-anchor="end">Part 2 of 6</text>
    </g>
  </g>

  <!-- ============================================================== -->
  <!-- TILE 3 CONTENT: PERFORMANCE BENTO METRICS (Top-Right)           -->
  <!-- ============================================================== -->
  <g transform="translate(2230, 64)">
    <g transform="translate(0, 0)">
      ${getStickerWavy({ x: 0, y: -6, text1: '⚡ 0% TOKEN MARKUP', text2: 'BYOK AT COST', bg: '#abff44', rotation: 4, size: 200 })}
      ${getStickerPeel({ x: 380, y: 0, text: '🚀 60s TO LIVE', bg: '#ffd6f6', rotation: -5 })}

      <g transform="translate(680, -4)">
        <rect x="2.5" y="2.5" width="220" height="34" rx="17" fill="#1a1a1a"/>
        <rect width="220" height="34" rx="17" fill="#cdeee4" stroke="#1a1a1a" stroke-width="1.8"/>
        <circle cx="18" cy="17" r="4.5" fill="#1a1a1a"/>
        <text x="32" y="22" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#1a1a1a" letter-spacing="1">03/06 • METRICS</text>
      </g>
    </g>

    <g transform="translate(0, 110)">
      <g transform="translate(0, 0)">
        <rect x="4" y="4" width="430" height="190" rx="22" fill="#1a1a1a"/>
        <rect width="430" height="190" rx="22" fill="#ffe0b0" stroke="#1a1a1a" stroke-width="2.5"/>
        <text x="30" y="68" font-family="Georgia, serif" font-size="54" font-weight="bold" fill="#08251a">3.4x</text>
        <text x="30" y="112" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#08251a">Higher Booking Rate</text>
        <text x="30" y="142" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="600" fill="#55554c">vs. traditional contact forms &amp; FAQ bots</text>
      </g>

      <g transform="translate(460, 0)">
        <rect x="4" y="4" width="440" height="190" rx="22" fill="#1a1a1a"/>
        <rect width="440" height="190" rx="22" fill="#d3f1f0" stroke="#1a1a1a" stroke-width="2.5"/>
        <text x="30" y="68" font-family="Georgia, serif" font-size="54" font-weight="bold" fill="#08251a">&lt; 15s</text>
        <text x="30" y="112" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#08251a">VIP Live Team Takeover</text>
        <text x="30" y="142" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="600" fill="#55554c">Sound chime alerts &amp; full transcript sync</text>
      </g>
    </g>

    <!-- Additional feature box -->
    <g transform="translate(0, 330)">
      <rect x="4" y="4" width="900" height="200" rx="22" fill="#1a1a1a"/>
      <rect width="900" height="200" rx="22" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2.5"/>
      <g transform="translate(32, 34)">
        <text font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#08251a">Human + Autonomous Synergy</text>
        <text y="42" font-family="'Segoe UI', Arial, sans-serif" font-size="15" fill="#55554c">
          The AI effortlessly handles 78% of routine questions, hours, and booking requests.
        </text>
        <text y="70" font-family="'Segoe UI', Arial, sans-serif" font-size="15" fill="#55554c">
          When an enterprise VIP arrives, your team takes over without missing a beat.
        </text>
        <text y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#0f6e58">
          ✓ No lost context • No robotic dead-ends • No frustrated clients
        </text>
      </g>
    </g>

    ${getCursor({ x: 540, y: 560, label: 'Enterprise Ready', color: '#ffd6f6', rotation: -12, scale: 1.15 })}

    <g transform="translate(0, 890)">
      <line x1="0" y1="0" x2="900" y2="0" stroke="#1a1a1a" stroke-width="1.8"/>
      <text x="0" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="900" fill="#1a1a1a">www.crescelo.com</text>
      <text x="180" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="15" fill="#55554c">• Conversion &amp; Handover</text>
      <text x="900" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#0f6e58" text-anchor="end">Part 3 of 6</text>
    </g>
  </g>

  <!-- ============================================================== -->
  <!-- TILE 4 CONTENT: KNOWLEDGE RAG INGESTION (Bottom-Left)           -->
  <!-- ============================================================== -->
  <g transform="translate(70, 1144)">
    <g transform="translate(0, 0)">
      <rect x="2.5" y="2.5" width="220" height="34" rx="17" fill="#1a1a1a"/>
      <rect width="220" height="34" rx="17" fill="#d9f7ab" stroke="#1a1a1a" stroke-width="2"/>
      <text x="110" y="22" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="900" fill="#08251a" text-anchor="middle" letter-spacing="1">HYBRID RAG BRAIN</text>

      <g transform="translate(540, -4)">
        <rect x="2.5" y="2.5" width="220" height="34" rx="17" fill="#1a1a1a"/>
        <rect width="220" height="34" rx="17" fill="#ffe0b0" stroke="#1a1a1a" stroke-width="1.8"/>
        <circle cx="18" cy="17" r="4.5" fill="#1a1a1a"/>
        <text x="32" y="22" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#1a1a1a" letter-spacing="1">04/06 • KNOWLEDGE</text>
      </g>
    </g>

    <g transform="translate(0, 70)">
      <text font-family="Georgia, serif" font-size="46" font-weight="bold" fill="#08251a">
        Train on your files
      </text>
      <text y="58" font-family="Georgia, serif" font-size="46" font-weight="bold" font-style="italic" fill="#0f6e58">
        in under 60 seconds.
      </text>
      <text y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="400" fill="#55554c">
        PDFs, CSV spreadsheets, JSON schemas, and live website URLs.
      </text>
    </g>

    <!-- 4 Format cards -->
    <g transform="translate(0, 200)">
      <g transform="translate(0, 0)">
        <rect x="3" y="3" width="760" height="80" rx="16" fill="#1a1a1a"/>
        <rect width="760" height="80" rx="16" fill="#f0d7ff" stroke="#1a1a1a" stroke-width="2"/>
        <text x="24" y="36" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#1a1a1a">📄 PDF &amp; Word Documents</text>
        <text x="24" y="60" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">Heading-aware hierarchy &amp; sliding token window extraction</text>
      </g>
      <g transform="translate(0, 96)">
        <rect x="3" y="3" width="760" height="80" rx="16" fill="#1a1a1a"/>
        <rect width="760" height="80" rx="16" fill="#cdeee4" stroke="#1a1a1a" stroke-width="2"/>
        <text x="24" y="36" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#1a1a1a">📊 CSV Spreadsheets &amp; Price Lists</text>
        <text x="24" y="60" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">Row-aware semantic parsing preserving pricing &amp; SKU context</text>
      </g>
      <g transform="translate(0, 192)">
        <rect x="3" y="3" width="760" height="80" rx="16" fill="#1a1a1a"/>
        <rect width="760" height="80" rx="16" fill="#ffd6f6" stroke="#1a1a1a" stroke-width="2"/>
        <text x="24" y="36" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#1a1a1a">⚡ JSON Schemas &amp; APIs</text>
        <text x="24" y="60" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">Hierarchical key flattening for databases and live queries</text>
      </g>
      <g transform="translate(0, 288)">
        <rect x="3" y="3" width="760" height="80" rx="16" fill="#1a1a1a"/>
        <rect width="760" height="80" rx="16" fill="#d9f7ab" stroke="#1a1a1a" stroke-width="2"/>
        <text x="24" y="36" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#1a1a1a">🌐 Live Websites &amp; YouTube</text>
        <text x="24" y="60" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">Automatic sitemap crawling &amp; video transcript indexing</text>
      </g>
    </g>

    <!-- Guarantee Box -->
    <g transform="translate(0, 600)">
      <rect x="4" y="4" width="760" height="120" rx="18" fill="#1a1a1a"/>
      <rect width="760" height="120" rx="18" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2"/>
      <g transform="translate(24, 28)">
        <text font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#08251a">Zero-Hallucination Guardrail</text>
        <text y="38" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#55554c">Meaning search (dense vectors) + exact keyword match (BM25).</text>
        <text y="66" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#0f6e58">100% Policy Grounded Guarantee: No made-up answers.</text>
      </g>
    </g>

    <g transform="translate(0, 890)">
      <line x1="0" y1="0" x2="880" y2="0" stroke="#1a1a1a" stroke-width="1.8"/>
      <text x="0" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="900" fill="#1a1a1a">www.crescelo.com</text>
      <text x="180" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="15" fill="#55554c">• 60-Second Knowledge Ingestion</text>
      <text x="880" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#0f6e58" text-anchor="end">Part 4 of 6</text>
    </g>
  </g>

  <!-- ============================================================== -->
  <!-- TILE 5 CONTENT: MUTEX CALENDAR BOOKING (Bottom-Center)          -->
  <!-- ============================================================== -->
  <g transform="translate(1150, 1144)">
    <g transform="translate(0, 0)">
      <rect x="2.5" y="2.5" width="260" height="34" rx="17" fill="#1a1a1a"/>
      <rect width="260" height="34" rx="17" fill="#cdeee4" stroke="#1a1a1a" stroke-width="2"/>
      <text x="130" y="22" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="900" fill="#08251a" text-anchor="middle" letter-spacing="1">ZERO DOUBLE-BOOKINGS</text>

      <g transform="translate(680, -4)">
        <rect x="2.5" y="2.5" width="220" height="34" rx="17" fill="#1a1a1a"/>
        <rect width="220" height="34" rx="17" fill="#ffd6f6" stroke="#1a1a1a" stroke-width="1.8"/>
        <circle cx="18" cy="17" r="4.5" fill="#1a1a1a"/>
        <text x="32" y="22" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#1a1a1a" letter-spacing="1">05/06 • CONCURRENCY</text>
      </g>
    </g>

    <g transform="translate(0, 70)">
      <text font-family="Georgia, serif" font-size="46" font-weight="bold" fill="#08251a">
        Concurrency Mutex Tech.
      </text>
      <text y="58" font-family="Georgia, serif" font-size="46" font-weight="bold" font-style="italic" fill="#0f6e58">
        Never double-book a client.
      </text>
      <text y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="400" fill="#55554c">
        In-memory temporal locks guarantee two visitors never claim the same slot.
      </text>
    </g>

    <!-- Slot Picker -->
    <g transform="translate(0, 200)">
      <rect x="4" y="4" width="880" height="480" rx="24" fill="#1a1a1a"/>
      <rect width="880" height="480" rx="24" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2.5"/>

      <g transform="translate(36, 32)">
        <text font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#08251a">Live Calendar Opening (Synced Across Team):</text>
        
        <g transform="translate(0, 36)">
          <g transform="translate(0, 0)">
            <rect x="3" y="3" width="250" height="84" rx="16" fill="#1a1a1a"/>
            <rect width="250" height="84" rx="16" fill="#f0d7ff" stroke="#1a1a1a" stroke-width="2"/>
            <text x="18" y="36" font-family="Georgia, serif" font-size="17" font-weight="bold" fill="#1a1a1a">Friday, Oct 2</text>
            <text x="18" y="62" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="700" fill="#0f6e58">9:30 AM EST</text>
          </g>

          <g transform="translate(275, 0)">
            <rect x="4" y="4" width="260" height="84" rx="16" fill="#1a1a1a"/>
            <rect width="260" height="84" rx="16" fill="#abff44" stroke="#1a1a1a" stroke-width="2.5"/>
            <text x="18" y="36" font-family="Georgia, serif" font-size="17" font-weight="bold" fill="#08251a">Friday, Oct 2</text>
            <text x="18" y="62" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="900" fill="#08251a">1:00 PM EST  ✓</text>
            ${getClickRipple(230, 42, 'CLICK!')}
          </g>

          <g transform="translate(560, 0)">
            <rect x="3" y="3" width="245" height="84" rx="16" fill="#1a1a1a"/>
            <rect width="245" height="84" rx="16" fill="#cdeee4" stroke="#1a1a1a" stroke-width="2"/>
            <text x="18" y="36" font-family="Georgia, serif" font-size="17" font-weight="bold" fill="#1a1a1a">Friday, Oct 2</text>
            <text x="18" y="62" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="700" fill="#0f6e58">4:15 PM EST</text>
          </g>
        </g>
      </g>

      <!-- Confirmed Box -->
      <g transform="translate(36, 180)">
        <rect x="4" y="4" width="808" height="150" rx="18" fill="#1a1a1a"/>
        <rect width="808" height="150" rx="18" fill="#d9f7ab" stroke="#1a1a1a" stroke-width="2.2"/>
        <g transform="translate(28, 28)">
          <text font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#08251a">Strategy Consultation Confirmed</text>
          <text y="40" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="600" fill="#2f3a33">
            Friday, Oct 2 at 1:00 PM EST • In-Memory Lock Acquired in 4ms
          </text>
          <text y="68" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#0f6e58">
            ✓ Google Calendar, Outlook, and iCal updated instantly • No double-booking guarantee
          </text>
        </g>
      </g>

      <!-- User Cursors (Cleanly positioned above slot button) -->
      ${getCursor({ x: 340, y: 16, label: 'Visitor Booking', color: '#ffa946', rotation: -12, scale: 1.15 })}
    </g>

    <g transform="translate(0, 890)">
      <line x1="0" y1="0" x2="880" y2="0" stroke="#1a1a1a" stroke-width="1.8"/>
      <text x="0" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="900" fill="#1a1a1a">www.crescelo.com</text>
      <text x="180" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="15" fill="#55554c">• Concurrency Mutex Technology</text>
      <text x="880" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#0f6e58" text-anchor="end">Part 5 of 6</text>
    </g>
  </g>

  <!-- ============================================================== -->
  <!-- TILE 6 CONTENT: 1-LINE CODE & FINAL MASSIVE CTA (Bottom-Right)  -->
  <!-- ============================================================== -->
  <g transform="translate(2230, 1144)">
    <g transform="translate(0, 0)">
      <rect x="2.5" y="2.5" width="220" height="34" rx="17" fill="#1a1a1a"/>
      <rect width="220" height="34" rx="17" fill="#ffd6f6" stroke="#1a1a1a" stroke-width="2"/>
      <text x="110" y="22" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="900" fill="#08251a" text-anchor="middle" letter-spacing="1">1 LINE OF CODE</text>

      <g transform="translate(680, -4)">
        <rect x="2.5" y="2.5" width="220" height="34" rx="17" fill="#1a1a1a"/>
        <rect width="220" height="34" rx="17" fill="#d9f7ab" stroke="#1a1a1a" stroke-width="1.8"/>
        <circle cx="18" cy="17" r="4.5" fill="#1a1a1a"/>
        <text x="32" y="22" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#1a1a1a" letter-spacing="1">06/06 • LAUNCH</text>
      </g>
    </g>

    <g transform="translate(0, 70)">
      <text font-family="Georgia, serif" font-size="46" font-weight="bold" fill="#08251a">
        60 Seconds to Live.
      </text>
      <text y="58" font-family="Georgia, serif" font-size="46" font-weight="bold" font-style="italic" fill="#0f6e58">
        Start converting today.
      </text>
      <text y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="400" fill="#55554c">
        Paste onto any website. Compatible with WordPress, Shopify, Webflow, Framer.
      </text>
    </g>

    <g transform="translate(0, 200)">
      <rect x="4" y="4" width="900" height="170" rx="22" fill="#1a1a1a"/>
      <rect width="900" height="170" rx="22" fill="#08251a" stroke="#1a1a1a" stroke-width="2.5"/>
      <g transform="translate(28, 24)">
        <circle cx="8" cy="8" r="5" fill="#ff6c4c"/>
        <circle cx="24" cy="8" r="5" fill="#ffa946"/>
        <circle cx="40" cy="8" r="5" fill="#abff44"/>
        <text x="64" y="12" font-family="'Segoe UI', monospace" font-size="12" font-weight="bold" fill="#91dbda">embed-crescelo.html • Fast async script</text>
      </g>
      <g transform="translate(28, 72)">
        <text font-family="'Courier New', Courier, monospace" font-size="15" fill="#9a9a8a">&lt;!-- Paste before closing &lt;/body&gt; tag --&gt;</text>
        <text y="34" font-family="'Courier New', Courier, monospace" font-size="18" font-weight="bold" fill="#fffdf6">
          &lt;script <tspan fill="#abff44">src=</tspan><tspan fill="#ffa946">"https://www.crescelo.com/widget.js"</tspan> <tspan fill="#91dbda">defer</tspan>&gt;&lt;/script&gt;
        </text>
      </g>
    </g>

    <!-- Huge Final CTA Button -->
    <g transform="translate(0, 410)">
      <rect x="6" y="8" width="900" height="150" rx="28" fill="#1a1a1a"/>
      <rect width="900" height="150" rx="28" fill="#abff44" stroke="#1a1a1a" stroke-width="3.5"/>
      
      <text x="50" y="68" font-family="Georgia, serif" font-size="38" font-weight="bold" fill="#08251a">
        Deploy Your Free AI Agent →
      </text>
      <text x="50" y="112" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="800" fill="#08251a">
        www.crescelo.com  <tspan font-weight="500" fill="#12432f">• Zero Credit Card Required</tspan>
      </text>
    </g>

    ${getDoodleArrow({ x1: 760, y1: 390, x2: 780, y2: 415, label: 'Deploy now' })}
    ${getCursor({ x: 680, y: 480, label: 'Get Started Free', color: '#ffd6f6', rotation: -10, scale: 1.2 })}

    <g transform="translate(0, 890)">
      <line x1="0" y1="0" x2="900" y2="0" stroke="#1a1a1a" stroke-width="1.8"/>
      <text x="0" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="900" fill="#1a1a1a">www.crescelo.com</text>
      <text x="180" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="15" fill="#55554c">• Build Your Assistant in 60s</text>
      <text x="900" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#0f6e58" text-anchor="end">Part 6 of 6 ✓</text>
    </g>
  </g>

  <!-- ============================================================== -->
  <!-- OPTIONAL GRID SLICE GUIDELINES (FOR PREVIEW / CUT VISUALIZER)    -->
  <!-- ============================================================== -->
  ${showGridGuides ? `
    <line x1="1080" y1="0" x2="1080" y2="${H}" stroke="#6b21a8" stroke-width="6" stroke-dasharray="16 12" opacity="0.9"/>
    <line x1="2160" y1="0" x2="2160" y2="${H}" stroke="#6b21a8" stroke-width="6" stroke-dasharray="16 12" opacity="0.9"/>
    <line x1="0" y1="1080" x2="${W}" y2="1080" stroke="#6b21a8" stroke-width="6" stroke-dasharray="16 12" opacity="0.9"/>

    <g transform="translate(540, 56)">
      <rect x="-140" y="-24" width="280" height="48" rx="24" fill="#6b21a8"/>
      <text x="0" y="8" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="900" fill="#fff" text-anchor="middle">TILE 01 • UPLOAD LAST (#6)</text>
    </g>
    <g transform="translate(1620, 56)">
      <rect x="-140" y="-24" width="280" height="48" rx="24" fill="#6b21a8"/>
      <text x="0" y="8" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="900" fill="#fff" text-anchor="middle">TILE 02 • UPLOAD #5</text>
    </g>
    <g transform="translate(2700, 56)">
      <rect x="-140" y="-24" width="280" height="48" rx="24" fill="#6b21a8"/>
      <text x="0" y="8" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="900" fill="#fff" text-anchor="middle">TILE 03 • UPLOAD #4</text>
    </g>
    <g transform="translate(540, 1136)">
      <rect x="-140" y="-24" width="280" height="48" rx="24" fill="#6b21a8"/>
      <text x="0" y="8" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="900" fill="#fff" text-anchor="middle">TILE 04 • UPLOAD #3</text>
    </g>
    <g transform="translate(1620, 1136)">
      <rect x="-140" y="-24" width="280" height="48" rx="24" fill="#6b21a8"/>
      <text x="0" y="8" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="900" fill="#fff" text-anchor="middle">TILE 05 • UPLOAD #2</text>
    </g>
    <g transform="translate(2700, 1136)">
      <rect x="-140" y="-24" width="280" height="48" rx="24" fill="#6b21a8"/>
      <text x="0" y="8" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="900" fill="#fff" text-anchor="middle">TILE 06 • UPLOAD FIRST (#1)</text>
    </g>
  ` : ''}

</svg>`;
}

// -------------------------------------------------------------
// EXECUTION: BUILD & SLICE
// -------------------------------------------------------------
async function run() {
  console.log('Rendering 3-Split and 6-Split Instagram Grid Banners...');

  // 1. BUILD 3-SPLIT BANNER
  console.log('[1/4] Rendering 3-Split Banner Full (3240x1080)...');
  const svg3Clean = buildBanner3SplitSvg({ showGridGuides: false });
  const svg3Guides = buildBanner3SplitSvg({ showGridGuides: true });

  const buf3Clean = Buffer.from(svg3Clean);
  const buf3Guides = Buffer.from(svg3Guides);

  const full3Path = path.join(outDir3, 'banner-3split-full.png');
  const preview3Path = path.join(outDir3, 'banner-3split-grid-preview.png');

  await sharp(buf3Clean).png().toFile(full3Path);
  await sharp(buf3Guides).png().toFile(preview3Path);

  fs.copyFileSync(full3Path, path.join(artifactDir, 'banner-3split-full.png'));
  fs.copyFileSync(preview3Path, path.join(artifactDir, 'banner-3split-grid-preview.png'));

  // SLICE 3-SPLIT INTO 3 TILES (1080x1080 each)
  console.log('[2/4] Slicing 3-Split into 3 individual 1080x1080 posts...');
  for (let i = 0; i < 3; i++) {
    const tileName = `tile-0${i + 1}.png`;
    const tileDest = path.join(outDir3, tileName);
    await sharp(buf3Clean)
      .extract({ left: i * 1080, top: 0, width: 1080, height: 1080 })
      .png()
      .toFile(tileDest);
    fs.copyFileSync(tileDest, path.join(artifactDir, `banner-3split-${tileName}`));
    console.log(`  -> Sliced Tile 0${i + 1} (${tileName})`);
  }

  // 2. BUILD 6-SPLIT BANNER
  console.log('[3/4] Rendering 6-Split Banner Full (3240x2160)...');
  const svg6Clean = buildBanner6SplitSvg({ showGridGuides: false });
  const svg6Guides = buildBanner6SplitSvg({ showGridGuides: true });

  const buf6Clean = Buffer.from(svg6Clean);
  const buf6Guides = Buffer.from(svg6Guides);

  const full6Path = path.join(outDir6, 'banner-6split-full.png');
  const preview6Path = path.join(outDir6, 'banner-6split-grid-preview.png');

  await sharp(buf6Clean).png().toFile(full6Path);
  await sharp(buf6Guides).png().toFile(preview6Path);

  fs.copyFileSync(full6Path, path.join(artifactDir, 'banner-6split-full.png'));
  fs.copyFileSync(preview6Path, path.join(artifactDir, 'banner-6split-grid-preview.png'));

  // SLICE 6-SPLIT INTO 6 TILES (1080x1080 each)
  console.log('[4/4] Slicing 6-Split into 6 individual 1080x1080 posts...');
  const tilesConfig = [
    { row: 0, col: 0, num: 1 }, // Tile 01: Top-Left
    { row: 0, col: 1, num: 2 }, // Tile 02: Top-Center
    { row: 0, col: 2, num: 3 }, // Tile 03: Top-Right
    { row: 1, col: 0, num: 4 }, // Tile 04: Bottom-Left
    { row: 1, col: 1, num: 5 }, // Tile 05: Bottom-Center
    { row: 1, col: 2, num: 6 }, // Tile 06: Bottom-Right
  ];

  for (const t of tilesConfig) {
    const tileName = `tile-0${t.num}.png`;
    const tileDest = path.join(outDir6, tileName);
    await sharp(buf6Clean)
      .extract({ left: t.col * 1080, top: t.row * 1080, width: 1080, height: 1080 })
      .png()
      .toFile(tileDest);
    fs.copyFileSync(tileDest, path.join(artifactDir, `banner-6split-${tileName}`));
    console.log(`  -> Sliced Tile 0${t.num} (${tileName})`);
  }

  console.log('Successfully generated and sliced both 3-Split and 6-Split Instagram Grid Banners!');

  // 3. BUILD INSTAGRAM PROFILE FEED MOCKUPS
  await generateFeedMockups();
}

// Render realistic Instagram profile feed mockups showing the grid alignment
async function generateFeedMockups() {
  console.log('Generating Instagram profile feed mockups...');

  const headerSvg = `
  <svg width="1200" height="460" viewBox="0 0 1200 460" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="460" fill="#ffffff"/>
    
    <!-- Top Nav Bar -->
    <g transform="translate(40, 40)">
      <text font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="28" font-weight="800" fill="#1a1a1a">crescelo</text>
      <circle cx="140" cy="-8" r="9" fill="#0f6e58"/>
      <path d="M 136 -8 L 139 -5 L 145 -11" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
    </g>

    <!-- Profile Avatar + Stats -->
    <g transform="translate(40, 75)">
      <defs>
        <linearGradient id="ig_ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f09433"/>
          <stop offset="25%" stop-color="#e6683c"/>
          <stop offset="50%" stop-color="#dc2743"/>
          <stop offset="75%" stop-color="#cc2366"/>
          <stop offset="100%" stop-color="#bc1888"/>
        </linearGradient>
      </defs>
      <circle cx="62" cy="62" r="60" fill="none" stroke="url(#ig_ring)" stroke-width="3.5"/>
      <g transform="translate(18, 18)">
        ${getBrandMark(0, 0, 88)}
      </g>

      <!-- Stats -->
      <g transform="translate(300, 48)">
        <text x="0" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="26" font-weight="800" fill="#1a1a1a" text-anchor="middle">9</text>
        <text x="0" y="28" font-family="'Segoe UI', Arial, sans-serif" font-size="16" fill="#737373" text-anchor="middle">posts</text>

        <text x="180" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="26" font-weight="800" fill="#1a1a1a" text-anchor="middle">2,840</text>
        <text x="180" y="28" font-family="'Segoe UI', Arial, sans-serif" font-size="16" fill="#737373" text-anchor="middle">followers</text>

        <text x="360" y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="26" font-weight="800" fill="#1a1a1a" text-anchor="middle">24</text>
        <text x="360" y="28" font-family="'Segoe UI', Arial, sans-serif" font-size="16" fill="#737373" text-anchor="middle">following</text>
      </g>
    </g>

    <!-- Bio Section -->
    <g transform="translate(40, 230)">
      <text font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="800" fill="#1a1a1a">Crescelo • AI Website Assistant</text>
      <text y="26" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="600" fill="#737373">Software Company</text>
      <text y="52" font-family="'Segoe UI', Arial, sans-serif" font-size="16" fill="#262626">Turn website traffic into booked revenue 24/7 🚀</text>
      <text y="76" font-family="'Segoe UI', Arial, sans-serif" font-size="16" fill="#262626">⚡ 0% Token Markup • In-chat live calendar booking • Zero double-booking</text>
      <text y="100" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="700" fill="#00376b">🔗 www.crescelo.com</text>
    </g>

    <!-- Profile Action Buttons -->
    <g transform="translate(40, 350)">
      <rect width="350" height="40" rx="8" fill="#efefef"/>
      <text x="175" y="26" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" fill="#000" text-anchor="middle">Following</text>

      <rect x="366" width="350" height="40" rx="8" fill="#efefef"/>
      <text x="541" y="26" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" fill="#000" text-anchor="middle">Message</text>

      <rect x="732" width="388" height="40" rx="8" fill="#efefef"/>
      <text x="926" y="26" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" fill="#000" text-anchor="middle">Contact</text>
    </g>

    <!-- Grid Tabs -->
    <g transform="translate(0, 414)">
      <line x1="0" y1="0" x2="1200" y2="0" stroke="#dbdbdb" stroke-width="1"/>
      <line x1="40" y1="44" x2="400" y2="44" stroke="#000000" stroke-width="2.5"/>
      
      <text x="220" y="30" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="800" fill="#000" text-anchor="middle">▦ POSTS</text>
      <text x="600" y="30" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="600" fill="#737373" text-anchor="middle">▷ REELS</text>
      <text x="980" y="30" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="600" fill="#737373" text-anchor="middle">🏷️ TAGGED</text>
    </g>
  </svg>`;

  const headerBuf = await sharp(Buffer.from(headerSvg)).png().toBuffer();

  const tileSize = 396;
  const colX = [2, 402, 802];
  const startY = 460;

  // 1. MOCKUP FOR 3-SPLIT BANNER
  const t1 = await sharp(path.join(outDir3, 'tile-01.png')).resize(tileSize, tileSize).toBuffer();
  const t2 = await sharp(path.join(outDir3, 'tile-02.png')).resize(tileSize, tileSize).toBuffer();
  const t3 = await sharp(path.join(outDir3, 'tile-03.png')).resize(tileSize, tileSize).toBuffer();
  
  const p1 = await sharp('public/instagram/post-01-pricing-tax.png').resize(tileSize, tileSize).toBuffer();
  const p2 = await sharp('public/instagram/post-02-night-owl-leads.png').resize(tileSize, tileSize).toBuffer();
  const p3 = await sharp('public/instagram/post-03-why-chatbots-fail.png').resize(tileSize, tileSize).toBuffer();

  const totalHeight3 = startY + (tileSize + 4) * 2;
  const canvas3 = await sharp({
    create: { width: 1200, height: totalHeight3, channels: 4, background: '#ffffff' }
  }).png().toBuffer();

  await sharp(canvas3)
    .composite([
      { input: headerBuf, top: 0, left: 0 },
      { input: t1, top: startY, left: colX[0] },
      { input: t2, top: startY, left: colX[1] },
      { input: t3, top: startY, left: colX[2] },
      { input: p1, top: startY + tileSize + 4, left: colX[0] },
      { input: p2, top: startY + tileSize + 4, left: colX[1] },
      { input: p3, top: startY + tileSize + 4, left: colX[2] },
    ])
    .png()
    .toFile(path.join(outDir3, 'feed-grid-mockup-3split.png'));

  fs.copyFileSync(path.join(outDir3, 'feed-grid-mockup-3split.png'), path.join(artifactDir, 'feed-grid-mockup-3split.png'));
  console.log('Saved 3-split feed grid mockup!');

  // 2. MOCKUP FOR 6-SPLIT BANNER
  const s1 = await sharp(path.join(outDir6, 'tile-01.png')).resize(tileSize, tileSize).toBuffer();
  const s2 = await sharp(path.join(outDir6, 'tile-02.png')).resize(tileSize, tileSize).toBuffer();
  const s3 = await sharp(path.join(outDir6, 'tile-03.png')).resize(tileSize, tileSize).toBuffer();
  const s4 = await sharp(path.join(outDir6, 'tile-04.png')).resize(tileSize, tileSize).toBuffer();
  const s5 = await sharp(path.join(outDir6, 'tile-05.png')).resize(tileSize, tileSize).toBuffer();
  const s6 = await sharp(path.join(outDir6, 'tile-06.png')).resize(tileSize, tileSize).toBuffer();

  const totalHeight6 = startY + (tileSize + 4) * 2;
  const canvas6 = await sharp({
    create: { width: 1200, height: totalHeight6, channels: 4, background: '#ffffff' }
  }).png().toBuffer();

  await sharp(canvas6)
    .composite([
      { input: headerBuf, top: 0, left: 0 },
      { input: s1, top: startY, left: colX[0] },
      { input: s2, top: startY, left: colX[1] },
      { input: s3, top: startY, left: colX[2] },
      { input: s4, top: startY + tileSize + 4, left: colX[0] },
      { input: s5, top: startY + tileSize + 4, left: colX[1] },
      { input: s6, top: startY + tileSize + 4, left: colX[2] },
    ])
    .png()
    .toFile(path.join(outDir6, 'feed-grid-mockup-6split.png'));

  fs.copyFileSync(path.join(outDir6, 'feed-grid-mockup-6split.png'), path.join(artifactDir, 'feed-grid-mockup-6split.png'));
  console.log('Saved 6-split feed grid mockup!');
}

run().catch(err => {
  console.error('Error generating banners:', err);
  process.exit(1);
});
