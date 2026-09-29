import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/instagram');
const artifactDir = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\7557de85-1f77-4787-bb49-5bfd907d5e43';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Brand SVG Mark Icon (scalable)
function getBrandMark(x, y, size = 24) {
  const scale = size / 100;
  return `
  <g transform="translate(${x}, ${y}) scale(${scale})">
    <defs>
      <linearGradient id="mark_t_${x}_${y}_${size}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#12432f"/>
        <stop offset="100%" stop-color="#04140d"/>
      </linearGradient>
      <linearGradient id="mark_c_${x}_${y}_${size}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f1ffc9"/>
        <stop offset="45%" stop-color="#abff44"/>
        <stop offset="100%" stop-color="#74d321"/>
      </linearGradient>
      <clipPath id="mark_clip_${x}_${y}_${size}">
        <rect x="0" y="0" width="100" height="100" rx="26" />
      </clipPath>
    </defs>
    <!-- Subtle shadow for the logo -->
    <rect x="2" y="2" width="100" height="100" rx="26" fill="#1a1a1a"/>
    <rect width="100" height="100" rx="26" fill="url(#mark_t_${x}_${y}_${size})" stroke="#1a1a1a" stroke-width="2"/>
    <g clip-path="url(#mark_clip_${x}_${y}_${size})">
      <circle cx="50" cy="50" r="38" fill="#abff44" opacity="0.16" />
      <path d="M69.9 33.3 A26 26 0 1 0 69.9 66.7" fill="none" stroke="url(#mark_c_${x}_${y}_${size})" stroke-width="14" stroke-linecap="round"/>
      <circle cx="63" cy="50" r="5.6" fill="url(#mark_c_${x}_${y}_${size})"/>
    </g>
    <rect x="1" y="1" width="98" height="98" rx="25" fill="none" stroke="#abff44" stroke-opacity="0.38" stroke-width="2"/>
  </g>`;
}

// Crisp neo-brutalist vector icons with black outlines
const ICONS = {
  check: (x, y, bg = '#abff44', size = 26) => `
    <g transform="translate(${x}, ${y})">
      <circle cx="${size/2 + 2}" cy="${size/2 + 2}" r="${size/2}" fill="#1a1a1a"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${bg}" stroke="#1a1a1a" stroke-width="1.8"/>
      <path d="M ${size*0.28} ${size*0.5} L ${size*0.44} ${size*0.68} L ${size*0.74} ${size*0.32}" fill="none" stroke="#1a1a1a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`,
  cross: (x, y, bg = '#ff6c4c', size = 26) => `
    <g transform="translate(${x}, ${y})">
      <circle cx="${size/2 + 2}" cy="${size/2 + 2}" r="${size/2}" fill="#1a1a1a"/>
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${bg}" stroke="#1a1a1a" stroke-width="1.8"/>
      <path d="M ${size*0.32} ${size*0.32} L ${size*0.68} ${size*0.68} M ${size*0.68} ${size*0.32} L ${size*0.32} ${size*0.68}" fill="none" stroke="#1a1a1a" stroke-width="2.4" stroke-linecap="round"/>
    </g>`,
  sparkle: (x, y, color = '#ffa946', size = 28) => `
    <g transform="translate(${x}, ${y})">
      <path d="M ${size*0.5} 0 Q ${size*0.5} ${size*0.5} ${size} ${size*0.5} Q ${size*0.5} ${size*0.5} ${size*0.5} ${size} Q ${size*0.5} ${size*0.5} 0 ${size*0.5} Q ${size*0.5} ${size*0.5} ${size*0.5} 0 Z" fill="${color}" stroke="#1a1a1a" stroke-width="1.5"/>
    </g>`,
};

// Playful Neo-Brutalist Frame
function createPlayfulFrame({
  index = '01/09',
  pillText = 'THE TOOLKIT',
  pillTone = '#f0d7ff', // pastel lavender
  hookMain = 'Stop paying an 800%',
  hookEmphasis = 'AI token tax.',
  subtitle = 'Why pay bloated reseller margins when you can access raw wholesale intelligence?',
  contentSvg = '',
  ctaText = "Let's explore",
  ctaTone = '#abff44', // vibrant lime
}) {
  return `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Conic Rainbow Border Gradient (matching the marketing prompt box) -->
    <linearGradient id="rainbow_grad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ff6c4c"/>
      <stop offset="20%" stop-color="#ffa946"/>
      <stop offset="40%" stop-color="#abff44"/>
      <stop offset="60%" stop-color="#1c9c81"/>
      <stop offset="80%" stop-color="#91dbda"/>
      <stop offset="100%" stop-color="#f0d7ff"/>
    </linearGradient>

    <!-- Subtle friendly dots pattern -->
    <pattern id="playful_dots" width="32" height="32" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.5" fill="#1a1a1a" fill-opacity="0.04" />
    </pattern>
  </defs>

  <!-- Warm Cream Base Background -->
  <rect width="1080" height="1080" fill="#fffeeb"/>
  <rect width="1080" height="1080" fill="url(#playful_dots)"/>

  <!-- Playful Decorative Corner Badges / Blobs -->
  <circle cx="1020" cy="60" r="120" fill="#f0d7ff" fill-opacity="0.45"/>
  <circle cx="40" cy="1020" r="100" fill="#cdeee4" fill-opacity="0.45"/>

  <!-- Chunky Outer Frame with offset shadow -->
  <rect x="36" y="36" width="1012" height="1012" rx="36" fill="#1a1a1a"/>
  <rect x="30" y="30" width="1012" height="1012" rx="36" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2.5"/>

  <!-- HEADER (Compact & Small Logo, Sits High at y=54, generous space to heading) -->
  <g transform="translate(68, 54)">
    <!-- Small subtle 22px mark -->
    <g transform="translate(0, 2)">
      ${getBrandMark(0, 0, 22)}
    </g>
    <!-- Sleek brand name -->
    <text x="32" y="19" font-family="Georgia, 'Times New Roman', serif" font-size="21" font-weight="bold" fill="#08251a" letter-spacing="-0.3">crescelo</text>

    <!-- Category Pill with chunky shadow -->
    <g transform="translate(640, 0)">
      <rect x="2.5" y="2.5" width="290" height="34" rx="17" fill="#1a1a1a"/>
      <rect width="290" height="34" rx="17" fill="${pillTone}" stroke="#1a1a1a" stroke-width="1.8"/>
      <circle cx="18" cy="17" r="4" fill="#1a1a1a"/>
      <text x="32" y="22" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="12" font-weight="800" fill="#1a1a1a" letter-spacing="1.1">${index} • ${pillText}</text>
    </g>
  </g>

  <!-- HEADLINE / HOOK (Moved down to y=174 for generous 60px+ breathing room) -->
  <g transform="translate(68, 174)">
    <text font-family="Georgia, 'Times New Roman', serif" font-size="48" font-weight="normal" fill="#1a1a1a" letter-spacing="-1">
      ${hookMain}
    </text>
    <text y="56" font-family="Georgia, 'Times New Roman', serif" font-size="48" font-weight="normal" font-style="italic" fill="#0f6e58" letter-spacing="-1">
      ${hookEmphasis}
    </text>
    <text y="104" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="19" font-weight="400" fill="#55554c">
      ${subtitle}
    </text>
  </g>

  <!-- CENTER VISUAL CONTENT -->
  <g transform="translate(68, 310)">
    ${contentSvg}
  </g>

  <!-- FOOTER (www.crescelo.com) -->
  <g transform="translate(68, 978)">
    <line x1="0" y1="0" x2="944" y2="0" stroke="#1a1a1a" stroke-width="1.8"/>

    <!-- Left: Website URL (No @crescelo.ai) -->
    <text x="0" y="34" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="16" font-weight="800" fill="#1a1a1a">www.crescelo.com</text>
    <text x="175" y="34" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="14" font-weight="400" fill="#9a9a8a">•</text>
    <text x="195" y="34" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="15" font-weight="600" fill="#55554c">AI website assistant for service businesses</text>

    <!-- Right: Chunky button -->
    <g transform="translate(680, 10)">
      <rect x="3" y="3" width="264" height="38" rx="12" fill="#1a1a1a"/>
      <rect width="264" height="38" rx="12" fill="${ctaTone}" stroke="#1a1a1a" stroke-width="1.8"/>
      <text x="132" y="24" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="14" font-weight="800" fill="#08251a" text-anchor="middle" letter-spacing="0.3">${ctaText} →</text>
    </g>
  </g>
</svg>`;
}

// POST 1: Stop Paying 800% AI Token Tax (Lavender #f0d7ff card)
function getPost1Svg() {
  return createPlayfulFrame({
    index: '01/09',
    pillText: 'THE TOOLKIT',
    pillTone: '#f0d7ff',
    hookMain: 'Stop paying an 800%',
    hookEmphasis: 'AI token markup tax.',
    subtitle: 'Why pay bloated reseller margins when you can access raw wholesale intelligence?',
    ctaText: 'See the math',
    ctaTone: '#abff44',
    contentSvg: `
      <!-- Main Card Container: Lavender Tone (#f0d7ff) with chunky shadow -->
      <rect x="6" y="6" width="944" height="630" rx="28" fill="#1a1a1a"/>
      <rect width="944" height="630" rx="28" fill="#f0d7ff" stroke="#1a1a1a" stroke-width="2.5"/>

      <!-- Two comparison columns -->
      <g transform="translate(40, 36)">
        
        <!-- Left Column: Old Reseller Model (Coral/Salmon tone) -->
        <g transform="translate(0, 0)">
          <rect x="5" y="5" width="414" height="554" rx="22" fill="#1a1a1a"/>
          <rect width="414" height="554" rx="22" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2"/>
          
          <g transform="translate(28, 28)">
            ${ICONS.cross(0, 0, '#ff6c4c', 32)}
            <text x="44" y="22" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#1a1a1a">Other Chatbots</text>
            <text x="44" y="42" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#ff6c4c">RESOLD TOKENS WITH MARKUP</text>
          </g>

          <line x1="24" y1="84" x2="390" y2="84" stroke="#1a1a1a" stroke-width="1.5" stroke-dasharray="4 3"/>

          <!-- Pricing block -->
          <g transform="translate(28, 110)">
            <text y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#55554c" letter-spacing="1">MONTHLY SOFTWARE TAX</text>
            <text y="38" font-family="Georgia, serif" font-size="44" font-weight="bold" fill="#ff6c4c">$199 - $499<tspan font-family="'Segoe UI', Arial, sans-serif" font-size="16" fill="#55554c">/mo</tspan></text>
            <text y="62" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#55554c">Forced subscription regardless of usage</text>
          </g>

          <line x1="24" y1="200" x2="390" y2="200" stroke="#1a1a1a" stroke-width="1.5" stroke-dasharray="4 3"/>

          <!-- Markup block -->
          <g transform="translate(28, 226)">
            <text y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#55554c" letter-spacing="1">TOKEN MARKUP SURCHARGE</text>
            <text y="36" font-family="Georgia, serif" font-size="36" font-weight="bold" fill="#ff6c4c">+500% to +800%</text>
            <text y="60" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#ff6c4c">Hidden profit on every message answered</text>
          </g>

          <line x1="24" y1="316" x2="390" y2="316" stroke="#1a1a1a" stroke-width="1.5" stroke-dasharray="4 3"/>

          <!-- Restrictions block -->
          <g transform="translate(28, 342)">
            <text y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#55554c" letter-spacing="1">USAGE LIMITS</text>
            <text y="30" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="700" fill="#1a1a1a">Overage fees &amp; chat cut-offs</text>
            <text y="52" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#55554c">The widget locks when quota runs out</text>
          </g>

          <line x1="24" y1="422" x2="390" y2="422" stroke="#1a1a1a" stroke-width="1.5" stroke-dasharray="4 3"/>

          <!-- Embeddings -->
          <g transform="translate(28, 448)">
            <text y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#55554c" letter-spacing="1">VECTOR EMBEDDINGS</text>
            <text y="30" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="700" fill="#1a1a1a">Paid third-party vector databases</text>
          </g>
        </g>

        <!-- Right Column: Crescelo BYOK (Lime & Cream tone) -->
        <g transform="translate(450, 0)">
          <rect x="6" y="6" width="414" height="554" rx="22" fill="#08251a"/>
          <rect width="414" height="554" rx="22" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2.5"/>
          
          <g transform="translate(28, 28)">
            ${ICONS.check(0, 0, '#abff44', 32)}
            <text x="44" y="22" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#08251a">Crescelo Architecture</text>
            <text x="44" y="42" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#0f6e58">BRING-YOUR-OWN-KEY (BYOK)</text>
          </g>

          <line x1="24" y1="84" x2="390" y2="84" stroke="#1a1a1a" stroke-width="1.5" stroke-dasharray="4 3"/>

          <!-- Pricing block -->
          <g transform="translate(28, 110)">
            <text y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#0f6e58" letter-spacing="1">MONTHLY PLATFORM COST</text>
            <text y="38" font-family="Georgia, serif" font-size="44" font-weight="bold" fill="#08251a">$0 - $29<tspan font-family="'Segoe UI', Arial, sans-serif" font-size="16" fill="#0f6e58">/mo flat</tspan></text>
            <text y="62" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#0f6e58">Zero markup. Direct provider wholesale.</text>
          </g>

          <line x1="24" y1="200" x2="390" y2="200" stroke="#1a1a1a" stroke-width="1.5" stroke-dasharray="4 3"/>

          <!-- Markup block -->
          <g transform="translate(28, 226)">
            <text y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#0f6e58" letter-spacing="1">TOKEN PRICING MARKUP</text>
            
            <g transform="translate(0, 10)">
              <rect x="2" y="2" width="220" height="38" rx="8" fill="#1a1a1a"/>
              <rect width="220" height="38" rx="8" fill="#abff44" stroke="#1a1a1a" stroke-width="1.5"/>
              <text x="110" y="24" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="900" fill="#08251a" text-anchor="middle">0% WHOLESALE</text>
            </g>
            <text y="70" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#08251a">$0.15 per 1M tokens (Gemini / Groq)</text>
          </g>

          <line x1="24" y1="316" x2="390" y2="316" stroke="#1a1a1a" stroke-width="1.5" stroke-dasharray="4 3"/>

          <!-- Restrictions block -->
          <g transform="translate(28, 342)">
            <text y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#0f6e58" letter-spacing="1">USAGE LIMITS</text>
            <text y="30" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="700" fill="#08251a">Unlimited Conversations</text>
            <text y="52" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#55554c">Never throttled during high-traffic surges</text>
          </g>

          <line x1="24" y1="422" x2="390" y2="422" stroke="#1a1a1a" stroke-width="1.5" stroke-dasharray="4 3"/>

          <!-- Embeddings -->
          <g transform="translate(28, 448)">
            <text y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#0f6e58" letter-spacing="1">VECTOR EMBEDDINGS</text>
            <text y="30" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="700" fill="#0f6e58">100% Free Local CPU Vectors (ONNX)</text>
          </g>
        </g>

      </g>
    `,
  });
}

// POST 2: Convert Website Visitors at 2:14 AM (Mint #cdeee4 tone)
function getPost2Svg() {
  return createPlayfulFrame({
    index: '02/09',
    pillText: 'ALWAYS ON',
    pillTone: '#cdeee4',
    hookMain: 'Convert website visitors',
    hookEmphasis: 'at 2:14 am while you sleep.',
    subtitle: 'From "just looking" to a confirmed calendar slot in one seamless conversation.',
    ctaText: "Let's book",
    ctaTone: '#abff44',
    contentSvg: `
      <!-- Main Card Container: Mint Tone (#cdeee4) with chunky shadow -->
      <rect x="6" y="6" width="944" height="630" rx="28" fill="#1a1a1a"/>
      <rect width="944" height="630" rx="28" fill="#cdeee4" stroke="#1a1a1a" stroke-width="2.5"/>

      <!-- Simulated Interactive Chat Mockup (like the front page hero demo) -->
      <g transform="translate(68, 30)">
        <rect x="6" y="6" width="808" height="564" rx="24" fill="#1a1a1a"/>
        <rect width="808" height="564" rx="24" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2"/>

        <!-- Top bar with playful live bars -->
        <g transform="translate(28, 22)">
          <g transform="translate(0, 4)">
            <rect width="3" height="12" rx="1.5" fill="#0f6e58"/>
            <rect x="5" width="3" height="16" rx="1.5" fill="#0f6e58"/>
            <rect x="10" width="3" height="9" rx="1.5" fill="#0f6e58"/>
            <rect x="15" width="3" height="14" rx="1.5" fill="#0f6e58"/>
          </g>
          <text x="32" y="16" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="700" fill="#55554c">Live visitor conversation • Apex Studio</text>
          <text x="750" y="16" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#0f6e58" text-anchor="end">2:14 AM</text>
        </g>
        <line x1="0" y1="56" x2="808" y2="56" stroke="#1a1a1a" stroke-width="1.5"/>

        <!-- Speech Bubble 1: Visitor -->
        <g transform="translate(200, 76)">
          <rect width="580" height="58" rx="18" fill="#08251a"/>
          <text x="24" y="35" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="500" fill="#fffeeb">"Can I book a consultation session for next Tuesday?"</text>
        </g>

        <!-- Speech Bubble 2: Assistant (Soft Lime bubble) -->
        <g transform="translate(28, 150)">
          <rect width="660" height="74" rx="18" fill="#e6f9c8" stroke="#1a1a1a" stroke-width="1.5"/>
          <text x="24" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="15" fill="#1a1a1a">"Tuesday has two open slots with our senior advisor:</text>
          <text x="24" y="56" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" fill="#08251a">10:00 AM or 2:30 PM. Which one suits you best?"</text>
        </g>

        <!-- Speech Bubble 3: Visitor picks -->
        <g transform="translate(480, 240)">
          <rect width="300" height="50" rx="16" fill="#08251a"/>
          <text x="24" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="500" fill="#fffeeb">"10:00 AM works perfect!"</text>
        </g>

        <!-- Confirmed In-Chat Booking Card with chunky button -->
        <g transform="translate(28, 310)">
          <rect x="5" y="5" width="752" height="216" rx="20" fill="#1a1a1a"/>
          <rect width="752" height="216" rx="20" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2"/>

          <!-- Reservation tag pill -->
          <g transform="translate(28, 24)">
            <rect width="180" height="30" rx="15" fill="#d9f7ab" stroke="#1a1a1a" stroke-width="1.5"/>
            <circle cx="16" cy="15" r="4.5" fill="#08251a"/>
            <text x="28" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#08251a" letter-spacing="1">SLOT RESERVED</text>
          </g>

          <text x="28" y="86" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#08251a">Senior Strategy Consultation</text>
          <text x="28" y="114" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" fill="#0f6e58">📅 Tuesday at 10:00 AM EST • 30 mins</text>

          <g transform="translate(28, 142)">
            ${ICONS.check(0, 0, '#abff44', 20)}
            <text x="28" y="15" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#2f3a33">Calendar invitation held in real-time with zero double-booking</text>
          </g>

          <g transform="translate(28, 172)">
            ${ICONS.check(0, 0, '#abff44', 20)}
            <text x="28" y="15" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#2f3a33">Name, email, and intent automatically synced to your team CRM</text>
          </g>

          <!-- Chunky confirmed stamp -->
          <g transform="translate(560, 50)">
            <rect x="4" y="4" width="160" height="110" rx="16" fill="#1a1a1a"/>
            <rect width="160" height="110" rx="16" fill="#abff44" stroke="#1a1a1a" stroke-width="2"/>
            <text x="80" y="46" font-family="Georgia, serif" font-size="34" font-weight="bold" fill="#08251a" text-anchor="middle">✓</text>
            <text x="80" y="76" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#08251a" text-anchor="middle" letter-spacing="1">CONFIRMED</text>
          </g>
        </g>

      </g>
    `,
  });
}

// POST 3: Why 94% of Website Chatbots Get Ignored (Coral #ffc9bc tone)
function getPost3Svg() {
  return createPlayfulFrame({
    index: '03/09',
    pillText: 'OUTCOMES',
    pillTone: '#ffc9bc',
    hookMain: 'Why 94% of website',
    hookEmphasis: 'chatbots get ignored.',
    subtitle: 'Visitors reject scripted FAQ widgets. They demand action-oriented assistants.',
    ctaText: 'See the difference',
    ctaTone: '#ffa946',
    contentSvg: `
      <!-- Main Card Container: Coral Tone (#ffc9bc) with chunky shadow -->
      <rect x="6" y="6" width="944" height="630" rx="28" fill="#1a1a1a"/>
      <rect width="944" height="630" rx="28" fill="#ffc9bc" stroke="#1a1a1a" stroke-width="2.5"/>

      <!-- 3 Row Matrix with playful colored cards -->
      <g transform="translate(44, 30)">
        
        <!-- Row 1: Objective -->
        <g transform="translate(0, 0)">
          <rect x="4" y="4" width="856" height="168" rx="18" fill="#1a1a1a"/>
          <rect width="856" height="168" rx="18" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2"/>
          
          <text x="24" y="30" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#55554c" letter-spacing="1.2">DIMENSION 01 • VISITOR INTERACTION</text>
          
          <g transform="translate(24, 46)">
            <!-- Left Bad -->
            <rect width="388" height="100" rx="12" fill="#ffe7c2" stroke="#1a1a1a" stroke-width="1.5"/>
            ${ICONS.cross(16, 16, '#ff6c4c', 24)}
            <text x="48" y="32" font-family="Georgia, serif" font-size="17" font-weight="bold" fill="#1a1a1a">Old FAQ Chatbots (Passive)</text>
            <text x="48" y="56" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#55554c">Recites rigid scripts, links to help articles,</text>
            <text x="48" y="78" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#ff6c4c">Result: 85% of visitors bounce immediately.</text>

            <!-- Right Good -->
            <rect x="416" width="392" height="100" rx="12" fill="#d9f7ab" stroke="#1a1a1a" stroke-width="1.8"/>
            ${ICONS.check(432, 16, '#abff44', 24)}
            <text x="464" y="32" font-family="Georgia, serif" font-size="17" font-weight="bold" fill="#08251a">Crescelo (Action-Driven)</text>
            <text x="464" y="56" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">Presents live calendar slots &amp; captures leads,</text>
            <text x="464" y="78" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#0f6e58">Result: 3.4x higher conversion into clients.</text>
          </g>
        </g>

        <!-- Row 2: Accuracy -->
        <g transform="translate(0, 186)">
          <rect x="4" y="4" width="856" height="168" rx="18" fill="#1a1a1a"/>
          <rect width="856" height="168" rx="18" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2"/>
          
          <text x="24" y="30" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#55554c" letter-spacing="1.2">DIMENSION 02 • FACT GROUNDING &amp; TRUST</text>
          
          <g transform="translate(24, 46)">
            <rect width="388" height="100" rx="12" fill="#ffe7c2" stroke="#1a1a1a" stroke-width="1.5"/>
            ${ICONS.cross(16, 16, '#ff6c4c', 24)}
            <text x="48" y="32" font-family="Georgia, serif" font-size="17" font-weight="bold" fill="#1a1a1a">Generic AI Wrappers</text>
            <text x="48" y="56" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#55554c">Hallucinates prices, invents fake policies,</text>
            <text x="48" y="78" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#ff6c4c">Damages brand credibility with false info.</text>

            <rect x="416" width="392" height="100" rx="12" fill="#d9f7ab" stroke="#1a1a1a" stroke-width="1.8"/>
            ${ICONS.check(432, 16, '#abff44', 24)}
            <text x="464" y="32" font-family="Georgia, serif" font-size="17" font-weight="bold" fill="#08251a">Hybrid Dense+Sparse RAG</text>
            <text x="464" y="56" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">Strictly grounded in your uploaded documents,</text>
            <text x="464" y="78" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#0f6e58">Zero hallucinations. Shows exact citations.</text>
          </g>
        </g>

        <!-- Row 3: Escalation -->
        <g transform="translate(0, 372)">
          <rect x="4" y="4" width="856" height="168" rx="18" fill="#1a1a1a"/>
          <rect width="856" height="168" rx="18" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2"/>
          
          <text x="24" y="30" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#55554c" letter-spacing="1.2">DIMENSION 03 • TEAM HANDOVER</text>
          
          <g transform="translate(24, 46)">
            <rect width="388" height="100" rx="12" fill="#ffe7c2" stroke="#1a1a1a" stroke-width="1.5"/>
            ${ICONS.cross(16, 16, '#ff6c4c', 24)}
            <text x="48" y="32" font-family="Georgia, serif" font-size="17" font-weight="bold" fill="#1a1a1a">Trapped in Bot Loops</text>
            <text x="48" y="56" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#55554c">"I didn't understand. Can you rephrase?"</text>
            <text x="48" y="78" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#ff6c4c">High-value enterprise clients walk away.</text>

            <rect x="416" width="392" height="100" rx="12" fill="#d9f7ab" stroke="#1a1a1a" stroke-width="1.8"/>
            ${ICONS.check(432, 16, '#abff44', 24)}
            <text x="464" y="32" font-family="Georgia, serif" font-size="17" font-weight="bold" fill="#08251a">1-Click Live Team Handover</text>
            <text x="464" y="56" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">Staff steps into the exact same chat thread,</text>
            <text x="464" y="78" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#0f6e58">Full context preserved with sound alerts.</text>
          </g>
        </g>

      </g>
    `,
  });
}

// POST 4: Train on Your Business in Under 60 Seconds (Amber #ffe0b0 tone)
function getPost4Svg() {
  return createPlayfulFrame({
    index: '04/09',
    pillText: 'KNOWLEDGE',
    pillTone: '#ffe0b0',
    hookMain: 'Train on your business',
    hookEmphasis: 'in under 60 seconds.',
    subtitle: 'Drop in your raw files. Crescelo extracts passages, indexes vectors, and goes live.',
    ctaText: 'See file formats',
    ctaTone: '#abff44',
    contentSvg: `
      <!-- Main Card Container: Amber Tone (#ffe0b0) with chunky shadow -->
      <rect x="6" y="6" width="944" height="630" rx="28" fill="#1a1a1a"/>
      <rect width="944" height="630" rx="28" fill="#ffe0b0" stroke="#1a1a1a" stroke-width="2.5"/>

      <!-- File Ingestion Diagram with playful pastel file cards -->
      <g transform="translate(44, 30)">
        
        <!-- Left 4 File Type Badges -->
        <g transform="translate(0, 0)">
          <!-- PDF Card: Lavender -->
          <g transform="translate(0, 0)">
            <rect x="3" y="3" width="280" height="120" rx="16" fill="#1a1a1a"/>
            <rect width="280" height="120" rx="16" fill="#f0d7ff" stroke="#1a1a1a" stroke-width="2"/>
            <text x="20" y="38" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#1a1a1a">📄 PDF &amp; Word Docs</text>
            <text x="20" y="72" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">Heading-aware hierarchy &amp;</text>
            <text x="20" y="94" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">sliding token window extraction</text>
          </g>

          <!-- CSV Card: Mint -->
          <g transform="translate(0, 142)">
            <rect x="3" y="3" width="280" height="120" rx="16" fill="#1a1a1a"/>
            <rect width="280" height="120" rx="16" fill="#cdeee4" stroke="#1a1a1a" stroke-width="2"/>
            <text x="20" y="38" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#1a1a1a">📊 CSV Spreadsheets</text>
            <text x="20" y="72" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">Row-aware semantic parsing</text>
            <text x="20" y="94" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">preserving pricing &amp; SKU context</text>
          </g>

          <!-- JSON Card: Candy Pink -->
          <g transform="translate(0, 284)">
            <rect x="3" y="3" width="280" height="120" rx="16" fill="#1a1a1a"/>
            <rect width="280" height="120" rx="16" fill="#ffd6f6" stroke="#1a1a1a" stroke-width="2"/>
            <text x="20" y="38" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#1a1a1a">⚡ JSON Schemas</text>
            <text x="20" y="72" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">Hierarchical key flattening</text>
            <text x="20" y="94" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">for databases and real-time APIs</text>
          </g>

          <!-- Web URLs Card: Soft Lime -->
          <g transform="translate(0, 426)">
            <rect x="3" y="3" width="280" height="120" rx="16" fill="#1a1a1a"/>
            <rect width="280" height="120" rx="16" fill="#d9f7ab" stroke="#1a1a1a" stroke-width="2"/>
            <text x="20" y="38" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#1a1a1a">🌐 Websites &amp; Video</text>
            <text x="20" y="72" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">Automatic site crawler &amp;</text>
            <text x="20" y="94" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">YouTube transcript indexing</text>
          </g>
        </g>

        <!-- Center Ingestion Flow -->
        <g transform="translate(310, 160)">
          <line x1="0" y1="120" x2="60" y2="120" stroke="#1a1a1a" stroke-width="3" stroke-dasharray="6 4"/>
          <polygon points="60,112 75,120 60,128" fill="#1a1a1a"/>

          <!-- Core Brain Box -->
          <g transform="translate(90, 0)">
            <rect x="6" y="6" width="456" height="240" rx="22" fill="#1a1a1a"/>
            <rect width="456" height="240" rx="22" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2.5"/>

            <g transform="translate(228, 48)">
              ${getBrandMark(-16, -16, 32)}
            </g>

            <text x="228" y="112" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#08251a" text-anchor="middle">Crescelo Hybrid RAG</text>
            <text x="228" y="142" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#0f6e58" text-anchor="middle">384-Dim Local CPU Embeddings</text>
            
            <line x1="40" y1="166" x2="416" y2="166" stroke="#1a1a1a" stroke-width="1.5" stroke-dasharray="4 3"/>

            <text x="228" y="196" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#2f3a33" text-anchor="middle">Meaning search (vectors) + exact keyword match (BM25)</text>
            <text x="228" y="218" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#0f6e58" text-anchor="middle">Re-ranked with Reciprocal Rank Fusion</text>
          </g>
        </g>

        <!-- Bottom Guarantee Badge -->
        <g transform="translate(400, 440)">
          <rect x="4" y="4" width="456" height="106" rx="18" fill="#1a1a1a"/>
          <rect width="456" height="106" rx="18" fill="#d9f7ab" stroke="#1a1a1a" stroke-width="2"/>
          <g transform="translate(24, 24)">
            ${ICONS.sparkle(0, 0, '#ffa946', 28)}
            <text x="36" y="22" font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#08251a">100% Policy Grounded Guarantee</text>
            <text x="36" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">The assistant only answers what is in your files.</text>
            <text x="36" y="68" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#0f6e58">Zero hallucinations. Reliable corporate answers.</text>
          </g>
        </g>

      </g>
    `,
  });
}

// POST 5: The Crescelo Flagship Manifesto (Rainbow Conic Border / Multi-color)
function getPost5Svg() {
  return createPlayfulFrame({
    index: '05/09',
    pillText: 'THE MANIFESTO',
    pillTone: '#ffd6f6',
    hookMain: 'Built for revenue,',
    hookEmphasis: 'not just small talk.',
    subtitle: 'The universal AI website assistant engineered specifically for modern service businesses.',
    ctaText: 'Save this post',
    ctaTone: '#abff44',
    contentSvg: `
      <!-- Main Card Container with Conic Rainbow Border & Cream Surface -->
      <rect x="6" y="6" width="944" height="630" rx="28" fill="#1a1a1a"/>
      
      <!-- Rainbow Conic Border Effect -->
      <rect width="944" height="630" rx="28" fill="url(#rainbow_grad)"/>
      <rect x="4" y="4" width="936" height="622" rx="26" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2"/>

      <!-- Center Logo & Heading -->
      <g transform="translate(446, 22)">
        ${getBrandMark(0, 0, 50)}
      </g>
      <text x="472" y="98" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#08251a" text-anchor="middle">The 4 Core Growth Pillars</text>
      <text x="472" y="122" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#55554c" text-anchor="middle">Built to turn web traffic into qualified bookings 24/7</text>

      <!-- 4 Playful Colored Feature Tiles -->
      <g transform="translate(44, 150)">
        
        <!-- Pillar 1: Action-Driven Booking (Mint #cdeee4) -->
        <g transform="translate(0, 0)">
          <rect x="4" y="4" width="414" height="205" rx="18" fill="#1a1a1a"/>
          <rect width="414" height="205" rx="18" fill="#cdeee4" stroke="#1a1a1a" stroke-width="2"/>
          <text x="24" y="38" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#08251a">1. In-Chat Booking</text>
          <text x="24" y="74" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#2f3a33">Shows real available calendar slots inside</text>
          <text x="24" y="98" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#2f3a33">the conversation and confirms reservations.</text>
          
          <rect x="24" y="146" width="220" height="34" rx="10" fill="#fffdf6" stroke="#1a1a1a" stroke-width="1.5"/>
          <text x="134" y="168" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#0f6e58" text-anchor="middle">→ Converts 3.4x higher</text>
        </g>

        <!-- Pillar 2: 0% Token Markup (Lavender #f0d7ff) -->
        <g transform="translate(442, 0)">
          <rect x="4" y="4" width="414" height="205" rx="18" fill="#1a1a1a"/>
          <rect width="414" height="205" rx="18" fill="#f0d7ff" stroke="#1a1a1a" stroke-width="2"/>
          <text x="24" y="38" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#1a1a1a">2. Zero Token Markup</text>
          <text x="24" y="74" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#2f3a33">Bring Your Own Key (Gemini, Groq, OpenAI).</text>
          <text x="24" y="98" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#2f3a33">Pay raw wholesale rates directly to providers.</text>
          
          <rect x="24" y="146" width="220" height="34" rx="10" fill="#fffdf6" stroke="#1a1a1a" stroke-width="1.5"/>
          <text x="134" y="168" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#1a1a1a" text-anchor="middle">→ Eliminates 800% tax</text>
        </g>

        <!-- Pillar 3: Zero-Conflict Mutex (Sunny Amber #ffe0b0) -->
        <g transform="translate(0, 226)">
          <rect x="4" y="4" width="414" height="205" rx="18" fill="#1a1a1a"/>
          <rect width="414" height="205" rx="18" fill="#ffe0b0" stroke="#1a1a1a" stroke-width="2"/>
          <text x="24" y="38" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#1a1a1a">3. Zero-Conflict Mutex</text>
          <text x="24" y="74" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#2f3a33">In-memory lock &amp; database unique rules</text>
          <text x="24" y="98" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#2f3a33">guarantee two visitors never double-book.</text>
          
          <rect x="24" y="146" width="220" height="34" rx="10" fill="#fffdf6" stroke="#1a1a1a" stroke-width="1.5"/>
          <text x="134" y="168" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#8a4a0a" text-anchor="middle">→ 100% booking guarantee</text>
        </g>

        <!-- Pillar 4: Live Team Handover (Vibrant Lime #d9f7ab) -->
        <g transform="translate(442, 226)">
          <rect x="4" y="4" width="414" height="205" rx="18" fill="#1a1a1a"/>
          <rect width="414" height="205" rx="18" fill="#d9f7ab" stroke="#1a1a1a" stroke-width="2"/>
          <text x="24" y="38" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#08251a">4. Live Team Handover</text>
          <text x="24" y="74" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#2f3a33">When a VIP client asks for human assistance,</text>
          <text x="24" y="98" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#2f3a33">staff steps in with sound alerts. No lost context.</text>
          
          <rect x="24" y="146" width="220" height="34" rx="10" fill="#fffdf6" stroke="#1a1a1a" stroke-width="1.5"/>
          <text x="134" y="168" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#0f6e58" text-anchor="middle">→ Seamless team support</text>
        </g>

      </g>
    `,
  });
}

// POST 6: Never Double-Book Again (Candy Pink #ffd6f6 tone)
function getPost6Svg() {
  return createPlayfulFrame({
    index: '06/09',
    pillText: 'RELIABILITY',
    pillTone: '#ffd6f6',
    hookMain: 'Never double-book a client again.',
    hookEmphasis: 'concurrency mutex tech.',
    subtitle: 'What happens when two clients click the same 2:00 PM slot simultaneously?',
    ctaText: 'How it works',
    ctaTone: '#abff44',
    contentSvg: `
      <!-- Main Card Container: Candy Pink Tone (#ffd6f6) with chunky shadow -->
      <rect x="6" y="6" width="944" height="630" rx="28" fill="#1a1a1a"/>
      <rect width="944" height="630" rx="28" fill="#ffd6f6" stroke="#1a1a1a" stroke-width="2.5"/>

      <g transform="translate(44, 30)">
        
        <!-- Top: Flaw in Standard Chatbots -->
        <g transform="translate(0, 0)">
          <rect x="4" y="4" width="856" height="206" rx="18" fill="#1a1a1a"/>
          <rect width="856" height="206" rx="18" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2"/>
          
          <text x="24" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#ff6c4c" letter-spacing="1">THE FLAW IN OTHER CHATBOTS • RACE CONDITIONS</text>

          <g transform="translate(24, 52)">
            <!-- Client A -->
            <rect width="250" height="64" rx="10" fill="#ffe7c2" stroke="#1a1a1a" stroke-width="1.5"/>
            <text x="16" y="26" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#1a1a1a">Visitor A (Mobile)</text>
            <text x="16" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#55554c">Clicks "Tuesday at 2:00 PM"</text>

            <!-- Client B -->
            <rect x="0" y="74" width="250" height="64" rx="10" fill="#ffe7c2" stroke="#1a1a1a" stroke-width="1.5"/>
            <text x="16" y="100" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#1a1a1a">Visitor B (Desktop)</text>
            <text x="16" y="122" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#55554c">Clicks "Tuesday at 2:00 PM" at exact same second</text>

            <!-- Arrow -->
            <line x1="270" y1="70" x2="330" y2="70" stroke="#ff6c4c" stroke-width="2.5" stroke-dasharray="4 2"/>

            <!-- Result Box -->
            <rect x="350" y="10" width="460" height="120" rx="14" fill="#ffc9bc" stroke="#1a1a1a" stroke-width="2"/>
            ${ICONS.cross(374, 30, '#ff6c4c', 28)}
            <text x="414" y="48" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#1a1a1a">Embarrassing Double-Booking</text>
            <text x="374" y="80" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">Both clients receive confirmations. Your staff has to email one</text>
            <text x="374" y="102" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">to apologize and reschedule. Frustrating &amp; unprofessional.</text>
          </g>
        </g>

        <!-- Bottom: Crescelo Solution -->
        <g transform="translate(0, 230)">
          <rect x="4" y="4" width="856" height="354" rx="18" fill="#1a1a1a"/>
          <rect width="856" height="354" rx="18" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2"/>
          
          <text x="24" y="34" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="900" fill="#0f6e58" letter-spacing="1">CRESCELO CONCURRENCY MUTEX &amp; DATABASE UNIQUENESS</text>

          <g transform="translate(24, 56)">
            <!-- Step 1 -->
            <rect x="3" y="3" width="250" height="260" rx="14" fill="#1a1a1a"/>
            <rect width="250" height="260" rx="14" fill="#cdeee4" stroke="#1a1a1a" stroke-width="1.8"/>
            <circle cx="36" cy="34" r="16" fill="#08251a"/>
            <text x="36" y="40" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="900" fill="#fffdf6" text-anchor="middle">1</text>
            <text x="64" y="40" font-family="Georgia, serif" font-size="17" font-weight="bold" fill="#08251a">In-Memory Lock</text>
            
            <text x="20" y="82" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">The microsecond Visitor A clicks,</text>
            <text x="20" y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">an in-memory temporal Mutex</text>
            <text x="20" y="126" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">locks the slot cluster-wide.</text>
            
            <rect x="20" y="180" width="210" height="48" rx="8" fill="#fffdf6" stroke="#1a1a1a" stroke-width="1.5"/>
            <text x="32" y="210" font-family="'Consolas', monospace" font-size="12" font-weight="bold" fill="#08251a">lock = acquire(slotId)</text>

            <!-- Step 2 -->
            <rect x="277" y="3" width="250" height="260" rx="14" fill="#1a1a1a"/>
            <rect x="274" width="250" height="260" rx="14" fill="#f0d7ff" stroke="#1a1a1a" stroke-width="1.8"/>
            <circle cx="310" cy="34" r="16" fill="#08251a"/>
            <text x="310" y="40" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="900" fill="#fffdf6" text-anchor="middle">2</text>
            <text x="338" y="40" font-family="Georgia, serif" font-size="17" font-weight="bold" fill="#08251a">DB Constraint</text>
            
            <text x="294" y="82" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">Postgres enforces unique slot</text>
            <text x="294" y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">row constraints. Visitor B is</text>
            <text x="294" y="126" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">auto-routed to next opening.</text>

            <rect x="294" y="180" width="210" height="48" rx="8" fill="#fffdf6" stroke="#1a1a1a" stroke-width="1.5"/>
            <text x="306" y="210" font-family="'Consolas', monospace" font-size="11" font-weight="bold" fill="#08251a">UNIQUE(agent_id, time)</text>

            <!-- Step 3 -->
            <rect x="551" y="3" width="250" height="260" rx="14" fill="#1a1a1a"/>
            <rect x="548" width="250" height="260" rx="14" fill="#d9f7ab" stroke="#1a1a1a" stroke-width="2"/>
            <circle cx="584" cy="34" r="16" fill="#08251a"/>
            <text x="584" y="40" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="900" fill="#fffdf6" text-anchor="middle">3</text>
            <text x="612" y="40" font-family="Georgia, serif" font-size="17" font-weight="bold" fill="#08251a">Zero Conflict Sync</text>
            
            <text x="568" y="82" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#08251a">Google Calendar, Outlook,</text>
            <text x="568" y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#08251a">and iCal feeds updated</text>
            <text x="568" y="126" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#08251a">instantly with confirmation email.</text>

            <rect x="568" y="180" width="210" height="48" rx="8" fill="#abff44" stroke="#1a1a1a" stroke-width="1.5"/>
            <text x="580" y="210" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="900" fill="#08251a">✓ 100% Conflict Free</text>
          </g>
        </g>

      </g>
    `,
  });
}

// POST 7: True Omnichannel Sync (Sky Blue #d3f1f0 tone)
function getPost7Svg() {
  return createPlayfulFrame({
    index: '07/09',
    pillText: 'CHANNELS',
    pillTone: '#d3f1f0',
    hookMain: 'One knowledge brain.',
    hookEmphasis: 'Everywhere your clients talk.',
    subtitle: 'Deploy across your website, WhatsApp, and Telegram with centralized conversation sync.',
    ctaText: 'See channels',
    ctaTone: '#abff44',
    contentSvg: `
      <!-- Main Card Container: Sky Blue Tone (#d3f1f0) with chunky shadow -->
      <rect x="6" y="6" width="944" height="630" rx="28" fill="#1a1a1a"/>
      <rect width="944" height="630" rx="28" fill="#d3f1f0" stroke="#1a1a1a" stroke-width="2.5"/>

      <g transform="translate(44, 30)">
        
        <!-- Central Brain Hub -->
        <g transform="translate(260, 16)">
          <rect x="4" y="4" width="336" height="136" rx="20" fill="#1a1a1a"/>
          <rect width="336" height="136" rx="20" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2"/>
          <g transform="translate(168, 38)">
            ${getBrandMark(-16, -16, 32)}
          </g>
          <text x="168" y="88" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#08251a" text-anchor="middle">Crescelo Unified Core</text>
          <text x="168" y="112" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#0f6e58" text-anchor="middle">Single Source of Knowledge &amp; Bookings</text>
        </g>

        <!-- Connecting Lines -->
        <path d="M 330 152 L 140 236" stroke="#1a1a1a" stroke-width="2.5" stroke-dasharray="6 4"/>
        <path d="M 428 152 L 428 236" stroke="#1a1a1a" stroke-width="2.5" stroke-dasharray="6 4"/>
        <path d="M 526 152 L 716 236" stroke="#1a1a1a" stroke-width="2.5" stroke-dasharray="6 4"/>

        <!-- 3 Channels -->
        <g transform="translate(0, 236)">
          
          <!-- Channel 1: Web Widget (Mint) -->
          <g transform="translate(0, 0)">
            <rect x="4" y="4" width="268" height="326" rx="18" fill="#1a1a1a"/>
            <rect width="268" height="326" rx="18" fill="#cdeee4" stroke="#1a1a1a" stroke-width="2"/>
            <text x="24" y="44" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#08251a">💻 Website Widget</text>
            
            <g transform="translate(20, 78)">
              <text y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">• Zero-dependency script</text>
              <text y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">• Isolated Shadow DOM</text>
              <text y="76" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">• Real-time SSE streaming</text>
              <text y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">• Native mobile responsive</text>
              
              <rect y="150" width="228" height="44" rx="10" fill="#fffdf6" stroke="#1a1a1a" stroke-width="1.5"/>
              <text x="114" y="178" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#08251a" text-anchor="middle">1-Line HTML Embed</text>
            </g>
          </g>

          <!-- Channel 2: WhatsApp Cloud (Lime) -->
          <g transform="translate(294, 0)">
            <rect x="4" y="4" width="268" height="326" rx="18" fill="#1a1a1a"/>
            <rect width="268" height="326" rx="18" fill="#d9f7ab" stroke="#1a1a1a" stroke-width="2"/>
            <text x="24" y="44" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#08251a">📱 WhatsApp Cloud</text>
            
            <g transform="translate(20, 78)">
              <text y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">• Official Meta Cloud API</text>
              <text y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">• Instant 24/7 replies</text>
              <text y="76" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">• Secure webhook verify</text>
              <text y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">• In-chat booking links</text>
              
              <rect y="150" width="228" height="44" rx="10" fill="#fffdf6" stroke="#1a1a1a" stroke-width="1.5"/>
              <text x="114" y="178" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#08251a" text-anchor="middle">Meta Webhook Live</text>
            </g>
          </g>

          <!-- Channel 3: Telegram Bot (Lavender) -->
          <g transform="translate(588, 0)">
            <rect x="4" y="4" width="268" height="326" rx="18" fill="#1a1a1a"/>
            <rect width="268" height="326" rx="18" fill="#f0d7ff" stroke="#1a1a1a" stroke-width="2"/>
            <text x="24" y="44" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#1a1a1a">✈️ Telegram Bot</text>
            
            <g transform="translate(20, 78)">
              <text y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">• Zero server configuration</text>
              <text y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">• Secret header validation</text>
              <text y="76" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">• Rich formatting support</text>
              <text y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">• Live operator takeover</text>
              
              <rect y="150" width="228" height="44" rx="10" fill="#fffdf6" stroke="#1a1a1a" stroke-width="1.5"/>
              <text x="114" y="178" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#1a1a1a" text-anchor="middle">Instant Bot Connector</text>
            </g>
          </g>

        </g>

      </g>
    `,
  });
}

// POST 8: 1-Click Live Team Handover (Vibrant Lime #d9f7ab tone)
function getPost8Svg() {
  return createPlayfulFrame({
    index: '08/09',
    pillText: 'LIVE HANDOVER',
    pillTone: '#d9f7ab',
    hookMain: 'AI handles 80%.',
    hookEmphasis: 'Your team closes the VIPs.',
    subtitle: 'High-touch customer care meets autonomous speed. Never let high-value deals slip away.',
    ctaText: "Let's hand over",
    ctaTone: '#f0d7ff',
    contentSvg: `
      <!-- Main Card Container: Lime Tone (#d9f7ab) with chunky shadow -->
      <rect x="6" y="6" width="944" height="630" rx="28" fill="#1a1a1a"/>
      <rect width="944" height="630" rx="28" fill="#d9f7ab" stroke="#1a1a1a" stroke-width="2.5"/>

      <!-- Operator Dashboard Mockup -->
      <g transform="translate(44, 30)">
        <rect x="4" y="4" width="856" height="570" rx="22" fill="#1a1a1a"/>
        <rect width="856" height="570" rx="22" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2"/>

        <!-- Top Operator Bar -->
        <g transform="translate(28, 22)">
          <text x="0" y="24" font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#08251a">Live Handover Inbox</text>
          
          <rect x="616" y="0" width="184" height="32" rx="16" fill="#e6f9c8" stroke="#1a1a1a" stroke-width="1.5"/>
          <circle cx="634" cy="16" r="4.5" fill="#08251a"/>
          <text x="646" y="21" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#08251a">24 Active Threads</text>
        </g>
        <line x1="0" y1="68" x2="856" y2="68" stroke="#1a1a1a" stroke-width="1.5"/>

        <!-- Active VIP Thread Card (Coral Tone) -->
        <g transform="translate(28, 90)">
          <rect x="4" y="4" width="800" height="290" rx="16" fill="#1a1a1a"/>
          <rect width="800" height="290" rx="16" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2"/>

          <!-- High-Intent Badge -->
          <g transform="translate(24, 20)">
            <rect width="186" height="28" rx="14" fill="#ffe0b0" stroke="#1a1a1a" stroke-width="1.5"/>
            <circle cx="16" cy="14" r="5" fill="#ffa946"/>
            <text x="28" y="19" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="800" fill="#8a4a0a" letter-spacing="0.5">ENTERPRISE VIP INTENT</text>
          </g>

          <text x="24" y="80" font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#08251a">Prospect: David Chen (CTO, 500+ Seat Agency)</text>
          <text x="24" y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#0f6e58">Deal size detected: $25,000+ • Needs multi-tenant master license</text>

          <!-- Chat snippet -->
          <g transform="translate(24, 126)">
            <rect width="752" height="72" rx="10" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
            <text x="16" y="28" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#1a1a1a">David Chen:</text>
            <text x="108" y="28" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#2f3a33">"We want to deploy this across 40 regional offices. Can someone discuss terms?"</text>
            
            <text x="16" y="54" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#0f6e58">🤖 Crescelo: Pausing automated replies. Alerting enterprise team with sound chime...</text>
          </g>

          <!-- Action Button: Claim Conversation (Chunky neo-brutalist button) -->
          <g transform="translate(24, 218)">
            <rect x="3" y="3" width="310" height="48" rx="14" fill="#1a1a1a"/>
            <rect width="310" height="48" rx="14" fill="#abff44" stroke="#1a1a1a" stroke-width="2"/>
            <text x="155" y="30" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="900" fill="#08251a" text-anchor="middle">⚡ Step In &amp; Claim Thread</text>
            <text x="340" y="30" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#55554c">Instant handover • No context lost</text>
          </g>
        </g>

        <!-- Bottom Stat Highlights -->
        <g transform="translate(28, 404)">
          <!-- Stat 1 -->
          <g transform="translate(0, 0)">
            <rect x="3" y="3" width="250" height="136" rx="14" fill="#1a1a1a"/>
            <rect width="250" height="136" rx="14" fill="#cdeee4" stroke="#1a1a1a" stroke-width="1.8"/>
            <text x="24" y="48" font-family="Georgia, serif" font-size="40" font-weight="bold" fill="#08251a">78%</text>
            <text x="24" y="80" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#08251a">Handled Autonomously</text>
            <text x="24" y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#2f3a33">Routine questions &amp; bookings</text>
          </g>

          <!-- Stat 2 -->
          <g transform="translate(275, 0)">
            <rect x="3" y="3" width="250" height="136" rx="14" fill="#1a1a1a"/>
            <rect width="250" height="136" rx="14" fill="#f0d7ff" stroke="#1a1a1a" stroke-width="1.8"/>
            <text x="24" y="48" font-family="Georgia, serif" font-size="40" font-weight="bold" fill="#1a1a1a">&lt; 15s</text>
            <text x="24" y="80" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#1a1a1a">Team Alert Speed</text>
            <text x="24" y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#2f3a33">Sound alerts &amp; email notifications</text>
          </g>

          <!-- Stat 3 -->
          <g transform="translate(550, 0)">
            <rect x="3" y="3" width="250" height="136" rx="14" fill="#1a1a1a"/>
            <rect width="250" height="136" rx="14" fill="#ffe0b0" stroke="#1a1a1a" stroke-width="1.8"/>
            <text x="24" y="48" font-family="Georgia, serif" font-size="40" font-weight="bold" fill="#8a4a0a">100%</text>
            <text x="24" y="80" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#1a1a1a">History Preserved</text>
            <text x="24" y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#2f3a33">Full transcript logged in CRM</text>
          </g>
        </g>

      </g>
    `,
  });
}

// POST 9: 1 Line of Code Implementation (Deep ink box + Cream & Lime CTAs)
function getPost9Svg() {
  return createPlayfulFrame({
    index: '09/09',
    pillText: 'GET STARTED',
    pillTone: '#abff44',
    hookMain: '1 line of code.',
    hookEmphasis: '60 seconds to live.',
    subtitle: 'Paste onto any website or activate the WordPress plugin. Your AI agent is ready to convert.',
    ctaText: 'Deploy at crescelo.com',
    ctaTone: '#abff44',
    contentSvg: `
      <!-- Main Card Container: Soft Cream/Ivory (#fffdf6) with chunky shadow -->
      <rect x="6" y="6" width="944" height="630" rx="28" fill="#1a1a1a"/>
      <rect width="944" height="630" rx="28" fill="#fffdf6" stroke="#1a1a1a" stroke-width="2.5"/>

      <g transform="translate(44, 30)">
        
        <!-- Code Box Card: Deep Forest background with chunky shadow -->
        <g transform="translate(0, 0)">
          <rect x="5" y="5" width="856" height="206" rx="18" fill="#1a1a1a"/>
          <rect width="856" height="206" rx="18" fill="#08251a" stroke="#1a1a1a" stroke-width="2"/>
          
          <!-- Code Header -->
          <g transform="translate(24, 20)">
            <circle cx="10" cy="10" r="6" fill="#ff6c4c"/>
            <circle cx="30" cy="10" r="6" fill="#ffa946"/>
            <circle cx="50" cy="10" r="6" fill="#abff44"/>
            <text x="76" y="15" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#cfe3d6">embed-crescelo.html</text>
          </g>
          <line x1="0" y1="46" x2="856" y2="46" stroke="#ffffff" stroke-opacity="0.12"/>

          <!-- Code content -->
          <g transform="translate(24, 78)">
            <text font-family="'Consolas', 'Courier New', monospace" font-size="14" fill="#a9c4b4">&lt;!-- Paste this before your closing &lt;/body&gt; tag --&gt;</text>
            <text y="36" font-family="'Consolas', 'Courier New', monospace" font-size="17" fill="#fffeeb">
              &lt;script <tspan fill="#abff44">src="https://crescelo.com/widget.js"</tspan> <tspan fill="#91dbda">data-assistant="YOUR_ID"</tspan> <tspan fill="#ffa946">defer</tspan>&gt;&lt;/script&gt;
            </text>
            <text y="80" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#abff44">✓ Works with WordPress • Shopify • Webflow • Framer • Squarespace • Custom Sites</text>
          </g>
        </g>

        <!-- Big Launch Card: Soft Mint with chunky CTA button -->
        <g transform="translate(0, 236)">
          <rect x="5" y="5" width="856" height="330" rx="20" fill="#1a1a1a"/>
          <rect width="856" height="330" rx="20" fill="#cdeee4" stroke="#1a1a1a" stroke-width="2"/>

          <g transform="translate(48, 40)">
            <text y="0" font-family="Georgia, serif" font-size="32" font-weight="bold" fill="#08251a">Ready to Automate Your Website?</text>
            <text y="36" font-family="'Segoe UI', Arial, sans-serif" font-size="16" fill="#2f3a33">Start free today. No credit card required. Up and running in 60 seconds.</text>

            <!-- Checklist with playful checkmarks -->
            <g transform="translate(0, 74)">
              <g transform="translate(0, 0)">
                ${ICONS.check(0, 0, '#abff44', 22)}
                <text x="32" y="16" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" fill="#08251a">Free tier available with zero credit card required</text>
              </g>
              <g transform="translate(0, 38)">
                ${ICONS.check(0, 0, '#abff44', 22)}
                <text x="32" y="16" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" fill="#08251a">Bring Your Own Key (BYOK) for 100% raw wholesale pricing</text>
              </g>
              <g transform="translate(0, 76)">
                ${ICONS.check(0, 0, '#abff44', 22)}
                <text x="32" y="16" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" fill="#08251a">Live in-chat calendar booking and instant lead capture</text>
              </g>
            </g>

            <!-- Big Chunky Button -->
            <g transform="translate(0, 192)">
              <rect x="4" y="4" width="360" height="60" rx="30" fill="#1a1a1a"/>
              <rect width="360" height="60" rx="30" fill="#abff44" stroke="#1a1a1a" stroke-width="2"/>
              <text x="180" y="37" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="900" fill="#08251a" text-anchor="middle">Let's build your assistant →</text>

              <text x="396" y="37" font-family="Georgia, serif" font-size="22" font-style="italic" fill="#0f6e58">www.crescelo.com</text>
            </g>
          </g>
        </g>

      </g>
    `,
  });
}

const posts = [
  { name: 'post-01-pricing-tax', fn: getPost1Svg },
  { name: 'post-02-night-owl-leads', fn: getPost2Svg },
  { name: 'post-03-why-chatbots-fail', fn: getPost3Svg },
  { name: 'post-04-60s-brain-train', fn: getPost4Svg },
  { name: 'post-05-crescelo-manifesto', fn: getPost5Svg },
  { name: 'post-06-mutex-calendar-lock', fn: getPost6Svg },
  { name: 'post-07-omnichannel-sync', fn: getPost7Svg },
  { name: 'post-08-human-takeover', fn: getPost8Svg },
  { name: 'post-09-one-line-deploy', fn: getPost9Svg },
];

async function generateAll() {
  console.log(`Starting generation of 9 playful branded Instagram posts...`);
  
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const svgStr = post.fn();
    const pngFilename = `${post.name}.png`;
    const publicPath = path.join(outDir, pngFilename);
    const artifactPath = path.join(artifactDir, pngFilename);

    console.log(`[${i + 1}/9] Rendering ${pngFilename}...`);
    
    // Render 1080x1080 crisp PNG
    await sharp(Buffer.from(svgStr))
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(publicPath);

    // Also copy to artifactDir so it can be previewed/embedded
    fs.copyFileSync(publicPath, artifactPath);

    console.log(`Saved: ${publicPath} (${fs.statSync(publicPath).size} bytes)`);
  }

  console.log('All 9 playful posts generated successfully with refined header & URL!');
}

generateAll().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
