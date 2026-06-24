import {
  isDesktopMarketCacheEnabled,
  readMarketCacheEntry,
  readMarketCacheEntryFresh,
  writeMarketCacheEntry,
} from './market-disk-cache';

type YahooSearchQuote = {
  symbol?: string;
  shortname?: string;
  longname?: string;
  quoteType?: string;
};

type YahooSearchResponse = {
  quotes?: YahooSearchQuote[];
};

type YahooScreenerResponse = {
  finance?: {
    result?: Array<{
      quotes?: Array<{
        symbol?: string;
        shortName?: string;
        longName?: string;
        quoteType?: string;
      }>;
      total?: number;
    }>;
  };
};

type CoinGeckoSearchResponse = {
  coins?: Array<{ id: string; symbol: string; name: string }>;
};

export type ExternalMarketAsset = {
  ticker: string;
  name: string;
  type: 'STOCK' | 'ETF' | 'CRYPTO';
  coinId?: string;
};

const USER_AGENT = 'Mozilla/5.0 (compatible; NewEra/1.0)';
const CRYPTO_BOARD_TOTAL = 250;

type CacheEntry<T> = { value: T; expiresAt: number };
type ExternalCryptoQuote = {
  ticker: string;
  name: string;
  type: 'CRYPTO';
  priceUsdt: number;
  changePct24h: number;
};
type CoinGeckoPageRow = {
  id: null;
  ticker: string;
  name: string;
  type: 'CRYPTO';
  shares: number;
  avgPrice: number;
  currentPrice: number;
  priceUsdt: number;
  value: number;
  gainPct: number;
  gainAmount: number;
  changePct24h: number;
  hasPosition: boolean;
  lastAction: null;
};
const cryptoPageCache = new Map<string, CacheEntry<CoinGeckoPageRow[]>>();
const cryptoQuoteCache = new Map<string, CacheEntry<ExternalCryptoQuote>>();
const CRYPTO_PAGE_CACHE_MS = 60_000;
const CRYPTO_QUOTE_CACHE_MS = 60_000;

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return (await response.json()) as T;
}

function dedupeAssets(assets: ExternalMarketAsset[]): ExternalMarketAsset[] {
  const seen = new Set<string>();
  const merged: ExternalMarketAsset[] = [];
  for (const asset of assets) {
    const key = asset.ticker.toUpperCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push({ ...asset, ticker: key });
  }
  return merged;
}

export async function searchExternalMarketAssets(
  tab: string,
  query: string,
  limit = 10,
): Promise<ExternalMarketAsset[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (tab === 'crypto') {
    const data = await fetchJson<CoinGeckoSearchResponse>(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(trimmed)}`,
    );
    const seen = new Set<string>();
    const results: ExternalMarketAsset[] = [];
    for (const coin of data.coins ?? []) {
      const ticker = coin.symbol.toUpperCase();
      if (!ticker || seen.has(ticker)) continue;
      seen.add(ticker);
      results.push({
        ticker,
        name: coin.name,
        type: 'CRYPTO',
        coinId: coin.id,
      });
      if (results.length >= limit) break;
    }
    return results;
  }

  const data = await fetchJson<YahooSearchResponse>(
    `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(trimmed)}&quotesCount=${limit}&newsCount=0&listsCount=0&enableFuzzyQuery=true`,
  );

  return (data.quotes ?? [])
    .filter((quote) => Boolean(quote.symbol))
    .filter((quote) => {
      if (tab === 'etfs') return quote.quoteType === 'ETF';
      if (tab === 'stocks') return quote.quoteType === 'EQUITY';
      return true;
    })
    .slice(0, limit)
    .map((quote) => ({
      ticker: quote.symbol!.toUpperCase(),
      name: quote.longname ?? quote.shortname ?? quote.symbol!,
      type: tab === 'etfs' || quote.quoteType === 'ETF' ? ('ETF' as const) : ('STOCK' as const),
    }));
}

async function fetchYahooScreener(
  scrId: string,
  count: number,
  start: number,
  type: 'STOCK' | 'ETF',
): Promise<ExternalMarketAsset[]> {
  const data = await fetchJson<YahooScreenerResponse>(
    `https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=${encodeURIComponent(scrId)}&count=${count}&start=${start}`,
  );
  const quotes = data.finance?.result?.[0]?.quotes ?? [];
  return quotes
    .filter((quote) => Boolean(quote.symbol))
    .map((quote) => ({
      ticker: quote.symbol!.toUpperCase(),
      name: quote.longName ?? quote.shortName ?? quote.symbol!,
      type,
    }));
}

async function fetchCoinGeckoMarkets(page: number, perPage: number): Promise<ExternalMarketAsset[]> {
  const data = await fetchJson<
    Array<{ symbol: string; name: string }>
  >(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`,
  );
  return data.map((coin) => ({
    ticker: coin.symbol.toUpperCase(),
    name: coin.name,
    type: 'CRYPTO' as const,
  }));
}

export async function fetchExternalMarketCatalog(
  tab: string,
  offset: number,
  limit: number,
): Promise<{ assets: ExternalMarketAsset[]; total: number }> {
  let pool: ExternalMarketAsset[] = [];

  if (tab === 'stocks') {
    const batches = await Promise.all([
      fetchYahooScreener('most_actives', 100, 0, 'STOCK'),
      fetchYahooScreener('day_gainers', 100, 0, 'STOCK'),
      fetchYahooScreener('growth_technology_stocks', 100, 0, 'STOCK'),
    ]);
    pool = dedupeAssets(batches.flat());
  } else if (tab === 'etfs') {
    pool = dedupeAssets(await fetchYahooScreener('top_etfs_us', 150, 0, 'ETF'));
  } else if (tab === 'crypto') {
    const batches = await Promise.all([
      fetchCoinGeckoMarkets(1, 50),
      fetchCoinGeckoMarkets(2, 50),
      fetchCoinGeckoMarkets(3, 50),
      fetchCoinGeckoMarkets(4, 50),
    ]);
    pool = dedupeAssets(batches.flat());
  } else {
    return { assets: [], total: 0 };
  }

  const total = pool.length;
  return { assets: pool.slice(offset, offset + limit), total };
}

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        longName?: string;
        shortName?: string;
      };
    }>;
  };
};

async function fetchYahooQuote(asset: ExternalMarketAsset) {
  const data = await fetchJson<YahooChartResponse>(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(asset.ticker)}?interval=1m&range=1d`,
  );
  const meta = data.chart?.result?.[0]?.meta;
  const priceUsdt = meta?.regularMarketPrice ?? 0;
  const prev = meta?.chartPreviousClose ?? priceUsdt;
  const changePct24h = prev > 0 ? ((priceUsdt - prev) / prev) * 100 : 0;
  return {
    priceUsdt,
    changePct24h,
    name: meta?.longName ?? meta?.shortName ?? asset.name,
  };
}

async function fetchCoinGeckoPageRows(
  offset: number,
  limit: number,
): Promise<CoinGeckoPageRow[]> {
  const page = Math.floor(offset / limit) + 1;
  const cacheKey = `${page}:${limit}`;
  const cached = cryptoPageCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const data = await fetchJson<
    Array<{
      symbol: string;
      name: string;
      current_price?: number;
      price_change_percentage_24h?: number;
    }>
  >(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=${page}&sparkline=false`,
  );

  const rows = data.map((coin) => ({
    id: null,
    ticker: coin.symbol.toUpperCase(),
    name: coin.name,
    type: 'CRYPTO' as const,
    shares: 0,
    avgPrice: 0,
    currentPrice: coin.current_price ?? 0,
    priceUsdt: coin.current_price ?? 0,
    value: 0,
    gainPct: 0,
    gainAmount: 0,
    changePct24h: coin.price_change_percentage_24h ?? 0,
    hasPosition: false,
    lastAction: null,
  }));

  cryptoPageCache.set(cacheKey, {
    value: rows,
    expiresAt: Date.now() + CRYPTO_PAGE_CACHE_MS,
  });
  return rows;
}

async function fetchExternalFxRate() {
  try {
    const data = await fetchJson<{ tether?: { brl?: number } }>(
      'https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=brl',
    );
    return data.tether?.brl ?? 5.5;
  } catch {
    return 5.5;
  }
}

type CoinGeckoSearchCoin = {
  id: string;
  symbol: string;
  name: string;
};

async function lookupExternalCoinGeckoCoin(ticker: string) {
  const normalized = ticker.trim().toUpperCase();
  if (!normalized) return null;

  const data = await fetchJson<{ coins?: CoinGeckoSearchCoin[] }>(
    `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(normalized)}`,
  );
  const match =
    data.coins?.find((coin) => coin.symbol.toUpperCase() === normalized) ?? data.coins?.[0];
  if (!match?.id) return null;
  return match;
}

export async function fetchExternalCryptoQuoteById(
  coinId: string,
  ticker: string,
  name: string,
) {
  const normalized = ticker.trim().toUpperCase();
  if (!coinId || !normalized) return null;

  const cached = cryptoQuoteCache.get(coinId);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  try {
    const data = await fetchJson<
      Record<string, { usd?: number; usd_24h_change?: number }>
    >(
      `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd&include_24hr_change=true`,
    );
    const row = data[coinId];
    const priceUsdt = row?.usd ?? 0;
    if (priceUsdt <= 0) return null;

    const quote = {
      ticker: normalized,
      name,
      type: 'CRYPTO' as const,
      priceUsdt,
      changePct24h: row?.usd_24h_change ?? 0,
    };
    cryptoQuoteCache.set(coinId, {
      value: quote,
      expiresAt: Date.now() + CRYPTO_QUOTE_CACHE_MS,
    });
    return quote;
  } catch {
    return cached?.value ?? null;
  }
}

export async function fetchExternalCryptoQuote(ticker: string) {
  const normalized = ticker.trim().toUpperCase();
  if (!normalized) return null;

  const coin = await lookupExternalCoinGeckoCoin(normalized);
  if (!coin) return null;

  const data = await fetchJson<
    Record<string, { usd?: number; usd_24h_change?: number }>
  >(
    `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coin.id)}&vs_currencies=usd&include_24hr_change=true`,
  );
  const row = data[coin.id];
  const priceUsdt = row?.usd ?? 0;
  if (priceUsdt <= 0) return null;

  return {
    ticker: normalized,
    name: coin.name,
    type: 'CRYPTO' as const,
    priceUsdt,
    changePct24h: row?.usd_24h_change ?? 0,
  };
}

export async function buildExternalMarketAssetRow(
  tab: string,
  currency: string,
  ticker: string,
  options?: { coinId?: string; name?: string },
) {
  const normalized = ticker.trim().toUpperCase();
  if (!normalized) return null;

  const fxRate = currency === 'BRL' ? await fetchExternalFxRate() : 1;

  if (tab === 'crypto') {
    const quote = options?.coinId
      ? await fetchExternalCryptoQuoteById(
          options.coinId,
          normalized,
          options.name ?? normalized,
        )
      : await fetchExternalCryptoQuote(normalized);
    if (!quote) return null;
    return {
      row: {
        id: null,
        ticker: quote.ticker,
        name: quote.name,
        type: quote.type,
        shares: 0,
        avgPrice: 0,
        currentPrice: quote.priceUsdt * fxRate,
        priceUsdt: quote.priceUsdt,
        value: 0,
        gainPct: 0,
        gainAmount: 0,
        changePct24h: quote.changePct24h,
        hasPosition: false,
        lastAction: null,
      },
    };
  }

  try {
    const quote = await fetchYahooQuote({
      ticker: normalized,
      name: normalized,
      type: tab === 'etfs' ? 'ETF' : 'STOCK',
    });
    if (quote.priceUsdt <= 0) return null;
    return {
      row: {
        id: null,
        ticker: normalized,
        name: quote.name,
        type: tab === 'etfs' ? ('ETF' as const) : ('STOCK' as const),
        shares: 0,
        avgPrice: 0,
        currentPrice: quote.priceUsdt * fxRate,
        priceUsdt: quote.priceUsdt,
        value: 0,
        gainPct: 0,
        gainAmount: 0,
        changePct24h: quote.changePct24h,
        hasPosition: false,
        lastAction: null,
      },
    };
  } catch {
    return null;
  }
}

type ExternalBoardRow = {
  id: string | null;
  ticker: string;
  name: string;
  type: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  priceUsdt: number;
  value: number;
  gainPct: number;
  gainAmount: number;
  changePct24h: number;
  hasPosition: boolean;
  lastAction: string | null;
};

export async function enrichZeroCryptoBoardRows(
  rows: ExternalBoardRow[],
  fxRate: number,
) {
  const enriched: ExternalBoardRow[] = [];

  for (const row of rows) {
    if ((row.priceUsdt ?? 0) > 0) {
      enriched.push(row);
      continue;
    }

    const quote = await fetchExternalCryptoQuote(row.ticker);
    if (!quote) {
      enriched.push(row);
      continue;
    }

    enriched.push({
      ...row,
      name: quote.name,
      priceUsdt: quote.priceUsdt,
      currentPrice: quote.priceUsdt * fxRate,
      changePct24h: quote.changePct24h,
    });
  }

  return enriched;
}

export async function buildExternalMarketBoardPage(
  tab: string,
  currency: string,
  offset: number,
  limit: number,
) {
  const boardCacheKey = `board:${tab}:${currency}:${offset}:${limit}`;
  if (isDesktopMarketCacheEnabled()) {
    const fresh = readMarketCacheEntryFresh<
      Awaited<ReturnType<typeof buildExternalMarketBoardPageLive>>
    >(boardCacheKey);
    if (fresh) {
      return { ...fresh, stale: false };
    }
  }

  try {
    const page = await buildExternalMarketBoardPageLive(tab, currency, offset, limit);
    if (isDesktopMarketCacheEnabled()) {
      writeMarketCacheEntry(boardCacheKey, page, 60 * 60_000);
    }
    return { ...page, stale: false };
  } catch (error) {
    if (isDesktopMarketCacheEnabled()) {
      const stale = readMarketCacheEntry<Awaited<ReturnType<typeof buildExternalMarketBoardPageLive>>>(boardCacheKey);
      if (stale) {
        return { ...stale, stale: true };
      }
    }
    throw error;
  }
}

async function buildExternalMarketBoardPageLive(
  tab: string,
  currency: string,
  offset: number,
  limit: number,
) {
  const fxRate =
    currency === 'BRL'
      ? await fetchJson<{ tether?: { brl?: number } }>(
          'https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=brl',
        ).then((data) => data.tether?.brl ?? 5.5).catch(() => 5.5)
      : 1;

  if (tab === 'crypto') {
    const rows = await fetchCoinGeckoPageRows(offset, limit);
    const total = CRYPTO_BOARD_TOTAL;
    return {
      rows: rows.map((row) => ({
        ...row,
        currentPrice: row.priceUsdt * fxRate,
      })),
      total,
      offset,
      limit,
      hasMore: offset + limit < total,
      fxRate,
      currency,
      quotedAt: new Date().toISOString(),
    };
  }

  const { assets, total } = await fetchExternalMarketCatalog(tab, offset, limit);
  const rows = await Promise.all(
    assets.map(async (asset) => {
      try {
        const quote = await fetchYahooQuote(asset);
        const currentPrice = quote.priceUsdt * fxRate;
        return {
          id: null,
          ticker: asset.ticker,
          name: quote.name,
          type: asset.type,
          shares: 0,
          avgPrice: 0,
          currentPrice,
          priceUsdt: quote.priceUsdt,
          value: 0,
          gainPct: 0,
          gainAmount: 0,
          changePct24h: quote.changePct24h,
          hasPosition: false,
          lastAction: null,
        };
      } catch {
        return {
          id: null,
          ticker: asset.ticker,
          name: asset.name,
          type: asset.type,
          shares: 0,
          avgPrice: 0,
          currentPrice: 0,
          priceUsdt: 0,
          value: 0,
          gainPct: 0,
          gainAmount: 0,
          changePct24h: 0,
          hasPosition: false,
          lastAction: null,
        };
      }
    }),
  );

  return {
    rows,
    total,
    offset,
    limit,
    hasMore: offset + limit < total,
    fxRate,
    currency,
    quotedAt: new Date().toISOString(),
  };
}
