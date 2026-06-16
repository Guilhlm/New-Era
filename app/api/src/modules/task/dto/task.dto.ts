import { TaskSourceType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

const TIME_PATTERN = /^\d{1,2}:\d{2}$/;

export class CreateTaskDto {
  @IsInt()
  @Min(0)
  @Max(6)
  weekday!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @Matches(TIME_PATTERN, { message: 'scheduledAt must be in HH:mm format' })
  scheduledAt!: string;

  @IsOptional()
  @IsEnum(TaskSourceType)
  sourceType?: TaskSourceType;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  sourceId?: string | null;
}

export class CreateTaskBulkItemDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title!: string;

  @Matches(TIME_PATTERN, { message: 'scheduledAt must be in HH:mm format' })
  scheduledAt!: string;

  @IsEnum(TaskSourceType)
  sourceType!: TaskSourceType;

  @IsString()
  @MaxLength(64)
  sourceId!: string;
}

export class CreateTasksBulkDto {
  @IsInt()
  @Min(0)
  @Max(6)
  weekday!: number;

  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreateTaskBulkItemDto)
  tasks!: CreateTaskBulkItemDto[];
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'scheduledAt must be in HH:mm format' })
  scheduledAt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export type CreateTaskInput = CreateTaskDto & { userId: string };
export type CreateTasksBulkInput = CreateTasksBulkDto & { userId: string };
