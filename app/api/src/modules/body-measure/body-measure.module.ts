import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { BodyMeasureController } from './body-measure.controller';
import { BodyMeasureService } from './body-measure.service';

@Module({
  imports: [AuthModule],
  controllers: [BodyMeasureController],
  providers: [BodyMeasureService],
})
export class BodyMeasureModule {}
