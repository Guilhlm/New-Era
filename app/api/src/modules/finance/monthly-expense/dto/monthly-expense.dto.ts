import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CardType } from '@prisma/client';

export class MonthlyExpensesQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(7)
  month?: string;
}

export class CreateMonthlyExpenseDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title!: string;

  @IsNumber()
  @Min(0.01)
  @Max(1_000_000_000)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  account?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(['paid', 'pending'])
  status?: 'paid' | 'pending';
}

export class UpdateMonthlyExpenseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0.01)
  @Max(1_000_000_000)
  amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  categoryId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  account?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsEnum(['paid', 'pending'])
  status?: 'paid' | 'pending';
}

export class CreateMonthlyExpenseCategoryDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  budget?: number;
}

export class UpdateMonthlyExpenseCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  budget?: number;

  @IsOptional()
  @IsNumber()
  @Min(-1_000_000_000)
  @Max(1_000_000_000)
  spentAdjustment?: number;
}

export class CreateCardDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  holderName!: string;

  @IsString()
  @MinLength(4)
  @MaxLength(4)
  lastFour!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  limitTotal!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  limitUsage?: number;

  @IsOptional()
  @IsEnum(CardType)
  type?: CardType;
}

export class UpdateCardDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  holderName?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  @MaxLength(4)
  lastFour?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  brand?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  limitTotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  limitUsage?: number;

  @IsOptional()
  @IsEnum(CardType)
  type?: CardType;
}

export class MonthlyExpensesCategorySummaryQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(7)
  month?: string;
}

export class MonthlyExpensesSummaryQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(7)
  month?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}
