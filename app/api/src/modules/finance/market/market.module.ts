import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { FinanceExecutionModule } from '../execution/finance-execution.module';
import { MarketController } from './market.controller';
import { MarketProviders } from './market.providers';
import { MarketService } from './market.service';

@Module({
  imports: [AuthModule, forwardRef(() => FinanceExecutionModule)],
  controllers: [MarketController],
  providers: [MarketService, MarketProviders],
  exports: [MarketService, MarketProviders],
})
export class MarketModule {}
