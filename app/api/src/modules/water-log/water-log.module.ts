import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { WaterLogController } from './water-log.controller';
import { WaterLogService } from './water-log.service';

@Module({
  imports: [AuthModule],
  controllers: [WaterLogController],
  providers: [WaterLogService],
})
export class WaterLogModule {}
