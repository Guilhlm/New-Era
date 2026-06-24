import { Menu, Tray, nativeImage, type BrowserWindow } from 'electron';
import log from 'electron-log';
import { getBrandIconPath } from './paths';

let tray: Tray | null = null;

function trayIcon() {
  return nativeImage.createFromPath(getBrandIconPath());
}

export function createTray(getWindow: () => BrowserWindow | null, onQuit: () => void) {
  if (tray) return tray;

  const icon = trayIcon();
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.setToolTip('New-Era');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Abrir New-Era',
      click: () => {
        const window = getWindow();
        if (!window) return;
        window.show();
        window.focus();
      },
    },
    { type: 'separator' },
    {
      label: 'Sair',
      click: () => onQuit(),
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => {
    const window = getWindow();
    if (!window) return;
    window.show();
    window.focus();
  });

  log.info('Tray initialized');
  return tray;
}

export function destroyTray() {
  tray?.destroy();
  tray = null;
}
