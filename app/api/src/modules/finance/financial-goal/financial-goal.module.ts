import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { FinancialGoalController } from './financial-goal.controller';
import { FinancialGoalService } from './financial-goal.service';

@Module({
  imports: [AuthModule],
  controllers: [FinancialGoalController],
  providers: [FinancialGoalService],
  exports: [FinancialGoalService],
})
export class FinancialGoalModule {}
