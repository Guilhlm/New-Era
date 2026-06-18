import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { MonthlyExpenseController } from './monthly-expense.controller';
import { MonthlyExpenseService } from './monthly-expense.service';

@Module({
  imports: [AuthModule],
  controllers: [MonthlyExpenseController],
  providers: [MonthlyExpenseService],
  exports: [MonthlyExpenseService],
})
export class MonthlyExpenseModule {}
