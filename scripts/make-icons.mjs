#!/usr/bin/env node
/**
 * Regenerates the favicon and app icons from the Crescelo C mark (app/icon.svg is the source of truth).
 *   node scripts/make-icons.mjs
 */
import fs from 'node:fs';
import sharp from 'sharp';

// Static drawing of the Crescelo "C" mark. Same geometry as components/brand/CresceloMark.tsx.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="64" height="64">
  <defs>
    <linearGradient id="t" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#12432f"/><stop offset="100%" stop-color="#04140d"/></linearGradient>
    <linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f1ffc9"/><stop offset="45%" stop-color="#abff44"/><stop offset="100%" stop-color="#74d321"/></linearGradient>
  </defs>
  <rect width="100" height="100" rx="26" fill="url(#t)"/>
  <path d="M69.9 33.3 A26 26 0 1 0 69.9 66.7" fill="none" stroke="url(#c)" stroke-width="15" stroke-linecap="round"/>
  <circle cx="63" cy="50" r="6" fill="url(#c)"/>
  <rect x="1" y="1" width="98" height="98" rx="25" fill="none" stroke="#abff44" stroke-opacity="0.28" stroke-width="2"/>
</svg>
`;

fs.writeFileSync('app/icon.svg', svg);
fs.writeFileSync('public/icon.svg', svg);
fs.writeFileSync('public/favicon.svg', svg);

const png = (size) => sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png().toBuffer();

const out = {
  'public/favicon-16x16.png': 16,
  'public/favicon-32x32.png': 32,
  'public/apple-touch-icon.png': 180,
  'public/icon-192.png': 192,
  'public/icon-512.png': 512,
};
for (const [file, size] of Object.entries(out)) fs.writeFileSync(file, await png(size));

// favicon.ico: PNG images inside an ICO container (16, 32, 48)
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = images.map((img, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i], 0);
  e.writeUInt8(sizes[i], 1);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(img.length, 8);
  e.writeUInt32LE(offset, 12);
  offset += img.length;
  return e;
});
const ico = Buffer.concat([header, ...entries, ...images]);
fs.writeFileSync('app/favicon.ico', ico);
fs.writeFileSync('public/favicon.ico', ico);
console.log('icons written');
