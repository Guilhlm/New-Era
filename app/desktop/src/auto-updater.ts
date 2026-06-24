import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

export type UpdateStatus =
  | 'idle'
  | 'checking'
  | 'available'
  | 'downloading'
  | 'ready'
  | 'error'
  | 'uptodate';

export type UpdateState = {
  disabled: boolean;
  status: UpdateStatus;
  currentVersion: string;
  nextVersion: string | null;
  progress: number | null;
  errorMessage: string | null;
};

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
const UPDATE_STATUS_CHANNEL = 'desktop:update:status-changed';

let state: UpdateState = {
  disabled: !app.isPackaged,
  status: 'idle',
  currentVersion: app.getVersion(),
  nextVersion: null,
  progress: null,
  errorMessage: null,
};

let mainWindowRef: BrowserWindow | null = null;
let checkInterval: ReturnType<typeof setInterval> | null = null;
let ipcRegistered = false;

function setState(partial: Partial<UpdateState>) {
  state = { ...state, ...partial };
  broadcastStatus();
}

function broadcastStatus() {
  if (mainWindowRef && !mainWindowRef.isDestroyed()) {
    mainWindowRef.webContents.send(UPDATE_STATUS_CHANNEL, state);
  }
}

async function checkForUpdates() {
  if (!app.isPackaged || state.disabled) {
    return;
  }
  if (state.status === 'downloading' || state.status === 'ready') {
    return;
  }

  try {
    await autoUpdater.checkForUpdates();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(`checkForUpdates failed: ${message}`);
    setState({ status: 'error', errorMessage: message });
  }
}

function registerIpcHandlers() {
  if (ipcRegistered) {
    return;
  }
  ipcRegistered = true;

  ipcMain.handle('desktop:update:getStatus', () => state);

  ipcMain.handle('desktop:update:check', async () => {
    if (state.disabled) {
      return state;
    }
    await checkForUpdates();
    return state;
  });

  ipcMain.handle('desktop:update:download', async () => {
    if (state.disabled || state.status !== 'available') {
      return state;
    }

    try {
      setState({ status: 'downloading', progress: 0, errorMessage: null });
      await autoUpdater.downloadUpdate();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      log.error(`downloadUpdate failed: ${message}`);
      setState({ status: 'error', errorMessage: message });
    }

    return state;
  });

  ipcMain.handle('desktop:update:install', () => {
    if (state.disabled || state.status !== 'ready') {
      return state;
    }

    autoUpdater.quitAndInstall(false, true);
    return state;
  });
}

function bindAutoUpdaterEvents() {
  autoUpdater.logger = log;
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = false;

  autoUpdater.on('checking-for-update', () => {
    setState({ status: 'checking', errorMessage: null, progress: null });
  });

  autoUpdater.on('update-available', (info) => {
    setState({
      status: 'available',
      nextVersion: info.version,
      errorMessage: null,
      progress: null,
    });
  });

  autoUpdater.on('update-not-available', () => {
    setState({ status: 'uptodate', nextVersion: null, progress: null });
  });

  autoUpdater.on('download-progress', (progress) => {
    setState({
      status: 'downloading',
      progress: progress.percent,
    });
  });

  autoUpdater.on('update-downloaded', (info) => {
    setState({
      status: 'ready',
      nextVersion: info.version,
      progress: 100,
    });
  });

  autoUpdater.on('error', (error) => {
    log.error('Auto-update error:', error);
    setState({
      status: 'error',
      errorMessage: error.message,
    });
  });
}

export function initAutoUpdater(mainWindow: BrowserWindow) {
  mainWindowRef = mainWindow;
  registerIpcHandlers();

  if (!app.isPackaged) {
    setState({ disabled: true, status: 'idle' });
    return;
  }

  bindAutoUpdaterEvents();
  void checkForUpdates();

  checkInterval = setInterval(() => {
    void checkForUpdates();
  }, CHECK_INTERVAL_MS);
}
