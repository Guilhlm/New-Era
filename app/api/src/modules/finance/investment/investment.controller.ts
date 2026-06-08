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
import type { AuthenticatedRequest } from '../../../common/auth/auth.types';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { InvestmentService } from './investment.service';

@Controller('finance/investments')
@UseGuards(JwtAuthGuard)
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() data: Record<string, unknown>) {
    return this.investmentService.create(req.user.userId, data);
  }

  @Get()
  findAll(@Req() req: AuthenticatedRequest) {
    return this.investmentService.findByUser(req.user.userId);
  }

  @Get(':id')
  findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.investmentService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() data: Record<string, unknown>,
  ) {
    return this.investmentService.update(id, req.user.userId, data);
  }

  @Delete(':id')
  remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.investmentService.remove(id, req.user.userId);
  }
}
