import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FitnessMacroGoalController } from './fitness-macro-goal.controller';
import { FitnessMacroGoalService } from './fitness-macro-goal.service';

@Module({
  imports: [AuthModule],
  controllers: [FitnessMacroGoalController],
  providers: [FitnessMacroGoalService],
})
export class FitnessMacroGoalModule {}
