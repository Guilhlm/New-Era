import { IsNumber, IsOptional } from 'class-validator';

export class FitnessMacroGoalDto {
  @IsOptional()
  @IsNumber()
  weightGoal?: number;

  @IsOptional()
  @IsNumber()
  calories?: number;
}

export type FitnessMacroGoalUpdateDto = FitnessMacroGoalDto;
