import { downloadArtifact } from '@electron/get';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, '..', '..', '..');
const electronRoot = join(repoRoot, 'node_modules', 'electron');
const distPath = join(electronRoot, 'dist');
const { version } = JSON.parse(readFileSync(join(electronRoot, 'package.json'), 'utf8'));

function extractZipWindows(zipPath, destination) {
  execFileSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-Command',
      `Expand-Archive -Path '${zipPath.replace(/'/g, "''")}' -DestinationPath '${destination.replace(/'/g, "''")}' -Force`,
    ],
    { stdio: 'inherit' },
  );
}

async function main() {
  if (existsSync(join(distPath, 'electron.exe')) && existsSync(join(electronRoot, 'path.txt'))) {
    return;
  }

  console.log(`Installing Electron ${version} binary...`);
  rmSync(distPath, { recursive: true, force: true });
  mkdirSync(distPath, { recursive: true });

  const zipPath = await downloadArtifact({
    version,
    artifactName: 'electron',
    platform: process.platform === 'win32' ? 'win32' : process.platform,
    arch: process.arch,
    force: !existsSync(join(distPath, 'electron.exe')),
  });

  if (process.platform === 'win32') {
    extractZipWindows(zipPath, distPath);
  } else {
    const { createRequire } = await import('node:module');
    const require = createRequire(import.meta.url);
    const extract = require('extract-zip');
    await extract(zipPath, { dir: distPath });
  }

  const exeName = process.platform === 'win32' ? 'electron.exe' : 'electron';
  writeFileSync(join(electronRoot, 'path.txt'), exeName);
  writeFileSync(join(distPath, 'version'), `v${version}`);

  const exePath = join(distPath, exeName);
  if (!existsSync(exePath)) {
    console.error('Electron binary not found after extract. dist contents:', readdirSync(distPath));
    process.exit(1);
  }

  console.log(`Electron ready: ${exePath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
