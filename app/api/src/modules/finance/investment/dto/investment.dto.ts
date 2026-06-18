import {
  InvestmentLastAction,
  InvestmentType,
  TransactionType,
} from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateInvestmentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(12)
  ticker!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @IsEnum(InvestmentType)
  type!: InvestmentType;

  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  shares!: number;

  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  avgPrice!: number;

  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  currentPrice!: number;

  @IsOptional()
  @IsEnum(InvestmentLastAction)
  lastAction?: InvestmentLastAction;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string | null;
}

export class UpdateInvestmentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(12)
  ticker?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsEnum(InvestmentType)
  type?: InvestmentType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  shares?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  avgPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  currentPrice?: number;

  @IsOptional()
  @IsEnum(InvestmentLastAction)
  lastAction?: InvestmentLastAction;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string | null;
}

export class TradeInvestmentDto {
  @IsEnum(InvestmentLastAction)
  action!: InvestmentLastAction;

  @IsNumber()
  @Min(0.000001)
  @Max(1_000_000_000)
  shares!: number;

  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  price!: number;
}

export class DepositFundsDto {
  @IsNumber()
  @Min(0.01)
  @Max(1_000_000_000)
  amount!: number;

  @IsOptional()
  @IsEnum(['USDT', 'BRL'])
  currency?: 'USDT' | 'BRL';

  @IsOptional()
  @IsString()
  @MaxLength(64)
  walletId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string | null;

  @IsOptional()
  @IsEnum(['CARD', 'CASH', 'MONTHLY_SALARY', 'EXTRA_INCOME'])
  source?: 'CARD' | 'CASH' | 'MONTHLY_SALARY' | 'EXTRA_INCOME';

  @IsOptional()
  @IsString()
  @MaxLength(64)
  cardId?: string | null;
}

export class WithdrawFundsDto extends DepositFundsDto {}

export class RegisterPositionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(12)
  ticker!: string;

  @IsNumber()
  @Min(0.000001)
  @Max(1_000_000_000)
  shares!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  costTotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1_000_000_000)
  avgPrice?: number;

  @IsOptional()
  @IsEnum(['USDT', 'BRL'])
  costCurrency?: 'USDT' | 'BRL';

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsEnum(InvestmentType)
  type?: InvestmentType;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string | null;
}

export const FINANCE_TX_CATEGORY = {
  DEPOSIT: 'DEPOSIT',
  DEPOSIT_CARD: 'DEPOSIT_CARD',
  DEPOSIT_CASH: 'DEPOSIT_CASH',
  DEPOSIT_SALARY: 'DEPOSIT_SALARY',
  DEPOSIT_EXTRA_INCOME: 'DEPOSIT_EXTRA_INCOME',
  WITHDRAW: 'WITHDRAW',
  FINANCIAL_GOAL_CONTRIBUTION: 'FINANCIAL_GOAL_CONTRIBUTION',
  INVESTMENT_BUY: 'INVESTMENT_BUY',
  INVESTMENT_SELL: 'INVESTMENT_SELL',
  POSITION_REGISTER: 'POSITION_REGISTER',
  DIVIDEND: 'DIVIDEND',
} as const;

export type FinanceTab = 'stocks' | 'crypto' | 'etfs' | 'mine';

export function investmentTypesForTab(tab?: FinanceTab): InvestmentType[] | undefined {
  if (!tab) return undefined;
  switch (tab) {
    case 'stocks':
      return [InvestmentType.STOCK];
    case 'crypto':
      return [InvestmentType.CRYPTO];
    case 'etfs':
      return [InvestmentType.ETF];
    case 'mine':
      return undefined;
    default:
      return undefined;
  }
}

export function signedTransactionAmount(type: TransactionType, amount: number): number {
  if (type === TransactionType.INCOME) return amount;
  if (type === TransactionType.EXPENSE) return -amount;
  return amount;
}
