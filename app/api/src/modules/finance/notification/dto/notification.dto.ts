import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  NotificationCategory,
  NotificationKind,
  NotificationPeriod,
  NotificationPriority,
} from '@prisma/client';

export class NotificationQueryDto {
  @IsOptional()
  @IsEnum(NotificationPeriod)
  period?: NotificationPeriod;

  @IsOptional()
  @IsEnum(NotificationKind)
  kind?: NotificationKind;

  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  unreadOnly?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}

export class UpdateNotificationReadDto {
  @IsOptional()
  @IsBoolean()
  read?: boolean;
}

export class GenerateNotificationsDto {
  @IsOptional()
  @IsBoolean()
  includeDaily?: boolean;

  @IsOptional()
  @IsBoolean()
  includeWeekly?: boolean;

  @IsOptional()
  @IsBoolean()
  includeMonthly?: boolean;

  @IsOptional()
  @IsString()
  @Max(20)
  reason?: string;
}

export type NotificationVm = {
  id: string;
  category: Lowercase<`${NotificationCategory}`>;
  kind: Lowercase<`${NotificationKind}`>;
  priority: Lowercase<`${NotificationPriority}`>;
  title: string;
  body: string;
  read: boolean;
  href?: string | null;
  ctaLabel?: string | null;
  createdAt: string;
  period: Lowercase<`${NotificationPeriod}`>;
};
