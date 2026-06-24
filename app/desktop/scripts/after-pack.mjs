import { join } from 'node:path';
import { embedWinIcon } from './embed-win-icon.mjs';

/** electron-builder hook: embed custom icon after win-unpacked is staged */
export default async function afterPack(context) {
  if (context.electronPlatformName !== 'win32') {
    return;
  }

  const exe = join(
    context.appOutDir,
    `${context.packager.appInfo.productFilename}.exe`,
  );
  await embedWinIcon(exe);
}
