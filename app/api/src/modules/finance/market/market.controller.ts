import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../../../common/auth/auth.types';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import type { FinanceTab } from '../investment/dto/investment.dto';
import { MarketTradeDto, type QuoteCurrency } from './dto/market.dto';
import { MarketService } from './market.service';

const DEFAULT_MARKET_LIMIT = 20;
const MAX_MARKET_LIMIT = 50;

function parseMarketOffset(raw?: string): number {
  const value = Number.parseInt(raw ?? '0', 10);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function parseMarketLimit(raw?: string): number {
  const value = Number.parseInt(raw ?? String(DEFAULT_MARKET_LIMIT), 10);
  if (!Number.isFinite(value) || value < 1) return DEFAULT_MARKET_LIMIT;
  return Math.min(value, MAX_MARKET_LIMIT);
}

@Controller('finance/market')
@UseGuards(JwtAuthGuard)
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  @Get('fx')
  getFx() {
    return this.marketService.getFxRate();
  }

  @Get('search')
  searchAssets(
    @Req() req: AuthenticatedRequest,
    @Query('q') query = '',
    @Query('tab') tab?: FinanceTab,
  ) {
    return this.marketService.searchAssets(req.user.userId, tab ?? 'stocks', query);
  }

  @Get('asset')
  getAssetRow(
    @Req() req: AuthenticatedRequest,
    @Query('ticker') ticker = '',
    @Query('tab') tab?: FinanceTab,
    @Query('currency') currency?: QuoteCurrency,
  ) {
    return this.marketService.getAssetRow(
      req.user.userId,
      tab ?? 'stocks',
      currency ?? 'USDT',
      ticker,
    );
  }

  @Get()
  getBoard(
    @Req() req: AuthenticatedRequest,
    @Query('tab') tab?: FinanceTab,
    @Query('currency') currency?: QuoteCurrency,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    return this.marketService.getBoard(
      req.user.userId,
      tab ?? 'stocks',
      currency ?? 'USDT',
      parseMarketOffset(offset),
      parseMarketLimit(limit),
    );
  }

  @Post('trade')
  trade(@Req() req: AuthenticatedRequest, @Body() data: MarketTradeDto) {
    return this.marketService.tradeByTicker(req.user.userId, data);
  }

  @Post('preview')
  preview(@Req() req: AuthenticatedRequest, @Body() data: MarketTradeDto) {
    return this.marketService.previewTrade(req.user.userId, data);
  }
}
