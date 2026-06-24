'use client';

import {
  DashboardSidebarColumn,
  DashboardTwoColumnLayout,
  dashboardGridArea,
} from '@/components/ui/dashboard-two-column-layout';
import { MonthlyExpensesCategoriesCard } from '@/components/monthly-expenses/monthly-expenses-categories-card';
import { MonthlyExpensesCreditCards } from '@/components/monthly-expenses/monthly-expenses-credit-cards';
import { MONTHLY_EXPENSES_COPY as copy } from '@/components/monthly-expenses/monthly-expenses-copy';
import { MonthlyExpensesTransactionsCard } from '@/components/monthly-expenses/monthly-expenses-transactions-card';
import { PlanHeaderCard } from '@/components/ui/plan-header-card';
import { PeriodNavigator } from '@/components/ui/period-navigator';
import { StatProgressCard } from '@/components/ui/stat-progress-card';
import { useMonthlyExpensesDashboardState } from '@/hooks/use-monthly-expenses-dashboard-state';
import { formatBrlAmount } from '@/utils/wallet';

export function MonthlyExpensesDashboard() {
  const state = useMonthlyExpensesDashboardState();
  const totals = state.data.totals;
  const monthlySpending = -totals.spent;
  const budgetUsage = Math.max(0, totals.spent);
  const spentPercent =
    totals.budget > 0 ? Math.round((budgetUsage / totals.budget) * 100) : 0;
  const budgetRemainingPercent =
    totals.budget > 0
      ? Math.round(((totals.budget - budgetUsage) / totals.budget) * 100)
      : 0;
  const remainingPercent =
    totals.income > 0 ? Math.round((Math.max(0, totals.remaining) / totals.income) * 100) : 0;
  const cardsSaving = state.ui.isPending('card') || state.ui.isPending('invoice');
  const transactionsSaving = state.ui.isPending('expense');
  const categoriesSaving = state.ui.isPending('category');

  return (
    <DashboardTwoColumnLayout>
      <PlanHeaderCard
        title={copy.pageTitle}
        className="h-full min-h-0"
        style={dashboardGridArea('main', 'header')}
        rightSlot={
          <PeriodNavigator
            periodLabel={state.data.monthLabel}
            periodShortLabel={state.data.monthShortLabel}
            onPrev={state.actions.prevMonth}
            onNext={state.actions.nextMonth}
            ariaLabel="Select month"
            prevAriaLabel="Previous month"
            nextAriaLabel="Next month"
          />
        }
        statsSlot={
          <>
            <StatProgressCard
              className="min-w-0"
              data={{
                label: copy.monthlySpending,
                valueLabel: formatBrlAmount(monthlySpending, { signed: true }),
                percent: spentPercent,
                barClassName: monthlySpending >= 0 ? 'bg-green' : 'bg-red',
                valueClassName: monthlySpending >= 0 ? 'text-green' : 'text-red',
                footerRight: `${copy.goalsAndFixed}: ${formatBrlAmount(totals.fixedCommitments)}`,
              }}
            />
            <StatProgressCard
              className="min-w-0"
              data={{
                label: copy.budget,
                valueLabel: formatBrlAmount(totals.budget),
                percent: budgetRemainingPercent,
                barClassName: budgetRemainingPercent > 25 ? 'bg-green' : 'bg-red',
                footerRight: copy.salaryAndCards(
                  formatBrlAmount(totals.income),
                  formatBrlAmount(totals.cardLimit),
                ),
              }}
            />
            <StatProgressCard
              className="min-w-0"
              data={{
                label: copy.remainingBalance,
                valueLabel: formatBrlAmount(totals.remaining),
                percent: remainingPercent,
                barClassName: totals.remaining >= 0 ? 'bg-green' : 'bg-red',
                valueClassName: totals.remaining >= 0 ? 'text-green' : 'text-red',
                footerRight:
                  totals.remaining >= 0 ? copy.availableFromSalary : copy.aboveSalary,
              }}
            />
          </>
        }
      />

      <div
        className="grid h-full min-h-0 grid-rows-[19rem_minmax(0,1fr)] gap-2.5 overflow-hidden"
        style={dashboardGridArea('main', 'body')}
      >
        <MonthlyExpensesCreditCards
          cards={state.data.cards}
          saving={cardsSaving}
          onCreateCard={(values) =>
            state.actions.createCard({
              holderName: values.holder,
              lastFour: values.lastFour,
              limitTotal: values.limit,
              limitUsage: values.used,
              dueDay: values.dueDay,
              brand: values.brand,
              color: values.color,
              type: 'CREDIT',
            })
          }
          onUpdateCard={(id, values) =>
            state.actions.updateCard(id, {
              holderName: values.holder,
              lastFour: values.lastFour,
              limitTotal: values.limit,
              limitUsage: values.used,
              dueDay: values.dueDay,
              brand: values.brand,
              color: values.color,
              type: 'CREDIT',
            })
          }
          onDeleteCard={state.actions.deleteCard}
          onPayInvoice={state.actions.payCardInvoice}
          salaryRemaining={state.data.salaryRemainingForPayment}
        />
        <MonthlyExpensesTransactionsCard
          expenses={state.data.expenses}
          categories={state.data.categories.map((item) => ({ id: item.id, label: item.label }))}
          cards={state.data.cards.map((item) => ({
            id: item.id,
            label: `${item.brand === 'mastercard' ? 'Mastercard' : 'Visa'} •••• ${item.lastFour}`,
          }))}
          onCreateExpense={state.actions.createExpense}
          onUpdateExpense={state.actions.updateExpense}
          onDeleteExpense={state.actions.deleteExpense}
          saving={transactionsSaving}
          vsLastMonth={totals.vsLastMonth}
          className="h-full min-h-0"
        />
      </div>

      <DashboardSidebarColumn>
        <MonthlyExpensesCategoriesCard
          categories={state.data.categories}
          onCreate={state.actions.createCategory}
          onUpdate={(id, values) =>
            state.actions.updateCategory(id, {
              name: values.name,
              budget: values.budget,
              spentAdjustment: values.spentAdjustment,
            })
          }
          onDelete={state.actions.deleteCategory}
          saving={categoriesSaving}
          className="h-full min-h-0"
        />
      </DashboardSidebarColumn>
    </DashboardTwoColumnLayout>
  );
}
