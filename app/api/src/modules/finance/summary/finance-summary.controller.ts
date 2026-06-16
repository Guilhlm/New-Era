import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../../../common/auth/auth.types';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { FinanceSummaryService } from './finance-summary.service';

@Controller('finance/summary')
@UseGuards(JwtAuthGuard)
export class FinanceSummaryController {
  constructor(private readonly financeSummaryService: FinanceSummaryService) {}

  @Get()
  getSummary(
    @Req() req: AuthenticatedRequest,
    @Query('period') period?: string,
  ) {
    return this.financeSummaryService.getSummary(req.user.userId, period ?? '1W');
  }

  @Get('performance')
  getPerformance(
    @Req() req: AuthenticatedRequest,
    @Query('period') period?: string,
  ) {
    return this.financeSummaryService.getPerformance(req.user.userId, period ?? '1W');
  }
}
