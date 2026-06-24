import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import {
  getAppDataDir,
  getCacheDir,
  getConfigPath,
  getDataDir,
  getDatabasePath,
} from './paths';

export type DesktopConfig = {
  jwtSecret: string;
  ipcToken: string;
  databasePath: string;
};

function generateSecret(bytes = 32) {
  return randomBytes(bytes).toString('hex');
}

export function ensureAppDirectories() {
  mkdirSync(getAppDataDir(), { recursive: true });
  mkdirSync(getDataDir(), { recursive: true });
  mkdirSync(getCacheDir(), { recursive: true });
}

export function loadOrCreateConfig(): DesktopConfig {
  ensureAppDirectories();
  const configPath = getConfigPath();
  if (existsSync(configPath)) {
    const parsed = JSON.parse(readFileSync(configPath, 'utf8')) as DesktopConfig;
    return {
      jwtSecret: parsed.jwtSecret,
      ipcToken: parsed.ipcToken,
      databasePath: parsed.databasePath || getDatabasePath(),
    };
  }

  const config: DesktopConfig = {
    jwtSecret: generateSecret(32),
    ipcToken: generateSecret(24),
    databasePath: getDatabasePath(),
  };
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  return config;
}

export function toDatabaseUrl(databasePath: string) {
  const normalized = databasePath.replace(/\\/g, '/');
  return `file:${normalized}`;
}
