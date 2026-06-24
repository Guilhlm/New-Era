import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const desktopRoot = join(__dirname, '..');
const resourcesApi = join(desktopRoot, 'resources', 'api');
const desktopPkg = JSON.parse(readFileSync(join(desktopRoot, 'package.json'), 'utf8'));
const electronVersion = String(desktopPkg.devDependencies?.electron ?? '35.7.5').replace(
  /^[\^~]/,
  '',
);

console.log(`=== rebuild-native: bcrypt for Electron ${electronVersion} ===`);

try {
  execSync(
    `npx @electron/rebuild --force --only bcrypt --version ${electronVersion} --project-dir "${resourcesApi}"`,
    { stdio: 'inherit', cwd: desktopRoot, shell: true },
  );
  console.log('=== rebuild-native: done ===');
} catch (error) {
  console.warn(
    '=== rebuild-native: electron-rebuild failed (bcrypt NAPI prebuild may still work) ===',
  );
  console.warn(
    'For a guaranteed native match, install Python 3 and Visual Studio Build Tools, then re-run build:desktop.',
  );
  if (process.env.REQUIRE_NATIVE_REBUILD === '1') {
    throw error;
  }
}
