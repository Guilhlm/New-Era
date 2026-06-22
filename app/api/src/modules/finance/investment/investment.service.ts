import { Injectable } from '@nestjs/common';
import {
  assertResourceExists,
  assertResourceOwner,
} from '../../../common/auth/ownership.util';
import { PrismaService } from '../../../prisma/prisma.service';
import { syncUserFinanceState } from '../common/finance-balance.util';
import { realignOpeningSnapshotAfterPositionRemoval } from '../common/finance-snapshot.util';
import { FinanceExecutionService } from '../execution/finance-execution.service';
import { PortfolioReadService } from '../portfolio/portfolio-read.service';
import { FINANCE_TX_CATEGORY } from './dto/investment.dto';
import type {
  DepositFundsDto,
  FinanceTab,
  RegisterPositionDto,
  UpdateInvestmentDto,
  WithdrawFundsDto,
} from './dto/investment.dto';
import { investmentTypesForTab } from './dto/investment.dto';

@Injectable()
export class InvestmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly execution: FinanceExecutionService,
    private readonly portfolioRead: PortfolioReadService,
  ) {}

  registerPosition(userId: string, data: RegisterPositionDto) {
    return this.execution.registerPosition(userId, data);
  }

  findByUser(userId: string, tab?: FinanceTab) {
    const types = investmentTypesForTab(tab);
    return this.prisma.investment.findMany({
      where: {
        userId,
        ...(types ? { type: { in: types } } : {}),
      },
      orderBy: { currentValue: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const investment = await this.prisma.investment.findUnique({
      where: { id },
    });
    const existing = assertResourceExists(investment, 'Investment');
    assertResourceOwner(existing.userId, userId, 'Investment');
    return existing;
  }

  async update(id: string, userId: string, data: UpdateInvestmentDto) {
    await this.findOne(id, userId);

    const investment = await this.prisma.investment.update({
      where: { id },
      data: {
        ...(data.ticker !== undefined ? { ticker: data.ticker.toUpperCase() } : {}),
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.notes !== undefined ? { notes: data.notes } : {}),
      },
    });

    await syncUserFinanceState(this.prisma, userId);
    return investment;
  }

  async remove(id: string, userId: string) {
    const existing = await this.findOne(id, userId);
    const ticker = existing.ticker.toUpperCase();
    const equityBefore = await this.portfolioRead.equityUsdt(userId);

    await this.prisma.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: {
          userId,
          category: FINANCE_TX_CATEGORY.POSITION_REGISTER,
          description: { startsWith: `Register ${ticker} •` },
        },
      });
      await tx.investment.delete({ where: { id } });
    });

    const equityAfter = await this.portfolioRead.equityUsdt(userId);
    await realignOpeningSnapshotAfterPositionRemoval(
      this.prisma,
      userId,
      equityAfter,
      {
        totalBalance: equityBefore.totalBalance - equityAfter.totalBalance,
        investedTotal: equityBefore.investedTotal - equityAfter.investedTotal,
      },
    );
    await syncUserFinanceState(this.prisma, userId);
    return { ok: true };
  }

  depositFunds(userId: string, data: DepositFundsDto) {
    return this.execution.deposit(userId, data);
  }

  withdrawFunds(userId: string, data: WithdrawFundsDto) {
    return this.execution.withdraw(userId, data);
  }
}
