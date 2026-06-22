import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './common/config/env.validation';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { DietModule } from './modules/diet/diet.module';
import { WorkoutModule } from './modules/workout/workout.module';
import { BodyMeasureModule } from './modules/body-measure/body-measure.module';
import { WalletModule } from './modules/finance/wallet/wallet.module';
import { TransactionModule } from './modules/finance/transaction/transaction.module';
import { InvestmentModule } from './modules/finance/investment/investment.module';
import { FinanceSummaryModule } from './modules/finance/summary/finance-summary.module';
import { MarketModule } from './modules/finance/market/market.module';
import { AuthModule } from './modules/auth/auth.module';
import { FitnessMacroGoalModule } from './modules/fitness-macro-goal/fitness-macro-goal.module';
import { WaterLogModule } from './modules/water-log/water-log.module';
import { TaskModule } from './modules/task/task.module';
import { MonthlyExpenseModule } from './modules/finance/monthly-expense/monthly-expense.module';
import { FinancialGoalModule } from './modules/finance/financial-goal/financial-goal.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 300,
      },
    ]),
    PrismaModule,
    UserModule,
    DietModule,
    WorkoutModule,
    BodyMeasureModule,
    FitnessMacroGoalModule,
    WaterLogModule,
    TaskModule,
    WalletModule,
    TransactionModule,
    InvestmentModule,
    MonthlyExpenseModule,
    FinancialGoalModule,
    NotificationModule,
    FinanceSummaryModule,
    MarketModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
