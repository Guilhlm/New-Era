import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class FitnessMacroGoalDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1000)
  weightGoal?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(20000)
  calories?: number | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  fats?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  protein?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  carbodrate?: number;
}

export type FitnessMacroGoalUpdateDto = FitnessMacroGoalDto;
