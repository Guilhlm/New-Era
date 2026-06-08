import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DietController } from './diet.controller';
import { DietService } from './diet.service';

@Module({
  imports: [AuthModule],
  controllers: [DietController],
  providers: [DietService],
})
export class DietModule {}
