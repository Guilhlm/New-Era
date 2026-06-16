import { Module } from '@nestjs/common';
import { PortfolioReadModule } from '../portfolio/portfolio-read.module';
import { FinanceSummaryController } from './finance-summary.controller';
import { FinanceSummaryService } from './finance-summary.service';

@Module({
  imports: [PortfolioReadModule],
  controllers: [FinanceSummaryController],
  providers: [FinanceSummaryService],
  exports: [FinanceSummaryService],
})
export class FinanceSummaryModule {}
