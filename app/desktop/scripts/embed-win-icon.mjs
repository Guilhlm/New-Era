import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rcedit } from 'rcedit';

const __dirname = dirname(fileURLToPath(import.meta.url));
const desktopRoot = join(__dirname, '..');

const PRODUCT_NAME = 'New-Era';

function resolveExePath() {
  const fromArg = process.argv[2];
  if (fromArg) {
    return fromArg;
  }
  return join(desktopRoot, 'dist', 'win-unpacked', `${PRODUCT_NAME}.exe`);
}

function resolveIconPath() {
  return join(desktopRoot, 'build', 'icon.ico');
}

export async function embedWinIcon(exePath = resolveExePath()) {
  const iconPath = resolveIconPath();

  if (!existsSync(exePath)) {
    console.error(`Missing executable: ${exePath}`);
    process.exit(1);
  }
  if (!existsSync(iconPath)) {
    console.error(`Missing icon: ${iconPath}`);
    process.exit(1);
  }

  console.log(`=== embed-win-icon: ${exePath} ===`);
  await rcedit(exePath, {
    icon: iconPath,
    'version-string': {
      FileDescription: PRODUCT_NAME,
      ProductName: PRODUCT_NAME,
      InternalName: PRODUCT_NAME,
      OriginalFilename: `${PRODUCT_NAME}.exe`,
    },
  });
  console.log('=== embed-win-icon: done ===');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await embedWinIcon();
}
