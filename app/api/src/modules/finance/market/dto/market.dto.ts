import { InvestmentLastAction, InvestmentType } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import type { FinanceTab } from '../../investment/dto/investment.dto';

export type QuoteCurrency = 'USDT' | 'BRL';

export class MarketQueryDto {
  @IsOptional()
  @IsEnum(['stocks', 'crypto', 'etfs', 'mine'])
  tab?: FinanceTab;

  @IsOptional()
  @IsEnum(['USDT', 'BRL'])
  currency?: QuoteCurrency;
}

export class MarketTradeDto {
  @IsString()
  @MinLength(1)
  @MaxLength(12)
  ticker!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @IsEnum(InvestmentType)
  type!: InvestmentType;

  @IsEnum(InvestmentLastAction)
  action!: InvestmentLastAction;

  @IsNumber()
  @Min(0.000001)
  @Max(1_000_000_000)
  shares!: number;

  /** Market price per share in USDT (base storage currency). */
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  price!: number;

  /** Optional spend cap in USDT (amount-mode buys). Backend sizes shares from this. */
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  budgetUsdt?: number;
}

export type MarketQuote = {
  ticker: string;
  name: string;
  type: InvestmentType;
  priceUsdt: number;
  changePct24h: number;
};

export type MarketBoardRow = {
  id: string | null;
  ticker: string;
  name: string;
  type: InvestmentType;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  priceUsdt: number;
  value: number;
  gainPct: number;
  gainAmount: number;
  changePct24h: number;
  hasPosition: boolean;
  lastAction: InvestmentLastAction | null;
};

export type MarketBoardResponse = {
  rows: MarketBoardRow[];
  total: number;
  offset: number;
  limit: number;
  hasMore: boolean;
  fxRate: number;
  currency: QuoteCurrency;
  quotedAt: string;
};

export type MarketSearchResult = {
  ticker: string;
  name: string;
  type: InvestmentType;
};

export type MarketSearchResponse = {
  results: MarketSearchResult[];
};

export type MarketAssetRowResponse = {
  row: MarketBoardRow | null;
};

export type FxRateResponse = {
  base: 'USDT';
  quote: 'BRL';
  rate: number;
  updatedAt: string;
};
