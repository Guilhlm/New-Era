import {
  app,
  BrowserWindow,
  ipcMain,
  nativeImage,
  shell,
} from 'electron';
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import log from 'electron-log';
import { APP_DISPLAY_NAME, APP_USER_MODEL_ID } from './brand';
import { loadOrCreateConfig } from './config-store';
import { startIpcServer, type IpcServerHandle } from './ipc-server';
import { parseProtocolNotifyUrl, showNativeNotification } from './notifications';
import {
  API_PORT,
  getBrandIconPath,
  WEB_ORIGIN,
  WEB_PORT,
} from './paths';
import {
  runPrismaMigrate,
  SERVICE_STARTUP_TIMEOUT_MS,
  spawnNestApi,
  spawnNextWeb,
  stopManagedProcess,
  waitForHttp,
  type ManagedProcess,
} from './process-runner';
import {
  closeSplashWindow,
  createSplashWindow,
  LOADING_STEPS,
  reportLoadingError,
  reportLoadingStep,
  type LoadingStep,
} from './splash';
import { startDesktopNotificationGenerationLoop } from './notification-generation-loop';
import { extractProtocolUrl, registerDesktopProtocol } from './protocol-registration';
import { initAutoUpdater } from './auto-updater';
import { createTray, destroyTray } from './tray';

log.initialize();
log.info('New-Era desktop starting');

if (process.platform === 'win32') {
  app.setName(APP_DISPLAY_NAME);
  app.setAppUserModelId(APP_USER_MODEL_ID);
}

registerDesktopProtocol();

let mainWindow: BrowserWindow | null = null;
let pendingProtocolHref: string | null = null;
let nestProcess: ManagedProcess | null = null;
let nextProcess: ManagedProcess | null = null;
let ipcServer: IpcServerHandle | null = null;
let quitting = false;

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, argv) => {
    const protocolUrl = extractProtocolUrl(argv);
    if (protocolUrl) {
      handleProtocolNotify(protocolUrl);
    } else if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.on('open-url', (event, url) => {
    event.preventDefault();
    handleProtocolNotify(url);
  });

  app.whenReady().then(async () => {
    const splash = createSplashWindow();

    try {
      await bootstrap((step) => reportLoadingStep(splash, step));
      await createMainWindow();
      if (mainWindow) {
        initAutoUpdater(mainWindow);
      }
      await closeSplashWindow();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error(`Bootstrap failed: ${message}`);
      stopManagedProcess(nextProcess);
      stopManagedProcess(nestProcess);
      nextProcess = null;
      nestProcess = null;
      reportLoadingError(splash, message);
    }
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // keep running in tray on Windows
  }
});

app.on('before-quit', () => {
  quitting = true;
  shutdown();
});

async function bootstrap(onProgress: (step: LoadingStep) => void) {
  onProgress(LOADING_STEPS.preparing);
  const config = loadOrCreateConfig();

  ipcServer = await startIpcServer(config.ipcToken, (payload) => {
    showNativeNotification(payload, () => mainWindow, navigateInApp);
  });

  onProgress(LOADING_STEPS.database);
  await runPrismaMigrate(config);

  onProgress(LOADING_STEPS.api);
  nestProcess = spawnNestApi(config, API_PORT, WEB_PORT);
  await waitForHttp(
    `http://127.0.0.1:${API_PORT}/health`,
    SERVICE_STARTUP_TIMEOUT_MS,
  );

  onProgress(LOADING_STEPS.web);
  nextProcess = spawnNextWeb(config, API_PORT, WEB_PORT);
  await waitForHttp(`${WEB_ORIGIN}/login`, SERVICE_STARTUP_TIMEOUT_MS);

  onProgress(LOADING_STEPS.ready);

  createTray(() => mainWindow, () => {
    quitting = true;
    app.quit();
  });

  startDesktopNotificationGenerationLoop(config, API_PORT);

  const startupProtocolUrl = extractProtocolUrl(process.argv);
  if (startupProtocolUrl) {
    handleProtocolNotify(startupProtocolUrl);
  }

  ipcMain.on('desktop:navigate', (_event, href: string) => {
    navigateInApp(href);
  });
}

function handleProtocolNotify(url: string) {
  const parsed = parseProtocolNotifyUrl(url);
  if (!parsed) return;

  if (!mainWindow) {
    pendingProtocolHref = parsed.href;
    return;
  }

  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
  navigateInApp(parsed.href);
}

function flushPendingProtocolNavigation() {
  if (!pendingProtocolHref || !mainWindow) {
    return;
  }
  const href = pendingProtocolHref;
  pendingProtocolHref = null;
  navigateInApp(href);
}

function resolveWindowIcon() {
  const iconPath = getBrandIconPath();
  if (!existsSync(iconPath)) {
    return undefined;
  }
  const icon = nativeImage.createFromPath(iconPath);
  return icon.isEmpty() ? undefined : icon;
}

function createMainWindow(): Promise<void> {
  return new Promise((resolve, reject) => {
    mainWindow = new BrowserWindow({
      width: 1440,
      height: 900,
      minWidth: 1024,
      minHeight: 720,
      show: false,
      autoHideMenuBar: true,
      title: 'New-Era',
      icon: resolveWindowIcon(),
      webPreferences: {
        preload: join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    mainWindow.on('close', (event) => {
      if (!quitting) {
        event.preventDefault();
        mainWindow?.hide();
      }
    });

    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      if (url.startsWith(WEB_ORIGIN)) {
        return { action: 'allow' };
      }
      void shell.openExternal(url);
      return { action: 'deny' };
    });

    mainWindow.webContents.once('did-fail-load', (_event, _code, description, _validatedURL, isMainFrame) => {
      if (isMainFrame) {
        reject(new Error(description));
      }
    });

    mainWindow.once('ready-to-show', () => {
      mainWindow?.show();
      flushPendingProtocolNavigation();
      resolve();
    });

    void mainWindow.loadURL(`${WEB_ORIGIN}/login`);
  });
}

function navigateInApp(href: string) {
  if (!mainWindow) return;
  const path = href.startsWith('/') ? href : `/${href}`;
  void mainWindow.loadURL(`${WEB_ORIGIN}${path}`);
}

function shutdown() {
  destroyTray();
  ipcServer?.close();
  ipcServer = null;
  stopManagedProcess(nextProcess);
  stopManagedProcess(nestProcess);
  nextProcess = null;
  nestProcess = null;
}
