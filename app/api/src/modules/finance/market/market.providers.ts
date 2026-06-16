import { Injectable, Logger } from '@nestjs/common';
import { InvestmentType } from '@prisma/client';
import {
  CRYPTO_COINGECKO_IDS,
  CRYPTO_BOARD_TOTAL,
  findMarketAsset,
  MARKET_WATCHLIST,
  type MarketAssetDef,
} from './market.constants';
import type { FinanceTab } from '../investment/dto/investment.dto';
import type { MarketQuote, MarketSearchResult } from './dto/market.dto';

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        shortName?: string;
        longName?: string;
      };
    }>;
  };
};

type CoinGeckoPriceResponse = Record<
  string,
  { usd?: number; brl?: number; usd_24h_change?: number; last_updated_at?: string }
>;

type YahooSearchResponse = {
  quotes?: Array<{
    symbol?: string;
    shortname?: string;
    longname?: string;
    quoteType?: string;
  }>;
};

type CoinGeckoSearchResponse = {
  coins?: Array<{
    id: string;
    symbol: string;
    name: string;
  }>;
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
    }>;
  };
};

type CoinGeckoMarketRow = {
  id: string;
  symbol: string;
  name: string;
  current_price?: number;
  price_change_percentage_24h?: number;
};

@Injectable()
export class MarketProviders {
  private readonly logger = new Logger(MarketProviders.name);
  private fxCache: { rate: number; expiresAt: number } | null = null;
  private readonly quoteCache = new Map<
    string,
    { quote: MarketQuote; expiresAt: number }
  >();
  private readonly catalogCache = new Map<
    FinanceTab,
    { assets: MarketAssetDef[]; expiresAt: number }
  >();
  private readonly dynamicCoinIds = new Map<string, string>();
  private readonly cryptoPageCache = new Map<
    string,
    { entries: Array<{ asset: MarketAssetDef; quote: MarketQuote }>; expiresAt: number }
  >();
  private readonly quoteCacheTtlMs = 120_000;
  private readonly catalogCacheTtlMs = 5 * 60_000;
  private readonly cryptoPageCacheTtlMs = 60_000;

  private cacheQuote(quote: MarketQuote) {
    if (quote.priceUsdt <= 0) return;
    this.quoteCache.set(quote.ticker.toUpperCase(), {
      quote,
      expiresAt: Date.now() + this.quoteCacheTtlMs,
    });
  }

  private getCachedQuote(ticker: string): MarketQuote | null {
    const key = ticker.toUpperCase();
    const entry = this.quoteCache.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.quoteCache.delete(key);
      return null;
    }
    return entry.quote;
  }

  /** Live price with cache + optional fallbacks from board/DB. */
  async resolvePriceUsdt(
    ticker: string,
    hints?: { clientPrice?: number; storedPrice?: number },
  ): Promise<number> {
    const normalized = ticker.trim().toUpperCase();
    if (normalized === 'USDT') return 1;

    const quote = await this.fetchQuoteForTicker(normalized);
    if (quote && quote.priceUsdt > 0) {
      return quote.priceUsdt;
    }

    const cached = this.getCachedQuote(normalized);
    if (cached && cached.priceUsdt > 0) {
      return cached.priceUsdt;
    }

    if (hints?.clientPrice != null && hints.clientPrice > 0) {
      this.logger.warn(`Using client price fallback for ${normalized}`);
      return hints.clientPrice;
    }

    if (hints?.storedPrice != null && hints.storedPrice > 0) {
      this.logger.warn(`Using stored price fallback for ${normalized}`);
      return hints.storedPrice;
    }

    return 0;
  }

  private async fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; NewEra/1.0)',
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} for ${url}`);
    }
    return (await res.json()) as T;
  }

  async getUsdtToBrlRate(): Promise<number> {
    const now = Date.now();
    if (this.fxCache && this.fxCache.expiresAt > now) {
      return this.fxCache.rate;
    }

    try {
      const data = await this.fetchJson<{ tether?: { brl?: number } }>(
        `https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=brl&_=${now}`,
      );
      const rate = data.tether?.brl;
      if (!rate || rate <= 0) throw new Error('Invalid BRL rate');
      this.fxCache = { rate, expiresAt: now + 30_000 };
      return rate;
    } catch (error) {
      this.logger.warn(`FX fallback: ${error instanceof Error ? error.message : error}`);
      return this.fxCache?.rate ?? 5.5;
    }
  }

  async fetchQuotesForTab(tab: FinanceTab): Promise<Map<string, MarketQuote>> {
    return this.fetchQuotesForAssets(MARKET_WATCHLIST[tab], tab);
  }

  async fetchQuotesForAssets(
    assets: MarketAssetDef[],
    tab?: FinanceTab,
  ): Promise<Map<string, MarketQuote>> {
    if (assets.length === 0) return new Map();

    const cryptoAssets = assets.filter(
      (asset) =>
        asset.type === InvestmentType.CRYPTO || tab === 'crypto' || asset.ticker === 'USDT',
    );
    const yahooAssets = assets.filter(
      (asset) =>
        asset.type !== InvestmentType.CRYPTO &&
        asset.ticker !== 'USDT' &&
        tab !== 'crypto',
    );

    const quotes = new Map<string, MarketQuote>();
    if (cryptoAssets.length > 0) {
      const cryptoQuotes = await this.fetchCryptoQuotes(cryptoAssets);
      cryptoQuotes.forEach((quote, ticker) => quotes.set(ticker, quote));
    }
    if (yahooAssets.length > 0) {
      const yahooQuotes = await this.fetchYahooQuotes(yahooAssets);
      yahooQuotes.forEach((quote, ticker) => quotes.set(ticker, quote));
    }

    return quotes;
  }

  async searchYahoo(
    query: string,
    tab: FinanceTab,
    limit: number,
  ): Promise<MarketSearchResult[]> {
    try {
      const data = await this.fetchJson<YahooSearchResponse>(
        `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=${limit}&newsCount=0&listsCount=0&enableFuzzyQuery=true&_=${Date.now()}`,
      );

      return (data.quotes ?? [])
        .filter((quote) => Boolean(quote.symbol))
        .filter((quote) => {
          if (tab === 'etfs') return quote.quoteType === 'ETF';
          if (tab === 'stocks') {
            return quote.quoteType === 'EQUITY' || quote.quoteType === 'MUTUALFUND';
          }
          return true;
        })
        .slice(0, limit)
        .map((quote) => ({
          ticker: quote.symbol!.toUpperCase(),
          name: quote.longname ?? quote.shortname ?? quote.symbol!,
          type:
            tab === 'etfs' || quote.quoteType === 'ETF'
              ? InvestmentType.ETF
              : InvestmentType.STOCK,
        }));
    } catch (error) {
      this.logger.warn(`Yahoo search: ${error instanceof Error ? error.message : error}`);
      return [];
    }
  }

  async searchCrypto(query: string, limit: number): Promise<MarketSearchResult[]> {
    try {
      const data = await this.fetchJson<CoinGeckoSearchResponse>(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
      );

      return (data.coins ?? []).slice(0, limit).map((coin) => ({
        ticker: coin.symbol.toUpperCase(),
        name: coin.name,
        type: InvestmentType.CRYPTO,
      }));
    } catch (error) {
      this.logger.warn(`Crypto search: ${error instanceof Error ? error.message : error}`);
      return [];
    }
  }

  async getCatalog(tab: FinanceTab): Promise<MarketAssetDef[]> {
    if (tab === 'mine') return [];

    const cached = this.catalogCache.get(tab);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.assets;
    }

    let assets = [...MARKET_WATCHLIST[tab]];

    try {
      if (tab === 'stocks') {
        const batches = await Promise.all([
          this.fetchYahooScreener('most_actives', 100, 0, InvestmentType.STOCK),
          this.fetchYahooScreener('day_gainers', 100, 0, InvestmentType.STOCK),
          this.fetchYahooScreener('growth_technology_stocks', 100, 0, InvestmentType.STOCK),
        ]);
        assets.push(...batches.flat());
      } else if (tab === 'etfs') {
        assets.push(...(await this.fetchYahooScreener('top_etfs_us', 150, 0, InvestmentType.ETF)));
      } else if (tab === 'crypto') {
        for (let page = 1; page <= 4; page += 1) {
          assets.push(...(await this.fetchCoinGeckoMarketAssets(page, 50)));
        }
      }
    } catch (error) {
      this.logger.warn(`Catalog fetch ${tab}: ${error instanceof Error ? error.message : error}`);
    }

    assets = this.dedupeAssets(assets);
    this.catalogCache.set(tab, {
      assets,
      expiresAt: Date.now() + this.catalogCacheTtlMs,
    });
    return assets;
  }

  private dedupeAssets(assets: MarketAssetDef[]): MarketAssetDef[] {
    const seen = new Set<string>();
    const merged: MarketAssetDef[] = [];
    for (const asset of assets) {
      const key = asset.ticker.toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push({ ...asset, ticker: key });
    }
    return merged;
  }

  private async fetchYahooScreener(
    scrId: string,
    count: number,
    start: number,
    type: InvestmentType,
  ): Promise<MarketAssetDef[]> {
    const data = await this.fetchJson<YahooScreenerResponse>(
      `https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?scrIds=${encodeURIComponent(scrId)}&count=${count}&start=${start}&_=${Date.now()}`,
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

  private async fetchCoinGeckoMarketAssets(
    page: number,
    perPage: number,
  ): Promise<MarketAssetDef[]> {
    const data = await this.fetchJson<CoinGeckoMarketRow[]>(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${perPage}&page=${page}&sparkline=false`,
    );

    return data.map((coin) => {
      const ticker = coin.symbol.toUpperCase();
      this.dynamicCoinIds.set(ticker, coin.id);
      return {
        ticker,
        name: coin.name,
        type: InvestmentType.CRYPTO,
      };
    });
  }

  private resolveCoinGeckoId(ticker: string): string | undefined {
    const normalized = ticker.toUpperCase();
    return CRYPTO_COINGECKO_IDS[normalized] ?? this.dynamicCoinIds.get(normalized);
  }

  getCryptoBoardTotal() {
    return CRYPTO_BOARD_TOTAL;
  }

  /** One CoinGecko /coins/markets request — prices included, no extra quote calls. */
  async fetchCryptoMarketBoardPage(page: number, perPage: number) {
    const safePage = page > 0 ? page : 1;
    const safePerPage = Math.min(Math.max(perPage, 1), 50);
    const cacheKey = `${safePage}:${safePerPage}`;
    const cached = this.cryptoPageCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.entries;
    }

    try {
      const data = await this.fetchJson<CoinGeckoMarketRow[]>(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${safePerPage}&page=${safePage}&sparkline=false&_=${Date.now()}`,
      );

      const entries = data.map((coin) => {
        const ticker = coin.symbol.toUpperCase();
        this.dynamicCoinIds.set(ticker, coin.id);
        const quote: MarketQuote = {
          ticker,
          name: coin.name,
          type: InvestmentType.CRYPTO,
          priceUsdt: coin.current_price ?? 0,
          changePct24h: coin.price_change_percentage_24h ?? 0,
        };
        if (quote.priceUsdt > 0) this.cacheQuote(quote);
        return {
          asset: {
            ticker,
            name: coin.name,
            type: InvestmentType.CRYPTO,
          },
          quote,
        };
      });

      this.cryptoPageCache.set(cacheKey, {
        entries,
        expiresAt: Date.now() + this.cryptoPageCacheTtlMs,
      });
      return entries;
    } catch (error) {
      this.logger.warn(
        `Crypto markets page ${safePage}: ${error instanceof Error ? error.message : error}`,
      );
      return cached?.entries ?? [];
    }
  }

  private async fillMissingCryptoQuotes(
    assets: MarketAssetDef[],
    quotes: Map<string, MarketQuote>,
  ) {
    for (const asset of assets) {
      if (asset.ticker === 'USDT') continue;

      const current = quotes.get(asset.ticker);
      if (current && current.priceUsdt > 0) continue;

      const cached = this.getCachedQuote(asset.ticker);
      if (cached && cached.priceUsdt > 0) {
        quotes.set(asset.ticker, cached);
        continue;
      }

      const coinId = await this.lookupCoinGeckoId(asset.ticker);
      if (!coinId) continue;

      try {
        const single = await this.fetchJson<CoinGeckoPriceResponse>(
          `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&_=${Date.now()}`,
        );
        const row = single[coinId];
        const priceUsdt = row?.usd ?? 0;
        if (priceUsdt <= 0) continue;

        const quote = {
          ticker: asset.ticker,
          name: asset.name,
          type: asset.type,
          priceUsdt,
          changePct24h: row?.usd_24h_change ?? 0,
        };
        quotes.set(asset.ticker, quote);
        this.cacheQuote(quote);
      } catch (error) {
        this.logger.warn(
          `Crypto quote ${asset.ticker}: ${error instanceof Error ? error.message : error}`,
        );
      }

      // CoinGecko free tier throttles burst requests.
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
  }

  private async fetchCryptoQuotesBatch(
    assets: MarketAssetDef[],
    quotes: Map<string, MarketQuote>,
  ) {
    const ids = assets
      .map((asset) => this.resolveCoinGeckoId(asset.ticker))
      .filter(Boolean);
    const uniqueIds = [...new Set(ids)];
    const chunkSize = 50;

    for (let index = 0; index < uniqueIds.length; index += chunkSize) {
      const chunk = uniqueIds.slice(index, index + chunkSize);
      try {
        const data = await this.fetchJson<CoinGeckoPriceResponse>(
          `https://api.coingecko.com/api/v3/simple/price?ids=${chunk.join(',')}&vs_currencies=usd&include_24hr_change=true&include_last_updated_at=true&_=${Date.now()}`,
        );

        for (const asset of assets) {
          const coinId = this.resolveCoinGeckoId(asset.ticker);
          const row = coinId ? data[coinId] : undefined;
          const priceUsdt = asset.ticker === 'USDT' ? 1 : row?.usd ?? 0;
          if (priceUsdt <= 0) continue;

          const quote = {
            ticker: asset.ticker,
            name: asset.name,
            type: asset.type,
            priceUsdt,
            changePct24h: row?.usd_24h_change ?? 0,
          };
          quotes.set(asset.ticker, quote);
          this.cacheQuote(quote);
        }
      } catch (error) {
        this.logger.warn(
          `Crypto quotes batch: ${error instanceof Error ? error.message : error}`,
        );
      }
    }
  }

  private async fetchCryptoQuotes(
    assets: MarketAssetDef[],
  ): Promise<Map<string, MarketQuote>> {
    const quotes = new Map<string, MarketQuote>();

    for (const asset of assets) {
      quotes.set(asset.ticker, {
        ticker: asset.ticker,
        name: asset.name,
        type: asset.type,
        priceUsdt: asset.ticker === 'USDT' ? 1 : 0,
        changePct24h: 0,
      });
    }

    const rest = assets.filter((asset) => asset.ticker !== 'USDT');
    await this.fetchCryptoQuotesBatch(rest, quotes);
    await this.fillMissingCryptoQuotes(rest, quotes);

    return quotes;
  }

  private async fetchYahooQuotes(
    assets: MarketAssetDef[],
  ): Promise<Map<string, MarketQuote>> {
    const quotes = new Map<string, MarketQuote>();
    await Promise.all(
      assets.map(async (asset) => {
        try {
          const data = await this.fetchJson<YahooChartResponse>(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(asset.ticker)}?interval=1m&range=1d&_=${Date.now()}`,
          );
          const meta = data.chart?.result?.[0]?.meta;
          const priceUsdt = meta?.regularMarketPrice ?? 0;
          const prev = meta?.chartPreviousClose ?? priceUsdt;
          const changePct24h = prev > 0 ? ((priceUsdt - prev) / prev) * 100 : 0;
          const quote = {
            ticker: asset.ticker,
            name: meta?.longName ?? meta?.shortName ?? asset.name,
            type: asset.type,
            priceUsdt,
            changePct24h,
          };
          quotes.set(asset.ticker, quote);
          if (priceUsdt > 0) this.cacheQuote(quote);
        } catch (error) {
          this.logger.warn(
            `Yahoo quote ${asset.ticker}: ${error instanceof Error ? error.message : error}`,
          );
          quotes.set(asset.ticker, {
            ticker: asset.ticker,
            name: asset.name,
            type: asset.type,
            priceUsdt: 0,
            changePct24h: 0,
          });
        }
      }),
    );
    return quotes;
  }

  async fetchQuoteForTicker(ticker: string): Promise<MarketQuote | null> {
    const normalized = ticker.trim().toUpperCase();

    if (normalized === 'USDT') {
      return {
        ticker: 'USDT',
        name: 'Tether',
        type: InvestmentType.CRYPTO,
        priceUsdt: 1,
        changePct24h: 0,
      };
    }

    const cached = this.getCachedQuote(normalized);
    if (cached) return cached;

    const asset = findMarketAsset(normalized);
    if (asset?.type === InvestmentType.CRYPTO) {
      const cryptoQuote = await this.fetchCryptoQuoteBySymbol(normalized);
      if (cryptoQuote && cryptoQuote.priceUsdt > 0) {
        this.cacheQuote(cryptoQuote);
        return cryptoQuote;
      }
    }

    if (asset) {
      if (asset.type === InvestmentType.CRYPTO) {
        const quotes = await this.fetchCryptoQuotes([asset]);
        const quote = quotes.get(asset.ticker) ?? null;
        if (quote && quote.priceUsdt > 0) this.cacheQuote(quote);
        return quote;
      }

      const quotes = await this.fetchYahooQuotes([asset]);
      const quote = quotes.get(asset.ticker) ?? null;
      if (quote && quote.priceUsdt > 0) this.cacheQuote(quote);
      return quote;
    }

    const cryptoQuote = await this.fetchCryptoQuoteBySymbol(normalized);
    if (cryptoQuote && cryptoQuote.priceUsdt > 0) {
      this.cacheQuote(cryptoQuote);
      return cryptoQuote;
    }

    const fallbackAsset: MarketAssetDef = {
      ticker: normalized,
      name: normalized,
      type: InvestmentType.STOCK,
    };
    const quotes = await this.fetchYahooQuotes([fallbackAsset]);
    const quote = quotes.get(normalized) ?? null;
    if (quote && quote.priceUsdt > 0) this.cacheQuote(quote);
    return quote;
  }

  private async lookupCoinGeckoId(ticker: string): Promise<string | undefined> {
    const normalized = ticker.toUpperCase();
    const known = this.resolveCoinGeckoId(normalized);
    if (known) return known;

    try {
      const data = await this.fetchJson<CoinGeckoSearchResponse>(
        `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(normalized)}`,
      );
      const match =
        data.coins?.find((coin) => coin.symbol.toUpperCase() === normalized) ??
        data.coins?.[0];
      if (!match?.id) return undefined;
      this.dynamicCoinIds.set(normalized, match.id);
      return match.id;
    } catch (error) {
      this.logger.warn(
        `CoinGecko id lookup ${normalized}: ${error instanceof Error ? error.message : error}`,
      );
      return undefined;
    }
  }

  private async fetchCryptoQuoteBySymbol(ticker: string): Promise<MarketQuote | null> {
    const normalized = ticker.toUpperCase();
    const coinId = await this.lookupCoinGeckoId(normalized);
    if (!coinId) return null;

    try {
      const data = await this.fetchJson<CoinGeckoPriceResponse>(
        `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coinId)}&vs_currencies=usd&include_24hr_change=true&_=${Date.now()}`,
      );
      const row = data[coinId];
      const priceUsdt = row?.usd ?? 0;
      if (priceUsdt <= 0) return null;

      return {
        ticker: normalized,
        name: normalized,
        type: InvestmentType.CRYPTO,
        priceUsdt,
        changePct24h: row?.usd_24h_change ?? 0,
      };
    } catch (error) {
      this.logger.warn(
        `Crypto quote ${normalized}: ${error instanceof Error ? error.message : error}`,
      );
      return null;
    }
  }
}
