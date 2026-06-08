import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedRequest } from '../../common/auth/auth.types';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { BodyMeasureDto } from './dto/body-measure.dto';
import { BodyMeasureService } from './body-measure.service';

@Controller('body-measure')
@UseGuards(JwtAuthGuard)
export class BodyMeasureController {
  constructor(private readonly bodyMeasureService: BodyMeasureService) {}

  @Post('measures')
  createMeasure(@Req() req: AuthenticatedRequest, @Body() data: BodyMeasureDto) {
    return this.bodyMeasureService.createMeasure(req.user.userId, data);
  }

  @Get('measures')
  findMeasures(@Req() req: AuthenticatedRequest) {
    return this.bodyMeasureService.findMeasuresByUser(req.user.userId);
  }

  @Get('measures/:id')
  findOneMeasure(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.bodyMeasureService.findOneMeasure(id, req.user.userId);
  }

  @Patch('measures/:id')
  updateMeasure(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: BodyMeasureDto,
  ) {
    return this.bodyMeasureService.updateMeasure(id, req.user.userId, data);
  }

  @Delete('measures/:id')
  removeMeasure(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.bodyMeasureService.removeMeasure(id, req.user.userId);
  }

  @Post('vitals')
  createVital(@Req() req: AuthenticatedRequest, @Body() data: BodyMeasureDto) {
    return this.bodyMeasureService.createVital(req.user.userId, data);
  }

  @Get('vitals')
  findVitals(@Req() req: AuthenticatedRequest) {
    return this.bodyMeasureService.findVitalsByUser(req.user.userId);
  }

  @Get('vitals/:id')
  findOneVital(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.bodyMeasureService.findOneVital(id, req.user.userId);
  }

  @Patch('vitals/:id')
  updateVital(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: BodyMeasureDto,
  ) {
    return this.bodyMeasureService.updateVital(id, req.user.userId, data);
  }

  @Delete('vitals/:id')
  removeVital(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.bodyMeasureService.removeVital(id, req.user.userId);
  }
}
