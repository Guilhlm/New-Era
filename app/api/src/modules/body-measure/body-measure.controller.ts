import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { BodyMeasureService } from './body-measure.service';

@Controller('body-measure')
export class BodyMeasureController {
  constructor(private readonly bodyMeasureService: BodyMeasureService) {}

  @Post('measures')
  createMeasure(@Body() data: Record<string, unknown>) {
    return this.bodyMeasureService.createMeasure(data);
  }

  @Get('measures')
  findAllMeasures() {
    return this.bodyMeasureService.findAllMeasures();
  }

  @Get('measures/:id')
  findOneMeasure(@Param('id') id: string) {
    return this.bodyMeasureService.findOneMeasure(id);
  }

  @Patch('measures/:id')
  updateMeasure(
    @Param('id') id: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.bodyMeasureService.updateMeasure(id, data);
  }

  @Delete('measures/:id')
  removeMeasure(@Param('id') id: string) {
    return this.bodyMeasureService.removeMeasure(id);
  }

  @Post('vitals')
  createVital(@Body() data: Record<string, unknown>) {
    return this.bodyMeasureService.createVital(data);
  }

  @Get('vitals')
  findAllVitals() {
    return this.bodyMeasureService.findAllVitals();
  }

  @Get('vitals/:id')
  findOneVital(@Param('id') id: string) {
    return this.bodyMeasureService.findOneVital(id);
  }

  @Patch('vitals/:id')
  updateVital(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return this.bodyMeasureService.updateVital(id, data);
  }

  @Delete('vitals/:id')
  removeVital(@Param('id') id: string) {
    return this.bodyMeasureService.removeVital(id);
  }
}
