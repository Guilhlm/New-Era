import { Notification, nativeImage, type BrowserWindow } from 'electron';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import log from 'electron-log';
import { APP_DISPLAY_NAME, DESKTOP_PROTOCOL } from './brand';
import type { NotifyPayload } from './ipc-server';
import { getBrandIconPath, getCacheDir } from './paths';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toFileUri(filePath: string): string {
  const normalized = filePath.replace(/\\/g, '/');
  return normalized.startsWith('/') ? `file://${normalized}` : `file:///${normalized}`;
}

function getToastIconUri(): string | null {
  const iconPath = getBrandIconPath();
  if (!existsSync(iconPath)) {
    return null;
  }

  const cacheDir = getCacheDir();
  mkdirSync(cacheDir, { recursive: true });
  const pngPath = join(cacheDir, 'toast-icon.png');

  if (!existsSync(pngPath)) {
    const image = nativeImage.createFromPath(iconPath);
    if (image.isEmpty()) {
      return null;
    }
    writeFileSync(pngPath, image.resize({ width: 128, height: 128 }).toPNG());
  }

  return toFileUri(pngPath);
}

function buildWindowsToastXml(payload: NotifyPayload, iconUri: string | null): string {
  const logoImage = iconUri
    ? `<image placement="appLogoOverride" hint-crop="circle" src="${escapeXml(iconUri)}" />`
    : '';

  return `<toast>
  <visual>
    <binding template="ToastGeneric">
      <text hint-style="captionSubtle">${APP_DISPLAY_NAME}</text>
      <text hint-style="title">${escapeXml(payload.title)}</text>
      <text hint-style="body">${escapeXml(payload.body)}</text>
      ${logoImage}
    </binding>
  </visual>
</toast>`;
}

export function parseProtocolNotifyUrl(url: string): { href: string } | null {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== `${DESKTOP_PROTOCOL}:`) {
      return null;
    }
    if (parsed.hostname !== 'notify') {
      return null;
    }
    return {
      href: parsed.searchParams.get('href') ?? '/notifications',
    };
  } catch {
    return null;
  }
}

function focusWindow(getWindow: () => BrowserWindow | null) {
  const window = getWindow();
  if (!window) return;
  if (window.isMinimized()) window.restore();
  window.show();
  window.focus();
}

function showBasicNotification(
  payload: NotifyPayload,
  getWindow: () => BrowserWindow | null,
  navigate: (href: string) => void,
) {
  const options: Electron.NotificationConstructorOptions = {
    title: payload.title,
    body: payload.body,
  };

  const iconPath = getBrandIconPath();
  if (existsSync(iconPath)) {
    options.icon = iconPath;
  }

  const notification = new Notification(options);

  notification.on('click', () => {
    focusWindow(getWindow);
    if (payload.href) {
      navigate(payload.href);
    }
  });

  notification.show();
}

export function showNativeNotification(
  payload: NotifyPayload,
  getWindow: () => BrowserWindow | null,
  navigate: (href: string) => void,
) {
  if (!Notification.isSupported()) {
    log.warn('Native notifications not supported on this platform');
    return;
  }

  log.info(`Showing native notification: ${payload.title}`);

  const href = payload.href ?? '/notifications';
  const onActivate = () => {
    focusWindow(getWindow);
    navigate(href.startsWith('/') ? href : `/${href}`);
  };

  if (process.platform === 'win32') {
    const iconUri = getToastIconUri();
    const notification = new Notification({
      toastXml: buildWindowsToastXml(payload, iconUri),
    });

    notification.on('click', onActivate);
    notification.on('failed', (_event, error) => {
      log.warn(`Windows toast failed (${error}); using basic notification`);
      showBasicNotification(payload, getWindow, navigate);
    });

    notification.show();
    return;
  }

  showBasicNotification(payload, getWindow, navigate);
}
