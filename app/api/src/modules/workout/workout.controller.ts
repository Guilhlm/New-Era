import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { WorkoutService } from './workout.service';

@Controller('workout')
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @Post()
  create(@Body() data: Record<string, unknown>) {
    return this.workoutService.create(data);
  }

  @Get()
  findAll() {
    return this.workoutService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workoutService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return this.workoutService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.workoutService.remove(id);
  }
}
