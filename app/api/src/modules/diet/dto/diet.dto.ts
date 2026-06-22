import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDietMealDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsInt()
  @Min(0)
  @Max(6)
  weekday!: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  mealTime?: string | null;
}

export class UpdateDietMealDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  mealTime?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateDietFoodItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @IsNumber()
  @Min(0)
  @Max(100000)
  totalGrams!: number;

  @IsIn(['taco', 'manual'])
  externalSource!: 'taco' | 'manual';

  @IsOptional()
  @IsString()
  @MaxLength(64)
  externalFoodId?: string | null;

  @IsNumber()
  @Min(0)
  caloriesPer100g!: number;

  @IsNumber()
  @Min(0)
  proteinPer100g!: number;

  @IsNumber()
  @Min(0)
  carbsPer100g!: number;

  @IsNumber()
  @Min(0)
  fatsPer100g!: number;
}

export class UpdateDietFoodItemDto {
  @IsNumber()
  @Min(0)
  @Max(100000)
  totalGrams!: number;
}

export class CopyDietDayDto {
  @IsInt()
  @Min(0)
  @Max(6)
  sourceWeekday!: number;

  @IsInt()
  @Min(0)
  @Max(6)
  targetWeekday!: number;
}

export type CreateDietMealInput = CreateDietMealDto & { userId: string };
