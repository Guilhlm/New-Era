import { IsNumber, IsOptional, Matches, Max, Min } from 'class-validator';

export class UpsertWaterLogDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'date must be in YYYY-MM-DD format',
  })
  date!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  waterTotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  waterIntake?: number;
}
