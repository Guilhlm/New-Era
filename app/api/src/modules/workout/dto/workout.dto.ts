import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateWorkoutDayPlanDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateWorkoutMuscleGroupDto {
  @IsInt()
  @Min(0)
  @Max(6)
  weekday!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name!: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  timeMinutes?: number | null;
}

export class UpdateWorkoutMuscleGroupDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1440)
  timeMinutes?: number | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateWorkoutExerciseDto {
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  equipment?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2000)
  weightKg?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  series?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  repsMin?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  repsMax?: number | null;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;
}

export class UpdateWorkoutExerciseDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  equipment?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2000)
  weightKg?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  series?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  repsMin?: number | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000)
  repsMax?: number | null;

  @IsOptional()
  @IsString()
  imageUrl?: string | null;

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class ReorderWorkoutExercisesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  exerciseIds!: string[];
}

export class CopyWorkoutDayDto {
  @IsInt()
  @Min(0)
  @Max(6)
  sourceWeekday!: number;

  @IsInt()
  @Min(0)
  @Max(6)
  targetWeekday!: number;
}
