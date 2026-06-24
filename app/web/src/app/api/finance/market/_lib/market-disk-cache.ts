import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type PersistedMarketCache = Record<string, { value: unknown; expiresAt: number }>;

let memoryFallback: PersistedMarketCache = {};

function cacheFilePath() {
  const dir = process.env.MARKET_CACHE_DIR;
  if (!dir) return null;
  return join(dir, 'market.json');
}

function readDiskCache(): PersistedMarketCache {
  const filePath = cacheFilePath();
  if (!filePath || !existsSync(filePath)) {
    return {};
  }
  try {
    return JSON.parse(readFileSync(filePath, 'utf8')) as PersistedMarketCache;
  } catch {
    return {};
  }
}

function writeDiskCache(data: PersistedMarketCache) {
  const filePath = cacheFilePath();
  if (!filePath) {
    memoryFallback = data;
    return;
  }
  mkdirSync(process.env.MARKET_CACHE_DIR!, { recursive: true });
  writeFileSync(filePath, JSON.stringify(data), 'utf8');
}

export function readMarketCacheEntry<T>(key: string): T | null {
  const store = cacheFilePath() ? readDiskCache() : memoryFallback;
  const entry = store[key];
  if (!entry) return null;
  return entry.value as T;
}

export function writeMarketCacheEntry<T>(key: string, value: T, ttlMs: number) {
  const store = cacheFilePath() ? readDiskCache() : { ...memoryFallback };
  store[key] = { value, expiresAt: Date.now() + ttlMs };
  writeDiskCache(store);
}

export function readMarketCacheEntryFresh<T>(key: string): T | null {
  const store = cacheFilePath() ? readDiskCache() : memoryFallback;
  const entry = store[key];
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) return null;
  return entry.value as T;
}

export function isDesktopMarketCacheEnabled() {
  return process.env.APP_MODE === 'desktop' && Boolean(process.env.MARKET_CACHE_DIR);
}
