import { app } from 'electron';
import { join } from 'node:path';
import { DESKTOP_PROTOCOL } from './brand';

export function registerDesktopProtocol() {
  if (process.platform === 'win32') {
    if (app.isPackaged) {
      if (!app.isDefaultProtocolClient(DESKTOP_PROTOCOL)) {
        app.setAsDefaultProtocolClient(DESKTOP_PROTOCOL);
      }
      return;
    }

    const entryArg = process.argv[1] ? join(process.argv[1]) : join(process.cwd());
    if (!app.isDefaultProtocolClient(DESKTOP_PROTOCOL, process.execPath, [entryArg])) {
      app.setAsDefaultProtocolClient(DESKTOP_PROTOCOL, process.execPath, [entryArg]);
    }
    return;
  }

  if (!app.isDefaultProtocolClient(DESKTOP_PROTOCOL)) {
    app.setAsDefaultProtocolClient(DESKTOP_PROTOCOL);
  }
}

export function extractProtocolUrl(argv: string[]) {
  const direct = argv.find((arg) => arg.startsWith(`${DESKTOP_PROTOCOL}://`));
  if (direct) {
    return direct;
  }

  for (const arg of argv) {
    if (arg.includes(`${DESKTOP_PROTOCOL}://`)) {
      const index = arg.indexOf(`${DESKTOP_PROTOCOL}://`);
      return arg.slice(index);
    }
  }

  return null;
}
