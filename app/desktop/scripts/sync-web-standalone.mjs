import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const desktopRoot = join(__dirname, '..');
const repoRoot = join(desktopRoot, '..', '..');
const webRoot = join(repoRoot, 'app', 'web');
const standaloneRoot = join(webRoot, '.next', 'standalone');
const standaloneWebDir = join(standaloneRoot, 'app', 'web');

function copyDir(from, to) {
  if (!existsSync(from)) {
    console.error(`Missing path: ${from}`);
    process.exit(1);
  }
  mkdirSync(dirname(to), { recursive: true });
  rmSync(to, { recursive: true, force: true });
  cpSync(from, to, { recursive: true });
}

function ensureWebBuild() {
  const serverEntry = join(standaloneWebDir, 'server.js');
  if (existsSync(serverEntry)) {
    return;
  }

  console.log('Next standalone build not found. Running web desktop build...');
  execSync('npm run build:desktop -w app/web', {
    cwd: repoRoot,
    stdio: 'inherit',
    shell: true,
  });
}

function syncStandaloneAssets() {
  const staticSrc = join(webRoot, '.next', 'static');
  const staticDest = join(standaloneWebDir, '.next', 'static');
  const publicSrc = join(webRoot, 'public');
  const publicDest = join(standaloneWebDir, 'public');

  if (!existsSync(staticSrc)) {
    console.error('Missing app/web/.next/static — run: npm run build -w app/web');
    process.exit(1);
  }

  console.log('Syncing Next static assets into standalone...');
  mkdirSync(join(standaloneWebDir, '.next'), { recursive: true });
  copyDir(staticSrc, staticDest);

  if (existsSync(publicSrc)) {
    console.log('Syncing public assets into standalone...');
    copyDir(publicSrc, publicDest);
  }
}

ensureWebBuild();
syncStandaloneAssets();
console.log('Standalone web assets ready for desktop dev.');
