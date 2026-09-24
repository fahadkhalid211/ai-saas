#!/usr/bin/env node
/**
 * Regenerates the favicon and app icons from the Crescelo orb (app/icon.svg is the source of truth).
 *   node scripts/make-icons.mjs
 */
import fs from 'node:fs';
import sharp from 'sharp';

// Static drawing of the orb, cropped tight so it fills the tab icon. Same geometry as components/brand/CresceloOrb.tsx.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="14 14 72 72" width="64" height="64">
  <defs>
    <radialGradient id="b" cx="34%" cy="28%" r="85%"><stop offset="0%" stop-color="#1d6a4b"/><stop offset="42%" stop-color="#0c3526"/><stop offset="100%" stop-color="#04140d"/></radialGradient>
    <linearGradient id="c" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#f1ffc9"/><stop offset="45%" stop-color="#abff44"/><stop offset="100%" stop-color="#74d321"/></linearGradient>
    <mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><circle cx="50" cy="50" r="25" fill="#fff"/><circle cx="54.5" cy="47.5" r="22.4" fill="#000"/></mask>
    <clipPath id="k"><circle cx="50" cy="50" r="34"/></clipPath>
  </defs>
  <circle cx="50" cy="50" r="35.5" fill="url(#b)"/>
  <circle cx="50" cy="50" r="34.6" fill="none" stroke="#abff44" stroke-opacity="0.45" stroke-width="1.6"/>
  <g clip-path="url(#k)">
    <rect width="100" height="100" fill="url(#c)" mask="url(#m)"/>
    <circle cx="57" cy="51" r="3.6" fill="url(#c)"/>
    <ellipse cx="37" cy="29" rx="10" ry="5.2" transform="rotate(-32 37 29)" fill="#fff" fill-opacity="0.2"/>
  </g>
</svg>
`;

fs.writeFileSync('app/icon.svg', svg);

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
