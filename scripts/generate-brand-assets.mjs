import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const BRAND_DIR = path.resolve('public/brand');
if (!fs.existsSync(BRAND_DIR)) {
  fs.mkdirSync(BRAND_DIR, { recursive: true });
}

// 1. The Pure Crescelo Brand Mark (SVG Vector)
const markSvg = (size = 100) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <defs>
    <linearGradient id="t" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#12432f"/>
      <stop offset="100%" stop-color="#04140d"/>
    </linearGradient>
    <linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f1ffc9"/>
      <stop offset="45%" stop-color="#abff44"/>
      <stop offset="100%" stop-color="#74d321"/>
    </linearGradient>
    <clipPath id="k">
      <rect x="0" y="0" width="100" height="100" rx="26" />
    </clipPath>
  </defs>
  <rect width="100" height="100" rx="26" fill="url(#t)"/>
  <g clip-path="url(#k)">
    <circle cx="50" cy="50" r="38" fill="#abff44" opacity="0.14" />
    <path d="M69.9 33.3 A26 26 0 1 0 69.9 66.7" fill="none" stroke="url(#c)" stroke-width="14" stroke-linecap="round"/>
    <circle cx="63" cy="50" r="5.6" fill="url(#c)"/>
  </g>
  <rect x="1" y="1" width="98" height="98" rx="25" fill="none" stroke="#abff44" stroke-opacity="0.32" stroke-width="2"/>
</svg>`;

// 2. Full-bleed Avatar for Circular Social Profile Cropping (Twitter, LinkedIn, Instagram, etc.)
const avatarFullBleedSvg = (size = 1000) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="${size}" height="${size}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0c2d20"/>
      <stop offset="50%" stop-color="#08251a"/>
      <stop offset="100%" stop-color="#03110b"/>
    </linearGradient>
    <linearGradient id="t" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#144933"/>
      <stop offset="100%" stop-color="#061c13"/>
    </linearGradient>
    <linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f1ffc9"/>
      <stop offset="45%" stop-color="#abff44"/>
      <stop offset="100%" stop-color="#74d321"/>
    </linearGradient>
    <clipPath id="tileClip">
      <rect x="200" y="200" width="600" height="600" rx="156" />
    </clipPath>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="24" stdDeviation="32" flood-color="#000000" flood-opacity="0.5"/>
    </filter>
  </defs>
  <!-- Full bleed circular-safe background -->
  <rect width="1000" height="1000" fill="url(#bgGrad)"/>
  
  <!-- Subtle circular ambient backlight glow -->
  <circle cx="500" cy="500" r="380" fill="#abff44" opacity="0.08" />

  <!-- Centered Crescelo Tile with Drop Shadow -->
  <g filter="url(#shadow)">
    <rect x="200" y="200" width="600" height="600" rx="156" fill="url(#t)"/>
    <g clip-path="url(#tileClip)">
      <circle cx="500" cy="500" r="228" fill="#abff44" opacity="0.14"/>
      <!-- Scaled path: translate(200, 200) scale(6) -->
      <g transform="translate(200, 200) scale(6)">
        <path d="M69.9 33.3 A26 26 0 1 0 69.9 66.7" fill="none" stroke="url(#c)" stroke-width="14" stroke-linecap="round"/>
        <circle cx="63" cy="50" r="5.6" fill="url(#c)"/>
      </g>
    </g>
    <rect x="206" y="206" width="588" height="588" rx="150" fill="none" stroke="#abff44" stroke-opacity="0.32" stroke-width="12"/>
  </g>
</svg>`;

// 3. Mark Only (No Background)
const markIconOnlyTransparentSvg = (size = 1000) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">
  <defs>
    <linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f1ffc9"/>
      <stop offset="45%" stop-color="#abff44"/>
      <stop offset="100%" stop-color="#74d321"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="38" fill="#abff44" opacity="0.12"/>
  <path d="M69.9 33.3 A26 26 0 1 0 69.9 66.7" fill="none" stroke="url(#c)" stroke-width="14" stroke-linecap="round"/>
  <circle cx="63" cy="50" r="5.6" fill="url(#c)"/>
</svg>`;

// 4. Horizontal Logo (Dark Background)
const logoHorizontalDarkSvg = (width = 3000, height = 800) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 400" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#08251a"/>
      <stop offset="100%" stop-color="#04140d"/>
    </linearGradient>
    <linearGradient id="t" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#12432f"/>
      <stop offset="100%" stop-color="#04140d"/>
    </linearGradient>
    <linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f1ffc9"/>
      <stop offset="45%" stop-color="#abff44"/>
      <stop offset="100%" stop-color="#74d321"/>
    </linearGradient>
    <clipPath id="k">
      <rect x="150" y="80" width="240" height="240" rx="62" />
    </clipPath>
  </defs>
  <rect width="1500" height="400" fill="url(#bg)"/>
  
  <!-- Crescelo Mark Icon (240x240) -->
  <g>
    <rect x="150" y="80" width="240" height="240" rx="62" fill="url(#t)"/>
    <g clip-path="url(#k)">
      <circle cx="270" cy="200" r="92" fill="#abff44" opacity="0.14" />
      <g transform="translate(150, 80) scale(2.4)">
        <path d="M69.9 33.3 A26 26 0 1 0 69.9 66.7" fill="none" stroke="url(#c)" stroke-width="14" stroke-linecap="round"/>
        <circle cx="63" cy="50" r="5.6" fill="url(#c)"/>
      </g>
    </g>
    <rect x="152" y="82" width="236" height="236" rx="60" fill="none" stroke="#abff44" stroke-opacity="0.32" stroke-width="4.8"/>
  </g>
  
  <!-- Crescelo Wordmark -->
  <text x="440" y="235" font-family="EB Garamond, Georgia, 'Times New Roman', serif" font-size="142" font-weight="600" fill="#fffeeb" letter-spacing="-2">Crescelo</text>
  
  <!-- Subtle Tagline / Subtitle -->
  <text x="446" y="280" font-family="Figtree, system-ui, -apple-system, sans-serif" font-size="28" font-weight="600" fill="#abff44" letter-spacing="1">AI WEBSITE ASSISTANT FOR SERVICE BUSINESSES</text>
</svg>`;

// 5. Horizontal Logo (Signature Cream Light Background #fffeeb)
const logoHorizontalCreamSvg = (width = 3000, height = 800) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 400" width="${width}" height="${height}">
  <defs>
    <linearGradient id="t" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#12432f"/>
      <stop offset="100%" stop-color="#04140d"/>
    </linearGradient>
    <linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f1ffc9"/>
      <stop offset="45%" stop-color="#abff44"/>
      <stop offset="100%" stop-color="#74d321"/>
    </linearGradient>
    <clipPath id="k">
      <rect x="150" y="80" width="240" height="240" rx="62" />
    </clipPath>
  </defs>
  <rect width="1500" height="400" fill="#fffeeb"/>
  
  <!-- Crescelo Mark Icon (240x240) -->
  <g>
    <rect x="150" y="80" width="240" height="240" rx="62" fill="url(#t)"/>
    <g clip-path="url(#k)">
      <circle cx="270" cy="200" r="92" fill="#abff44" opacity="0.14" />
      <g transform="translate(150, 80) scale(2.4)">
        <path d="M69.9 33.3 A26 26 0 1 0 69.9 66.7" fill="none" stroke="url(#c)" stroke-width="14" stroke-linecap="round"/>
        <circle cx="63" cy="50" r="5.6" fill="url(#c)"/>
      </g>
    </g>
    <rect x="152" y="82" width="236" height="236" rx="60" fill="none" stroke="#abff44" stroke-opacity="0.32" stroke-width="4.8"/>
  </g>
  
  <!-- Crescelo Wordmark -->
  <text x="440" y="235" font-family="EB Garamond, Georgia, 'Times New Roman', serif" font-size="142" font-weight="600" fill="#1a1a1a" letter-spacing="-2">Crescelo</text>
  
  <!-- Subtitle -->
  <text x="446" y="280" font-family="Figtree, system-ui, -apple-system, sans-serif" font-size="28" font-weight="600" fill="#0f6e58" letter-spacing="1">AI WEBSITE ASSISTANT FOR SERVICE BUSINESSES</text>
</svg>`;

// 6. Horizontal Logo (Transparent Background - Dark Text)
const logoHorizontalTransparentDarkSvg = (width = 3000, height = 800) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 400" width="${width}" height="${height}">
  <defs>
    <linearGradient id="t" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#12432f"/>
      <stop offset="100%" stop-color="#04140d"/>
    </linearGradient>
    <linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f1ffc9"/>
      <stop offset="45%" stop-color="#abff44"/>
      <stop offset="100%" stop-color="#74d321"/>
    </linearGradient>
    <clipPath id="k">
      <rect x="150" y="80" width="240" height="240" rx="62" />
    </clipPath>
  </defs>
  
  <!-- Crescelo Mark Icon (240x240) -->
  <g>
    <rect x="150" y="80" width="240" height="240" rx="62" fill="url(#t)"/>
    <g clip-path="url(#k)">
      <circle cx="270" cy="200" r="92" fill="#abff44" opacity="0.14" />
      <g transform="translate(150, 80) scale(2.4)">
        <path d="M69.9 33.3 A26 26 0 1 0 69.9 66.7" fill="none" stroke="url(#c)" stroke-width="14" stroke-linecap="round"/>
        <circle cx="63" cy="50" r="5.6" fill="url(#c)"/>
      </g>
    </g>
    <rect x="152" y="82" width="236" height="236" rx="60" fill="none" stroke="#abff44" stroke-opacity="0.32" stroke-width="4.8"/>
  </g>
  
  <text x="440" y="235" font-family="EB Garamond, Georgia, 'Times New Roman', serif" font-size="142" font-weight="600" fill="#1a1a1a" letter-spacing="-2">Crescelo</text>
  <text x="446" y="280" font-family="Figtree, system-ui, -apple-system, sans-serif" font-size="28" font-weight="600" fill="#0f6e58" letter-spacing="1">AI WEBSITE ASSISTANT FOR SERVICE BUSINESSES</text>
</svg>`;

// 7. Horizontal Logo (Transparent Background - White / Light Text)
const logoHorizontalTransparentWhiteSvg = (width = 3000, height = 800) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 400" width="${width}" height="${height}">
  <defs>
    <linearGradient id="t" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#12432f"/>
      <stop offset="100%" stop-color="#04140d"/>
    </linearGradient>
    <linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f1ffc9"/>
      <stop offset="45%" stop-color="#abff44"/>
      <stop offset="100%" stop-color="#74d321"/>
    </linearGradient>
    <clipPath id="k">
      <rect x="150" y="80" width="240" height="240" rx="62" />
    </clipPath>
  </defs>
  
  <!-- Crescelo Mark Icon (240x240) -->
  <g>
    <rect x="150" y="80" width="240" height="240" rx="62" fill="url(#t)"/>
    <g clip-path="url(#k)">
      <circle cx="270" cy="200" r="92" fill="#abff44" opacity="0.14" />
      <g transform="translate(150, 80) scale(2.4)">
        <path d="M69.9 33.3 A26 26 0 1 0 69.9 66.7" fill="none" stroke="url(#c)" stroke-width="14" stroke-linecap="round"/>
        <circle cx="63" cy="50" r="5.6" fill="url(#c)"/>
      </g>
    </g>
    <rect x="152" y="82" width="236" height="236" rx="60" fill="none" stroke="#abff44" stroke-opacity="0.32" stroke-width="4.8"/>
  </g>
  
  <text x="440" y="235" font-family="EB Garamond, Georgia, 'Times New Roman', serif" font-size="142" font-weight="600" fill="#ffffff" letter-spacing="-2">Crescelo</text>
  <text x="446" y="280" font-family="Figtree, system-ui, -apple-system, sans-serif" font-size="28" font-weight="600" fill="#abff44" letter-spacing="1">AI WEBSITE ASSISTANT FOR SERVICE BUSINESSES</text>
</svg>`;

// 8. Twitter / X Header Banner (1500 x 500 px)
const bannerTwitterSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 500" width="1500" height="500">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#08251a"/>
      <stop offset="60%" stop-color="#051a12"/>
      <stop offset="100%" stop-color="#020d09"/>
    </linearGradient>
    <linearGradient id="t" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#12432f"/>
      <stop offset="100%" stop-color="#04140d"/>
    </linearGradient>
    <linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f1ffc9"/>
      <stop offset="45%" stop-color="#abff44"/>
      <stop offset="100%" stop-color="#74d321"/>
    </linearGradient>
    <clipPath id="k">
      <rect x="80" y="160" width="180" height="180" rx="46" />
    </clipPath>
  </defs>
  <rect width="1500" height="500" fill="url(#bg)"/>
  
  <circle cx="1300" cy="250" r="380" fill="#abff44" opacity="0.06"/>
  <circle cx="170" cy="250" r="180" fill="#abff44" opacity="0.08"/>

  <!-- Logo Mark -->
  <g>
    <rect x="80" y="160" width="180" height="180" rx="46" fill="url(#t)"/>
    <g clip-path="url(#k)">
      <circle cx="170" cy="250" r="68" fill="#abff44" opacity="0.14" />
      <g transform="translate(80, 160) scale(1.8)">
        <path d="M69.9 33.3 A26 26 0 1 0 69.9 66.7" fill="none" stroke="url(#c)" stroke-width="14" stroke-linecap="round"/>
        <circle cx="63" cy="50" r="5.6" fill="url(#c)"/>
      </g>
    </g>
    <rect x="82" y="162" width="176" height="176" rx="44" fill="none" stroke="#abff44" stroke-opacity="0.32" stroke-width="3.6"/>
  </g>
  
  <!-- Brand Lockup -->
  <text x="290" y="245" font-family="EB Garamond, Georgia, 'Times New Roman', serif" font-size="84" font-weight="600" fill="#fffeeb" letter-spacing="-1.5">Crescelo</text>
  <text x="294" y="285" font-family="Figtree, system-ui, -apple-system, sans-serif" font-size="20" font-weight="700" fill="#abff44" letter-spacing="1.5">AI WEBSITE ASSISTANT</text>

  <!-- High-Impact Value Proposition on Right -->
  <text x="780" y="215" font-family="EB Garamond, Georgia, 'Times New Roman', serif" font-size="48" font-weight="400" fill="#ffffff" letter-spacing="-1">Answer every visitor.</text>
  <text x="780" y="270" font-family="EB Garamond, Georgia, 'Times New Roman', serif" font-size="50" font-weight="600" font-style="italic" fill="#abff44" letter-spacing="-1">Book the ones who are ready.</text>
  <text x="780" y="315" font-family="Figtree, system-ui, -apple-system, sans-serif" font-size="20" font-weight="500" fill="#8da399">In-chat appointment booking · Grounded RAG · Live human handover</text>
</svg>`;

// 9. LinkedIn Company Banner (1584 x 396 px)
const bannerLinkedInSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1584 396" width="1584" height="396">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#08251a"/>
      <stop offset="50%" stop-color="#051c14"/>
      <stop offset="100%" stop-color="#020e0a"/>
    </linearGradient>
    <linearGradient id="t" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#12432f"/>
      <stop offset="100%" stop-color="#04140d"/>
    </linearGradient>
    <linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f1ffc9"/>
      <stop offset="45%" stop-color="#abff44"/>
      <stop offset="100%" stop-color="#74d321"/>
    </linearGradient>
    <clipPath id="k">
      <rect x="80" y="118" width="160" height="160" rx="42" />
    </clipPath>
  </defs>
  <rect width="1584" height="396" fill="url(#bg)"/>
  
  <circle cx="1400" cy="198" r="320" fill="#abff44" opacity="0.06"/>

  <!-- Logo Mark -->
  <g>
    <rect x="80" y="118" width="160" height="160" rx="42" fill="url(#t)"/>
    <g clip-path="url(#k)">
      <circle cx="160" cy="198" r="60" fill="#abff44" opacity="0.14" />
      <g transform="translate(80, 118) scale(1.6)">
        <path d="M69.9 33.3 A26 26 0 1 0 69.9 66.7" fill="none" stroke="url(#c)" stroke-width="14" stroke-linecap="round"/>
        <circle cx="63" cy="50" r="5.6" fill="url(#c)"/>
      </g>
    </g>
    <rect x="82" y="120" width="156" height="156" rx="40" fill="none" stroke="#abff44" stroke-opacity="0.32" stroke-width="3.2"/>
  </g>
  
  <!-- Brand Lockup -->
  <text x="268" y="200" font-family="EB Garamond, Georgia, 'Times New Roman', serif" font-size="76" font-weight="600" fill="#fffeeb" letter-spacing="-1.5">Crescelo</text>
  <text x="272" y="236" font-family="Figtree, system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="#abff44" letter-spacing="1.5">AI WEBSITE ASSISTANT</text>

  <!-- Right text -->
  <text x="640" y="160" font-family="EB Garamond, Georgia, 'Times New Roman', serif" font-size="38" font-weight="400" fill="#ffffff">Answer every visitor.</text>
  <text x="640" y="210" font-family="EB Garamond, Georgia, 'Times New Roman', serif" font-size="40" font-weight="600" font-style="italic" fill="#abff44">Book the ones who are ready.</text>
  <text x="640" y="255" font-family="Figtree, system-ui, -apple-system, sans-serif" font-size="18" font-weight="400" fill="#8da399">Convert traffic into confirmed calendar bookings 24/7 with zero token tax.</text>
</svg>`;

async function renderPng(svgString, width, height, density = 300) {
  return await sharp(Buffer.from(svgString), { density, limitInputPixels: false })
    .resize(width, height)
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();
}

async function main() {
  console.log('Generating Crescelo HD Brand Assets...');

  // Save Raw SVG Vectors
  fs.writeFileSync(path.join(BRAND_DIR, 'crescelo-mark.svg'), markSvg(512));
  fs.writeFileSync(path.join(BRAND_DIR, 'crescelo-mark-icon-only.svg'), markIconOnlyTransparentSvg(512));
  fs.writeFileSync(path.join(BRAND_DIR, 'crescelo-logo-horizontal-dark.svg'), logoHorizontalDarkSvg(1500, 400));
  fs.writeFileSync(path.join(BRAND_DIR, 'crescelo-logo-horizontal-cream.svg'), logoHorizontalCreamSvg(1500, 400));
  fs.writeFileSync(path.join(BRAND_DIR, 'crescelo-logo-horizontal-transparent-dark.svg'), logoHorizontalTransparentDarkSvg(1500, 400));
  fs.writeFileSync(path.join(BRAND_DIR, 'crescelo-logo-horizontal-transparent-white.svg'), logoHorizontalTransparentWhiteSvg(1500, 400));

  // Render Ultra-HD Raster PNGs
  const assets = [
    // 1. Square Profile Pictures & Avatars
    { file: 'crescelo-avatar-square-4096.png', svg: markSvg(4096), w: 4096, h: 4096, d: 400 },
    { file: 'crescelo-avatar-square-2048.png', svg: markSvg(2048), w: 2048, h: 2048, d: 300 },
    { file: 'crescelo-avatar-square-1080.png', svg: markSvg(1080), w: 1080, h: 1080, d: 300 },
    { file: 'crescelo-avatar-square-512.png',  svg: markSvg(512),  w: 512,  h: 512,  d: 200 },

    // 2. Full-Bleed Profile Picture (Circle-crop friendly for Instagram / Twitter / LinkedIn)
    { file: 'crescelo-avatar-fullbleed-circle-crop-2048.png', svg: avatarFullBleedSvg(2048), w: 2048, h: 2048, d: 300 },
    { file: 'crescelo-avatar-fullbleed-circle-crop-1080.png', svg: avatarFullBleedSvg(1080), w: 1080, h: 1080, d: 300 },

    // 3. Mark Only (Transparent background)
    { file: 'crescelo-mark-transparent-2048.png', svg: markSvg(2048), w: 2048, h: 2048, d: 300 },
    { file: 'crescelo-mark-icon-only-transparent-2048.png', svg: markIconOnlyTransparentSvg(2048), w: 2048, h: 2048, d: 300 },

    // 4. Horizontal Logos
    { file: 'crescelo-logo-horizontal-dark-3000x800.png', svg: logoHorizontalDarkSvg(3000, 800), w: 3000, h: 800, d: 300 },
    { file: 'crescelo-logo-horizontal-cream-3000x800.png', svg: logoHorizontalCreamSvg(3000, 800), w: 3000, h: 800, d: 300 },
    { file: 'crescelo-logo-horizontal-transparent-dark-3000x800.png', svg: logoHorizontalTransparentDarkSvg(3000, 800), w: 3000, h: 800, d: 300 },
    { file: 'crescelo-logo-horizontal-transparent-white-3000x800.png', svg: logoHorizontalTransparentWhiteSvg(3000, 800), w: 3000, h: 800, d: 300 },

    // 5. Social Media Cover Banners
    { file: 'crescelo-banner-twitter-1500x500.png', svg: bannerTwitterSvg, w: 1500, h: 500, d: 300 },
    { file: 'crescelo-banner-linkedin-1584x396.png', svg: bannerLinkedInSvg, w: 1584, h: 396, d: 300 },
  ];

  for (const a of assets) {
    console.log(`Rendering ${a.file} (${a.w}x${a.h})...`);
    const buf = await renderPng(a.svg, a.w, a.h, a.d);
    fs.writeFileSync(path.join(BRAND_DIR, a.file), buf);
  }

  console.log(`\nAll HD brand assets created in ${BRAND_DIR}!`);
}

main().catch(err => {
  console.error('Error generating brand assets:', err);
  process.exit(1);
});
