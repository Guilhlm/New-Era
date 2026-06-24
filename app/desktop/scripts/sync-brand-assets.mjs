import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const desktopRoot = join(__dirname, '..');
const repoRoot = join(desktopRoot, '..', '..');
const faviconSrc = join(repoRoot, 'app', 'web', 'src', 'app', 'favicon.ico');
const buildDir = join(desktopRoot, 'build');

if (!existsSync(faviconSrc)) {
  console.error(`Missing web favicon: ${faviconSrc}`);
  process.exit(1);
}

mkdirSync(buildDir, { recursive: true });
cpSync(faviconSrc, join(buildDir, 'icon.ico'));
cpSync(faviconSrc, join(buildDir, 'tray.ico'));
console.log('Synced desktop brand icons from app/web/src/app/favicon.ico');
