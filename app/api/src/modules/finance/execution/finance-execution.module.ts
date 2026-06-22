import { Module, forwardRef } from '@nestjs/common';
import { MarketModule } from '../market/market.module';
import { MonthlyExpenseModule } from '../monthly-expense/monthly-expense.module';
import { FinanceExecutionService } from './finance-execution.service';

@Module({
  imports: [forwardRef(() => MarketModule), MonthlyExpenseModule],
  providers: [FinanceExecutionService],
  exports: [FinanceExecutionService],
})
export class FinanceExecutionModule {}
