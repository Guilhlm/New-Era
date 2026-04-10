import { Module } from '@nestjs/common';
import { BodyMeasureController } from './body-measure.controller';
import { BodyMeasureService } from './body-measure.service';

@Module({
  controllers: [BodyMeasureController],
  providers: [BodyMeasureService],
})
export class BodyMeasureModule {}
