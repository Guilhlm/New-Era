import { app } from 'electron';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { APP_DISPLAY_NAME } from './brand';

export const API_PORT = 6011;
export const WEB_PORT = 6012;
export const IPC_PORT = 45678;
export const WEB_ORIGIN = `http://127.0.0.1:${WEB_PORT}`;

export function getAppDataDir() {
  return join(app.getPath('appData'), APP_DISPLAY_NAME);
}

export function getDataDir() {
  return join(getAppDataDir(), 'data');
}

export function getCacheDir() {
  return join(getAppDataDir(), 'cache');
}

export function getConfigPath() {
  return join(getAppDataDir(), 'config.json');
}

export function getDatabasePath() {
  return join(getDataDir(), 'app.db');
}

export function isPackaged() {
  return app.isPackaged;
}

export function getResourcesRoot() {
  if (isPackaged()) {
    return process.resourcesPath;
  }
  return join(__dirname, '..', '..', '..');
}

export function getApiRoot() {
  if (isPackaged()) {
    return join(process.resourcesPath, 'api');
  }
  return join(getResourcesRoot(), 'app', 'api');
}

export function getWebRoot() {
  if (isPackaged()) {
    return join(process.resourcesPath, 'web');
  }
  return join(getResourcesRoot(), 'app', 'web', '.next', 'standalone');
}

export function getPrismaRoot() {
  if (isPackaged()) {
    return join(process.resourcesPath, 'prisma');
  }
  return join(getResourcesRoot(), 'app', 'api', 'prisma');
}

export function getBrandIconPath() {
  if (isPackaged()) {
    return join(process.resourcesPath, 'brand', 'icon.ico');
  }
  return join(__dirname, '..', 'build', 'icon.ico');
}

export function resolveNextServerEntry(webRoot: string) {
  const candidates = [
    join(webRoot, 'server.js'),
    join(webRoot, 'app', 'web', 'server.js'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }
  throw new Error(`Next standalone server.js not found under ${webRoot}`);
}

export function resolveNextServerCwd(serverEntry: string) {
  return join(serverEntry, '..');
}
