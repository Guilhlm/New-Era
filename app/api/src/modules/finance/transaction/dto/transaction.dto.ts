import { TransactionType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTransactionDto {
  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  category?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  fromWalletId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(64)
  toWalletId?: string | null;

  @IsDateString()
  date!: string;
}
