import { BrowserWindow, nativeImage } from 'electron';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { APP_DISPLAY_NAME } from './brand';
import { getAppDataDir, getBrandIconPath } from './paths';

export type LoadingStepId = 'preparing' | 'database' | 'api' | 'web' | 'ready';

export type LoadingStep = {
  id: LoadingStepId;
  label: string;
  progress: number;
};

export const LOADING_STEPS: Record<LoadingStepId, LoadingStep> = {
  preparing: { id: 'preparing', label: 'Preparing environment...', progress: 15 },
  database: { id: 'database', label: 'Setting up database...', progress: 35 },
  api: { id: 'api', label: 'Starting services...', progress: 60 },
  web: { id: 'web', label: 'Loading interface...', progress: 85 },
  ready: { id: 'ready', label: 'Almost ready...', progress: 100 },
};

let splashWindow: BrowserWindow | null = null;

function resolveWindowIcon() {
  const iconPath = getBrandIconPath();
  if (!existsSync(iconPath)) {
    return undefined;
  }
  const icon = nativeImage.createFromPath(iconPath);
  return icon.isEmpty() ? undefined : icon;
}

function splashHtmlPath() {
  return join(__dirname, 'splash', 'splash.html');
}

export function createSplashWindow(): BrowserWindow {
  if (splashWindow && !splashWindow.isDestroyed()) {
    return splashWindow;
  }

  splashWindow = new BrowserWindow({
    width: 440,
    height: 320,
    frame: false,
    resizable: false,
    center: true,
    show: false,
    title: APP_DISPLAY_NAME,
    icon: resolveWindowIcon(),
    backgroundColor: '#000000',
    webPreferences: {
      preload: join(__dirname, 'splash-preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  splashWindow.once('ready-to-show', () => {
    splashWindow?.show();
    reportLoadingStep(splashWindow, LOADING_STEPS.preparing);
  });

  void splashWindow.loadFile(splashHtmlPath());
  return splashWindow;
}

export function reportLoadingStep(
  window: BrowserWindow | null,
  step: LoadingStep,
) {
  if (!window || window.isDestroyed()) return;
  window.webContents.send('loading:step', step);
}

export function reportLoadingError(
  window: BrowserWindow | null,
  message: string,
) {
  if (!window || window.isDestroyed()) return;
  window.webContents.send('loading:error', {
    message,
    hint: `See logs at ${getAppDataDir()}\\logs`,
  });
}

export function closeSplashWindow(delayMs = 200): Promise<void> {
  return new Promise((resolve) => {
    if (!splashWindow || splashWindow.isDestroyed()) {
      splashWindow = null;
      resolve();
      return;
    }

    const window = splashWindow;
    splashWindow = null;

    setTimeout(() => {
      if (!window.isDestroyed()) {
        window.close();
      }
      resolve();
    }, delayMs);
  });
}

export function getSplashWindow() {
  return splashWindow;
}
