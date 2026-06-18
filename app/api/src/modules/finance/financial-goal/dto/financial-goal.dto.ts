import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class FinancialGoalQueryDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  sort?: 'progress' | 'name' | 'deadline' | 'target';
}

export class CreateFinancialGoalDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsNumber()
  @Min(0.01)
  @Max(1_000_000_000)
  targetAmount!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  currentAmount?: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}

export class UpdateFinancialGoalDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(1_000_000_000)
  targetAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  currentAmount?: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}

export class UpdateFinancialGoalProgressDto {
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  amount!: number;

  @IsOptional()
  @IsEnum(['set', 'add'])
  mode?: 'set' | 'add';

  @IsOptional()
  @IsString()
  @MaxLength(120)
  label?: string;
}
