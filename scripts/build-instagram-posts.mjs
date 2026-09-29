import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/instagram');
const artifactDir = 'C:\\Users\\DELL\\.gemini\\antigravity\\brain\\7557de85-1f77-4787-bb49-5bfd907d5e43';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Brand SVG Mark Icon (scalable)
function getBrandMark(x, y, size = 48) {
  const scale = size / 100;
  return `
  <g transform="translate(${x}, ${y}) scale(${scale})">
    <defs>
      <linearGradient id="mark_t_${x}_${y}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#12432f"/>
        <stop offset="100%" stop-color="#04140d"/>
      </linearGradient>
      <linearGradient id="mark_c_${x}_${y}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#f1ffc9"/>
        <stop offset="45%" stop-color="#abff44"/>
        <stop offset="100%" stop-color="#74d321"/>
      </linearGradient>
      <clipPath id="mark_clip_${x}_${y}">
        <rect x="0" y="0" width="100" height="100" rx="26" />
      </clipPath>
    </defs>
    <rect width="100" height="100" rx="26" fill="url(#mark_t_${x}_${y})"/>
    <g clip-path="url(#mark_clip_${x}_${y})">
      <circle cx="50" cy="50" r="38" fill="#abff44" opacity="0.16" />
      <path d="M69.9 33.3 A26 26 0 1 0 69.9 66.7" fill="none" stroke="url(#mark_c_${x}_${y})" stroke-width="14" stroke-linecap="round"/>
      <circle cx="63" cy="50" r="5.6" fill="url(#mark_c_${x}_${y})"/>
    </g>
    <rect x="1" y="1" width="98" height="98" rx="25" fill="none" stroke="#abff44" stroke-opacity="0.38" stroke-width="2.2"/>
  </g>`;
}

// Clean Vector Icons (No relying on system emojis)
const ICONS = {
  check: (x, y, color = '#abff44', size = 24) => `
    <g transform="translate(${x}, ${y})">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${color}" fill-opacity="0.18"/>
      <path d="M ${size*0.28} ${size*0.5} L ${size*0.44} ${size*0.68} L ${size*0.74} ${size*0.32}" fill="none" stroke="${color}" stroke-width="${size*0.12}" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`,
  cross: (x, y, color = '#ef4444', size = 24) => `
    <g transform="translate(${x}, ${y})">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${color}" fill-opacity="0.18"/>
      <path d="M ${size*0.32} ${size*0.32} L ${size*0.68} ${size*0.68} M ${size*0.68} ${size*0.32} L ${size*0.32} ${size*0.68}" fill="none" stroke="${color}" stroke-width="${size*0.12}" stroke-linecap="round"/>
    </g>`,
  calendar: (x, y, color = '#abff44', size = 28) => `
    <g transform="translate(${x}, ${y})">
      <rect x="${size*0.1}" y="${size*0.2}" width="${size*0.8}" height="${size*0.7}" rx="${size*0.12}" fill="none" stroke="${color}" stroke-width="${size*0.08}"/>
      <line x1="${size*0.1}" y1="${size*0.42}" x2="${size*0.9}" y2="${size*0.42}" stroke="${color}" stroke-width="${size*0.07}"/>
      <line x1="${size*0.3}" y1="${size*0.1}" x2="${size*0.3}" y2="${size*0.24}" stroke="${color}" stroke-width="${size*0.08}" stroke-linecap="round"/>
      <line x1="${size*0.7}" y1="${size*0.1}" x2="${size*0.7}" y2="${size*0.24}" stroke="${color}" stroke-width="${size*0.08}" stroke-linecap="round"/>
      <circle cx="${size*0.32}" cy="${size*0.62}" r="${size*0.06}" fill="${color}"/>
      <circle cx="${size*0.5}" cy="${size*0.62}" r="${size*0.06}" fill="${color}"/>
      <circle cx="${size*0.68}" cy="${size*0.62}" r="${size*0.06}" fill="${color}"/>
      <circle cx="${size*0.32}" cy="${size*0.76}" r="${size*0.06}" fill="${color}"/>
      <circle cx="${size*0.5}" cy="${size*0.76}" r="${size*0.06}" fill="${color}"/>
    </g>`,
  lightning: (x, y, color = '#abff44', size = 28) => `
    <g transform="translate(${x}, ${y})">
      <polygon points="${size*0.55},${size*0.08} ${size*0.18},${size*0.54} ${size*0.48},${size*0.54} ${size*0.42},${size*0.92} ${size*0.82},${size*0.44} ${size*0.52},${size*0.44}" fill="${color}"/>
    </g>`,
  lock: (x, y, color = '#abff44', size = 28) => `
    <g transform="translate(${x}, ${y})">
      <rect x="${size*0.18}" y="${size*0.42}" width="${size*0.64}" height="${size*0.48}" rx="${size*0.1}" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="${size*0.08}"/>
      <path d="M ${size*0.3} ${size*0.42} L ${size*0.3} ${size*0.28} A ${size*0.2} ${size*0.2} 0 0 1 ${size*0.7} ${size*0.28} L ${size*0.7} ${size*0.42}" fill="none" stroke="${color}" stroke-width="${size*0.08}" stroke-linecap="round"/>
      <circle cx="${size*0.5}" cy="${size*0.62}" r="${size*0.07}" fill="${color}"/>
    </g>`,
  shield: (x, y, color = '#abff44', size = 28) => `
    <g transform="translate(${x}, ${y})">
      <path d="M ${size*0.5} ${size*0.12} L ${size*0.82} ${size*0.24} L ${size*0.82} ${size*0.54} C ${size*0.82} ${size*0.78} ${size*0.5} ${size*0.9} ${size*0.5} ${size*0.9} C ${size*0.5} ${size*0.9} ${size*0.18} ${size*0.78} ${size*0.18} ${size*0.54} L ${size*0.18} ${size*0.24} Z" fill="${color}" fill-opacity="0.18" stroke="${color}" stroke-width="${size*0.08}"/>
      <path d="M ${size*0.36} ${size*0.5} L ${size*0.46} ${size*0.62} L ${size*0.66} ${size*0.38}" fill="none" stroke="${color}" stroke-width="${size*0.08}" stroke-linecap="round" stroke-linejoin="round"/>
    </g>`,
  user: (x, y, color = '#abff44', size = 28) => `
    <g transform="translate(${x}, ${y})">
      <circle cx="${size*0.5}" cy="${size*0.32}" r="${size*0.2}" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="${size*0.08}"/>
      <path d="M ${size*0.18} ${size*0.84} C ${size*0.18} ${size*0.62} ${size*0.32} ${size*0.58} ${size*0.5} ${size*0.58} C ${size*0.68} ${size*0.58} ${size*0.82} ${size*0.62} ${size*0.82} ${size*0.84}" fill="none" stroke="${color}" stroke-width="${size*0.08}" stroke-linecap="round"/>
    </g>`,
  code: (x, y, color = '#abff44', size = 28) => `
    <g transform="translate(${x}, ${y})">
      <path d="M ${size*0.32} ${size*0.3} L ${size*0.14} ${size*0.5} L ${size*0.32} ${size*0.7}" fill="none" stroke="${color}" stroke-width="${size*0.09}" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M ${size*0.68} ${size*0.3} L ${size*0.86} ${size*0.5} L ${size*0.68} ${size*0.7}" fill="none" stroke="${color}" stroke-width="${size*0.09}" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="${size*0.58}" y1="${size*0.22}" x2="${size*0.42}" y2="${size*0.78}" stroke="${color}" stroke-width="${size*0.08}" stroke-linecap="round"/>
    </g>`,
  file: (x, y, color = '#abff44', size = 28) => `
    <g transform="translate(${x}, ${y})">
      <path d="M ${size*0.2} ${size*0.1} L ${size*0.6} ${size*0.1} L ${size*0.8} ${size*0.3} L ${size*0.8} ${size*0.9} L ${size*0.2} ${size*0.9} Z" fill="${color}" fill-opacity="0.15" stroke="${color}" stroke-width="${size*0.08}"/>
      <path d="M ${size*0.6} ${size*0.1} L ${size*0.6} ${size*0.3} L ${size*0.8} ${size*0.3}" fill="none" stroke="${color}" stroke-width="${size*0.07}"/>
      <line x1="${size*0.32}" y1="${size*0.48}" x2="${size*0.68}" y2="${size*0.48}" stroke="${color}" stroke-width="${size*0.07}" stroke-linecap="round"/>
      <line x1="${size*0.32}" y1="${size*0.64}" x2="${size*0.68}" y2="${size*0.64}" stroke="${color}" stroke-width="${size*0.07}" stroke-linecap="round"/>
    </g>`,
  database: (x, y, color = '#abff44', size = 28) => `
    <g transform="translate(${x}, ${y})">
      <ellipse cx="${size*0.5}" cy="${size*0.25}" rx="${size*0.36}" ry="${size*0.12}" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="${size*0.07}"/>
      <path d="M ${size*0.14} ${size*0.25} L ${size*0.14} ${size*0.52} C ${size*0.14} ${size*0.64} ${size*0.3} ${size*0.64} ${size*0.5} ${size*0.64} C ${size*0.7} ${size*0.64} ${size*0.86} ${size*0.64} ${size*0.86} ${size*0.52} L ${size*0.86} ${size*0.25}" fill="none" stroke="${color}" stroke-width="${size*0.07}"/>
      <path d="M ${size*0.14} ${size*0.52} L ${size*0.14} ${size*0.78} C ${size*0.14} ${size*0.9} ${size*0.3} ${size*0.9} ${size*0.5} ${size*0.9} C ${size*0.7} ${size*0.9} ${size*0.86} ${size*0.9} ${size*0.86} ${size*0.78} L ${size*0.86} ${size*0.52}" fill="none" stroke="${color}" stroke-width="${size*0.07}"/>
    </g>`,
  phone: (x, y, color = '#abff44', size = 28) => `
    <g transform="translate(${x}, ${y})">
      <rect x="${size*0.24}" y="${size*0.1}" width="${size*0.52}" height="${size*0.8}" rx="${size*0.1}" fill="${color}" fill-opacity="0.15" stroke="${color}" stroke-width="${size*0.08}"/>
      <line x1="${size*0.4}" y1="${size*0.18}" x2="${size*0.6}" y2="${size*0.18}" stroke="${color}" stroke-width="${size*0.06}" stroke-linecap="round"/>
      <circle cx="${size*0.5}" cy="${size*0.78}" r="${size*0.04}" fill="${color}"/>
    </g>`,
  globe: (x, y, color = '#abff44', size = 28) => `
    <g transform="translate(${x}, ${y})">
      <circle cx="${size*0.5}" cy="${size*0.5}" r="${size*0.4}" fill="${color}" fill-opacity="0.15" stroke="${color}" stroke-width="${size*0.08}"/>
      <ellipse cx="${size*0.5}" cy="${size*0.5}" rx="${size*0.18}" ry="${size*0.4}" fill="none" stroke="${color}" stroke-width="${size*0.07}"/>
      <line x1="${size*0.1}" y1="${size*0.5}" x2="${size*0.9}" y2="${size*0.5}" stroke="${color}" stroke-width="${size*0.07}"/>
    </g>`,
};

// Base Frame for consistent branding
function createBaseFrame({
  index = '01/09',
  pill = 'COST EFFICIENCY',
  hookTitle = 'HOOK TITLE HERE',
  hookHighlight = '',
  subtitle = 'Subtitle context text goes here.',
  contentSvg = '',
  ctaText = 'Swipe to learn more',
}) {
  return `
<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg_grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#08251a"/>
      <stop offset="35%" stop-color="#04140d"/>
      <stop offset="100%" stop-color="#020a06"/>
    </linearGradient>

    <radialGradient id="glow_top_right" cx="85%" cy="15%" r="60%">
      <stop offset="0%" stop-color="#abff44" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#04140d" stop-opacity="0"/>
    </radialGradient>

    <radialGradient id="glow_bottom_left" cx="15%" cy="85%" r="50%">
      <stop offset="0%" stop-color="#12432f" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#020a06" stop-opacity="0"/>
    </radialGradient>

    <pattern id="dot_grid" width="36" height="36" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.2" fill="#abff44" fill-opacity="0.08" />
    </pattern>
  </defs>

  <!-- Background Layer -->
  <rect width="1080" height="1080" fill="url(#bg_grad)"/>
  <rect width="1080" height="1080" fill="url(#dot_grid)"/>
  <rect width="1080" height="1080" fill="url(#glow_top_right)"/>
  <rect width="1080" height="1080" fill="url(#glow_bottom_left)"/>

  <!-- Subtle Outer Border Frame -->
  <rect x="30" y="30" width="1020" height="1020" rx="32" fill="none" stroke="#abff44" stroke-opacity="0.18" stroke-width="1.5"/>

  <!-- HEADER -->
  <g transform="translate(64, 56)">
    ${getBrandMark(0, 0, 48)}
    
    <text x="62" y="33" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="24" font-weight="900" fill="#fffeeb" letter-spacing="2">CRESCELO</text>
    <text x="214" y="33" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="24" font-weight="600" fill="#abff44">.AI</text>

    <!-- Category Pill Tag -->
    <g transform="translate(640, 4)">
      <rect width="312" height="40" rx="20" fill="#12432f" fill-opacity="0.75" stroke="#abff44" stroke-opacity="0.45" stroke-width="1.3"/>
      <circle cx="22" cy="20" r="5" fill="#abff44"/>
      <text x="38" y="26" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="13" font-weight="800" fill="#abff44" letter-spacing="1.2">${index} • ${pill}</text>
    </g>
  </g>

  <!-- HOOK / HEADLINE SECTION -->
  <g transform="translate(64, 144)">
    <text font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="46" font-weight="900" fill="#fffeeb" letter-spacing="-0.5">
      ${hookTitle}
    </text>
    <text y="58" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="46" font-weight="900" fill="#abff44" letter-spacing="-0.5">
      ${hookHighlight}
    </text>
    <text y="104" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="19" font-weight="400" fill="#cbd5e1">
      ${subtitle}
    </text>
  </g>

  <!-- CENTER VISUAL CONTENT -->
  <g transform="translate(64, 282)">
    ${contentSvg}
  </g>

  <!-- FOOTER -->
  <g transform="translate(64, 980)">
    <line x1="0" y1="0" x2="952" y2="0" stroke="#abff44" stroke-opacity="0.18" stroke-width="1"/>
    
    <!-- Left: Handle -->
    <text x="0" y="32" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="16" font-weight="700" fill="#cbd5e1">@crescelo.ai</text>
    <text x="122" y="32" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="14" font-weight="400" fill="#475569">|</text>
    <text x="138" y="32" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="14" font-weight="600" fill="#94a3b8">Universal AI Business Assistant</text>

    <!-- Center/Right: Action Pill -->
    <g transform="translate(660, 8)">
      <rect width="292" height="36" rx="18" fill="#abff44" fill-opacity="0.15" stroke="#abff44" stroke-opacity="0.5" stroke-width="1.2"/>
      <text x="146" y="23" font-family="'Segoe UI', -apple-system, Arial, sans-serif" font-size="13" font-weight="800" fill="#abff44" text-anchor="middle" letter-spacing="0.5">${ctaText} →</text>
    </g>
  </g>
</svg>`;
}

// POST 1: Token Markup Comparison
function getPost1Svg() {
  return createBaseFrame({
    index: '01/09',
    pill: 'COST EFFICIENCY',
    hookTitle: 'STOP PAYING AN 800%',
    hookHighlight: 'AI TOKEN MARKUP TAX.',
    subtitle: 'Why pay bloated reseller margins when you can access raw wholesale intelligence?',
    ctaText: 'Swipe to see the math',
    contentSvg: `
      <!-- Card Container -->
      <rect width="952" height="664" rx="24" fill="#0b241a" fill-opacity="0.8" stroke="#abff44" stroke-opacity="0.25" stroke-width="1.5"/>

      <!-- Comparison Headers -->
      <g transform="translate(48, 48)">
        
        <!-- Left: Old SaaS Reseller Model -->
        <g transform="translate(0, 0)">
          <rect width="404" height="568" rx="18" fill="#161515" fill-opacity="0.85" stroke="#ef4444" stroke-opacity="0.35" stroke-width="1.2"/>
          
          ${ICONS.cross(32, 28, '#ef4444', 36)}
          <text x="78" y="44" font-family="'Segoe UI', Arial, sans-serif" font-size="19" font-weight="800" fill="#f87171">Standard AI Chatbots</text>
          <text x="78" y="66" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#94a3b8">Markup Reseller Model</text>

          <line x1="28" y1="88" x2="376" y2="88" stroke="#ffffff" stroke-opacity="0.08"/>

          <!-- Block 1 -->
          <g transform="translate(32, 114)">
            <text y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#94a3b8" letter-spacing="1">MONTHLY PLATFORM COST</text>
            <text y="36" font-family="'Segoe UI', Arial, sans-serif" font-size="34" font-weight="900" fill="#f87171">$199 - $499<tspan font-size="16" fill="#94a3b8">/mo</tspan></text>
            <text y="58" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#64748b">Fixed expensive monthly plan</text>
          </g>

          <line x1="28" y1="202" x2="376" y2="202" stroke="#ffffff" stroke-opacity="0.08"/>

          <!-- Block 2 -->
          <g transform="translate(32, 230)">
            <text y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#94a3b8" letter-spacing="1">TOKEN PRICING MARKUP</text>
            <text y="34" font-family="'Segoe UI', Arial, sans-serif" font-size="28" font-weight="900" fill="#fca5a5">+500% to +800%</text>
            <text y="56" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#ef4444">Hidden markup on every reply</text>
          </g>

          <line x1="28" y1="318" x2="376" y2="318" stroke="#ffffff" stroke-opacity="0.08"/>

          <!-- Block 3 -->
          <g transform="translate(32, 346)">
            <text y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#94a3b8" letter-spacing="1">USAGE RESTRICTIONS</text>
            <text y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="800" fill="#cbd5e1">Overage penalties &amp; chat locks</text>
            <text y="54" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#64748b">Bot shuts off when limits expire</text>
          </g>

          <line x1="28" y1="432" x2="376" y2="432" stroke="#ffffff" stroke-opacity="0.08"/>

          <!-- Block 4 -->
          <g transform="translate(32, 460)">
            <text y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#94a3b8" letter-spacing="1">VECTOR EMBEDDING COST</text>
            <text y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="19" font-weight="700" fill="#cbd5e1">Paid external Pinecone fees</text>
          </g>
        </g>

        <!-- Right: Crescelo BYOK Model -->
        <g transform="translate(452, 0)">
          <rect width="404" height="568" rx="18" fill="#123d2b" fill-opacity="0.9" stroke="#abff44" stroke-opacity="0.6" stroke-width="1.8"/>
          
          ${ICONS.check(32, 28, '#abff44', 36)}
          <text x="78" y="44" font-family="'Segoe UI', Arial, sans-serif" font-size="19" font-weight="800" fill="#abff44">Crescelo Architecture</text>
          <text x="78" y="66" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#cbd5e1">Bring-Your-Own-Key (BYOK)</text>

          <line x1="28" y1="88" x2="376" y2="88" stroke="#abff44" stroke-opacity="0.18"/>

          <!-- Block 1 -->
          <g transform="translate(32, 114)">
            <text y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#86efac" letter-spacing="1">MONTHLY PLATFORM COST</text>
            <text y="36" font-family="'Segoe UI', Arial, sans-serif" font-size="34" font-weight="900" fill="#fffeeb">$0 - $29<tspan font-size="16" fill="#86efac">/mo flat</tspan></text>
            <text y="58" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#86efac">Zero forced software tax</text>
          </g>

          <line x1="28" y1="202" x2="376" y2="202" stroke="#abff44" stroke-opacity="0.18"/>

          <!-- Block 2 -->
          <g transform="translate(32, 230)">
            <text y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#86efac" letter-spacing="1">TOKEN PRICING MARKUP</text>
            <text y="34" font-family="'Segoe UI', Arial, sans-serif" font-size="28" font-weight="900" fill="#abff44">0% Wholesale Direct</text>
            <text y="56" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#abff44">$0.15 / 1M tokens (Gemini / Groq)</text>
          </g>

          <line x1="28" y1="318" x2="376" y2="318" stroke="#abff44" stroke-opacity="0.18"/>

          <!-- Block 3 -->
          <g transform="translate(32, 346)">
            <text y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#86efac" letter-spacing="1">USAGE RESTRICTIONS</text>
            <text y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="800" fill="#fffeeb">Unlimited Conversations</text>
            <text y="54" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#86efac">Never throttled during busy campaigns</text>
          </g>

          <line x1="28" y1="432" x2="376" y2="432" stroke="#abff44" stroke-opacity="0.18"/>

          <!-- Block 4 -->
          <g transform="translate(32, 460)">
            <text y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#86efac" letter-spacing="1">VECTOR EMBEDDING COST</text>
            <text y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="19" font-weight="700" fill="#abff44">100% Free Local CPU Vectors</text>
          </g>
        </g>

      </g>
    `,
  });
}

// POST 2: 24/7 Autonomous Booking
function getPost2Svg() {
  return createBaseFrame({
    index: '02/09',
    pill: 'LEAD CONVERSION',
    hookTitle: 'CONVERT WEBSITE VISITORS',
    hookHighlight: 'AT 2:14 AM WHILE YOU SLEEP.',
    subtitle: 'Stop losing high-intent prospects to contact forms that get answered 2 days later.',
    ctaText: 'Swipe to see the flow',
    contentSvg: `
      <!-- Card Container -->
      <rect width="952" height="664" rx="24" fill="#0b241a" fill-opacity="0.8" stroke="#abff44" stroke-opacity="0.25" stroke-width="1.5"/>

      <!-- Simulated Sleek Chat UI -->
      <g transform="translate(136, 40)">
        <rect width="680" height="584" rx="22" fill="#05170f" stroke="#abff44" stroke-opacity="0.35" stroke-width="1.5"/>

        <!-- Chat Header -->
        <g transform="translate(24, 20)">
          ${getBrandMark(0, 0, 42)}
          <text x="54" y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="800" fill="#fffeeb">Crescelo Autonomous Assistant</text>
          <text x="54" y="38" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#abff44">● Live &amp; Capturing Leads</text>
          <text x="630" y="24" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#64748b" text-anchor="end">2:14 AM</text>
        </g>
        <line x1="0" y1="74" x2="680" y2="74" stroke="#ffffff" stroke-opacity="0.08"/>

        <!-- Message 1: Visitor -->
        <g transform="translate(160, 96)">
          <rect width="496" height="64" rx="16" fill="#173627" stroke="#abff44" stroke-opacity="0.2"/>
          <text x="20" y="26" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#cbd5e1">Website Visitor:</text>
          <text x="20" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="600" fill="#fffeeb">"Can we book an enterprise onboarding audit next Tuesday?"</text>
        </g>

        <!-- Message 2: Crescelo AI -->
        <g transform="translate(24, 180)">
          <rect width="560" height="74" rx="16" fill="#0e2f20" stroke="#abff44" stroke-opacity="0.35"/>
          <text x="20" y="28" font-family="'Segoe UI', Arial, sans-serif" font-size="14" fill="#abff44">Crescelo AI:</text>
          <text x="20" y="52" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="600" fill="#fffeeb">"Certainly! We have 10:00 AM EST or 2:30 PM EST open with our director. Which fits?"</text>
        </g>

        <!-- Message 3: Visitor -->
        <g transform="translate(360, 274)">
          <rect width="296" height="50" rx="16" fill="#173627" stroke="#abff44" stroke-opacity="0.2"/>
          <text x="20" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="600" fill="#fffeeb">"10:00 AM works perfect!"</text>
        </g>

        <!-- Message 4: Interactive Booking Confirmed Card -->
        <g transform="translate(24, 344)">
          <rect width="632" height="206" rx="18" fill="#12432f" fill-opacity="0.95" stroke="#abff44" stroke-opacity="0.65" stroke-width="2"/>
          
          <!-- Badge -->
          <g transform="translate(24, 20)">
            <rect width="180" height="28" rx="14" fill="#abff44" fill-opacity="0.25"/>
            <circle cx="16" cy="14" r="5" fill="#abff44"/>
            <text x="28" y="19" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="900" fill="#abff44" letter-spacing="1">RESERVATION CONFIRMED</text>
          </g>

          <text x="24" y="80" font-family="'Segoe UI', Arial, sans-serif" font-size="22" font-weight="900" fill="#fffeeb">Enterprise Onboarding Audit</text>
          <text x="24" y="108" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" fill="#abff44">📅 Tuesday, 10:00 AM - 10:45 AM EST</text>
          
          <g transform="translate(24, 134)">
            ${ICONS.check(0, 0, '#abff44', 18)}
            <text x="26" y="14" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#cbd5e1">Google Calendar invite automatically sent to customer email</text>
          </g>
          
          <g transform="translate(24, 162)">
            ${ICONS.check(0, 0, '#abff44', 18)}
            <text x="26" y="14" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#cbd5e1">Verified lead details &amp; phone pushed directly into CRM</text>
          </g>

          <g transform="translate(540, 90)">
            <circle cx="36" cy="36" r="36" fill="#abff44" fill-opacity="0.18"/>
            ${ICONS.calendar(18, 16, '#abff44', 36)}
          </g>
        </g>
      </g>
    `,
  });
}

// POST 3: Chatbot Failure vs Crescelo
function getPost3Svg() {
  return createBaseFrame({
    index: '03/09',
    pill: 'THE NEW PARADIGM',
    hookTitle: 'WHY 94% OF WEBSITE',
    hookHighlight: 'CHATBOTS GET IGNORED.',
    subtitle: 'Visitors reject scripted FAQ widgets. They demand action-oriented AI agents.',
    ctaText: 'Swipe to see the difference',
    contentSvg: `
      <!-- Card Container -->
      <rect width="952" height="664" rx="24" fill="#0b241a" fill-opacity="0.8" stroke="#abff44" stroke-opacity="0.25" stroke-width="1.5"/>

      <!-- 3 Critical Transformation Rows -->
      <g transform="translate(48, 44)">
        
        <!-- Row 1 -->
        <g transform="translate(0, 0)">
          <rect width="856" height="166" rx="16" fill="#06170e" stroke="#ffffff" stroke-opacity="0.08"/>
          <text x="24" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#94a3b8" letter-spacing="1.2">DIMENSION 01 • PRIMARY OBJECTIVE</text>
          
          <g transform="translate(24, 48)">
            <!-- Left Bad -->
            <rect width="388" height="96" rx="12" fill="#1b1212" stroke="#ef4444" stroke-opacity="0.35"/>
            ${ICONS.cross(18, 18, '#ef4444', 24)}
            <text x="52" y="34" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="800" fill="#f87171">Old FAQ Chatbots (Passive)</text>
            <text x="52" y="58" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">Spits links to help center articles.</text>
            <text x="52" y="78" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#ef4444">Result: 85% of visitors leave the page.</text>

            <!-- Right Good -->
            <rect x="416" width="392" height="96" rx="12" fill="#103626" stroke="#abff44" stroke-opacity="0.5" stroke-width="1.5"/>
            ${ICONS.check(434, 18, '#abff44', 24)}
            <text x="468" y="34" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="800" fill="#abff44">Crescelo Agent (Action-Driven)</text>
            <text x="468" y="58" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#fffeeb">Embeds interactive calendar &amp; collects contact.</text>
            <text x="468" y="78" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#abff44">Result: 3.4x higher conversion into revenue.</text>
          </g>
        </g>

        <!-- Row 2 -->
        <g transform="translate(0, 186)">
          <rect width="856" height="166" rx="16" fill="#06170e" stroke="#ffffff" stroke-opacity="0.08"/>
          <text x="24" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#94a3b8" letter-spacing="1.2">DIMENSION 02 • ACCURACY &amp; FACT GROUNDING</text>
          
          <g transform="translate(24, 48)">
            <rect width="388" height="96" rx="12" fill="#1b1212" stroke="#ef4444" stroke-opacity="0.35"/>
            ${ICONS.cross(18, 18, '#ef4444', 24)}
            <text x="52" y="34" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="800" fill="#f87171">Generic AI Wrappers</text>
            <text x="52" y="58" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">Hallucinates prices &amp; invents policies.</text>
            <text x="52" y="78" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#ef4444">Severe liability risk for real businesses.</text>

            <rect x="416" width="392" height="96" rx="12" fill="#103626" stroke="#abff44" stroke-opacity="0.5" stroke-width="1.5"/>
            ${ICONS.check(434, 18, '#abff44', 24)}
            <text x="468" y="34" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="800" fill="#abff44">Hybrid Dense+Sparse RAG</text>
            <text x="468" y="58" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#fffeeb">100% grounded in your uploaded docs.</text>
            <text x="468" y="78" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#abff44">Zero hallucinations. Cites exact verified sources.</text>
          </g>
        </g>

        <!-- Row 3 -->
        <g transform="translate(0, 372)">
          <rect width="856" height="166" rx="16" fill="#06170e" stroke="#ffffff" stroke-opacity="0.08"/>
          <text x="24" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#94a3b8" letter-spacing="1.2">DIMENSION 03 • HIGH-VALUE ESCALATION</text>
          
          <g transform="translate(24, 48)">
            <rect width="388" height="96" rx="12" fill="#1b1212" stroke="#ef4444" stroke-opacity="0.35"/>
            ${ICONS.cross(18, 18, '#ef4444', 24)}
            <text x="52" y="34" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="800" fill="#f87171">Infinite Dead-End Loops</text>
            <text x="52" y="58" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">"Sorry, I did not understand. Try again."</text>
            <text x="52" y="78" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#ef4444">Frustrates enterprise buyers into leaving.</text>

            <rect x="416" width="392" height="96" rx="12" fill="#103626" stroke="#abff44" stroke-opacity="0.5" stroke-width="1.5"/>
            ${ICONS.check(434, 18, '#abff44', 24)}
            <text x="468" y="34" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="800" fill="#abff44">1-Click Live Operator Takeover</text>
            <text x="468" y="58" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#fffeeb">Alerts human team instantly on hot leads.</text>
            <text x="468" y="78" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#abff44">Staff claims thread in 1-click. AI steps aside.</text>
          </g>
        </g>

      </g>
    `,
  });
}

// POST 4: 60-Second Multi-Format Ingestion
function getPost4Svg() {
  return createBaseFrame({
    index: '04/09',
    pill: 'HYBRID RAG BRAIN',
    hookTitle: 'TRAIN ON YOUR BUSINESS',
    hookHighlight: 'IN UNDER 60 SECONDS.',
    subtitle: 'Drop in your raw files. Crescelo parses structure, generates vectors, and goes live.',
    ctaText: 'Swipe to see supported formats',
    contentSvg: `
      <!-- Card Container -->
      <rect width="952" height="664" rx="24" fill="#0b241a" fill-opacity="0.8" stroke="#abff44" stroke-opacity="0.25" stroke-width="1.5"/>

      <g transform="translate(48, 48)">
        
        <!-- Left 4 File Format Cards -->
        <g transform="translate(0, 0)">
          <!-- PDF Card -->
          <g transform="translate(0, 0)">
            <rect width="260" height="120" rx="14" fill="#071c12" stroke="#abff44" stroke-opacity="0.35"/>
            ${ICONS.file(20, 20, '#abff44', 32)}
            <text x="64" y="42" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="800" fill="#fffeeb">PDF &amp; DOCX</text>
            <text x="20" y="76" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">Heading-aware hierarchy &amp;</text>
            <text x="20" y="96" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">sliding token window extraction</text>
          </g>

          <!-- CSV Card -->
          <g transform="translate(0, 140)">
            <rect width="260" height="120" rx="14" fill="#071c12" stroke="#abff44" stroke-opacity="0.35"/>
            ${ICONS.database(20, 20, '#abff44', 32)}
            <text x="64" y="42" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="800" fill="#fffeeb">CSV Catalogs</text>
            <text x="20" y="76" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">Row-aware semantic serialization</text>
            <text x="20" y="96" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">preserving full pricing context</text>
          </g>

          <!-- JSON API Card -->
          <g transform="translate(0, 280)">
            <rect width="260" height="120" rx="14" fill="#071c12" stroke="#abff44" stroke-opacity="0.35"/>
            ${ICONS.code(20, 20, '#abff44', 32)}
            <text x="64" y="42" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="800" fill="#fffeeb">JSON Schemas</text>
            <text x="20" y="76" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">Hierarchical tree flattening</text>
            <text x="20" y="96" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">for real-time API integrations</text>
          </g>

          <!-- Web URLs Card -->
          <g transform="translate(0, 420)">
            <rect width="260" height="120" rx="14" fill="#071c12" stroke="#abff44" stroke-opacity="0.35"/>
            ${ICONS.globe(20, 20, '#abff44', 32)}
            <text x="64" y="42" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="800" fill="#fffeeb">Websites &amp; URLs</text>
            <text x="20" y="76" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">Automated DOM site scraper</text>
            <text x="20" y="96" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">with boilerplate stripping</text>
          </g>
        </g>

        <!-- Center Arrow & Engine Core -->
        <g transform="translate(290, 160)">
          <line x1="0" y1="120" x2="80" y2="120" stroke="#abff44" stroke-width="4" stroke-dasharray="6 4"/>
          <polygon points="80,110 100,120 80,130" fill="#abff44"/>

          <!-- Core Brain Box -->
          <g transform="translate(110, 0)">
            <rect width="456" height="240" rx="20" fill="#12432f" fill-opacity="0.9" stroke="#abff44" stroke-opacity="0.65" stroke-width="2"/>
            
            <circle cx="228" cy="56" r="32" fill="#abff44" fill-opacity="0.2"/>
            ${ICONS.lightning(212, 40, '#abff44', 32)}

            <text x="228" y="118" font-family="'Segoe UI', Arial, sans-serif" font-size="20" font-weight="900" fill="#fffeeb" text-anchor="middle">CRESCELO HYBRID RAG</text>
            <text x="228" y="146" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="700" fill="#abff44" text-anchor="middle">384-Dim Local CPU Embeddings</text>
            
            <line x1="40" y1="168" x2="416" y2="168" stroke="#abff44" stroke-opacity="0.25"/>

            <text x="228" y="196" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#cbd5e1" text-anchor="middle">Dense Cosine Similarity + Sparse BM25 Keyword Search</text>
            <text x="228" y="218" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#abff44" text-anchor="middle">Reciprocal Rank Fusion (RRF k=60)</text>
          </g>
        </g>

        <!-- Bottom Guarantee Badge -->
        <g transform="translate(400, 440)">
          <rect width="456" height="100" rx="16" fill="#071c12" stroke="#abff44" stroke-opacity="0.45" stroke-width="1.3"/>
          ${ICONS.shield(24, 22, '#abff44', 32)}
          <text x="68" y="38" font-family="'Segoe UI', Arial, sans-serif" font-size="16" font-weight="800" fill="#abff44">100% Policy Grounded Guarantee</text>
          <text x="68" y="62" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">The agent only answers what is in your files.</text>
          <text x="68" y="82" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#fffeeb">Zero hallucinations. Full corporate governance.</text>
        </g>

      </g>
    `,
  });
}

// POST 5: The Crescelo Flagship Manifesto (Center of 3x3 Grid)
function getPost5Svg() {
  return createBaseFrame({
    index: '05/09',
    pill: 'CRESCELO MANIFESTO',
    hookTitle: 'BUILT FOR REVENUE,',
    hookHighlight: 'NOT JUST SMALL TALK.',
    subtitle: 'The universal AI website assistant engineered specifically for modern service businesses.',
    ctaText: 'Save this post',
    contentSvg: `
      <!-- Card Container -->
      <rect width="952" height="664" rx="24" fill="#0a2217" fill-opacity="0.85" stroke="#abff44" stroke-opacity="0.4" stroke-width="2"/>

      <!-- Center Logo & Aura -->
      <g transform="translate(376, 24)">
        <circle cx="100" cy="100" r="95" fill="#abff44" fill-opacity="0.1"/>
        <circle cx="100" cy="100" r="75" fill="#abff44" fill-opacity="0.18"/>
        ${getBrandMark(50, 50, 100)}
      </g>

      <!-- 4 Pillars Grid -->
      <g transform="translate(48, 252)">
        
        <!-- Pillar 1 -->
        <g transform="translate(0, 0)">
          <rect width="414" height="172" rx="16" fill="#06180e" stroke="#abff44" stroke-opacity="0.35"/>
          ${ICONS.calendar(24, 20, '#abff44', 32)}
          <text x="68" y="42" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="800" fill="#fffeeb">1. Action-Driven Booking</text>
          
          <text x="24" y="80" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">Embeds live calendar slots directly in the chat.</text>
          <text x="24" y="102" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">Instant Google &amp; Outlook calendar sync.</text>
          <text x="24" y="140" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#abff44">→ Converts 3.4x higher than static forms</text>
        </g>

        <!-- Pillar 2 -->
        <g transform="translate(442, 0)">
          <rect width="414" height="172" rx="16" fill="#06180e" stroke="#abff44" stroke-opacity="0.35"/>
          ${ICONS.lightning(24, 20, '#abff44', 32)}
          <text x="68" y="42" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="800" fill="#fffeeb">2. True 0% Token Markup</text>
          
          <text x="24" y="80" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">Bring Your Own Key (Gemini, Groq, OpenAI).</text>
          <text x="24" y="102" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">Pay raw wholesale prices with $0 middleman fees.</text>
          <text x="24" y="140" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#abff44">→ Eliminates 800% reseller markup tax</text>
        </g>

        <!-- Pillar 3 -->
        <g transform="translate(0, 192)">
          <rect width="414" height="172" rx="16" fill="#06180e" stroke="#abff44" stroke-opacity="0.35"/>
          ${ICONS.lock(24, 20, '#abff44', 32)}
          <text x="68" y="42" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="800" fill="#fffeeb">3. Zero-Conflict Mutex</text>
          
          <text x="24" y="80" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">In-memory lock and database unique constraints.</text>
          <text x="24" y="102" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">Guarantees zero double-booking ever happens.</text>
          <text x="24" y="140" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#abff44">→ Enterprise-grade appointment reliability</text>
        </g>

        <!-- Pillar 4 -->
        <g transform="translate(442, 192)">
          <rect width="414" height="172" rx="16" fill="#06180e" stroke="#abff44" stroke-opacity="0.35"/>
          ${ICONS.user(24, 20, '#abff44', 32)}
          <text x="68" y="42" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="800" fill="#fffeeb">4. 1-Click Human Takeover</text>
          
          <text x="24" y="80" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">Instant alerts on high-intent enterprise deals.</text>
          <text x="24" y="102" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">Staff claims the thread in 1 click. AI pauses.</text>
          <text x="24" y="140" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#abff44">→ Zero customer friction hybrid support</text>
        </g>

      </g>
    `,
  });
}

// POST 6: Concurrency Mutex Booking
function getPost6Svg() {
  return createBaseFrame({
    index: '06/09',
    pill: 'TECH ARCHITECTURE',
    hookTitle: 'NEVER DOUBLE-BOOK AGAIN:',
    hookHighlight: 'CONCURRENCY MUTEX TECH.',
    subtitle: 'What happens when two clients try to book the same 2:00 PM slot simultaneously?',
    ctaText: 'Swipe to see how it works',
    contentSvg: `
      <!-- Card Container -->
      <rect width="952" height="664" rx="24" fill="#0b241a" fill-opacity="0.8" stroke="#abff44" stroke-opacity="0.25" stroke-width="1.5"/>

      <!-- Race Condition Diagram -->
      <g transform="translate(48, 40)">
        
        <!-- Top: Flaw in Other Bots -->
        <g transform="translate(0, 0)">
          <rect width="856" height="210" rx="16" fill="#141111" stroke="#ef4444" stroke-opacity="0.35"/>
          <text x="24" y="32" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#f87171" letter-spacing="1">THE FLAW IN OTHER CHATBOTS • RACE CONDITIONS</text>
          
          <g transform="translate(24, 52)">
            <!-- Visitor A -->
            <rect width="250" height="64" rx="10" fill="#1f1818"/>
            <text x="16" y="26" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#fffeeb">Visitor A (Mobile)</text>
            <text x="16" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#94a3b8">Clicks "2:00 PM Tuesday"</text>

            <!-- Visitor B -->
            <rect x="0" y="74" width="250" height="64" rx="10" fill="#1f1818"/>
            <text x="16" y="100" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#fffeeb">Visitor B (Desktop)</text>
            <text x="16" y="122" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#94a3b8">Clicks "2:00 PM Tuesday" at same second</text>

            <!-- Arrow -->
            <line x1="270" y1="70" x2="330" y2="70" stroke="#ef4444" stroke-width="2.5" stroke-dasharray="4 2"/>
            
            <!-- Result Box -->
            <rect x="350" y="10" width="460" height="120" rx="12" fill="#2d1515" stroke="#ef4444" stroke-opacity="0.6"/>
            ${ICONS.cross(374, 30, '#ef4444', 28)}
            <text x="414" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="800" fill="#fca5a5">Embarrassing Double-Booking</text>
            <text x="374" y="80" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">Both clients receive confirmations. Your staff has to</text>
            <text x="374" y="102" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">email one to apologize and reschedule. Highly unprofessional.</text>
          </g>
        </g>

        <!-- Bottom: Crescelo Solution -->
        <g transform="translate(0, 236)">
          <rect width="856" height="352" rx="16" fill="#061b11" stroke="#abff44" stroke-opacity="0.45" stroke-width="1.5"/>
          <text x="24" y="34" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="900" fill="#abff44" letter-spacing="1">CRESCELO CONCURRENCY MUTEX &amp; DB CONSTRAINTS</text>

          <g transform="translate(24, 58)">
            
            <!-- Step 1 -->
            <rect width="250" height="256" rx="14" fill="#0d2e1f" stroke="#abff44" stroke-opacity="0.3"/>
            <circle cx="36" cy="34" r="16" fill="#abff44" fill-opacity="0.2"/>
            <text x="36" y="40" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="900" fill="#abff44" text-anchor="middle">1</text>
            <text x="64" y="40" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="800" fill="#fffeeb">In-Memory Lock</text>
            
            <text x="20" y="82" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">The microsecond Visitor A clicks,</text>
            <text x="20" y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">an in-memory temporal Mutex</text>
            <text x="20" y="126" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">locks the slot cluster-wide.</text>
            
            <rect x="20" y="174" width="210" height="48" rx="8" fill="#071b12"/>
            <text x="32" y="204" font-family="'Consolas', monospace" font-size="12" fill="#abff44">lock = acquire(slotId)</text>

            <!-- Step 2 -->
            <rect x="274" width="250" height="256" rx="14" fill="#0d2e1f" stroke="#abff44" stroke-opacity="0.3"/>
            <circle cx="310" cy="34" r="16" fill="#abff44" fill-opacity="0.2"/>
            <text x="310" y="40" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="900" fill="#abff44" text-anchor="middle">2</text>
            <text x="338" y="40" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="800" fill="#fffeeb">Database Constraint</text>
            
            <text x="294" y="82" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">Postgres enforces unique slot</text>
            <text x="294" y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">row constraints. Visitor B is</text>
            <text x="294" y="126" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">auto-routed to next opening.</text>

            <rect x="294" y="174" width="210" height="48" rx="8" fill="#071b12"/>
            <text x="306" y="204" font-family="'Consolas', monospace" font-size="11" fill="#abff44">UNIQUE(agent_id, time)</text>

            <!-- Step 3 -->
            <rect x="548" width="250" height="256" rx="14" fill="#0d2e1f" stroke="#abff44" stroke-opacity="0.6" stroke-width="1.5"/>
            <circle cx="584" cy="34" r="16" fill="#abff44" fill-opacity="0.2"/>
            <text x="584" y="40" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="900" fill="#abff44" text-anchor="middle">3</text>
            <text x="612" y="40" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="800" fill="#abff44">Zero Conflict Sync</text>
            
            <text x="568" y="82" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#fffeeb">Google Calendar, Outlook,</text>
            <text x="568" y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#fffeeb">and iCal feeds updated</text>
            <text x="568" y="126" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#fffeeb">simultaneously with emails.</text>

            <rect x="568" y="174" width="210" height="48" rx="8" fill="#12432f"/>
            <text x="580" y="204" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#abff44">✓ 100% Conflict Free</text>
          </g>
        </g>

      </g>
    `,
  });
}

// POST 7: Omnichannel Sync
function getPost7Svg() {
  return createBaseFrame({
    index: '07/09',
    pill: 'OMNICHANNEL',
    hookTitle: 'ONE KNOWLEDGE BRAIN.',
    hookHighlight: 'EVERYWHERE CLIENTS TALK.',
    subtitle: 'Deploy across your website, WhatsApp, and Telegram with centralized conversation sync.',
    ctaText: 'Swipe to see the channels',
    contentSvg: `
      <!-- Card Container -->
      <rect width="952" height="664" rx="24" fill="#0b241a" fill-opacity="0.8" stroke="#abff44" stroke-opacity="0.25" stroke-width="1.5"/>

      <!-- Tri-Channel Topology -->
      <g transform="translate(48, 44)">
        
        <!-- Central Brain Hub -->
        <g transform="translate(266, 16)">
          <rect width="324" height="136" rx="20" fill="#12432f" stroke="#abff44" stroke-opacity="0.75" stroke-width="2"/>
          ${ICONS.lightning(148, 16, '#abff44', 32)}
          <text x="162" y="82" font-family="'Segoe UI', Arial, sans-serif" font-size="19" font-weight="900" fill="#fffeeb" text-anchor="middle">CRESCELO UNIFIED CORE</text>
          <text x="162" y="108" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#abff44" text-anchor="middle">Single Source of Truth &amp; Memory</text>
        </g>

        <!-- Connecting Lines -->
        <path d="M 320 152 L 140 236" stroke="#abff44" stroke-width="2" stroke-opacity="0.4" stroke-dasharray="4 4"/>
        <path d="M 428 152 L 428 236" stroke="#abff44" stroke-width="2" stroke-opacity="0.4" stroke-dasharray="4 4"/>
        <path d="M 536 152 L 716 236" stroke="#abff44" stroke-width="2" stroke-opacity="0.4" stroke-dasharray="4 4"/>

        <!-- 3 Channels -->
        <g transform="translate(0, 236)">
          
          <!-- Channel 1: Web Widget -->
          <g transform="translate(0, 0)">
            <rect width="268" height="326" rx="18" fill="#071b12" stroke="#abff44" stroke-opacity="0.35"/>
            <circle cx="44" cy="44" r="22" fill="#abff44" fill-opacity="0.15"/>
            ${ICONS.globe(28, 28, '#abff44', 32)}
            <text x="80" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="800" fill="#fffeeb">Web Widget</text>
            
            <g transform="translate(20, 92)">
              <text y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">• Zero-dependency script</text>
              <text y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">• Isolated Shadow DOM</text>
              <text y="76" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">• Real-time SSE streaming</text>
              <text y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">• Native mobile responsive</text>
              
              <rect y="148" width="228" height="44" rx="10" fill="#12432f"/>
              <text x="114" y="176" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#abff44" text-anchor="middle">1-Line HTML Embed</text>
            </g>
          </g>

          <!-- Channel 2: WhatsApp Cloud -->
          <g transform="translate(294, 0)">
            <rect width="268" height="326" rx="18" fill="#071b12" stroke="#abff44" stroke-opacity="0.5" stroke-width="1.6"/>
            <circle cx="44" cy="44" r="22" fill="#abff44" fill-opacity="0.15"/>
            ${ICONS.phone(28, 28, '#abff44', 32)}
            <text x="80" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="800" fill="#fffeeb">WhatsApp Cloud</text>
            
            <g transform="translate(20, 92)">
              <text y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">• Official Meta Cloud API</text>
              <text y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">• Instant automated replies</text>
              <text y="76" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">• HMAC signature verify</text>
              <text y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">• Direct calendar links</text>
              
              <rect y="148" width="228" height="44" rx="10" fill="#12432f"/>
              <text x="114" y="176" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#abff44" text-anchor="middle">Meta Webhook Live</text>
            </g>
          </g>

          <!-- Channel 3: Telegram Bot -->
          <g transform="translate(588, 0)">
            <rect width="268" height="326" rx="18" fill="#071b12" stroke="#abff44" stroke-opacity="0.35"/>
            <circle cx="44" cy="44" r="22" fill="#abff44" fill-opacity="0.15"/>
            ${ICONS.code(28, 28, '#abff44', 32)}
            <text x="80" y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="800" fill="#fffeeb">Telegram Bot API</text>
            
            <g transform="translate(20, 92)">
              <text y="20" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">• Zero server setup</text>
              <text y="48" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">• Secret header validation</text>
              <text y="76" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">• Rich markdown formatting</text>
              <text y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">• Operator live takeover</text>
              
              <rect y="148" width="228" height="44" rx="10" fill="#12432f"/>
              <text x="114" y="176" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#abff44" text-anchor="middle">Instant Bot Connector</text>
            </g>
          </g>

        </g>

      </g>
    `,
  });
}

// POST 8: 1-Click Human Takeover
function getPost8Svg() {
  return createBaseFrame({
    index: '08/09',
    pill: 'HUMAN-IN-THE-LOOP',
    hookTitle: 'AI HANDLES THE 80%.',
    hookHighlight: 'YOUR TEAM CLOSES THE VIPS.',
    subtitle: 'High-touch customer care meets autonomous speed. Never let high-value deals slip away.',
    ctaText: 'Swipe to see the handoff',
    contentSvg: `
      <!-- Card Container -->
      <rect width="952" height="664" rx="24" fill="#0b241a" fill-opacity="0.8" stroke="#abff44" stroke-opacity="0.25" stroke-width="1.5"/>

      <!-- Operator Dashboard Mockup -->
      <g transform="translate(48, 44)">
        <rect width="856" height="574" rx="20" fill="#06170e" stroke="#abff44" stroke-opacity="0.35" stroke-width="1.5"/>

        <!-- Top Operator Bar -->
        <g transform="translate(28, 22)">
          ${ICONS.user(0, 0, '#abff44', 32)}
          <text x="44" y="22" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="900" fill="#fffeeb">Unified Live Operator Console</text>
          
          <rect x="616" y="0" width="184" height="32" rx="16" fill="#12432f" stroke="#abff44" stroke-opacity="0.45"/>
          <circle cx="634" cy="16" r="5" fill="#abff44"/>
          <text x="646" y="21" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="800" fill="#abff44">24 Threads Active</text>
        </g>
        <line x1="0" y1="68" x2="856" y2="68" stroke="#ffffff" stroke-opacity="0.08"/>

        <!-- Active VIP Thread Card -->
        <g transform="translate(28, 88)">
          <rect width="800" height="290" rx="16" fill="#0c271c" stroke="#abff44" stroke-opacity="0.65" stroke-width="1.8"/>

          <!-- High-Intent Badge -->
          <g transform="translate(24, 20)">
            <rect width="186" height="28" rx="14" fill="#f59e0b" fill-opacity="0.2" stroke="#f59e0b" stroke-opacity="0.5"/>
            <circle cx="16" cy="14" r="5" fill="#fbbf24"/>
            <text x="28" y="19" font-family="'Segoe UI', Arial, sans-serif" font-size="11" font-weight="900" fill="#fbbf24" letter-spacing="0.5">ENTERPRISE VIP INTENT</text>
          </g>

          <text x="24" y="80" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="800" fill="#fffeeb">Prospect: David Chen (CTO, 500+ Seat Agency)</text>
          <text x="24" y="104" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#abff44">Deal size detected: $25,000+ • Needs multi-tenant master license</text>

          <!-- Chat snippet -->
          <g transform="translate(24, 126)">
            <rect width="752" height="72" rx="10" fill="#05140c"/>
            <text x="16" y="28" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="800" fill="#94a3b8">David Chen:</text>
            <text x="108" y="28" font-family="'Segoe UI', Arial, sans-serif" font-size="13" fill="#cbd5e1">"We want to deploy this across 40 regional offices. Can someone discuss terms?"</text>
            
            <text x="16" y="54" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#abff44">🤖 Crescelo AI: Automatically pausing bot replies. Alerting enterprise directors...</text>
          </g>

          <!-- Action Button: Claim Conversation -->
          <g transform="translate(24, 218)">
            <rect width="320" height="48" rx="14" fill="#abff44"/>
            <text x="160" y="30" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="900" fill="#04140d" text-anchor="middle">⚡ Claim Conversation Now</text>
            <text x="356" y="30" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="600" fill="#94a3b8">Instant takeover • Zero lag to customer</text>
          </g>
        </g>

        <!-- Bottom Stat Highlights -->
        <g transform="translate(28, 404)">
          <g transform="translate(0, 0)">
            <rect width="250" height="136" rx="14" fill="#0d2e1f"/>
            <text x="24" y="44" font-family="'Segoe UI', Arial, sans-serif" font-size="36" font-weight="900" fill="#abff44">78%</text>
            <text x="24" y="74" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#fffeeb">Autonomous Resolution</text>
            <text x="24" y="98" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#94a3b8">Routine FAQs &amp; bookings</text>
          </g>

          <g transform="translate(275, 0)">
            <rect width="250" height="136" rx="14" fill="#0d2e1f"/>
            <text x="24" y="44" font-family="'Segoe UI', Arial, sans-serif" font-size="36" font-weight="900" fill="#abff44">&lt; 15s</text>
            <text x="24" y="74" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#fffeeb">Staff Notification Speed</text>
            <text x="24" y="98" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#94a3b8">Instant mobile &amp; email alerts</text>
          </g>

          <g transform="translate(550, 0)">
            <rect width="250" height="136" rx="14" fill="#0d2e1f"/>
            <text x="24" y="44" font-family="'Segoe UI', Arial, sans-serif" font-size="36" font-weight="900" fill="#abff44">100%</text>
            <text x="24" y="74" font-family="'Segoe UI', Arial, sans-serif" font-size="14" font-weight="800" fill="#fffeeb">Audit Trail Recorded</text>
            <text x="24" y="98" font-family="'Segoe UI', Arial, sans-serif" font-size="12" fill="#94a3b8">Full transcripts &amp; CRM logs</text>
          </g>
        </g>

      </g>
    `,
  });
}

// POST 9: 60-Second Embed & CTA
function getPost9Svg() {
  return createBaseFrame({
    index: '09/09',
    pill: 'GET STARTED FREE',
    hookTitle: '1 LINE OF JAVASCRIPT.',
    hookHighlight: '60 SECONDS TO LIVE.',
    subtitle: 'Paste onto any website or activate the WordPress plugin. Your AI agent is ready to convert.',
    ctaText: 'Deploy at crescelo.ai',
    contentSvg: `
      <!-- Card Container -->
      <rect width="952" height="664" rx="24" fill="#0b241a" fill-opacity="0.8" stroke="#abff44" stroke-opacity="0.25" stroke-width="1.5"/>

      <g transform="translate(48, 44)">
        
        <!-- Code Box Card -->
        <g transform="translate(0, 0)">
          <rect width="856" height="206" rx="18" fill="#030e07" stroke="#abff44" stroke-opacity="0.45" stroke-width="1.6"/>
          
          <!-- Code Header -->
          <g transform="translate(24, 20)">
            <circle cx="10" cy="10" r="6" fill="#ef4444"/>
            <circle cx="30" cy="10" r="6" fill="#f59e0b"/>
            <circle cx="50" cy="10" r="6" fill="#10b981"/>
            <text x="76" y="15" font-family="'Segoe UI', Arial, sans-serif" font-size="12" font-weight="700" fill="#64748b">embed-crescelo.html</text>
          </g>
          <line x1="0" y1="46" x2="856" y2="46" stroke="#ffffff" stroke-opacity="0.08"/>

          <!-- Code content -->
          <g transform="translate(24, 78)">
            <text font-family="'Consolas', 'Courier New', monospace" font-size="14" fill="#94a3b8">&lt;!-- Paste this before your closing &lt;/body&gt; tag --&gt;</text>
            <text y="36" font-family="'Consolas', 'Courier New', monospace" font-size="17" fill="#fffeeb">
              &lt;script <tspan fill="#abff44">src="https://crescelo.ai/widget.js"</tspan> <tspan fill="#38bdf8">data-assistant="YOUR_ID"</tspan> <tspan fill="#f59e0b">defer</tspan>&gt;&lt;/script&gt;
            </text>
            <text y="80" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="700" fill="#abff44">✓ Works with WordPress • Shopify • Webflow • Framer • Squarespace • Custom Next.js</text>
          </g>
        </g>

        <!-- Big CTA Launch Card -->
        <g transform="translate(0, 236)">
          <rect width="856" height="338" rx="20" fill="#103827" fill-opacity="0.95" stroke="#abff44" stroke-opacity="0.65" stroke-width="2"/>
          
          <g transform="translate(48, 48)">
            <text y="0" font-family="'Segoe UI', Arial, sans-serif" font-size="28" font-weight="900" fill="#fffeeb">Ready to Automate Your Website Conversions?</text>
            <text y="34" font-family="'Segoe UI', Arial, sans-serif" font-size="16" fill="#cbd5e1">Launch your custom-trained assistant with zero upfront token tax.</text>

            <!-- Checklist -->
            <g transform="translate(0, 72)">
              <g transform="translate(0, 0)">
                ${ICONS.check(0, 0, '#abff44', 20)}
                <text x="30" y="16" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" fill="#fffeeb">Free tier available with zero credit card required</text>
              </g>
              <g transform="translate(0, 36)">
                ${ICONS.check(0, 0, '#abff44', 20)}
                <text x="30" y="16" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" fill="#fffeeb">Bring Your Own Key (BYOK) for 100% wholesale provider rates</text>
              </g>
              <g transform="translate(0, 72)">
                ${ICONS.check(0, 0, '#abff44', 20)}
                <text x="30" y="16" font-family="'Segoe UI', Arial, sans-serif" font-size="15" font-weight="700" fill="#fffeeb">Concurrency lock calendar booking and instant lead capture</text>
              </g>
            </g>

            <!-- Big Button -->
            <g transform="translate(0, 184)">
              <rect width="360" height="58" rx="29" fill="#abff44"/>
              <text x="180" y="36" font-family="'Segoe UI', Arial, sans-serif" font-size="18" font-weight="900" fill="#04140d" text-anchor="middle">Get Started Free Today →</text>
              
              <text x="396" y="36" font-family="'Segoe UI', Arial, sans-serif" font-size="17" font-weight="800" fill="#abff44">crescelo.ai</text>
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
  console.log(`Starting generation of 9 Instagram posts...`);
  
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

  console.log('All 9 posts generated successfully!');
}

generateAll().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
