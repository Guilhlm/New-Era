import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { DietModule } from './modules/diet/diet.module';
import { WorkoutModule } from './modules/workout/workout.module';
import { BodyMeasureModule } from './modules/body-measure/body-measure.module';
import { WalletModule } from './modules/finance/wallet/wallet.module';
import { TransactionModule } from './modules/finance/transaction/transaction.module';
import { InvestmentModule } from './modules/finance/investment/investment.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    DietModule,
    WorkoutModule,
    BodyMeasureModule,
    WalletModule,
    TransactionModule,
    InvestmentModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
