import {
  IsDateString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '../../../common/auth/password.util';

/**
 * Explicit whitelist of profile fields a user may change about themselves.
 * Privileged columns (isAdmin, totalBalance, disciplineLevel, passwordHash)
 * are intentionally absent and rejected by the global ValidationPipe.
 */
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string | null;

  @IsOptional()
  @IsDateString()
  birthDate?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyIncome?: number | null;

  @IsOptional()
  @IsString()
  @MinLength(MIN_PASSWORD_LENGTH)
  @MaxLength(MAX_PASSWORD_LENGTH)
  password?: string;

  @IsOptional()
  @IsString()
  photoUser?: string;
}
