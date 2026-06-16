import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { FinanceExecutionModule } from '../execution/finance-execution.module';
import { PortfolioReadModule } from '../portfolio/portfolio-read.module';
import { InvestmentController } from './investment.controller';
import { InvestmentService } from './investment.service';

@Module({
  imports: [AuthModule, FinanceExecutionModule, PortfolioReadModule],
  controllers: [InvestmentController],
  providers: [InvestmentService],
})
export class InvestmentModule {}
