import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class CreateBodyMeasureDto {
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(300) height?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(1000) weight?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(500) calfRight?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(500) calfLeft?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(500) quadRight?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(500) quadLeft?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(500) waist?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(500) abdomen?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(500) back?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(500) chest?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(500) shoulderCircumference?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(500) neckCircumference?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(500) bicepsRight?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(500) bicepsLeft?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(500) forearmRight?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(500) forearmLeft?: number;
  @IsOptional() @IsDateString() recordedAt?: string;
}

export class CreateBodyVitalDto {
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) bodyFat?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) bodyWater?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(1000) leanMass?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(1000) boneMass?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(400) restingHeartRate?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(400) maxHeartRate?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(0) @Max(20000) basalMetabolicRate?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(100) hydrationLevel?: number;
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(24) sleepHours?: number;
  @IsOptional() @IsDateString() recordedAt?: string;
}
