import { spawn, type ChildProcess } from 'node:child_process';
import { request as httpRequest } from 'node:http';
import { join } from 'node:path';
import log from 'electron-log';
import {
  getApiRoot,
  getCacheDir,
  getPrismaRoot,
  getWebRoot,
  isPackaged,
  resolveNextServerCwd,
  resolveNextServerEntry,
  IPC_PORT,
} from './paths';

export const SERVICE_STARTUP_TIMEOUT_MS = isPackaged() ? 180_000 : 60_000;
import { toDatabaseUrl, type DesktopConfig } from './config-store';

export type ManagedProcess = {
  name: string;
  child: ChildProcess;
};

function nodeExecutable() {
  return process.execPath;
}

function baseChildEnv(extra: Record<string, string>) {
  return {
    ...process.env,
    ELECTRON_RUN_AS_NODE: '1',
    NODE_ENV: 'production',
    ...extra,
  };
}

export function spawnNodeProcess(
  name: string,
  args: string[],
  cwd: string,
  env: Record<string, string>,
): ManagedProcess {
  log.info(`[${name}] spawn ${args.join(' ')} (cwd=${cwd})`);
  const child = spawn(nodeExecutable(), args, {
    cwd,
    env: baseChildEnv(env),
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  child.stdout?.on('data', (chunk: Buffer) => {
    log.info(`[${name}] ${chunk.toString().trim()}`);
  });
  child.stderr?.on('data', (chunk: Buffer) => {
    log.warn(`[${name}] ${chunk.toString().trim()}`);
  });
  child.on('exit', (code, signal) => {
    log.warn(`[${name}] exited code=${code} signal=${signal ?? 'none'}`);
  });

  return { name, child };
}

export async function runPrismaMigrate(config: DesktopConfig) {
  const apiRoot = getApiRoot();
  const prismaRoot = getPrismaRoot();
  const schemaPath = join(prismaRoot, 'desktop', 'schema.prisma');
  const prismaCli = join(apiRoot, 'node_modules', 'prisma', 'build', 'index.js');

  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      nodeExecutable(),
      [
        prismaCli,
        'migrate',
        'deploy',
        '--schema',
        schemaPath,
      ],
      {
        cwd: apiRoot,
        env: baseChildEnv({
          DATABASE_URL: toDatabaseUrl(config.databasePath),
        }),
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      },
    );

    child.stdout?.on('data', (chunk: Buffer) => {
      log.info(`[prisma] ${chunk.toString().trim()}`);
    });
    child.stderr?.on('data', (chunk: Buffer) => {
      log.warn(`[prisma] ${chunk.toString().trim()}`);
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`prisma migrate deploy failed with code ${code}`));
    });
  });
}

export function spawnNestApi(
  config: DesktopConfig,
  apiPort: number,
  webPort: number,
): ManagedProcess {
  const apiRoot = getApiRoot();
  return spawnNodeProcess('nest', ['dist/main.js'], apiRoot, {
    APP_MODE: 'desktop',
    PORT: String(apiPort),
    JWT_SECRET: config.jwtSecret,
    DATABASE_URL: toDatabaseUrl(config.databasePath),
    DESKTOP_IPC_URL: `http://127.0.0.1:${IPC_PORT}/notify`,
    DESKTOP_IPC_TOKEN: config.ipcToken,
    CORS_ORIGINS: `http://127.0.0.1:${webPort}`,
  });
}

export function spawnNextWeb(
  config: DesktopConfig,
  apiPort: number,
  webPort: number,
): ManagedProcess {
  const webRoot = getWebRoot();
  const serverEntry = resolveNextServerEntry(webRoot);
  const serverCwd = resolveNextServerCwd(serverEntry);

  return spawnNodeProcess('next', [serverEntry], serverCwd, {
    APP_MODE: 'desktop',
    PORT: String(webPort),
    HOSTNAME: '127.0.0.1',
    API_URL: `http://127.0.0.1:${apiPort}`,
    MARKET_CACHE_DIR: getCacheDir(),
  });
}

export async function waitForHttp(
  url: string,
  timeoutMs = SERVICE_STARTUP_TIMEOUT_MS,
  intervalMs = 250,
) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const ok = await ping(url);
      if (ok) return;
    } catch {
      // retry
    }
    await sleep(intervalMs);
  }
  throw new Error(`Timeout waiting for ${url}`);
}

function ping(url: string) {
  return new Promise<boolean>((resolve, reject) => {
    const req = httpRequest(url, { method: 'GET' }, (res) => {
      res.resume();
      resolve((res.statusCode ?? 500) >= 200 && (res.statusCode ?? 500) < 500);
    });
    req.on('error', reject);
    req.setTimeout(2_000, () => {
      req.destroy();
      reject(new Error('timeout'));
    });
    req.end();
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function stopManagedProcess(managed: ManagedProcess | null) {
  if (!managed?.child.pid) return;
  try {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(managed.child.pid), '/f', '/t'], { stdio: 'ignore' });
    } else {
      managed.child.kill('SIGTERM');
    }
  } catch (error) {
    log.warn(`Failed to stop ${managed.name}: ${String(error)}`);
  }
}
