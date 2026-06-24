import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const desktopRoot = join(__dirname, '..');
const staticRoot = join(desktopRoot, 'static');
const distSplash = join(desktopRoot, 'dist', 'splash');

const files = ['splash.html', 'splash.css'];

if (!existsSync(staticRoot)) {
  console.error(`Missing splash static dir: ${staticRoot}`);
  process.exit(1);
}

mkdirSync(distSplash, { recursive: true });

for (const file of files) {
  const src = join(staticRoot, file);
  if (!existsSync(src)) {
    console.error(`Missing splash asset: ${src}`);
    process.exit(1);
  }
  cpSync(src, join(distSplash, file));
}

console.log('Copied splash assets to dist/splash');
