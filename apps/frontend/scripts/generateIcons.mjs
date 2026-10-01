// Rasterises public/icons/*.svg into the PNG sizes the web app manifest and iOS need.
// Run after editing the SVGs: `node scripts/generateIcons.mjs`
// sharp is resolved through Next.js (which already depends on it), so no extra dependency is needed.
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const sharp = createRequire(require.resolve('next/package.json'))('sharp');

const iconsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');

const outputs = [
  { source: 'icon.svg', file: 'icon-192.png', size: 192 },
  { source: 'icon.svg', file: 'icon-512.png', size: 512 },
  { source: 'icon-maskable.svg', file: 'icon-maskable-512.png', size: 512 },
  { source: 'icon-maskable.svg', file: 'apple-touch-icon.png', size: 180 },
];

for (const { source, file, size } of outputs) {
  await sharp(path.join(iconsDir, source), { density: 384 })
    .resize(size, size)
    .png()
    .toFile(path.join(iconsDir, file));
  console.log(`wrote public/icons/${file}`);
}
