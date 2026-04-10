import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { InvestmentService } from './investment.service';

@Controller('finance/investment')
export class InvestmentController {
  constructor(private readonly investmentService: InvestmentService) {}

  @Post()
  create(@Body() data: Record<string, unknown>) {
    return this.investmentService.create(data);
  }

  @Get()
  findAll() {
    return this.investmentService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.investmentService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return this.investmentService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.investmentService.remove(id);
  }
}
