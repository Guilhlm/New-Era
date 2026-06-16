import { Module, forwardRef } from '@nestjs/common';
import { MarketModule } from '../market/market.module';
import { FinanceExecutionService } from './finance-execution.service';

@Module({
  imports: [forwardRef(() => MarketModule)],
  providers: [FinanceExecutionService],
  exports: [FinanceExecutionService],
})
export class FinanceExecutionModule {}
