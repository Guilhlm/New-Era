import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
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
const GITHUB_OWNER = 'Guilhlm';
const GITHUB_REPO = 'New-Era';

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
let updateFeedConfigured = false;

function setState(partial: Partial<UpdateState>) {
  state = { ...state, ...partial };
  broadcastStatus();
}

function broadcastStatus() {
  if (mainWindowRef && !mainWindowRef.isDestroyed()) {
    mainWindowRef.webContents.send(UPDATE_STATUS_CHANNEL, state);
  }
}

function loadGithubUpdateToken(): string | undefined {
  if (!app.isPackaged) {
    return undefined;
  }

  const configPath = join(process.resourcesPath, 'update-config.json');
  if (!existsSync(configPath)) {
    return undefined;
  }

  try {
    const parsed = JSON.parse(readFileSync(configPath, 'utf8')) as {
      githubToken?: string;
    };
    return parsed.githubToken?.trim() || undefined;
  } catch {
    return undefined;
  }
}

function configureUpdateFeed() {
  if (updateFeedConfigured) {
    return;
  }

  const token = loadGithubUpdateToken();
  autoUpdater.setFeedURL({
    provider: 'github',
    owner: GITHUB_OWNER,
    repo: GITHUB_REPO,
    ...(token ? { private: true, token } : {}),
  });

  updateFeedConfigured = true;

  if (token) {
    log.info('Auto-update feed configured with GitHub token (private repo).');
    return;
  }

  log.info('Auto-update feed configured without token (public repo required).');
}

function isMissingReleaseFeedError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('No published versions');
}

function formatUpdateError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  if (message.includes('404') && message.includes('releases')) {
    if (!loadGithubUpdateToken()) {
      return 'Repositório GitHub privado sem token de update. Torne o repo público ou configure o secret DESKTOP_UPDATE_GH_TOKEN no CI. Enquanto isso, baixe o instalador em Releases.';
    }
  }

  return message;
}

function handleUpdateCheckError(error: unknown) {
  if (isMissingReleaseFeedError(error)) {
    log.info('No published GitHub release yet; in-app update check skipped.');
    setState({
      status: 'uptodate',
      nextVersion: null,
      progress: null,
      errorMessage: null,
    });
    return;
  }

  const message = formatUpdateError(error);
  log.warn(`Update check failed: ${message}`);
  setState({ status: 'error', errorMessage: message });
}

async function checkForUpdates() {
  if (!app.isPackaged || state.disabled) {
    return;
  }
  if (state.status === 'downloading' || state.status === 'ready') {
    return;
  }

  try {
    configureUpdateFeed();
    await autoUpdater.checkForUpdates();
  } catch (error) {
    handleUpdateCheckError(error);
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
      const message = formatUpdateError(error);
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
  configureUpdateFeed();

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
    if (state.status === 'downloading') {
      log.error('Auto-update download error:', error);
      setState({
        status: 'error',
        errorMessage: formatUpdateError(error),
      });
      return;
    }

    handleUpdateCheckError(error);
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
