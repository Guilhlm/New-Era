import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class FitnessMacroGoalDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  weightGoal?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20000)
  calories?: number;

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
