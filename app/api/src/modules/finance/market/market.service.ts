import {
  Injectable,
} from '@nestjs/common';
import { InvestmentType } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import {
  investmentTypesForTab,
  type FinanceTab,
} from '../investment/dto/investment.dto';
import type {
  FxRateResponse,
  MarketAssetRowResponse,
  MarketBoardResponse,
  MarketBoardRow,
  MarketQuote,
  MarketSearchResponse,
  MarketSearchResult,
  MarketTradeDto,
  QuoteCurrency,
} from './dto/market.dto';
import { findMarketAsset, MARKET_WATCHLIST, type MarketAssetDef } from './market.constants';
import { MarketProviders } from './market.providers';
import { FinanceExecutionService } from '../execution/finance-execution.service';
import { toNumber } from '../common/investment-value.util';

@Injectable()
export class MarketService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly providers: MarketProviders,
    private readonly execution: FinanceExecutionService,
  ) {}

  async getFxRate(): Promise<FxRateResponse> {
    const rate = await this.providers.getUsdtToBrlRate();
    return {
      base: 'USDT',
      quote: 'BRL',
      rate,
      updatedAt: new Date().toISOString(),
    };
  }

  async getBoard(
    userId: string,
    tab: FinanceTab = 'stocks',
    currency: QuoteCurrency = 'USDT',
    offset = 0,
    limit = 20,
  ): Promise<MarketBoardResponse> {
    if (tab === 'crypto') {
      return this.getCryptoBoard(userId, currency, offset, limit);
    }

    const quotedAt = new Date().toISOString();
    const fxRate = currency === 'BRL' ? await this.providers.getUsdtToBrlRate() : 1;
    const catalog = await this.buildAssetCatalog(userId, tab);
    const total = catalog.length;
    const pageAssets = catalog.slice(offset, offset + limit);
    const positions = await this.loadPositionsForTab(userId, tab);
    const byTicker = new Map(positions.map((p) => [p.ticker.toUpperCase(), p]));
    const quotes = await this.providers.fetchQuotesForAssets(pageAssets, tab);

    const rows: MarketBoardRow[] = pageAssets.map((asset) =>
      this.buildMarketRow({
        asset,
        quote: quotes.get(asset.ticker),
        position: byTicker.get(asset.ticker.toUpperCase()),
        fxRate,
      }),
    );

    if (tab === 'mine') {
      rows.sort((a, b) => b.value - a.value);
    }

    return {
      rows,
      total,
      offset,
      limit,
      hasMore: offset + limit < total,
      fxRate,
      currency,
      quotedAt,
    };
  }

  private async getCryptoBoard(
    userId: string,
    currency: QuoteCurrency,
    offset: number,
    limit: number,
  ): Promise<MarketBoardResponse> {
    const quotedAt = new Date().toISOString();
    const fxRate = currency === 'BRL' ? await this.providers.getUsdtToBrlRate() : 1;
    const safeLimit = Math.min(Math.max(limit, 1), 50);
    const page = Math.floor(offset / safeLimit) + 1;
    const positions = await this.loadPositionsForTab(userId, 'crypto');
    const byTicker = new Map(positions.map((p) => [p.ticker.toUpperCase(), p]));
    const pageEntries = await this.providers.fetchCryptoMarketBoardPage(page, safeLimit);
    const total = this.providers.getCryptoBoardTotal();

    const rows: MarketBoardRow[] = pageEntries.map(({ asset, quote }) =>
      this.buildMarketRow({
        asset,
        quote,
        position: byTicker.get(asset.ticker.toUpperCase()),
        fxRate,
      }),
    );

    return {
      rows,
      total,
      offset,
      limit: safeLimit,
      hasMore: offset + safeLimit < total,
      fxRate,
      currency,
      quotedAt,
    };
  }

  async searchAssets(
    userId: string,
    tab: FinanceTab,
    query: string,
  ): Promise<MarketSearchResponse> {
    const trimmed = query.trim();
    if (trimmed.length < 1) {
      return { results: [] };
    }

    if (tab === 'mine') {
      const positions = await this.prisma.investment.findMany({
        where: { userId },
        orderBy: { currentValue: 'desc' },
      });
      const needle = trimmed.toLowerCase();
      const results = positions
        .filter((position) => {
          const shares = toNumber(position.shares);
          if (shares <= 0) return false;
          return (
            position.ticker.toUpperCase().includes(trimmed.toUpperCase()) ||
            position.name.toLowerCase().includes(needle)
          );
        })
        .slice(0, 10)
        .map((position) => ({
          ticker: position.ticker.toUpperCase(),
          name: position.name,
          type: position.type,
        }));
      return { results };
    }

    const needle = trimmed.toLowerCase();
    const normalized = trimmed.toUpperCase();
    const local: MarketSearchResult[] = MARKET_WATCHLIST[tab]
      .filter(
        (asset) =>
          asset.ticker.includes(normalized) || asset.name.toLowerCase().includes(needle),
      )
      .map((asset) => ({
        ticker: asset.ticker,
        name: asset.name,
        type: asset.type,
      }));

    const external =
      tab === 'crypto'
        ? await this.providers.searchCrypto(trimmed, 10)
        : await this.providers.searchYahoo(trimmed, tab, 10);

    const seen = new Set<string>();
    const merged: MarketSearchResult[] = [];
    for (const item of [...local, ...external]) {
      const key = item.ticker.toUpperCase();
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(item);
      if (merged.length >= 10) break;
    }

    return { results: merged };
  }

  async getAssetRow(
    userId: string,
    tab: FinanceTab,
    currency: QuoteCurrency,
    tickerRaw: string,
  ): Promise<MarketAssetRowResponse> {
    const ticker = tickerRaw.trim().toUpperCase();
    if (!ticker) {
      return { row: null };
    }

    const fxRate = currency === 'BRL' ? await this.providers.getUsdtToBrlRate() : 1;
    const positions = await this.loadPositionsForTab(userId, tab);
    const position =
      positions.find((item) => item.ticker.toUpperCase() === ticker) ??
      (await this.prisma.investment.findFirst({
        where: { userId, ticker },
      }));

    const known = findMarketAsset(ticker);
    const asset: MarketAssetDef =
      known ??
      (position
        ? {
            ticker,
            name: position.name,
            type: position.type,
          }
        : {
            ticker,
            name: ticker,
            type: this.defaultTypeForTab(tab),
          });

    const quote = await this.providers.fetchQuoteForTicker(ticker);
    const row = this.buildMarketRow({
      asset: {
        ...asset,
        name: quote?.name ?? asset.name,
        type: quote?.type ?? asset.type,
      },
      quote,
      position,
      fxRate,
    });

    return { row };
  }

  private defaultTypeForTab(tab: FinanceTab): InvestmentType {
    if (tab === 'crypto') return InvestmentType.CRYPTO;
    if (tab === 'etfs') return InvestmentType.ETF;
    return InvestmentType.STOCK;
  }

  private async loadPositionsForTab(userId: string, tab: FinanceTab) {
    if (tab === 'mine') {
      return this.prisma.investment.findMany({
        where: { userId },
        orderBy: { currentValue: 'desc' },
      });
    }

    const types = investmentTypesForTab(tab) ?? [];
    return this.prisma.investment.findMany({
      where: {
        userId,
        ...(types.length ? { type: { in: types } } : {}),
      },
    });
  }

  private async buildAssetCatalog(userId: string, tab: FinanceTab): Promise<MarketAssetDef[]> {
    if (tab === 'mine') {
      const positions = await this.prisma.investment.findMany({
        where: { userId },
        orderBy: { currentValue: 'desc' },
      });

      return positions
        .filter((position) => toNumber(position.shares) > 0)
        .map((position) => ({
          ticker: position.ticker.toUpperCase(),
          name: position.name,
          type: position.type,
        }));
    }

    const positions = await this.loadPositionsForTab(userId, tab);
    const catalog = await this.providers.getCatalog(tab);
    const watchlistTickers = new Set(catalog.map((asset) => asset.ticker.toUpperCase()));
    const assets = [...catalog];

    for (const position of positions) {
      const ticker = position.ticker.toUpperCase();
      if (watchlistTickers.has(ticker)) continue;
      if (toNumber(position.shares) <= 0) continue;
      assets.push({
        ticker,
        name: position.name,
        type: position.type,
      });
    }

    return assets;
  }

  private buildMarketRow(input: {
    asset: MarketAssetDef;
    quote?: MarketQuote | null;
    position?: {
      id: string;
      shares: unknown;
      avgPrice: unknown;
      currentPrice: unknown;
      lastAction: MarketBoardRow['lastAction'];
    } | null;
    fxRate: number;
  }): MarketBoardRow {
    const { asset, quote, position, fxRate } = input;
    const livePriceUsdt = quote?.priceUsdt ?? 0;
    const shares = position ? toNumber(position.shares) : 0;
    const avgPriceUsdt = position ? toNumber(position.avgPrice) : 0;
    const storedPriceUsdt = position ? toNumber(position.currentPrice) : 0;
    const priceUsdt = livePriceUsdt > 0 ? livePriceUsdt : storedPriceUsdt;
    const currentPrice = priceUsdt * fxRate;
    const avgPrice = avgPriceUsdt * fxRate;
    const value = shares * currentPrice;
    const costValue = shares * avgPrice;
    const gainAmount = value - costValue;
    const gainPct = costValue > 0 ? (gainAmount / costValue) * 100 : 0;

    return {
      id: position?.id ?? null,
      ticker: asset.ticker,
      name: quote?.name ?? asset.name,
      type: asset.type,
      shares,
      avgPrice,
      currentPrice,
      priceUsdt,
      value,
      gainPct,
      gainAmount,
      changePct24h: quote?.changePct24h ?? 0,
      hasPosition: shares > 0,
      lastAction: position?.lastAction ?? null,
    };
  }

  tradeByTicker(userId: string, data: MarketTradeDto) {
    return this.execution.tradeByTicker(userId, data);
  }

  previewTrade(userId: string, data: MarketTradeDto) {
    return this.execution.previewTrade(userId, data);
  }
}
