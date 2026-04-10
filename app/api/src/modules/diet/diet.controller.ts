import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { DietService } from './diet.service';

@Controller('diet')
export class DietController {
  constructor(private readonly dietService: DietService) {}

  @Post()
  create(@Body() data: Record<string, unknown>) {
    return this.dietService.create(data);
  }

  @Get()
  findAll() {
    return this.dietService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dietService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return this.dietService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dietService.remove(id);
  }
}
