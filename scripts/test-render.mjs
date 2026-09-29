import sharp from 'sharp';
import fs from 'fs';

const svg = `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#08251a"/>
      <stop offset="100%" stop-color="#04140d"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1080" fill="url(#bg)"/>
  <circle cx="540" cy="540" r="260" fill="#abff44" opacity="0.12"/>
  <text x="540" y="540" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="bold" fill="#fffeeb" text-anchor="middle">CRESCELO AI</text>
</svg>`;

async function run() {
  await sharp(Buffer.from(svg)).png().toFile('test-render.png');
  console.log('SUCCESS: test-render.png created, size:', fs.statSync('test-render.png').size);
  fs.unlinkSync('test-render.png');
}

run();
