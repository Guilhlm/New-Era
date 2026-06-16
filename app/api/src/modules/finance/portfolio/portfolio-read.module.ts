import { Module, forwardRef } from '@nestjs/common';
import { MarketModule } from '../market/market.module';
import { PortfolioReadService } from './portfolio-read.service';

@Module({
  imports: [forwardRef(() => MarketModule)],
  providers: [PortfolioReadService],
  exports: [PortfolioReadService],
})
export class PortfolioReadModule {}
